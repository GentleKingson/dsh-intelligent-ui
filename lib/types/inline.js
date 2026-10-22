/**
 * `inline-stream` mode: the root agent's own model writes view data as the
 * arguments of one native tool call. Host and Client share this module, so
 * the streamed preview, the settled view, and the Host's tool result apply the
 * exact same rules. Client-safe: no Host imports.
 */
import { z } from 'zod';
import { analyzeColumn } from "./numeric.js";
import { BindingError, bindChart } from "./program.js";
import { LIMITS } from "./limits.js";
/** Wire name of the view tool; also the Client toolview key. */
export const INLINE_TOOL_NAME = 'render_ui';
/** Agent-level guidance registered beside the tool for root agents only. */
export const INLINE_PROMPT = `# Interactive view (render_ui)
Call render_ui whenever the main content of your answer is one of: 2+ options, tools, or approaches compared on the same aspects (cards, or a table of option x aspect); a list of 4+ items that share the same fields (a table, e.g. codes with meaning and usage); or numeric data (a table, plus a chart when there is a trend or comparison). Keep plain Markdown for explanations, how-tos, code, and short or conversational answers.
When you call it: first write a short plain-Markdown answer (1-3 sentences stating the conclusion) so the reply stays readable without the view, then call render_ui once with the structured data. Make the first item a markdown component restating that conclusion in one short sentence (at most two lines): your text before the call is folded once the turn ends, so the view must carry it. Put the data only in the tool arguments, not again in your text. A successful call ends your turn; if it fails, answer in plain Markdown instead.
Rules: text is plain Markdown without HTML, images, or scripts. Every table/chart row has exactly one cell per header. Chart series columns hold plain numbers sharing one unit (e.g. "1,200", "12.5%", or "—" for missing). A line chart needs an increasing time/sequence category column (2025-01, Q1, 1月, years); otherwise use bar. Unless the user asks for an image file, draw charts with render_ui rather than plotting them to images.
When the numbers depend on an assumption the reader may want to vary (growth rate, interest rate, plan tier), you may use one scenarios item: 2-4 named options, each holding the same components computed under that option, so the reader can switch between them. Never use it for options that are simply compared side by side.`;
const ALIGN = ['left', 'center', 'right', 'none'];
const cell = z.union([z.string(), z.number().refine(Number.isFinite)]).transform(String);
const headers = z.array(z.string().min(1)).min(2).max(LIMITS.tableColumns);
const rows = z.array(z.array(cell).max(LIMITS.tableColumns)).max(LIMITS.tableRows);
const markdown = z.string().min(1);
const itemSchema = z.discriminatedUnion('type', [
    z.strictObject({ type: z.literal('markdown'), markdown }),
    z.strictObject({
        type: z.literal('cards'),
        cards: z.array(z.strictObject({ title: z.string().min(1).max(120), markdown })).min(2).max(LIMITS.cards),
    }),
    z.strictObject({
        type: z.literal('table'),
        headers,
        rows: rows.min(1),
        align: z.array(z.enum(ALIGN)).max(LIMITS.tableColumns).optional(),
    }),
    z.strictObject({
        type: z.literal('chart'),
        chart: z.enum(['bar', 'line']),
        headers,
        rows: rows.min(2),
        // Follow-up turns sometimes omit it; real outputs always put the categories in column 0.
        x: z.number().int().nonnegative().default(0),
        series: z.array(z.number().int().nonnegative()).min(1).max(LIMITS.chartSeries),
    }),
]);
/** JSON Schema of the tool arguments as the model sees it. */
export const INLINE_PARAMETERS = {
    type: 'object',
    additionalProperties: false,
    required: ['items'],
    properties: {
        items: {
            type: 'array',
            description: `1-${LIMITS.items} components, in display order; start with a markdown conclusion, then at least one table, chart, or cards item. Each is one of: `
                + '{"type":"markdown","markdown":string}; '
                + `{"type":"cards","cards":[{"title":string,"markdown":string}, ...2-${LIMITS.cards}]}; `
                + '{"type":"table","headers":[string...],"rows":[[cell...]...],"align"?:["left"|"center"|"right"|"none"...]}; '
                + '{"type":"chart","chart":"bar"|"line","headers":[string...],"rows":[[cell...]...],"x":<category column index>,"series":[<numeric column index>...1-4]}; '
                + `{"type":"scenarios","label":string,"options":[{"name":string,"items":[1-${LIMITS.scenarioItems} of the components above]}, ...2-${LIMITS.scenarioOptions}]}.`,
            items: { type: 'object' },
        },
    },
};
const scenariosSchema = z.strictObject({
    type: z.literal('scenarios'),
    label: z.string().min(1).max(60),
    options: z.array(z.strictObject({
        name: z.string().min(1).max(40),
        items: z.array(z.unknown()).min(1).max(LIMITS.scenarioItems),
    })).min(2).max(LIMITS.scenarioOptions),
});
/** Raw HTML, images, and script-capable link schemes never reach the renderer. */
const UNSAFE_MARKDOWN = [/<[A-Za-z!/?]/, /!\[/, /\]\(\s*<?\s*(?:javascript|vbscript|data):/i];
const UNSAFE = 'HTML, image, or script content is not allowed';
// Code spans and fences show their text literally, so `Arc<Mutex<_>>` or `git restore <file>` is not markup.
// A backslash-escaped backtick opens no span, so escaping cannot hide a tag from the check.
const CODE = /(?<!\\)(`+)[\s\S]*?[^`]\1(?!`)/g;
const unsafe = (text) => {
    const prose = text.replace(CODE, '');
    return UNSAFE_MARKDOWN.some(pattern => pattern.test(prose));
};
function unsafeText(item) {
    const texts = item.type === 'markdown' ? [item.markdown]
        : item.type === 'cards' ? item.cards.flatMap(card => [card.title, card.markdown])
            : [...item.headers, ...item.rows.flat()];
    return texts.some(unsafe);
}
function consistent(width, data, what) {
    const bad = data.findIndex(row => row.length !== width);
    if (bad >= 0)
        throw new BindingError(`${what} row ${bad} has ${data[bad]?.length} cells for ${width} headers`);
}
function inferType(item) {
    return ['chart', 'markdown', 'cards'].find(key => key in item) ?? ('rows' in item ? 'table' : 'options' in item ? 'scenarios' : undefined);
}
// Follow-up turns sometimes drop "type"; an item's own keys already name it, and the strict schema still checks the rest.
const withType = (value) => typeof value === 'object' && value !== null && !('type' in value) ? { type: inferType(value), ...value } : value;
/** As in smart-auto, a table repeating a chart's own data stays reachable through the chart's data toggle. */
function dropChartedTables(items) {
    const tableKey = (table) => JSON.stringify([table.headers, table.rows]);
    const charted = new Set(items.flatMap(item => item.type === 'chart' ? [tableKey(item.table)] : []));
    return items.filter(item => item.type !== 'table' || !charted.has(tableKey(item.table)));
}
/**
 * Validate and resolve one component written by the model.
 * @param value - one parsed element of the `items` array.
 * @returns the resolved item or a rejection; a rejection never renders.
 */
export function resolveInlineItem(value) {
    const typed = withType(value);
    if (typeof typed !== 'object' || typed === null || !('type' in typed) || typed.type !== 'scenarios')
        return resolveBasicItem(typed);
    const parsed = scenariosSchema.safeParse(typed);
    if (!parsed.success)
        return { ok: false, detail: `schema: ${parsed.error.issues[0]?.message ?? 'rejected'}` };
    const { label, options } = parsed.data;
    const names = options.map(option => option.name);
    if ([label, ...names].some(unsafe))
        return { ok: false, detail: UNSAFE };
    if (new Set(names).size !== names.length)
        return { ok: false, detail: 'scenario option names must differ' };
    const resolved = [];
    for (const [index, option] of options.entries()) {
        const items = [];
        for (const [at, raw] of option.items.entries()) {
            // Options hold basic components only, so scenarios never nest.
            const outcome = resolveBasicItem(withType(raw));
            if (!outcome.ok)
                return { ok: false, detail: `option ${index} item ${at}: ${outcome.detail}` };
            items.push(outcome.item);
        }
        resolved.push({ name: option.name, items: dropChartedTables(items) });
    }
    return { ok: true, item: { type: 'scenarios', label, options: resolved } };
}
function resolveBasicItem(typed) {
    const parsed = itemSchema.safeParse(typed);
    if (!parsed.success)
        return { ok: false, detail: `schema: ${parsed.error.issues[0]?.message ?? 'rejected'}` };
    const item = parsed.data;
    if (unsafeText(item))
        return { ok: false, detail: UNSAFE };
    try {
        switch (item.type) {
            case 'markdown': return { ok: true, item };
            case 'cards': return { ok: true, item: { type: 'cards', cards: item.cards } };
            case 'table': {
                consistent(item.headers.length, item.rows, 'table');
                const align = item.align ?? item.headers.map(() => 'none');
                if (align.length !== item.headers.length)
                    throw new BindingError('table align does not match headers');
                return { ok: true, item: { type: 'table', table: { headers: item.headers, align, rows: item.rows } } };
            }
            case 'chart': {
                consistent(item.headers.length, item.rows, 'chart');
                const data = { headers: item.headers, align: item.headers.map(() => 'none'), rows: item.rows };
                const columns = item.headers.map((header, index) => ({
                    id: `c${index}`, header, analysis: analyzeColumn(item.rows.map(row => row[index] ?? '')),
                }));
                return { ok: true, item: bindChart({ data, columns }, { chart: item.chart, x: `c${item.x}`, series: item.series.map(index => `c${index}`) }) };
            }
        }
    }
    catch (error) {
        if (error instanceof BindingError)
            return { ok: false, detail: error.message };
        throw error;
    }
}
const OVER_LIMIT = `arguments exceed ${LIMITS.inlineArgsBytes} bytes`;
const overLimit = (text) => new TextEncoder().encode(text).length > LIMITS.inlineArgsBytes;
/**
 * Validate complete tool arguments, as the Host executes them and as the
 * Client re-reads a settled call.
 * @param args - parsed tool arguments.
 * @returns all resolved items, or the first rejection.
 */
export function validateInlineArgs(args) {
    if (overLimit(JSON.stringify(args) ?? ''))
        return { ok: false, detail: OVER_LIMIT };
    const top = z.strictObject({ items: z.array(z.unknown()).min(1).max(LIMITS.items) }).safeParse(args);
    if (!top.success)
        return { ok: false, detail: `schema: ${top.error.issues[0]?.message ?? 'rejected'}` };
    const items = [];
    for (const [index, value] of top.data.items.entries()) {
        const outcome = resolveInlineItem(value);
        if (!outcome.ok)
            return { ok: false, detail: `item ${index}: ${outcome.detail}` };
        items.push(outcome.item);
    }
    // Text before the call is folded once the turn ends, so the view itself must open with the conclusion.
    if (items[0]?.type !== 'markdown')
        return { ok: false, detail: 'start with a markdown conclusion' };
    // A call ends the turn, so a Markdown-only view would replace the data the answer was meant to show.
    if (items.every(item => item.type === 'markdown'))
        return { ok: false, detail: 'add at least one table, chart, or cards item' };
    return { ok: true, items: dropChartedTables(items) };
}
/**
 * Parse settled raw arguments text.
 * @param raw - the recorded call arguments.
 * @returns the validated items or a rejection.
 */
export function readInlineArgs(raw) {
    // Recorded arguments come from history too; never parse past the limit.
    if (overLimit(raw))
        return { ok: false, detail: OVER_LIMIT };
    let value;
    try {
        value = JSON.parse(raw);
    }
    catch {
        return { ok: false, detail: 'arguments are not one JSON value' };
    }
    return validateInlineArgs(value);
}
/**
 * Incremental scanner over the raw argument prefix of a preparing call. It
 * resumes where it stopped, cuts out each element of the top-level `items`
 * array once its closing bracket arrives, and validates that element alone.
 * Open elements are never parsed or shown.
 */
export class InlineArgsStream {
    pos = 0;
    depth = 0;
    inString = false;
    escape = false;
    /** Inside the top-level object, the next string is a key. */
    expectKey = false;
    keyStart = -1;
    lastKey = '';
    itemsDepth = -1;
    elementStart = -1;
    closed = false;
    overLimit = false;
    items = [];
    snapshot = { items: [], closed: false, overLimit: false };
    source = '';
    /**
     * Advance over a longer prefix of the same arguments text.
     * @param raw - the current raw argument prefix.
     * @returns an identity-stable snapshot that changes only when it gains content.
     */
    feed(raw) {
        // The prefix only grows; any other text restarts the scan.
        if (!raw.startsWith(this.source))
            this.reset();
        this.source = raw;
        const before = this.items.length;
        const wasClosed = this.closed;
        const wasOver = this.overLimit;
        // Same UTF-8 measure as the final check, so a preview never shows what the call will reject for size.
        if (overLimit(raw))
            this.overLimit = true;
        for (; this.pos < raw.length && !this.closed && !this.overLimit; this.pos++)
            this.step(raw, this.pos);
        if (this.items.length !== before || this.closed !== wasClosed || this.overLimit !== wasOver) {
            this.snapshot = { items: [...this.items], closed: this.closed, overLimit: this.overLimit };
        }
        return this.snapshot;
    }
    reset() {
        Object.assign(this, {
            pos: 0, depth: 0, inString: false, escape: false, expectKey: false, keyStart: -1, lastKey: '',
            itemsDepth: -1, elementStart: -1, closed: false, overLimit: false, items: [], source: '',
            snapshot: { items: [], closed: false, overLimit: false },
        });
    }
    step(raw, index) {
        const char = raw[index];
        if (this.inString) {
            if (this.escape)
                this.escape = false;
            else if (char === '\\')
                this.escape = true;
            else if (char === '"') {
                this.inString = false;
                if (this.keyStart >= 0) {
                    this.lastKey = raw.slice(this.keyStart, index);
                    this.keyStart = -1;
                }
            }
            return;
        }
        const inItems = this.itemsDepth >= 0 && this.depth === this.itemsDepth;
        if (inItems && this.elementStart < 0 && char !== undefined && !/[\s,\]]/.test(char))
            this.elementStart = index;
        switch (char) {
            case '"':
                this.inString = true;
                if (this.depth === 1 && this.expectKey) {
                    this.keyStart = index + 1;
                    this.expectKey = false;
                }
                return;
            case '{':
            case '[':
                this.depth++;
                if (this.depth === 1)
                    this.expectKey = true;
                if (char === '[' && this.depth === 2 && this.lastKey === 'items' && this.itemsDepth < 0)
                    this.itemsDepth = 2;
                return;
            case '}':
            case ']':
                this.depth--;
                if (this.itemsDepth >= 0 && this.depth === this.itemsDepth && this.elementStart >= 0)
                    this.emit(raw, index + 1);
                else if (inItems && char === ']') {
                    if (this.elementStart >= 0)
                        this.emit(raw, index);
                    this.closed = true;
                }
                return;
            case ',':
                if (this.depth === 1)
                    this.expectKey = true;
                if (inItems && this.elementStart >= 0)
                    this.emit(raw, index);
                return;
            default:
        }
    }
    emit(raw, end) {
        const text = raw.slice(this.elementStart, end);
        this.elementStart = -1;
        if (this.items.length >= LIMITS.items) {
            this.overLimit = true;
            return;
        }
        let value;
        try {
            value = JSON.parse(text);
        }
        catch {
            this.items.push({ ok: false, detail: 'element is not one JSON value' });
            return;
        }
        this.items.push(resolveInlineItem(value));
    }
}
//# sourceMappingURL=inline.js.map