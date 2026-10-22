/**
 * Initial resource guards of this plugin (not DSH or model limits). They stay
 * fixed protocol constants until a directed validation shows a problem.
 */
export declare const LIMITS: {
    /** Answer Markdown accepted for an enhancement, in UTF-8 bytes. */
    readonly inputBytes: number;
    /** Model output accepted as a program, in UTF-8 bytes. */
    readonly programBytes: number;
    /** `inline-stream` tool arguments accepted as a view, in UTF-8 bytes. */
    readonly inlineArgsBytes: number;
    /** Output-token cap of the one auxiliary call. */
    readonly outputTokens: 2048;
    /** End-to-end deadline of the auxiliary call. */
    readonly deadlineMs: 20000;
    /** Business items per view. */
    readonly items: 8;
    /** Cards per card group. */
    readonly cards: 12;
    /** Referenced blocks per Markdown item or card. */
    readonly blocksPerItem: 12;
    readonly tableRows: 200;
    readonly tableColumns: 12;
    readonly chartSeries: 4;
    /** Options of one `inline-stream` scenarios item, and components per option. */
    readonly scenarioOptions: 4;
    readonly scenarioItems: 3;
    /** Concurrent auxiliary calls across all sessions. */
    readonly concurrency: 2;
    /** In-memory pending/skipped/failed entries kept for reads and retries. */
    readonly memoryEntries: 256;
};
//# sourceMappingURL=limits.d.ts.map