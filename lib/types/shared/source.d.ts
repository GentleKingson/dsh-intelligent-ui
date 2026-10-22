/**
 * The one source-identity rule Host and Client share: which blocks of a final
 * answer form its Markdown, and how that text hashes. Pure, environment-free.
 */
/** A content block reduced to what the identity rule reads. */
export interface SourceBlockLike {
    readonly kind: string;
    readonly text?: string;
}
/**
 * Join the visible text blocks of one answer, in order. Reasoning, tool calls,
 * images, and unknown blocks never enter the source.
 * @param blocks - the answer's blocks; Host maps `type` to `kind` first.
 * @returns the answer Markdown.
 */
export declare function sourceMarkdown(blocks: readonly SourceBlockLike[]): string;
/**
 * Hash one answer text with two independent 32-bit FNV-1a lanes over UTF-16
 * code units plus the length. Identity binding only, not a security hash.
 * @param text - answer Markdown from {@link sourceMarkdown}.
 * @returns a short lowercase hex identity.
 */
export declare function hashSource(text: string): string;
/** Identity fields that address one enhancement. */
export interface SourceKeyFields {
    readonly sessionId: string;
    readonly turn: number;
    readonly messageId: string;
    readonly sourceSeq: number;
    readonly sourceHash: string;
}
/**
 * The idempotency key of one enhancement, path-safe for per-record storage.
 * @param ref - exact source identity.
 * @returns `[a-z0-9]` key bound to every identity field and the schema version.
 */
export declare function enhancementKey(ref: SourceKeyFields): string;
//# sourceMappingURL=source.d.ts.map