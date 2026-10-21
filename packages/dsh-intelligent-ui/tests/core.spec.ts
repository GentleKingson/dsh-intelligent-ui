import { describe, expect, it } from 'vitest'
import { analyzeColumn, isOrderedAxis, parseCell, valueAxis } from '../src/numeric.ts'
import { readProgram } from '../src/program.ts'
import { screen } from '../src/smart-auto.ts'
import { buildSourceIndex } from '../src/source-index.ts'
import { SAMPLES } from './fixtures/smart-auto-samples.ts'

const TABLE_ANSWER = [
  '## 季度营收',
  '',
  '| 季度 | 营收 | 利润 | 备注 |',
  '| --- | ---: | ---: | --- |',
  '| Q1 | $1,200 | $-30 | 淡季 |',
  '| Q2 | $1,450.5 | $120 | — |',
  '| Q3 | — | $80 | 数据缺失 |',
  '| Q4 | $2,000 | $310 | 旺季 |',
  '',
  '整体来看下半年增长明显。',
].join('\n')

describe('numeric fidelity', () => {
  it('parses thousands, currency, sign, and suffix units exactly', () => {
    expect(parseCell('$1,234.50')).toEqual({ kind: 'number', value: 1234.5, unit: '$|' })
    expect(parseCell('−12%')).toEqual({ kind: 'number', value: -12, unit: '|%' })
    expect(parseCell('$-30')).toEqual({ kind: 'number', value: -30, unit: '$|' })
    expect(parseCell('3 ms')).toEqual({ kind: 'number', value: 3, unit: '|ms' })
  })

  it('treats explicit blanks as missing and ambiguous cells as text', () => {
    for (const blank of ['', '-', '—', 'N/A', '无']) expect(parseCell(blank).kind).toBe('missing')
    for (const text of ['约 20', '1.2.3', '12-15', '1234567890123456', '$€5']) expect(parseCell(text).kind).toBe('text')
  })

  it('plots a column only with one unit and no text cells; missing stays a gap', () => {
    expect(analyzeColumn(['1', '—', '3']).numeric?.values).toEqual([1, null, 3])
    expect(analyzeColumn(['1%', '2 ms']).numeric).toBeNull()
    expect(analyzeColumn(['1', 'many']).numeric).toBeNull()
    expect(analyzeColumn(['1', '—']).categorical).toBe(false)
  })

  it('keeps an escaped pipe inside its cell', () => {
    const table = buildSourceIndex('| 名称 | 值 |\n| --- | ---: |\n| a \\| b | 1 |\n| c | 2 |').tables.get('t0')
    expect(table?.data.headers).toHaveLength(2)
    expect(table?.data.rows[0]).toEqual(['a | b', '1'])
  })
})

describe('chart axes', () => {
  it.each([
    [['Q1', 'Q2', 'Q3']],
    [['2026-01', '2026-02', '2026-03']],
    [['1月', '2月', '3月']],
    [['2024', '2025年', '2026']],
    [['2025 Q4', '2026 Q1']],
    [['Jan', 'Feb', 'Mar']],
  ])('accepts %j as an ordered line axis', (cells) => {
    expect(isOrderedAxis(cells)).toBe(true)
  })

  it.each([
    [['A', 'B', 'C']],
    [['Q2', 'Q1', 'Q3']],
    [['Q1', 'Q1', 'Q2']],
    [['Q1', '2026-02']],
    [['2026-13', '2026-14']],
  ])('rejects %j as a line axis', (cells) => {
    expect(isOrderedAxis(cells)).toBe(false)
  })

  it('zooms a compact line, keeps zero otherwise, and never yields non-finite ticks', () => {
    const compact = valueAxis([95, 97, 100], 'line')
    expect(compact.zeroBased).toBe(false)
    expect(compact.min).toBeGreaterThan(0)
    expect(compact.min).toBeLessThan(95)
    expect(compact.max).toBeGreaterThanOrEqual(100)
    expect(valueAxis([2.5, 9.5], 'line').min).toBe(0)
    expect(valueAxis([95, 97, 100], 'bar').min).toBe(0)
    const mixed = valueAxis([-30, 80, 120], 'bar')
    expect(mixed.min).toBeLessThan(-30)
    expect(mixed.ticks).toContain(0)
    expect(valueAxis([-100, -97], 'line').max).toBeLessThanOrEqual(0)
    for (const values of [[], [0, 0], [5, 5], [-5, -5], [0.0001, 0.0002], [1e12, 1e12 + 1]]) {
      for (const chart of ['bar', 'line'] as const) {
        const axis = valueAxis(values, chart)
        expect(axis.ticks.length).toBeGreaterThan(1)
        expect(axis.ticks.length).toBeLessThan(20)
        expect(axis.ticks.every(Number.isFinite)).toBe(true)
        for (const value of values) expect(value >= axis.min && value <= axis.max).toBe(true)
      }
    }
  })
})

