/**
 * The one UI program format: a strict JSON object that only selects source
 * ids and display enums. Validation rejects the whole program on any defect;
 * resolution then copies text and data from the source index, never from the
 * model.
 */

import { z } from 'zod'
import type { IntelligentUiCard, IntelligentUiChartItem, IntelligentUiItem, IntelligentUiTableData, IntelligentUiTableItem, IntelligentUiView } from './types.ts'
import type { SourceBlock, SourceIndex, SourceTable } from './source-index.ts'
import { displayUnit } from './numeric.ts'
import { LIMITS } from './limits.ts'

const blockId = z.string().regex(/^b\d{1,4}(?:i\d{1,4})?$/)
const tableId = z.string().regex(/^t\d{1,3}$/)
const columnId = z.string().regex(/^c\d{1,2}$/)
const blockList = z.array(blockId).min(1).max(LIMITS.blocksPerItem)

const programItem = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('markdown'), blocks: blockList }),
  z.strictObject({
    type: z.literal('cards'),
    cards: z.array(z.strictObject({ source: blockList })).min(2).max(LIMITS.cards),
  }),
  z.strictObject({ type: z.literal('table'), table: tableId, presentation: z.literal('comparison').optional() }),
  z.strictObject({
    type: z.literal('chart'),
    table: tableId,
    chart: z.enum(['bar', 'line']),
    x: columnId,
    series: z.array(columnId).min(1).max(LIMITS.chartSeries),
  }),
])

/** Model output schema: exactly one version tag and 1..8 items. */
export const programSchema = z.strictObject({
  version: z.literal(1),
  items: z.array(programItem).min(1).max(LIMITS.items),
})

/** A syntactically valid program, before source binding. */
export type Program = z.infer<typeof programSchema>

/** Outcome of reading one complete model output. */
export type ProgramOutcome =
  | { readonly kind: 'skip' }
  | { readonly kind: 'view'; readonly view: IntelligentUiView }
  | { readonly kind: 'invalid'; readonly detail: string }

const FENCE = /^```(?:json)?\n([\s\S]*)\n```$/

/**
 * Parse, validate, and bind one complete model output.
 * @param output - the full text of a normally stopped auxiliary response.
 * @param index - source index of the bound answer.
 * @returns SKIP, a resolved view, or a rejection reason.
 */
export function readProgram(output: string, index: SourceIndex): ProgramOutcome {
  const trimmed = output.trim()
  if (trimmed === 'SKIP') return { kind: 'skip' }
  if (new TextEncoder().encode(trimmed).length > LIMITS.programBytes) return { kind: 'invalid', detail: 'program too large' }
  // One enclosing ```json fence is the only tolerated wrapper; any text
  // outside it, a second document, or a trailing token fails JSON.parse below.
  const body = FENCE.exec(trimmed)?.[1] ?? trimmed
  let json: unknown
  try {
    json = JSON.parse(body)
  } catch (error: unknown) {
    return { kind: 'invalid', detail: `not one JSON value: ${error instanceof Error ? error.message : String(error)}` }
  }
  const parsed = programSchema.safeParse(json)
  if (!parsed.success) return { kind: 'invalid', detail: `schema: ${parsed.error.issues[0]?.message ?? 'rejected'}` }
  // JSON.parse keeps the last of duplicate keys. Every accepted string value
  // matches a quote-free id or enum, so counting `"key":` in the raw body is
  // exact; a mismatch means a duplicated (silently dropped) declaration.
  if ((body.match(/"[A-Za-z]+"\s*:/g) ?? []).length !== countKeys(parsed.data)) {
    return { kind: 'invalid', detail: 'duplicate keys' }
  }
  // A chart already discloses its source table ("view data"), so a separate
  // table item for the same source would show the same rows twice.
  const charted = new Set(parsed.data.items.flatMap(item => item.type === 'chart' ? [item.table] : []))
  const items = parsed.data.items.filter(item => item.type !== 'table' || !charted.has(item.table))
  try {
    return { kind: 'view', view: { items: items.map(item => resolveItem(item, index)) } }
  } catch (error: unknown) {
    if (error instanceof BindingError) return { kind: 'invalid', detail: error.message }
    throw error
  }
}

function countKeys(value: unknown): number {
  if (Array.isArray(value)) return value.reduce((sum: number, entry) => sum + countKeys(entry), 0)
  if (value === null || typeof value !== 'object') return 0
  return Object.values(value).reduce((sum: number, entry) => sum + 1 + countKeys(entry), 0)
}

/** A program referenced something the bound answer does not offer. */
export class BindingError extends Error {}

