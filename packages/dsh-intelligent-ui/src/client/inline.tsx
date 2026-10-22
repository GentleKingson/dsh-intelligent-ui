/**
 * `inline-stream` presentation. While the root agent streams `render_ui`
 * arguments, the toolview renders each component as soon as it closes and
 * validates. Once the turn ends the Chat folds process rows, so the turn tail
 * re-reads the settled call from the Turn's own tool nodes and keeps the view
 * in the default chat flow; history and second windows replay the same nodes.
 */

import { useEffect, useMemo, useSyncExternalStore } from 'react'
import type { ToolChatData, ToolResultNode } from '@deepseek-ai/dsh-client-ui-chat/client'
import type { ToolCallViewProps } from '@deepseek-ai/dsh-client-ui-tool/client'
import type { HostObservable, InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { INLINE_TOOL_NAME, InlineArgsStream, readInlineArgs } from '../inline.ts'
import type { IntelligentUiItem } from '../types.ts'
import { Region, ViewBoundary } from './View.tsx'
import type { NS } from './locales.ts'

/**
 * Settled calls whose view the turn tail currently shows. Their toolview rows
 * then render a pointer instead of a second copy (visible when the user
 * expands a folded turn or uses the verbose transcript).
 */
const shownInTail = new Set<string>()
const tailListeners = new Set<() => void>()

function setShownInTail(callIds: readonly string[], shown: boolean): void {
  for (const callId of callIds) {
    if (shown) shownInTail.add(callId)
    else shownInTail.delete(callId)
  }
  for (const listener of [...tailListeners]) listener()
}

function subscribeTail(listener: () => void): () => void {
  tailListeners.add(listener)
  return () => { tailListeners.delete(listener) }
}

type ToolViewProps = ToolCallViewProps & PropsLocale<typeof NS>

function View({ items, t }: { items: readonly IntelligentUiItem[]; t: ToolViewProps['t'] }) {
  return <ViewBoundary><Region view={{ items }} t={t} /></ViewBoundary>
}

/**
 * Keyed `tool.call.toolview` entry for `render_ui`.
 * @param props - phase-specific owner props.
 * @returns the streamed, settled, or failed view row.
 */
export function InlineToolView(props: ToolViewProps) {
  return (
    <div className="diu-root diu-inline" data-diu-inline={props.callId}>
      {props.phase === 'preparing' ? <Preparing {...props} /> : <Settled {...props} />}
    </div>
  )
}

function Preparing({ useToolCallArgumentsPartial, t }: Extract<ToolViewProps, { phase: 'preparing' }>) {
  // DSH 0.2.1 dropped this hook; its lazy `args` view cannot follow an array
  // prefix, so there the row shows only the status until the call settles.
  // The branch is fixed per DSH runtime, so hook order stays stable.
  const raw = typeof useToolCallArgumentsPartial === 'function' ? useToolCallArgumentsPartial() : ''
  const stream = useMemo(() => new InlineArgsStream(), [])
  const snapshot = stream.feed(raw)
  const shown = snapshot.items.flatMap(outcome => outcome.ok ? [outcome.item] : [])
  const rejected = snapshot.items.length - shown.length
  return (
    <>
      {shown.length > 0 && <View items={shown} t={t} />}
      <div className="diu-status" role="status">
        {t('inline.streaming', { count: shown.length })}
        {rejected > 0 && <span>{t('inline.rejected', { count: rejected })}</span>}
        {snapshot.overLimit && <span>{t('inline.overLimit')}</span>}
      </div>
    </>
  )
}

function Settled({ phase, block, callId, t }: Exclude<ToolViewProps, { phase: 'preparing' }>) {
  const inTail = useSyncExternalStore(subscribeTail, () => shownInTail.has(callId))
  const raw = phase === 'start' ? block.argsRaw : block.call?.argsRaw
  const outcome = useMemo(() => raw === undefined ? undefined : readInlineArgs(raw), [raw])
  if (phase === 'result' && block.isError) return <div className="diu-status" role="status">{t('inline.failed')}</div>
  if (outcome === undefined || !outcome.ok) return <div className="diu-status" role="status">{t('inline.failed')}</div>
  if (inTail) return <div className="diu-status">{t('inline.below')}</div>
  return <View items={outcome.items} t={t} />
}

/** Turn-keyed Tool nodes the tail reads, including the folded ones. */
export interface InlineTailInjected {
  keyedHooks: {
    /** One Turn's root Tool calls, in anchor order. */
    toolCalls: (turn: string) => HostObservable<readonly ToolChatData[]>
  }
}

type InlineTailProps = PropsRuntime<'conversation.chat.turnTail'> & PropsLocale<typeof NS> & InjectFace<InlineTailInjected>

const NO_CALLS: readonly ToolResultNode[] = []

/** Successful native `render_ui` results of one Turn; identity changes only with the nodes. */
function settledCalls(nodes: readonly ToolChatData[] | undefined): readonly ToolResultNode[] {
  const calls = (nodes ?? []).flatMap(({ root }) => 'kind' in root && root.call?.name === INLINE_TOOL_NAME
    && !root.isError && root.parentCallId === undefined ? [root] : [])
  return calls.length === 0 ? NO_CALLS : calls
}

/**
 * Completed-turn view of every successful `render_ui` call in that turn.
 * @param props - turn identity, the Turn's tool nodes, and the translator.
 * @returns the persisted views, or null for a turn without one.
 */
export function InlineTail({ turn, useToolCalls, t }: InlineTailProps) {
  // `HostObservable` comes from a platform package this build does not install, so the hook is untyped here.
  const nodes = useToolCalls(String(turn.turn)) as readonly ToolChatData[] | undefined
  const calls = useMemo(() => settledCalls(nodes), [nodes])
  const views = useMemo(() => calls.flatMap((call) => {
    const outcome = call.call === null ? undefined : readInlineArgs(call.call.argsRaw)
    return outcome?.ok === true ? [{ callId: call.callId, items: outcome.items }] : []
  }), [calls])
  const key = views.map(view => view.callId).join(' ')
  useEffect(() => {
    const ids = key === '' ? [] : key.split(' ')
    setShownInTail(ids, true)
    return () => { setShownInTail(ids, false) }
  }, [key])
  if (views.length === 0) return null
  return (
    <>
      {views.map(view => (
        <div key={view.callId} className="diu-root diu-inline" data-diu-inline-tail={view.callId}>
          <View items={view.items} t={t} />
        </div>
      ))}
    </>
  )
}
