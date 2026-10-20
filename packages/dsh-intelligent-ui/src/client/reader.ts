/**
 * Read-only enhancement state per exact answer identity, shared by every
 * mounted tail of the same answer. The Client never generates: it reads, polls
 * a bounded while `pending`, and asks the Host to retry a failed attempt.
 */

import type { IntelligentUiReadResult, IntelligentUiSourceRef } from '../types.ts'
import { enhancementKey } from '../shared/source.ts'

/** The two Remote calls the reader needs, unwrapped from `RemoteResult`. */
export interface ReaderRemote {
  read(ref: IntelligentUiSourceRef): Promise<IntelligentUiReadResult | undefined>
  retry(ref: IntelligentUiSourceRef): Promise<IntelligentUiReadResult | undefined>
}

/** Client-side view of one enhancement; `unavailable` renders nothing. */
export type ReaderState = IntelligentUiReadResult | { readonly status: 'unavailable' }

const POLL_MS = 800
/** Host deadline plus grace: a `pending` older than this stops being polled. */
const POLL_WINDOW_MS = 30_000
/** Transport failures tolerated (e.g. right after page load) before giving up. */
const MAX_TRANSPORT_FAILURES = 5

interface Entry {
  state: ReaderState | undefined
  readonly listeners: Set<() => void>
  timer: ReturnType<typeof setTimeout> | undefined
  deadline: number
  failures: number
  inFlight: boolean
}

/** Shared state store keyed by enhancement identity. */
export class EnhancementReader {
  private readonly entries = new Map<string, Entry>()
  private disposed = false

  constructor(private readonly remote: ReaderRemote) {}

  /**
   * Subscribe to one identity, starting a read on first interest.
   * @param ref - exact source identity.
   * @param listener - called on every state change.
   * @returns unsubscribe; the last one stops polling.
   */
  subscribe(ref: IntelligentUiSourceRef, listener: () => void): () => void {
    const key = enhancementKey(ref)
    let entry = this.entries.get(key)
    if (entry === undefined) {
      entry = { state: undefined, listeners: new Set(), timer: undefined, deadline: Date.now() + POLL_WINDOW_MS, failures: 0, inFlight: false }
      this.entries.set(key, entry)
    }
    entry.listeners.add(listener)
    if (entry.state === undefined || (entry.state.status === 'pending' && entry.timer === undefined)) this.poll(key, ref, entry, 0)
    const current = entry
    return () => {
      current.listeners.delete(listener)
      if (current.listeners.size > 0) return
      clearTimeout(current.timer)
      current.timer = undefined
    }
  }

  /** Current state of one identity, `undefined` before the first answer. */
  snapshot(ref: IntelligentUiSourceRef): ReaderState | undefined {
    return this.entries.get(enhancementKey(ref))?.state
  }

  /**
   * Ask the Host for one new attempt of a failed enhancement.
   * @param ref - exact source identity.
   */
  async retry(ref: IntelligentUiSourceRef): Promise<void> {
    const key = enhancementKey(ref)
    const entry = this.entries.get(key)
    if (entry === undefined || entry.state?.status !== 'failed') return
    const result = await this.remote.retry(ref).catch(() => undefined)
    if (this.disposed || result === undefined) return
    entry.deadline = Date.now() + POLL_WINDOW_MS
    this.update(entry, result)
    if (result.status === 'pending') this.poll(key, ref, entry, POLL_MS)
  }

  /** Stop every timer; later results are dropped. */
  dispose(): void {
    this.disposed = true
    for (const entry of this.entries.values()) clearTimeout(entry.timer)
    this.entries.clear()
  }

  private poll(key: string, ref: IntelligentUiSourceRef, entry: Entry, delay: number): void {
    clearTimeout(entry.timer)
    entry.timer = setTimeout(() => {
      entry.timer = undefined
      if (this.disposed || entry.listeners.size === 0 || entry.inFlight) return
      entry.inFlight = true
      void this.remote.read(ref).catch(() => undefined).then((result) => {
        entry.inFlight = false
        if (this.disposed || this.entries.get(key) !== entry) return
        if (result === undefined) {
          entry.failures++
          if (entry.failures >= MAX_TRANSPORT_FAILURES || Date.now() > entry.deadline) this.update(entry, { status: 'unavailable' })
          else this.poll(key, ref, entry, POLL_MS * entry.failures)
          return
        }
        entry.failures = 0
        if (result.status === 'pending' && Date.now() > entry.deadline) {
          this.update(entry, { status: 'unavailable' })
          return
        }
        this.update(entry, result)
        if (result.status === 'pending') this.poll(key, ref, entry, POLL_MS)
      })
    }, delay)
  }

  private update(entry: Entry, state: ReaderState): void {
    entry.state = state
    for (const listener of [...entry.listeners]) listener()
  }
}
