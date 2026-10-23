import { describe, expect, it } from 'vitest'
import { explore, explorerDefaults, explorerPlot } from '../src/explorer.ts'
import { InlineArgsStream, validateInlineArgs } from '../src/inline.ts'
import type { IntelligentUiExplorerItem } from '../src/types.ts'

const PENGUINS = {
  type: 'explorer', title: '企鹅样本',
  headers: ['row', 'species', 'island', 'bill_length_mm', 'flipper_length_mm', 'body_mass_g', 'sex', 'year'],
  rows: [
    [1, 'Adelie', 'Torgersen', 39.1, 181, 3750, 'male', 2007],
    [2, 'Adelie', 'Torgersen', 39.5, 186, 3800, 'female', 2007],
    [3, 'Adelie', 'Torgersen', 40.3, 195, 3250, 'female', 2007],
    [4, 'Adelie', 'Torgersen', 'NA', 'NA', 'NA', 'NA', 2007],
    [277, 'Chinstrap', 'Dream', 46.5, 192, 3500, 'female', 2007],
    [278, 'Chinstrap', 'Dream', 50, 196, 3900, 'male', 2007],
    [279, 'Chinstrap', 'Dream', 51.3, 193, 3650, 'male', 2007],
    [280, 'Chinstrap', 'Dream', 45.4, 188, 3525, 'female', 2007],
    [153, 'Gentoo', 'Biscoe', 46.1, 211, 4500, 'female', 2007],
    [154, 'Gentoo', 'Biscoe', 50, 230, 5700, 'male', 2007],
    [155, 'Gentoo', 'Biscoe', 48.7, 210, 4450, 'female', 2007],
    [272, 'Gentoo', 'Biscoe', 'NA', 'NA', 'NA', 'NA', 2009],
  ],
  selection: 0, filters: [{ column: 1 }, { column: 6 }],
  metrics: [{ op: 'count', label: '样本数' }, { op: 'count', label: '有效体重数', column: 5 },
    { op: 'mean', label: '平均体重（g）', column: 5, groupBy: 1 }],
}

function resolve(item: unknown): IntelligentUiExplorerItem {
  const outcome = validateInlineArgs({ items: [{ type: 'markdown', markdown: '结论' }, item] })
  if (!outcome.ok) throw new Error(outcome.detail)
  const explorer = outcome.items[1]
  if (explorer?.type !== 'explorer') throw new Error('expected explorer')
  return explorer
}

