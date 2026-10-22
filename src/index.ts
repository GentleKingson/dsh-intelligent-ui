/**
 * dsh-intelligent-ui, Host half. `smart-auto` observes finalized root-session
 * answers, screens them locally, makes at most one auxiliary model call per
 * answer, validates and persists the bound view, and serves read-only results.
 * `inline-stream` instead offers root agents one native view tool (see
 * `inline-tool.ts`) and makes no auxiliary call.
 * @module dsh-intelligent-ui
 */

import type { Context } from '@deepseek-ai/cordis'
import { Service } from '@deepseek-ai/cordis'
import { BlockAssembler, createUserMessage } from '@deepseek-ai/dsh-llm'
import type { ContentBlock, ContextFormed, GenerateOptions } from '@deepseek-ai/dsh-llm'
import type { Session, SessionEvent } from '@deepseek-ai/dsh-session'
import { SessionId } from '@deepseek-ai/dsh-session/types'
import { defineDomain, domainTable } from '@deepseek-ai/dsh-storage-domain'
import type { KvTable } from '@deepseek-ai/dsh-storage-domain'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import { z } from 'zod'
import { enhancementKey, hashSource, sourceMarkdown } from './shared/source.ts'
import { buildSourceIndex } from './source-index.ts'
import { framePrompt, screen, SYSTEM_PROMPT } from './smart-auto.ts'
import { readProgram } from './program.ts'
import { viewSchema } from './view-schema.ts'
import { LIMITS } from './limits.ts'
import { RENDER_SCHEMA_VERSION } from './types.ts'
import { installInline } from './inline-tool.ts'
import type {
  IntelligentUiFailReason, IntelligentUiReadResult, IntelligentUiSkipReason, IntelligentUiSourceRef,
  IntelligentUiUsage, IntelligentUiView,
} from './types.ts'

export type * from './types.ts'

declare module '@deepseek-ai/dsh-llm' {
  interface MessageSourceMap {
    'dsh-intelligent-ui': { kind: 'dsh-intelligent-ui' } & ContextFormed
  }
}

declare module '@deepseek-ai/cordis' {
  interface Context {
    intelligentUi: IntelligentUiService
  }
}

/** Plugin configuration. */
export interface Config {
  /**
   * `smart-auto` screens every new root answer; `inline-stream` lets the root
   * agent's own model stream view data through a native tool; `off` makes no
   * new model calls.
   */
  readonly mode: 'smart-auto' | 'inline-stream' | 'off'
}

const configSchema = z.strictObject({ mode: z.enum(['smart-auto', 'inline-stream', 'off']).default('smart-auto') })

const recordSchema = z.strictObject({
  schema: z.literal(RENDER_SCHEMA_VERSION),
  sessionId: z.string(),
  turn: z.number().int().nonnegative(),
  messageId: z.string(),
  sourceSeq: z.number().int().nonnegative(),
  sourceHash: z.string(),
  view: viewSchema,
  usage: z.strictObject({
    inputTokens: z.number().int().nonnegative().optional(),
    outputTokens: z.number().int().nonnegative().optional(),
    durationMs: z.number().nonnegative(),
  }),
  createdAt: z.number().int().nonnegative(),
})

/** One persisted, validated enhancement and its minimal binding. */
interface ViewRecord extends IntelligentUiSourceRef {
  readonly schema: typeof RENDER_SCHEMA_VERSION
  readonly view: IntelligentUiView
  readonly usage: IntelligentUiUsage
  readonly createdAt: number
}

/** Disposable derived data: an unreadable record is set aside, never fatal. */
const domainSpec = defineDomain({
  name: 'intelligent_ui',
  version: 1,
  layout: 'per-record',
  invalidRecords: 'backup-and-skip',
  tables: { views: domainTable<string, ViewRecord>(recordSchema) },
})

/** Provider route captured from the answer's own request header. */
interface Route {
  readonly provider: string
  readonly model: string
}

