/**
 * Host half of `inline-stream`: one native tool plus its guidance, registered
 * in each root agent's own scope. The agent loop is untouched; the tool only
 * validates the view the model already streamed and, on success, concludes
 * the turn so no extra model request follows.
 */
import type { Context } from '@deepseek-ai/cordis';
/**
 * Register the view tool for every current and future root agent that calls
 * tools natively. Sub-agents and PTC-presenting agents get nothing.
 * @param ctx - context carrying `agents`, `tools`, and `systemPrompt`.
 */
export declare function installInline(ctx: Context): void;
//# sourceMappingURL=inline-tool.d.ts.map