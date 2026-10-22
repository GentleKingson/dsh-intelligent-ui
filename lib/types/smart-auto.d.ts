/**
 * Smart Auto: a cheap local screen that decides whether one answer is worth a
 * single auxiliary model call, and the fixed prompt for that call.
 */
import type { SourceIndex } from './source-index.ts';
/** Which component kinds the local screen saw evidence for. */
export type CandidateHint = 'cards' | 'table' | 'chart';
/** Local screen verdict; a candidate still may come back SKIP from the model. */
export type ScreenResult = {
    readonly candidate: true;
    readonly hints: readonly CandidateHint[];
} | {
    readonly candidate: false;
    readonly reason: 'not-structured' | 'too-large';
};
/**
 * Decide locally whether an answer deserves the one auxiliary call.
 * @param text - the answer Markdown.
 * @param index - its source index.
 * @returns candidate hints, or the reason to keep Markdown with zero calls.
 */
export declare function screen(text: string, index: SourceIndex): ScreenResult;
/** Fixed system prompt: the allowed components, the input data, and the SKIP contract. */
export declare const SYSTEM_PROMPT: string;
/**
 * Frame the bound answer as JSON data for the auxiliary call.
 * @param index - the answer's source index.
 * @param hints - the local screen's evidence.
 * @returns the user-message text.
 */
export declare function framePrompt(index: SourceIndex, hints: readonly CandidateHint[]): string;
//# sourceMappingURL=smart-auto.d.ts.map