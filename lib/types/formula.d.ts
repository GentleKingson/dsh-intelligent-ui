/**
 * Arithmetic formulas of the `calculator` component. A formula is parsed into
 * closures over a fixed vocabulary (numbers, names, operators, a few Math
 * functions); nothing is ever evaluated as JavaScript. Client-safe.
 */
import type { IntelligentUiCalculatorItem } from './types.ts';
type Env = Readonly<Record<string, number>>;
type Fn = (env: Env) => number;
/** A parsed formula and the names it reads. */
export interface Formula {
    readonly evaluate: Fn;
    readonly names: ReadonlySet<string>;
}
/**
 * Parse one formula.
 * @param source - e.g. `P * r / (1 - (1 + r) ^ -n)`; `^` and `**` are powers, comparisons yield 1 or 0, `c ? a : b` picks.
 * @returns the evaluator and the names it reads.
 * @throws BindingError on any syntax outside the vocabulary.
 */
export declare function parseFormula(source: string): Formula;
/**
 * Outputs of a calculator for the given input values, in order; an output
 * that fails or is not finite is `null` and shows as missing, alone.
 * @param item - a calculator already accepted by {@link bindCalculator}.
 * @param values - one value per input.
 * @param formulas - parsed outputs, when the caller keeps them.
 * @returns one value or `null` per output.
 */
export declare function computeCalculator(item: IntelligentUiCalculatorItem, values: readonly number[], formulas?: readonly Formula[]): (number | null)[];
/** Parsed formulas of a calculator's optional series. */
export interface SeriesFormulas {
    readonly from: Formula;
    readonly to: Formula;
    readonly columns: readonly Formula[];
}
/** Rows of a calculator series for the current inputs. */
export interface SeriesRows {
    /** Index values, one per row. */
    readonly index: readonly number[];
    /** One cell per column; `null` where a formula fails or is not finite. */
    readonly rows: readonly (readonly (number | null)[])[];
    /** The range held more rows than a table may show; only the first are kept. */
    readonly truncated: boolean;
}
/**
 * Parse a series' formulas.
 * @param series - the calculator's series.
 * @returns parsed `from`, `to` and column formulas.
 */
export declare function parseSeries(series: NonNullable<IntelligentUiCalculatorItem['series']>): SeriesFormulas;
/**
 * Recompute a calculator's series: the index runs from `from` to `to` by
 * `step`, and each column formula reads the inputs, every output and the index.
 * @param item - a calculator with a series, accepted by {@link bindCalculator}.
 * @param values - one value per input.
 * @param formulas - parsed outputs and series.
 * @returns the rows, or none when the range is not finite or runs backwards.
 */
export declare function computeSeries(item: IntelligentUiCalculatorItem, values: readonly number[], formulas: {
    readonly outputs: readonly Formula[];
    readonly series: SeriesFormulas;
}): SeriesRows;
/**
 * Keep a reader's value inside the input's declared range; options need no clamp.
 * @param input - one bound calculator input.
 * @param value - the value the reader entered.
 * @returns the value the formulas may read.
 */
export declare function clampInput(input: IntelligentUiCalculatorItem['inputs'][number], value: number): number;
/**
 * Check a calculator written by the model: names, ranges, and that every
 * formula reads only inputs and earlier outputs and is finite at the defaults.
 * @param item - schema-checked calculator.
 * @returns the same item, with a default step on ranges that lack one.
 * @throws BindingError naming the first problem, so the model can correct it.
 */
export declare function bindCalculator(item: IntelligentUiCalculatorItem): IntelligentUiCalculatorItem;
export {};
//# sourceMappingURL=formula.d.ts.map