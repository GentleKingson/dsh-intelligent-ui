/**
 * Wire vocabulary shared by the Host service, its generated Remote
 * contribution, and the browser half. Client-safe: types only.
 * @module dsh-intelligent-ui/types
 */

/** Exact identity of one finalized root-session answer an enhancement is bound to. */
export interface IntelligentUiSourceRef {
  /** Session that owns the answer. */
  readonly sessionId: string
  /** Turn number whose `turn/end` closed the answer. */
  readonly turn: number
  /** Durable `assistant/message` id of the answer. */
  readonly messageId: string
  /** Session seq of that `assistant/message` event. */
  readonly sourceSeq: number
  /** Shared hash of the answer's visible text blocks (see `shared/source.ts`). */
  readonly sourceHash: string
}

/** Why Smart Auto kept the original Markdown without an enhancement. */
export type IntelligentUiSkipReason =
  | 'not-structured'
  | 'too-large'
  | 'no-route'
  | 'busy'
  | 'model-skip'
  | 'off'

/** Why one generation attempt fell back to the original Markdown. */
export type IntelligentUiFailReason =
  | 'model-error'
  | 'timeout'
  | 'truncated'
  | 'invalid-output'
  | 'storage'

/** Rendered Markdown excerpt copied verbatim from the bound answer. */
export interface IntelligentUiMarkdownItem {
  readonly type: 'markdown'
  readonly markdown: string
}

/** One card: a plain-text title and the verbatim Markdown it summarizes. */
export interface IntelligentUiCard {
  readonly title: string
  readonly markdown: string
}

/** A group of cards for independent items or option comparison. */
export interface IntelligentUiCardsItem {
  readonly type: 'cards'
  readonly cards: readonly IntelligentUiCard[]
}

/** Column alignment declared by the GFM delimiter row. */
export type IntelligentUiAlign = 'left' | 'center' | 'right' | 'none'

/** One source table with its cell text exactly as the answer shows it. */
export interface IntelligentUiTableData {
  readonly headers: readonly string[]
  readonly align: readonly IntelligentUiAlign[]
  readonly rows: readonly (readonly string[])[]
}

/** Sortable and filterable view of one source table. */
export interface IntelligentUiTableItem {
  readonly type: 'table'
  readonly table: IntelligentUiTableData
}

/** One plotted numeric column; `null` marks an explicitly missing cell. */
export interface IntelligentUiSeries {
  readonly name: string
  readonly values: readonly (number | null)[]
}

/** Bar or line chart over verified category and same-unit numeric columns. */
export interface IntelligentUiChartItem {
  readonly type: 'chart'
  readonly chart: 'bar' | 'line'
  readonly xLabel: string
  /** Shared unit of every series (`''` when unitless). */
  readonly unit: string
  readonly categories: readonly string[]
  readonly series: readonly IntelligentUiSeries[]
  /** The source table the chart was drawn from, for the "view data" disclosure. */
  readonly table: IntelligentUiTableData
}

/** One resolved view item; every string in it was copied from the bound answer. */
export type IntelligentUiItem =
  | IntelligentUiMarkdownItem
  | IntelligentUiCardsItem
  | IntelligentUiTableItem
  | IntelligentUiChartItem

/** A validated, source-bound view. */
export interface IntelligentUiView {
  readonly items: readonly IntelligentUiItem[]
}

/** Token accounting of the one auxiliary call, when the adapter reported it. */
export interface IntelligentUiUsage {
  readonly inputTokens?: number | undefined
  readonly outputTokens?: number | undefined
  readonly durationMs: number
}

/** Current enhancement state of one bound answer. */
export type IntelligentUiReadResult =
  | { readonly status: 'absent' }
  | { readonly status: 'pending' }
  | { readonly status: 'skipped'; readonly reason: IntelligentUiSkipReason }
  | { readonly status: 'failed'; readonly reason: IntelligentUiFailReason; readonly retryable: boolean }
  | { readonly status: 'ready'; readonly view: IntelligentUiView; readonly usage: IntelligentUiUsage }

/** Shared render schema version; bump when a stored view stops being readable. */
export const RENDER_SCHEMA_VERSION = 1
