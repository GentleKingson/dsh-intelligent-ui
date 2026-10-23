import { describe, expect, it } from 'vitest'
import { validateInlineArgs } from '../src/inline.ts'
import { clampInput, computeCalculator, computeSeries, parseFormula, parseSeries } from '../src/formula.ts'
import type { IntelligentUiCalculatorItem } from '../src/types.ts'

const MORTGAGE = {
  type: 'calculator',
  title: '等额本息房贷计算器',
  inputs: [
    { id: 'P', label: '贷款本金', unit: '万元', value: 100, min: 10, max: 1000, step: 1 },
    { id: 'rate', label: '年利率', unit: '%', value: 3.5, min: 3, max: 5, step: 0.05 },
    { id: 'years', label: '期限', unit: '年', value: 30, options: [20, 30] },
  ],
  outputs: [
    { id: 'r', label: '月利率', formula: 'rate / 100 / 12', decimals: 6, hidden: true },
    { id: 'n', label: '期数', formula: 'years * 12', decimals: 0, hidden: true },
    { id: 'M', label: '月供', unit: '元', formula: 'P * 10000 * r * (1 + r) ^ n / ((1 + r) ^ n - 1)' },
    { label: '总利息', unit: '元', formula: 'M * n - P * 10000' },
  ],
}

function accept(item: unknown): IntelligentUiCalculatorItem {
  const outcome = validateInlineArgs({ items: [{ type: 'markdown', markdown: '月供约 4,490.45 元。' }, item] })
  if (!outcome.ok) throw new Error(outcome.detail)
  return outcome.items[1] as IntelligentUiCalculatorItem
}

const reject = (item: unknown): string => {
  const outcome = validateInlineArgs({ items: [{ type: 'markdown', markdown: '结论' }, item] })
  return outcome.ok ? '' : outcome.detail
}

