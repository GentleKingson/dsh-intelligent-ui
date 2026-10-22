/**
 * The one UI program format: a strict JSON object that only selects source
 * ids and display enums. Validation rejects the whole program on any defect;
 * resolution then copies text and data from the source index, never from the
 * model.
 */
import { z } from 'zod';
import type { IntelligentUiChartItem, IntelligentUiView } from './types.ts';
import type { SourceIndex, SourceTable } from './source-index.ts';
/** Model output schema: exactly one version tag and 1..8 items. */
export declare const programSchema: z.ZodObject<{
    version: z.ZodLiteral<1>;
    items: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        type: z.ZodLiteral<"markdown">;
        blocks: z.ZodArray<z.ZodString>;
    }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"cards">;
        cards: z.ZodArray<z.ZodObject<{
            source: z.ZodArray<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"table">;
        table: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"chart">;
        table: z.ZodString;
        chart: z.ZodEnum<{
            bar: "bar";
            line: "line";
        }>;
        x: z.ZodString;
        series: z.ZodArray<z.ZodString>;
    }, z.core.$strict>], "type">>;
}, z.core.$strict>;
/** A syntactically valid program, before source binding. */
export type Program = z.infer<typeof programSchema>;
/** Outcome of reading one complete model output. */
export type ProgramOutcome = {
    readonly kind: 'skip';
} | {
    readonly kind: 'view';
    readonly view: IntelligentUiView;
} | {
    readonly kind: 'invalid';
    readonly detail: string;
};
/**
 * Parse, validate, and bind one complete model output.
 * @param output - the full text of a normally stopped auxiliary response.
 * @param index - source index of the bound answer.
 * @returns SKIP, a resolved view, or a rejection reason.
 */
export declare function readProgram(output: string, index: SourceIndex): ProgramOutcome;
/** A program referenced something the bound answer does not offer. */
export declare class BindingError extends Error {
}
/**
 * Bind a chart to verified table columns; every plotted value is parsed from
 * the table's own cell text, so the chart and its "view data" table agree.
 * @param source - table data with analyzed columns.
 * @param item - chart kind, category column id, and series column ids.
 * @returns the resolved chart item.
 * @throws {@link BindingError} when a column cannot serve its role.
 */
export declare function bindChart(source: Pick<SourceTable, 'data' | 'columns'>, item: {
    readonly chart: 'bar' | 'line';
    readonly x: string;
    readonly series: readonly string[];
}): IntelligentUiChartItem;
//# sourceMappingURL=program.d.ts.map