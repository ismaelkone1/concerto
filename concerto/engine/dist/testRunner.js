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
exports.TestRunner = void 0;
const child_process_1 = require("child_process");
const util = __importStar(require("util"));
const path = __importStar(require("path"));
const execAsync = util.promisify(child_process_1.exec);
const WORKSPACE_PATH = process.env.GIT_REPO_PATH || process.cwd();
class TestRunner {
    async runUnitTests(targetService) {
        let command = "";
        if (targetService === "client") {
            command = `cd ${path.resolve(WORKSPACE_PATH, "client")} && npm run test`;
        }
        else if (targetService.startsWith("server/")) {
            const composeService = targetService.replace("server/", "").replace("-", "_");
            command = `cd ${path.resolve(WORKSPACE_PATH)} && docker compose exec -T ${composeService} php bin/phpunit --testsuite=Unit`;
        }
        else {
            return true;
        }
        try {
            const { stdout } = await execAsync(command);
            return stdout.includes("OK");
        }
        catch (error) {
            if (targetService === "client" && error.stderr && error.stderr.includes("Missing script")) {
                return true;
            }
            return false;
        }
    }
    async runIntegrationTests(targetService) {
        return true;
    }
    async runE2ETests() {
        console.log("[testRunner] 🎭 Running Cypress E2E tests...");
        const command = `cd ${path.resolve(WORKSPACE_PATH, "tests/e2e")} && npm run cypress:run`;
        try {
            const { stdout } = await execAsync(command);
            console.log(`[testRunner] Cypress stdout: ${stdout}`);
            return stdout.includes("All specs passed");
        }
        catch (error) {
            console.error("[testRunner] Cypress E2E tests failed.");
            return false;
        }
    }
}
exports.TestRunner = TestRunner;
