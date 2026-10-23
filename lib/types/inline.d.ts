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
export declare const INLINE_PROMPT = "# Interactive view (render_ui)\nCall render_ui whenever the main content of your answer is one of: 2+ options, tools, or approaches compared on the same aspects (cards, or a table of option x aspect); a list of 4+ items that share the same fields (a table, e.g. codes with meaning and usage); or numeric data (a table, plus a chart when there is a trend or comparison). Keep plain Markdown for explanations, how-tos, code, and short or conversational answers.\nWhen you call it: first write a short plain-Markdown answer (1-3 sentences stating the conclusion) so the reply stays readable without the view, then call render_ui once with the structured data. Make the first item a markdown component restating that conclusion in one short sentence (at most two lines): your text before the call is folded once the turn ends, so the view must carry it. Put the data only in the tool arguments, not again in your text. A successful call ends your turn; if it fails, answer in plain Markdown instead.\nRules: text is plain Markdown without HTML, images, or scripts. Every table/chart row has exactly one cell per header. Chart series columns hold plain numbers sharing one unit (e.g. \"1,200\", \"12.5%\", or \"\u2014\" for missing). A line chart needs an increasing time/sequence category column (2025-01, Q1, 1\u6708, years); otherwise use bar. Unless the user asks for an image file, draw charts with render_ui rather than plotting them to images.\nFor 2-4 options compared on shared aspects, prefer a table with presentation: \"comparison\": column 0 names each option, and the remaining columns are its aspects. It shows option cards with the full table on demand. Use ordinary tables for longer lists or when the user needs rows, sorting, or filtering. A short opening conclusion and one chart/table form a responsive explanation-plus-view layout; avoid extra components repeating the same data.\nWhen the numbers depend on an assumption the reader may want to vary (growth rate, interest rate, plan tier), you may use one scenarios item: 2-4 named options, each holding the same components computed under that option, so the reader can switch between them. Never use it for options that are simply compared side by side.";
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