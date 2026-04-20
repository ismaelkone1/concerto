import axios from "axios";
import simpleGit, { SimpleGit } from "simple-git";

export class GitManager {
  private git: SimpleGit;
  private remote: string;
  private defaultBranch: string;
  private githubToken?: string;
  private githubRepo?: string;
  private githubWorkflow: string;

  constructor() {
    const repoPath = process.env.MONOREPO_PATH || "/monorepo";
    this.git = simpleGit(repoPath);
    this.remote = process.env.GIT_REMOTE ?? "origin";
    this.defaultBranch = process.env.GIT_DEFAULT_BRANCH ?? "main";
    this.githubToken = process.env.GITHUB_TOKEN;
    this.githubRepo = process.env.GITHUB_REPO;
    this.githubWorkflow = process.env.GITHUB_WORKFLOW ?? "ci.yml";
  }

  async createFeatureBranch(sprintId: string): Promise<string> {
    // Force git config to ignore directory ownership before ANY operations
    try {
      require('child_process').execSync('git config --global --add safe.directory "*"');
    } catch(e) {}
    
    const branchName = `feature/${sprintId.toLowerCase().replace(/\s+/g, "-")}`;
    
    // Check if branch already exists
    const branches = await this.git.branchLocal();
    if (branches.all.includes(branchName)) {
      console.log(`[gitManager] Branch ${branchName} already exists, checking it out...`);
      await this.git.checkout(branchName);
    } else {
      console.log(`[gitManager] Creating new branch ${branchName}...`);
      await this.git.checkoutLocalBranch(branchName);
    }
    
    return branchName;
  }

  async commitChanges(message: string): Promise<void> {
    // Set Git authorship for MiMo container to fix "Author identity unknown"
    await this.git.addConfig("user.name", "ismaelkone1");
    await this.git.addConfig("user.email", "kismael9901@gmail.com");
    
    await this.git.add(["."]);
    await this.git.commit(message);
  }

  async pushBranch(branchName: string): Promise<void> {
    let pushTarget = this.remote;
    if (this.githubToken && this.githubRepo && this.githubRepo.startsWith("https://")) {
      pushTarget = this.githubRepo.replace("https://", `https://${this.githubToken}@`);
      console.log(`[gitManager] Pushing via secure bot HTTPS URL...`);
    } else {
      console.log(`[gitManager] Pushing to remote ${this.remote}...`);
    }
    
    // Set upstream to keep local branch in sync with remote
    await this.git.push(pushTarget, branchName, ['--set-upstream']);
  }

  async triggerGithubWorkflow(branchName: string): Promise<void> {
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
      await axios.post(url, body, {
        headers: {
          Authorization: `Bearer ${this.githubToken}`,
          Accept: "application/vnd.github+json"
        }
      });
      console.log(`[gitManager] Successfully triggered GitHub workflow ${this.githubWorkflow} for branch ${branchName}`);
    } catch (error) {
      console.warn(`[gitManager] Warning: Failed to trigger GitHub workflow. The workflow ${this.githubWorkflow} might not exist on the upstream branch. Skipping...`);
    }
  }

  async mergeToDefault(branchName: string): Promise<void> {
    await this.git.checkout(this.defaultBranch);
    await this.git.mergeFromTo(branchName, this.defaultBranch);
    await this.git.push(this.remote, this.defaultBranch);
  }
}
