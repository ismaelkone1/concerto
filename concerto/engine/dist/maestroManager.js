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
exports.MaestroManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class MaestroManager {
    constructor(frameworkRoot, config) {
        this.frameworkRoot = frameworkRoot;
        this.config = config;
    }
    async buildPrompt(agentRole, sprintInfo) {
        const maestroPath = path.join(this.frameworkRoot, "maestros", `${agentRole.toLowerCase()}.prompt.md`);
        const projectRulesPath = path.join(this.frameworkRoot, "..", this.config.paths.config, this.config.paths.rules, "be-rules.md");
        const maestroPrompt = fs.existsSync(maestroPath) ? fs.readFileSync(maestroPath, "utf8") : "";
        const projectRules = fs.existsSync(projectRulesPath) ? fs.readFileSync(projectRulesPath, "utf8") : "";
        return `YOU ARE A CONCERTO MAESTRO. ROLE: ${agentRole}
    
# FRAMEWORK RULES:
- Work in the provided workspace.
- Always check the Partition if you are a FE agent.
- Produce production-ready code.

# PROJECT SPECIFIC RULES:
${projectRules}

# YOUR ROLE MISSION:
${maestroPrompt}

# CURRENT TASK:
${sprintInfo.description}

INSTRUCTIONS:
- Start your performance now.
- If you are BE-QA, you MUST output a 'partition.json' in the contracts directory.
`;
    }
}
exports.MaestroManager = MaestroManager;
