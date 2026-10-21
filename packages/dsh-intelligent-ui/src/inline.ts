/**
 * `inline-stream` mode: the root agent's own model writes view data as the
 * arguments of one native tool call. Host and Client share this module, so
 * the streamed preview, the settled view, and the Host's tool result apply the
 * exact same rules. Client-safe: no Host imports.
 */

import { z } from 'zod'
import type { IntelligentUiItem } from './types.ts'
import { analyzeColumn } from './numeric.ts'
import { BindingError, bindChart } from './program.ts'
import { LIMITS } from './limits.ts'

/** Wire name of the view tool; also the Client toolview key. */
export const INLINE_TOOL_NAME = 'render_ui'

/** Agent-level guidance registered beside the tool for root agents only. */
export const INLINE_PROMPT = `# Interactive view (render_ui)
Most answers are plain Markdown; keep them that way. Call render_ui only when the answer is mainly structured data the user will scan or compare: a table of records, numeric series worth a chart, or 2+ parallel options worth cards.
When you call it: first write a short plain-Markdown answer (1-3 sentences stating the conclusion) so the reply stays readable without the view, then call render_ui once with the structured data. Put the data only in the tool arguments, not again in your text. A successful call ends your turn; if it fails, answer in plain Markdown instead.
Rules: text is plain Markdown without HTML, images, or scripts. Every table/chart row has exactly one cell per header. Chart series columns hold plain numbers sharing one unit (e.g. "1,200", "12.5%", or "—" for missing). A line chart needs an increasing time/sequence category column (2025-01, Q1, 1月, years); otherwise use bar.`

const ALIGN = ['left', 'center', 'right', 'none'] as const
const cell = z.union([z.string(), z.number().refine(Number.isFinite)]).transform(String)
const headers = z.array(z.string().min(1)).min(2).max(LIMITS.tableColumns)
const rows = z.array(z.array(cell).max(LIMITS.tableColumns)).max(LIMITS.tableRows)
const markdown = z.string().min(1)

const itemSchema = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('markdown'), markdown }),
  z.strictObject({
    type: z.literal('cards'),
    cards: z.array(z.strictObject({ title: z.string().min(1).max(120), markdown })).min(2).max(LIMITS.cards),
  }),
  z.strictObject({
    type: z.literal('table'),
    headers,
    rows: rows.min(1),
    align: z.array(z.enum(ALIGN)).max(LIMITS.tableColumns).optional(),
  }),
  z.strictObject({
    type: z.literal('chart'),
    chart: z.enum(['bar', 'line']),
    headers,
    rows: rows.min(2),
    x: z.number().int().nonnegative(),
    series: z.array(z.number().int().nonnegative()).min(1).max(LIMITS.chartSeries),
  }),
])

/** JSON Schema of the tool arguments as the model sees it. */
export const INLINE_PARAMETERS = {
  type: 'object',
  additionalProperties: false,
  required: ['items'],
  properties: {
    items: {
      type: 'array',
      description: `1-${LIMITS.items} components, in display order. Each is one of: `
        + '{"type":"markdown","markdown":string}; '
        + `{"type":"cards","cards":[{"title":string,"markdown":string}, ...2-${LIMITS.cards}]}; `
        + '{"type":"table","headers":[string...],"rows":[[cell...]...],"align"?:["left"|"center"|"right"|"none"...]}; '
        + '{"type":"chart","chart":"bar"|"line","headers":[string...],"rows":[[cell...]...],"x":<category column index>,"series":[<numeric column index>...1-4]}.',
      items: { type: 'object' },
    },
  },
} as const

/** One component outcome: a resolved view item, or why it was rejected. */
export type InlineItemOutcome =
  | { readonly ok: true; readonly item: IntelligentUiItem }
  | { readonly ok: false; readonly detail: string }

