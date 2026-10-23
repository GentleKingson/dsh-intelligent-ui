/**
 * `inline-stream` mode: the root agent's own model writes view data as the
 * arguments of one native tool call. Host and Client share this module, so
 * the streamed preview, the settled view, and the Host's tool result apply the
 * exact same rules. Client-safe: no Host imports.
 */
import { z } from 'zod';
import { analyzeColumn } from "./numeric.js";
import { BindingError, bindChart, bindTable } from "./program.js";
import { LIMITS } from "./limits.js";
import { bindExplorer } from "./explorer.js";
import { bindCalculator } from "./formula.js";
/** Wire name of the view tool; also the Client toolview key. */
export const INLINE_TOOL_NAME = 'render_ui';
/** Agent-level guidance registered beside the tool for root agents only. */
export const INLINE_PROMPT = `# Interactive view (render_ui)
Call render_ui whenever the main content of your answer is one of: 2+ options, tools, or approaches compared on the same aspects (cards, or a table of option x aspect); a list of 4+ items that share the same fields (a table, e.g. codes with meaning and usage); numeric data (a table, plus a chart when there is a trend or comparison); or a calculation the reader wants to adjust (a calculator). Keep plain Markdown for explanations, how-tos, code, and short or conversational answers.
render_ui directly renders the supplied data inside this conversation; the call is the whole implementation. Build the view only from data in the request and your own knowledge. To prepare or check a view, never install packages, run benchmarks or measurement scripts, generate sample data files, inspect the DSH application, its bundles, or this plugin's sources and README, write HTML/JS files, or take screenshots: none of it is needed, and it costs the user minutes. If a figure is not given, state it qualitatively or as an estimate instead of measuring it. When the user has supplied complete data for a view, call it directly.
Supported: markdown, cards, sortable/filterable tables, comparison tables, bar/line charts, precomputed scenarios, one explorer (filters, keyword search, count/mean summaries, record details, scatterplot or retry timeline), and calculators (sliders/number boxes/option buttons whose results recompute live from arithmetic formulas). Not supported: code editors or runnable code, images, uploads, drag/zoom, animation. For code, use fenced code blocks inside markdown or card items, e.g. one card per option. When a request needs something unsupported, use the closest supported component and state the limitation in one sentence; never build it yourself.
When you call it: first write a short plain-Markdown answer (1-3 sentences stating the conclusion) so the reply stays readable without the view, then call render_ui once with the structured data. Make the first item a markdown component restating that conclusion in one short sentence (at most two lines): your text before the call is folded once the turn ends, so the view must carry it. Put the data only in the tool arguments, not again in your text. A successful call ends your turn; if it fails, answer in plain Markdown instead.
Rules: text is plain Markdown without HTML, images, or scripts. Table, chart and explorer cells are plain text: no Markdown emphasis such as **bold**; to mark changed or new values, add a note column (e.g. 备注: 已修订 2000→2100). Every table/chart row has exactly one cell per header. Chart series columns hold plain numbers sharing one unit (e.g. "1,200", "12.5%", or "—" for missing); a partial period such as a year with only Q1 is a series with "—" for the rest, and a series that cannot share the axis is shown only in the data table. A line chart needs an increasing time/sequence category column (2025-01, Q1, 1月, years); otherwise use bar. Unless the user asks for an image file, draw charts with render_ui rather than plotting them to images.
For 2-4 options compared on shared aspects, prefer a table with presentation: "comparison": column 0 names each option, and the remaining columns are its aspects. It shows selectable options with source details and the full table on demand. Use ordinary tables for longer lists or when the user needs rows, sorting, or filtering. A short opening conclusion and one chart/table form a responsive explanation-plus-view layout; avoid extra components repeating the same data.
When the numbers depend on an assumption the reader may want to vary (growth rate, interest rate, plan tier), you may use one scenarios item: 2-4 named options, each holding the same components computed under that option, so the reader can switch between them. Never use it for options that are simply compared side by side.
For combined filters, selected-record explanations, or a step-by-step inspector, prefer ONE explorer component over independent scenarios, repeated cards or duplicated tables. Supply its source rows once. filters are ANDed; optional filters allow All. selection names a record/step column. For alternative execution scenarios, put both scenarios in the same table, use a scenario filter with all:false, selection:<attempt column>, steps:true: switching scenario preserves the selected attempt and updates ALL fields, including explanation and destination. That selection column must be unique within each required-filter combination. For samples, use optional species/sex filters and selection:<original row id>.
Explorer metrics are computed locally from the filtered rows: count without a column counts rows, count with a column counts numeric non-missing cells, mean excludes missing cells and may groupBy a column. Use mean only for measured quantities a reader would average; never for years, ids, step numbers or illustrative values (such means are dropped). Include units in metric labels. Preserve NA/未公布; never replace them with zero. Put per-record explanations in source cells so they change with the selection. The explorer already provides a keyword search, filters, metrics, selection, complete record details, and a selectable source table (open by default when the explorer has no plot, collapsed otherwise), all sharing one state. A linked answer should contain ONE explorer plus short Markdown only: do not add separate tables, cards, charts or scenarios alongside it, because their controls have independent state. When a scatterplot is requested, add plot:{type:"scatter",x:<numeric column>,y:<different numeric column>,groupBy:<optional category column>} to this SAME explorer. Each axis may have its own unit; never treat x and y as same-unit chart series. Points with either coordinate missing are omitted, never zero-filled; source rows remain selectable. Plot counts report rows with both coordinates. For retry timelines, use plot:{type:"timeline",x:<numeric attempt time column>,groupBy:<optional scenario column>}, steps:true and a required scenario filter. Times must be nonnegative and strictly increasing within each scenario/group. The timeline uses proportional time positions and labels consecutive intervals; use zero-duration task attempts only when the input says so. For retry inspectors, use a row count metric only unless other summaries are explicitly requested; do not average cumulative waiting or retry budgets. Time is the start of the selected attempt. A wait-to-next column describes a future interval after its failure, not elapsed time already spent. With zero-duration tasks, cumulative elapsed waiting equals the attempt start time; never add its future wait to elapsed waiting. Name budget fields explicitly as before or after the current retry decision, and state terminal no-further-wait as 0 or not applicable. Grouping supports up to four categories, with stable colors and shapes. Plot marks, filters, record dropdown, source-table selection and stepper all share selection; do not emit a standalone chart for these cases. Drag/zoom, animation and general Gantt schedules are not supported.
For a calculator or any result the reader should recompute from numbers they adjust (loan payment, compound growth, pricing, break-even, unit conversion), use ONE calculator item instead of precomputed grids or scenarios. It stands alone, never inside scenarios. inputs: {id, label, unit?, value (default), min, max, step?} for a continuous value (value must be min plus a whole number of steps) (slider plus number box), or {id, label, unit?, value, options:[numbers]} for 2-8 discrete choices. outputs: {id?, label, unit?, formula, decimals?} in display order; a formula reads input ids and the ids of earlier outputs. Formula syntax: numbers, + - * / %, ^ for power, parentheses, comparisons and c ? a : b, and min max abs round floor ceil sqrt pow exp ln log10. Write rates as the reader sees them (e.g. rate 3.5 for 3.5%) and convert in the formula (rate / 100 / 12). Add intermediate outputs with an id and hidden: true for reused terms (e.g. monthly rate, number of periods), so only the results the reader asked for are shown, and keep every output finite at the defaults and across the input ranges. State the default result in the markdown conclusion; it must equal the calculator's output at the defaults. When the reader should see how a result develops (balance per year, payment schedule, growth curve), add series to the SAME calculator: x names an index variable that runs from the formula from to the formula to by step (e.g. x:"y", from:"0", to:"years"), label is its column header, and each column formula reads inputs, output ids and x; chart:"line" (or "bar") draws the columns that share the first column's unit, and the full rows stay under the chart's data toggle. At most 200 rows; never add a separate table or chart for these rows.`;
const ALIGN = ['left', 'center', 'right', 'none'];
// Cells render as plain text; a model marking a change as **2100** would show the asterisks and lose the number.
const BOLD_CELL = /^\s*\*\*(?!\*)([\s\S]*?\S)\*\*\s*$/;
const cell = z.union([z.string(), z.number().refine(Number.isFinite)]).transform(value => {
    const text = String(value);
    const inner = BOLD_CELL.exec(text)?.[1];
    return inner === undefined || inner.includes('**') ? text : inner;
});
const headers = z.array(z.string().min(1)).min(2).max(LIMITS.tableColumns);
const rows = z.array(z.array(cell).max(LIMITS.tableColumns)).max(LIMITS.tableRows);
const markdown = z.string().min(1);
const column = z.number().int().nonnegative();
const explorerSchema = z.strictObject({
    type: z.literal('explorer'),
    title: z.string().min(1).max(120),
    headers,
    rows: rows.min(1),
    selection: column,
    filters: z.array(z.strictObject({ column, all: z.boolean().default(true) })).max(2).default([]),
    metrics: z.array(z.discriminatedUnion('op', [
        z.strictObject({ op: z.literal('count'), label: z.string().min(1).max(60), column: column.optional() }),
        z.strictObject({ op: z.literal('mean'), label: z.string().min(1).max(60), column, groupBy: column.optional() }),
    ])).max(3).default([]),
    steps: z.boolean().default(false),
    plot: z.discriminatedUnion('type', [
        z.strictObject({ type: z.literal('scatter'), x: column, y: column, groupBy: column.optional() }),
        z.strictObject({ type: z.literal('timeline'), x: column, groupBy: column.optional() }),
    ]).optional(),
});
const identifier = z.string().min(1).max(32);
const calculatorSchema = z.strictObject({
    type: z.literal('calculator'),
    title: z.string().min(1).max(120),
    inputs: z.array(z.strictObject({
        id: identifier,
        label: z.string().min(1).max(60),
        unit: z.string().max(20).optional(),
        value: z.number().refine(Number.isFinite),
        min: z.number().refine(Number.isFinite).optional(),
        max: z.number().refine(Number.isFinite).optional(),
        step: z.number().positive().refine(Number.isFinite).optional(),
        options: z.array(z.number().refine(Number.isFinite)).min(2).max(8).optional(),
    })).min(1).max(6),
    outputs: z.array(z.strictObject({
        id: identifier.optional(),
        label: z.string().min(1).max(60),
        unit: z.string().max(20).optional(),
        formula: z.string().min(1).max(400),
        decimals: z.number().int().min(0).max(6).default(2),
        hidden: z.boolean().optional(),
    })).min(1).max(8).refine(outputs => outputs.some(output => output.hidden !== true), 'at least one output must be shown'),
    series: z.strictObject({
        x: identifier,
        label: z.string().min(1).max(60),
        from: z.string().min(1).max(400),
        to: z.string().min(1).max(400),
        step: z.number().positive().refine(Number.isFinite).default(1),
        chart: z.enum(['bar', 'line']).optional(),
        columns: z.array(z.strictObject({
            label: z.string().min(1).max(60),
            unit: z.string().max(20).optional(),
            formula: z.string().min(1).max(400),
            decimals: z.number().int().min(0).max(6).default(2),
        })).min(1).max(LIMITS.chartSeries),
    }).optional(),
});
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
        presentation: z.literal('comparison').optional(),
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
                + '{"type":"table","headers":[string...],"rows":[[cell...]...],"align"?:["left"|"center"|"right"|"none"...],"presentation"?:"comparison" (2-4 named options in column 0)}; '
                + '{"type":"chart","chart":"bar"|"line","headers":[string...],"rows":[[cell...]...],"x":<category column index>,"series":[<numeric column index>...1-4]}; '
                + '{"type":"calculator","title":string,"inputs":[{"id":string,"label":string,"unit"?:string,"value":number,"min":number,"max":number,"step"?:number}|{"id":string,"label":string,"unit"?:string,"value":number,"options":[number...2-8]}, ...1-6],"outputs":[{"id"?:string,"label":string,"unit"?:string,"formula":string,"decimals"?:0-6,"hidden"?:true}, ...1-8],"series"?:{"x":string,"label":string,"from":string,"to":string,"step"?:number,"chart"?:"line"|"bar","columns":[{"label":string,"unit"?:string,"formula":string,"decimals"?:0-6}, ...1-4]}}; '
                + '{"type":"explorer","title":string,"headers":[string...],"rows":[[cell...]...],"selection":<record/step column index>,"filters"?:[{"column":<index>,"all"?:true|false}, ...0-2],"metrics"?:[{"op":"count","label":string,"column"?:<numeric index>}|{"op":"mean","label":string,"column":<numeric index>,"groupBy"?:<index>}, ...0-3],"steps"?:true|false,"plot"?:{"type":"scatter","x":<numeric index>,"y":<different numeric index>,"groupBy"?:<index>}|{"type":"timeline","x":<nonnegative increasing attempt time index>,"groupBy"?:<index>}}; '
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
    return 'selection' in item ? 'explorer' : 'outputs' in item ? 'calculator'
        : ['chart', 'markdown', 'cards'].find(key => key in item) ?? ('rows' in item ? 'table' : 'options' in item ? 'scenarios' : undefined);
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
    if (typeof typed === 'object' && typed !== null && 'type' in typed && typed.type === 'calculator') {
        const parsed = calculatorSchema.safeParse(typed);
        if (!parsed.success)
            return { ok: false, detail: `schema: ${parsed.error.issues[0]?.message ?? 'rejected'}` };
        const item = parsed.data;
        const texts = [
            item.title, ...item.inputs.flatMap(input => [input.label, input.unit ?? '']), ...item.outputs.flatMap(output => [output.label, output.unit ?? '']),
            item.series?.label ?? '', ...(item.series?.columns ?? []).flatMap(column => [column.label, column.unit ?? '']),
        ];
        if (texts.some(unsafe))
            return { ok: false, detail: UNSAFE };
        try {
            return { ok: true, item: bindCalculator(item) };
        }
        catch (error) {
            if (error instanceof BindingError)
                return { ok: false, detail: error.message };
            throw error;
        }
    }
    if (typeof typed === 'object' && typed !== null && 'type' in typed && typed.type === 'explorer') {
        const parsed = explorerSchema.safeParse(typed);
        if (!parsed.success)
            return { ok: false, detail: `schema: ${parsed.error.issues[0]?.message ?? 'rejected'}` };
        const { headers, rows, ...config } = parsed.data;
        if ([config.title, ...headers, ...rows.flat(), ...config.metrics.map(metric => metric.label)].some(unsafe)) {
            return { ok: false, detail: UNSAFE };
        }
        try {
            consistent(headers.length, rows, 'explorer');
            return { ok: true, item: bindExplorer({ ...config, table: { headers, rows, align: headers.map(() => 'none') } }) };
        }
        catch (error) {
            if (error instanceof BindingError)
                return { ok: false, detail: error.message };
            throw error;
        }
    }
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
            const typedRaw = withType(raw);
            const kind = typeof typedRaw === 'object' && typedRaw !== null && 'type' in typedRaw ? typedRaw.type : undefined;
            if (kind === 'calculator' || kind === 'explorer' || kind === 'scenarios') {
                return { ok: false, detail: `option ${index} item ${at}: a ${String(kind)} cannot go inside scenarios; options hold markdown, cards, table or chart, and a ${String(kind)} stands alone` };
            }
            const outcome = resolveBasicItem(typedRaw);
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
                return { ok: true, item: bindTable({ headers: item.headers, align, rows: item.rows }, item.presentation) };
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
        return { ok: false, detail: 'add at least one table, chart, cards, explorer or calculator item' };
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