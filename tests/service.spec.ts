import { mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import type { GenerateOptions, StreamChunk } from '@deepseek-ai/dsh-llm'
import Storage from '@deepseek-ai/dsh-storage'
import { DomainFacility } from '@deepseek-ai/dsh-storage-domain'
import * as StorageJson from '@deepseek-ai/dsh-storage-json'
import IntelligentUiService from '../src/index.ts'
import type { IntelligentUiReadResult, IntelligentUiSourceRef } from '../src/types.ts'
import { hashSource } from '../src/shared/source.ts'

const ANSWER = '| 季度 | 营收 |\n| --- | ---: |\n| Q1 | 100 |\n| Q2 | 150 |\n| Q3 | 90 |'
const PROGRAM = '{"version":1,"items":[{"type":"table","table":"t0"},{"type":"chart","table":"t0","chart":"bar","x":"c0","series":["c1"]}]}'

/** Scripted adapter output; each call shifts one script, the last repeats. */
type Script = readonly StreamChunk[] | ((options: GenerateOptions) => AsyncIterable<StreamChunk>)

function text(output: string, finish: StreamChunk = { type: 'finish', reason: { kind: 'stop' } }): StreamChunk[] {
  return [
    { type: 'block-start', index: 0, blockType: 'text' },
    { type: 'text-delta', index: 0, text: output },
    { type: 'usage', usage: { inputTokens: 40, outputTokens: 12 } },
    finish,
  ]
}

const roots: string[] = []
const contexts: Context[] = []

afterEach(async () => {
  await Promise.allSettled(contexts.splice(0).map(ctx => ctx.fiber.dispose()))
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
})

async function boot(root: string, scripts: Script[], mode: 'smart-auto' | 'inline-stream' | 'off' = 'smart-auto') {
  const ctx = new Context()
  contexts.push(ctx)
  const calls: GenerateOptions[] = []
  ctx.provide('llm', {
    async * stream(options: GenerateOptions): AsyncIterable<StreamChunk> {
      calls.push(options)
      const script = scripts.length > 1 ? scripts.shift() : scripts[0]
      if (script === undefined) throw new Error('no script')
      yield * (typeof script === 'function' ? script(options) : script)
    },
  } as never)
  await ctx.plugin(Storage)
  await ctx.plugin(StorageJson, { root })
  ctx.provide('storageDomain', new DomainFacility(ctx, { backend: 'json', routes: {} }))
  const plugin = await ctx.plugin(IntelligentUiService, { mode })
  const service = await new Promise<IntelligentUiService>((resolve) => {
    ctx.inject(['intelligentUi'], (inner) => { resolve(inner.get('intelligentUi') as IntelligentUiService) })
  })
  return { ctx, service, calls, plugin }
}

let seq = 0
function session(id: string, origin = 'user') {
  return { id, header: { origin }, requestHeader: () => ({ config: { provider: 'p', model: 'm' } }) }
}

/** Emit one root turn; returns the identity the Client would read. */
function turn(ctx: Context, sessionId: string, turnNo: number, options: {
  answer?: string
  origin?: string
  reason?: string
  toolAfter?: boolean
} = {}): IntelligentUiSourceRef & { replay: () => void } {
  const s = session(sessionId, options.origin)
  const events: object[] = []
  const emit = (type: string, data: object): number => {
    const event = { type, seq: ++seq, data }
    events.push(event)
    ctx.emit('session/event' as never, s as never, event as never)
    return event.seq
  }
  const answer = options.answer ?? ANSWER
  emit('turn/start', { turn: turnNo })
  const messageId = `m-${sessionId}-${turnNo}`
  const sourceSeq = emit('assistant/message', { turn: turnNo, step: 0, message: { id: messageId, content: [{ type: 'text', text: answer }] } })
  if (options.toolAfter === true) emit('tool/call', { turn: turnNo, step: 0 })
  emit('turn/end', { turn: turnNo, reason: { kind: options.reason ?? 'completed' } })
  const replay = (): void => { for (const event of events) ctx.emit('session/event' as never, s as never, event as never) }
  return { sessionId, turn: turnNo, messageId, sourceSeq, sourceHash: hashSource(answer), replay }
}

async function settle(service: IntelligentUiService, ref: IntelligentUiSourceRef): Promise<IntelligentUiReadResult> {
  for (let attempt = 0; attempt < 100; attempt++) {
    const result = await service.read(ref)
    if (result.status !== 'pending') return result
    await new Promise(resolve => setTimeout(resolve, 5))
  }
  throw new Error('still pending')
}

function tempRoot(): string {
  const root = mkdtempSync(join(tmpdir(), 'diu-spec-'))
  roots.push(root)
  return root
}

describe('IntelligentUiService', () => {
  it('declares mode as the one volatile field the Plugins page edits, defaulting to smart-auto', () => {
    const schema = IntelligentUiService.Config
    expect(schema.dict?.['mode']?.meta.volatile).toBe(true)
    expect(schema({}).mode.get()).toBe('smart-auto')
    expect(schema({ mode: 'off' }).mode.get()).toBe('off')
    expect(() => schema({ mode: 'bogus' } as never)).toThrow()
  })

  it('makes exactly one tool-free auxiliary call for a completed root answer and persists the view', async () => {
    const { ctx, service, calls } = await boot(tempRoot(), [text(PROGRAM)])
    const { replay, ...ref } = turn(ctx, 's1', 1)
    expect((await service.read(ref)).status).toBe('pending')
    const result = await settle(service, ref)
    expect(result.status).toBe('ready')
    if (result.status !== 'ready') return
    expect(result.view.items.map(item => item.type)).toEqual(['chart'])
    expect(result.usage).toMatchObject({ inputTokens: 40, outputTokens: 12 })
    expect(calls).toHaveLength(1)
    expect(calls[0]?.tools).toBeUndefined()
    expect(calls[0]).toMatchObject({ provider: 'p', model: 'm', sessionId: ref.sessionId, maxTokens: 2048 })
    // Re-delivered events of the same answer never call again.
    replay()
    await settle(service, ref)
    expect(calls).toHaveLength(1)
  })

  it('makes no call for subagents, interrupted/failed turns, tool activity after text, or plain answers', async () => {
    const { ctx, service, calls } = await boot(tempRoot(), [text(PROGRAM)])
    const refs = [
      turn(ctx, 'sub', 1, { origin: 'subagent' }),
      turn(ctx, 's2', 1, { reason: 'interrupted' }),
      turn(ctx, 's3', 1, { toolAfter: true }),
    ]
    for (const ref of refs) expect(await service.read(ref)).toEqual({ status: 'absent' })
    const plain = turn(ctx, 's4', 1, { answer: '你好！有什么可以帮你？' })
    expect(await settle(service, plain)).toEqual({ status: 'skipped', reason: 'not-structured' })
    expect(calls).toHaveLength(0)
  })

  it('off mode makes no calls at all', async () => {
    const { ctx, service, calls } = await boot(tempRoot(), [text(PROGRAM)], 'off')
    expect(await service.read(turn(ctx, 's5', 1))).toEqual({ status: 'absent' })
    expect(calls).toHaveLength(0)
  })

  it('inline-stream mode never makes the auxiliary call', async () => {
    const { ctx, service, calls } = await boot(tempRoot(), [text(PROGRAM)], 'inline-stream')
    expect(await service.read(turn(ctx, 's5b', 1))).toEqual({ status: 'absent' })
    await new Promise(resolve => setTimeout(resolve, 20))
    expect(calls).toHaveLength(0)
  })

  it('reads are bound to the exact identity', async () => {
    const { ctx, service } = await boot(tempRoot(), [text(PROGRAM)])
    const ref = turn(ctx, 's6', 1)
    expect((await settle(service, ref)).status).toBe('ready')
    expect(await service.read({ ...ref, sourceHash: hashSource('edited') })).toEqual({ status: 'absent' })
    expect(await service.read({ ...ref, sessionId: 'other' })).toEqual({ status: 'absent' })
  })

  it.each([
    ['invalid output', text('root = Table("t0")'), 'invalid-output'],
    ['truncation', text(PROGRAM.slice(0, 20), { type: 'finish', reason: { kind: 'max-tokens' } }), 'truncated'],
    ['adapter error', () => (async function * () { throw new Error('boom') })(), 'model-error'],
  ] as const)('falls back on %s and retries without a new chat message', async (_name, first, reason) => {
    const { ctx, service, calls } = await boot(tempRoot(), [first, text(PROGRAM)])
    const ref = turn(ctx, 's7', 1)
    expect(await settle(service, ref)).toEqual({ status: 'failed', reason, retryable: true })
    expect((await service.retry(ref)).status).toBe('pending')
    expect((await settle(service, ref)).status).toBe('ready')
    expect(calls).toHaveLength(2)
    expect(calls.map(call => call.sessionId)).toEqual([ref.sessionId, ref.sessionId])
  })

  it('model SKIP keeps the Markdown', async () => {
    const { ctx, service } = await boot(tempRoot(), [text('SKIP')])
    expect(await settle(service, turn(ctx, 's8', 1))).toEqual({ status: 'skipped', reason: 'model-skip' })
  })

  it('serves a persisted view after restart without calling the model', async () => {
    const root = tempRoot()
    const first = await boot(root, [text(PROGRAM)])
    const ref = turn(first.ctx, 's9', 1)
    expect((await settle(first.service, ref)).status).toBe('ready')
    await first.ctx.fiber.dispose()
    const second = await boot(root, [text(PROGRAM)])
    expect((await second.service.read(ref)).status).toBe('ready')
    expect(second.calls).toHaveLength(0)
  })

  it('keeps a degraded chart with table-only series across a restart', async () => {
    const root = tempRoot()
    const answer = '| 季度 | 营收 | 同比 |\n| --- | ---: | ---: |\n| Q1 | 100 | 10% |\n| Q2 | 120 | 20% |'
    const program = '{"version":1,"items":[{"type":"chart","table":"t0","chart":"bar","x":"c0","series":["c1","c2"]}]}'
    const first = await boot(root, [text(program)])
    const ref = turn(first.ctx, 's9b', 1, { answer })
    const ready = await settle(first.service, ref)
    expect(ready.status === 'ready' && ready.view.items[0]).toMatchObject({ series: [{ name: '营收' }], tableOnly: ['同比'] })
    await first.ctx.fiber.dispose()
    const second = await boot(root, [text(program)])
    expect(await second.service.read(ref)).toEqual(ready)
    expect(second.calls).toHaveLength(0)
  })

  it('a corrupted record only drops that enhancement', async () => {
    const root = tempRoot()
    const first = await boot(root, [text(PROGRAM)])
    const ref = turn(first.ctx, 's10', 1)
    expect((await settle(first.service, ref)).status).toBe('ready')
    await first.ctx.fiber.dispose()
    const views = join(root, 'intelligent_ui', 'views')
    for (const file of readdirSync(views)) writeFileSync(join(views, file), '{broken')
    const second = await boot(root, [text(PROGRAM)])
    expect(await second.service.read(ref)).toEqual({ status: 'absent' })
    expect((await settle(second.service, turn(second.ctx, 's11', 1))).status).toBe('ready')
    expect(second.calls).toHaveLength(1)
  })

  it('disposing the plugin aborts a pending call and stops observing', async () => {
    const hang = (options: GenerateOptions) => (async function * () {
      await new Promise(resolve => options.signal?.addEventListener('abort', resolve))
    })()
    const { ctx, service, calls, plugin } = await boot(tempRoot(), [hang])
    const ref = turn(ctx, 's12', 1)
    await settle(service, ref).catch(() => {})
    expect(calls).toHaveLength(1)
    await plugin.dispose()
    expect(calls[0]?.signal?.aborted).toBe(true)
    turn(ctx, 's13', 1)
    await new Promise(resolve => setTimeout(resolve, 20))
    expect(calls).toHaveLength(1)
  })
})