describe('linked dataset', () => {
  it('joint filters drive counts, missing-aware means and the original selected record', () => {
    const item = resolve(PENGUINS)
    const all = explore(item, explorerDefaults(item), '154')
    expect(all.metrics.map(metric => metric.value)).toEqual([12, 10, expect.closeTo(3600), expect.closeTo(3643.75), expect.closeTo(4883.333333333333)])
    expect(all.selected).toEqual(['154', 'Gentoo', 'Biscoe', '50', '230', '5700', 'male', '2007'])
    const filtered = explore(item, ['Gentoo', 'male'], '154')
    expect(filtered.rows).toEqual([all.selected])
    expect(filtered.metrics.map(metric => metric.value)).toEqual([1, 1, 5700])
    expect(item.table.rows).toHaveLength(12)
  })

  it('keeps NA selectable, handles an empty intersection, and never reuses an unrelated filtered index', () => {
    const item = resolve(PENGUINS)
    const missing = explore(item, [null, 'NA'], '272')
    expect(missing.rows.map(row => row[0])).toEqual(['4', '272'])
    expect(missing.selected?.slice(3, 7)).toEqual(['NA', 'NA', 'NA', 'NA'])
    expect(missing.metrics.map(metric => metric.value)).toEqual([2, 0, null, null])
    const empty = explore(item, ['Chinstrap', 'NA'], '272')
    expect(empty.selected).toBeUndefined()
    expect(empty.metrics.map(metric => metric.value)).toEqual([0, 0])
    expect(explore(item, ['Adelie', 'female'], '154').selected?.[0]).toBe('2')
  })

  it('preserves attempt identity when the required scenario changes, with synchronized explanation and outcome', () => {
    const item = resolve({
      type: 'explorer', title: '重试', headers: ['序列', '尝试', '时刻(s)', 'R1已用', 'R2已用', '结果', '最终去向', '说明'],
      rows: ['故障', '恢复'].flatMap(scenario => [
        [scenario, 1, 0, 0, 0, 'ErrorA', scenario === '故障' ? 'Z' : 'Y', 'R1等待1s'],
        [scenario, 2, 1, 1, 0, 'ErrorB', scenario === '故障' ? 'Z' : 'Y', 'R1等待2s，共享预算'],
        [scenario, 3, 3, 2, 0, 'ErrorC', scenario === '故障' ? 'Z' : 'Y', 'R2等待5s'],
        [scenario, 4, 8, 2, 1, scenario === '故障' ? 'ErrorB' : 'Success', scenario === '故障' ? 'Z' : 'Y',
          scenario === '故障' ? 'R1已耗尽，不再重试' : '成功，不匹配重试规则'],
      ]),
      selection: 1, filters: [{ column: 0, all: false }], steps: true,
    })
    expect(explorerDefaults(item)).toEqual(['故障'])
    expect(explore(item, ['故障'], '4').selected?.slice(1)).toEqual(['4', '8', '2', '1', 'ErrorB', 'Z', 'R1已耗尽，不再重试'])
    expect(explore(item, ['恢复'], '4').selected?.slice(1)).toEqual(['4', '8', '2', '1', 'Success', 'Y', '成功，不匹配重试规则'])
    expect(explore(item, ['恢复'], '3').selected?.[2]).toBe('3')
  })

  it('uses identical validation for a closed streamed component and the final call', () => {
    const item = { ...PENGUINS, plot: { type: 'scatter', x: 3, y: 5, groupBy: 1 } }
    const raw = JSON.stringify({ items: [{ type: 'markdown', markdown: '结论' }, item] })
    const preview = new InlineArgsStream().feed(raw)
    expect(preview.items[1]).toEqual({ ok: true, item: resolve(item) })
  })

  it('keeps the step position when scenarios use different record names, and clamps shorter sequences', () => {
    const item = resolve({
      type: 'explorer', title: '不同步骤编号', headers: ['步骤', '序列', '时刻'],
      rows: [['A1', '故障', 0], ['A2', '故障', 8], ['B1', '恢复', 0], ['B2', '恢复', 8], ['C1', '短序列', 0]],
      selection: 0, filters: [{ column: 1, all: false }], steps: true,
    })
    expect(explore(item, ['恢复'], 'A2', 1).selected).toEqual(['B2', '恢复', '8'])
    expect(explore(item, ['短序列'], 'B2', 1).selected).toEqual(['C1', '短序列', '0'])
  })

  it('plots separate-unit coordinates, with stable source domains/groups and shared filtered row identity', () => {
    const item = resolve({ ...PENGUINS,
      rows: PENGUINS.rows.map(row => row.map((cell, column) => typeof cell !== 'number' ? cell
        : column === 3 ? `${cell}mm` : column === 5 ? `${cell}g` : cell)),
      plot: { type: 'scatter', x: 3, y: 5, groupBy: 1 } })
    const all = explorerPlot(item, item.table.rows)
    expect(all?.points).toHaveLength(10)
    expect(all?.points[0]).toMatchObject({ x: 39.1, y: 3750, group: 0 })
    expect(all?.points.some(point => ['4', '272'].includes(point.row[0] ?? ''))).toBe(false)
    const filtered = explore(item, ['Gentoo', 'male'], '154')
    const plot = explorerPlot(item, filtered.rows)
    expect(plot?.points).toEqual([{ row: filtered.selected, x: 50, y: 5700, group: 2 }])
    expect(plot?.points[0]?.row).toBe(filtered.selected)
    expect(plot?.xAxis).toEqual(all?.xAxis)
    expect(plot?.yAxis).toEqual(all?.yAxis)
    expect(plot?.groups).toEqual(all?.groups)
  })

  it('excludes either missing coordinate without discarding the source row or its valid mass', () => {
    const item = resolve({ ...PENGUINS, rows: PENGUINS.rows.map((row, index) => index === 0 ? row.map((cell, col) => col === 3 ? 'NA' : cell) : row),
      plot: { type: 'scatter', x: 3, y: 5 } })
    const state = explore(item, explorerDefaults(item), '1')
    expect(state.rows).toHaveLength(12)
    expect(state.metrics[1]?.value).toBe(10)
    expect(explorerPlot(item, state.rows)?.points).toHaveLength(9)
    expect(state.selected?.[3]).toBe('NA')
    expect(explorerPlot(item, explore(item, ['Chinstrap', 'NA'], '1').rows)?.points).toEqual([])
  })

  it('uses real retry times and intervals in both scenarios without losing the selected attempt', () => {
    const item = resolve({ type: 'explorer', title: '重试', headers: ['序列', '尝试', '时刻(s)', '去向'],
      rows: ['故障', '恢复'].flatMap(scenario => [0, 1, 3, 8].map((time, index) => [scenario, index, time, scenario === '故障' ? 'Z' : 'Y'])),
      selection: 1, filters: [{ column: 0, all: false }], steps: true, plot: { type: 'timeline', x: 2, groupBy: 0 } })
    const fault = explore(item, ['故障'], '3')
    const recovery = explore(item, ['恢复'], '3')
    const plot = explorerPlot(item, recovery.rows)
    expect(plot?.points.map(point => point.x)).toEqual([0, 1, 3, 8])
    expect(plot?.points.slice(1).map((point, index) => point.x - (plot.points[index]?.x ?? 0))).toEqual([1, 2, 5])
    expect(plot?.points.at(-1)?.row).toBe(recovery.selected)
    expect(recovery.selected?.[3]).toBe('Y')
    expect(plot?.xAxis).toEqual(explorerPlot(item, fault.rows)?.xAxis)
    expect(plot?.xAxis.min).toBe(0)
  })

  it.each([
    ['plot index', { type: 'scatter', x: 8, y: 5 }],
    ['same axes', { type: 'scatter', x: 3, y: 3 }],
    ['text coordinates', { type: 'scatter', x: 1, y: 5 }],
    ['group index', { type: 'scatter', x: 3, y: 5, groupBy: 8 }],
    ['too many groups', { type: 'scatter', x: 3, y: 5, groupBy: 0 }],
    ['unordered/missing timeline', { type: 'timeline', x: 3 }],
  ])('rejects %s instead of drawing misleading geometry', (_name, plot) => {
    expect(() => resolve({ ...PENGUINS, plot })).toThrow()
  })

  it('rejects mixed units on one coordinate axis, and negative or repeated retry times', () => {
    expect(() => resolve({ ...PENGUINS, plot: { type: 'scatter', x: 3, y: 5 },
      rows: PENGUINS.rows.map((row, index) => index < 2 ? row.map((cell, col) => col === 3 ? `${cell}${index === 0 ? 'mm' : 'cm'}` : cell) : row) })).toThrow()
    for (const times of [[-1, 1], [0, 0], [2, 1], [0, 'NA']]) {
      expect(() => resolve({ type: 'explorer', title: '重试', headers: ['尝试', '时刻'], rows: times.map((time, i) => [i, time]),
        selection: 0, plot: { type: 'timeline', x: 1 } })).toThrow()
    }
  })

  it.each([
    ['out of range', { ...PENGUINS, selection: 8 }],
    ['ambiguous record', { ...PENGUINS, selection: 1 }],
    ['duplicate filter', { ...PENGUINS, filters: [{ column: 1 }, { column: 1 }] }],
    ['bad metric', { ...PENGUINS, metrics: [{ op: 'mean', label: 'bad', column: 1 }] }],
    ['mixed metric units', { ...PENGUINS, rows: [[1, 'A', 'x', 1, 2, '3g', 'male', 2007], [2, 'B', 'x', 1, 2, '4kg', 'male', 2007]] }],
    ['HTML', { ...PENGUINS, title: '<script>x</script>' }],
    ['extra field', { ...PENGUINS, onSelect: 'run()' }],
    ['wrong row width', { ...PENGUINS, rows: [[1, 'Adelie']] }],
  ])('rejects %s at the tool boundary', (_name, item) => {
    expect(() => resolve(item)).toThrow()
  })
})
