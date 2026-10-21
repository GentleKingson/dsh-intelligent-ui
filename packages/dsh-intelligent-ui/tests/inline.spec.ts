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
  ])('rejects %s', (_name, item) => {
    expect(rejectsItem(item)).toContain('HTML')
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
  ])('rejects %s', (_name, item, detail) => {
    expect(rejectsItem(item)).toContain(detail)
  })

  it('rejects arguments that are not one JSON value', () => {
    expect(readInlineArgs('{"items":[]} trailing').ok).toBe(false)
    expect(readInlineArgs('{"items":[').ok).toBe(false)
    expect(validateInlineArgs({ items: [] }).ok).toBe(false)
    expect(validateInlineArgs({ items: [MARKDOWN, MARKDOWN] })).toMatchObject({ ok: false, detail: expect.stringContaining('table, chart, or cards') })
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
