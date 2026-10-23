/** Bounded data operations shared by inline validation and the linked view. */
import type { IntelligentUiExplorerItem } from './types.ts'
import { parseCell, displayUnit, valueAxis } from './numeric.ts'
import { BindingError } from './program.ts'
import { LIMITS } from './limits.ts'

/** Reject ambiguous record identities and summaries that would change units or fill missing cells. */
export function bindExplorer(item: IntelligentUiExplorerItem): IntelligentUiExplorerItem {
  const { headers, rows } = item.table
  const plot = item.plot
  const columns = [item.selection, ...item.filters.map(filter => filter.column),
    ...item.metrics.flatMap(metric => [metric.column, metric.op === 'mean' ? metric.groupBy : undefined]),
    plot?.x, plot?.type === 'scatter' ? plot.y : undefined, plot?.groupBy]
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
  if (plot !== undefined) {
    for (const column of plot.type === 'scatter' ? [plot.x, plot.y] : [plot.x]) {
      const cells = rows.map(row => parseCell(row[column] ?? ''))
      const units = new Set(cells.flatMap(cell => cell.kind === 'number' ? [cell.unit] : []))
      if (cells.some(cell => cell.kind === 'text') || units.size > 1) {
        throw new BindingError('plot axes need same-unit numeric cells or missing values within each axis')
      }
    }
    if (plot.groupBy !== undefined && new Set(rows.map(row => row[plot.groupBy ?? 0])).size > LIMITS.chartSeries) {
      throw new BindingError('plot supports at most four groups')
    }
    if (plot.type === 'scatter' && plot.x === plot.y) throw new BindingError('scatter axes must differ')
    if (plot.type === 'timeline') {
      const previous = new Map<string, number>()
      for (const row of rows) {
        const cell = parseCell(row[plot.x] ?? '')
        const key = JSON.stringify([...required.map(filter => row[filter.column]), plot.groupBy === undefined ? '' : row[plot.groupBy]])
        if (cell.kind !== 'number' || cell.value < 0 || cell.value <= (previous.get(key) ?? -1)) {
          throw new BindingError('timeline needs nonnegative strictly increasing times within each scenario/group')
        }
        previous.set(key, cell.value)
      }
    }
  }
  return item
}

/** Preserve source rows and stable group/axis domains while filtering out only missing coordinates. */
export function explorerPlot(item: IntelligentUiExplorerItem, rows: readonly (readonly string[])[]) {
  const plot = item.plot
  if (plot === undefined) return undefined
  const groups = plot.groupBy === undefined ? [''] : [...new Set(item.table.rows.map(row => row[plot.groupBy ?? 0] ?? ''))]
  const points = (data: readonly (readonly string[])[]) => data.flatMap(row => {
    const x = parseCell(row[plot.x] ?? '')
    const y = plot.type === 'scatter' ? parseCell(row[plot.y] ?? '') : undefined
    return x.kind === 'number' && (plot.type === 'timeline' || y?.kind === 'number')
      ? [{ row, x: x.value, y: y?.kind === 'number' ? y.value : 0,
          group: groups.indexOf(plot.groupBy === undefined ? '' : row[plot.groupBy] ?? '') }] : []
  })
  const all = points(item.table.rows)
  return {
    points: points(rows), groups,
    xAxis: valueAxis(all.map(point => point.x), plot.type === 'timeline' ? 'bar' : 'scatter'),
    yAxis: valueAxis(all.map(point => point.y), 'scatter'),
    unit: displayUnit(item.table.rows.map(row => parseCell(row[plot.x] ?? '')).find(cell => cell.kind === 'number')?.unit ?? '|'),
  }
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
