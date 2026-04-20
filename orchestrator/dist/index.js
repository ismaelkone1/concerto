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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const mimoClient_1 = require("./mimoClient");
const sprintManager_1 = require("./sprintManager");
const promptBuilder_1 = require("./promptBuilder");
const testRunner_1 = require("./testRunner");
const gitManager_1 = require("./gitManager");
const discordNotifier_1 = require("./discordNotifier");
const langfuseTracker_1 = require("./langfuseTracker");
// Intercept console.log and console.error to write to a sync file for the dashboard
const repoRoot = process.env.MONOREPO_PATH || "/monorepo";
const logPath = path.join(repoRoot, ".orchestrator/orchestrator.log");
fs.writeFileSync(logPath, ""); // clear at start
const originalLog = console.log;
const originalError = console.error;
const stripAnsi = (str) => str.replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '');
console.log = function (...args) {
    const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(" ");
    fs.appendFileSync(logPath, stripAnsi(msg) + "\n");
    originalLog.apply(console, args);
};
console.error = function (...args) {
    const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(" ");
    fs.appendFileSync(logPath, stripAnsi(msg) + "\n");
    originalError.apply(console, args);
};
dotenv_1.default.config();
async function main() {
    console.log("[orchestrator] Starting PadelWin orchestrator...");
    const dryRun = process.argv.includes("--dry-run") || process.env.DRY_RUN === "true";
    if (dryRun) {
        console.log("[orchestrator] Running in dry-run mode: AI prompt and response only.");
    }
    const mimoClient = new mimoClient_1.MimoClient();
    const sprintManager = new sprintManager_1.SprintManager();
    const promptBuilder = new promptBuilder_1.PromptBuilder();
    const testRunner = new testRunner_1.TestRunner();
    const gitManager = new gitManager_1.GitManager();
    const discordNotifier = new discordNotifier_1.DiscordNotifier();
    const langfuseTracker = new langfuseTracker_1.LangfuseTracker();
    const activeSprint = await sprintManager.getActiveSprint();
    if (!activeSprint) {
        console.log("[orchestrator] No active sprint found. Exiting.");
        return;
    }
    console.log(`[orchestrator] Active sprint: ${activeSprint.id} - ${activeSprint.title}`);
    const sprintFile = await sprintManager.ensureSprintDetailFile(activeSprint);
    if (sprintFile.needsClarification) {
        const question = sprintFile.clarificationQuestion ?? "Clarification is required for the active sprint before proceeding.";
        await discordNotifier.sendQuestion(question);
        console.log("[orchestrator] Waiting for clarification before proceeding.");
        return;
    }
    const prompt = promptBuilder.buildPrompt(activeSprint, sprintFile.path);
    langfuseTracker.tracePrompt(activeSprint.id, prompt);
    const response = await mimoClient.generateCode(prompt);
    await langfuseTracker.traceResponse(activeSprint.id, response);
    console.log("[orchestrator] Code generation response received.");
    console.log("[orchestrator] Prompt sent to AI:\n", prompt);
    console.log("[orchestrator] AI response:\n", response);
    if (dryRun) {
        console.log("[orchestrator] Dry-run mode enabled. Skipping tests, git, and push.");
        return;
    }
    const testsPassed = await testRunner.runUnitTests();
    if (!testsPassed) {
        console.log("[orchestrator] Unit tests failed. Stopping.");
        await discordNotifier.notifyFailure("Unit tests failed after code generation.");
        return;
    }
    const integrationPassed = await testRunner.runIntegrationTests();
    if (!integrationPassed) {
        console.log("[orchestrator] Integration tests failed. Stopping.");
        await discordNotifier.notifyFailure("Integration tests failed after unit tests.");
        return;
    }
    const branchName = await gitManager.createFeatureBranch(activeSprint.id);
    const commitMessage = `feat: implement ${activeSprint.id} - ${activeSprint.title}
  
Auto-generated commit by MiMo Orchestrator.
- Completed all tasks defined in the current sprint.
- 100% PHPUnit tests passed and validated.
- Integration tests passed.
Ready for human review and further CI pipelines.`;
    await gitManager.commitChanges(commitMessage);
    await gitManager.pushBranch(branchName);
    await gitManager.triggerGithubWorkflow(branchName);
    await discordNotifier.requestPushApproval(branchName);
    // Automatically update the roadmap progression
    await sprintManager.markSprintAsCompleted(activeSprint.id);
    console.log("[orchestrator] Branch pushed and workflow triggered, waiting human approval.");
}
main().catch(async (error) => {
    console.error("[orchestrator] Fatal error:", error);
    try {
        const discordNotifier = new discordNotifier_1.DiscordNotifier();
        await discordNotifier.notifyFailure(`Fatal error during execution: ${error.message}`);
    }
    catch (discordError) {
        console.error("[orchestrator] Failed to send Discord notification:", discordError);
    }
    process.exit(1);
});
