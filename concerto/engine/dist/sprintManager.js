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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SprintManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const repoRoot = process.env.GIT_REPO_PATH || path.resolve(__dirname, "..", "..");
class SprintManager {
    constructor() {
        this.stepsPath = path.resolve(repoRoot, "ai-dev-rules/steps.md");
        this.detailsDir = path.resolve(repoRoot, "ai-dev-rules");
    }
    async getActiveSprint() {
        if (!fs.existsSync(this.stepsPath)) {
            throw new Error("steps.md introuvable dans ai-dev-rules");
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
    async ensureSprintDetailFile(activeSprint) {
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
    async markSprintAsCompleted(sprintId) {
        if (!fs.existsSync(this.stepsPath))
            return;
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
exports.SprintManager = SprintManager;
