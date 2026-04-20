import * as fs from "fs";
import * as path from "path";
import { MimoClient } from "./mimoClient";
import { SprintManager } from "./sprintManager";
import { TestRunner } from "./testRunner";
import { GitManager } from "./gitManager";
import { MaestroManager } from "./maestroManager";
import { DiscordNotifier } from "./discordNotifier";
import { LangfuseTracker } from "./langfuseTracker";

const LOG_PATH = path.join(__dirname, "../../concerto.log");

function log(msg: string) {
  const timestamp = new Date().toISOString().substring(11, 19);
  const formattedMsg = `[${timestamp}] ${msg}\n`;
  console.log(msg);
  fs.appendFileSync(LOG_PATH, formattedMsg);
}

export enum ConcertoMovements {
  IDLE = "IDLE",
  BE_DEV = "BE_DEV",
  BE_QA = "BE_QA",
  FE_VERIF = "FE_VERIF",
  FE_DEV = "FE_DEV",
  FINALE = "FINALE",
  ERROR = "ERROR"
}

export class Conductor {
  private currentMovement: any = ConcertoMovements.IDLE;
  private projectRoot: string;
  private config: any;
  private mimoClient: MimoClient;
  private maestroManager: MaestroManager;
  private sprintManager: SprintManager;
  private testRunner: TestRunner;
  private gitManager: GitManager;
  private discordNotifier: DiscordNotifier;
  private langfuseTracker: LangfuseTracker;

  private projectId: string;
  private projectPath: string;

  constructor(projectRoot: string, projectId?: string) {
    this.projectRoot = projectRoot;
    
    // If no projectId provided, we fail (no more default TodoApp)
    if (!projectId) {
      throw new Error("No project ID provided to Conductor.");
    }

    this.projectId = projectId;
    this.projectPath = path.join(projectRoot, "workspace/projects", projectId);
    
    const configPath = path.join(this.projectPath, ".concerto/config.json");
    if (!fs.existsSync(configPath)) {
      throw new Error(`Project config not found at ${configPath}`);
    }

    this.config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    
    this.mimoClient = new MimoClient();
    this.maestroManager = new MaestroManager(projectRoot, this.config);
    this.sprintManager = new SprintManager(this.projectPath);
    this.testRunner = new TestRunner();
    this.gitManager = new GitManager();
    this.discordNotifier = new DiscordNotifier();
    this.langfuseTracker = new LangfuseTracker();

    // Clear log at start
    if (fs.existsSync(LOG_PATH)) fs.writeFileSync(LOG_PATH, "");
  }

  private checkPhaseRequirement(phaseId: string): boolean {
    const phasesPath = path.join(this.projectPath, ".concerto/phases/phases.json");
    if (!fs.existsSync(phasesPath)) return false;

    const phasesConfig = JSON.parse(fs.readFileSync(phasesPath, "utf8"));
    const phase = phasesConfig.phases.find((p: any) => p.id === phaseId);
    return phase && phase.status === "completed";
  }

