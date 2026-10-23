/**
 * `inline-stream` mode: the root agent's own model writes view data as the
 * arguments of one native tool call. Host and Client share this module, so
 * the streamed preview, the settled view, and the Host's tool result apply the
 * exact same rules. Client-safe: no Host imports.
 */
import type { IntelligentUiItem } from './types.ts';
/** Wire name of the view tool; also the Client toolview key. */
export declare const INLINE_TOOL_NAME = "render_ui";
/** Agent-level guidance registered beside the tool for root agents only. */
export declare const INLINE_PROMPT = "# Interactive view (render_ui)\nCall render_ui whenever the main content of your answer is one of: 2+ options, tools, or approaches compared on the same aspects (cards, or a table of option x aspect); a list of 4+ items that share the same fields (a table, e.g. codes with meaning and usage); or numeric data (a table, plus a chart when there is a trend or comparison). Keep plain Markdown for explanations, how-tos, code, and short or conversational answers.\nrender_ui directly renders the supplied data inside this conversation; the call is the whole implementation. Build the view only from data in the request and your own knowledge. To prepare or check a view, never install packages, run benchmarks or measurement scripts, generate sample data files, inspect the DSH application, its bundles, or this plugin's sources and README, write HTML/JS files, or take screenshots: none of it is needed, and it costs the user minutes. If a figure is not given, state it qualitatively or as an estimate instead of measuring it. When the user has supplied complete data for a view, call it directly.\nSupported: markdown, cards, sortable/filterable tables, comparison tables, bar/line charts, precomputed scenarios, and one explorer (filters, keyword search, count/mean summaries, record details, scatterplot or retry timeline). Not supported: live formulas or free numeric inputs, code editors or runnable code, images, uploads, drag/zoom, animation. For a calculator, precompute a small grid of input combinations as explorer rows or scenarios and say in one sentence which inputs are fixed. For code, use fenced code blocks inside markdown or card items, e.g. one card per option. When a request needs something unsupported, use the closest supported component and state the limitation in one sentence; never build it yourself.\nWhen you call it: first write a short plain-Markdown answer (1-3 sentences stating the conclusion) so the reply stays readable without the view, then call render_ui once with the structured data. Make the first item a markdown component restating that conclusion in one short sentence (at most two lines): your text before the call is folded once the turn ends, so the view must carry it. Put the data only in the tool arguments, not again in your text. A successful call ends your turn; if it fails, answer in plain Markdown instead.\nRules: text is plain Markdown without HTML, images, or scripts. Table, chart and explorer cells are plain text: no Markdown emphasis such as **bold**; to mark changed or new values, add a note column (e.g. \u5907\u6CE8: \u5DF2\u4FEE\u8BA2 2000\u21922100). Every table/chart row has exactly one cell per header. Chart series columns hold plain numbers sharing one unit (e.g. \"1,200\", \"12.5%\", or \"\u2014\" for missing); a partial period such as a year with only Q1 is a series with \"\u2014\" for the rest, and a series that cannot share the axis is shown only in the data table. A line chart needs an increasing time/sequence category column (2025-01, Q1, 1\u6708, years); otherwise use bar. Unless the user asks for an image file, draw charts with render_ui rather than plotting them to images.\nFor 2-4 options compared on shared aspects, prefer a table with presentation: \"comparison\": column 0 names each option, and the remaining columns are its aspects. It shows selectable options with source details and the full table on demand. Use ordinary tables for longer lists or when the user needs rows, sorting, or filtering. A short opening conclusion and one chart/table form a responsive explanation-plus-view layout; avoid extra components repeating the same data.\nWhen the numbers depend on an assumption the reader may want to vary (growth rate, interest rate, plan tier), you may use one scenarios item: 2-4 named options, each holding the same components computed under that option, so the reader can switch between them. Never use it for options that are simply compared side by side.\nFor combined filters, selected-record explanations, or a step-by-step inspector, prefer ONE explorer component over independent scenarios, repeated cards or duplicated tables. Supply its source rows once. filters are ANDed; optional filters allow All. selection names a record/step column. For alternative execution scenarios, put both scenarios in the same table, use a scenario filter with all:false, selection:<attempt column>, steps:true: switching scenario preserves the selected attempt and updates ALL fields, including explanation and destination. That selection column must be unique within each required-filter combination. For samples, use optional species/sex filters and selection:<original row id>.\nExplorer metrics are computed locally from the filtered rows: count without a column counts rows, count with a column counts numeric non-missing cells, mean excludes missing cells and may groupBy a column. Use mean only for measured quantities a reader would average; never for years, ids, step numbers or illustrative values (such means are dropped). Include units in metric labels. Preserve NA/\u672A\u516C\u5E03; never replace them with zero. Put per-record explanations in source cells so they change with the selection. The explorer already provides a keyword search, filters, metrics, selection, complete record details, and a selectable source table (open by default when the explorer has no plot, collapsed otherwise), all sharing one state. A linked answer should contain ONE explorer plus short Markdown only: do not add separate tables, cards, charts or scenarios alongside it, because their controls have independent state. When a scatterplot is requested, add plot:{type:\"scatter\",x:<numeric column>,y:<different numeric column>,groupBy:<optional category column>} to this SAME explorer. Each axis may have its own unit; never treat x and y as same-unit chart series. Points with either coordinate missing are omitted, never zero-filled; source rows remain selectable. Plot counts report rows with both coordinates. For retry timelines, use plot:{type:\"timeline\",x:<numeric attempt time column>,groupBy:<optional scenario column>}, steps:true and a required scenario filter. Times must be nonnegative and strictly increasing within each scenario/group. The timeline uses proportional time positions and labels consecutive intervals; use zero-duration task attempts only when the input says so. For retry inspectors, use a row count metric only unless other summaries are explicitly requested; do not average cumulative waiting or retry budgets. Time is the start of the selected attempt. A wait-to-next column describes a future interval after its failure, not elapsed time already spent. With zero-duration tasks, cumulative elapsed waiting equals the attempt start time; never add its future wait to elapsed waiting. Name budget fields explicitly as before or after the current retry decision, and state terminal no-further-wait as 0 or not applicable. Grouping supports up to four categories, with stable colors and shapes. Plot marks, filters, record dropdown, source-table selection and stepper all share selection; do not emit a standalone chart for these cases. Continuous formulas, drag/zoom, animation and general Gantt schedules are not supported.";
/** JSON Schema of the tool arguments as the model sees it. */
export declare const INLINE_PARAMETERS: {
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["items"];
    readonly properties: {
        readonly items: {
            readonly type: "array";
            readonly description: string;
            readonly items: {
                readonly type: "object";
            };
        };
    };
};
type Outcome<T> = {
    readonly ok: true;
    readonly item: T;
} | {
    readonly ok: false;
    readonly detail: string;
};
/** One component outcome: a resolved view item, or why it was rejected. */
export type InlineItemOutcome = Outcome<IntelligentUiItem>;
/**
 * Validate and resolve one component written by the model.
 * @param value - one parsed element of the `items` array.
 * @returns the resolved item or a rejection; a rejection never renders.
 */
