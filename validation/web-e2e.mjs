/**
 * Web acceptance run against a live `dsh --profile <p>` server whose model
 * endpoint is the LOCAL MOCK (mock-messages-server.mjs). Prints one PASS/FAIL
 * line per check and writes screenshots to <outDir>.
 *
 * Usage: node web-e2e.mjs <url-with-token> <outDir> <mock.jsonl> [main|touch|reload|absent|inline|inline-reload|inline-ptc|real]
 * The inline scenarios need the profile patched to `mode: inline-stream`.
 * Requires playwright-core and Chromium (CHROMIUM_PATH).
 */

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'

const [url, outDir, mockLog, scenario = 'main'] = process.argv.slice(2)
const executablePath = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok })
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail === '' ? '' : ` — ${detail}`}`)
}
const mockEntries = () => !existsSync(mockLog) ? [] : readFileSync(mockLog, 'utf8').trim().split('\n').filter(Boolean).map(line => JSON.parse(line))
const auxCalls = () => mockEntries().filter(entry => entry.kind === 'auxiliary')

const browser = await chromium.launch({ executablePath })
const errors = []

async function open(colorScheme = 'light', device = { viewport: { width: 1280, height: 1000 } }) {
  const context = await browser.newContext({ ...device, locale: 'zh-CN', colorScheme })
  const page = await context.newPage()
  page.on('pageerror', error => { errors.push(error.message) })
  await page.goto(url)
  await page.getByRole('button', { name: /Continue|继续/ }).click({ timeout: 8000 }).catch(() => {})
  return page
}

async function ask(page, prompt, wait = true) {
  await page.getByText('新会话', { exact: true }).first().click()
  await page.waitForTimeout(800)
  const picker = page.getByRole('button', { name: '打开', exact: true })
  const send = async () => {
    const box = page.getByRole('textbox').last()
    await box.click()
    // A fresh profile has no workspace yet: clicking the composer opens the picker.
    if (await picker.isVisible().catch(() => false)) {
      await picker.click()
      await page.waitForTimeout(800)
      await box.click()
    }
    await box.fill('')
    await box.pressSequentially(prompt)
    await page.keyboard.press('Enter')
  }
  await send()
  await page.waitForTimeout(1200)
  if (await picker.isVisible().catch(() => false)) {
    await picker.click()
    await page.waitForTimeout(800)
    await send()
  }
  if (wait) await page.getByText('已完成').last().waitFor({ timeout: 20000 })
}

/** Rows of the first interactive table, first column. */
const firstColumn = page => page.locator('.diu-table').first().locator('tbody tr td:first-child').allTextContents()

if (scenario === 'main') {
  const page = await open()

  // A. Table + chart answer.
  const before = auxCalls().length
  await ask(page, '请给出2025年各季度经营数据')
  const region = page.locator('.diu-region').last()
  await region.waitFor({ timeout: 25000 })
  check('A1 ready region appended under the answer', await region.isVisible())
  check('A2 exactly one auxiliary call, no tools', auxCalls().length - before === 1 && auxCalls().at(-1).tools === 0,
    `calls=${auxCalls().length - before} maxTokens=${auxCalls().at(-1)?.maxTokens}`)
  const originalTables = await page.locator('table:not(.diu-root table)').count()
  const originalText = await page.locator('table:not(.diu-root table)').first().textContent()
  check('A3 original Markdown table still rendered verbatim', originalTables >= 1 && originalText.includes('1,200') && originalText.includes('—'))
  await region.screenshot({ path: join(outDir, 'A-ready.png') })
  check('A3b charted table is not repeated as a separate table', await region.locator('.diu-body > .diu-table').count() === 0)
  // The source rows stay reachable, sortable, and filterable through the chart.
  await region.getByRole('button', { name: '查看数据' }).click()

  const header = region.locator('.diu-table').first().getByRole('button', { name: /营收/ })
  await header.click()
  check('A4 sort ascending keeps missing last', JSON.stringify(await firstColumn(region)) === '["Q1","Q2","Q4","Q3"]', JSON.stringify(await firstColumn(region)))
  await header.click()
  check('A5 sort descending keeps missing last', JSON.stringify(await firstColumn(region)) === '["Q4","Q2","Q1","Q3"]', JSON.stringify(await firstColumn(region)))
  await region.locator('.diu-table input').first().fill('Q4')
  check('A6 filter', (await firstColumn(region)).length === 1)
  await region.getByRole('button', { name: '清除' }).first().click()
  check('A7 clear restores source order', JSON.stringify(await firstColumn(region)) === '["Q1","Q2","Q3","Q4"]')

  const hits = region.locator('.diu-hit')
  await hits.nth(3).hover()
  const tooltip = await region.locator('.diu-tooltip').textContent()
  check('A8 tooltip shows exact values', tooltip.includes('Q4') && tooltip.includes('2,000') && tooltip.includes('310'), tooltip)
  await hits.nth(2).hover()
  check('A9 missing value shown as missing, not zero', (await region.locator('.diu-tooltip').textContent()).includes('缺失'))
  await region.screenshot({ path: join(outDir, 'A-tooltip.png') })
  await hits.nth(1).focus()
  check('A10 keyboard focus shows tooltip', (await region.locator('.diu-tooltip').textContent()).includes('Q2'))
  check('A11 negative bar drawn below zero', await region.locator('.diu-bars.diu-s1 rect').first().evaluate((rect) => {
    const zero = document.querySelector('.diu-zero')
    return Number(rect.getAttribute('y')) === Number(zero?.getAttribute('y1'))
  }))

  const legend = region.locator('.diu-legend-item', { hasText: '利润' })
  await legend.click()
  check('A12 legend toggle hides a series', (await legend.getAttribute('aria-pressed')) === 'false' && await region.locator('.diu-bars').count() === 1)
  await legend.click()
  check('A13 view data shows the source table', await region.locator('figure .diu-table').count() === 1)
  await region.screenshot({ path: join(outDir, 'A-view-data.png') })

  await region.locator('.diu-toggle').click()
  check('A14 collapse', await region.locator('.diu-body').count() === 0)
  await region.locator('.diu-toggle').click()
  await region.getByRole('button', { name: '关闭交互视图' }).click()
  check('A15 close leaves a restore control', await page.getByRole('button', { name: '显示交互视图' }).last().isVisible())
  await page.getByRole('button', { name: '显示交互视图' }).last().click()

  // B. Independent options → cards.
  await ask(page, '比较三种存储方案')
  const cards = page.locator('.diu-region').last().locator('.diu-card')
  await cards.first().waitFor({ timeout: 25000 })
  check('B1 cards for independent options', await cards.count() === 3, `${await cards.count()} cards`)
  check('B2 card title copied from source heading', (await cards.first().locator('.diu-card-title').textContent()) === '方案 A：Redis')
  await page.locator('.diu-region').last().screenshot({ path: join(outDir, 'B-cards.png') })

  // L. Ordered months → line chart that breaks at the missing month.
  await ask(page, '近六个月活跃用户趋势')
  const lineRegion = page.locator('.diu-region').last()
  await lineRegion.locator('.diu-line').waitFor({ timeout: 25000 })
  const d = await lineRegion.locator('.diu-line path').first().getAttribute('d')
  const markers = await lineRegion.locator('.diu-line > :not(path:first-child)').count()
  check('L1 line chart breaks at the missing value', (d.match(/M/g) ?? []).length === 2 && markers === 5, `d=${d} markers=${markers}`)
  const ticks = await lineRegion.locator('.diu-grid text').allTextContents()
  check('L2 compact line zooms with labeled ticks and says where the axis starts',
    ticks[0] !== '0' && await lineRegion.getByText(`纵轴从 ${ticks[0]} 起`).isVisible(), JSON.stringify(ticks))
  await lineRegion.screenshot({ path: join(outDir, 'L-line.png') })

  // C. Greeting → zero calls, no region.
  const beforeGreeting = auxCalls().length
  await ask(page, '你好')
  await page.waitForTimeout(2500)
  check('C1 plain answer: no auxiliary call', auxCalls().length === beforeGreeting)
  check('C2 plain answer: no region', await page.locator('.diu-root').count() === 0)

  // D. Injected/invalid program → failure fallback, retry without a chat message.
  const beforeInjection = auxCalls().length
  await ask(page, '注入测试')
  const failed = page.getByText('交互视图生成失败，已保留原文')
  await failed.waitFor({ timeout: 25000 })
  check('D1 invalid model output falls back to original Markdown', await failed.isVisible()
    && (await page.locator('table:not(.diu-root table)').last().textContent()).includes('2,000'))
  check('D2 no injected markup rendered', await page.locator('.diu-region').count() === 0)
  const messagesBefore = await page.getByText('已完成').count()
  await page.getByRole('button', { name: '重试' }).click()
  await page.waitForTimeout(3000)
  check('D3 retry: one more auxiliary call, no new chat turn', auxCalls().length - beforeInjection === 2 && await page.getByText('已完成').count() === messagesBefore)
  await page.screenshot({ path: join(outDir, 'D-failed.png') })
  await page.close()

  // E. Dark mode follows the host theme.
  const dark = await open('dark')
  await ask(dark, '请给出2025年各季度经营数据')
  const darkRegion = dark.locator('.diu-region').first()
  await darkRegion.waitFor({ timeout: 15000 })
  const isDark = await dark.evaluate(() => document.body.hasAttribute('data-ds-dark-theme'))
  const color = await darkRegion.locator('.diu-bars.diu-s0 rect').first().evaluate(el => getComputedStyle(el).fill)
  check('E1 dark theme tokens applied', isDark && color === 'rgb(122, 162, 247)', `dark=${isDark} fill=${color}`)
  await darkRegion.screenshot({ path: join(outDir, 'E-dark.png') })
  await dark.close()
} else if (scenario === 'touch') {
  // Phone-width touch device: tapping a point shows its values inside the viewport.
  // Ask at desktop width (the host sidebar is collapsed on phones), then narrow.
  const page = await open('light', { viewport: { width: 1280, height: 1000 }, hasTouch: true })
  await ask(page, '请给出2025年各季度经营数据（触屏）')
  await page.setViewportSize({ width: 375, height: 800 })
  const region = page.locator('.diu-region').last()
  await region.locator('.diu-hit').first().waitFor({ timeout: 25000 })
  const hits = region.locator('.diu-hit')
  const inside = async () => {
    const box = await region.locator('.diu-tooltip').boundingBox({ timeout: 1000 }).catch(() => null)
    return box !== null && box.x >= 0 && box.x + box.width <= 375
  }
  for (const [name, index, category] of [['first', 0, 'Q1'], ['last', 3, 'Q4']]) {
    await hits.nth(index).tap()
    const text = await region.locator('.diu-tooltip').textContent({ timeout: 1000 }).catch(() => null)
    check(`T1 tap on ${name} point shows its values`, text?.includes(category) === true, text ?? 'no tooltip')
    check(`T2 tooltip of ${name} point stays inside a 375px viewport`, text !== null && await inside(),
      JSON.stringify(await region.locator('.diu-tooltip').boundingBox({ timeout: 1000 }).catch(() => null)))
    await region.screenshot({ path: join(outDir, `T-tap-${name}.png`) })
  }
  check('T3 region causes no horizontal page scroll', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
  await page.close()
} else if (scenario === 'reload') {
  // Reload and a second window read the stored view; neither calls the model again.
  const page = await open()
  await ask(page, '请给出2025年各季度经营数据（刷新）')
  await page.locator('.diu-region').last().waitFor({ timeout: 25000 })
  const calls = auxCalls().length
  await page.reload()
  await page.locator('.diu-region').last().waitFor({ timeout: 15000 })
  check('R1 reload shows the stored view', await page.locator('.diu-region').count() === 1, page.url())
  const second = await page.context().newPage()
  second.on('pageerror', error => { errors.push(error.message) })
  await second.goto(page.url())
  await second.locator('.diu-region').last().waitFor({ timeout: 15000 })
  check('R2 second window shows the same view', await second.locator('.diu-region').count() === 1)
  await page.waitForTimeout(2000)
  check('R3 no new auxiliary call', auxCalls().length === calls, `${auxCalls().length - calls} new`)
  await second.close()
  await page.close()
} else if (scenario === 'inline') {
  const page = await open()
  const since = (count) => {
    const entries = mockEntries().slice(count)
    return { agent: entries.filter(entry => entry.kind === 'agent'), aux: entries.filter(entry => entry.kind === 'auxiliary') }
  }
  // Sampled in the page every 20 ms so the timeline does not depend on the driver's round trips.
  await page.evaluate(() => {
    const timeline = []
    globalThis.diuTimeline = timeline
    const timer = setInterval(() => {
      const live = document.querySelectorAll('[data-diu-inline] .diu-body > *').length
      const streaming = [...document.querySelectorAll('[data-diu-inline] .diu-status')].some(node => node.textContent.includes('正在生成交互视图'))
      const tail = document.querySelectorAll('[data-diu-inline-tail]').length
      const last = timeline.at(-1)
      if (last === undefined || last.live !== live || last.streaming !== streaming || last.tail !== tail) timeline.push({ at: Math.round(performance.now()), live, streaming, tail })
      if (tail > 0) clearInterval(timer)
    }, 20)
  })

  // N. Streamed view: components appear one by one while the tool call is still preparing.
  let count = mockEntries().length
  await ask(page, '请给出2025年经营数据（流式）', false)
  await page.locator('[data-diu-inline] .diu-body > *').first().waitFor({ timeout: 20000 })
  await page.locator('[data-diu-inline]').last().screenshot({ path: join(outDir, 'N-first-component.png') })
  await page.locator('[data-diu-inline-tail]').last().waitFor({ timeout: 20000 })
  const timeline = await page.evaluate(() => globalThis.diuTimeline)
  const first = timeline.find(snapshot => snapshot.live > 0)
  const settled = timeline.find(snapshot => snapshot.tail > 0)
  console.log(`   timeline (ms): ${JSON.stringify(timeline)}`)
  check('N1 first component visible while the call is still streaming', first !== undefined && first.streaming && first.live === 1 && first.tail === 0,
    `first at ${first?.at}, settled view at ${settled?.at} (+${settled === undefined || first === undefined ? '?' : settled.at - first.at} ms)`)
  // The last component closes in the same chunk as the arguments, so it shows with the settled call.
  const streamed = timeline.filter(snapshot => snapshot.streaming && snapshot.live > 0).map(snapshot => snapshot.live)
  check('N2 components arrive one by one before the call completes', JSON.stringify(streamed) === '[1,2,3]', JSON.stringify(streamed))
  await page.getByText('已完成').last().waitFor({ timeout: 20000 })
  const tail = page.locator('[data-diu-inline-tail]').last()
  await tail.waitFor({ timeout: 10000 })
  check('N3 settled view stays in the default chat view', await tail.locator('.diu-body > *').count() === 4
    && await tail.locator('.diu-chart').count() === 1 && await tail.locator('.diu-cards .diu-card').count() === 3)
  check('N3b conclusion readable without expanding the turn', await tail.locator('.diu-body > .diu-md').first().textContent().then(text => text.includes('结论')))
  // DSH folds a completed turn's process rows; the lead text before the call is one of them.
  await page.getByText(/已完成，用时/).last().click()
  check('N4 lead Markdown answer stays readable in the expanded turn', await page.getByText('2025 年下半年利润改善，详见下方视图。').last().isVisible())
  await page.getByText(/已完成，用时/).last().click()
  const header = tail.locator('.diu-table').first().getByRole('button', { name: /营收/ })
  await header.click()
  check('N5 settled table is interactive', JSON.stringify(await firstColumn(tail)) === '["Q1","Q2","Q4","Q3"]', JSON.stringify(await firstColumn(tail)))
  await tail.locator('.diu-hit').nth(3).hover()
  check('N6 settled chart is interactive', (await tail.locator('.diu-tooltip').textContent()).includes('2,000'))
  await tail.screenshot({ path: join(outDir, 'N-settled.png') })
  let calls = since(count)
  check('N7 one agent request, zero auxiliary calls', calls.agent.length === 1 && calls.aux.length === 0 && calls.agent[0].offersInline,
    JSON.stringify(calls.agent.map(({ requestBytes, systemChars, tools }) => ({ requestBytes, systemChars, tools }))))

  // F. Rejected arguments never render; the error result lets the model answer in Markdown.
  for (const [name, prompt] of [['malicious HTML/script', '恶意内容测试'], ['inconsistent rows', '不一致数据测试'], ['over limit', '超限测试']]) {
    count = mockEntries().length
    await ask(page, prompt)
    await page.waitForTimeout(800)
    calls = since(count)
    const fallback = page.getByText('工具校验失败，以下以纯 Markdown 作答。').last()
    check(`F ${name}: no view, readable Markdown fallback`, await page.locator('[data-diu-inline-tail]').count() === 0
      && await fallback.isVisible() && calls.agent.length === 2 && calls.agent[1].toolResult?.isError === true && calls.aux.length === 0,
      `agent=${calls.agent.length} aux=${calls.aux.length} tail=${await page.locator('[data-diu-inline-tail]').count()}`)
  }
  check('F4 no injected markup in any view', await page.locator('.diu-root script, .diu-root img, .diu-root iframe').count() === 0)
  // Invalid JSON never reaches the tool: DSH's provider rejects the response and shows a readable turn failure.
  count = mockEntries().length
  await ask(page, '坏JSON测试', false)
  const failure = page.getByText('tool input is invalid JSON').last()
  await failure.waitFor({ timeout: 20000 })
  check('F5 invalid JSON: readable failure, no view, no auxiliary call', await failure.isVisible()
    && await page.locator('[data-diu-inline-tail]').count() === 0 && since(count).aux.length === 0)
  await page.screenshot({ path: join(outDir, 'F-invalid-json.png') })

  // I. Stop while streaming: shown components stay, nothing settles, the lead text remains.
  count = mockEntries().length
  await ask(page, '请给出2025年经营数据（中断）', false)
  await page.locator('[data-diu-inline] .diu-body > *').first().waitFor({ timeout: 20000 })
  await page.getByRole('button', { name: '停止生成' }).click()
  await page.waitForTimeout(2500)
  check('I1 interrupted call leaves the lead text and no settled view', await page.getByText('2025 年下半年利润改善，详见下方视图。').last().isVisible()
    && await page.locator('[data-diu-inline-tail]').count() === 0 && since(count).aux.length === 0)
  await page.screenshot({ path: join(outDir, 'I-interrupted.png') })

  // C. Plain question: plain Markdown, no view, one request.
  count = mockEntries().length
  await ask(page, '你好')
  await page.waitForTimeout(1500)
  calls = since(count)
  check('C1 plain answer stays Markdown with one agent request', calls.agent.length === 1 && calls.aux.length === 0
    && await page.locator('.diu-root').count() === 0, `agent=${calls.agent.length} requestBytes=${calls.agent[0]?.requestBytes}`)
  await page.close()
} else if (scenario === 'inline-reload') {
  // Reload and a second window replay the settled call from the session's own tool nodes.
  const page = await open()
  await ask(page, '请给出2025年经营数据（流式，刷新）')
  await page.locator('[data-diu-inline-tail]').last().waitFor({ timeout: 20000 })
  const count = mockEntries().length
  await page.reload()
  await page.locator('[data-diu-inline-tail] .diu-chart').last().waitFor({ timeout: 15000 })
  check('NR1 reload restores the view', await page.locator('[data-diu-inline-tail]').count() === 1)
  const second = await page.context().newPage()
  second.on('pageerror', error => { errors.push(error.message) })
  await second.goto(page.url())
  await second.locator('[data-diu-inline-tail] .diu-chart').last().waitFor({ timeout: 15000 })
  check('NR2 second window restores the view', await second.locator('[data-diu-inline-tail] .diu-body > *').count() === 4)
  await second.locator('[data-diu-inline-tail]').last().screenshot({ path: join(outDir, 'NR-second-window.png') })
  await page.waitForTimeout(1500)
  check('NR3 restoring makes no model request', mockEntries().length === count)
  await second.close()
  await page.close()
} else if (scenario === 'real') {
  // Stage B with a real model: measures, never fakes. One fresh session per prompt; prints one JSON line per run.
  const prompts = JSON.parse(readFileSync(process.env.PROMPTS, 'utf8'))
  for (const [index, { kind, prompt }] of prompts.entries()) {
    const page = await open()
    await page.evaluate(() => {
      const timeline = []
      globalThis.diuTimeline = timeline
      setInterval(() => {
        const live = document.querySelectorAll('[data-diu-inline] .diu-body > *').length
        const streaming = [...document.querySelectorAll('[data-diu-inline] .diu-status')].some(node => node.textContent.includes('正在生成交互视图'))
        const tail = document.querySelectorAll('[data-diu-inline-tail]').length
        const last = timeline.at(-1)
        if (last === undefined || last.live !== live || last.streaming !== streaming || last.tail !== tail) timeline.push({ at: Math.round(performance.now()), live, streaming, tail })
      }, 20)
    })
    const sent = await page.evaluate(() => Math.round(performance.now()))
    await ask(page, prompt, false)
    const end = page.getByText(/已完成，用时|本轮运行失败|已停止/).last()
    const ok = await end.waitFor({ timeout: 240000 }).then(() => true, () => false)
    await page.waitForTimeout(1500)
    const timeline = await page.evaluate(() => globalThis.diuTimeline)
    const tail = page.locator('[data-diu-inline-tail]').last()
    const hasTail = await tail.count() > 0
    const first = timeline.find(snapshot => snapshot.live > 0)
    const preparing = timeline.find(snapshot => snapshot.streaming)
    const settled = timeline.find(snapshot => snapshot.tail > 0)
    const row = {
      index, kind, finished: ok ? (await end.textContent()).slice(0, 40) : 'timeout',
      viewShown: hasTail,
      items: hasTail ? await tail.locator('.diu-body > *').evaluateAll(nodes => nodes.map(node => node.className.replace('diu-', ''))) : [],
      firstItemMarkdown: hasTail ? await tail.locator('.diu-body > *').first().evaluate(node => node.classList.contains('diu-md') ? node.textContent.slice(0, 60) : null) : null,
      streamedBeforeComplete: first !== undefined && first.streaming,
      msSendToPreparing: preparing === undefined ? null : preparing.at - sent,
      msPreparingToFirst: first === undefined || preparing === undefined ? null : first.at - preparing.at,
      msFirstToSettled: first === undefined || settled === undefined ? null : settled.at - first.at,
      streamedCounts: timeline.filter(snapshot => snapshot.streaming).map(snapshot => snapshot.live),
      failedNotice: await page.locator('[data-diu-inline] .diu-status', { hasText: '未完成或未通过校验' }).count() > 0,
      plainMarkdownOnly: await page.locator('.diu-root').count() === 0,
    }
    console.log(`RUN ${JSON.stringify(row)}`)
    if (first !== undefined) await page.screenshot({ path: join(outDir, `real-${index}-${kind}.png`), fullPage: true })
    await page.close()
  }
} else if (scenario === 'inline-ptc') {
  // Tools presented through PTC (DSH_TOOLS_MODE=ptc): render_ui is never offered, answers stay Markdown.
  const page = await open()
  const count = mockEntries().length
  await ask(page, '请给出2025年各季度经营数据（PTC）')
  await page.waitForTimeout(1500)
  const agent = mockEntries().slice(count).filter(entry => entry.kind === 'agent')
  // Neither as a native tool nor inside the PTC SDK or prompt.
  check('P1 render_ui not exposed to a PTC agent', agent.length >= 1 && agent.every(entry => !entry.offersInline && entry.mentionsInline === false),
    JSON.stringify(agent.map(({ tools, offersInline, mentionsInline }) => ({ tools, offersInline, mentionsInline }))))
  check('P2 no view, no auxiliary call, Markdown answer rendered', await page.locator('.diu-root').count() === 0
    && mockEntries().slice(count).every(entry => entry.kind !== 'auxiliary') && (await page.locator('table').last().textContent()).includes('1,200'))
  await page.screenshot({ path: join(outDir, 'P-ptc.png') })
  await page.close()
} else {
  // Plugin disabled or mode off: the prompt is answered, nothing is appended, no auxiliary call.
  const page = await open()
  if (process.env.INLINE_HISTORY === '1') {
    // The most recent session holds a settled inline-stream turn: its text and arguments stay readable.
    await page.getByText('经营数据', { exact: true }).first().click()
    await page.getByText(/已完成，用时/).last().click()
    const lead = page.getByText('2025 年下半年利润改善，详见下方视图。').last()
    await lead.waitFor({ timeout: 15000 })
    check('X0 inline history without the plugin: lead text readable, no view', await lead.isVisible() && await page.locator('.diu-root').count() === 0)
    await page.screenshot({ path: join(outDir, 'X-inline-history.png') })
  }
  const before = auxCalls().length
  await ask(page, '请给出2025年各季度经营数据（关闭后）')
  await page.waitForTimeout(4000)
  check('X1 no auxiliary call', auxCalls().length === before)
  check('X2 no interactive region', await page.locator('.diu-root').count() === 0)
  check('X3 original answer rendered', (await page.locator('table').last().textContent()).includes('1,200'))
  await page.screenshot({ path: join(outDir, `X-${process.env.LABEL ?? 'absent'}.png`) })
  await page.close()
}

check('Z page errors', errors.length === 0, errors.slice(0, 3).join(' | '))
await browser.close()
const failedChecks = results.filter(result => !result.ok)
console.log(`${results.length - failedChecks.length}/${results.length} passed`)
process.exit(failedChecks.length === 0 ? 0 : 1)
