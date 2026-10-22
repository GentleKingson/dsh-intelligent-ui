/**
 * Initial resource guards of this plugin (not DSH or model limits). They stay
 * fixed protocol constants until a directed validation shows a problem.
 */
export const LIMITS = {
  /** Answer Markdown accepted for an enhancement, in UTF-8 bytes. */
  inputBytes: 32 * 1024,
  /** Model output accepted as a program, in UTF-8 bytes. */
  programBytes: 16 * 1024,
  /** `inline-stream` tool arguments accepted as a view, in UTF-8 bytes. */
  inlineArgsBytes: 64 * 1024,
  /** Output-token cap of the one auxiliary call. */
  outputTokens: 2048,
  /** End-to-end deadline of the auxiliary call. */
  deadlineMs: 20_000,
  /** Business items per view. */
  items: 8,
  /** Cards per card group. */
  cards: 12,
  /** Referenced blocks per Markdown item or card. */
  blocksPerItem: 12,
  tableRows: 200,
  tableColumns: 12,
  chartSeries: 4,
  /** Options of one `inline-stream` scenarios item, and components per option. */
  scenarioOptions: 4,
  scenarioItems: 3,
  /** Concurrent auxiliary calls across all sessions. */
  concurrency: 2,
  /** In-memory pending/skipped/failed entries kept for reads and retries. */
  memoryEntries: 256,
} as const