export declare function resolveInlineItem(value: unknown): InlineItemOutcome;
/** Whole-call outcome: every component must pass, or the call is rejected. */
export type InlineArgsOutcome = {
    readonly ok: true;
    readonly items: readonly IntelligentUiItem[];
} | {
    readonly ok: false;
    readonly detail: string;
};
/**
 * Validate complete tool arguments, as the Host executes them and as the
 * Client re-reads a settled call.
 * @param args - parsed tool arguments.
 * @returns all resolved items, or the first rejection.
 */
export declare function validateInlineArgs(args: unknown): InlineArgsOutcome;
/**
 * Parse settled raw arguments text.
 * @param raw - the recorded call arguments.
 * @returns the validated items or a rejection.
 */
export declare function readInlineArgs(raw: string): InlineArgsOutcome;
/** What the streamed prefix shows so far. */
export interface InlineStreamSnapshot {
    /** Closed components, in order; rejected ones never render. */
    readonly items: readonly InlineItemOutcome[];
    /** The `items` array has closed. */
    readonly closed: boolean;
    /** The prefix exceeded a limit; nothing after the limit is read. */
    readonly overLimit: boolean;
}
/**
 * Incremental scanner over the raw argument prefix of a preparing call. It
 * resumes where it stopped, cuts out each element of the top-level `items`
 * array once its closing bracket arrives, and validates that element alone.
 * Open elements are never parsed or shown.
 */
export declare class InlineArgsStream {
    private pos;
    private depth;
    private inString;
    private escape;
    /** Inside the top-level object, the next string is a key. */
    private expectKey;
    private keyStart;
    private lastKey;
    private itemsDepth;
    private elementStart;
    private closed;
    private overLimit;
    private items;
    private snapshot;
    private source;
    /**
     * Advance over a longer prefix of the same arguments text.
     * @param raw - the current raw argument prefix.
     * @returns an identity-stable snapshot that changes only when it gains content.
     */
    feed(raw: string): InlineStreamSnapshot;
    private reset;
    private step;
    private emit;
}
export {};
//# sourceMappingURL=inline.d.ts.map