describe('calculator', () => {
  it('recomputes the golden mortgage values from its inputs', () => {
    const item = accept(MORTGAGE)
    const round = (values: (number | null)[]) => values.map(value => value === null ? null : Math.round(value * 100) / 100)
    expect(round(computeCalculator(item, [100, 3.5, 30])).slice(2)).toEqual([4490.45, 616560.88])
    expect(round(computeCalculator(item, [100, 5, 20]))[2]).toBe(6599.56)
    expect(round(computeCalculator(item, [200, 5, 20]))[2]).toBe(13199.11)
  })

  it('keeps operator precedence and isolates a failing output', () => {
    expect(parseFormula('-2^2 + 2^-1 * 4').evaluate({})).toBe(-2)
    expect(parseFormula('x > 3 && x < 10 ? x * 2 : round(x / 3, 2)').evaluate({ x: 4 })).toBe(8)
    const item = accept({ ...MORTGAGE, outputs: [{ label: '比例', formula: '1 / (P - 50)' }] })
    expect(computeCalculator(item, [50, 3.5, 30])).toEqual([null])
  })

  it('picks round default steps on which the default lies, and clamps reader values', () => {
    const steps = (inputs: unknown[]) => accept({ ...MORTGAGE, inputs: [...inputs, MORTGAGE.inputs[2]], outputs: [{ label: 'x', formula: '1' }] }).inputs.map(input => input.step)
    expect(steps([
      { id: 'monthly', label: '每月投入', value: 3000, min: 500, max: 20000 },
      { id: 'yrs', label: '年数', value: 10, min: 1, max: 30 },
      { id: 'rate', label: '利率', value: 3.5, min: 3, max: 5 },
      { id: 'x', label: '比例', value: 0.37, min: 0, max: 10 },
    ])).toEqual([100, 1, 0.01, 0.01, undefined])
    const principal = accept(MORTGAGE).inputs[0]!
    expect([clampInput(principal, -5), clampInput(principal, 50), clampInput(principal, 1e9)]).toEqual([10, 50, 1000])
    expect(computeCalculator(accept({ ...MORTGAGE, outputs: [{ label: 'x', formula: 'P * 1E4 + 2.5e-1' }] }), [1, 3.5, 30])).toEqual([10000.25])
  })

  it('recomputes series rows from the inputs, and rejects series that cannot render', () => {
    const SAVINGS = {
      type: 'calculator', title: '定投',
      inputs: [
        { id: 'monthly', label: '每月投入', value: 3000, min: 500, max: 20000 },
        { id: 'rate', label: '年化', value: 6, min: 2, max: 10 },
        { id: 'years', label: '年限', value: 10, min: 1, max: 300 },
      ],
      outputs: [{ id: 'i', label: '月利率', formula: 'rate / 1200', hidden: true }, { label: '期末', formula: 'monthly * ((1 + i) ^ (years * 12) - 1) / i' }],
      series: { x: 'y', label: '年', from: '0', to: 'years', chart: 'line', columns: [{ label: '余额', unit: '元', formula: 'monthly * ((1 + i) ^ (y * 12) - 1) / i' }] },
    }
    const item = accept(SAVINGS)
    const formulas = { outputs: item.outputs.map(output => parseFormula(output.formula)), series: parseSeries(item.series!) }
    const rows = computeSeries(item, [3000, 6, 10], formulas)
    expect(rows.index).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(Math.round(rows.rows[10]![0]! * 100) / 100).toBe(491638.04)
    const long = computeSeries(item, [3000, 6, 300], formulas)
    expect([long.index.length, long.truncated]).toEqual([200, true])
    const series = (patch: object) => ({ ...SAVINGS, series: { ...SAVINGS.series, ...patch } })
    expect(reject(series({ to: 'years * 100' }))).toMatch(/more than 200 rows/)
    expect(reject(series({ from: 'y' }))).toMatch(/series from reads unknown name y/)
    expect(reject(series({ x: 'years' }))).toMatch(/defined twice/)
    expect(reject(series({ to: '-1' }))).toMatch(/empty or not finite/)
    expect(reject(series({ columns: [{ label: '比', formula: '1 / (y - 3)' }] }))).toMatch(/not a finite number for every row/)
  })

  it('accepts an untyped calculator by its outputs', () => {
    const { type: _, ...untyped } = MORTGAGE
    expect(accept(untyped).type).toBe('calculator')
  })

  it('rejects code, unknown names and broken defaults with a reason the model can act on', () => {
    expect(reject({ ...MORTGAGE, outputs: [{ label: 'x', formula: 'constructor(1)' }] })).toMatch(/unknown function/)
    expect(reject({ ...MORTGAGE, outputs: [{ label: 'x', formula: 'P; fetch("/")' }] })).toMatch(/unexpected/)
    expect(reject({ ...MORTGAGE, outputs: [{ label: 'x', formula: 'P * later' }, { id: 'later', label: 'y', formula: '1' }] })).toMatch(/unknown name later/)
    expect(reject({ ...MORTGAGE, outputs: [{ label: 'x', formula: 'P / (years - 30)' }] })).toMatch(/not a finite number/)
    expect(reject({ ...MORTGAGE, inputs: [{ id: 'P', label: '本金', value: 1 }] })).toMatch(/min < max/)
    expect(reject({ ...MORTGAGE, inputs: [{ id: 'years', label: '期限', value: 30, options: [20, 30], min: 25, max: 30 }] })).toMatch(/takes no min, max or step/)
    expect(reject({ ...MORTGAGE, outputs: [{ label: 'x', formula: '1', hidden: true }] })).toMatch(/must be shown/)
    const rate = (step: number) => ({ ...MORTGAGE, inputs: [MORTGAGE.inputs[0], { ...MORTGAGE.inputs[1], step }, MORTGAGE.inputs[2]] })
    expect(reject(rate(0.3))).toMatch(/whole number of steps/)
    expect(reject(rate(5))).toMatch(/larger than max - min/)
    expect(reject({ type: 'scenarios', label: '档位', options: [{ name: 'A', items: [MORTGAGE] }, { name: 'B', items: [MORTGAGE] }] }))
      .toMatch(/calculator cannot go inside scenarios/)
  })
})
