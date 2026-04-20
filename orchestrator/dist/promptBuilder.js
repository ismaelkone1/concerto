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
exports.PromptBuilder = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const repoRoot = process.env.MONOREPO_PATH || "/monorepo";
class PromptBuilder {
    constructor() {
        const rulesPath = path.resolve(repoRoot, "ai-dev-rules/dev-rules.md");
        this.devRules = fs.existsSync(rulesPath) ? fs.readFileSync(rulesPath, "utf8") : "";
    }
    buildPrompt(activeSprint, sprintFilePath) {
        const sprintDetail = fs.existsSync(sprintFilePath)
            ? fs.readFileSync(sprintFilePath, "utf8")
            : "";
        // Try to guess the microservice from the sprint content
        let targetService = "server/core-app"; // Default
        if (sprintDetail.toLowerCase().includes("profile") || activeSprint.title.toLowerCase().includes("profile")) {
            targetService = "server/profile-app";
        }
        else if (sprintDetail.toLowerCase().includes("auth") || activeSprint.title.toLowerCase().includes("auth")) {
            targetService = "server/auth-app";
        }
        // List files in the target service to give context immediately
        let serviceStructure = "";
        let seedContent = "";
        try {
            const fullPath = path.resolve(repoRoot, targetService, "src");
            if (fs.existsSync(fullPath)) {
                const { execSync } = require("child_process");
                serviceStructure = execSync(`find ${targetService}/src -maxdepth 3`, { cwd: repoRoot }).toString();
                // Auto-seed key files to save exploration turns
                const filesToRead = execSync(`find ${targetService}/src -type f \\( -name "*Service.php" -o -path "*/Domain/*" \\) | head -n 3`, { cwd: repoRoot }).toString().trim().split("\n").filter(Boolean);
                for (const file of filesToRead) {
                    try {
                        const fileFullPath = path.resolve(repoRoot, file);
                        if (fs.existsSync(fileFullPath)) {
                            const content = fs.readFileSync(fileFullPath, "utf8");
                            seedContent += `\n--- File: /monorepo/${file} ---\n${content.substring(0, 3000)}\n`;
                        }
                    }
                    catch (err) { }
                }
            }
        }
        catch (e) {
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
exports.PromptBuilder = PromptBuilder;
