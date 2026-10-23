/** Storage-boundary schema of a resolved view; an unreadable record is set aside. */
import { z } from 'zod';
/** Resolved view as persisted and served. */
export declare const viewSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        type: z.ZodLiteral<"markdown">;
        markdown: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"cards">;
        cards: z.ZodArray<z.ZodObject<{
            title: z.ZodString;
            markdown: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"table">;
        table: z.ZodObject<{
            headers: z.ZodArray<z.ZodString>;
            align: z.ZodArray<z.ZodEnum<{
                left: "left";
                center: "center";
                right: "right";
                none: "none";
            }>>;
            rows: z.ZodArray<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>;
        presentation: z.ZodOptional<z.ZodLiteral<"comparison">>;
    }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"chart">;
        chart: z.ZodEnum<{
            bar: "bar";
            line: "line";
        }>;
        xLabel: z.ZodString;
        unit: z.ZodString;
        categories: z.ZodArray<z.ZodString>;
        series: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            values: z.ZodArray<z.ZodNullable<z.ZodNumber>>;
        }, z.core.$strict>>;
        tableOnly: z.ZodOptional<z.ZodArray<z.ZodString>>;
        table: z.ZodObject<{
            headers: z.ZodArray<z.ZodString>;
            align: z.ZodArray<z.ZodEnum<{
                left: "left";
                center: "center";
                right: "right";
                none: "none";
            }>>;
            rows: z.ZodArray<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>;
    }, z.core.$strict>], "type">>;
}, z.core.$strict>;
//# sourceMappingURL=view-schema.d.ts.map