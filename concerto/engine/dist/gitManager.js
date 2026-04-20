"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitManager = void 0;
const axios_1 = __importDefault(require("axios"));
const path = __importStar(require("path"));
const simple_git_1 = __importDefault(require("simple-git"));
class GitManager {
    constructor() {
        const repoPath = process.env.GIT_REPO_PATH || path.resolve(__dirname, "../../");
        this.git = (0, simple_git_1.default)(repoPath);
        this.remote = process.env.GIT_REMOTE ?? "origin";
        this.defaultBranch = process.env.GIT_DEFAULT_BRANCH ?? "main";
        this.githubToken = process.env.GITHUB_TOKEN;
        this.githubRepo = process.env.GITHUB_REPO;
        this.githubWorkflow = process.env.GITHUB_WORKFLOW ?? "ci.yml";
    }
    async createFeatureBranch(sprintId) {
        // Force git config to ignore directory ownership before ANY operations
        try {
            require('child_process').execSync('git config --global --add safe.directory "*"');
        }
        catch (e) { }
        const branchName = `feature/${sprintId.toLowerCase().replace(/\s+/g, "-")}`;
        // Check if branch already exists
        const branches = await this.git.branchLocal();
        if (branches.all.includes(branchName)) {
            console.log(`[gitManager] Branch ${branchName} already exists, checking it out...`);
            await this.git.checkout(branchName);
        }
        else {
            console.log(`[gitManager] Creating new branch ${branchName}...`);
            await this.git.checkoutLocalBranch(branchName);
        }
        return branchName;
    }
    async commitChanges(message) {
        // Set Git authorship for MiMo container to fix "Author identity unknown"
        await this.git.addConfig("user.name", "ismaelkone1");
        await this.git.addConfig("user.email", "kismael9901@gmail.com");
        await this.git.add(["."]);
        await this.git.commit(message);
    }
    async pushBranch(branchName) {
        let pushTarget = this.remote;
        if (this.githubToken && this.githubRepo && this.githubRepo.startsWith("https://")) {
            pushTarget = this.githubRepo.replace("https://", `https://${this.githubToken}@`);
            console.log(`[gitManager] Pushing via secure bot HTTPS URL...`);
        }
        else {
            console.log(`[gitManager] Pushing to remote ${this.remote}...`);
        }
        // Set upstream to keep local branch in sync with remote
        await this.git.push(pushTarget, branchName, ['--set-upstream']);
    }
    async triggerGithubWorkflow(branchName) {
        if (!this.githubToken || !this.githubRepo) {
            console.log("[gitManager] GitHub workflow trigger skipped because GITHUB_TOKEN or GITHUB_REPO is not configured.");
            return;
        }
        const repoIdMatch = this.githubRepo.match(/github\.com\/([^\/]+\/[^\.]+)/);
        const repoId = repoIdMatch ? repoIdMatch[1] : this.githubRepo;
        const url = `https://api.github.com/repos/${repoId}/actions/workflows/${this.githubWorkflow}/dispatches`;
        const body = {
            ref: branchName,
            inputs: {
                branch: branchName
            }
        };
        try {
            await axios_1.default.post(url, body, {
                headers: {
                    Authorization: `Bearer ${this.githubToken}`,
                    Accept: "application/vnd.github+json"
                }
            });
            console.log(`[gitManager] Successfully triggered GitHub workflow ${this.githubWorkflow} for branch ${branchName}`);
        }
        catch (error) {
            console.warn(`[gitManager] Warning: Failed to trigger GitHub workflow. The workflow ${this.githubWorkflow} might not exist on the upstream branch. Skipping...`);
        }
    }
    async mergeToDefault(branchName) {
        await this.git.checkout(this.defaultBranch);
        await this.git.mergeFromTo(branchName, this.defaultBranch);
        await this.git.push(this.remote, this.defaultBranch);
    }
}
exports.GitManager = GitManager;