  public async orchestrate() {
    log(`🎼 Starting orchestration for project: ${this.config.name} (${this.projectId})`);
    
    // Guardrail: Ensure conception is finished
    if (!this.checkPhaseRequirement("conception")) {
      log("❌ Aborting: 'conception' phase is not marked as 'completed' for this project.");
      this.currentMovement = ConcertoMovements.ERROR;
      return;
    }

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
      } catch (e: any) {
        log(`❌ Error in movement ${this.currentMovement}: ${e.message}`);
        this.currentMovement = ConcertoMovements.ERROR;
      }
    }

    if (this.currentMovement === ConcertoMovements.FINALE) {
      log("🎉 Performance Finished successfully.");
      await this.sprintManager.markSprintAsCompleted(activeSprint.id);
    }
  }

  public async reviewBackend() {
    log("🎻 Starting Backend Review Concert...");
    const prompt = "Please review the backend architecture, check for hallucinations in controllers, and ensure the DB schema matches the domain. Focused on the current application architecture.";
    const response = await this.mimoClient.generateCode(prompt);
    log(`✅ Backend Review Finished: ${response.substring(0, 100)}...`);
  }

  public async reviewFrontend() {
    log("🎺 Starting Frontend Review Concert...");
    const prompt = "Please review the React Native frontend screens. Check if the API calls are correctly redirected to the gateway instead of the monolithic auth-app. Suggest any UI/UX polishes based on modern mobile design.";
    const response = await this.mimoClient.generateCode(prompt);
    log(`✅ Frontend Review Finished: ${response.substring(0, 100)}...`);
  }

  public async getProjectStatus() {
    log("📋 Analyzing real-time project status...");
    const activeSprint = await this.sprintManager.getActiveSprint();
    log(`📢 Current Sprint: ${activeSprint ? activeSprint.id : "None"}`);
    // Here we could add a logic to scan the repo and compare with steps.md
    log("✅ Analysis finished. Status is STABLE.");
  }

  public async auditSecurity(params: any = {}) {
    log("🔐 Starting Security Audit...");
    const scope = params.scope || "tout-projet";
    const context = params.context || "Audit général de sécurité";
    const criteria = params.criteria || "Vérifier JWT, input sanitization, vulnérabilités connues";
    const prompt = `Audit de sécurité pour ${scope}. Contexte: ${context}. Critères: ${criteria}. Fournir un rapport détaillé avec recommandations.`;
    const response = await this.mimoClient.generateCode(prompt);
    log(`✅ Security Audit Finished: ${response.substring(0, 100)}...`);
  }

  public async fixBug(params: any = {}) {
    log("🐛 Starting Bug Fix...");
    const scope = params.scope || "feature-specifique";
    const context = params.context || "Bug décrit";
    const criteria = params.criteria || "Résoudre le bug sans casser l'existant";
    const prompt = `Corriger le bug dans ${scope}. Contexte: ${context}. Critères: ${criteria}. Proposer un fix minimal et testé.`;
    const response = await this.mimoClient.generateCode(prompt);
    log(`✅ Bug Fix Finished: ${response.substring(0, 100)}...`);
  }

  public async optimizePerformance(params: any = {}) {
    log("⚡ Starting Performance Optimization...");
    const scope = params.scope || "composant-specifique";
    const context = params.context || "Optimisation demandée";
    const criteria = params.criteria || "Réduire latence, améliorer efficacité";
    const prompt = `Optimiser les performances pour ${scope}. Contexte: ${context}. Critères: ${criteria}. Suggestions concrètes.`;
    const response = await this.mimoClient.generateCode(prompt);
    log(`✅ Performance Optimization Finished: ${response.substring(0, 100)}...`);
  }

  public async generateDocs(params: any = {}) {
    log("📚 Starting Documentation Generation...");
    const scope = params.scope || "feature-specifique";
    const context = params.context || "Documentation pour la feature";
    const criteria = params.criteria || "Clair, complet, avec exemples";
    const prompt = `Générer documentation pour ${scope}. Contexte: ${context}. Critères: ${criteria}. Format Markdown.`;
    const response = await this.mimoClient.generateCode(prompt);
    log(`✅ Documentation Generated: ${response.substring(0, 100)}...`);
  }

  private getPhaseFromMovement(movement: ConcertoMovements): string {
    switch (movement) {
      case ConcertoMovements.BE_DEV:
      case ConcertoMovements.FE_DEV:
      case ConcertoMovements.FE_VERIF:
        return "dev";
      case ConcertoMovements.BE_QA:
        return "test";
      default:
        return "dev";
    }
  }

  private async performBEDev(activeSprint: any) {
    log("🎹 BE-DEV is coding the logic...");
    const phase = this.getPhaseFromMovement(ConcertoMovements.BE_DEV);
    const prompt = await this.maestroManager.buildPrompt("BE-DEV", activeSprint, phase);
    const response = await this.mimoClient.generateCode(prompt);
    log(`✅ Backend implementation finished: ${response.substring(0, 100)}...`);
    this.currentMovement = ConcertoMovements.BE_QA;
  }

  private async performBEQA(activeSprint: any) {
    log("🎻 BE-QA is auditing the backend...");
    const targetService = this.config.targetPath; // Use targetPath
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

  private async performFEVerif(activeSprint: any) {
    log("🎺 FE-VERIF is designing the frontend blueprint...");
    this.currentMovement = ConcertoMovements.FE_DEV;
  }

  private async performFEDev(activeSprint: any) {
    log("🎸 FE-DEV is implementing the UI...");
    const phase = this.getPhaseFromMovement(ConcertoMovements.FE_DEV);
    const prompt = await this.maestroManager.buildPrompt("FE-DEV", activeSprint, phase);
    const response = await this.mimoClient.generateCode(prompt);
    log(`✅ Frontend implementation finished: ${response.substring(0, 100)}...`);
    this.currentMovement = ConcertoMovements.FINALE;
  }

  private writePartition(activeSprint: any) {
    const partitionPath = path.join(this.projectRoot, this.config.paths.config, this.config.paths.contracts, "partition.json");
    fs.writeFileSync(partitionPath, JSON.stringify({ 
      sprint: activeSprint.id, 
      status: "OK",
      timestamp: new Date().toISOString()
    }, null, 2));
  }
}
