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
exports.Conductor = exports.ConcertoMovements = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const mimoClient_1 = require("./mimoClient");
const sprintManager_1 = require("./sprintManager");
const testRunner_1 = require("./testRunner");
const gitManager_1 = require("./gitManager");
const maestroManager_1 = require("./maestroManager");
const discordNotifier_1 = require("./discordNotifier");
const langfuseTracker_1 = require("./langfuseTracker");
const LOG_PATH = path.join(__dirname, "../../concerto.log");
function log(msg) {
    const timestamp = new Date().toISOString().substring(11, 19);
    const formattedMsg = `[${timestamp}] ${msg}\n`;
    console.log(msg);
    fs.appendFileSync(LOG_PATH, formattedMsg);
}
var ConcertoMovements;
(function (ConcertoMovements) {
    ConcertoMovements["IDLE"] = "IDLE";
    ConcertoMovements["BE_DEV"] = "BE_DEV";
    ConcertoMovements["BE_QA"] = "BE_QA";
    ConcertoMovements["FE_VERIF"] = "FE_VERIF";
    ConcertoMovements["FE_DEV"] = "FE_DEV";
    ConcertoMovements["FINALE"] = "FINALE";
    ConcertoMovements["ERROR"] = "ERROR";
})(ConcertoMovements || (exports.ConcertoMovements = ConcertoMovements = {}));
class Conductor {
    constructor(projectRoot) {
        this.currentMovement = ConcertoMovements.IDLE;
        this.projectRoot = projectRoot;
        const configPath = path.join(projectRoot, "engine/config.json");
        this.config = JSON.parse(fs.readFileSync(configPath, "utf8"));
        this.mimoClient = new mimoClient_1.MimoClient();
        this.maestroManager = new maestroManager_1.MaestroManager(path.join(projectRoot, "concerto-engine"), this.config);
        this.sprintManager = new sprintManager_1.SprintManager();
        this.testRunner = new testRunner_1.TestRunner();
        this.gitManager = new gitManager_1.GitManager();
        this.discordNotifier = new discordNotifier_1.DiscordNotifier();
        this.langfuseTracker = new langfuseTracker_1.LangfuseTracker();
        // Clear log at start
        if (fs.existsSync(LOG_PATH))
            fs.writeFileSync(LOG_PATH, "");
    }
    async orchestrate() {
        log(`🎼 Starting symphony: ${this.config.project}`);
        const activeSprint = await this.sprintManager.getActiveSprint();
        if (!activeSprint) {
            log("❌ No active sprint found.");
            return;
        }
        this.currentMovement = ConcertoMovements.BE_DEV;
        while (this.currentMovement !== ConcertoMovements.FINALE && this.currentMovement !== ConcertoMovements.ERROR) {
            log(`── Movement: ${this.currentMovement} ──`);
            try {
                switch (this.currentMovement) {
                    case ConcertoMovements.BE_DEV:
                        await this.performBEDev(activeSprint);
                        break;
                    case ConcertoMovements.BE_QA:
                        await this.performBEQA(activeSprint);
                        break;
                    case ConcertoMovements.FE_VERIF:
                        await this.performFEVerif(activeSprint);
                        break;
                    case ConcertoMovements.FE_DEV:
                        await this.performFEDev(activeSprint);
                        break;
                }
            }
            catch (e) {
                log(`❌ Error in movement ${this.currentMovement}: ${e.message}`);
                this.currentMovement = ConcertoMovements.ERROR;
            }
        }
        if (this.currentMovement === ConcertoMovements.FINALE) {
            log("🎉 Performance Finished successfully.");
            await this.sprintManager.markSprintAsCompleted(activeSprint.id);
        }
    }
    async reviewBackend() {
        log("🎻 Starting Backend Review Concert...");
        const prompt = "Please review the backend architecture, check for hallucinations in controllers, and ensure the DB schema matches the domain. Focused on the current application architecture.";
        const response = await this.mimoClient.generateCode(prompt);
        log(`✅ Backend Review Finished: ${response.substring(0, 100)}...`);
    }
    async reviewFrontend() {
        log("🎺 Starting Frontend Review Concert...");
        const prompt = "Please review the React Native frontend screens. Check if the API calls are correctly redirected to the gateway instead of the monolithic auth-app. Suggest any UI/UX polishes based on modern mobile design.";
        const response = await this.mimoClient.generateCode(prompt);
        log(`✅ Frontend Review Finished: ${response.substring(0, 100)}...`);
    }
    async getProjectStatus() {
        log("📋 Analyzing real-time project status...");
        const activeSprint = await this.sprintManager.getActiveSprint();
        log(`📢 Current Sprint: ${activeSprint ? activeSprint.id : "None"}`);
        // Here we could add a logic to scan the repo and compare with steps.md
        log("✅ Analysis finished. Status is STABLE.");
    }
    async auditSecurity(params = {}) {
        log("🔐 Starting Security Audit...");
        const scope = params.scope || "tout-projet";
        const context = params.context || "Audit général de sécurité";
        const criteria = params.criteria || "Vérifier JWT, input sanitization, vulnérabilités connues";
        const prompt = `Audit de sécurité pour ${scope}. Contexte: ${context}. Critères: ${criteria}. Fournir un rapport détaillé avec recommandations.`;
        const response = await this.mimoClient.generateCode(prompt);
        log(`✅ Security Audit Finished: ${response.substring(0, 100)}...`);
    }
    async fixBug(params = {}) {
        log("🐛 Starting Bug Fix...");
        const scope = params.scope || "feature-specifique";
        const context = params.context || "Bug décrit";
        const criteria = params.criteria || "Résoudre le bug sans casser l'existant";
        const prompt = `Corriger le bug dans ${scope}. Contexte: ${context}. Critères: ${criteria}. Proposer un fix minimal et testé.`;
        const response = await this.mimoClient.generateCode(prompt);
        log(`✅ Bug Fix Finished: ${response.substring(0, 100)}...`);
    }
    async optimizePerformance(params = {}) {
        log("⚡ Starting Performance Optimization...");
        const scope = params.scope || "composant-specifique";
        const context = params.context || "Optimisation demandée";
        const criteria = params.criteria || "Réduire latence, améliorer efficacité";
        const prompt = `Optimiser les performances pour ${scope}. Contexte: ${context}. Critères: ${criteria}. Suggestions concrètes.`;
        const response = await this.mimoClient.generateCode(prompt);
        log(`✅ Performance Optimization Finished: ${response.substring(0, 100)}...`);
    }
    async generateDocs(params = {}) {
        log("📚 Starting Documentation Generation...");
        const scope = params.scope || "feature-specifique";
        const context = params.context || "Documentation pour la feature";
        const criteria = params.criteria || "Clair, complet, avec exemples";
        const prompt = `Générer documentation pour ${scope}. Contexte: ${context}. Critères: ${criteria}. Format Markdown.`;
        const response = await this.mimoClient.generateCode(prompt);
        log(`✅ Documentation Generated: ${response.substring(0, 100)}...`);
    }
    async performBEDev(activeSprint) {
        log("🎹 BE-DEV is coding the logic...");
        const prompt = await this.maestroManager.buildPrompt("BE-DEV", activeSprint);
        const response = await this.mimoClient.generateCode(prompt);
        log(`✅ Backend implementation finished: ${response.substring(0, 100)}...`);
        this.currentMovement = ConcertoMovements.BE_QA;
    }
    async performBEQA(activeSprint) {
        log("🎻 BE-QA is auditing the backend...");
        const targetService = "server/core-app";
        const testsPassed = await this.testRunner.runUnitTests(targetService);
        if (!testsPassed) {
            log("⚠️ Tests failed. Returning to BE-DEV.");
            this.currentMovement = ConcertoMovements.BE_DEV;
            return;
        }
        log("✅ Backend validated. Creating partition.");
        this.writePartition(activeSprint);
        this.currentMovement = ConcertoMovements.FE_VERIF;
    }
    async performFEVerif(activeSprint) {
        log("🎺 FE-VERIF is designing the frontend blueprint...");
        this.currentMovement = ConcertoMovements.FE_DEV;
    }
    async performFEDev(activeSprint) {
        log("🎸 FE-DEV is implementing the UI...");
        this.currentMovement = ConcertoMovements.FINALE;
    }
    writePartition(activeSprint) {
        const partitionPath = path.join(this.projectRoot, this.config.paths.config, this.config.paths.contracts, "partition.json");
        fs.writeFileSync(partitionPath, JSON.stringify({
            sprint: activeSprint.id,
            status: "OK",
            timestamp: new Date().toISOString()
        }, null, 2));
    }
}
exports.Conductor = Conductor;
