"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MimoClient = void 0;
const openai_1 = require("openai");
const toolManager_1 = require("./toolManager");
class MimoClient {
    constructor() {
        this.client = new openai_1.OpenAI({
            apiKey: process.env.MIMO_API_KEY,
            baseURL: "https://api.xiaomimimo.com/v1"
        });
        this.toolManager = new toolManager_1.ToolManager();
    }
    async generateCode(prompt) {
        const monoPath = process.env.MONOREPO_PATH || "/monorepo";
        let messages = [
            {
                role: "system",
                content: `You are MiMo, an expert AI engineering assistant working on a PHP/Symfony monorepo.
Your workspace is strictly limited to ${monoPath}.

IMPORTANT RULES:
1. You have a LIMITED budget. Spend at most 5 tool calls on exploration (read_dir, read_file). The prompt already contains the file tree and key file contents — use them!
2. After exploring, you MUST start WRITING code using write_file. Your main goal is to CREATE and MODIFY files.
3. Follow TDD: write the test first (write_file), run it (shell: phpunit), then write the implementation (write_file), run tests again.
4. Do NOT re-read files whose content is already provided in the prompt.
5. Use read_dir only if you need to discover a path not shown in the file tree.

Tools format: <function_calls><fn name="tool_name"><arg name="arg_name">value</arg></fn></function_calls>.
Available tools: shell, read_file, write_file, read_dir.
When finished, output a summary of all files you created or modified.`
            },
            { role: "user", content: prompt }
        ];
        let iteration = 0;
        let readOnlyIterations = 0;
        while (iteration < 50) {
            iteration++;
            console.log(`[mimoClient] Iteration ${iteration}...`);
            const response = await this.client.chat.completions.create({
                model: "mimo-v2-pro",
                messages,
                temperature: 0.1,
            });
            const content = response.choices?.[0]?.message?.content ?? "";
            // Log full AI response for dashboard visibility
            console.log(`[mimoClient] ── Iteration ${iteration} ──`);
            console.log(`[mimoClient:response] ${content}`);
            messages.push({ role: "assistant", content });
            if (content.includes("<function_calls>")) {
                // Track read-only iterations (no write_file or shell)
                const hasWrite = content.includes('name="write_file"') || content.includes("name='write_file'");
                const hasShell = content.includes('name="shell"') || content.includes("name='shell'");
                if (!hasWrite && !hasShell) {
                    readOnlyIterations++;
                }
                else {
                    readOnlyIterations = 0; // Reset when AI starts writing
                }
                const toolResults = await this.handleToolCalls(content);
                console.log(`[mimoClient:tools] Tool results received, continuing...`);
                let feedbackMsg = `<function_results>${toolResults}</function_results>`;
                // Nudge AI if it's been exploring too long
                if (readOnlyIterations >= 8) {
                    feedbackMsg += `\n\nWARNING: You have spent ${readOnlyIterations} iterations only reading files without writing any code. You MUST start implementing NOW using write_file. Create the test file first, then the implementation.`;
                    console.log(`[mimoClient:warn] Nudging AI after ${readOnlyIterations} read-only iterations.`);
                }
                messages.push({ role: "user", content: feedbackMsg });
            }
            else if (content.includes("write_file") || content.includes("shell")) {
                console.log(`[mimoClient:warn] Detected tool keywords but incorrect XML format. Asking AI to retry.`);
                messages.push({ role: "user", content: "I detected tool keywords in your response but the XML format was incorrect. Please use the EXACT <function_calls> format to execute your actions." });
            }
            else {
                console.log(`[mimoClient] ✅ AI finished. Final answer received.`);
                return content;
            }
        }
        return "Error: Maximum iterations reached. Implementation might be incomplete.";
    }
    async handleToolCalls(content) {
        let results = "";
        // Robust regex to handle diverse quote types and spaces
        const fnRegex = /<fn\s+name=["']([^"']+)["']>([\s\S]*?)<\/fn>/g;
        let match;
        while ((match = fnRegex.exec(content)) !== null) {
            const toolName = match[1];
            const argsContent = match[2];
            const args = {};
            const argRegex = /<arg\s+name=["']([^"']+)["']>([\s\S]*?)<\/arg>/g;
            let argMatch;
            while ((argMatch = argRegex.exec(argsContent)) !== null) {
                args[argMatch[1]] = argMatch[2].trim();
            }
            const result = await this.toolManager.execute(toolName, args);
            results += `<fn_result name="${toolName}">${result}</fn_result>`;
        }
        return results;
    }
}
exports.MimoClient = MimoClient;
