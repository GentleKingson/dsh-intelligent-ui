/** Storage-boundary schema of a resolved view; an unreadable record is set aside. */
import { z } from 'zod';
import { LIMITS } from "./limits.js";
const table = z.strictObject({
    headers: z.array(z.string()).max(LIMITS.tableColumns),
    align: z.array(z.enum(['left', 'center', 'right', 'none'])).max(LIMITS.tableColumns),
    rows: z.array(z.array(z.string()).max(LIMITS.tableColumns)).max(LIMITS.tableRows),
});
/** Resolved view as persisted and served. */
export const viewSchema = z.strictObject({
    items: z.array(z.discriminatedUnion('type', [
        z.strictObject({ type: z.literal('markdown'), markdown: z.string() }),
        z.strictObject({
            type: z.literal('cards'),
            cards: z.array(z.strictObject({ title: z.string(), markdown: z.string() })).max(LIMITS.cards),
        }),
        z.strictObject({ type: z.literal('table'), table }),
        z.strictObject({
            type: z.literal('chart'),
            chart: z.enum(['bar', 'line']),
            xLabel: z.string(),
            unit: z.string(),
            categories: z.array(z.string()).max(LIMITS.tableRows),
            series: z.array(z.strictObject({
                name: z.string(),
                values: z.array(z.number().nullable()).max(LIMITS.tableRows),
            })).max(LIMITS.chartSeries),
            table,
        }),
    ])).max(LIMITS.items),
});
//# sourceMappingURL=view-schema.js.map