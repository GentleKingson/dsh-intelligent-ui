import { afterEach, describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import type { ToolDefinition } from '@deepseek-ai/dsh-tools'
import { INLINE_TOOL_NAME, InlineArgsStream, readInlineArgs, validateInlineArgs } from '../src/inline.ts'
import { installInline } from '../src/inline-tool.ts'

const MARKDOWN = { type: 'markdown', markdown: '**结论**：下半年利润改善。' }
const TABLE = { type: 'table', headers: ['季度', '营收（万元）'], rows: [['Q1', '1,200'], ['Q2', 1450]] }
const CHART = {
  type: 'chart', chart: 'line', headers: ['月份', '活跃用户（万）'],
  rows: [['1月', '12.5'], ['2月', '—'], ['3月', '15.8']], x: 0, series: [1],
}
const ARGS = JSON.stringify({ items: [MARKDOWN, TABLE, CHART] })
const growth = (name: string, rate: number) => ({
  name, items: [{ ...CHART, chart: 'bar', rows: [['2026', '100'], ['2027', String(100 * (1 + rate))]] }],
})
const SCENARIOS = { type: 'scenarios', label: '增长假设', options: [growth('保守', 0.05), growth('乐观', 0.2)] }

function rejectsItem(item: unknown): string {
  const outcome = validateInlineArgs({ items: [item] })
  expect(outcome.ok).toBe(false)
  return outcome.ok ? '' : outcome.detail
}

describe('InlineArgsStream', () => {
  it('shows each component exactly when it closes, before the call completes', () => {
    const stream = new InlineArgsStream()
    const firstEnd = ARGS.indexOf(JSON.stringify(MARKDOWN)) + JSON.stringify(MARKDOWN).length
    let seenAt = -1
    let previous = stream.feed('')
    for (let end = 1; end <= ARGS.length; end++) {
      const snapshot = stream.feed(ARGS.slice(0, end))
      if (seenAt < 0 && snapshot.items.length > 0) seenAt = end
      // Identity changes only when content changes.
      if (snapshot.items.length === previous.items.length && snapshot.closed === previous.closed) expect(snapshot).toBe(previous)
      previous = snapshot
    }
    expect(seenAt).toBe(firstEnd)
    expect(seenAt).toBeLessThan(ARGS.length)
    expect(previous.closed).toBe(true)
    expect(previous.items.map(outcome => outcome.ok && outcome.item.type)).toEqual(['markdown', 'table', 'chart'])
  })

  it('never parses an open component of an interrupted prefix', () => {
    const cut = ARGS.indexOf('"headers"') + 4
    const snapshot = new InlineArgsStream().feed(ARGS.slice(0, cut))
    expect(snapshot.items).toHaveLength(1)
    expect(snapshot.closed).toBe(false)
  })

  it('rejects a malformed element without hiding valid neighbours', () => {
    const raw = `{"items":[${JSON.stringify(MARKDOWN)},{"type":"markdown","markdown":"x",},"text",${JSON.stringify(TABLE)}]}`
    const snapshot = new InlineArgsStream().feed(raw)
    expect(snapshot.items.map(outcome => outcome.ok)).toEqual([true, false, false, true])
    expect(readInlineArgs(raw).ok).toBe(false)
  })

  it('ignores an items array nested below the top level and keys inside strings', () => {
    const raw = `{"note":"\\"items\\":[{\\"type\\":\\"markdown\\"}]","meta":{"items":[${JSON.stringify(MARKDOWN)}]},"items":[${JSON.stringify(TABLE)}]}`
    const snapshot = new InlineArgsStream().feed(raw)
    expect(snapshot.items.map(outcome => outcome.ok && outcome.item.type)).toEqual(['table'])
  })

  it('stops at the component and byte limits', () => {
    const many = JSON.stringify({ items: Array.from({ length: 9 }, () => MARKDOWN) })
    const snapshot = new InlineArgsStream().feed(many)
    expect(snapshot.items).toHaveLength(8)
    expect(snapshot.overLimit).toBe(true)
    expect(validateInlineArgs(JSON.parse(many)).ok).toBe(false)
    const huge = { items: [{ type: 'markdown', markdown: 'x'.repeat(70 * 1024) }] }
    expect(new InlineArgsStream().feed(JSON.stringify(huge)).overLimit).toBe(true)
    expect(validateInlineArgs(huge)).toMatchObject({ ok: false, detail: expect.stringContaining('bytes') })
    // Under the limit in UTF-16 code units, over it in UTF-8 bytes: the preview must agree with the final check.
    const wide = { items: [{ type: 'markdown', markdown: '中'.repeat(22 * 1024) }, TABLE] }
    expect(JSON.stringify(wide).length).toBeLessThan(64 * 1024)
    expect(new InlineArgsStream().feed(JSON.stringify(wide))).toMatchObject({ items: [], overLimit: true })
    expect(validateInlineArgs(wide)).toMatchObject({ ok: false, detail: expect.stringContaining('bytes') })
    const parse = vi.spyOn(JSON, 'parse')
    expect(readInlineArgs(JSON.stringify(huge))).toMatchObject({ ok: false, detail: expect.stringContaining('bytes') })
    expect(parse).not.toHaveBeenCalled()
    parse.mockRestore()
  })
})

describe('validateInlineArgs', () => {
  it('resolves charts from the cell text so values and data table agree', () => {
    const outcome = validateInlineArgs(JSON.parse(ARGS))
    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return
    const chart = outcome.items[2]
    expect(chart).toMatchObject({ type: 'chart', chart: 'line', categories: ['1月', '2月', '3月'], series: [{ values: [12.5, null, 15.8] }] })
    expect(outcome.items[1]).toMatchObject({ table: { rows: [['Q1', '1,200'], ['Q2', '1450']] } })
  })

  it('reads items that omit "type", and a chart without "x", as real follow-up turns write them', () => {
    const { type: _chart, x: _x, ...chart } = CHART
    const { type: _markdown, ...markdown } = MARKDOWN
    const { type: _table, ...table } = TABLE
    const outcome = validateInlineArgs({ items: [markdown, table, chart] })
    expect(outcome.ok && outcome.items.map(item => item.type)).toEqual(['markdown', 'table', 'chart'])
    expect(outcome.ok && outcome.items[2]).toMatchObject({ chart: 'line', categories: ['1月', '2月', '3月'] })
  })

  it('uses the same comparison binding for streamed preview and completed calls', () => {
    const comparison = { type: 'table', presentation: 'comparison', headers: ['方案', '价格'], rows: [['A', '¥30'], ['B', '未公布']] }
    const raw = JSON.stringify({ items: [MARKDOWN, comparison] })
    const preview = new InlineArgsStream().feed(raw).items[1]
    const complete = readInlineArgs(raw)
    expect(complete.ok).toBe(true)
    if (!complete.ok) return
    expect(preview).toEqual({ ok: true, item: complete.items[1] })
    expect(complete.items[1]).toMatchObject({ presentation: 'comparison', table: { headers: comparison.headers, rows: comparison.rows } })
    expect(rejectsItem({ ...comparison, rows: [['A', '1'], ['A', '2']] })).toContain('distinct')
    expect(rejectsItem({ ...comparison, rows: [['<b>A</b>', '1'], ['B', '2']] })).toContain('HTML')
  })

  it('resolves scenarios option by option, as the same components', () => {
    const repeat = { type: 'table', headers: CHART.headers, rows: [['2026', '100'], ['2027', '105']] }
    const options = [{ ...growth('保守', 0.05), items: [...growth('保守', 0.05).items, repeat] }, growth('乐观', 0.2)]
    const outcome = validateInlineArgs({ items: [MARKDOWN, { ...SCENARIOS, options }] })
    expect(outcome.ok && outcome.items[1]).toMatchObject({
      type: 'scenarios', label: '增长假设',
      options: [{ name: '保守', items: [{ type: 'chart', series: [{ values: [100, 105] }] }] }, { name: '乐观', items: [{ type: 'chart' }] }],
    })
  })

  it('plots a partial year as a sparse series and keeps an off-unit series table-only (T1 follow-up)', () => {
    const revenue = {
      type: 'chart', chart: 'bar', headers: ['季度', '2024', '2025', '2026', '同比'], x: 0, series: [1, 2, 3, 4],
      rows: [['Q1', '1000', '1200', '1500', '+20%'], ['Q2', '1300', '1450', '—', '+11.5%'], ['Q3', '1500', '1600', '—', '+6.7%'], ['Q4', '1700', '2100', '—', '+23.5%']],
    }
    const outcome = validateInlineArgs({ items: [MARKDOWN, revenue] })
    expect(outcome.ok && outcome.items[1]).toMatchObject({
      series: [{ name: '2024' }, { name: '2025' }, { name: '2026', values: [1500, null, null, null] }], tableOnly: ['同比'],
    })
    expect(rejectsItem({ ...revenue, headers: ['季度', '说明'], rows: revenue.rows.map(row => [row[0], '增长']), series: [1] })).toContain('same-unit numeric')
  })

  it('unwraps a whole-cell **bold** change marker so the cell stays a plain number (T1 follow-up)', () => {
    const marked = { type: 'table', headers: ['季度', '2025', '备注'],
      rows: [['Q3', '1600', ''], ['Q4', '**2100**', '**已修订**'], ['全年', ' **6,350** ', 'a **b** c'], ['x', '**a** and **b**', '**']] }
    const outcome = validateInlineArgs({ items: [MARKDOWN, marked] })
    expect(outcome.ok && outcome.items[1]).toMatchObject({
      table: { rows: [['Q3', '1600', ''], ['Q4', '2100', '已修订'], ['全年', '6,350', 'a **b** c'], ['x', '**a** and **b**', '**']] },
    })
    const chart = validateInlineArgs({ items: [MARKDOWN, { ...CHART, rows: [['1月', '**12.5**'], ['2月', '13'], ['3月', '15.8']] }] })
    expect(chart.ok && chart.items[1]).toMatchObject({ series: [{ values: [12.5, 13, 15.8] }] })
  })

  it('accepts one card of fenced code per option, as the prompt tells the model (T4)', () => {
    const code = (lang: string, body: string) => ({ title: lang, markdown: `\`\`\`python\n${body}\n\`\`\`` })
    const cards = { type: 'cards', cards: [code('csv', 'import csv\nrows = list(csv.DictReader(open("a.csv")))'),
      code('pandas', 'import pandas as pd\ndf = pd.read_csv("a.csv")  # dtype<str>')] }
    expect(validateInlineArgs({ items: [MARKDOWN, cards] }).ok).toBe(true)
  })

  it('drops a table that repeats a chart\'s data and keeps one with other columns', () => {
    const repeat = { type: 'table', headers: CHART.headers, rows: CHART.rows }
    const extra = { type: 'table', headers: [...CHART.headers, '环比'], rows: CHART.rows.map((row, index) => [...row, `${index}%`]) }
    const outcome = validateInlineArgs({ items: [MARKDOWN, repeat, CHART, extra] })
    expect(outcome.ok && outcome.items.map(item => item.type)).toEqual(['markdown', 'chart', 'table'])
    expect(outcome.ok && outcome.items[2]).toMatchObject({ table: { headers: ['月份', '活跃用户（万）', '环比'] } })
  })

  it.each([
    ['script tag', { type: 'markdown', markdown: 'hi <script>alert(1)</script>' }],
    ['img onerror', { type: 'markdown', markdown: '<img src=x onerror=alert(1)>' }],
    ['markdown image', { type: 'markdown', markdown: '![x](https://example.com/a.png)' }],
    ['javascript link', { type: 'markdown', markdown: '[go](javascript:alert(1))' }],
    ['HTML card title', { type: 'cards', cards: [{ title: '<b>A</b>', markdown: 'a' }, { title: 'B', markdown: 'b' }] }],
    ['HTML table cell', { ...TABLE, rows: [['<iframe src=x>', '1']] }],
    ['HTML between escaped backticks', { type: 'markdown', markdown: '\\`<img src=x onerror=alert(1)>\\`' }],
    ['HTML outside a code span', { type: 'markdown', markdown: '`a` <script>alert(1)</script> `b`' }],
  ])('rejects %s', (_name, item) => {
    expect(rejectsItem(item)).toContain('HTML')
  })

  it('accepts tags and images inside code spans and fences, as real answers write them', () => {
    const code = ['用 `unsafe`、`Arc<Mutex<_>>` 控制复杂度', '撤销改动用 `git restore <file>`', '```html\n<div>![x](y)</div>\n```']
    for (const markdown of code) expect(validateInlineArgs({ items: [{ type: 'markdown', markdown }, TABLE] }).ok).toBe(true)
  })

  it.each([
    ['unknown component', { type: 'html', html: '<p>' }, 'schema'],
    ['unknown field', { ...MARKDOWN, onClick: 'x' }, 'schema'],
    ['row width mismatch', { ...TABLE, rows: [['Q1', '1', 'extra']] }, 'cells'],
    ['text in a series', { ...CHART, rows: [['1月', '12'], ['2月', '很多'], ['3月', '15']] }, 'numeric'],
    ['mixed units', { ...CHART, rows: [['1月', '12%'], ['2月', '13 万'], ['3月', '15%']] }, 'numeric'],
    ['line over unordered axis', { ...CHART, rows: [['3月', '1'], ['1月', '2'], ['2月', '3']] }, 'ordered'],
    ['axis index out of range', { ...CHART, x: 5 }, 'category'],
    ['one card', { type: 'cards', cards: [{ title: 'A', markdown: 'a' }] }, 'schema'],
    ['one scenario option', { ...SCENARIOS, options: [growth('保守', 0.05)] }, 'schema'],
    ['repeated scenario names', { ...SCENARIOS, options: [growth('保守', 0.05), growth('保守', 0.2)] }, 'differ'],
    ['nested scenarios', { ...SCENARIOS, options: [growth('保守', 0.05), { name: '乐观', items: [SCENARIOS] }] }, 'option 1 item 0: a scenarios cannot go inside scenarios'],
    ['invalid item in an option', { ...SCENARIOS, options: [growth('保守', 0.05), { name: '乐观', items: [{ ...TABLE, rows: [['Q1']] }] }] }, 'option 1 item 0'],
    ['HTML in a scenario name', { ...SCENARIOS, options: [growth('<b>保守</b>', 0.05), growth('乐观', 0.2)] }, 'HTML'],
  ])('rejects %s', (_name, item, detail) => {
    expect(rejectsItem(item)).toContain(detail)
  })

  it('rejects arguments that are not one JSON value', () => {
    expect(readInlineArgs('{"items":[]} trailing').ok).toBe(false)
    expect(readInlineArgs('{"items":[').ok).toBe(false)
    expect(validateInlineArgs({ items: [] }).ok).toBe(false)
    expect(validateInlineArgs({ items: [MARKDOWN, MARKDOWN] })).toMatchObject({ ok: false, detail: expect.stringContaining('calculator item') })
    expect(validateInlineArgs({ items: [TABLE, MARKDOWN] })).toMatchObject({ ok: false, detail: expect.stringContaining('markdown conclusion') })
  })
})

describe('installInline', () => {
  const contexts: Context[] = []
  afterEach(async () => { await Promise.allSettled(contexts.splice(0).map(ctx => ctx.fiber.dispose())) })

  function agent(id: string, origin = 'user') {
    const tools: ToolDefinition[] = []
    const sections: string[] = []
    return {
      session: { id, header: { origin } },
      tools,
      sections,
      ctx: {
        tools: { register: (tool: ToolDefinition) => { tools.push(tool); return () => { tools.splice(tools.indexOf(tool), 1) } } },
        systemPrompt: {
          getSectionOrder: () => 2900,
          section: (section: { name: string }) => { sections.push(section.name); return () => { sections.splice(sections.indexOf(section.name), 1) } },
        },
      },
    }
  }

  function setup(ptc: ReadonlySet<unknown> = new Set()) {
    const ctx = new Context()
    contexts.push(ctx)
    const live: ReturnType<typeof agent>[] = []
    const roots: ReturnType<typeof agent>[] = []
    ctx.provide('agents', { list: () => [...live], roots: () => [...roots] } as never)
    ctx.provide('tools', { get: (name: string, scope: unknown) => name === 'run_code' && ptc.has(scope) ? {} : undefined } as never)
    const add = (entry: ReturnType<typeof agent>, root = true, created = true) => {
      live.push(entry)
      if (root) roots.push(entry)
      if (created) ctx.emit('agent/created' as never, { agent: entry } as never)
      return entry
    }
    return { ctx, add }
  }

  it('offers the tool and guidance only to native root agents', () => {
    const ptcAgent = agent('ptc')
    const { ctx, add } = setup(new Set([ptcAgent]))
    const existing = add(agent('before'), true, false)
    installInline(ctx)
    expect(existing.tools.map(tool => tool.name)).toEqual([INLINE_TOOL_NAME])
    const root = add(agent('root'))
    const sub = add(agent('sub', 'subagent'), false)
    add(ptcAgent)
    expect(root.tools.map(tool => tool.name)).toEqual([INLINE_TOOL_NAME])
    expect(root.sections).toEqual(['intelligent-ui:inline'])
    expect(sub.tools).toHaveLength(0)
    expect(ptcAgent.tools).toHaveLength(0)
    expect(ptcAgent.sections).toHaveLength(0)
  })

  it('validates, concludes the turn on success, and fails readable otherwise', async () => {
    const { ctx, add } = setup()
    installInline(ctx)
    const tool = add(agent('root')).tools[0] as ToolDefinition
    const exec = (args: unknown, parent?: symbol) => {
      const concludeTurn = vi.fn()
      return { concludeTurn, run: tool.execute(args, { concludeTurn, parent } as never) }
    }
    const ok = exec(JSON.parse(ARGS))
    await expect(ok.run).resolves.toEqual({ components: 3 })
    expect(ok.concludeTurn).toHaveBeenCalledOnce()
    const bad = exec({ items: [{ type: 'markdown', markdown: '<script>x</script>' }] })
    await expect(bad.run).rejects.toThrow(/plain Markdown/)
    expect(bad.concludeTurn).not.toHaveBeenCalled()
    await expect(exec(JSON.parse(ARGS), Symbol('ptc')).run).rejects.toThrow(/directly/)
  })

  it('unregisters everything when the plugin goes away', async () => {
    const { ctx, add } = setup()
    const scope = ctx.plugin({ name: 'inline', apply: installInline })
    await scope
    const root = add(agent('root'))
    expect(root.tools).toHaveLength(1)
    await scope.dispose()
    expect(root.tools).toHaveLength(0)
    expect(root.sections).toHaveLength(0)
  })
})
