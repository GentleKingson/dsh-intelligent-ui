/**
 * dsh-intelligent-ui, Host half. `smart-auto` observes finalized root-session
 * answers, screens them locally, makes at most one auxiliary model call per
 * answer, validates and persists the bound view, and serves read-only results.
 * `inline-stream` instead offers root agents one native view tool (see
 * `inline-tool.ts`) and makes no auxiliary call.
 * @module dsh-intelligent-ui
 */
import type { Context, Volatile } from '@deepseek-ai/cordis';
import { Service } from '@deepseek-ai/cordis';
import Schema from '@deepseek-ai/schemastery';
import type { ContextFormed } from '@deepseek-ai/dsh-llm';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { IntelligentUiReadResult, IntelligentUiSourceRef } from './types.ts';
export type * from './types.ts';
declare module '@deepseek-ai/dsh-llm' {
    interface MessageSourceMap {
        'dsh-intelligent-ui': {
            kind: 'dsh-intelligent-ui';
        } & ContextFormed;
    }
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        intelligentUi: IntelligentUiService;
    }
}
/** Plugin configuration. */
export interface Config {
    /**
     * `smart-auto` screens every new root answer; `inline-stream` lets the root
     * agent's own model stream view data through a native tool; `off` makes no
     * new model calls. Volatile only so the Plugins page can edit it; the
     * service reads it once at start, so a saved change applies on restart.
     */
    readonly mode: Volatile<'smart-auto' | 'inline-stream' | 'off'>;
}
/** Host service and Remote namespace `intelligentUi`. */
export declare class IntelligentUiService extends TypertRemoteService {
    static inject: string[];
    static Config: Schema<Schemastery.ObjectS<NoInfer<{
        mode: Schema<"off" | "smart-auto" | "inline-stream", "off" | "smart-auto" | "inline-stream", "volatile-defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        mode: Schema<"off" | "smart-auto" | "inline-stream", "off" | "smart-auto" | "inline-stream", "volatile-defined">;
    }>>, "plain">;
    private readonly mode;
    private readonly trackers;
    private readonly memory;
    private table?;
    private active;
    private disposed;
    /**
     * @param ctx - Host context carrying the LLM and storage-domain services.
     * @param config - validated plugin configuration.
     */
    constructor(ctx: Context, config: Config);
    /** Open the result domain, then start observing committed session events. */
    protected [Service.init](): Promise<void>;
    /**
     * Read the enhancement bound to one exact answer identity. Never generates,
     * never loads a Session.
     * @param request - exact source identity from the Client's closing node.
     * @returns the current state; `ready` carries the persisted view.
     */
    read(request: IntelligentUiSourceRef): Promise<IntelligentUiReadResult>;
    /**
     * Start one new attempt for a failed enhancement; repeated calls coalesce
     * on the pending attempt. Produces no chat message.
     * @param request - exact source identity of the failed enhancement.
     * @returns the state after the request.
     */
    retry(request: IntelligentUiSourceRef): Promise<IntelligentUiReadResult>;
    private lookup;
    /** Incremental per-turn tracking; never scans history. */
    private observe;
    /** Register `pending` synchronously and run the attempt in the background. */
    private start;
    private attempt;
    /** Persist first; only a durable record becomes `ready`. */
    private persist;
    /** A late attempt only writes its own still-current key. */
    private settle;
    /** Bounded memory: evict the oldest settled entries first. */
    private remember;
}
export default IntelligentUiService;
//# sourceMappingURL=index.d.ts.map