function block(index: SourceIndex, id: string): SourceBlock {
  const found = index.blocks.get(id)
  if (found === undefined || !found.referenceable) throw new BindingError(`unknown or unreferenceable block ${id}`)
  return found
}

function distinct(ids: readonly string[], what: string): void {
  if (new Set(ids).size !== ids.length) throw new BindingError(`duplicate ${what}`)
}

function table(index: SourceIndex, id: string): SourceTable {
  const found = index.tables.get(id)
  if (found === undefined || !found.withinLimits) throw new BindingError(`unknown or over-budget table ${id}`)
  return found
}

function card(index: SourceIndex, ids: readonly string[]): IntelligentUiCard {
  distinct(ids, 'card source')
  const blocks = ids.map(id => block(index, id))
  const [first, ...rest] = blocks
  if (first === undefined) throw new BindingError('empty card')
  // A heading titles the blocks after it; a list item or paragraph is both
  // its own title source and body.
  const body = first.kind === 'heading' ? rest : blocks
  if (body.length === 0) throw new BindingError(`card ${first.id} has no body`)
  return { title: first.title, markdown: body.map(entry => entry.markdown).join('\n\n') }
}

function resolveItem(item: Program['items'][number], index: SourceIndex): IntelligentUiItem {
  switch (item.type) {
    case 'markdown':
      distinct(item.blocks, 'markdown block')
      return { type: 'markdown', markdown: item.blocks.map(id => block(index, id).markdown).join('\n\n') }
    case 'cards': {
      distinct(item.cards.flatMap(entry => entry.source), 'card source')
      return { type: 'cards', cards: item.cards.map(entry => card(index, entry.source)) }
    }
    case 'table':
      return bindTable(table(index, item.table).data, item.presentation)
    case 'chart':
      return bindChart(table(index, item.table), item)
    default: {
      const exhaustive: never = item
      throw new BindingError(`unknown item ${String(exhaustive)}`)
    }
  }
}

/** Bind a table without rewriting cells; comparison cards need 2–4 distinct option names in column 0. */
export function bindTable(data: IntelligentUiTableData, presentation?: 'comparison'): IntelligentUiTableItem {
  if (presentation === undefined) return { type: 'table', table: data }
  const names = data.rows.map(row => row[0]?.trim() ?? '')
  if (data.headers.length < 2 || names.length < 2 || names.length > 4 || names.some(name => name === '')
    || new Set(names).size !== names.length) throw new BindingError('comparison needs 2-4 distinct named options in column 0')
  return { type: 'table', table: data, presentation }
}

/**
 * Bind a chart to verified table columns; every plotted value is parsed from
 * the table's own cell text, so the chart and its "view data" table agree.
 * A series column that is not numeric, or whose unit differs from the first
 * plottable series, stays table-only instead of rejecting the whole chart.
 * @param source - table data with analyzed columns.
 * @param item - chart kind, category column id, and series column ids.
 * @returns the resolved chart item.
 * @throws {@link BindingError} when the axis is unusable or no series can be plotted.
 */
export function bindChart(
  source: Pick<SourceTable, 'data' | 'columns'>,
  item: { readonly chart: 'bar' | 'line'; readonly x: string; readonly series: readonly string[] },
): IntelligentUiChartItem {
  distinct([item.x, ...item.series], 'chart column')
  const x = source.columns.find(column => column.id === item.x)
  if (x === undefined || !x.analysis.categorical) throw new BindingError(`column ${item.x} is not a category axis`)
  // A line implies a trend; unordered categories may only be compared as bars.
  if (item.chart === 'line' && !x.analysis.ordered) throw new BindingError(`column ${item.x} is not an ordered time/sequence axis`)
  const columns = item.series.map((id) => {
    const column = source.columns.find(candidate => candidate.id === id)
    if (column === undefined) throw new BindingError(`unknown chart column ${id}`)
    return column
  })
  const unit = columns.find(column => column.analysis.numeric !== null)?.analysis.numeric?.unit
  if (unit === undefined) throw new BindingError(`columns ${item.series.join(', ')} are not same-unit numeric columns`)
  const plotted = columns.filter(column => column.analysis.numeric?.unit === unit)
  if (source.data.rows.length < 2) throw new BindingError('chart needs at least two points')
  const tableOnly = columns.filter(column => !plotted.includes(column)).map(column => column.header)
  return {
    type: 'chart',
    chart: item.chart,
    xLabel: x.header,
    unit: displayUnit(unit),
    categories: source.data.rows.map(row => row[Number(item.x.slice(1))] ?? ''),
    series: plotted.map(column => ({ name: column.header, values: column.analysis.numeric?.values ?? [] })),
    ...(tableOnly.length > 0 ? { tableOnly } : {}),
    table: source.data,
  }
}
