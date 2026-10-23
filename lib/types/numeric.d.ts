/**
 * Conservative cell parsing for charts. A column is plottable only when every
 * non-missing cell is a plain number with the same unit; anything unclear
 * keeps the column table-only. Display always uses the original cell text.
 */
/** One classified table cell. */
export type CellValue = {
    readonly kind: 'missing';
} | {
    readonly kind: 'number';
    readonly value: number;
    readonly unit: string;
} | {
    readonly kind: 'text';
};
/**
 * Classify one cell.
 * @param raw - cell text as shown in the answer.
 * @returns missing, a number with its unit, or text (including unsafe precision).
 */
export declare function parseCell(raw: string): CellValue;
/** What one column can be used for. */
export interface ColumnAnalysis {
    /** Same-unit numeric series, or null when the column is not plottable. */
    readonly numeric: {
        readonly unit: string;
        readonly values: readonly (number | null)[];
    } | null;
    /** Every cell present: usable as the category axis of a bar chart. */
    readonly categorical: boolean;
    /** Cells form one strictly increasing time/sequence scale: usable as a line chart's x axis. */
    readonly ordered: boolean;
}
/**
 * Whether labels read as one time/sequence axis in the given row order. Rows
 * are never reordered: a shuffled, repeated, or mixed-format axis is not ordered.
 * @param cells - the column's cell texts, in row order.
 * @returns true only for at least two labels on one scale, strictly increasing.
 */
export declare function isOrderedAxis(cells: readonly string[]): boolean;
/**
 * Analyze one column's cells.
 * @param cells - the column's cell texts, in row order.
 * @returns plottability and axis suitability.
 */
export declare function analyzeColumn(cells: readonly string[]): ColumnAnalysis;
/**
 * Human-readable unit from an internal `prefix|suffix` key.
 * @param unit - internal unit key.
 * @returns the symbol to show beside axis values, or ''.
 */
export declare function displayUnit(unit: string): string;
/** A chart's value axis: bounds, labeled ticks, and whether it includes zero. */
export interface ValueAxis {
    readonly min: number;
    readonly max: number;
    readonly ticks: readonly number[];
    readonly zeroBased: boolean;
}
/**
 * Value axis of a chart. Bars always include zero so bar length stays
 * proportional. A line zooms to its data only when every value sits on one
 * side of zero and their spread is under a third of the largest magnitude
 * (e.g. 95→100), where a zero baseline would flatten the trend; every tick
 * stays labeled so the non-zero start is visible.
 * @param values - visible, non-missing values.
 * @param chart - chart kind.
 * @returns a finite axis with a bounded tick list.
 */
export declare function valueAxis(values: readonly number[], chart: 'bar' | 'line' | 'scatter'): ValueAxis;
//# sourceMappingURL=numeric.d.ts.map