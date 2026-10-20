/**
 * The one source-identity rule Host and Client share: which blocks of a final
 * answer form its Markdown, and how that text hashes. Pure, environment-free.
 */

import { RENDER_SCHEMA_VERSION } from '../types.ts'

/** A content block reduced to what the identity rule reads. */
export interface SourceBlockLike {
  readonly kind: string
  readonly text?: string
}

/**
 * Join the visible text blocks of one answer, in order. Reasoning, tool calls,
 * images, and unknown blocks never enter the source.
 * @param blocks - the answer's blocks; Host maps `type` to `kind` first.
 * @returns the answer Markdown.
 */
export function sourceMarkdown(blocks: readonly SourceBlockLike[]): string {
  return blocks
    .filter(block => block.kind === 'text' && typeof block.text === 'string')
    .map(block => block.text as string)
    .join('\n\n')
}

/**
 * Hash one answer text with two independent 32-bit FNV-1a lanes over UTF-16
 * code units plus the length. Identity binding only, not a security hash.
 * @param text - answer Markdown from {@link sourceMarkdown}.
 * @returns a short lowercase hex identity.
 */
export function hashSource(text: string): string {
  let a = 0x811c9dc5
  let b = 0x01000193 ^ 0x5bd1e995
  for (let index = 0; index < text.length; index++) {
    const code = text.charCodeAt(index)
    a = Math.imul(a ^ code, 0x01000193)
    b = Math.imul(b ^ code, 0x5bd1e995) ^ (b >>> 15)
  }
  const hex = (value: number): string => (value >>> 0).toString(16).padStart(8, '0')
  return `${hex(a)}${hex(b)}${text.length.toString(16)}`
}

/** Identity fields that address one enhancement. */
export interface SourceKeyFields {
  readonly sessionId: string
  readonly turn: number
  readonly messageId: string
  readonly sourceSeq: number
  readonly sourceHash: string
}

/**
 * The idempotency key of one enhancement, path-safe for per-record storage.
 * @param ref - exact source identity.
 * @returns `[a-z0-9]` key bound to every identity field and the schema version.
 */
export function enhancementKey(ref: SourceKeyFields): string {
  const material = JSON.stringify([
    ref.sessionId, ref.turn, ref.messageId, ref.sourceSeq, ref.sourceHash, RENDER_SCHEMA_VERSION,
  ])
  return `k${hashSource(material)}`
}
