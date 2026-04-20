import axios from "axios";

export class DiscordNotifier {
  private webhookUrl: string;

  constructor() {
    const url = process.env.DISCORD_WEBHOOK_URL_STATUS ?? process.env.DISCORD_WEBHOOK_URL;
    if (!url) {
      throw new Error("DISCORD_WEBHOOK_URL_STATUS or DISCORD_WEBHOOK_URL is not configured");
    }
    this.webhookUrl = url;
  }

  async sendPing(message: string): Promise<void> {
    await axios.post(this.webhookUrl, {
      content: `:ping_pong: **Orchestrator ping**\n${message}`
    });
  }

  async sendQuestion(question: string): Promise<void> {
    await axios.post(this.webhookUrl, {
      content: `:question: **Orchestrator needs clarification**\n${question}`
    });
  }

  async notifyFailure(message: string): Promise<void> {
    await axios.post(this.webhookUrl, {
      content: `:x: **Orchestrator failed**\n${message}`
    });
  }

  async requestPushApproval(branchName: string): Promise<void> {
    await axios.post(this.webhookUrl, {
      content: `:rocket: **Feature branch ready**\nBranch: \`${branchName}\`\nPlease review and approve the push.`
    });
  }
}
