import * as fs from "fs";
import * as path from "path";

export interface SprintInfo {
  id: string;
  title: string;
  description: string;
}

export class SprintManager {
  private stepsPath: string;
  private detailsDir: string;

  constructor(projectPath: string) {
    this.stepsPath = path.join(projectPath, ".concerto/specs/steps.md");
    this.detailsDir = path.join(projectPath, ".concerto/specs");
  }

  async getActiveSprint(): Promise<SprintInfo | null> {
    if (!fs.existsSync(this.stepsPath)) {
      throw new Error(`steps.md introuvable dans ${this.stepsPath}`);
    }

    const content = fs.readFileSync(this.stepsPath, "utf8");
    const activeLineRegex = /^\s*- \*\*(Sous-Sprint [0-9]+\.[0-9]+)\*\* : ([^\n]+?)\s*\(En cours\)/i;
    const lines = content.split("\n");
    const activeLineIndex = lines.findIndex((line) => activeLineRegex.test(line));
    if (activeLineIndex === -1) {
      return null;
    }

    const activeMatch = activeLineRegex.exec(lines[activeLineIndex]);
    const id = activeMatch?.[1].trim() ?? "";
    const title = activeMatch?.[2].trim() ?? "";

    let sectionEnd = lines.length;
    for (let i = activeLineIndex + 1; i < lines.length; i += 1) {
      if (/^\s*- \*\*/.test(lines[i])) {
        sectionEnd = i;
        break;
      }
    }

    const description = lines.slice(activeLineIndex, sectionEnd).join("\n").trim();

    return { id, title, description };
  }

  async ensureSprintDetailFile(activeSprint: SprintInfo): Promise<{ path: string; needsClarification: boolean; clarificationQuestion?: string }> {
    const fileName = `${activeSprint.id.toLowerCase().replace(/\s+/g, "-")}.md`;
    const fullPath = path.join(this.detailsDir, fileName);

    if (!fs.existsSync(fullPath)) {
      const body = `# ${activeSprint.id}

## Title
${activeSprint.title}

## Description
${activeSprint.description}

## Tasks
- [ ] Analyse
- [ ] TDD tests
- [ ] Implementation
- [ ] Validation curl
- [ ] Commit & push

## Questions
- Aucune question pour l’instant.
`;
      fs.writeFileSync(fullPath, body, "utf8");
      return { path: fullPath, needsClarification: false };
    }

    return { path: fullPath, needsClarification: false };
  }
  async markSprintAsCompleted(sprintId: string): Promise<void> {
    if (!fs.existsSync(this.stepsPath)) return;
    
    let content = fs.readFileSync(this.stepsPath, "utf8");
    const lines = content.split("\n");
    
    // Find the current sprint line (might be "En cours" or just the sprint)
    const activeLineIndex = lines.findIndex(line => line.includes(`**${sprintId}**`) && line.includes(`(En cours)`));
    
    if (activeLineIndex !== -1) {
      // 1. Mark current as completed
      lines[activeLineIndex] = lines[activeLineIndex].replace("(En cours)", "(Complété)");
      
      // 2. Discover the NEXT sub-sprint automatically and mark it as active
      const nextLineIndex = lines.findIndex((line, index) => index > activeLineIndex && /^\s*- \*\*(Sous-Sprint [0-9]+\.[0-9]+)\*\*/.test(line));
      if (nextLineIndex !== -1 && !lines[nextLineIndex].includes("(Complété)") && !lines[nextLineIndex].includes("(En cours)")) {
        lines[nextLineIndex] = lines[nextLineIndex].trim() + " (En cours)";
      }
      
      fs.writeFileSync(this.stepsPath, lines.join("\n"), "utf8");
      console.log(`[sprintManager] Marked sprint ${sprintId} as (Complété) and instantly activated the next one in steps.md.`);
    }
  }
}
