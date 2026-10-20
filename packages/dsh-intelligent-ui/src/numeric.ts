/**
 * Conservative cell parsing for charts. A column is plottable only when every
 * non-missing cell is a plain number with the same unit; anything unclear
 * keeps the column table-only. Display always uses the original cell text.
 */

/** One classified table cell. */
export type CellValue =
  | { readonly kind: 'missing' }
  | { readonly kind: 'number'; readonly value: number; readonly unit: string }
  | { readonly kind: 'text' }

/** Explicit empty markers; they become gaps, never zero. */
const MISSING = new Set(['', '-', '--', '—', '–', 'n/a', 'na', 'null', 'none', '/', '?', '？', '无', '暂无', '缺失', '未知'])

const NUMBER = /^(?<pre>[$¥￥€£]?)(?<sign>[+\-−]?)(?<pre2>[$¥￥€£]?)(?<int>\d{1,3}(?:,\d{3})+|\d+)(?<frac>\.\d+)?\s?(?<suf>[%‰°A-Za-zµ一-鿿/]{1,8})?$/u

/** Significant digits a double represents exactly enough for display parity. */
const SAFE_DIGITS = 15

/**
 * Classify one cell.
 * @param raw - cell text as shown in the answer.
 * @returns missing, a number with its unit, or text (including unsafe precision).
 */
export function parseCell(raw: string): CellValue {
  const text = raw.trim()
  if (MISSING.has(text.toLowerCase())) return { kind: 'missing' }
  const match = NUMBER.exec(text)
  const groups = match?.groups
  if (groups === undefined) return { kind: 'text' }
  const prefix = groups.pre ?? ''
  const prefix2 = groups.pre2 ?? ''
  if (prefix !== '' && prefix2 !== '') return { kind: 'text' }
  const integer = (groups.int ?? '').replaceAll(',', '')
  const fraction = groups.frac ?? ''
  const digits = `${integer}${fraction.slice(1)}`.replace(/^0+/, '')
  if (digits.length > SAFE_DIGITS) return { kind: 'text' }
  const negative = groups.sign === '-' || groups.sign === '−'
  const value = Number(`${negative ? '-' : ''}${integer}${fraction}`)
  if (!Number.isFinite(value)) return { kind: 'text' }
  return { kind: 'number', value, unit: `${prefix}${prefix2}|${groups.suf ?? ''}` }
}

/** What one column can be used for. */
export interface ColumnAnalysis {
  /** Same-unit numeric series, or null when the column is not plottable. */
  readonly numeric: { readonly unit: string; readonly values: readonly (number | null)[] } | null
  /** Every cell present: usable as the category/time axis. */
  readonly categorical: boolean
}

/**
 * Analyze one column's cells.
 * @param cells - the column's cell texts, in row order.
 * @returns plottability and axis suitability.
 */
export function analyzeColumn(cells: readonly string[]): ColumnAnalysis {
  const parsed = cells.map(parseCell)
  const categorical = cells.length > 0 && parsed.every(cell => cell.kind !== 'missing')
  const numbers = parsed.filter((cell): cell is Extract<CellValue, { kind: 'number' }> => cell.kind === 'number')
  const units = new Set(numbers.map(cell => cell.unit))
  const plottable = numbers.length >= 2 && units.size === 1 && parsed.every(cell => cell.kind !== 'text')
  return {
    numeric: plottable
      ? { unit: numbers[0]?.unit ?? '|', values: parsed.map(cell => cell.kind === 'number' ? cell.value : null) }
      : null,
    categorical,
  }
}

/**
 * Human-readable unit from an internal `prefix|suffix` key.
 * @param unit - internal unit key.
 * @returns the symbol to show beside axis values, or ''.
 */
export function displayUnit(unit: string): string {
  const [prefix = '', suffix = ''] = unit.split('|')
  return `${prefix}${suffix}`
}