/** What a retry needs; kept only in bounded memory, never persisted. */
interface RetrySource {
  readonly text: string
  readonly route: Route | undefined
}

type MemoryEntry =
  | { readonly status: 'pending'; readonly ref: IntelligentUiSourceRef; readonly controller: AbortController }
  | { readonly status: 'skipped'; readonly ref: IntelligentUiSourceRef; readonly reason: IntelligentUiSkipReason }
  | {
    readonly status: 'failed'
    readonly ref: IntelligentUiSourceRef
    readonly reason: IntelligentUiFailReason
    readonly retry: RetrySource
  }

/** Last finalized answer candidate of the open turn. */
interface Candidate {
  readonly messageId: string
  readonly seq: number
  readonly content: readonly ContentBlock[]
}

interface TurnTracker {
  readonly turn: number
  candidate: Candidate | undefined
}

function sameRef(left: IntelligentUiSourceRef, right: IntelligentUiSourceRef): boolean {
  return left.sessionId === right.sessionId && left.turn === right.turn && left.messageId === right.messageId
    && left.sourceSeq === right.sourceSeq && left.sourceHash === right.sourceHash
}

function blocksOf(content: readonly ContentBlock[]): { kind: string; text?: string }[] {
  return content.map(block => block.type === 'text' ? { kind: 'text', text: block.text } : { kind: block.type })
}

/** Host service and Remote namespace `intelligentUi`. */
export class IntelligentUiService extends TypertRemoteService {
  static inject = ['llm', 'storageDomain']

  static Config = configSchema

  private readonly mode: Config['mode']
  private readonly trackers = new Map<string, TurnTracker>()
  private readonly memory = new Map<string, MemoryEntry>()
  private table?: KvTable<string, ViewRecord>
  private active = 0
  private disposed = false

  /**
   * @param ctx - Host context carrying the LLM and storage-domain services.
   * @param config - validated plugin configuration.
   */
  constructor(ctx: Context, config: Config) {
    super(ctx, 'intelligentUi')
    this.mode = config.mode
  }

  /** Open the result domain, then start observing committed session events. */
  protected async [Service.init](): Promise<void> {
    const domain = await this.ctx.storageDomain.open(domainSpec)
    this.ctx.effect(() => () => domain.close(), 'intelligentUi.domainClose')
    this.table = domain.table('views')
    this.ctx.effect(() => () => {
      this.disposed = true
      for (const entry of this.memory.values()) {
        if (entry.status === 'pending') entry.controller.abort()
      }
      this.memory.clear()
      this.trackers.clear()
    }, 'intelligentUi.abortPending')
    this.ctx.on('session/event', (session, event) => { this.observe(session, event) })
    if (this.mode === 'inline-stream') this.ctx.inject(['agents', 'tools', 'systemPrompt'], installInline)
    this.ctx.on('session/disposed', (session) => { this.trackers.delete(session.id) })
  }

  /**
   * Read the enhancement bound to one exact answer identity. Never generates,
   * never loads a Session.
   * @param request - exact source identity from the Client's closing node.
   * @returns the current state; `ready` carries the persisted view.
   */
  @Remote('read')
  read(request: IntelligentUiSourceRef): Promise<IntelligentUiReadResult> {
    return Promise.resolve(this.lookup(request))
  }

  /**
   * Start one new attempt for a failed enhancement; repeated calls coalesce
   * on the pending attempt. Produces no chat message.
   * @param request - exact source identity of the failed enhancement.
   * @returns the state after the request.
   */
  @Remote('retry')
  retry(request: IntelligentUiSourceRef): Promise<IntelligentUiReadResult> {
    const key = enhancementKey(request)
    const entry = this.memory.get(key)
    if (this.mode !== 'smart-auto' || this.disposed || entry?.status !== 'failed' || !sameRef(entry.ref, request)) {
      return Promise.resolve(this.lookup(request))
    }
    this.start(key, entry.ref, entry.retry)
    return Promise.resolve(this.lookup(request))
  }

