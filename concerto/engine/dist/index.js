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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const conductor_1 = require("./conductor");
const projectRoot = path.resolve(__dirname, "../../");
dotenv_1.default.config({ path: path.join(projectRoot, "engine/.env") });
console.log("AI_API_KEY:", process.env.AI_API_KEY);
const conductor = new conductor_1.Conductor(projectRoot);
const args = process.argv.slice(2);
async function boot() {
    const params = {};
    for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith('--')) {
            const key = args[i].slice(2);
            const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : true;
            params[key] = value;
        }
    }
    if (args.includes("--review-be")) {
        await conductor.reviewBackend();
    }
    else if (args.includes("--review-fe")) {
        await conductor.reviewFrontend();
    }
    else if (args.includes("--audit-security")) {
        await conductor.auditSecurity();
    }
    else if (args.includes("--fix-bug")) {
        await conductor.fixBug();
    }
    else if (args.includes("--optimize-perf")) {
        await conductor.optimizePerformance();
    }
    else if (args.includes("--generate-docs")) {
        await conductor.generateDocs();
    }
    else if (args.includes("--status")) {
        await conductor.getProjectStatus();
    }
    else {
        await conductor.orchestrate();
    }
}
boot().catch((err) => {
    console.error("[Concerto] Fatal error:", err.message);
    process.exit(1);
});