/** Raw HTML, images, and script-capable link schemes never reach the renderer. */
const UNSAFE_MARKDOWN = [/<[A-Za-z!/?]/, /!\[/, /\]\(\s*<?\s*(?:javascript|vbscript|data):/i]

function unsafeText(item: z.infer<typeof itemSchema>): boolean {
  const texts = item.type === 'markdown' ? [item.markdown]
    : item.type === 'cards' ? item.cards.flatMap(card => [card.title, card.markdown])
      : [...item.headers, ...item.rows.flat()]
  return texts.some(text => UNSAFE_MARKDOWN.some(pattern => pattern.test(text)))
}

function consistent(width: number, data: readonly (readonly string[])[], what: string): void {
  const bad = data.findIndex(row => row.length !== width)
  if (bad >= 0) throw new BindingError(`${what} row ${bad} has ${data[bad]?.length} cells for ${width} headers`)
}

/**
 * Validate and resolve one component written by the model.
 * @param value - one parsed element of the `items` array.
 * @returns the resolved item or a rejection; a rejection never renders.
 */
export function resolveInlineItem(value: unknown): InlineItemOutcome {
  const parsed = itemSchema.safeParse(value)
  if (!parsed.success) return { ok: false, detail: `schema: ${parsed.error.issues[0]?.message ?? 'rejected'}` }
  const item = parsed.data
  if (unsafeText(item)) return { ok: false, detail: 'HTML, image, or script content is not allowed' }
  try {
    switch (item.type) {
      case 'markdown': return { ok: true, item }
      case 'cards': return { ok: true, item: { type: 'cards', cards: item.cards } }
      case 'table': {
        consistent(item.headers.length, item.rows, 'table')
        const align = item.align ?? item.headers.map(() => 'none' as const)
        if (align.length !== item.headers.length) throw new BindingError('table align does not match headers')
        return { ok: true, item: { type: 'table', table: { headers: item.headers, align, rows: item.rows } } }
      }
      case 'chart': {
        consistent(item.headers.length, item.rows, 'chart')
        const data = { headers: item.headers, align: item.headers.map(() => 'none' as const), rows: item.rows }
        const columns = item.headers.map((header, index) => ({
          id: `c${index}`, header, analysis: analyzeColumn(item.rows.map(row => row[index] ?? '')),
        }))
        return { ok: true, item: bindChart({ data, columns }, { chart: item.chart, x: `c${item.x}`, series: item.series.map(index => `c${index}`) }) }
      }
    }
  } catch (error: unknown) {
    if (error instanceof BindingError) return { ok: false, detail: error.message }
    throw error
  }
}

/** Whole-call outcome: every component must pass, or the call is rejected. */
export type InlineArgsOutcome =
  | { readonly ok: true; readonly items: readonly IntelligentUiItem[] }
  | { readonly ok: false; readonly detail: string }

/**
 * Validate complete tool arguments, as the Host executes them and as the
 * Client re-reads a settled call.
 * @param args - parsed tool arguments.
 * @returns all resolved items, or the first rejection.
 */
export function validateInlineArgs(args: unknown): InlineArgsOutcome {
  if (new TextEncoder().encode(JSON.stringify(args) ?? '').length > LIMITS.inlineArgsBytes) {
    return { ok: false, detail: `arguments exceed ${LIMITS.inlineArgsBytes} bytes` }
  }
  const top = z.strictObject({ items: z.array(z.unknown()).min(1).max(LIMITS.items) }).safeParse(args)
  if (!top.success) return { ok: false, detail: `schema: ${top.error.issues[0]?.message ?? 'rejected'}` }
  const items: IntelligentUiItem[] = []
  for (const [index, value] of top.data.items.entries()) {
    const outcome = resolveInlineItem(value)
    if (!outcome.ok) return { ok: false, detail: `item ${index}: ${outcome.detail}` }
    items.push(outcome.item)
  }
  return { ok: true, items }
}

/**
 * Parse settled raw arguments text.
 * @param raw - the recorded call arguments.
 * @returns the validated items or a rejection.
 */
export function readInlineArgs(raw: string): InlineArgsOutcome {
  let value: unknown
  try {
    value = JSON.parse(raw)
  } catch {
    return { ok: false, detail: 'arguments are not one JSON value' }
  }
  return validateInlineArgs(value)
}

/** What the streamed prefix shows so far. */
export interface InlineStreamSnapshot {
  /** Closed components, in order; rejected ones never render. */
  readonly items: readonly InlineItemOutcome[]
  /** The `items` array has closed. */
  readonly closed: boolean
  /** The prefix exceeded a limit; nothing after the limit is read. */
  readonly overLimit: boolean
}

/**
 * Incremental scanner over the raw argument prefix of a preparing call. It
 * resumes where it stopped, cuts out each element of the top-level `items`
 * array once its closing bracket arrives, and validates that element alone.
 * Open elements are never parsed or shown.
 */
export class InlineArgsStream {
  private pos = 0
  private depth = 0
  private inString = false
  private escape = false
  /** Inside the top-level object, the next string is a key. */
  private expectKey = false
  private keyStart = -1
  private lastKey = ''
  private itemsDepth = -1
  private elementStart = -1
  private closed = false
  private overLimit = false
  private items: InlineItemOutcome[] = []
  private snapshot: InlineStreamSnapshot = { items: [], closed: false, overLimit: false }
  private source = ''

  /**
   * Advance over a longer prefix of the same arguments text.
   * @param raw - the current raw argument prefix.
   * @returns an identity-stable snapshot that changes only when it gains content.
   */
  feed(raw: string): InlineStreamSnapshot {
    // The prefix only grows; any other text restarts the scan.
    if (!raw.startsWith(this.source)) this.reset()
    this.source = raw
    const before = this.items.length
    const wasClosed = this.closed
    const wasOver = this.overLimit
    if (raw.length > LIMITS.inlineArgsBytes) this.overLimit = true
    const end = Math.min(raw.length, LIMITS.inlineArgsBytes)
    for (; this.pos < end && !this.closed && !this.overLimit; this.pos++) this.step(raw, this.pos)
    if (this.items.length !== before || this.closed !== wasClosed || this.overLimit !== wasOver) {
      this.snapshot = { items: [...this.items], closed: this.closed, overLimit: this.overLimit }
    }
    return this.snapshot
  }

  private reset(): void {
    Object.assign(this, {
      pos: 0, depth: 0, inString: false, escape: false, expectKey: false, keyStart: -1, lastKey: '',
      itemsDepth: -1, elementStart: -1, closed: false, overLimit: false, items: [], source: '',
      snapshot: { items: [], closed: false, overLimit: false },
    })
  }

  private step(raw: string, index: number): void {
    const char = raw[index]
    if (this.inString) {
      if (this.escape) this.escape = false
      else if (char === '\\') this.escape = true
      else if (char === '"') {
        this.inString = false
        if (this.keyStart >= 0) {
          this.lastKey = raw.slice(this.keyStart, index)
          this.keyStart = -1
        }
      }
      return
    }
    const inItems = this.itemsDepth >= 0 && this.depth === this.itemsDepth
    if (inItems && this.elementStart < 0 && char !== undefined && !/[\s,\]]/.test(char)) this.elementStart = index
    switch (char) {
      case '"':
        this.inString = true
        if (this.depth === 1 && this.expectKey) {
          this.keyStart = index + 1
          this.expectKey = false
        }
        return
      case '{':
      case '[':
        this.depth++
        if (this.depth === 1) this.expectKey = true
        if (char === '[' && this.depth === 2 && this.lastKey === 'items' && this.itemsDepth < 0) this.itemsDepth = 2
        return
      case '}':
      case ']':
        this.depth--
        if (this.itemsDepth >= 0 && this.depth === this.itemsDepth && this.elementStart >= 0) this.emit(raw, index + 1)
        else if (inItems && char === ']') {
          if (this.elementStart >= 0) this.emit(raw, index)
          this.closed = true
        }
        return
      case ',':
        if (this.depth === 1) this.expectKey = true
        if (inItems && this.elementStart >= 0) this.emit(raw, index)
        return
      default:
    }
  }

  private emit(raw: string, end: number): void {
    const text = raw.slice(this.elementStart, end)
    this.elementStart = -1
    if (this.items.length >= LIMITS.items) {
      this.overLimit = true
      return
    }
    let value: unknown
    try {
      value = JSON.parse(text)
    } catch {
      this.items.push({ ok: false, detail: 'element is not one JSON value' })
      return
    }
    this.items.push(resolveInlineItem(value))
  }
}
