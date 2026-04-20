import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";
import { MimoClient } from "./mimoClient";
import { SprintManager } from "./sprintManager";
import { PromptBuilder } from "./promptBuilder";
import { TestRunner } from "./testRunner";
import { GitManager } from "./gitManager";
import { DiscordNotifier } from "./discordNotifier";
import { LangfuseTracker } from "./langfuseTracker";

// Intercept console.log and console.error to write to a sync file for the dashboard
const repoRoot = process.env.MONOREPO_PATH || "/monorepo";
const logPath = path.join(repoRoot, ".orchestrator/orchestrator.log");
fs.writeFileSync(logPath, ""); // clear at start
const originalLog = console.log;
const originalError = console.error;
const stripAnsi = (str: string) => str.replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '');

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

dotenv.config();

async function main() {
  console.log("[orchestrator] Starting Concerto orchestrator...");

  const dryRun = process.argv.includes("--dry-run") || process.env.DRY_RUN === "true";
  if (dryRun) {
    console.log("[orchestrator] Running in dry-run mode: AI prompt and response only.");
  }

  const mimoClient = new MimoClient();
  const sprintManager = new SprintManager();
  const promptBuilder = new PromptBuilder();
  const testRunner = new TestRunner();
  const gitManager = new GitManager();
  const discordNotifier = new DiscordNotifier();
  const langfuseTracker = new LangfuseTracker();

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
  const targetService = promptBuilder.getTargetService();
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

  const testsPassed = await testRunner.runUnitTests(targetService);
  if (!testsPassed) {
    console.log("[orchestrator] Unit tests failed. Stopping.");
    await discordNotifier.notifyFailure("Unit tests failed after code generation.");
    return;
  }

  const integrationPassed = await testRunner.runIntegrationTests(targetService);
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
    const discordNotifier = new DiscordNotifier();
    await discordNotifier.notifyFailure(`Fatal error during execution: ${error.message}`);
  } catch (discordError) {
    console.error("[orchestrator] Failed to send Discord notification:", discordError);
  }
  process.exit(1);
});
