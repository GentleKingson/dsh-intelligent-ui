/**
 * Host half of `inline-stream`: one native tool plus its guidance, registered
 * in each root agent's own scope. The agent loop is untouched; the tool only
 * validates the view the model already streamed and, on success, concludes
 * the turn so no extra model request follows.
 */
import { INLINE_PARAMETERS, INLINE_PROMPT, INLINE_TOOL_NAME, validateInlineArgs } from "./inline.js";
/** Reserved PTC transport name; its presence means the agent's model does not call tools natively. */
const PTC_TRANSPORT = 'run_code';
const tool = {
    name: INLINE_TOOL_NAME,
    description: 'Show the user an interactive view (Markdown, cards, sortable table, bar/line chart, or explorer with linked filters, summaries and record/step selection) built from data you supply. '
        + 'Renders directly in the conversation; no workspace files or app-source inspection needed. Use for option comparisons, lists of items sharing fields, and numeric data; other answers stay Markdown. Write a short Markdown answer before calling. '
        + 'A successful call ends your turn.',
    parameters: INLINE_PARAMETERS,
    output: {
        schema: {
            type: 'object',
            additionalProperties: false,
            required: ['components'],
            properties: { components: { type: 'integer' } },
        },
        render: (_args, value) => [{
                type: 'text',
                text: `Shown ${String(value.components)} components to the user.`,
            }],
    },
    async execute(args, exec) {
        // A PTC sub-dispatch has no streamed arguments to preview; only native calls are supported.
        if (exec.parent !== undefined)
            throw new Error(`${INLINE_TOOL_NAME} must be called directly, not from code`);
        const outcome = validateInlineArgs(args);
        if (!outcome.ok)
            throw new Error(`${INLINE_TOOL_NAME} rejected (${outcome.detail}). Answer in plain Markdown instead.`);
        exec.concludeTurn();
        return Promise.resolve({ components: outcome.items.length });
    },
};
/**
 * Register the view tool for every current and future root agent that calls
 * tools natively. Sub-agents and PTC-presenting agents get nothing.
 * @param ctx - context carrying `agents`, `tools`, and `systemPrompt`.
 */
export function installInline(ctx) {
    const installed = new Map();
    const install = (agent) => {
        if (installed.has(agent) || agent.session.header.origin === 'subagent' || !ctx.agents.roots().includes(agent))
            return;
        if (ctx.tools.get(PTC_TRANSPORT, agent) !== undefined) {
            ctx.logger.info(`inline-stream not offered to ${agent.session.id}: its tools are presented through PTC`);
            return;
        }
        const scoped = agent.ctx;
        const disposers = [
            scoped.systemPrompt.section({
                name: 'intelligent-ui:inline',
                order: scoped.systemPrompt.getSectionOrder('TOOL_REPORT') + 50,
                text: INLINE_PROMPT,
                interpolate: false,
            }),
            scoped.tools.register(tool),
        ];
        installed.set(agent, () => { for (const dispose of disposers.reverse())
            dispose(); });
    };
    for (const agent of ctx.agents.list())
        install(agent);
    ctx.on('agent/created', ({ agent }) => { install(agent); });
    ctx.on('agent/disposed', ({ agent }) => { installed.delete(agent); });
    ctx.effect(() => () => {
        for (const dispose of installed.values())
            dispose();
        installed.clear();
    }, 'intelligentUi.inlineTool');
}
//# sourceMappingURL=inline-tool.js.map