  private lookup(request: IntelligentUiSourceRef): IntelligentUiReadResult {
    const key = enhancementKey(request)
    const entry = this.memory.get(key)
    if (entry !== undefined && sameRef(entry.ref, request)) {
      switch (entry.status) {
        case 'pending': return { status: 'pending' }
        case 'skipped': return { status: 'skipped', reason: entry.reason }
        case 'failed': return { status: 'failed', reason: entry.reason, retryable: this.mode === 'smart-auto' }
      }
    }
    const record = this.table?.get(key)
    if (record !== undefined && sameRef(record, request)) {
      return { status: 'ready', view: record.view, usage: record.usage }
    }
    return { status: 'absent' }
  }

  /** Incremental per-turn tracking; never scans history. */
  private observe(session: Session, event: SessionEvent): void {
    if (this.mode !== 'smart-auto' || this.disposed || session.header.origin === 'subagent') return
    const id = session.id
    switch (event.type) {
      case 'turn/start':
        this.trackers.set(id, { turn: event.data.turn, candidate: undefined })
        return
      case 'assistant/message': {
        const tracker = this.trackers.get(id)
        if (tracker?.turn !== event.data.turn) return
        const content = event.data.message.content
        const final = event.data.interrupted !== true && !content.some(block => block.type === 'tool-call')
        tracker.candidate = final ? { messageId: event.data.message.id, seq: event.seq, content } : undefined
        return
      }
      case 'tool/call':
      case 'tool/result': {
        // Tool activity after an answer leaves no final text until a new answer arrives.
        const tracker = this.trackers.get(id)
        if (tracker?.turn === event.data.turn) tracker.candidate = undefined
        return
      }
      case 'turn/end': {
        const tracker = this.trackers.get(id)
        this.trackers.delete(id)
        if (tracker?.turn !== event.data.turn || event.data.reason.kind !== 'completed') return
        const candidate = tracker.candidate
        if (candidate === undefined) return
        const text = sourceMarkdown(blocksOf(candidate.content))
        if (text.trim() === '') return
        const config = session.requestHeader()?.config
        const ref: IntelligentUiSourceRef = {
          sessionId: id,
          turn: event.data.turn,
          messageId: candidate.messageId,
          sourceSeq: candidate.seq,
          sourceHash: hashSource(text),
        }
        const key = enhancementKey(ref)
        if (this.memory.has(key) || this.table?.get(key) !== undefined) return
        // Registered before this listener returns, so the first Client read
        // can never observe a transient `absent` for a qualifying answer.
        this.start(key, ref, {
          text,
          route: config === undefined ? undefined : { provider: config.provider, model: config.model },
        })
        return
      }
      default:
        return
    }
  }

  /** Register `pending` synchronously and run the attempt in the background. */
  private start(key: string, ref: IntelligentUiSourceRef, source: RetrySource): void {
    const controller = new AbortController()
    this.remember(key, { status: 'pending', ref, controller })
    void this.attempt(key, ref, source, controller).catch((error: unknown) => {
      this.ctx.logger.warn(`attempt failed unexpectedly: ${error instanceof Error ? error.name : 'unknown'}`)
      this.settle(key, controller, { status: 'failed', ref, reason: 'model-error', retry: source })
    })
  }

