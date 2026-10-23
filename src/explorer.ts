/** Bounded data operations shared by inline validation and the linked view. */
import type { IntelligentUiExplorerItem } from './types.ts'
import { parseCell, displayUnit } from './numeric.ts'
import { BindingError } from './program.ts'

/** Reject ambiguous record identities and summaries that would change units or fill missing cells. */
export function bindExplorer(item: IntelligentUiExplorerItem): IntelligentUiExplorerItem {
  const { headers, rows } = item.table
  const columns = [item.selection, ...item.filters.map(filter => filter.column),
    ...item.metrics.flatMap(metric => [metric.column, metric.op === 'mean' ? metric.groupBy : undefined])]
  if (columns.some(column => column !== undefined && (column < 0 || column >= headers.length))) {
    throw new BindingError('explorer column out of range')
  }
  if (new Set(item.filters.map(filter => filter.column)).size !== item.filters.length) {
    throw new BindingError('explorer filter columns must differ')
  }
  const required = item.filters.filter(filter => !filter.all)
  const keys = rows.map(row => JSON.stringify([...required.map(filter => row[filter.column]), row[item.selection]]))
  if (new Set(keys).size !== keys.length || rows.some(row => parseCell(row[item.selection] ?? '').kind === 'missing')) {
    throw new BindingError('explorer selection must be present and unique within required filters')
  }
  for (const metric of item.metrics) {
    if (metric.column === undefined) continue
    const values = rows.map(row => parseCell(row[metric.column ?? 0] ?? ''))
    const units = new Set(values.flatMap(cell => cell.kind === 'number' ? [cell.unit] : []))
    if (values.some(cell => cell.kind === 'text') || units.size > 1) {
      throw new BindingError('explorer metrics need same-unit numeric cells or missing values')
    }
  }
  return item
}

/** Required filters start at the first source record; optional filters start at All. */
export function explorerDefaults(item: IntelligentUiExplorerItem): readonly (string | null)[] {
  return item.filters.map(filter => filter.all ? null : item.table.rows[0]?.[filter.column] ?? '')
}

/** Every visible value and the inspector are derived from the same filtered source rows. */
export function explore(item: IntelligentUiExplorerItem, filters: readonly (string | null)[], selectedKey: string, fallbackIndex = 0) {
  const rows = item.table.rows.filter(row => item.filters.every((filter, index) =>
    filters[index] == null || row[filter.column] === filters[index]))
  const selected = rows.find(row => row[item.selection] === selectedKey)
    ?? rows[Math.max(0, Math.min(fallbackIndex, rows.length - 1))]
  const metrics = item.metrics.flatMap(metric => {
    const groupBy = metric.op === 'mean' ? metric.groupBy : undefined
    const groups = groupBy === undefined ? [undefined] : [...new Set(rows.map(row => row[groupBy] ?? ''))]
    return groups.map(group => {
      const subset = groupBy === undefined ? rows : rows.filter(row => row[groupBy] === group)
      const cells = metric.column === undefined ? [] : subset.map(row => parseCell(row[metric.column ?? 0] ?? ''))
      const numbers = cells.filter((cell): cell is Extract<typeof cell, { kind: 'number' }> => cell.kind === 'number')
      const mean = numbers.length === 0 ? null : numbers.reduce((sum, cell) => sum + cell.value / numbers.length, 0)
      return {
        label: group === undefined ? metric.label : `${metric.label} · ${group}`,
        value: metric.op === 'count' ? (metric.column === undefined ? subset.length : numbers.length) : mean,
        unit: metric.op === 'mean' ? displayUnit(numbers[0]?.unit ?? '|') : '',
        count: metric.op === 'mean' ? numbers.length : undefined,
      }
    })
  })
  return { rows, selected, metrics }
}
