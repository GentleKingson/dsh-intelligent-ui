/**
 * dsh-intelligent-ui, browser half: mounts this plugin's own Remote
 * contribution and appends a read-only interactive view under a finished
 * root answer through `conversation.chat.turnTail`. It never generates and
 * never changes the original Markdown; composing the plugin out removes it.
 * The `inline-stream` views (`./inline.tsx`) register beside it.
 */

import { useCallback, useSyncExternalStore } from 'react'
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type { TurnTailOwnerProps } from '@deepseek-ai/dsh-client-ui-chat/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-plugin-manager/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import type {} from '@deepseek-ai/dsh-client-ui-tool/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import intelligentUiRemote from 'dsh-intelligent-ui/remote'
import type { IntelligentUiReadResult, IntelligentUiSourceRef } from '../types.ts'
import { hashSource, sourceMarkdown } from '../shared/source.ts'
import { EnhancementReader } from './reader.ts'
import { INLINE_TOOL_NAME } from '../inline.ts'
import { InlineTail, InlineToolView, type InlineTailInjected } from './inline.tsx'
import { Region, ViewBoundary } from './View.tsx'
import { en, NS, zh, type IntelligentUiKey } from './locales.ts'
import { STYLES } from './styles.ts'
import { ModeConfig } from './config.tsx'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Interactive view chrome. */
    'intelligent-ui': IntelligentUiKey
  }
}

/** Required services: slots, dictionaries, and the Remote mount. */
export const inject = ['slots', 'locale', 'remote']

interface Injected {
  reader: EnhancementReader
}

type TailProps = PropsRuntime<'conversation.chat.turnTail'> & PropsLocale<typeof NS> & InjectFace<Injected>

/**
 * Bind the closing answer of a completed turn to its exact identity.
 * @param owner - turn-tail owner props.
 * @param sessionId - owning session.
 * @returns the identity, or null when the turn has no settled final answer.
 */
export function sourceRef(owner: TurnTailOwnerProps, sessionId: string): IntelligentUiSourceRef | null {
  if (owner.turn.end?.data.reason.kind !== 'completed') return null
  const closing = owner.turn.data.get('turn-tail')?.closing
  const node = closing?.finalNode
  if (closing?.status !== 'settled' || node?.messageId === undefined || node.seq !== owner.seq) return null
  const text = sourceMarkdown(node.blocks.map(block => block.kind === 'text' ? { kind: 'text', text: block.text } : { kind: block.kind }))
  if (text.trim() === '') return null
  return { sessionId, turn: owner.turn.turn, messageId: node.messageId, sourceSeq: node.seq, sourceHash: hashSource(text) }
}

function IntelligentTail(props: TailProps) {
  const ref = sourceRef(props, props.sessionId)
  return ref === null ? null : <Bound reference={ref} reader={props.reader} t={props.t} />
}

function Bound({ reference, reader, t }: { reference: IntelligentUiSourceRef; reader: EnhancementReader; t: TailProps['t'] }) {
  const subscribe = useCallback((listener: () => void) => reader.subscribe(reference, listener), [reader, reference.sessionId,
    reference.turn, reference.messageId, reference.sourceSeq, reference.sourceHash])
  const state = useSyncExternalStore(subscribe, () => reader.snapshot(reference))
  if (state?.status === 'pending') return <div className="diu-root diu-status" role="status">{t('status.pending')}</div>
  if (state?.status === 'failed') {
    return (
      <div className="diu-root diu-status" role="status">
        {t('status.failed')}
        {state.retryable && <button type="button" className="diu-link" onClick={() => { void reader.retry(reference) }}>{t('status.retry')}</button>}
      </div>
    )
  }
  if (state?.status !== 'ready') return null
  return <div className="diu-root"><ViewBoundary><Region view={state.view} t={t} /></ViewBoundary></div>
}

function unwrap(result: { ok: true; value: IntelligentUiReadResult } | { ok: false }): IntelligentUiReadResult | undefined {
  return result.ok ? result.value : undefined
}

/** Register the reader, styles, dictionaries, and tail entry once the namespace is mounted. */
function registerUi(ctx: Context): void {
  const reader = new EnhancementReader({
    read: async ref => unwrap(await ctx.remote.intelligentUi.read(ref)),
    retry: async ref => unwrap(await ctx.remote.intelligentUi.retry(ref)),
  })
  ctx.effect(() => () => { reader.dispose() }, 'intelligent-ui: reader')
  ctx.effect(() => {
    const style = document.createElement('style')
    style.dataset.plugin = 'dsh-intelligent-ui'
    style.textContent = STYLES
    document.head.append(style)
    return () => { style.remove() }
  }, 'intelligent-ui: styles')
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'intelligent-ui: dictionaries')
  ctx.slots.inject('conversation.chat.turnTail', () => ctx.slots.register({
    name: 'conversation.chat.turnTail',
    id: 'dsh-intelligent-ui',
    locale: NS,
    inject: (): Injected => ({ reader }),
  }, IntelligentTail))
  // Plugins → this row → Configure; a composition without the Plugins page never declares the slot.
  ctx.slots.inject('plugins.row.config', () => ctx.slots.register({
    name: 'plugins.row.config', key: 'dsh-intelligent-ui#intelligent-ui', locale: NS,
  }, ModeConfig))
}

/** Register the `inline-stream` toolview and its completed-turn tail. */
function registerInline(ctx: Context): void {
  ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({
    name: 'tool.call.toolview', key: INLINE_TOOL_NAME, locale: NS,
  }, InlineToolView))
  ctx.slots.inject('conversation.chat.turnTail', () => ctx.slots.register({
    name: 'conversation.chat.turnTail',
    id: 'dsh-intelligent-ui:inline',
    locale: NS,
    inject: (sessionId: SessionId): InlineTailInjected => {
      const chat = ctx.uiConversation.binding(sessionId).target('chat')
      return {
        keyedHooks: {
          toolCalls: (turn) => {
            const snapshot = chat.getSnapshot()
            if (snapshot === undefined) throw new Error('intelligent-ui: Chat target is unavailable')
            return snapshot.nodes.turnDataSource(Number(turn), 'tool-call')
          },
        },
      }
    },
  }, InlineTail))
}

/**
 * Client plugin body: mount this plugin's own Remote namespace, then register
 * the UI in a child scope that declares it (the pattern DSH's own
 * self-mounting clients use).
 * @param ctx - client root context.
 */
export async function apply(ctx: Context): Promise<void> {
  const disposeRemote = await ctx.remote.$mount(intelligentUiRemote)
  const ui = ctx.inject(['remote.intelligentUi', 'slots', 'locale'], registerUi)
  // Its own scope: a composition without the Chat assembly keeps the reader.
  ctx.inject(['slots', 'locale', 'uiConversation'], registerInline)
  try {
    await ui
  } catch (error) {
    await ui.dispose()
    await disposeRemote()
    throw error
  }
  ctx.effect(() => async () => {
    await ui.dispose()
    await disposeRemote()
  }, 'intelligent-ui: remote')
}
