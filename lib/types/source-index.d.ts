/**
 * Minimal source index over one final answer's Markdown: addressable block
 * ids, list-item ids, and GFM tables with column ids. It exists only so a
 * model can select content and the Host can bind the exact original text.
 */
import type { IntelligentUiTableData } from './types.ts';
import { type ColumnAnalysis } from './numeric.ts';
/** One addressable top-level block or list item. */
export interface SourceBlock {
    readonly id: string;
    readonly kind: string;
    /** Exact source slice. */
    readonly markdown: string;
    /** Plain-text heading or item lead, for card titles. */
    readonly title: string;
    /** False for blocks a view must not repeat (images, raw HTML, definitions). */
    readonly referenceable: boolean;
    readonly headingDepth?: number;
    /** Table id when `kind === 'table'`. */
    readonly tableId?: string;
}
/** One column of a source table. */
export interface SourceColumn {
    readonly id: string;
    readonly header: string;
    readonly analysis: ColumnAnalysis;
}
/** One GFM table, addressable only when it fits the per-table budget. */
export interface SourceTable {
    readonly id: string;
    readonly blockId: string;
    readonly data: IntelligentUiTableData;
    readonly columns: readonly SourceColumn[];
    readonly withinLimits: boolean;
}
/** The bounded index a generation request and its validation share. */
export interface SourceIndex {
    readonly blocks: ReadonlyMap<string, SourceBlock>;
    /** Top-level block ids in document order (list items excluded). */
    readonly order: readonly string[];
    readonly tables: ReadonlyMap<string, SourceTable>;
}
/**
 * Parse one answer into its source index.
 * @param text - the answer Markdown.
 * @returns blocks, list items, and tables with stable positional ids.
 */
export declare function buildSourceIndex(text: string): SourceIndex;
//# sourceMappingURL=source-index.d.ts.map