describe('program validation (fails closed)', () => {
  const index = buildSourceIndex(TABLE_ANSWER)
  const table = '{"version":1,"items":[{"type":"table","table":"t0"}]}'

  it('binds ids to verbatim source text and data', () => {
    const outcome = readProgram('{"version":1,"items":[{"type":"markdown","blocks":["b2"]},{"type":"chart","table":"t0","chart":"bar","x":"c0","series":["c1","c2"]}]}', index)
    if (outcome.kind !== 'view') throw new Error(JSON.stringify(outcome))
    expect(outcome.view.items[0]).toEqual({ type: 'markdown', markdown: '整体来看下半年增长明显。' })
    const chart = outcome.view.items[1]
    if (chart?.type !== 'chart') throw new Error('expected chart')
    expect(chart.categories).toEqual(['Q1', 'Q2', 'Q3', 'Q4'])
    expect(chart.series).toEqual([
      { name: '营收', values: [1200, 1450.5, null, 2000] },
      { name: '利润', values: [-30, 120, 80, 310] },
    ])
    expect(chart.unit).toBe('$')
  })

  it('shows a charted table once, through the chart; another table stays', () => {
    const two = buildSourceIndex(`${TABLE_ANSWER}\n\n| 地区 | 门店 |\n| --- | --- |\n| 华东 | 12 |\n| 华南 | 9 |`)
    const outcome = readProgram('{"version":1,"items":[{"type":"table","table":"t0"},{"type":"chart","table":"t0","chart":"line","x":"c0","series":["c2"]},{"type":"table","table":"t1"}]}', two)
    if (outcome.kind !== 'view') throw new Error(JSON.stringify(outcome))
    expect(outcome.view.items.map(item => item.type)).toEqual(['chart', 'table'])
    const [chart, table] = outcome.view.items
    expect(chart?.type === 'chart' && chart.table.rows).toHaveLength(4)
    expect(table?.type === 'table' && table.table.headers).toEqual(['地区', '门店'])
  })

  it('draws unordered categories only as bars', () => {
    const shops = buildSourceIndex('| 门店 | 销量 |\n| --- | --- |\n| A | 3 |\n| B | 5 |\n| C | 4 |')
    expect(readProgram('{"version":1,"items":[{"type":"chart","table":"t0","chart":"bar","x":"c0","series":["c1"]}]}', shops).kind).toBe('view')
    expect(readProgram('{"version":1,"items":[{"type":"chart","table":"t0","chart":"line","x":"c0","series":["c1"]}]}', shops)).toMatchObject({ kind: 'invalid' })
  })

  it('accepts SKIP and exactly one enclosing json fence', () => {
    expect(readProgram(' SKIP\n', index).kind).toBe('skip')
    expect(readProgram(`\`\`\`json\n${table}\n\`\`\``, index).kind).toBe('view')
  })

  it.each([
    ['trailing text', `${table} done`],
    ['two documents', `${table}\n${table}`],
    ['prose before fence', `Here:\n\`\`\`json\n${table}\n\`\`\``],
    ['duplicate key', '{"version":1,"items":[{"type":"table","table":"t0","table":"t0"}]}'],
    ['duplicate root key', `{"version":1,"version":1,"items":[{"type":"table","table":"t0"}]}`],
    ['unknown field / model text', '{"version":1,"items":[{"type":"markdown","blocks":["b2"],"markdown":"injected"}]}'],
    ['unknown component', '{"version":1,"items":[{"type":"html","html":"<script>"}]}'],
    ['unknown block id', '{"version":1,"items":[{"type":"markdown","blocks":["b99"]}]}'],
    ['unknown table id', '{"version":1,"items":[{"type":"table","table":"t7"}]}'],
    ['repeated block', '{"version":1,"items":[{"type":"markdown","blocks":["b2","b2"]}]}'],
    ['text column as series', '{"version":1,"items":[{"type":"chart","table":"t0","chart":"bar","x":"c0","series":["c3"]}]}'],
    ['axis with a missing cell', '{"version":1,"items":[{"type":"chart","table":"t0","chart":"line","x":"c1","series":["c2"]}]}'],
    ['wrong version', '{"version":2,"items":[{"type":"table","table":"t0"}]}'],
    ['empty items', '{"version":1,"items":[]}'],
    ['not json', 'root = Stack([Table("t0")])'],
  ])('rejects %s', (_name, output) => {
    expect(readProgram(output, index).kind).toBe('invalid')
  })
})

describe('Smart Auto screen', () => {
  const verdict = (text: string) => screen(text, buildSourceIndex(text))

  it.each([
    ['greeting', '你好！有什么可以帮你？'],
    ['plain explanation', '闭包是函数与其词法环境的组合。\n\n它让内部函数可以访问外部变量。'],
    ['code', '```ts\nconst a = 1\n```\n\n运行上面的代码即可。'],
    ['numbers in prose', '去年营收 1200 万，今年 1500 万，增长 25%。'],
    ['single-row table', '| a | b |\n| --- | --- |\n| 1 | 2 |'],
  ])('keeps Markdown for %s', (_name, text) => {
    expect(verdict(text)).toEqual({ candidate: false, reason: 'not-structured' })
  })

  it('flags tables and chartable columns', () => {
    expect(verdict(TABLE_ANSWER)).toEqual({ candidate: true, hints: ['table', 'chart'] })
  })

  it('flags independent sections and structured lists as cards', () => {
    expect(verdict('## 方案 A\n\n成本低。\n\n## 方案 B\n\n速度快。')).toEqual({ candidate: true, hints: ['cards'] })
    expect(verdict('- **Redis**：内存快\n- **Postgres**：事务强\n- **SQLite**：嵌入式')).toEqual({ candidate: true, hints: ['cards'] })
  })

  it.each(SAMPLES.filter(sample => sample.confidence === 'clear').map(sample => [sample.id, sample] as const))(
    'labeled sample %s: clear negatives make no call, clear positives keep their hint',
    (_id, sample) => {
      const result = verdict(sample.text)
      if (sample.accept === 'skip') expect(result.candidate).toBe(false)
      else expect(result.candidate && result.hints.some(hint => sample.accept.includes(hint))).toBe(true)
    },
  )

  it('skips oversized answers before any call', () => {
    expect(verdict(`| a | b |\n| - | - |\n${'| x | 1 |\n'.repeat(4000)}`)).toEqual({ candidate: false, reason: 'too-large' })
  })
})
