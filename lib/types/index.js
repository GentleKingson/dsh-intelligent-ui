/**
 * dsh-intelligent-ui, Host half. `smart-auto` observes finalized root-session
 * answers, screens them locally, makes at most one auxiliary model call per
 * answer, validates and persists the bound view, and serves read-only results.
 * `inline-stream` instead offers root agents one native view tool (see
 * `inline-tool.ts`) and makes no auxiliary call.
 * @module dsh-intelligent-ui
 */
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
import { Service } from '@deepseek-ai/cordis';
import { BlockAssembler, createUserMessage } from '@deepseek-ai/dsh-llm';
import { SessionId } from '@deepseek-ai/dsh-session/types';
import { defineDomain, domainTable } from '@deepseek-ai/dsh-storage-domain';
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import { z } from 'zod';
import { enhancementKey, hashSource, sourceMarkdown } from "./shared/source.js";
import { buildSourceIndex } from "./source-index.js";
import { framePrompt, screen, SYSTEM_PROMPT } from "./smart-auto.js";
import { readProgram } from "./program.js";
import { viewSchema } from "./view-schema.js";
import { LIMITS } from "./limits.js";
import { RENDER_SCHEMA_VERSION } from "./types.js";
import { installInline } from "./inline-tool.js";
const configSchema = z.strictObject({ mode: z.enum(['smart-auto', 'inline-stream', 'off']).default('smart-auto') });
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
});
/** Disposable derived data: an unreadable record is set aside, never fatal. */
const domainSpec = defineDomain({
    name: 'intelligent_ui',
    version: 1,
    layout: 'per-record',
    invalidRecords: 'backup-and-skip',
    tables: { views: domainTable(recordSchema) },
});
function sameRef(left, right) {
    return left.sessionId === right.sessionId && left.turn === right.turn && left.messageId === right.messageId
        && left.sourceSeq === right.sourceSeq && left.sourceHash === right.sourceHash;
}
function blocksOf(content) {
    return content.map(block => block.type === 'text' ? { kind: 'text', text: block.text } : { kind: block.type });
}
/** Host service and Remote namespace `intelligentUi`. */
let IntelligentUiService = (() => {
    let _classSuper = TypertRemoteService;
    let _instanceExtraInitializers = [];
    let _read_decorators;
    let _retry_decorators;
    return class IntelligentUiService extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _read_decorators = [Remote('read')];
            _retry_decorators = [Remote('retry')];
            __esDecorate(this, null, _read_decorators, { kind: "method", name: "read", static: false, private: false, access: { has: obj => "read" in obj, get: obj => obj.read }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _retry_decorators, { kind: "method", name: "retry", static: false, private: false, access: { has: obj => "retry" in obj, get: obj => obj.retry }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static inject = ['llm', 'storageDomain'];
        static Config = configSchema;
        mode = __runInitializers(this, _instanceExtraInitializers);
        trackers = new Map();
        memory = new Map();
        table;
        active = 0;
        disposed = false;
        /**
         * @param ctx - Host context carrying the LLM and storage-domain services.
         * @param config - validated plugin configuration.
         */
        constructor(ctx, config) {
            super(ctx, 'intelligentUi');
            this.mode = config.mode;
        }
        /** Open the result domain, then start observing committed session events. */
        async [Service.init]() {
            const domain = await this.ctx.storageDomain.open(domainSpec);
            this.ctx.effect(() => () => domain.close(), 'intelligentUi.domainClose');
            this.table = domain.table('views');
            this.ctx.effect(() => () => {
                this.disposed = true;
                for (const entry of this.memory.values()) {
                    if (entry.status === 'pending')
                        entry.controller.abort();
                }
                this.memory.clear();
                this.trackers.clear();
            }, 'intelligentUi.abortPending');
            this.ctx.on('session/event', (session, event) => { this.observe(session, event); });
            if (this.mode === 'inline-stream')
                this.ctx.inject(['agents', 'tools', 'systemPrompt'], installInline);
            this.ctx.on('session/disposed', (session) => { this.trackers.delete(session.id); });
        }
        /**
         * Read the enhancement bound to one exact answer identity. Never generates,
         * never loads a Session.
         * @param request - exact source identity from the Client's closing node.
         * @returns the current state; `ready` carries the persisted view.
         */
        read(request) {
            return Promise.resolve(this.lookup(request));
        }
        /**
         * Start one new attempt for a failed enhancement; repeated calls coalesce
         * on the pending attempt. Produces no chat message.
         * @param request - exact source identity of the failed enhancement.
         * @returns the state after the request.
         */
        retry(request) {
            const key = enhancementKey(request);
            const entry = this.memory.get(key);
            if (this.mode !== 'smart-auto' || this.disposed || entry?.status !== 'failed' || !sameRef(entry.ref, request)) {
                return Promise.resolve(this.lookup(request));
            }
            this.start(key, entry.ref, entry.retry);
            return Promise.resolve(this.lookup(request));
        }
        lookup(request) {
            const key = enhancementKey(request);
            const entry = this.memory.get(key);
            if (entry !== undefined && sameRef(entry.ref, request)) {
                switch (entry.status) {
                    case 'pending': return { status: 'pending' };
                    case 'skipped': return { status: 'skipped', reason: entry.reason };
                    case 'failed': return { status: 'failed', reason: entry.reason, retryable: this.mode === 'smart-auto' };
                }
            }
            const record = this.table?.get(key);
            if (record !== undefined && sameRef(record, request)) {
                return { status: 'ready', view: record.view, usage: record.usage };
            }
            return { status: 'absent' };
        }
        /** Incremental per-turn tracking; never scans history. */
        observe(session, event) {
            if (this.mode !== 'smart-auto' || this.disposed || session.header.origin === 'subagent')
                return;
            const id = session.id;
            switch (event.type) {
                case 'turn/start':
                    this.trackers.set(id, { turn: event.data.turn, candidate: undefined });
                    return;
                case 'assistant/message': {
                    const tracker = this.trackers.get(id);
                    if (tracker?.turn !== event.data.turn)
                        return;
                    const content = event.data.message.content;
                    const final = event.data.interrupted !== true && !content.some(block => block.type === 'tool-call');
                    tracker.candidate = final ? { messageId: event.data.message.id, seq: event.seq, content } : undefined;
                    return;
                }
                case 'tool/call':
                case 'tool/result': {
                    // Tool activity after an answer leaves no final text until a new answer arrives.
                    const tracker = this.trackers.get(id);
                    if (tracker?.turn === event.data.turn)
                        tracker.candidate = undefined;
                    return;
                }
                case 'turn/end': {
                    const tracker = this.trackers.get(id);
                    this.trackers.delete(id);
                    if (tracker?.turn !== event.data.turn || event.data.reason.kind !== 'completed')
                        return;
                    const candidate = tracker.candidate;
                    if (candidate === undefined)
                        return;
                    const text = sourceMarkdown(blocksOf(candidate.content));
                    if (text.trim() === '')
                        return;
                    const config = session.requestHeader()?.config;
                    const ref = {
                        sessionId: id,
                        turn: event.data.turn,
                        messageId: candidate.messageId,
                        sourceSeq: candidate.seq,
                        sourceHash: hashSource(text),
                    };
                    const key = enhancementKey(ref);
                    if (this.memory.has(key) || this.table?.get(key) !== undefined)
                        return;
                    // Registered before this listener returns, so the first Client read
                    // can never observe a transient `absent` for a qualifying answer.
                    this.start(key, ref, {
                        text,
                        route: config === undefined ? undefined : { provider: config.provider, model: config.model },
                    });
                    return;
                }
                default:
                    return;
            }
        }
        /** Register `pending` synchronously and run the attempt in the background. */
        start(key, ref, source) {
            const controller = new AbortController();
            this.remember(key, { status: 'pending', ref, controller });
            void this.attempt(key, ref, source, controller).catch((error) => {
                this.ctx.logger.warn(`attempt failed unexpectedly: ${error instanceof Error ? error.name : 'unknown'}`);
                this.settle(key, controller, { status: 'failed', ref, reason: 'model-error', retry: source });
            });
        }
        async attempt(key, ref, source, controller) {
            await Promise.resolve();
            const skip = (reason) => {
                this.settle(key, controller, { status: 'skipped', ref, reason });
            };
            const fail = (reason) => {
                this.settle(key, controller, { status: 'failed', ref, reason, retry: source });
            };
            if (new TextEncoder().encode(source.text).length > LIMITS.inputBytes)
                return skip('too-large');
            const index = buildSourceIndex(source.text);
            const verdict = screen(source.text, index);
            if (!verdict.candidate)
                return skip(verdict.reason);
            if (source.route === undefined)
                return skip('no-route');
            if (this.active >= LIMITS.concurrency)
                return skip('busy');
            this.active++;
            const startedAt = Date.now();
            const timer = setTimeout(() => { controller.abort(new Error('timeout')); }, LIMITS.deadlineMs);
            try {
                const options = {
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
                };
                const assembler = new BlockAssembler();
                for await (const chunk of this.ctx.llm.stream(options)) {
                    if (controller.signal.aborted)
                        break;
                    assembler.push(chunk);
                }
                if (controller.signal.aborted)
                    return fail(this.disposed ? 'model-error' : 'timeout');
                const finish = assembler.finish;
                if (finish.kind === 'max-tokens')
                    return fail('truncated');
                if (finish.kind !== 'stop')
                    return fail('model-error');
                const blocks = assembler.blocks();
                if (blocks.some(block => block.type === 'tool-call'))
                    return fail('invalid-output');
                const outcome = readProgram(sourceMarkdown(blocksOf(blocks)), index);
                if (outcome.kind === 'skip')
                    return skip('model-skip');
                if (outcome.kind === 'invalid') {
                    this.ctx.logger.info(`rejected program: ${outcome.detail}`);
                    return fail('invalid-output');
                }
                const usage = assembler.usage;
                const durationMs = Date.now() - startedAt;
                await this.persist(key, controller, ref, outcome.view, usage === undefined ? { durationMs } : {
                    inputTokens: usage.inputTokens + (usage.cacheReadTokens ?? 0) + (usage.cacheWriteTokens ?? 0),
                    outputTokens: usage.outputTokens,
                    durationMs,
                }, source);
            }
            catch (error) {
                if (controller.signal.aborted)
                    return fail(this.disposed ? 'model-error' : 'timeout');
                this.ctx.logger.info(`auxiliary call failed: ${error instanceof Error ? error.name : 'unknown'}`);
                return fail('model-error');
            }
            finally {
                clearTimeout(timer);
                this.active--;
            }
        }
        /** Persist first; only a durable record becomes `ready`. */
        async persist(key, controller, ref, view, usage, source) {
            const table = this.table;
            if (table === undefined || this.disposed)
                return;
            try {
                await table.put(key, { schema: RENDER_SCHEMA_VERSION, ...ref, view, usage, createdAt: Date.now() });
            }
            catch (error) {
                this.ctx.logger.warn(`storage write failed: ${error instanceof Error ? error.name : 'unknown'}`);
                this.settle(key, controller, { status: 'failed', ref, reason: 'storage', retry: source });
                return;
            }
            const entry = this.memory.get(key);
            if (entry?.status === 'pending' && entry.controller === controller)
                this.memory.delete(key);
        }
        /** A late attempt only writes its own still-current key. */
        settle(key, controller, next) {
            const entry = this.memory.get(key);
            if (this.disposed || entry?.status !== 'pending' || entry.controller !== controller)
                return;
            this.remember(key, next);
        }
        /** Bounded memory: evict the oldest settled entries first. */
        remember(key, entry) {
            this.memory.delete(key);
            this.memory.set(key, entry);
            if (this.memory.size <= LIMITS.memoryEntries)
                return;
            for (const [candidate, value] of this.memory) {
                if (this.memory.size <= LIMITS.memoryEntries)
                    break;
                if (value.status !== 'pending')
                    this.memory.delete(candidate);
            }
        }
    };
})();
export { IntelligentUiService };
export default IntelligentUiService;
//# sourceMappingURL=index.js.map