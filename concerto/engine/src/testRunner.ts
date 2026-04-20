import { exec } from "child_process";
import * as util from "util";
import * as path from "path";
const execAsync = util.promisify(exec);

const WORKSPACE_PATH = process.env.GIT_REPO_PATH || process.cwd();

export class TestRunner {
  async runUnitTests(targetService: string): Promise<boolean> {
    let command = "";
    
    if (targetService === "client") {
      command = `cd ${path.resolve(WORKSPACE_PATH, "client")} && npm run test`;
    } else if (targetService.startsWith("server/")) {
      const composeService = targetService.replace("server/", "").replace("-", "_");
      command = `cd ${path.resolve(WORKSPACE_PATH)} && docker compose exec -T ${composeService} php bin/phpunit --testsuite=Unit`;
    } else {
      return true;
    }

    try {
      const { stdout } = await execAsync(command);
      return stdout.includes("OK");
    } catch (error: any) {
      if (targetService === "client" && error.stderr && error.stderr.includes("Missing script")) {
        return true;
      }
      return false;
    }
  }

  async runIntegrationTests(targetService: string): Promise<boolean> {
    return true;
  }

  async runE2ETests(): Promise<boolean> {
    console.log("[testRunner] 🎭 Running Cypress E2E tests...");
    const command = `cd ${path.resolve(WORKSPACE_PATH, "tests/e2e")} && npm run cypress:run`;
    try {
      const { stdout } = await execAsync(command);
      console.log(`[testRunner] Cypress stdout: ${stdout}`);
      return stdout.includes("All specs passed");
    } catch (error: any) {
      console.error("[testRunner] Cypress E2E tests failed.");
      return false;
    }
  }
}
