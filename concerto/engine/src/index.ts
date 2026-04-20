import * as path from "path";
import dotenv from "dotenv";
import { Conductor } from "./conductor";

const projectRoot = path.resolve(__dirname, "../../");
dotenv.config({ path: path.join(projectRoot, "engine/.env") });

async function boot() {
  const args = process.argv.slice(2);
  const params: { [key: string]: any } = {};
  
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : true;
      params[key] = value;
    }
  }

  const projectId = params["project"];
  if (!projectId) {
    console.error("[Concerto] Error: No project specified. Use --project <projectId>");
    process.exit(1);
  }

  const conductor = new Conductor(projectRoot, projectId);

  if (args.includes("--review-be")) {
    await conductor.reviewBackend();
  } else if (args.includes("--review-fe")) {
    await conductor.reviewFrontend();
  } else if (args.includes("--audit-security")) {
    await conductor.auditSecurity();
  } else if (args.includes("--fix-bug")) {
    await conductor.fixBug();
  } else if (args.includes("--optimize-perf")) {
    await conductor.optimizePerformance();
  } else if (args.includes("--generate-docs")) {
    await conductor.generateDocs();
  } else if (args.includes("--status")) {
    await conductor.getProjectStatus();
  } else {
    await conductor.orchestrate();
  }
}

boot().catch((err: any) => {
  console.error("[Concerto] Fatal error:", err.message);
  process.exit(1);
});
