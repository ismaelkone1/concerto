import * as fs from "fs";
import * as path from "path";

export class MaestroManager {
  private frameworkRoot: string;
  private config: any;

  constructor(frameworkRoot: string, config: any) {
    this.frameworkRoot = frameworkRoot;
    this.config = config;
  }

  public async buildPrompt(agentRole: string, sprintInfo: any, phase: string): Promise<string> {
    const globalPromptPath = path.join(this.frameworkRoot, "concerto-config", phase, "prompts", `${agentRole.toLowerCase()}.md`);
    const projectRulesPath = path.join(this.config.targetPath, ".concerto/rules", "rules.md");
    
    const globalPrompt = fs.existsSync(globalPromptPath) ? fs.readFileSync(globalPromptPath, "utf8") : "";
    const projectRules = fs.existsSync(projectRulesPath) ? fs.readFileSync(projectRulesPath, "utf8") : "";

    return `YOU ARE A CONCERTO MAESTRO. ROLE: ${agentRole} | PHASE: ${phase.toUpperCase()}
    
# GLOBAL PHASE INSTRUCTIONS:
${globalPrompt}

# PROJECT SPECIFIC RULES:
${projectRules}

# CURRENT TASK:
${sprintInfo.description}

INSTRUCTIONS:
- Work in the target workspace: ${this.config.targetPath}
- Follow the global instructions for the ${phase} phase.
- If you are BE-QA, you MUST output a 'partition.json' in the contracts directory.
- Produce production-ready code.
`;
  }
}