  private async attempt(
    key: string,
    ref: IntelligentUiSourceRef,
    source: RetrySource,
    controller: AbortController,
  ): Promise<void> {
    await Promise.resolve()
    const skip = (reason: IntelligentUiSkipReason): void => {
      this.settle(key, controller, { status: 'skipped', ref, reason })
    }
    const fail = (reason: IntelligentUiFailReason): void => {
      this.settle(key, controller, { status: 'failed', ref, reason, retry: source })
    }
    if (new TextEncoder().encode(source.text).length > LIMITS.inputBytes) return skip('too-large')
    const index = buildSourceIndex(source.text)
    const verdict = screen(source.text, index)
    if (!verdict.candidate) return skip(verdict.reason)
    if (source.route === undefined) return skip('no-route')
    if (this.active >= LIMITS.concurrency) return skip('busy')
    this.active++
    const startedAt = Date.now()
    const timer = setTimeout(() => { controller.abort(new Error('timeout')) }, LIMITS.deadlineMs)
    try {
      const options: GenerateOptions = {
        provider: source.route.provider,
        model: source.route.model,
        // Some providers require the originating session for transport routing.
        sessionId: SessionId(ref.sessionId),
        system: SYSTEM_PROMPT,
        messages: [createUserMessage({
          content: [{ type: 'text', text: framePrompt(index, verdict.hints) }],
          source: { kind: 'dsh-intelligent-ui' },
        })],
        maxTokens: LIMITS.outputTokens,
        signal: controller.signal,
      }
      const assembler = new BlockAssembler()
      for await (const chunk of this.ctx.llm.stream(options)) {
        if (controller.signal.aborted) break
        assembler.push(chunk)
      }
      if (controller.signal.aborted) return fail(this.disposed ? 'model-error' : 'timeout')
      const finish = assembler.finish
      if (finish.kind === 'max-tokens') return fail('truncated')
      if (finish.kind !== 'stop') return fail('model-error')
      const blocks = assembler.blocks()
      if (blocks.some(block => block.type === 'tool-call')) return fail('invalid-output')
      const outcome = readProgram(sourceMarkdown(blocksOf(blocks)), index)
      if (outcome.kind === 'skip') return skip('model-skip')
      if (outcome.kind === 'invalid') {
        this.ctx.logger.info(`rejected program: ${outcome.detail}`)
        return fail('invalid-output')
      }
      const usage = assembler.usage
      const durationMs = Date.now() - startedAt
      await this.persist(key, controller, ref, outcome.view, usage === undefined ? { durationMs } : {
        inputTokens: usage.inputTokens + (usage.cacheReadTokens ?? 0) + (usage.cacheWriteTokens ?? 0),
        outputTokens: usage.outputTokens,
        durationMs,
      }, source)
    } catch (error: unknown) {
      if (controller.signal.aborted) return fail(this.disposed ? 'model-error' : 'timeout')
      this.ctx.logger.info(`auxiliary call failed: ${error instanceof Error ? error.name : 'unknown'}`)
      return fail('model-error')
    } finally {
      clearTimeout(timer)
      this.active--
    }
  }

  /** Persist first; only a durable record becomes `ready`. */
  private async persist(
    key: string,
    controller: AbortController,
    ref: IntelligentUiSourceRef,
    view: IntelligentUiView,
    usage: IntelligentUiUsage,
    source: RetrySource,
  ): Promise<void> {
    const table = this.table
    if (table === undefined || this.disposed) return
    try {
      await table.put(key, { schema: RENDER_SCHEMA_VERSION, ...ref, view, usage, createdAt: Date.now() })
    } catch (error: unknown) {
      this.ctx.logger.warn(`storage write failed: ${error instanceof Error ? error.name : 'unknown'}`)
      this.settle(key, controller, { status: 'failed', ref, reason: 'storage', retry: source })
      return
    }
    const entry = this.memory.get(key)
    if (entry?.status === 'pending' && entry.controller === controller) this.memory.delete(key)
  }

  /** A late attempt only writes its own still-current key. */
  private settle(key: string, controller: AbortController, next: MemoryEntry): void {
    const entry = this.memory.get(key)
    if (this.disposed || entry?.status !== 'pending' || entry.controller !== controller) return
    this.remember(key, next)
  }

  /** Bounded memory: evict the oldest settled entries first. */
  private remember(key: string, entry: MemoryEntry): void {
    this.memory.delete(key)
    this.memory.set(key, entry)
    if (this.memory.size <= LIMITS.memoryEntries) return
    for (const [candidate, value] of this.memory) {
      if (this.memory.size <= LIMITS.memoryEntries) break
      if (value.status !== 'pending') this.memory.delete(candidate)
    }
  }
}

export default IntelligentUiService
