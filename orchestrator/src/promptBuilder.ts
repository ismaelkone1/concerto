import * as fs from "fs";
import * as path from "path";

const repoRoot = process.env.MONOREPO_PATH || "/monorepo";

export class PromptBuilder {
  private devRules: string;

  private lastTargetService: string = "server/core-app";

  constructor() {
    const rulesPath = path.resolve(repoRoot, "ai-dev-rules/dev-rules.md");
    this.devRules = fs.existsSync(rulesPath) ? fs.readFileSync(rulesPath, "utf8") : "";
  }

  public getTargetService(): string {
    return this.lastTargetService;
  }

  buildPrompt(activeSprint: { id: string; title: string; description: string }, sprintFilePath: string): string {
    const sprintDetail = fs.existsSync(sprintFilePath)
      ? fs.readFileSync(sprintFilePath, "utf8")
      : "";

    // Intelligent guessing of the target microservice or client
    let targetService = "server/core-app"; // Fallback
    const titleLower = activeSprint.title.toLowerCase();
    
    if (titleLower.includes("client")) {
      targetService = "client";
    } else if (titleLower.includes("match")) {
      targetService = "server/match-app";
    } else if (titleLower.includes("social")) {
      targetService = "server/social-app";
    } else if (titleLower.includes("profil") || titleLower.includes("perks") || sprintDetail.toLowerCase().includes("profile-app")) {
      targetService = "server/profile-app";
    } else if (titleLower.includes("auth")) {
      targetService = "server/auth-app";
    } else if (titleLower.includes("notification")) {
      targetService = "server/notification-app";
    }

    this.lastTargetService = targetService;

    // Context loading with node_modules filtering for React Native
    let serviceStructure = "";
    let seedContent = "";
    try {
      const targetDir = path.resolve(repoRoot, targetService);
      if (fs.existsSync(targetDir)) {
        const { execSync } = require("child_process");
        // Safe find ignoring huge folders
        serviceStructure = execSync(`find ${targetService} -maxdepth 4 -not -path "*/node_modules/*" -not -path "*/.expo/*" -not -path "*/vendor/*"`, { cwd: repoRoot }).toString();
        
        // Auto-seed key files to save exploration turns
        let findCommand = targetService === "client" 
          ? `find ${targetService} -type f \\( -name "*.tsx" -o -name "*.ts" \\) -not -path "*/node_modules/*" | head -n 3`
          : `find ${targetService}/src -type f \\( -name "*Service.php" -o -path "*/Domain/*" \\) -not -path "*/vendor/*" | head -n 3`;
          
        try {
          const filesToRead = execSync(findCommand, { cwd: repoRoot }).toString().trim().split("\n").filter(Boolean);
          for (const file of filesToRead) {
            const fileFullPath = path.resolve(repoRoot, file);
            if (fs.existsSync(fileFullPath)) {
              const content = fs.readFileSync(fileFullPath, "utf8");
              seedContent += `\n--- File: /monorepo/${file} ---\n${content.substring(0, 3000)}\n`;
            }
          }
        } catch (err) {}
      } else {
        serviceStructure = `Directory /monorepo/${targetService} not found (Please create it empty or use 'mkdir').`;
      }
    } catch (e) {
      serviceStructure = "Structure analysis failed.";
    }

    return `You are MiMo, an AI engineering assistant. Follow these rules exactly:
${this.devRules}

Current task: ${activeSprint.id} - ${activeSprint.title}

Target Service Context (${targetService}):
Files in src:
${serviceStructure}

Pre-read Context Files:
${seedContent}

Sprint detail file content:
${sprintDetail}

INSTRUCTIONS:
1. You are already in the context of ${targetService}. 
2. DO NOT waste turns on 'ls -R' or 'find' at the root. 
3. Start by reading the specific Domain entities or Services related to the task.
4. Implement TDD: Write the test, verify failure, then write the implementation.
5. Use 'write_file' to create/update files.
6. Your workspace is /monorepo. All paths should be relative to it or start with /monorepo.
7. CRITICAL: Use PHPUnit 12 standards (Attributes #[DataProvider], static providers).
8. IMPORTANT: Create EMPTY class files (namespaced stubs) BEFORE writing tests to avoid Class Not Found errors.`;
  }
}
