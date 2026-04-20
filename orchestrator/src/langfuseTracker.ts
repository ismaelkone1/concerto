export class LangfuseTracker {
  async tracePrompt(sprintId: string, prompt: string): Promise<void> {
    console.log(`[langfuse] Tracing prompt for ${sprintId}`);
  }

  async traceResponse(sprintId: string, response: string): Promise<void> {
    console.log(`[langfuse] Tracing response for ${sprintId}`);
  }
}
