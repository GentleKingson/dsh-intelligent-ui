import { describe, expect, it } from 'vitest'
import { validateInlineArgs } from '../src/inline.ts'
import { computeCalculator, parseFormula } from '../src/formula.ts'
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

  it('rejects code, unknown names and broken defaults with a reason the model can act on', () => {
    expect(reject({ ...MORTGAGE, outputs: [{ label: 'x', formula: 'constructor(1)' }] })).toMatch(/unknown function/)
    expect(reject({ ...MORTGAGE, outputs: [{ label: 'x', formula: 'P; fetch("/")' }] })).toMatch(/unexpected/)
    expect(reject({ ...MORTGAGE, outputs: [{ label: 'x', formula: 'P * later' }, { id: 'later', label: 'y', formula: '1' }] })).toMatch(/unknown name later/)
    expect(reject({ ...MORTGAGE, outputs: [{ label: 'x', formula: 'P / (years - 30)' }] })).toMatch(/not a finite number/)
    expect(reject({ ...MORTGAGE, inputs: [{ id: 'P', label: '本金', value: 1 }] })).toMatch(/min < max/)
    expect(reject({ ...MORTGAGE, outputs: [{ label: 'x', formula: '1', hidden: true }] })).toMatch(/must be shown/)
  })
})
