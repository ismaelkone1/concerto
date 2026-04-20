"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LangfuseTracker = void 0;
class LangfuseTracker {
    async tracePrompt(sprintId, prompt) {
        console.log(`[langfuse] Tracing prompt for ${sprintId}`);
    }
    async traceResponse(sprintId, response) {
        console.log(`[langfuse] Tracing response for ${sprintId}`);
    }
}
exports.LangfuseTracker = LangfuseTracker;
