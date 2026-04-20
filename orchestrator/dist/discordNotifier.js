"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordNotifier = void 0;
const axios_1 = __importDefault(require("axios"));
class DiscordNotifier {
    constructor() {
        const url = process.env.DISCORD_WEBHOOK_URL_STATUS ?? process.env.DISCORD_WEBHOOK_URL;
        if (!url) {
            throw new Error("DISCORD_WEBHOOK_URL_STATUS or DISCORD_WEBHOOK_URL is not configured");
        }
        this.webhookUrl = url;
    }
    async sendPing(message) {
        await axios_1.default.post(this.webhookUrl, {
            content: `:ping_pong: **Orchestrator ping**\n${message}`
        });
    }
    async sendQuestion(question) {
        await axios_1.default.post(this.webhookUrl, {
            content: `:question: **Orchestrator needs clarification**\n${question}`
        });
    }
    async notifyFailure(message) {
        await axios_1.default.post(this.webhookUrl, {
            content: `:x: **Orchestrator failed**\n${message}`
        });
    }
    async requestPushApproval(branchName) {
        await axios_1.default.post(this.webhookUrl, {
            content: `:rocket: **Feature branch ready**\nBranch: \`${branchName}\`\nPlease review and approve the push.`
        });
    }
}
exports.DiscordNotifier = DiscordNotifier;
