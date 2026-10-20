/**
 * Web acceptance run against a live `dsh --profile <p>` server whose model
 * endpoint is the LOCAL MOCK (mock-messages-server.mjs). Prints one PASS/FAIL
 * line per check and writes screenshots to <outDir>.
 *
 * Usage: node web-e2e.mjs <url-with-token> <outDir> <mock.jsonl> [main|reload|absent]
 * Requires playwright-core and Chromium (CHROMIUM_PATH).
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'

const [url, outDir, mockLog, scenario = 'main'] = process.argv.slice(2)
const executablePath = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok })
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail === '' ? '' : ` — ${detail}`}`)
}
const auxCalls = () => readFileSync(mockLog, 'utf8').trim().split('\n').filter(Boolean).map(line => JSON.parse(line)).filter(entry => entry.kind === 'auxiliary')

const browser = await chromium.launch({ executablePath })
const errors = []

async function open(colorScheme = 'light') {
  const context = await browser.newContext({ viewport: { width: 1280, height: 1000 }, locale: 'zh-CN', colorScheme })
  const page = await context.newPage()
  page.on('pageerror', error => { errors.push(error.message) })
  await page.goto(url)
  await page.getByRole('button', { name: /Continue|继续/ }).click({ timeout: 8000 }).catch(() => {})
  return page
}

async function ask(page, prompt) {
  await page.getByText('新会话', { exact: true }).first().click()
  await page.waitForTimeout(800)
  const picker = page.getByRole('button', { name: '打开', exact: true })
  const send = async () => {
    const box = page.getByRole('textbox').last()
    await box.click()
    // 0.2.1: the composer asks for a workspace before it accepts text.
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
  await page.getByText('已完成').last().waitFor({ timeout: 20000 })
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

  const legend = region.getByRole('button', { name: /利润/ }).last()
  await legend.click()
  check('A12 legend toggle hides a series', (await legend.getAttribute('aria-pressed')) === 'false' && await region.locator('.diu-bars').count() === 1)
  await legend.click()
  await region.getByRole('button', { name: '查看数据' }).click()
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
} else {
  // Plugin disabled or mode off: the prompt is answered, nothing is appended, no auxiliary call.
  const page = await open()
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
