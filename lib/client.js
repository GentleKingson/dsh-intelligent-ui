window.__ModuleLoader__.load({
	id: "dsh-intelligent-ui",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/core/util.js
		function getEnumValues(entries) {
			const numericValues = Object.values(entries).filter((v) => typeof v === "number");
			return Object.entries(entries).filter(([k, _]) => numericValues.indexOf(+k) === -1).map(([_, v]) => v);
		}
		function joinValues(array, separator = "|") {
			return array.map((val) => stringifyPrimitive(val)).join(separator);
		}
		function jsonStringifyReplacer(_, value) {
			if (typeof value === "bigint") return value.toString();
			return value;
		}
		var Cached = class {
			constructor(getter) {
				this._getter = getter;
				this._value = void 0;
			}
			get value() {
				const getter = this._getter;
				if (getter !== void 0) {
					this._value = getter();
					this._getter = void 0;
				}
				return this._value;
			}
		};
		function cached(getter) {
			return new Cached(getter);
		}
		function nullish(input) {
			return input === null || input === void 0;
		}
		function cleanRegex(source) {
			const start = source.startsWith("^") ? 1 : 0;
			const end = source.endsWith("$") ? source.length - 1 : source.length;
			return source.slice(start, end);
		}
		function floatSafeRemainder(val, step) {
			const ratio = val / step;
			const roundedRatio = Math.round(ratio);
			const tolerance = 4 * Number.EPSILON * Math.max(Math.abs(ratio), 1);
			if (Math.abs(ratio - roundedRatio) < tolerance) return 0;
			return ratio - roundedRatio;
		}
		function assignProp(target, prop, value) {
			Object.defineProperty(target, prop, {
				value,
				writable: true,
				enumerable: true,
				configurable: true
			});
		}
		/**
		* Whichever object a def's `shape` currently answers from: the one the caller passed until the first read, the frozen copy after it.
		*
		* Its keys and descriptors read without invoking anything, which is what lets a discriminated union check its discriminator, and the cycle walk read a shape, without resolving a getter that references the schema being constructed. A def that answers `shape` from an accessor of its own has none.
		*/
		function rawShape(def) {
			const desc = Object.getOwnPropertyDescriptor(def, "shape");
			return desc?.get ? desc.get.raw : desc?.value;
		}
		function sourceShape(schema) {
			return rawShape(schema._zod.def) ?? schema._zod.def.shape;
		}
		function deferProp(target, key, getter) {
			Object.defineProperty(target, key, {
				get() {
					const value = getter();
					assignProp(this, key, value);
					return value;
				},
				enumerable: true,
				configurable: true
			});
		}
		function putProp(target, key, value) {
			if (key in target) assignProp(target, key, value);
			else target[key] = value;
		}
		/**
		* Copies `keys` of `source`'s shape onto `target`, each value passed through `wrap`.
		*
		* A key the source has resolved is copied through now, so the derived shape states it outright and nothing has to resolve it to learn what it holds. A key the source still defers stays deferred, and reads back through the source's own `shape`, so it resolves once and both shapes get that one schema.
		*/
		function mirrorShape(target, source, keys, wrap) {
			const raw = sourceShape(source);
			for (const key of keys) {
				const desc = Object.getOwnPropertyDescriptor(raw, key);
				if (!desc.enumerable) continue;
				if (desc.get) deferProp(target, key, () => {
					const value = source._zod.def.shape[key];
					return wrap ? wrap(value, key) : value;
				});
				else putProp(target, key, wrap ? wrap(desc.value, key) : desc.value);
			}
		}
		function mirrorProps(target, source) {
			for (const key of Reflect.ownKeys(source)) {
				const desc = Object.getOwnPropertyDescriptor(source, key);
				if (!desc.enumerable) continue;
				if (desc.get) deferProp(target, key, () => source[key]);
				else putProp(target, key, desc.value);
			}
		}
		function mergeDefs(...defs) {
			const mergedDescriptors = {};
			for (const def of defs) {
				const descriptors = Object.getOwnPropertyDescriptors(def);
				Object.assign(mergedDescriptors, descriptors);
			}
			return Object.defineProperties({}, mergedDescriptors);
		}
		function esc(str) {
			return JSON.stringify(str);
		}
		function slugify(input) {
			return input.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
		}
		const captureStackTrace = "captureStackTrace" in Error ? Error.captureStackTrace : (..._args) => {};
		function isObject(data) {
			return typeof data === "object" && data !== null && !Array.isArray(data);
		}
		const allowsEval = /* @__PURE__*/ cached(() => {
			if (globalConfig.jitless) return false;
			if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare")) return false;
			try {
				new Function("");
				return true;
			} catch (_) {
				return false;
			}
		});
		function isPlainObject(o) {
			if (isObject(o) === false) return false;
			const ctor = o.constructor;
			if (ctor === void 0) return true;
			if (typeof ctor !== "function") return true;
			const prot = ctor.prototype;
			if (isObject(prot) === false) return false;
			if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) return false;
			return true;
		}
		function shallowClone(o) {
			if (isPlainObject(o)) return { ...o };
			if (Array.isArray(o)) return [...o];
			if (o instanceof Map) return new Map(o);
			if (o instanceof Set) return new Set(o);
			return o;
		}
		const propertyKeyTypes = /* @__PURE__*/ new Set([
			"string",
			"number",
			"symbol"
		]);
		function escapeRegex(str) {
			return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		}
		function clone(inst, def, params) {
			const cl = new inst._zod.constr(def ?? inst._zod.def);
			if (!def || params?.parent) cl._zod.parent = inst;
			return cl;
		}
		function normalizeParams(_params) {
			const params = _params;
			if (!params) return {};
			if (typeof params === "string") return { error: () => params };
			if (params?.message !== void 0) {
				if (params?.error !== void 0) throw new Error("Cannot specify both `message` and `error` params");
				params.error = params.message;
			}
			delete params.message;
			if (typeof params.error === "string") return {
				...params,
				error: () => params.error
			};
			return params;
		}
		function stringifyPrimitive(value) {
			if (typeof value === "bigint") return value.toString() + "n";
			if (typeof value === "string") return `"${value}"`;
			return `${value}`;
		}
		function optionalKeys(shape) {
			return Object.keys(shape).filter((k) => {
				return shape[k]._zod.optin !== void 0 && shape[k]._zod.optout === "optional";
			});
		}
		const NUMBER_FORMAT_RANGES = /*@__PURE__*/ (() => ({
			safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
			int32: [-2147483648, 2147483647],
			uint32: [0, 4294967295],
			float32: [-34028234663852886e22, 34028234663852886e22],
			float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
		}))();
		const BIGINT_FORMAT_RANGES = {
			int64: [/* @__PURE__*/ BigInt("-9223372036854775808"), /* @__PURE__*/ BigInt("9223372036854775807")],
			uint64: [/* @__PURE__*/ BigInt(0), /* @__PURE__*/ BigInt("18446744073709551615")]
		};
		function pick(schema, mask) {
			const currDef = schema._zod.def;
			const checks = currDef.checks;
			if (checks && checks.length > 0) throw new Error(".pick() cannot be used on object schemas containing refinements");
			const newShape = {};
			mirrorShape(newShape, schema, maskedKeys(schema, mask));
			return clone(schema, mergeDefs(currDef, {
				shape: newShape,
				checks: []
			}));
		}
		function maskedKeys(schema, mask) {
			const raw = sourceShape(schema);
			const keys = [];
			for (const key of Reflect.ownKeys(mask)) {
				if (!Object.getOwnPropertyDescriptor(raw, key)?.enumerable) throw new Error(`Unrecognized key: "${String(key)}"`);
				if (mask[key]) keys.push(key);
			}
			return keys;
		}
		function omit(schema, mask) {
			const currDef = schema._zod.def;
			const checks = currDef.checks;
			if (checks && checks.length > 0) throw new Error(".omit() cannot be used on object schemas containing refinements");
			const omitted = new Set(maskedKeys(schema, mask));
			const newShape = {};
			mirrorShape(newShape, schema, Reflect.ownKeys(sourceShape(schema)).filter((key) => !omitted.has(key)));
			return clone(schema, mergeDefs(currDef, {
				shape: newShape,
				checks: []
			}));
		}
		function extend(schema, shape) {
			if (!isPlainObject(shape)) throw new Error("Invalid input to extend: expected a plain object");
			const checks = schema._zod.def.checks;
			if (checks && checks.length > 0) {
				const existingShape = sourceShape(schema);
				for (const key of Reflect.ownKeys(shape)) if (Object.getOwnPropertyDescriptor(existingShape, key) !== void 0) throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
			}
			return clone(schema, mergeDefs(schema._zod.def, { shape: extended(schema, shape) }));
		}
		function extended(schema, shape) {
			const newShape = {};
			mirrorShape(newShape, schema, Reflect.ownKeys(sourceShape(schema)));
			mirrorProps(newShape, shape);
			return newShape;
		}
		function safeExtend(schema, shape) {
			if (!isPlainObject(shape)) throw new Error("Invalid input to safeExtend: expected a plain object");
			return clone(schema, mergeDefs(schema._zod.def, { shape: extended(schema, shape) }));
		}
		function merge(a, b) {
			if (!b?._zod?.def) throw new Error("Invalid input to merge: expected an object schema. To merge a plain shape, use `.extend()`.");
			if (a._zod.def.checks?.length) throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
			const newShape = {};
			mirrorShape(newShape, a, Reflect.ownKeys(sourceShape(a)));
			mirrorShape(newShape, b, Reflect.ownKeys(sourceShape(b)));
			return clone(a, mergeDefs(a._zod.def, {
				shape: newShape,
				get catchall() {
					return b._zod.def.catchall;
				},
				checks: b._zod.def.checks ?? []
			}));
		}
		function partial(Class, schema, mask, name = "partial") {
			const checks = schema._zod.def.checks;
			if (checks && checks.length > 0) throw new Error(`.${name}() cannot be used on object schemas containing refinements`);
			const selected = mask ? new Set(maskedKeys(schema, mask)) : void 0;
			const newShape = {};
			mirrorShape(newShape, schema, Reflect.ownKeys(sourceShape(schema)), Class && ((value, key) => selected && !selected.has(key) ? value : new Class({
				type: "optional",
				innerType: value
			})));
			return clone(schema, mergeDefs(schema._zod.def, {
				shape: newShape,
				checks: []
			}));
		}
		function required(Class, schema, mask) {
			const selected = mask ? new Set(maskedKeys(schema, mask)) : void 0;
			const newShape = {};
			mirrorShape(newShape, schema, Reflect.ownKeys(sourceShape(schema)), (value, key) => selected && !selected.has(key) ? value : new Class({
				type: "nonoptional",
				innerType: value
			}));
			return clone(schema, mergeDefs(schema._zod.def, { shape: newShape }));
		}
		function aborted(x, startIndex = 0) {
			if (x.aborted === true) return true;
			for (let i = startIndex; i < x.issues.length; i++) if (x.issues[i]?.continue !== true) return true;
			return false;
		}
		function explicitlyAborted(x, startIndex = 0) {
			if (x.aborted === true) return true;
			for (let i = startIndex; i < x.issues.length; i++) if (x.issues[i]?.continue === false) return true;
			return false;
		}
		function prefixIssues(path, issues) {
			return issues.map((iss) => {
				var _a;
				(_a = iss).path ?? (_a.path = []);
				iss.path.unshift(path);
				return iss;
			});
		}
		function unwrapMessage(message) {
			return typeof message === "string" ? message : message?.message;
		}
		/** The leading size checks of `defChecks` that set an upper bound, each paired with it. */
		function sizeCaps(defChecks) {
			const caps = [];
			for (const ch of defChecks ?? []) {
				const d = ch._zod.def;
				if (!/_(length|size)$|_equals$/.test(d.check)) break;
				const max = d.maximum ?? d.length ?? d.size;
				if (max >= 0) caps.push([max, ch]);
			}
			return caps;
		}
		function attachSchema(issues, start, inst) {
			var _a;
			for (let i = start; i < issues.length; i++) (_a = issues[i]).schema ?? (_a.schema = inst);
		}
		function finalizeIssue(iss, ctx, config) {
			var _a;
			const traits = iss.inst?._zod?.traits;
			if (traits?.has("$ZodType")) {
				if (traits.has("$ZodCheck")) (_a = iss).schema ?? (_a.schema = iss.inst);
				else iss.schema = iss.inst;
			}
			const schemaError = iss.schema !== iss.inst ? iss.schema?._zod.def?.error : void 0;
			const message = iss.message ? iss.message : unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ?? unwrapMessage(schemaError?.(iss)) ?? unwrapMessage(ctx?.error?.(iss)) ?? unwrapMessage(config.customError?.(iss)) ?? unwrapMessage(config.localeError?.(iss)) ?? "Invalid input";
			const full = {};
			for (const k of Object.keys(iss)) {
				if (k === "inst" || k === "schema" || k === "continue" || k === "input" || k === "__proto__") continue;
				full[k] = iss[k];
			}
			full.path ?? (full.path = []);
			full.message = message;
			if (ctx?.reportInput) full.input = iss.input;
			return full;
		}
		const highSurrogate = /[\uD800-\uDBFF]/;
		function codePointLength(str) {
			const units = str.length;
			if (!highSurrogate.test(str)) return units;
			let count = units;
			for (let i = 0; i < units - 1; i++) if ((str.charCodeAt(i) & 64512) === 55296 && (str.charCodeAt(i + 1) & 64512) === 56320) {
				count--;
				i++;
			}
			return count;
		}
		function getLengthableOrigin(input) {
			if (Array.isArray(input)) return "array";
			if (typeof input === "string") return "string";
			return "unknown";
		}
		function parsedType(data) {
			const t = typeof data;
			switch (t) {
				case "number": return Number.isNaN(data) ? "nan" : "number";
				case "object": {
					if (data === null) return "null";
					if (Array.isArray(data)) return "array";
					const obj = data;
					if (obj && Object.getPrototypeOf(obj) !== Object.prototype && "constructor" in obj && obj.constructor) return obj.constructor.name;
				}
			}
			return t;
		}
		function issue(...args) {
			const [iss, input, inst] = args;
			if (typeof iss === "string") return {
				message: iss,
				code: "custom",
				input,
				inst
			};
			return { ...iss };
		}
		/**
		* Installs a trait's members on its prototype. Each value builds that member for the instance on first read; the built value shadows the accessor as an own property, so a detached `const { parse } = schema` keeps working.
		*
		* Call this from a `proto` initializer, which runs once per prototype — never per instance.
		*/
		function members(proto, table) {
			for (const key in table) {
				const desc = Object.getOwnPropertyDescriptor(table, key);
				if (desc.get) Object.defineProperty(proto, key, {
					...desc,
					enumerable: false
				});
				else defineBound(proto, key, desc.value);
			}
		}
		/** Shadows a prototype member with an own value, so a getter that builds from the instance runs once. */
		function own(inst, key, value, enumerable = true) {
			Object.defineProperty(inst, key, {
				configurable: true,
				writable: true,
				enumerable,
				value
			});
			return value;
		}
		/** Like {@link own}, for a member that was never an own data property and has to stay out of `Object.keys`. */
		function hide(inst, key, value) {
			return own(inst, key, value, false);
		}
		/** Adds members a table derives from the instance: each builds on first read and shadows as own data, and assignment shadows the same way, as when these were own properties. */
		/* @__NO_SIDE_EFFECTS__ */
		function derived(computes, table) {
			for (const key in computes) {
				const compute = computes[key];
				Object.defineProperty(table, key, {
					configurable: true,
					enumerable: true,
					get() {
						return own(this, key, compute(this));
					},
					set(value) {
						own(this, key, value);
					}
				});
			}
			return table;
		}
		function defineBound(proto, key, fn) {
			Object.defineProperty(proto, key, {
				configurable: true,
				get() {
					return this == null ? fn : own(this, key, fn.bind(this));
				},
				set(value) {
					own(this, key, value);
				}
			});
		}
		/** Returns the prototype to install on, or `undefined` if this group is already installed on it. */
		function claim(inst, sentinel) {
			const proto = Object.getPrototypeOf(inst);
			return sentinel in proto ? void 0 : proto;
		}
		let installing;
		let broke = false;
		const breaker = {
			configurable: true,
			get() {
				broke = true;
			}
		};
		/**
		* Installs a lazily-derived internal on the `_zod` prototype of `inst`'s
		* constructor, computed from the internals object itself and cached there on
		* first read. One accessor per constructor rather than one per instance.
		*/
		function defineLazyInternal(inst, key, compute) {
			const proto = Object.getPrototypeOf(inst._zod);
			if (key in proto && installing !== inst._zod) {
				installing = void 0;
				return;
			}
			installing = inst._zod;
			Object.defineProperty(proto, key, {
				configurable: true,
				get() {
					Object.defineProperty(this, key, breaker);
					const outer = broke;
					broke = false;
					try {
						const value = compute(this);
						if (broke) delete this[key];
						else Object.defineProperty(this, key, {
							configurable: true,
							writable: true,
							value
						});
						broke = broke || outer;
						return value;
					} catch (err) {
						delete this[key];
						broke = broke || outer;
						throw err;
					}
				},
				set(value) {
					Object.defineProperty(this, key, {
						configurable: true,
						writable: true,
						value
					});
				}
			});
		}
		/**
		* Installs `key` on `inst`'s prototype, computed by `make` on first read and cached there as an own
		* data property. One accessor per constructor rather than one per instance, because an own accessor
		* puts every instance after the first into v8 dictionary mode. The key doubles as the sentinel.
		*/
		function installLazyProp(inst, key, make, enumerable) {
			const proto = claim(inst, key);
			if (!proto) return;
			Object.defineProperty(proto, key, {
				configurable: true,
				get() {
					const desc = {
						configurable: true,
						writable: true,
						enumerable,
						value: void 0
					};
					Object.defineProperty(this, key, desc);
					desc.value = make(this);
					Object.defineProperty(this, key, desc);
					return desc.value;
				},
				set(value) {
					Object.defineProperty(this, key, {
						configurable: true,
						writable: true,
						enumerable,
						value
					});
				}
			});
		}
		/** Marks the thunk `_catch` synthesises for a constant catch value. `Function.length` cannot tell that thunk from a user callback — rest and defaulted parameters both report arity 0 — and a user callback reads `ctx.error`, whose issues only finalize correctly against the caller's per-parse error map. Provenance can say what arity cannot. A plain string key rather than `Symbol.for`, whose call at module scope no bundler can prove pure — the same shape that anchored `urlCanParse` into every build. */
		const CONSTANT_CATCH = "~constantCatch";
		/** Wraps a constant catch value in a thunk tagged with {@link CONSTANT_CATCH}. */
		function constantCatch(value) {
			const fn = () => value;
			fn[CONSTANT_CATCH] = true;
			return fn;
		}
		//#endregion
		//#region node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/core/core.js
		var _a$1;
		const _zodDesc = {
			value: void 0,
			enumerable: false
		};
		let _E = "captureStackTrace" in Error ? Error : null;
		function newError(Definition) {
			const E = _E;
			if (E) {
				const saved = E.stackTraceLimit;
				if (typeof saved === "number") {
					try {
						E.stackTraceLimit = 0;
					} catch {
						_E = null;
						return new Definition();
					}
					try {
						return new Definition();
					} finally {
						E.stackTraceLimit = saved;
					}
				}
			}
			return new Definition();
		}
		/* @__NO_SIDE_EFFECTS__ */
		function $constructor(name, initializer, proto, params) {
			const zodProto = {};
			function Internals(def) {
				this.def = def;
				this.constr = _;
				this.traits = /* @__PURE__ */ new Set();
			}
			Internals.prototype = zodProto;
			const protoMembers = proto;
			const initialized = protoMembers && /* @__PURE__ */ new WeakSet();
			function init(inst, def) {
				if (!inst._zod) {
					_zodDesc.value = new Internals(def);
					try {
						Object.defineProperty(inst, "_zod", _zodDesc);
					} finally {
						_zodDesc.value = void 0;
					}
				} else if (inst._zod.traits.has(name)) return;
				inst._zod.traits.add(name);
				initializer(inst, def);
				if (initialized) {
					const own = Object.getPrototypeOf(inst);
					const ctorProto = inst._zod.constr.prototype;
					let up = own;
					while (up && up !== ctorProto) up = Object.getPrototypeOf(up);
					const target = up ?? own;
					if (!initialized.has(target)) {
						initialized.add(target);
						members(target, protoMembers);
					}
				}
				const proto = _.prototype;
				for (const k in proto) {
					if (!Object.prototype.hasOwnProperty.call(proto, k)) continue;
					if (!(k in inst)) inst[k] = proto[k].bind(inst);
				}
			}
			const Parent = params?.Parent ?? Object;
			class Definition extends Parent {}
			Object.defineProperty(Definition, "name", { value: name });
			function _(def) {
				const inst = params?.Parent ? newError(Definition) : this;
				init(inst, def);
				const deferred = inst._zod.deferred;
				if (deferred) {
					for (const fn of deferred) fn();
					inst._zod.deferred = void 0;
				}
				const pp = globalThis.__zod_globalConfig?.postProcessor;
				if (pp) pp(inst);
				return inst;
			}
			Object.defineProperty(_, "init", { value: init });
			Object.defineProperty(_, Symbol.hasInstance, { value: (inst) => {
				if (params?.Parent && inst instanceof params.Parent) return true;
				return inst?._zod?.traits?.has(name);
			} });
			Object.defineProperty(_, "name", { value: name });
			return _;
		}
		var $ZodAsyncError = class extends Error {
			constructor() {
				super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
			}
		};
		var $ZodEncodeError = class extends Error {
			constructor(name) {
				super(`Encountered unidirectional transform during encode: ${name}`);
				this.name = "ZodEncodeError";
			}
		};
		(_a$1 = globalThis).__zod_globalConfig ?? (_a$1.__zod_globalConfig = {});
		const globalConfig = globalThis.__zod_globalConfig;
		function config(newConfig) {
			if (newConfig) Object.assign(globalConfig, newConfig);
			return globalConfig;
		}
		//#endregion
		//#region node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/core/errors.js
		function _getMessage() {
			const internals = this._zod;
			internals.message ?? (internals.message = JSON.stringify(internals.def, jsonStringifyReplacer, 2));
			return internals.message;
		}
		function _setMessage(value) {
			this._zod.message = value;
		}
		const _messageDesc = {
			get: _getMessage,
			set: _setMessage,
			enumerable: true,
			configurable: true
		};
		const _issuesDesc = {
			value: void 0,
			enumerable: false
		};
		const _installedToString = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]);
		const initializer$1 = (inst, def) => {
			inst.name = "$ZodError";
			_issuesDesc.value = def;
			Object.defineProperty(inst, "issues", _issuesDesc);
			_issuesDesc.value = void 0;
			Object.defineProperty(inst, "message", _messageDesc);
			const proto = Object.getPrototypeOf(inst);
			if (!_installedToString.has(proto)) {
				_installedToString.add(proto);
				Object.defineProperty(proto, "toString", {
					configurable: true,
					enumerable: false,
					get() {
						const value = () => this.message;
						Object.defineProperty(this, "toString", {
							value,
							configurable: true,
							writable: true
						});
						return value;
					},
					set(value) {
						Object.defineProperty(this, "toString", {
							value,
							configurable: true,
							writable: true
						});
					}
				});
			}
		};
		const $ZodError = /* @__PURE__ */ $constructor("$ZodError", initializer$1);
		/** Get-or-create `obj[key]` as an own data property. A path segment naming an inherited member
		* ("toString", "constructor") would otherwise read through to the prototype, and assigning
		* "__proto__" would hit the setter instead of creating a key. */
		function node(obj, key, make) {
			if (!Object.prototype.hasOwnProperty.call(obj, key)) {
				if (key === "__proto__") Object.defineProperty(obj, key, {
					value: make(),
					writable: true,
					enumerable: true,
					configurable: true
				});
				else obj[key] = make();
			}
			return obj[key];
		}
		function flattenError(error, mapper = (issue) => issue.message) {
			const fieldErrors = {};
			const formErrors = [];
			for (const sub of error.issues) if (sub.path.length > 0) node(fieldErrors, sub.path[0], () => []).push(mapper(sub));
			else formErrors.push(mapper(sub));
			return {
				formErrors,
				fieldErrors
			};
		}
		function formatError(error, mapper = (issue) => issue.message) {
			const fieldErrors = { _errors: [] };
			const processError = (error, path = []) => {
				for (const issue of error.issues) if (issue.code === "invalid_union" && issue.errors.length) issue.errors.map((issues) => processError({ issues }, [...path, ...issue.path]));
				else if (issue.code === "invalid_key") processError({ issues: issue.issues }, [...path, ...issue.path]);
				else if (issue.code === "invalid_element") processError({ issues: issue.issues }, [...path, ...issue.path]);
				else {
					const fullpath = [...path, ...issue.path];
					if (fullpath.length === 0) fieldErrors._errors.push(mapper(issue));
					else {
						let curr = fieldErrors;
						let i = 0;
						while (i < fullpath.length) {
							const el = fullpath[i];
							const terminal = i === fullpath.length - 1;
							if (el === "_errors") {
								if (terminal) curr._errors.push(mapper(issue));
								i++;
								continue;
							}
							if (!Object.prototype.hasOwnProperty.call(curr, el)) Object.defineProperty(curr, el, {
								value: { _errors: [] },
								enumerable: true,
								writable: true,
								configurable: true
							});
							const node = curr[el];
							if (terminal) node._errors.push(mapper(issue));
							curr = node;
							i++;
						}
					}
				}
			};
			processError(error);
			return fieldErrors;
		}
		//#endregion
		//#region node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/core/parse.js
		function finalizeParams(callee, params) {
			return {
				callee: params?.callee ?? callee,
				Err: params?.Err
			};
		}
		const _parse = (_Err) => {
			const fn = (schema, value, _ctx, _params) => {
				const ctx = _ctx ? {
					..._ctx,
					async: false
				} : { async: false };
				const result = schema._zod.run({
					value,
					issues: []
				}, ctx);
				if (result instanceof Promise) throw new $ZodAsyncError();
				if (result.issues.length) {
					const e = new ((_params?.Err) ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
					captureStackTrace(e, _params?.callee ?? fn);
					throw e;
				}
				return result.value;
			};
			return fn;
		};
		const _parseAsync = (_Err) => {
			const fn = async (schema, value, _ctx, params) => {
				const ctx = _ctx ? {
					..._ctx,
					async: true
				} : { async: true };
				let result = schema._zod.run({
					value,
					issues: []
				}, ctx);
				if (result instanceof Promise) result = await result;
				if (result.issues.length) {
					const e = new ((params?.Err) ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
					captureStackTrace(e, params?.callee ?? fn);
					throw e;
				}
				return result.value;
			};
			return fn;
		};
		const _safeParse = (_Err) => (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				async: false
			} : { async: false };
			const result = schema._zod.run({
				value,
				issues: []
			}, ctx);
			if (result instanceof Promise) throw new $ZodAsyncError();
			return result.issues.length ? failure(_Err, result.issues, ctx) : {
				success: true,
				data: result.value
			};
		};
		function failure(Err, issues, ctx) {
			let error;
			return {
				success: false,
				get error() {
					if (!error) {
						error = new Err(issues.map((iss) => finalizeIssue(iss, ctx, config())));
						issues = void 0;
						ctx = void 0;
					}
					return error;
				},
				set error(e) {
					error = e;
					issues = void 0;
					ctx = void 0;
				}
			};
		}
		const _safeParseAsync = (_Err) => async (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				async: true
			} : { async: true };
			let result = schema._zod.run({
				value,
				issues: []
			}, ctx);
			if (result instanceof Promise) result = await result;
			return result.issues.length ? failure(_Err, result.issues, ctx) : {
				success: true,
				data: result.value
			};
		};
		const COMPILE_INVALID = /* @__PURE__ */ Symbol.for("zod.compile.invalid");
		const COMPILE_FALLBACK = /* @__PURE__ */ Symbol.for("zod.compile.fallback");
		const validate = ((schema, value, _ctx) => {
			const validator = schema._zod.bag.validator;
			if (validator !== void 0) {
				if (validator(value) !== COMPILE_INVALID) return true;
				if (validator.definite === true && _ctx === void 0) return false;
			}
			return validateFallback(schema, value, _ctx);
		});
		function validateFallback(schema, value, _ctx) {
			const ctx = _ctx ? {
				..._ctx,
				async: false,
				abortEarly: true
			} : {
				async: false,
				abortEarly: true
			};
			const fallbackRun = schema._zod.bag.fallbackRun;
			let result;
			if (fallbackRun) {
				ctx[COMPILE_FALLBACK] = true;
				result = fallbackRun({
					value,
					issues: []
				}, ctx);
			} else result = schema._zod.run({
				value,
				issues: []
			}, ctx);
			if (result instanceof Promise) throw new $ZodAsyncError();
			return result.issues.length === 0;
		}
		const validateAsync$1 = async (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				async: true,
				abortEarly: true
			} : {
				async: true,
				abortEarly: true
			};
			let result = schema._zod.run({
				value,
				issues: []
			}, ctx);
			if (result instanceof Promise) result = await result;
			return result.issues.length === 0;
		};
		const _encode = (_Err) => {
			const parse = _parse(_Err);
			const fn = (schema, value, _ctx, _params) => {
				const ctx = _ctx ? {
					..._ctx,
					direction: "backward"
				} : { direction: "backward" };
				return parse(schema, value, ctx, finalizeParams(fn, _params));
			};
			return fn;
		};
		const _decode = (_Err) => {
			const parse = _parse(_Err);
			const fn = (schema, value, _ctx, _params) => {
				return parse(schema, value, _ctx, finalizeParams(fn, _params));
			};
			return fn;
		};
		const _encodeAsync = (_Err) => {
			const parseAsync = _parseAsync(_Err);
			const fn = async (schema, value, _ctx, _params) => {
				const ctx = _ctx ? {
					..._ctx,
					direction: "backward"
				} : { direction: "backward" };
				return await parseAsync(schema, value, ctx, finalizeParams(fn, _params));
			};
			return fn;
		};
		const _decodeAsync = (_Err) => {
			const parseAsync = _parseAsync(_Err);
			const fn = async (schema, value, _ctx, _params) => {
				return await parseAsync(schema, value, _ctx, finalizeParams(fn, _params));
			};
			return fn;
		};
		const _safeEncode = (_Err) => (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				direction: "backward"
			} : { direction: "backward" };
			return _safeParse(_Err)(schema, value, ctx);
		};
		const _safeDecode = (_Err) => (schema, value, _ctx) => {
			return _safeParse(_Err)(schema, value, _ctx);
		};
		const _safeEncodeAsync = (_Err) => async (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				direction: "backward"
			} : { direction: "backward" };
			return _safeParseAsync(_Err)(schema, value, ctx);
		};
		const _safeDecodeAsync = (_Err) => async (schema, value, _ctx) => {
			return _safeParseAsync(_Err)(schema, value, _ctx);
		};
		//#endregion
		//#region node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/core/regexes.js
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link cuid2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		const cuid = /^[cC][0-9a-z]{6,}$/;
		const cuid2 = /^[0-9a-z]+$/;
		const ulid = /^[0-7][0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{25}$/;
		const xid = /^[0-9a-vA-V]{20}$/;
		const ksuid = /^[A-Za-z0-9]{27}$/;
		const nanoid = /^[a-zA-Z0-9_-]{21}$/;
		function nanoidOfLength(length) {
			return new RegExp(`^[a-zA-Z0-9_-]{${length}}$`);
		}
		/** ISO 8601-1 duration regex. Does not support the 8601-2 extensions like negative durations or fractional/negative components. */
		const duration = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
		/** A regex for any UUID-like identifier: 8-4-4-4-12 hex pattern */
		const guid = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
		/** Returns a regex for validating an RFC 9562/4122 UUID.
		*
		* @param version Optionally specify a version 1-8. If no version is specified, all versions are supported. */
		const uuid = (version) => {
			if (!version) return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;
			return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
		};
		/** Practical email validation */
		const email = /^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
		const _emoji$1 = `^(?=[\\s\\S]*[\\p{Extended_Pictographic}\\p{Regional_Indicator}\\u20E3])[\\p{Extended_Pictographic}\\p{Emoji_Component}]+$`;
		function emoji() {
			return new RegExp(_emoji$1, "u");
		}
		const ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
		const ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
		const cidrv4 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
		const cidrv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
		const base64 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
		const base64url = /^(?:[A-Za-z0-9_-]{4})*(?:[A-Za-z0-9_-]{2,3})?$/;
		const httpProtocol = /^https?$/;
		const e164 = /^\+[1-9]\d{6,14}$/;
		const dateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;
		/** Anchors a pattern source. The interpolation lives here rather than at the call site because
		* esbuild will not drop a `@__PURE__` call whose own argument interpolates a variable, but it
		* will drop `anchor(dateSource)`. Keeping it inline pinned `date` into every bundle. */
		function anchor(source) {
			return new RegExp(`^${source}$`);
		}
		const date$1 = /*@__PURE__*/ anchor(dateSource);
		function timeSource(args) {
			const hhmm = `(?:[01]\\d|2[0-3]):[0-5]\\d`;
			return typeof args.precision === "number" ? args.precision === -1 ? `${hhmm}` : args.precision === 0 ? `${hhmm}:[0-5]\\d` : `${hhmm}:[0-5]\\d\\.\\d{${args.precision}}` : args.seconds ? `${hhmm}:[0-5]\\d(?:\\.\\d+)?` : `${hhmm}(?::[0-5]\\d(?:\\.\\d+)?)?`;
		}
		function time(args) {
			return new RegExp(`^${timeSource(args)}$`);
		}
		function datetime(args) {
			const opts = ["Z"];
			if (args.offset) opts.push(`([+-](?:[01]\\d|2[0-3]):[0-5]\\d)`);
			const qualified = `${timeSource({
				precision: args.precision,
				seconds: true
			})}(?:${opts.join("|")})`;
			const timeRegex = args.local ? `${qualified}|${timeSource({ precision: args.precision })}` : qualified;
			return new RegExp(`^${dateSource}T(?:${timeRegex})$`);
		}
		const anyString = /^[\s\S]{0,}$/;
		const number$1 = /^-?\d+(?:\.\d+)?$/;
		const boolean$1 = /^(?:true|false)$/i;
		const _undefined$2 = /^undefined$/i;
		const lowercase = /^[^A-Z]*$/;
		const uppercase = /^[^a-z]*$/;
		//#endregion
		//#region node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/core/checks.js
		const $ZodCheck = /*@__PURE__*/ $constructor("$ZodCheck", (inst, def) => {
			var _a;
			inst._zod ?? (inst._zod = {});
			inst._zod.def = def;
			(_a = inst._zod).onattach ?? (_a.onattach = []);
		});
		/** Default `when` for length-based checks: run only on non-nullish values with a `length`. */
		const _whenHasLength = (payload) => {
			const val = payload.value;
			return !nullish(val) && val.length !== void 0;
		};
		const numericOriginMap = {
			number: "number",
			bigint: "bigint",
			object: "date"
		};
		const $ZodCheckLessThan = /*@__PURE__*/ $constructor("$ZodCheckLessThan", (inst, def) => {
			$ZodCheck.init(inst, def);
			const origin = numericOriginMap[typeof def.value];
			inst._zod.check = (payload) => {
				if (def.inclusive ? payload.value <= def.value : payload.value < def.value) return;
				payload.issues.push({
					origin: numericOriginMap[typeof payload.value] ?? origin,
					code: "too_big",
					maximum: typeof def.value === "object" ? def.value.getTime() : def.value,
					input: payload.value,
					inclusive: def.inclusive,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckGreaterThan = /*@__PURE__*/ $constructor("$ZodCheckGreaterThan", (inst, def) => {
			$ZodCheck.init(inst, def);
			const origin = numericOriginMap[typeof def.value];
			inst._zod.check = (payload) => {
				if (def.inclusive ? payload.value >= def.value : payload.value > def.value) return;
				payload.issues.push({
					origin: numericOriginMap[typeof payload.value] ?? origin,
					code: "too_small",
					minimum: typeof def.value === "object" ? def.value.getTime() : def.value,
					input: payload.value,
					inclusive: def.inclusive,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckMultipleOf = /*@__PURE__*/ $constructor("$ZodCheckMultipleOf", (inst, def) => {
			$ZodCheck.init(inst, def);
			inst._zod.check = (payload) => {
				if (typeof payload.value !== typeof def.value) throw new Error("Cannot mix number and bigint in multiple_of check.");
				if (typeof payload.value === "bigint" ? def.value !== BigInt(0) && payload.value % def.value === BigInt(0) : floatSafeRemainder(payload.value, def.value) === 0) return;
				payload.issues.push({
					origin: typeof payload.value,
					code: "not_multiple_of",
					divisor: def.value,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckNumberFormat = /*@__PURE__*/ $constructor("$ZodCheckNumberFormat", (inst, def) => {
			$ZodCheck.init(inst, def);
			def.format = def.format || "float64";
			const isInt = def.format?.includes("int");
			const origin = isInt ? "int" : "number";
			const [minimum, maximum] = NUMBER_FORMAT_RANGES[def.format];
			inst._zod.check = (payload) => {
				const input = payload.value;
				if (isInt) {
					if (!Number.isInteger(input)) {
						payload.issues.push({
							expected: origin,
							format: def.format,
							code: "invalid_type",
							continue: false,
							input,
							inst
						});
						return;
					}
					if (!Number.isSafeInteger(input)) {
						if (input > 0) payload.issues.push({
							input,
							code: "too_big",
							maximum: Number.MAX_SAFE_INTEGER,
							note: "Integers must be within the safe integer range.",
							inst,
							origin,
							inclusive: true,
							continue: !def.abort
						});
						else payload.issues.push({
							input,
							code: "too_small",
							minimum: Number.MIN_SAFE_INTEGER,
							note: "Integers must be within the safe integer range.",
							inst,
							origin,
							inclusive: true,
							continue: !def.abort
						});
						return;
					}
				}
				if (input < minimum) payload.issues.push({
					origin: "number",
					input,
					code: "too_small",
					minimum,
					inclusive: true,
					inst,
					continue: !def.abort
				});
				if (input > maximum) payload.issues.push({
					origin: "number",
					input,
					code: "too_big",
					maximum,
					inclusive: true,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckMaxLength = /*@__PURE__*/ $constructor("$ZodCheckMaxLength", (inst, def) => {
			var _a;
			$ZodCheck.init(inst, def);
			(_a = inst._zod.def).when ?? (_a.when = _whenHasLength);
			inst._zod.check = (payload) => {
				const input = payload.value;
				const units = input.length;
				if ((typeof input === "string" && units > def.maximum ? codePointLength(input) : units) <= def.maximum) return;
				const origin = getLengthableOrigin(input);
				payload.issues.push({
					origin,
					code: "too_big",
					maximum: def.maximum,
					inclusive: true,
					input,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckMinLength = /*@__PURE__*/ $constructor("$ZodCheckMinLength", (inst, def) => {
			var _a;
			$ZodCheck.init(inst, def);
			(_a = inst._zod.def).when ?? (_a.when = _whenHasLength);
			inst._zod.check = (payload) => {
				const input = payload.value;
				const units = input.length;
				if ((typeof input === "string" && units >= def.minimum && units < def.minimum * 2 ? codePointLength(input) : units) >= def.minimum) return;
				const origin = getLengthableOrigin(input);
				payload.issues.push({
					origin,
					code: "too_small",
					minimum: def.minimum,
					inclusive: true,
					input,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckLengthEquals = /*@__PURE__*/ $constructor("$ZodCheckLengthEquals", (inst, def) => {
			var _a;
			$ZodCheck.init(inst, def);
			(_a = inst._zod.def).when ?? (_a.when = _whenHasLength);
			inst._zod.check = (payload) => {
				const input = payload.value;
				const units = input.length;
				const length = typeof input === "string" && units >= def.length && units <= def.length * 2 ? codePointLength(input) : units;
				if (length === def.length) return;
				const origin = getLengthableOrigin(input);
				const tooBig = length > def.length;
				payload.issues.push({
					origin,
					...tooBig ? {
						code: "too_big",
						maximum: def.length
					} : {
						code: "too_small",
						minimum: def.length
					},
					inclusive: true,
					exact: true,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckStringFormat = /*@__PURE__*/ $constructor("$ZodCheckStringFormat", (inst, def) => {
			var _a, _b;
			$ZodCheck.init(inst, def);
			if (def.pattern) (_a = inst._zod).check ?? (_a.check = (payload) => {
				def.pattern.lastIndex = 0;
				if (def.pattern.test(payload.value)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: def.format,
					input: payload.value,
					...def.pattern ? { pattern: def.pattern.toString() } : {},
					inst,
					continue: !def.abort
				});
			});
			else (_b = inst._zod).check ?? (_b.check = () => {});
		});
		const $ZodCheckRegex = /*@__PURE__*/ $constructor("$ZodCheckRegex", (inst, def) => {
			$ZodCheckStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				def.pattern.lastIndex = 0;
				if (def.pattern.test(payload.value)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "regex",
					input: payload.value,
					pattern: def.pattern.toString(),
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckLowerCase = /*@__PURE__*/ $constructor("$ZodCheckLowerCase", (inst, def) => {
			def.pattern ?? (def.pattern = lowercase);
			$ZodCheckStringFormat.init(inst, def);
		});
		const $ZodCheckUpperCase = /*@__PURE__*/ $constructor("$ZodCheckUpperCase", (inst, def) => {
			def.pattern ?? (def.pattern = uppercase);
			$ZodCheckStringFormat.init(inst, def);
		});
		const $ZodCheckIncludes = /*@__PURE__*/ $constructor("$ZodCheckIncludes", (inst, def) => {
			$ZodCheck.init(inst, def);
			const escapedRegex = escapeRegex(def.includes);
			def.pattern = new RegExp(typeof def.position === "number" ? `^.{${def.position},}${escapedRegex}` : escapedRegex);
			inst._zod.check = (payload) => {
				if (payload.value.includes(def.includes, def.position)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "includes",
					includes: def.includes,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckStartsWith = /*@__PURE__*/ $constructor("$ZodCheckStartsWith", (inst, def) => {
			$ZodCheck.init(inst, def);
			const pattern = new RegExp(`^${escapeRegex(def.prefix)}.*`);
			def.pattern ?? (def.pattern = pattern);
			inst._zod.check = (payload) => {
				if (payload.value.startsWith(def.prefix)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "starts_with",
					prefix: def.prefix,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckEndsWith = /*@__PURE__*/ $constructor("$ZodCheckEndsWith", (inst, def) => {
			$ZodCheck.init(inst, def);
			const pattern = new RegExp(`.*${escapeRegex(def.suffix)}$`);
			def.pattern ?? (def.pattern = pattern);
			inst._zod.check = (payload) => {
				if (payload.value.endsWith(def.suffix)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "ends_with",
					suffix: def.suffix,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckOverwrite = /*@__PURE__*/ $constructor("$ZodCheckOverwrite", (inst, def) => {
			$ZodCheck.init(inst, def);
			inst._zod.check = (payload) => {
				payload.value = def.tx(payload.value);
			};
		});
		//#endregion
		//#region node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/core/doc.js
		var Doc = class {
			constructor(args = [], closed = {}) {
				this.content = [];
				this.indent = 0;
				this.args = args;
				this.closed = closed;
			}
			indented(fn) {
				this.indent += 1;
				try {
					fn(this);
				} finally {
					this.indent -= 1;
				}
			}
			write(arg) {
				if (typeof arg === "function") {
					arg(this, { execution: "sync" });
					arg(this, { execution: "async" });
					return;
				}
				const lines = arg.split("\n").filter((x) => x);
				const minIndent = Math.min(...lines.map((x) => x.length - x.trimStart().length));
				const dedented = lines.map((x) => x.slice(minIndent)).map((x) => " ".repeat(this.indent * 2) + x);
				for (const line of dedented) this.content.push(line);
			}
			compile() {
				const F = Function;
				const content = this?.content ?? [``];
				return new F(...Object.keys(this.closed), `return function (${this.args.join(", ")}) {\n${content.join("\n")}\n};`)(...Object.values(this.closed));
			}
		};
		//#endregion
		//#region node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/core/versions.js
		const version = {
			major: 4,
			minor: 6,
			patch: 7
		};
		//#endregion
		//#region node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/core/schemas.js
		const $ZodType = /*@__PURE__*/ $constructor("$ZodType", (inst, def) => {
			var _a;
			inst ?? (inst = {});
			inst._zod.def = def;
			inst._zod.bag = inst._zod.bag || {};
			inst._zod.version = version;
			const defChecks = inst._zod.def.checks;
			const checks = inst._zod.traits.has("$ZodCheck") ? [inst, ...defChecks ?? []] : defChecks?.length ? [...defChecks] : [];
			for (const ch of checks) for (const fn of ch._zod.onattach) fn(inst);
			if (checks.length === 0) {
				(_a = inst._zod).deferred ?? (_a.deferred = []);
				inst._zod.deferred?.push(() => {
					inst._zod.run = inst._zod.parse;
				});
			} else {
				const runChecks = (payload, checks, ctx) => {
					if (payload.memo) return payload;
					let isAborted = aborted(payload);
					let asyncResult;
					for (const ch of checks) {
						if (ch._zod.def.when) {
							if (explicitlyAborted(payload)) continue;
							if (!ch._zod.def.when(payload)) continue;
						} else if (isAborted) continue;
						const currLen = payload.issues.length;
						const _ = ch._zod.check(payload);
						if (_ instanceof Promise && ctx?.async === false) throw new $ZodAsyncError();
						if (asyncResult || _ instanceof Promise) asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
							await _;
							if (payload.issues.length === currLen) return;
							attachSchema(payload.issues, currLen, inst);
							if (!isAborted) isAborted = aborted(payload, currLen);
						});
						else {
							if (payload.issues.length === currLen) continue;
							attachSchema(payload.issues, currLen, inst);
							if (!isAborted) isAborted = aborted(payload, currLen);
						}
					}
					if (asyncResult) return asyncResult.then(() => {
						return payload;
					});
					return payload;
				};
				const handleCanaryResult = (canary, payload, ctx) => {
					if (aborted(canary)) {
						canary.aborted = true;
						return canary;
					}
					const checkResult = runChecks(payload, checks, ctx);
					if (checkResult instanceof Promise) {
						if (ctx.async === false) throw new $ZodAsyncError();
						return checkResult.then((checkResult) => inst._zod.parse(checkResult, ctx));
					}
					return inst._zod.parse(checkResult, ctx);
				};
				inst._zod.run = (payload, ctx) => {
					if (ctx.skipChecks) return inst._zod.parse(payload, ctx);
					if (ctx.direction === "backward") {
						const canary = inst._zod.parse({
							value: payload.value,
							issues: []
						}, {
							...ctx,
							skipChecks: true
						});
						if (canary instanceof Promise) return canary.then((canary) => {
							return handleCanaryResult(canary, payload, ctx);
						});
						return handleCanaryResult(canary, payload, ctx);
					}
					const result = inst._zod.parse(payload, ctx);
					if (result instanceof Promise) {
						if (ctx.async === false) throw new $ZodAsyncError();
						return result.then((result) => runChecks(result, checks, ctx));
					}
					return runChecks(result, checks, ctx);
				};
			}
		}, {
			get "~standard"() {
				return hide(this, "~standard", standardProps(this));
			},
			set "~standard"(value) {
				own(this, "~standard", value);
			}
		});
		/** The Standard Schema surface for `inst`. Shared so wrappers can extend it without forcing it. */
		const toStandardResult = (r, ctx) => r.issues.length ? { issues: r.issues.map((iss) => finalizeIssue(iss, ctx, config())) } : { value: r.value };
		async function validateAsync(inst, value) {
			const ctx = { async: true };
			return toStandardResult(await inst._zod.run({
				value,
				issues: []
			}, ctx), ctx);
		}
		function standardProps(inst) {
			return {
				validate: (value) => {
					const ctx = { async: false };
					try {
						const r = inst._zod.run({
							value,
							issues: []
						}, ctx);
						if (!(r instanceof Promise)) return toStandardResult(r, ctx);
					} catch (_) {}
					return validateAsync(inst, value);
				},
				vendor: "zod",
				version: 1
			};
		}
		const $ZodString = /*@__PURE__*/ $constructor("$ZodString", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.pattern = def.pattern ?? anyString;
			inst._zod.parse = (payload, _) => {
				if (def.coerce) try {
					payload.value = String(payload.value);
				} catch (_) {}
				if (typeof payload.value === "string") return payload;
				payload.issues.push({
					expected: "string",
					code: "invalid_type",
					input: payload.value,
					inst
				});
				return payload;
			};
		});
		const $ZodStringFormat = /*@__PURE__*/ $constructor("$ZodStringFormat", (inst, def) => {
			$ZodCheckStringFormat.init(inst, def);
			$ZodString.init(inst, def);
		});
		const $ZodGUID = /*@__PURE__*/ $constructor("$ZodGUID", (inst, def) => {
			def.pattern ?? (def.pattern = guid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodUUID = /*@__PURE__*/ $constructor("$ZodUUID", (inst, def) => {
			if (def.version) {
				const v = {
					v1: 1,
					v2: 2,
					v3: 3,
					v4: 4,
					v5: 5,
					v6: 6,
					v7: 7,
					v8: 8
				}[def.version];
				if (v === void 0) throw new Error(`Invalid UUID version: "${def.version}"`);
				def.pattern ?? (def.pattern = uuid(v));
			} else def.pattern ?? (def.pattern = uuid());
			$ZodStringFormat.init(inst, def);
		});
		const $ZodEmail = /*@__PURE__*/ $constructor("$ZodEmail", (inst, def) => {
			def.pattern ?? (def.pattern = email);
			$ZodStringFormat.init(inst, def);
		});
		function canParseURL(input) {
			try {
				if (typeof URL !== "undefined" && typeof URL.canParse === "function") return URL.canParse(input);
				new URL(input);
				return true;
			} catch {
				return false;
			}
		}
		function validateURL(trimmed, def) {
			if (!("normalize" in def) && !("hostname" in def) && !("protocol" in def)) return canParseURL(trimmed) || 2;
			return parseURLObject(trimmed, def);
		}
		/** Parses a URL while preserving the non-normalizing HTTP guard. */
		function parseURLObject(trimmed, def) {
			if (!def.normalize && def.protocol?.source === httpProtocol.source && !/^https?:\/\//i.test(trimmed)) return 1;
			try {
				if (typeof URL !== "undefined") {
					const URLStatic = URL;
					if (typeof URLStatic.parse === "function") return URLStatic.parse(trimmed) ?? 2;
				}
				return new URL(trimmed);
			} catch {
				return 2;
			}
		}
		const asciiTabOrNewline = /[\t\n\r]/g;
		/** The URL parser deletes every ASCII tab, LF and CR from its input before it parses, so `new URL("https://exa\nmple.com")` reports on `example.com`. Applying the same deletion to the returned value closes the half of that divergence which can move the host; the parser's other rewrite, stripping C0 controls at the edges, cannot. */
		function stripTabAndNewline(value) {
			return value.replace(asciiTabOrNewline, "");
		}
		function urlHostnameOk(url, hostname) {
			hostname.lastIndex = 0;
			return hostname.test(url.hostname);
		}
		function urlProtocolOk(url, protocol) {
			protocol.lastIndex = 0;
			return protocol.test(url.protocol.endsWith(":") ? url.protocol.slice(0, -1) : url.protocol);
		}
		const $ZodURL = /*@__PURE__*/ $constructor("$ZodURL", (inst, def) => {
			$ZodStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				try {
					const trimmed = payload.value.trim();
					const url = validateURL(trimmed, def);
					if (url === 1) {
						payload.issues.push({
							code: "invalid_format",
							format: "url",
							note: "Invalid URL format",
							input: payload.value,
							inst,
							continue: !def.abort
						});
						return;
					}
					if (url === 2) {
						payload.issues.push({
							code: "invalid_format",
							format: "url",
							input: payload.value,
							inst,
							continue: !def.abort
						});
						return;
					}
					if (url === true) {
						payload.value = stripTabAndNewline(trimmed);
						return;
					}
					if (def.hostname && !urlHostnameOk(url, def.hostname)) payload.issues.push({
						code: "invalid_format",
						format: "url",
						note: "Invalid hostname",
						pattern: def.hostname.source,
						input: payload.value,
						inst,
						continue: !def.abort
					});
					if (def.protocol && !urlProtocolOk(url, def.protocol)) payload.issues.push({
						code: "invalid_format",
						format: "url",
						note: "Invalid protocol",
						pattern: def.protocol.source,
						input: payload.value,
						inst,
						continue: !def.abort
					});
					payload.value = def.normalize ? url.href : stripTabAndNewline(trimmed);
					return;
				} catch (_) {
					payload.issues.push({
						code: "invalid_format",
						format: "url",
						input: payload.value,
						inst,
						continue: !def.abort
					});
				}
			};
		});
		const $ZodEmoji = /*@__PURE__*/ $constructor("$ZodEmoji", (inst, def) => {
			def.pattern ?? (def.pattern = emoji());
			$ZodStringFormat.init(inst, def);
		});
		const $ZodNanoID = /*@__PURE__*/ $constructor("$ZodNanoID", (inst, def) => {
			if (def.length !== void 0 && (!Number.isInteger(def.length) || def.length < 1)) throw new Error(`Invalid nanoid length: ${def.length}`);
			def.pattern ?? (def.pattern = def.length === void 0 ? nanoid : nanoidOfLength(def.length));
			$ZodStringFormat.init(inst, def);
		});
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link $ZodCUID2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		const $ZodCUID = /*@__PURE__*/ $constructor("$ZodCUID", (inst, def) => {
			def.pattern ?? (def.pattern = cuid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodCUID2 = /*@__PURE__*/ $constructor("$ZodCUID2", (inst, def) => {
			def.pattern ?? (def.pattern = cuid2);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodULID = /*@__PURE__*/ $constructor("$ZodULID", (inst, def) => {
			def.pattern ?? (def.pattern = ulid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodXID = /*@__PURE__*/ $constructor("$ZodXID", (inst, def) => {
			def.pattern ?? (def.pattern = xid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodKSUID = /*@__PURE__*/ $constructor("$ZodKSUID", (inst, def) => {
			def.pattern ?? (def.pattern = ksuid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISODateTime = /*@__PURE__*/ $constructor("$ZodISODateTime", (inst, def) => {
			def.pattern ?? (def.pattern = datetime(def));
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISODate = /*@__PURE__*/ $constructor("$ZodISODate", (inst, def) => {
			def.pattern ?? (def.pattern = date$1);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISOTime = /*@__PURE__*/ $constructor("$ZodISOTime", (inst, def) => {
			def.pattern ?? (def.pattern = time(def));
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISODuration = /*@__PURE__*/ $constructor("$ZodISODuration", (inst, def) => {
			def.pattern ?? (def.pattern = duration);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodIPv4 = /*@__PURE__*/ $constructor("$ZodIPv4", (inst, def) => {
			def.pattern ?? (def.pattern = ipv4);
			$ZodStringFormat.init(inst, def);
		});
		/** An IPv6 address is written with hex digits, colons and dots, and nothing else. The guard is what makes the check below an IPv6 check: `new URL("http://[...]")` parses an authority, not an address, so `@` and `\` re-delimit it and `"::@1\\"` validates against the host `0.0.0.1`. The URL parser also deletes ASCII tab, LF and CR rather than failing, which is how `"::1\n"` validated as `::1`. */
		const ipv6Alphabet = /^[0-9a-fA-F:.]+$/;
		function isValidIPv6(value) {
			if (!ipv6Alphabet.test(value)) return false;
			return canParseURL(`http://[${value}]`);
		}
		const $ZodIPv6 = /*@__PURE__*/ $constructor("$ZodIPv6", (inst, def) => {
			def.pattern ?? (def.pattern = ipv6);
			$ZodStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				if (!isValidIPv6(payload.value)) payload.issues.push({
					code: "invalid_format",
					format: "ipv6",
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCIDRv4 = /*@__PURE__*/ $constructor("$ZodCIDRv4", (inst, def) => {
			def.pattern ?? (def.pattern = cidrv4);
			$ZodStringFormat.init(inst, def);
		});
		function isValidCIDRv6(value) {
			const parts = value.split("/");
			if (parts.length !== 2) return false;
			const [address, prefix] = parts;
			if (!prefix) return false;
			const prefixNum = Number(prefix);
			if (`${prefixNum}` !== prefix) return false;
			if (prefixNum < 0 || prefixNum > 128) return false;
			return isValidIPv6(address);
		}
		const $ZodCIDRv6 = /*@__PURE__*/ $constructor("$ZodCIDRv6", (inst, def) => {
			def.pattern ?? (def.pattern = cidrv6);
			$ZodStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				if (!isValidCIDRv6(payload.value)) payload.issues.push({
					code: "invalid_format",
					format: "cidrv6",
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		function isValidBase64(data) {
			if (data === "") return true;
			if (/\s/.test(data)) return false;
			if (data.length % 4 !== 0) return false;
			try {
				atob(data);
				return true;
			} catch {
				return false;
			}
		}
		const base64Charset = /^[0-9a-zA-Z+/]*={0,2}$/;
		const $ZodBase64 = /*@__PURE__*/ $constructor("$ZodBase64", (inst, def) => {
			def.pattern ?? (def.pattern = base64Charset);
			$ZodStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				if (isValidBase64(payload.value)) return;
				payload.issues.push({
					code: "invalid_format",
					format: "base64",
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const base64urlCharset = /^[A-Za-z0-9_-]*$/;
		function isValidBase64URL(data) {
			if (!base64urlCharset.test(data)) return false;
			const base64 = data.replace(/[-_]/g, (c) => c === "-" ? "+" : "/");
			return isValidBase64(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
		}
		const $ZodBase64URL = /*@__PURE__*/ $constructor("$ZodBase64URL", (inst, def) => {
			def.pattern ?? (def.pattern = base64urlCharset);
			$ZodStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				if (isValidBase64URL(payload.value)) return;
				payload.issues.push({
					code: "invalid_format",
					format: "base64url",
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodE164 = /*@__PURE__*/ $constructor("$ZodE164", (inst, def) => {
			def.pattern ?? (def.pattern = e164);
			$ZodStringFormat.init(inst, def);
		});
		function isValidJWT(token, algorithm = null) {
			try {
				const tokensParts = token.split(".");
				if (tokensParts.length !== 3) return false;
				const [header] = tokensParts;
				if (!header) return false;
				const parsedHeader = JSON.parse(atob(header));
				if ("typ" in parsedHeader && parsedHeader?.typ !== "JWT") return false;
				if (!parsedHeader.alg) return false;
				if (algorithm && (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm)) return false;
				return true;
			} catch {
				return false;
			}
		}
		const $ZodJWT = /*@__PURE__*/ $constructor("$ZodJWT", (inst, def) => {
			$ZodStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				if (isValidJWT(payload.value, def.alg)) return;
				payload.issues.push({
					code: "invalid_format",
					format: "jwt",
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodNumber = /*@__PURE__*/ $constructor("$ZodNumber", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.pattern = number$1;
			inst._zod.parse = (payload, _ctx) => {
				if (def.coerce) try {
					payload.value = Number(payload.value);
				} catch (_) {}
				const input = payload.value;
				if (typeof input === "number" && !Number.isNaN(input) && Number.isFinite(input)) return payload;
				const received = typeof input === "number" ? Number.isNaN(input) ? "NaN" : !Number.isFinite(input) ? String(input) : void 0 : void 0;
				payload.issues.push({
					expected: "number",
					code: "invalid_type",
					input,
					inst,
					...received ? { received } : {}
				});
				return payload;
			};
		});
		const $ZodNumberFormat = /*@__PURE__*/ $constructor("$ZodNumberFormat", (inst, def) => {
			$ZodCheckNumberFormat.init(inst, def);
			$ZodNumber.init(inst, def);
		});
		const $ZodBoolean = /*@__PURE__*/ $constructor("$ZodBoolean", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.pattern = boolean$1;
			inst._zod.parse = (payload, _ctx) => {
				if (def.coerce) try {
					payload.value = Boolean(payload.value);
				} catch (_) {}
				const input = payload.value;
				if (typeof input === "boolean") return payload;
				payload.issues.push({
					expected: "boolean",
					code: "invalid_type",
					input,
					inst
				});
				return payload;
			};
		});
		const $ZodUndefined = /*@__PURE__*/ $constructor("$ZodUndefined", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.pattern = _undefined$2;
			inst._zod.values = /* @__PURE__ */ new Set([void 0]);
			inst._zod.parse = (payload, _ctx) => {
				const input = payload.value;
				if (typeof input === "undefined") return payload;
				payload.issues.push({
					expected: "undefined",
					code: "invalid_type",
					input,
					inst
				});
				return payload;
			};
		});
		const $ZodUnknown = /*@__PURE__*/ $constructor("$ZodUnknown", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload) => payload;
		});
		const $ZodNever = /*@__PURE__*/ $constructor("$ZodNever", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, _ctx) => {
				payload.issues.push({
					expected: "never",
					code: "invalid_type",
					input: payload.value,
					inst
				});
				return payload;
			};
		});
		function capSize(inst, size) {
			const caps = sizeCaps(inst._zod.def.checks);
			if (!caps.length) return;
			const cap = Math.min(...caps.map((c) => c[0]));
			const parse = inst._zod.parse;
			inst._zod.parse = (payload, ctx) => {
				const n = size(payload.value);
				if (n > cap && !ctx?.skipChecks && ctx?.direction !== "backward") {
					for (const [max, ch] of sizeCaps(inst._zod.def.checks)) if (n > max && ch._zod.def.when(payload)) {
						const start = payload.issues.length;
						ch._zod.check(payload);
						payload.issues[start].continue = false;
						attachSchema(payload.issues, start, inst);
						return payload;
					}
				}
				return parse(payload, ctx);
			};
		}
		const arraySize = (input) => Array.isArray(input) ? input.length : -1;
		function handleArrayResult(result, final, index) {
			if (result.issues.length) final.issues.push(...prefixIssues(index, result.issues));
			final.value[index] = result.value;
		}
		const $ZodArray = /*@__PURE__*/ $constructor("$ZodArray", (inst, def) => {
			$ZodType.init(inst, def);
			const memo = globalConfig.memoizer;
			memo?.attach(inst);
			inst._zod.parse = (payload, ctx) => {
				const input = payload.value;
				if (!Array.isArray(input)) {
					payload.issues.push({
						expected: "array",
						code: "invalid_type",
						input,
						inst
					});
					return payload;
				}
				payload.value = memo ? memo.alloc(inst, payload, Array(input.length), ctx) : Array(input.length);
				const proms = [];
				const abortEarly = ctx?.abortEarly;
				for (let i = 0; i < input.length; i++) {
					const item = input[i];
					const result = def.element._zod.run({
						value: item,
						issues: []
					}, ctx);
					if (result instanceof Promise) proms.push(result.then((result) => handleArrayResult(result, payload, i)));
					else {
						handleArrayResult(result, payload, i);
						if (abortEarly && result.issues.length !== 0 && aborted(result)) break;
					}
				}
				if (proms.length) return Promise.all(proms).then(() => payload);
				return payload;
			};
			capSize(inst, arraySize);
		});
		function handlePropertyResult(result, final, key, input, optin, optout) {
			const isPresent = key in input;
			const isOptionalOut = optout === "optional";
			if (!isPresent && isOptionalOut && optin === "optional") return;
			if (result.issues.length) {
				if (optin !== void 0 && isOptionalOut && !isPresent) return;
				final.issues.push(...prefixIssues(key, result.issues));
			}
			if (!isPresent && optin === void 0) {
				if (!result.issues.length) final.issues.push({
					code: "invalid_type",
					expected: "nonoptional",
					input: void 0,
					path: [key]
				});
				return;
			}
			if (result.value === void 0) {
				if (isPresent || optin === "defaulted" && !isOptionalOut) final.value[key] = void 0;
			} else final.value[key] = result.value;
		}
		const NO_SYMBOL_KEYS = [];
		function normalizeDef(def) {
			const keys = Object.keys(def.shape);
			const ownSymbols = Object.getOwnPropertySymbols(def.shape);
			const symbolKeys = ownSymbols.length ? ownSymbols : NO_SYMBOL_KEYS;
			const allKeys = symbolKeys.length ? [...keys, ...symbolKeys] : keys;
			for (const k of allKeys) if (!def.shape?.[k]?._zod?.traits?.has("$ZodType")) throw new Error(`Invalid element at key "${String(k)}": expected a Zod schema`);
			const okeys = optionalKeys(def.shape);
			return {
				...def,
				allKeys,
				symbolKeys,
				keySet: new Set(keys),
				numKeys: keys.length,
				optionalKeys: new Set(okeys)
			};
		}
		function handleCatchall(proms, input, payload, ctx, def, inst, abortEarly) {
			const unrecognized = [];
			const keySet = def.keySet;
			const _catchall = def.catchall._zod;
			const t = _catchall.def.type;
			const optin = _catchall.optin;
			const optout = _catchall.optout;
			let seen = 0;
			for (const key in input) {
				if (abortEarly && payload.issues.length !== seen) {
					if (aborted(payload, seen)) break;
					seen = payload.issues.length;
				}
				if (keySet.has(key)) continue;
				if (key === "__proto__") {
					if (t === "never") unrecognized.push(key);
					continue;
				}
				if (t === "never") {
					unrecognized.push(key);
					continue;
				}
				const r = _catchall.run({
					value: input[key],
					issues: []
				}, ctx);
				if (r instanceof Promise) proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, optin, optout)));
				else handlePropertyResult(r, payload, key, input, optin, optout);
			}
			if (unrecognized.length) payload.issues.push({
				code: "unrecognized_keys",
				keys: unrecognized,
				input,
				inst,
				continue: true
			});
			if (!proms.length) return payload;
			return Promise.all(proms).then(() => {
				return payload;
			});
		}
		const $ZodObject = /*@__PURE__*/ $constructor("$ZodObject", (inst, def) => {
			$ZodType.init(inst, def);
			const desc = Object.getOwnPropertyDescriptor(def, "shape");
			const sh = desc?.get ? desc.get.raw : def.shape ?? {};
			if (sh) {
				const get = () => {
					const newSh = { ...sh };
					Object.defineProperty(def, "shape", { value: newSh });
					get.raw = newSh;
					return newSh;
				};
				get.raw = sh;
				Object.defineProperty(def, "shape", { get });
			}
			const _normalized = cached(() => normalizeDef(def));
			defineLazyInternal(inst, "propValues", (zod) => {
				const shape = zod.def.shape;
				const propValues = {};
				for (const key in shape) {
					const field = shape[key]._zod;
					if (field.values) {
						if (!Object.prototype.hasOwnProperty.call(propValues, key)) assignProp(propValues, key, /* @__PURE__ */ new Set());
						for (const v of field.values) propValues[key].add(v);
						if (field.optin !== void 0) propValues[key].add(void 0);
					}
				}
				return propValues;
			});
			const isObject$1 = isObject;
			const catchall = def.catchall;
			let value;
			const memo = globalConfig.memoizer;
			memo?.attach(inst);
			inst._zod.parse = (payload, ctx) => {
				value ?? (value = _normalized.value);
				const input = payload.value;
				if (!isObject$1(input)) {
					payload.issues.push({
						expected: "object",
						code: "invalid_type",
						input,
						inst
					});
					return payload;
				}
				payload.value = memo ? memo.alloc(inst, payload, {}, ctx) : {};
				const proms = [];
				const shape = value.shape;
				const abortEarly = ctx?.abortEarly;
				let seen = payload.issues.length;
				for (const key of value.allKeys) {
					if (abortEarly && payload.issues.length !== seen) {
						if (aborted(payload, seen)) break;
						seen = payload.issues.length;
					}
					if (key === "__proto__") continue;
					const el = shape[key];
					const optin = el._zod.optin;
					const optout = el._zod.optout;
					const r = el._zod.run({
						value: input[key],
						issues: []
					}, ctx);
					if (r instanceof Promise) proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, optin, optout)));
					else handlePropertyResult(r, payload, key, input, optin, optout);
				}
				if (!catchall) return proms.length ? Promise.all(proms).then(() => payload) : payload;
				return handleCatchall(proms, input, payload, ctx, _normalized.value, inst, abortEarly === true);
			};
		});
		const $ZodObjectJIT = /*@__PURE__*/ $constructor("$ZodObjectJIT", (inst, def) => {
			$ZodObject.init(inst, def);
			const superParse = inst._zod.parse;
			const _normalized = cached(() => normalizeDef(def));
			const memo = globalConfig.memoizer;
			const generateFastpass = (shape) => {
				const normalized = _normalized.value;
				const syms = normalized.symbolKeys;
				const doc = new Doc(["payload", "ctx"], {
					shape,
					inst,
					memo,
					syms
				});
				const parseStr = (k) => `shape[${k}]._zod.run({ value: input[${k}], issues: [] }, ctx)`;
				const prefixStr = (id, k) => `
          let ${id}_ab = false;
          for (let i = 0; i < ${id}.issues.length; i++) {
            const iss = ${id}.issues[i];
            iss.path = iss.path ? [${k}, ...iss.path] : [${k}];
            payload.issues.push(iss);
            if (iss.continue !== true) ${id}_ab = true;
          }
          if (${id}_ab && ctx && ctx.abortEarly) {
            payload.value = newResult;
            return payload;
          }`;
				doc.write(`const input = payload.value;`);
				const ids = Object.create(null);
				let counter = 0;
				for (const key of normalized.allKeys) ids[key] = `key_${counter++}`;
				doc.write(memo ? `const newResult = memo.alloc(inst, payload, {}, ctx);` : `const newResult = {};`);
				for (const key of normalized.allKeys) {
					if (key === "__proto__") continue;
					const id = ids[key];
					const k = typeof key === "symbol" ? `syms[${syms.indexOf(key)}]` : esc(key);
					const isPresent = `${k} in input`;
					const schema = shape[key];
					const optin = schema?._zod?.optin;
					const isOptionalIn = optin !== void 0;
					const isOptionalOut = schema?._zod?.optout === "optional";
					doc.write(`const ${id} = ${parseStr(k)};`);
					if (isOptionalIn && isOptionalOut) {
						const assign = optin === "optional" ? `${id}_present` : `${id}.value !== undefined || ${id}_present`;
						doc.write(`
        const ${id}_present = ${isPresent};
        if (!${id}.issues.length || ${id}_present) {
          if (${id}.issues.length) {${prefixStr(id, k)}
          }

          if (${assign}) {
            newResult[${k}] = ${id}.value;
          }
        }

      `);
					} else if (!isOptionalIn) doc.write(`
        const ${id}_present = ${isPresent};
        if (${id}.issues.length) {${prefixStr(id, k)}
        }
        if (!${id}_present && !${id}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${k}]
          });
          if (ctx && ctx.abortEarly) {
            payload.value = newResult;
            return payload;
          }
        }

        if (${id}_present) {
          newResult[${k}] = ${id}.value;
        }

      `);
					else {
						doc.write(`
        if (${id}.issues.length) {${prefixStr(id, k)}
        }
      `);
						if (optin === "defaulted") doc.write(`newResult[${k}] = ${id}.value;`);
						else doc.write(`
        if (${id}.value !== undefined || ${isPresent}) {
          newResult[${k}] = ${id}.value;
        }
      `);
					}
				}
				doc.write(`payload.value = newResult;`);
				doc.write(`return payload;`);
				return doc.compile();
			};
			let fastpass;
			const isObject$2 = isObject;
			const jit = !globalConfig.jitless;
			const fastEnabled = jit && allowsEval.value;
			const catchall = def.catchall;
			let value;
			inst._zod.parse = (payload, ctx) => {
				value ?? (value = _normalized.value);
				const input = payload.value;
				if (!isObject$2(input)) {
					payload.issues.push({
						expected: "object",
						code: "invalid_type",
						input,
						inst
					});
					return payload;
				}
				if (jit && fastEnabled && ctx?.async === false && ctx.jitless !== true) {
					if (!fastpass) fastpass = generateFastpass(def.shape);
					payload = fastpass(payload, ctx);
					if (!catchall) return payload;
					return handleCatchall([], input, payload, ctx, value, inst, ctx?.abortEarly === true);
				}
				return superParse(payload, ctx);
			};
		});
		function handleUnionResults(results, final, inst, ctx) {
			for (const result of results) if (result.issues.length === 0) {
				final.value = result.value;
				return final;
			}
			const nonaborted = results.filter((r) => !aborted(r));
			if (nonaborted.length === 1) {
				final.value = nonaborted[0].value;
				return nonaborted[0];
			}
			final.issues.push({
				code: "invalid_union",
				input: final.value,
				inst,
				errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
			});
			return final;
		}
		const $ZodUnion = /*@__PURE__*/ $constructor("$ZodUnion", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazyInternal(inst, "optin", (zod) => zod.def.options.some((o) => o._zod.optin === "defaulted") ? "defaulted" : zod.def.options.some((o) => o._zod.optin !== void 0) ? "optional" : void 0);
			defineLazyInternal(inst, "optout", (zod) => zod.def.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0);
			defineLazyInternal(inst, "values", (zod) => {
				if (zod.def.options.every((o) => o._zod.values)) return new Set(zod.def.options.flatMap((option) => Array.from(option._zod.values)));
			});
			defineLazyInternal(inst, "pattern", (zod) => {
				if (zod.def.options.every((o) => o._zod.pattern)) {
					const patterns = zod.def.options.map((o) => o._zod.pattern);
					return new RegExp(`^(${patterns.map((p) => cleanRegex(p.source)).join("|")})$`);
				}
			});
			const first = def.options.length === 1 ? def.options[0]._zod.run : null;
			inst._zod.parse = (payload, ctx) => {
				if (first) return first(payload, ctx);
				let async = false;
				const results = [];
				for (const option of def.options) {
					const result = option._zod.run({
						value: payload.value,
						issues: []
					}, ctx);
					if (result instanceof Promise) {
						results.push(result);
						async = true;
					} else {
						if (result.issues.length === 0) return result;
						results.push(result);
					}
				}
				if (!async) return handleUnionResults(results, payload, inst, ctx);
				return Promise.all(results).then((results) => {
					return handleUnionResults(results, payload, inst, ctx);
				});
			};
		});
		function discriminatorMap(def) {
			const map = /* @__PURE__ */ new Map();
			for (const option of def.options) {
				const values = option._zod.propValues?.[def.discriminator];
				if (!values || values.size === 0) throw new Error(`Invalid discriminated union option at index "${def.options.indexOf(option)}"`);
				for (const value of values) if (map.has(value)) {
					if (value !== void 0) throw new Error(`Duplicate discriminator value "${String(value)}"`);
					map.set(value, null);
				} else map.set(value, option);
			}
			return map;
		}
		const $ZodDiscriminatedUnion = /*@__PURE__*/ $constructor("$ZodDiscriminatedUnion", (inst, def) => {
			def.inclusive = false;
			$ZodUnion.init(inst, def);
			const _super = inst._zod.parse;
			defineLazyInternal(inst, "propValues", (zod) => {
				const propValues = {};
				let undefinedCount = 0;
				for (const option of zod.def.options) {
					const pv = option._zod.propValues;
					if (!pv || Object.keys(pv).length === 0) throw new Error(`Invalid discriminated union option at index "${zod.def.options.indexOf(option)}"`);
					if (pv[zod.def.discriminator]?.has(void 0)) undefinedCount++;
					for (const [k, v] of Object.entries(pv)) {
						if (!Object.prototype.hasOwnProperty.call(propValues, k)) assignProp(propValues, k, /* @__PURE__ */ new Set());
						for (const val of v) propValues[k].add(val);
					}
				}
				if (!zod.def.unionFallback && undefinedCount > 1) propValues[zod.def.discriminator]?.delete(void 0);
				return propValues;
			});
			def.options.forEach((option, i) => {
				const propShape = rawShape(option._zod.def);
				if (propShape && !Object.prototype.hasOwnProperty.call(propShape, def.discriminator)) throw new Error(`Invalid discriminated union option at index "${i}"`);
			});
			const disc = cached(() => discriminatorMap(def));
			inst._zod.parse = (payload, ctx) => {
				const input = payload.value;
				if (!isObject(input)) {
					payload.issues.push({
						code: "invalid_type",
						expected: "object",
						input,
						inst
					});
					return payload;
				}
				const value = input?.[def.discriminator];
				const opt = disc.value.get(value);
				if (opt && (value !== void 0 || ctx.direction !== "backward")) return opt._zod.run(payload, ctx);
				if (def.unionFallback || ctx.direction === "backward") return _super(payload, ctx);
				payload.issues.push({
					code: "invalid_union",
					errors: [],
					note: "No matching discriminator",
					discriminator: def.discriminator,
					options: Array.from(disc.value.keys()).filter((value) => disc.value.get(value) !== null),
					input,
					path: [def.discriminator],
					inst
				});
				return payload;
			};
		});
		const $ZodIntersection = /*@__PURE__*/ $constructor("$ZodIntersection", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, ctx) => {
				const input = payload.value;
				const left = def.left._zod.run({
					value: input,
					issues: []
				}, ctx);
				const right = def.right._zod.run({
					value: input,
					issues: []
				}, ctx);
				if (left instanceof Promise || right instanceof Promise) return Promise.all([left, right]).then(([left, right]) => {
					return handleIntersectionResults(payload, left, right);
				});
				return handleIntersectionResults(payload, left, right);
			};
		});
		function mergeValues(a, b) {
			if (a === b) return {
				valid: true,
				data: a
			};
			if (a instanceof Date && b instanceof Date && +a === +b) return {
				valid: true,
				data: a
			};
			if (isPlainObject(a) && isPlainObject(b)) {
				const bKeys = Object.keys(b);
				const sharedKeys = Object.keys(a).filter((key) => bKeys.indexOf(key) !== -1);
				const newObj = {
					...a,
					...b
				};
				if (Object.prototype.hasOwnProperty.call(newObj, "__proto__")) delete newObj.__proto__;
				for (const key of sharedKeys) {
					if (key === "__proto__") continue;
					const sharedValue = mergeValues(a[key], b[key]);
					if (!sharedValue.valid) return {
						valid: false,
						mergeErrorPath: [key, ...sharedValue.mergeErrorPath]
					};
					newObj[key] = sharedValue.data;
				}
				return {
					valid: true,
					data: newObj
				};
			}
			if (Array.isArray(a) && Array.isArray(b)) {
				if (a.length !== b.length) return {
					valid: false,
					mergeErrorPath: []
				};
				const newArray = [];
				for (let index = 0; index < a.length; index++) {
					const itemA = a[index];
					const itemB = b[index];
					const sharedValue = mergeValues(itemA, itemB);
					if (!sharedValue.valid) return {
						valid: false,
						mergeErrorPath: [index, ...sharedValue.mergeErrorPath]
					};
					newArray.push(sharedValue.data);
				}
				return {
					valid: true,
					data: newArray
				};
			}
			return {
				valid: false,
				mergeErrorPath: []
			};
		}
		function handleIntersectionResults(result, left, right) {
			const unrecKeys = /* @__PURE__ */ new Map();
			let unrecIssue;
			const keyIssues = /* @__PURE__ */ new Map();
			const collect = (iss, side) => {
				let keys;
				if (iss.code === "unrecognized_keys" && !iss.path?.length) {
					unrecIssue ?? (unrecIssue = iss);
					keys = iss.keys;
				} else if (iss.code === "invalid_key" && iss.origin === "record" && iss.path?.length === 1) {
					const k = String(iss.path[0]);
					if (!keyIssues.has(k)) keyIssues.set(k, iss);
					keys = [k];
				} else return false;
				for (const k of keys) {
					if (!unrecKeys.has(k)) unrecKeys.set(k, {});
					unrecKeys.get(k)[side] = true;
				}
				return true;
			};
			for (const iss of left.issues) if (!collect(iss, "l")) result.issues.push(iss);
			for (const iss of right.issues) if (!collect(iss, "r")) result.issues.push(iss);
			const bothKeys = [...unrecKeys].filter(([, f]) => f.l && f.r).map(([k]) => k);
			if (bothKeys.length) {
				const aggregated = unrecIssue ? bothKeys.filter((k) => unrecIssue.keys.includes(k)) : [];
				if (aggregated.length) result.issues.push({
					...unrecIssue,
					keys: aggregated
				});
				for (const k of bothKeys) if (!aggregated.includes(k) && keyIssues.has(k)) result.issues.push(keyIssues.get(k));
			}
			const merged = mergeValues(left.value, right.value);
			if (!merged.valid) {
				if (aborted(result)) return result;
				throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(merged.mergeErrorPath)}`);
			}
			result.value = merged.data;
			return result;
		}
		const $ZodEnum = /*@__PURE__*/ $constructor("$ZodEnum", (inst, def) => {
			$ZodType.init(inst, def);
			const values = getEnumValues(def.entries);
			const valuesSet = new Set(values);
			inst._zod.values = valuesSet;
			defineLazyInternal(inst, "pattern", (zod) => {
				const patternValues = getEnumValues(zod.def.entries).filter((k) => propertyKeyTypes.has(typeof k));
				return new RegExp(patternValues.length ? `^(${patternValues.map((o) => escapeRegex(o.toString())).join("|")})$` : "^[^\\s\\S]$");
			});
			inst._zod.parse = (payload, _ctx) => {
				const input = payload.value;
				if (valuesSet.has(input)) return payload;
				payload.issues.push({
					code: "invalid_value",
					values,
					input,
					inst
				});
				return payload;
			};
		});
		const $ZodLiteral = /*@__PURE__*/ $constructor("$ZodLiteral", (inst, def) => {
			$ZodType.init(inst, def);
			const values = new Set(def.values);
			inst._zod.values = values;
			defineLazyInternal(inst, "pattern", (zod) => {
				const vals = zod.def.values;
				return new RegExp(vals.length ? `^(${vals.map((o) => typeof o === "string" ? escapeRegex(o) : o ? escapeRegex(o.toString()) : String(o)).join("|")})$` : "^[^\\s\\S]$");
			});
			inst._zod.parse = (payload, _ctx) => {
				const input = payload.value;
				if (values.has(input)) return payload;
				payload.issues.push({
					code: "invalid_value",
					values: def.values,
					input,
					inst
				});
				return payload;
			};
		});
		const $ZodTransform = /*@__PURE__*/ $constructor("$ZodTransform", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			globalConfig.memoizer?.guard(inst);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") throw new $ZodEncodeError(inst.constructor.name);
				const _out = def.transform(payload.value, payload);
				if (ctx.async) return (_out instanceof Promise ? _out : Promise.resolve(_out)).then((output) => {
					payload.value = output;
					return payload;
				});
				if (_out instanceof Promise) throw new $ZodAsyncError();
				payload.value = _out;
				return payload;
			};
		});
		function handleOptionalResult(payload, result) {
			payload.value = result.issues.length ? void 0 : result.value;
			return payload;
		}
		const $ZodOptional = /*@__PURE__*/ $constructor("$ZodOptional", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazyInternal(inst, "optin", (zod) => zod.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional");
			inst._zod.optout = "optional";
			defineLazyInternal(inst, "values", (zod) => {
				const values = zod.def.innerType._zod.values;
				return values ? /* @__PURE__ */ new Set([...values, void 0]) : void 0;
			});
			defineLazyInternal(inst, "pattern", (zod) => {
				const pattern = zod.def.innerType._zod.pattern;
				return pattern ? new RegExp(`^(${cleanRegex(pattern.source)})?$`) : void 0;
			});
			inst._zod.parse = (payload, ctx) => {
				if (payload.value === void 0) {
					if (def.innerType._zod.optin !== "defaulted") return payload;
					const result = def.innerType._zod.run({
						value: payload.value,
						issues: []
					}, ctx);
					if (result instanceof Promise) return result.then((result) => handleOptionalResult(payload, result));
					return handleOptionalResult(payload, result);
				}
				return def.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodExactOptional = /*@__PURE__*/ $constructor("$ZodExactOptional", (inst, def) => {
			$ZodOptional.init(inst, def);
			defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
			defineLazyInternal(inst, "pattern", (zod) => zod.def.innerType._zod.pattern);
			inst._zod.parse = (payload, ctx) => {
				return def.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodNullable = /*@__PURE__*/ $constructor("$ZodNullable", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazyInternal(inst, "optin", (zod) => zod.def.innerType._zod.optin);
			defineLazyInternal(inst, "optout", (zod) => zod.def.innerType._zod.optout);
			defineLazyInternal(inst, "pattern", (zod) => {
				const pattern = zod.def.innerType._zod.pattern;
				return pattern ? new RegExp(`^(${cleanRegex(pattern.source)}|null)$`) : void 0;
			});
			defineLazyInternal(inst, "values", (zod) => {
				return zod.def.innerType._zod.values ? /* @__PURE__ */ new Set([...zod.def.innerType._zod.values, null]) : void 0;
			});
			inst._zod.parse = (payload, ctx) => {
				if (payload.value === null) return payload;
				return def.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodDefault = /*@__PURE__*/ $constructor("$ZodDefault", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "defaulted";
			defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
				if (payload.value === void 0) {
					payload.value = def.defaultValue;
					/**
					* $ZodDefault returns the default value immediately in forward direction.
					* It doesn't pass the default value into the validator ("prefault"). There's no reason to pass the default value through validation. The validity of the default is enforced by TypeScript statically. Otherwise, it's the responsibility of the user to ensure the default is valid. In the case of pipes with divergent in/out types, you can specify the default on the `in` schema of your ZodPipe to set a "prefault" for the pipe.   */
					return payload;
				}
				const result = def.innerType._zod.run(payload, ctx);
				if (result instanceof Promise) return result.then((result) => handleDefaultResult(result, def));
				return handleDefaultResult(result, def);
			};
		});
		function handleDefaultResult(payload, def) {
			if (payload.value === void 0) payload.value = def.defaultValue;
			return payload;
		}
		const $ZodPrefault = /*@__PURE__*/ $constructor("$ZodPrefault", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "defaulted";
			defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
				if (payload.value === void 0) payload.value = def.defaultValue;
				return def.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodNonOptional = /*@__PURE__*/ $constructor("$ZodNonOptional", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazyInternal(inst, "values", (zod) => {
				const v = zod.def.innerType._zod.values;
				return v ? new Set([...v].filter((x) => x !== void 0)) : void 0;
			});
			inst._zod.parse = (payload, ctx) => {
				const result = def.innerType._zod.run(payload, ctx);
				if (result instanceof Promise) return result.then((result) => handleNonOptionalResult(result, inst));
				return handleNonOptionalResult(result, inst);
			};
		});
		function handleNonOptionalResult(payload, inst) {
			if (!payload.issues.length && payload.value === void 0) payload.issues.push({
				code: "invalid_type",
				expected: "nonoptional",
				input: payload.value,
				inst
			});
			return payload;
		}
		function handleCatchResult(payload, result, def, ctx) {
			if (!result.issues.length) {
				payload.value = result.value;
				if (result.memo) payload.memo = true;
				return payload;
			}
			payload.value = def.catchValue({
				...result,
				value: payload.value,
				error: { issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config())) },
				input: payload.value
			});
			return payload;
		}
		const $ZodCatch = /*@__PURE__*/ $constructor("$ZodCatch", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazyInternal(inst, "optin", (zod) => zod.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional");
			defineLazyInternal(inst, "optout", (zod) => zod.def.innerType._zod.optout);
			defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
				const result = def.innerType._zod.run({
					value: payload.value,
					issues: []
				}, ctx);
				if (result instanceof Promise) return result.then((result) => handleCatchResult(payload, result, def, ctx));
				return handleCatchResult(payload, result, def, ctx);
			};
		});
		const $ZodPipe = /*@__PURE__*/ $constructor("$ZodPipe", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazyInternal(inst, "values", (zod) => zod.def.in._zod.values);
			defineLazyInternal(inst, "optin", (zod) => zod.def.in._zod.optin);
			defineLazyInternal(inst, "optout", (zod) => zod.def.out._zod.optout);
			defineLazyInternal(inst, "propValues", (zod) => zod.def.in._zod.propValues);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") {
					const right = def.out._zod.run(payload, ctx);
					if (right instanceof Promise) return right.then((right) => handlePipeResult(right, def.in, ctx));
					return handlePipeResult(right, def.in, ctx);
				}
				const left = def.in._zod.run(payload, ctx);
				if (left instanceof Promise) return left.then((left) => handlePipeResult(left, def.out, ctx));
				return handlePipeResult(left, def.out, ctx);
			};
		});
		function handlePipeResult(left, next, ctx) {
			if (left.issues.some((iss) => iss.code !== "unrecognized_keys")) {
				left.aborted = true;
				return left;
			}
			return next._zod.run({
				value: left.value,
				issues: left.issues
			}, ctx);
		}
		const $ZodReadonly = /*@__PURE__*/ $constructor("$ZodReadonly", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazyInternal(inst, "propValues", (zod) => zod.def.innerType._zod.propValues);
			defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
			defineLazyInternal(inst, "optin", (zod) => zod.def.innerType?._zod?.optin);
			defineLazyInternal(inst, "optout", (zod) => zod.def.innerType?._zod?.optout);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
				const result = def.innerType._zod.run(payload, ctx);
				if (result instanceof Promise) return result.then(handleReadonlyResult);
				return handleReadonlyResult(result);
			};
		});
		function handleReadonlyResult(payload) {
			if (!payload.memo) payload.value = Object.freeze(payload.value);
			return payload;
		}
		const $ZodCustom = /*@__PURE__*/ $constructor("$ZodCustom", (inst, def) => {
			$ZodCheck.init(inst, def);
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, _) => {
				return payload;
			};
			inst._zod.check = (payload) => {
				const input = payload.value;
				const r = def.fn(input);
				if (r instanceof Promise) return r.then((r) => handleRefineResult(r, payload, input, inst));
				handleRefineResult(r, payload, input, inst);
			};
		});
		function handleRefineResult(result, payload, input, inst) {
			if (!result) {
				const _iss = {
					code: "custom",
					input,
					inst,
					path: [...inst._zod.def.path ?? []],
					continue: !inst._zod.def.abort
				};
				if (inst._zod.def.params) _iss.params = inst._zod.def.params;
				payload.issues.push(issue(_iss));
			}
		}
		//#endregion
		//#region node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/core/memoizer.js
		var $ZodCyclicError = class extends Error {
			constructor() {
				super(`Cannot parse a reference cycle that closes through a transform`);
				this.name = "ZodCyclicError";
			}
		};
		/** Keyed off the context object every schema in one parse call already shares. */
		const STATE = "~memo";
		const NO_ISSUES = [];
		function isRef(value) {
			return value !== null && typeof value === "object";
		}
		function cloneIssues(issues) {
			return issues.map((iss) => iss.path ? {
				...iss,
				path: iss.path.slice()
			} : { ...iss });
		}
		const recursive = /*@__PURE__*/ new WeakMap();
		/** What the walk established, in order of certainty: ordered so the strongest answer among children wins. */
		const NONE = 0;
		const ASSUMED = 1;
		const PROVEN = 2;
		/** Whether this schema's subtree contains a cycle, so one parse can re-enter it. */
		function isRecursive(inst, stack, resolve) {
			const cached = recursive.get(inst);
			if (cached !== void 0) return cached ? PROVEN : NONE;
			if (stack.has(inst)) return PROVEN;
			stack.add(inst);
			let result = NONE;
			const check = (child) => {
				if (result !== PROVEN && child?._zod) {
					const answer = isRecursive(child, stack, resolve);
					if (answer > result) result = answer;
				}
			};
			const shape = (sh, spread) => {
				let answer = NONE;
				for (const key of Reflect.ownKeys(sh)) {
					const desc = Object.getOwnPropertyDescriptor(sh, key);
					if (spread && !desc.enumerable) continue;
					const child = desc.get ? ASSUMED : desc.value?._zod ? isRecursive(desc.value, stack, resolve) : NONE;
					if (child > answer) answer = child;
				}
				return answer;
			};
			const merge = (answer) => {
				if (answer > result) result = answer;
			};
			const def = inst._zod.def;
			switch (def.type) {
				case "object": {
					const raw = rawShape(def);
					merge(raw ? shape(raw, true) : ASSUMED);
					check(def.catchall);
					break;
				}
				case "array":
					check(def.element);
					break;
				case "tuple":
					for (const el of def.items) check(el);
					check(def.rest);
					break;
				case "record":
				case "map":
					check(def.keyType);
					check(def.valueType);
					break;
				case "set":
					check(def.valueType);
					break;
				case "union":
					for (const el of def.options) check(el);
					break;
				case "intersection":
					check(def.left);
					check(def.right);
					break;
				case "optional":
				case "nullable":
				case "default":
				case "prefault":
				case "catch":
				case "readonly":
				case "nonoptional":
				case "promise":
				case "success":
					check(def.innerType);
					break;
				case "pipe":
					check(def.in);
					check(def.out);
					break;
				case "function":
					check(def.input);
					check(def.output);
					break;
				case "lazy": {
					const inner = def._cachedInner ?? (resolve ? inst._zod.innerType : void 0);
					merge(inner ? isRecursive(inner, stack, false) : ASSUMED);
					break;
				}
				case "template_literal":
				case "string":
				case "number":
				case "int":
				case "boolean":
				case "bigint":
				case "symbol":
				case "undefined":
				case "null":
				case "void":
				case "never":
				case "any":
				case "unknown":
				case "date":
				case "nan":
				case "enum":
				case "literal":
				case "file":
				case "transform":
				case "custom": break;
				default: for (const key in def) {
					const desc = Object.getOwnPropertyDescriptor(def, key);
					if (!desc || desc.get) continue;
					const value = desc.value;
					if (!value || typeof value !== "object") continue;
					if (value._zod) check(value);
					else if (Array.isArray(value)) for (const el of value) check(el);
				}
			}
			stack.delete(inst);
			return settle(inst, result);
		}
		/** An assumed answer must not outlive the resolution that settles it, so only a certain one is cached. */
		function settle(inst, answer) {
			if (answer !== ASSUMED) recursive.set(inst, answer === PROVEN);
			return answer;
		}
		function bucketFor(state, inst) {
			let bucket = state.buckets.get(inst);
			if (!bucket) {
				bucket = /* @__PURE__ */ new WeakMap();
				state.buckets.set(inst, bucket);
			}
			return bucket;
		}
		let handoff;
		const open = [];
		const memo = {
			alloc(_inst, payload, empty) {
				const bucket = handoff;
				if (!bucket) return empty;
				handoff = void 0;
				const entry = {
					value: empty,
					issues: null
				};
				bucket.set(payload.value, entry);
				open.push(entry);
				return empty;
			},
			guard(inst) {
				var _a;
				(_a = inst._zod).deferred ?? (_a.deferred = []);
				inst._zod.deferred.push(() => {
					const base = inst._zod.parse;
					const wrapped = (payload, ctx) => {
						if (ctx.direction !== "backward" && isBackEdge(ctx, payload.value)) throw new $ZodCyclicError();
						return base(payload, ctx);
					};
					inst._zod.parse = wrapped;
					if (inst._zod.run === base) inst._zod.run = wrapped;
				});
			},
			attach(inst) {
				var _a;
				let isRecursiveInst;
				let rechecked = false;
				let lastCtx;
				let lastBucket;
				(_a = inst._zod).deferred ?? (_a.deferred = []);
				inst._zod.deferred.push(() => {
					const base = inst._zod.parse;
					const wrapped = (payload, ctx) => {
						if (isRecursiveInst === void 0) {
							const walked = isRecursive(inst, /* @__PURE__ */ new Set(), false);
							if (walked === NONE) {
								inst._zod.parse = base;
								if (inst._zod.run === wrapped) inst._zod.run = base;
								return base(payload, ctx);
							}
							if (walked === PROVEN || rechecked) isRecursiveInst = true;
							else rechecked = true;
						}
						const input = payload.value;
						if (!isRef(input)) return base(payload, ctx);
						let state = ctx[STATE];
						if (!state) {
							state = {
								buckets: /* @__PURE__ */ new WeakMap(),
								backEdges: void 0
							};
							ctx[STATE] = state;
						}
						let bucket;
						if (lastCtx === ctx) bucket = lastBucket;
						else {
							bucket = bucketFor(state, inst);
							lastCtx = ctx;
							lastBucket = bucket;
						}
						const hit = bucket.get(input);
						if (hit) {
							payload.value = hit.value;
							if (hit.issues) {
								if (hit.issues.length) payload.issues.push(...cloneIssues(hit.issues));
							} else {
								payload.memo = true;
								state.backEdges ?? (state.backEdges = /* @__PURE__ */ new WeakSet());
								state.backEdges.add(hit.value);
							}
							return payload;
						}
						handoff = bucket;
						const depth = open.length;
						const result = base(payload, ctx);
						handoff = void 0;
						const entry = open.length > depth ? open.pop() : void 0;
						if (result instanceof Promise) return result.then((r) => {
							if (entry) entry.issues = r.issues.length ? cloneIssues(r.issues) : NO_ISSUES;
							return r;
						});
						if (entry) entry.issues = result.issues.length ? cloneIssues(result.issues) : NO_ISSUES;
						return result;
					};
					inst._zod.parse = wrapped;
					if (inst._zod.run === base) inst._zod.run = wrapped;
				});
			}
		};
		/** The memoizer that gives containers cycle support. `zod` installs it by default; `zod/mini` opts in with `config({ memoizer: memoizer() })`. */
		function memoizer() {
			return memo;
		}
		/** Whether this value is a node a back-edge resolved to before it finished. */
		function isBackEdge(ctx, value) {
			const backEdges = ctx[STATE]?.backEdges;
			return backEdges !== void 0 && isRef(value) && backEdges.has(value);
		}
		//#endregion
		//#region node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/locales/en.js
		const error = () => {
			const Sizable = {
				string: {
					unit: "characters",
					verb: "to have"
				},
				file: {
					unit: "bytes",
					verb: "to have"
				},
				array: {
					unit: "items",
					verb: "to have"
				},
				set: {
					unit: "items",
					verb: "to have"
				},
				map: {
					unit: "entries",
					verb: "to have"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "input",
				email: "email address",
				url: "URL",
				emoji: "emoji",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "ISO datetime",
				date: "ISO date",
				time: "ISO time",
				duration: "ISO duration",
				ipv4: "IPv4 address",
				ipv6: "IPv6 address",
				mac: "MAC address",
				cidrv4: "IPv4 range",
				cidrv6: "IPv6 range",
				base64: "base64-encoded string",
				base64url: "base64url-encoded string",
				json_string: "JSON string",
				e164: "E.164 number",
				currency_code: "currency code",
				credit_card: "credit card number",
				iban: "IBAN",
				jwt: "JWT",
				template_literal: "input"
			};
			const TypeDictionary = { nan: "NaN" };
			function getTypeName(type, input) {
				if (type === "number" && typeof input === "number" && !Number.isFinite(input)) return String(input);
				return TypeDictionary[type] ?? type;
			}
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": return `Invalid input: expected ${getTypeName(issue.expected)}, received ${getTypeName(parsedType(issue.input), issue.input)}`;
					case "invalid_value":
						if (issue.values.length === 1) return `Invalid input: expected ${stringifyPrimitive(issue.values[0])}`;
						return `Invalid option: expected one of ${joinValues(issue.values, "|")}`;
					case "too_big": {
						const adj = issue.exact ? "exactly " : issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Too big: expected ${issue.origin ?? "value"} to have ${adj}${issue.maximum.toString()} ${sizing.unit ?? "elements"}`;
						return `Too big: expected ${issue.origin ?? "value"} to be ${adj}${issue.maximum.toString()}`;
					}
					case "too_small": {
						const adj = issue.exact ? "exactly " : issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Too small: expected ${issue.origin} to have ${adj}${issue.minimum.toString()} ${sizing.unit}`;
						return `Too small: expected ${issue.origin} to be ${adj}${issue.minimum.toString()}`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `Invalid string: must start with "${_issue.prefix}"`;
						if (_issue.format === "ends_with") return `Invalid string: must end with "${_issue.suffix}"`;
						if (_issue.format === "includes") return `Invalid string: must include "${_issue.includes}"`;
						if (_issue.format === "regex") return `Invalid string: must match pattern ${_issue.pattern}`;
						return `Invalid ${FormatDictionary[_issue.format] ?? issue.format}`;
					}
					case "not_multiple_of": return `Invalid number: must be a multiple of ${issue.divisor}`;
					case "unrecognized_keys": return `Unrecognized key${issue.keys.length > 1 ? "s" : ""}: ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `Invalid key in ${issue.origin}`;
					case "invalid_union":
						if (issue.options && Array.isArray(issue.options) && issue.options.length > 0) return `Invalid discriminator value. Expected ${issue.options.map((o) => `'${o}'`).join(" | ")}`;
						if (issue.inclusive === false) return "Invalid input: more than one option matched";
						return "Invalid input";
					case "invalid_element": return `Invalid value in ${issue.origin}`;
					default: return `Invalid input`;
				}
			};
		};
		function en_default() {
			return { localeError: error() };
		}
		//#endregion
		//#region node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/core/registries.js
		var _a;
		var $ZodRegistry = class {
			constructor() {
				this._map = /* @__PURE__ */ new WeakMap();
				this._idmap = /* @__PURE__ */ new Map();
			}
			add(schema, ..._meta) {
				const meta = _meta[0];
				this._map.set(schema, meta);
				if (meta && typeof meta === "object" && "id" in meta) this._idmap.set(meta.id, schema);
				return this;
			}
			clear() {
				this._map = /* @__PURE__ */ new WeakMap();
				this._idmap = /* @__PURE__ */ new Map();
				return this;
			}
			remove(schema) {
				const meta = this._map.get(schema);
				if (meta && typeof meta === "object" && "id" in meta) this._idmap.delete(meta.id);
				this._map.delete(schema);
				return this;
			}
			get(schema) {
				const p = schema._zod.parent;
				if (p) {
					const pm = { ...this.get(p) ?? {} };
					delete pm.id;
					const f = {
						...pm,
						...this._map.get(schema)
					};
					return Object.keys(f).length ? f : void 0;
				}
				return this._map.get(schema);
			}
			has(schema) {
				return this._map.has(schema);
			}
		};
		function registry() {
			return new $ZodRegistry();
		}
		(_a = globalThis).__zod_globalRegistry ?? (_a.__zod_globalRegistry = registry());
		const globalRegistry = globalThis.__zod_globalRegistry;
		//#endregion
		//#region node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/core/api.js
		function snapshotChecks(def) {
			if (def.checks) def.checks = [...def.checks];
			return def;
		}
		// @__NO_SIDE_EFFECTS__
		function _string(Class, params) {
			return new Class(snapshotChecks({
				type: "string",
				...normalizeParams(params)
			}));
		}
		// @__NO_SIDE_EFFECTS__
		function _email(Class, params) {
			return new Class({
				type: "string",
				format: "email",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _guid(Class, params) {
			return new Class({
				type: "string",
				format: "guid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uuid(Class, params) {
			return new Class({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uuidv4(Class, params) {
			return new Class({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: false,
				version: "v4",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uuidv6(Class, params) {
			return new Class({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: false,
				version: "v6",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uuidv7(Class, params) {
			return new Class({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: false,
				version: "v7",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _url(Class, params) {
			return new Class({
				type: "string",
				format: "url",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _emoji(Class, params) {
			return new Class({
				type: "string",
				format: "emoji",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _nanoid(Class, params) {
			return new Class({
				type: "string",
				format: "nanoid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link _cuid2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		// @__NO_SIDE_EFFECTS__
		function _cuid(Class, params) {
			return new Class({
				type: "string",
				format: "cuid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _cuid2(Class, params) {
			return new Class({
				type: "string",
				format: "cuid2",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _ulid(Class, params) {
			return new Class({
				type: "string",
				format: "ulid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _xid(Class, params) {
			return new Class({
				type: "string",
				format: "xid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _ksuid(Class, params) {
			return new Class({
				type: "string",
				format: "ksuid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _ipv4(Class, params) {
			return new Class({
				type: "string",
				format: "ipv4",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _ipv6(Class, params) {
			return new Class({
				type: "string",
				format: "ipv6",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _cidrv4(Class, params) {
			return new Class({
				type: "string",
				format: "cidrv4",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _cidrv6(Class, params) {
			return new Class({
				type: "string",
				format: "cidrv6",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _base64(Class, params) {
			return new Class({
				type: "string",
				format: "base64",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _base64url(Class, params) {
			return new Class({
				type: "string",
				format: "base64url",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _e164(Class, params) {
			return new Class({
				type: "string",
				format: "e164",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _jwt(Class, params) {
			return new Class({
				type: "string",
				format: "jwt",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _isoDateTime(Class, params) {
			return new Class({
				type: "string",
				format: "datetime",
				check: "string_format",
				offset: false,
				local: false,
				precision: null,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _isoDate(Class, params) {
			return new Class({
				type: "string",
				format: "date",
				check: "string_format",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _isoTime(Class, params) {
			return new Class({
				type: "string",
				format: "time",
				check: "string_format",
				precision: null,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _isoDuration(Class, params) {
			return new Class({
				type: "string",
				format: "duration",
				check: "string_format",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _number(Class, params) {
			return new Class(snapshotChecks({
				type: "number",
				checks: [],
				...normalizeParams(params)
			}));
		}
		// @__NO_SIDE_EFFECTS__
		function _int(Class, params) {
			return new Class({
				type: "number",
				check: "number_format",
				abort: false,
				format: "safeint",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _boolean(Class, params) {
			return new Class({
				type: "boolean",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _undefined$1(Class, params) {
			return new Class({
				type: "undefined",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _unknown(Class) {
			return new Class({ type: "unknown" });
		}
		// @__NO_SIDE_EFFECTS__
		function _never(Class, params) {
			return new Class({
				type: "never",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _lt(value, params) {
			return new $ZodCheckLessThan({
				check: "less_than",
				...normalizeParams(params),
				value,
				inclusive: false
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _lte(value, params) {
			return new $ZodCheckLessThan({
				check: "less_than",
				...normalizeParams(params),
				value,
				inclusive: true
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _gt(value, params) {
			return new $ZodCheckGreaterThan({
				check: "greater_than",
				...normalizeParams(params),
				value,
				inclusive: false
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _gte(value, params) {
			return new $ZodCheckGreaterThan({
				check: "greater_than",
				...normalizeParams(params),
				value,
				inclusive: true
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _multipleOf(value, params) {
			return new $ZodCheckMultipleOf({
				check: "multiple_of",
				...normalizeParams(params),
				value
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _maxLength(maximum, params) {
			return new $ZodCheckMaxLength({
				check: "max_length",
				...normalizeParams(params),
				maximum
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _minLength(minimum, params) {
			return new $ZodCheckMinLength({
				check: "min_length",
				...normalizeParams(params),
				minimum
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _length(length, params) {
			return new $ZodCheckLengthEquals({
				check: "length_equals",
				...normalizeParams(params),
				length
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _regex(pattern, params) {
			return new $ZodCheckRegex({
				check: "string_format",
				format: "regex",
				...normalizeParams(params),
				pattern
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _lowercase(params) {
			return new $ZodCheckLowerCase({
				check: "string_format",
				format: "lowercase",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uppercase(params) {
			return new $ZodCheckUpperCase({
				check: "string_format",
				format: "uppercase",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _includes(includes, params) {
			return new $ZodCheckIncludes({
				check: "string_format",
				format: "includes",
				...normalizeParams(params),
				includes
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _startsWith(prefix, params) {
			return new $ZodCheckStartsWith({
				check: "string_format",
				format: "starts_with",
				...normalizeParams(params),
				prefix
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _endsWith(suffix, params) {
			return new $ZodCheckEndsWith({
				check: "string_format",
				format: "ends_with",
				...normalizeParams(params),
				suffix
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _overwrite(tx) {
			return new $ZodCheckOverwrite({
				check: "overwrite",
				tx
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _normalize(form) {
			return /* @__PURE__ */ _overwrite((input) => input.normalize(form));
		}
		// @__NO_SIDE_EFFECTS__
		function _trim() {
			return /* @__PURE__ */ _overwrite((input) => input.trim());
		}
		// @__NO_SIDE_EFFECTS__
		function _toLowerCase() {
			return /* @__PURE__ */ _overwrite((input) => input.toLowerCase());
		}
		// @__NO_SIDE_EFFECTS__
		function _toUpperCase() {
			return /* @__PURE__ */ _overwrite((input) => input.toUpperCase());
		}
		// @__NO_SIDE_EFFECTS__
		function _slugify() {
			return /* @__PURE__ */ _overwrite((input) => slugify(input));
		}
		// @__NO_SIDE_EFFECTS__
		function _array(Class, element, params) {
			return new Class({
				type: "array",
				element,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _refine(Class, fn, _params) {
			return new Class({
				type: "custom",
				check: "custom",
				fn,
				...normalizeParams(_params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _superRefine(fn, params) {
			const ch = /* @__PURE__ */ _check((payload) => {
				payload.addIssue = (issue$2) => {
					if (typeof issue$2 === "string") payload.issues.push(issue(issue$2, payload.value, ch._zod.def));
					else {
						const _issue = issue$2;
						if (_issue.fatal) _issue.continue = false;
						_issue.code ?? (_issue.code = "custom");
						if (!("input" in _issue)) _issue.input = payload.value;
						_issue.inst ?? (_issue.inst = ch);
						_issue.continue ?? (_issue.continue = !ch._zod.def.abort);
						payload.issues.push(issue(_issue));
					}
				};
				return fn(payload.value, payload);
			}, params);
			return ch;
		}
		// @__NO_SIDE_EFFECTS__
		function _check(fn, params) {
			const ch = new $ZodCheck({
				check: "custom",
				...normalizeParams(params)
			});
			ch._zod.check = fn;
			return ch;
		}
		//#endregion
		//#region node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/core/to-json-schema.js
		function assignProps(target, ...sources) {
			for (const source of sources) for (const key of Reflect.ownKeys(source)) if (Object.prototype.propertyIsEnumerable.call(source, key)) assignProp(target, key, source[key]);
			return target;
		}
		function initializeContext(params) {
			let target = params?.target ?? "draft-2020-12";
			if (target === "draft-4") target = "draft-04";
			if (target === "draft-7") target = "draft-07";
			return {
				processors: params.processors ?? {},
				metadataRegistry: params?.metadata ?? globalRegistry,
				target,
				unrepresentable: params?.unrepresentable ?? "throw",
				override: params?.override ?? (() => {}),
				io: params?.io ?? "output",
				counter: 0,
				seen: /* @__PURE__ */ new Map(),
				sharedDefsExtractedFor: void 0,
				sharedEmitDoneFor: void 0,
				cycles: params?.cycles ?? "ref",
				reused: params?.reused ?? "inline",
				intersections: [],
				deferred: [],
				external: params?.external ?? void 0
			};
		}
		/**
		* Applies the `unrepresentable` setting at a site that has no JSON Schema equivalent. Throws
		* `message` unless the setting (or the handler's return value) says otherwise. Returns `true` if a
		* custom JSON Schema was written into `json`, in which case the caller must not write its own.
		*/
		function handleUnrepresentable(schema, ctx, json, params, message) {
			const result = typeof ctx.unrepresentable === "function" ? ctx.unrepresentable({
				zodSchema: schema,
				path: params.path,
				message
			}) : ctx.unrepresentable;
			if (result === "any") return false;
			if (result === void 0 || result === "throw") throw new Error(message);
			Object.assign(json, result);
			return true;
		}
		function processSchema(schema, ctx, _params = {
			path: [],
			schemaPath: []
		}) {
			var _a;
			const def = schema._zod.def;
			const seen = ctx.seen.get(schema);
			if (seen) {
				seen.count++;
				if (_params.schemaPath.includes(schema)) seen.cycle = _params.path;
				return seen.schema;
			}
			const result = {
				schema: {},
				count: 1,
				cycle: void 0,
				path: _params.path
			};
			ctx.seen.set(schema, result);
			ctx.sharedDefsExtractedFor = void 0;
			ctx.sharedEmitDoneFor = void 0;
			const overrideSchema = schema._zod.toJSONSchema?.();
			if (overrideSchema) result.schema = overrideSchema;
			else {
				const params = {
					..._params,
					schemaPath: [..._params.schemaPath, schema],
					path: _params.path
				};
				if (schema._zod.processJSONSchema) schema._zod.processJSONSchema(ctx, result.schema, params);
				else {
					const _json = result.schema;
					const processor = ctx.processors[def.type];
					if (!processor) throw new Error(`[toJSONSchema]: Non-representable type encountered: ${def.type}`);
					processor(schema, ctx, _json, params);
				}
				const parent = schema._zod.parent;
				if (parent) {
					if (!result.ref) result.ref = parent;
					processSchema(parent, ctx, params);
					ctx.seen.get(parent).isParent = true;
				}
			}
			const meta = ctx.metadataRegistry.get(schema);
			if (meta) assignProps(result.schema, meta);
			if (ctx.io === "input" && isTransforming(schema)) {
				delete result.schema.examples;
				delete result.schema.default;
			}
			if (ctx.io === "input" && "_prefault" in result.schema) (_a = result.schema).default ?? (_a.default = result.schema._prefault);
			delete result.schema._prefault;
			return ctx.seen.get(schema).schema;
		}
		function encodeJSONPointerSegment(segment) {
			return segment.replace(/~/g, "~0").replace(/\//g, "~1");
		}
		function extractDefs(ctx, schema) {
			const root = ctx.seen.get(schema);
			if (!root) throw new Error("Unprocessed schema. This is a bug in Zod.");
			if (ctx.external && ctx.sharedDefsExtractedFor === ctx.external) return;
			const idToSchema = /* @__PURE__ */ new Map();
			for (const entry of ctx.seen.entries()) {
				const id = ctx.metadataRegistry.get(entry[0])?.id;
				if (id) {
					const existing = idToSchema.get(id);
					if (existing && existing !== entry[0]) throw new Error(`Duplicate schema id "${id}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
					idToSchema.set(id, entry[0]);
				}
			}
			const makeURI = (entry) => {
				const defsSegment = ctx.target === "draft-2020-12" ? "$defs" : "definitions";
				if (ctx.external) {
					const externalId = ctx.external.registry.get(entry[0])?.id;
					const uriGenerator = ctx.external.uri ?? ((id) => id);
					if (externalId) return { ref: uriGenerator(externalId) };
					const id = entry[1].defId ?? entry[1].schema.id ?? `schema${ctx.counter++}`;
					entry[1].defId = id;
					return {
						defId: id,
						ref: `${uriGenerator("__shared")}#/${defsSegment}/${encodeJSONPointerSegment(id)}`
					};
				}
				const uriPrefix = `#`;
				const defUriPrefix = `${uriPrefix}/${defsSegment}/`;
				if (entry[1] === root && !entry[1].schema.id) return { ref: uriPrefix };
				const defId = entry[1].schema.id ?? `__schema${ctx.counter++}`;
				return {
					defId,
					ref: defUriPrefix + encodeJSONPointerSegment(defId)
				};
			};
			const extractToDef = (entry) => {
				if (entry[1].schema.$ref) return;
				const seen = entry[1];
				const { ref, defId } = makeURI(entry);
				seen.def = { ...seen.schema };
				if (defId) seen.defId = defId;
				const schema = seen.schema;
				for (const key in schema) delete schema[key];
				schema.$ref = ref;
			};
			if (ctx.cycles === "throw") for (const entry of ctx.seen.entries()) {
				const seen = entry[1];
				if (seen.cycle) throw new Error(`Cycle detected: #/${seen.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
			}
			for (const entry of ctx.seen.entries()) {
				const seen = entry[1];
				if (schema === entry[0]) {
					extractToDef(entry);
					continue;
				}
				if (ctx.external) {
					const ext = ctx.external.registry.get(entry[0])?.id;
					if (schema !== entry[0] && ext) {
						extractToDef(entry);
						continue;
					}
				}
				if (ctx.metadataRegistry.get(entry[0])?.id) {
					extractToDef(entry);
					continue;
				}
				if (seen.cycle) {
					extractToDef(entry);
					continue;
				}
				if (seen.count > 1) {
					if (ctx.reused === "ref") extractToDef(entry);
				}
			}
			if (ctx.external) ctx.sharedDefsExtractedFor = ctx.external;
		}
		/** Rewrites `anyOf: [{type: "a"}, {type: "b"}]` to `type: ["a", "b"]`, which every JSON Schema draft treats as equivalent and most consumers render far better for the nullable case. Only branches that are a bare type assertion qualify — anything carrying a constraint, `$ref`, `const` or metadata is left alone. Runs after `flattenRef`, so a branch an override decorated or `$defs` extraction turned into a `$ref` is no longer bare and correctly stays in `anyOf`. `oneOf` is excluded: `integer` and `number` overlap, so "exactly one" and "at least one" are not the same there. OpenAPI 3.0 is excluded: its `type` must be a single string. */
		function compactTypeUnion(schema) {
			const options = schema.anyOf;
			if (!Array.isArray(options) || options.length === 0 || schema.type !== void 0) return;
			const types = [];
			for (const option of options) {
				if (!option || typeof option !== "object") return;
				compactTypeUnion(option);
				const keys = Object.keys(option);
				if (keys.length !== 1 || keys[0] !== "type") return;
				const type = option.type;
				for (const member of Array.isArray(type) ? type : [type]) {
					if (typeof member !== "string") return;
					if (!types.includes(member)) types.push(member);
				}
			}
			delete schema.anyOf;
			schema.type = types.length === 1 ? types[0] : types;
		}
		/** Keywords `foldIntersection` knows how to combine. Anything else — `$ref`, `patternProperties`,
		* an annotation like `description` — makes a member unfoldable, so a constraint this does not
		* understand leaves the `allOf` alone instead of being silently dropped or misattributed. */
		const FOLDABLE_KEYS = /* @__PURE__ */ new Set([
			"type",
			"properties",
			"required",
			"additionalProperties"
		]);
		const UNION_KEYS = ["oneOf", "anyOf"];
		/** A member's constraint on a key it does not declare itself. A `catchall` states one; `false`, an absent `additionalProperties`, and the empty schema a loose object emits state nothing. */
		function undeclaredConstraint(member) {
			const extra = member.additionalProperties;
			if (extra === void 0 || extra === false || typeof extra !== "object" || extra === null) return null;
			return Object.keys(extra).length ? extra : null;
		}
		/** Combines object members into the single object they describe together, or returns `null` if any of them carries a keyword outside {@link FOLDABLE_KEYS}. */
		function foldObjects(members) {
			const objects = [];
			for (const member of members) {
				if (typeof member !== "object" || member.type !== "object") return null;
				for (const key in member) if (!FOLDABLE_KEYS.has(key)) return null;
				objects.push(member);
			}
			const properties = {};
			const required = /* @__PURE__ */ new Set();
			for (const object of objects) {
				for (const key in object.properties) {
					if (Object.prototype.hasOwnProperty.call(properties, key)) continue;
					const parts = [];
					for (const other of objects) {
						const part = other.properties?.[key] ?? undeclaredConstraint(other);
						if (part === null || part === void 0) continue;
						if (!parts.some((seen) => JSON.stringify(seen) === JSON.stringify(part))) parts.push(part);
					}
					assignProp(properties, key, parts.length === 1 ? parts[0] : foldObjects(parts) ?? { allOf: parts });
				}
				for (const key of object.required ?? []) required.add(key);
			}
			const folded = {
				type: "object",
				properties
			};
			if (required.size) folded.required = [...required];
			if (objects.every((object) => object.additionalProperties === false)) folded.additionalProperties = false;
			else {
				const constraints = [];
				for (const object of objects) {
					const constraint = undeclaredConstraint(object);
					if (constraint && !constraints.some((seen) => JSON.stringify(seen) === JSON.stringify(constraint))) constraints.push(constraint);
				}
				if (constraints.length === 1) folded.additionalProperties = constraints[0];
				else if (constraints.length > 1) folded.additionalProperties = { allOf: constraints };
			}
			return folded;
		}
		/** `additionalProperties` in an `allOf` member sees only that member's own `properties`, so two
		* closed object members reject each other's keys and the schema validates nothing. Zod's parser
		* pools the key sets instead — `handleIntersectionResults` reports a key as unrecognized only when
		* *every* side rejects it — so the emitted schema has to pool them too, and folding the members
		* into one object is the encoding that says so on every target.
		*
		* This runs from `finalize`, after `extractDefs`, which is what keeps it clear of the `$ref`
		* machinery: a member extracted into `$defs` is already a `$ref` by now and declines to fold, so it
		* keeps its reference and its own closedness rather than being inlined as a stale copy. */
		function foldIntersection(json) {
			const allOf = json.allOf;
			if (!Array.isArray(allOf) || allOf.length < 2) return;
			for (const key of FOLDABLE_KEYS) if (key in json) return;
			const unions = allOf.filter((m) => UNION_KEYS.some((k) => Array.isArray(m[k])));
			let folded = null;
			if (!unions.length) folded = foldObjects(allOf);
			else {
				const union = unions[0];
				const keyword = UNION_KEYS.find((k) => Array.isArray(union[k]));
				if (Object.keys(union).length !== 1) return;
				const rest = allOf.filter((m) => m !== union);
				const branches = union[keyword].map((branch) => foldObjects([...rest, branch]));
				if (branches.some((b) => !b)) return;
				folded = { [keyword]: branches };
			}
			if (!folded) return;
			delete json.allOf;
			assignProps(json, folded);
		}
		function finalize(ctx, schema) {
			const root = ctx.seen.get(schema);
			if (!root) throw new Error("Unprocessed schema. This is a bug in Zod.");
			const flattenRef = (zodSchema) => {
				const seen = ctx.seen.get(zodSchema);
				if (seen.ref === null) return;
				const schema = seen.def ?? seen.schema;
				const _cached = { ...schema };
				const ref = seen.ref;
				seen.ref = null;
				if (ref) {
					flattenRef(ref);
					const refSeen = ctx.seen.get(ref);
					const refSchema = refSeen.schema;
					if (refSchema.$ref && (ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0")) {
						schema.allOf = schema.allOf ?? [];
						schema.allOf.push(refSchema);
					} else assignProps(schema, refSchema);
					assignProps(schema, _cached);
					if (zodSchema._zod.parent === ref) for (const key in schema) {
						if (key === "$ref" || key === "allOf") continue;
						if (!(key in _cached)) delete schema[key];
					}
					if (refSchema.$ref && refSeen.def) for (const key in schema) {
						if (key === "$ref" || key === "allOf") continue;
						if (key in refSeen.def && JSON.stringify(schema[key]) === JSON.stringify(refSeen.def[key])) delete schema[key];
					}
				}
				const parent = zodSchema._zod.parent;
				if (parent && parent !== ref) {
					flattenRef(parent);
					const parentSeen = ctx.seen.get(parent);
					if (parentSeen?.schema.$ref) {
						schema.$ref = parentSeen.schema.$ref;
						if (parentSeen.def) for (const key in schema) {
							if (key === "$ref" || key === "allOf") continue;
							if (key in parentSeen.def && JSON.stringify(schema[key]) === JSON.stringify(parentSeen.def[key])) delete schema[key];
						}
					}
				}
				ctx.override({
					zodSchema,
					jsonSchema: schema,
					path: seen.path ?? []
				});
			};
			if (!ctx.external || ctx.sharedEmitDoneFor !== ctx.external) {
				for (const entry of [...ctx.seen.entries()].reverse()) flattenRef(entry[0]);
				if (ctx.target !== "openapi-3.0") for (const entry of ctx.seen.entries()) compactTypeUnion(entry[1].def ?? entry[1].schema);
				for (const rewrite of ctx.deferred) rewrite();
				if (ctx.intersections.length) {
					const carriers = /* @__PURE__ */ new Map();
					for (const seen of ctx.seen.values()) for (const json of [seen.schema, seen.def]) {
						const allOf = json?.allOf;
						if (!Array.isArray(allOf)) continue;
						const existing = carriers.get(allOf);
						if (existing) existing.push(json);
						else carriers.set(allOf, [json]);
					}
					for (const allOf of ctx.intersections) for (const json of carriers.get(allOf) ?? []) foldIntersection(json);
				}
			}
			const result = {};
			if (ctx.target === "draft-2020-12") result.$schema = "https://json-schema.org/draft/2020-12/schema";
			else if (ctx.target === "draft-07") result.$schema = "http://json-schema.org/draft-07/schema#";
			else if (ctx.target === "draft-04") result.$schema = "http://json-schema.org/draft-04/schema#";
			else if (ctx.target === "openapi-3.0") {}
			if (ctx.external?.uri) {
				const id = ctx.external.registry.get(schema)?.id;
				if (!id) throw new Error("Schema is missing an `id` property");
				result.$id = ctx.external.uri(id);
			}
			assignProps(result, root.defId ? root.schema : root.def ?? root.schema);
			const rootMetaId = ctx.metadataRegistry.get(schema)?.id;
			if (rootMetaId !== void 0 && result.id === rootMetaId) delete result.id;
			const defs = ctx.external?.defs ?? {};
			if (!ctx.external || ctx.sharedEmitDoneFor !== ctx.external) for (const entry of ctx.seen.entries()) {
				const seen = entry[1];
				if (seen.def && seen.defId) {
					if (seen.def.id === seen.defId) delete seen.def.id;
					assignProp(defs, seen.defId, seen.def);
				}
			}
			if (ctx.external) ctx.sharedEmitDoneFor = ctx.external;
			if (ctx.external) {} else if (Object.keys(defs).length > 0) {
				if (ctx.target === "draft-2020-12") result.$defs = defs;
				else result.definitions = defs;
			}
			try {
				const finalized = JSON.parse(JSON.stringify(result));
				Object.defineProperty(finalized, "~standard", {
					value: {
						...schema["~standard"],
						jsonSchema: {
							input: createStandardJSONSchemaMethod(schema, "input", ctx.processors),
							output: createStandardJSONSchemaMethod(schema, "output", ctx.processors)
						}
					},
					enumerable: false,
					writable: false
				});
				return finalized;
			} catch (_err) {
				throw new Error("Error converting schema to JSON.");
			}
		}
		function isTransforming(_schema, _ctx) {
			const ctx = _ctx ?? { seen: /* @__PURE__ */ new Set() };
			if (ctx.seen.has(_schema)) return false;
			ctx.seen.add(_schema);
			const def = _schema._zod.def;
			if (def.type === "transform") return true;
			if (def.type === "array") return isTransforming(def.element, ctx);
			if (def.type === "set") return isTransforming(def.valueType, ctx);
			if (def.type === "lazy") return isTransforming(def.getter(), ctx);
			if (def.type === "promise" || def.type === "optional" || def.type === "nonoptional" || def.type === "nullable" || def.type === "readonly" || def.type === "default" || def.type === "prefault" || def.type === "catch") return isTransforming(def.innerType, ctx);
			if (def.type === "intersection") return isTransforming(def.left, ctx) || isTransforming(def.right, ctx);
			if (def.type === "record" || def.type === "map") return isTransforming(def.keyType, ctx) || isTransforming(def.valueType, ctx);
			if (def.type === "pipe") {
				if (_schema._zod.traits.has("$ZodCodec")) return true;
				return isTransforming(def.in, ctx) || isTransforming(def.out, ctx);
			}
			if (def.type === "object") {
				for (const key in def.shape) if (isTransforming(def.shape[key], ctx)) return true;
				return false;
			}
			if (def.type === "union") {
				for (const option of def.options) if (isTransforming(option, ctx)) return true;
				return false;
			}
			if (def.type === "tuple") {
				for (const item of def.items) if (isTransforming(item, ctx)) return true;
				if (def.rest && isTransforming(def.rest, ctx)) return true;
				return false;
			}
			return false;
		}
		/**
		* Creates a toJSONSchema method for a schema instance.
		* This encapsulates the logic of initializing context, processing, extracting defs, and finalizing.
		*/
		const createToJSONSchemaMethod = (schema, processors = {}) => (params) => {
			const ctx = initializeContext({
				...params,
				processors
			});
			processSchema(schema, ctx);
			extractDefs(ctx, schema);
			return finalize(ctx, schema);
		};
		const createStandardJSONSchemaMethod = (schema, io, processors = {}) => (params) => {
			const { libraryOptions, target } = params ?? {};
			const ctx = initializeContext({
				...libraryOptions ?? {},
				target,
				io,
				processors
			});
			processSchema(schema, ctx);
			extractDefs(ctx, schema);
			return finalize(ctx, schema);
		};
		//#endregion
		//#region node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/core/json-schema-processors.js
		const narrowMin = (agg, key, value) => {
			if (agg[key] === void 0 || value > agg[key]) agg[key] = value;
		};
		const narrowMax = (agg, key, value) => {
			if (agg[key] === void 0 || value < agg[key]) agg[key] = value;
		};
		const narrowBoth = (agg, value) => {
			narrowMin(agg, "minimum", value);
			narrowMax(agg, "maximum", value);
		};
		const addDivisor = (agg, value) => {
			agg.multipleOf ?? (agg.multipleOf = []);
			if (!agg.multipleOf.includes(value)) agg.multipleOf.push(value);
		};
		const addPattern = (agg, pattern) => {
			agg.patterns ?? (agg.patterns = /* @__PURE__ */ new Set());
			agg.patterns.add(pattern);
		};
		const intersectMime = (agg, mime) => {
			agg.mime = agg.mime ? agg.mime.filter((m) => mime.includes(m)) : [...mime];
		};
		const setFormat = (agg, format) => {
			agg.format = format;
			if (format.includes("int")) agg.isInt = true;
		};
		const minContributor = (agg, def) => narrowMin(agg, "minimum", def.minimum);
		const maxContributor = (agg, def) => narrowMax(agg, "maximum", def.maximum);
		const formatContributor = (ranges) => (agg, def) => {
			setFormat(agg, def.format);
			const [minimum, maximum] = ranges[def.format];
			narrowMin(agg, "minimum", minimum);
			narrowMax(agg, "maximum", maximum);
		};
		const contributors = {
			greater_than: (agg, def) => narrowMin(agg, def.inclusive ? "minimum" : "exclusiveMinimum", def.value),
			less_than: (agg, def) => narrowMax(agg, def.inclusive ? "maximum" : "exclusiveMaximum", def.value),
			multiple_of: (agg, def) => addDivisor(agg, def.value),
			number_format: formatContributor(NUMBER_FORMAT_RANGES),
			bigint_format: formatContributor(BIGINT_FORMAT_RANGES),
			min_length: minContributor,
			max_length: maxContributor,
			length_equals: (agg, def) => narrowBoth(agg, def.length),
			min_size: minContributor,
			max_size: maxContributor,
			size_equals: (agg, def) => narrowBoth(agg, def.size),
			string_format: (agg, def) => {
				setFormat(agg, def.format);
				if (def.pattern) addPattern(agg, def.pattern);
				if (def.format === "base64" || def.format === "base64url") agg.contentEncoding = def.format;
				if (def.local || def.precision === -1) agg.laxFormat = true;
			},
			mime_type: (agg, def) => intersectMime(agg, def.mime)
		};
		function aggregateChecks(schema) {
			const agg = {};
			const def = schema._zod.def;
			const list = schema._zod.traits.has("$ZodCheck") ? [schema, ...def.checks ?? []] : def.checks ?? [];
			for (const ch of list) contributors[ch._zod.def.check]?.(agg, ch._zod.def);
			const bag = schema._zod.bag;
			if (bag.minimum !== void 0) narrowMin(agg, "minimum", bag.minimum);
			if (bag.exclusiveMinimum !== void 0) narrowMin(agg, "exclusiveMinimum", bag.exclusiveMinimum);
			if (bag.maximum !== void 0) narrowMax(agg, "maximum", bag.maximum);
			if (bag.exclusiveMaximum !== void 0) narrowMax(agg, "exclusiveMaximum", bag.exclusiveMaximum);
			if (bag.multipleOf !== void 0) addDivisor(agg, bag.multipleOf);
			if (bag.format !== void 0) {
				agg.format ?? (agg.format = bag.format);
				if (bag.format.includes("int")) agg.isInt = true;
			}
			if (bag.mime) intersectMime(agg, bag.mime);
			for (const pattern of bag.patterns ?? []) addPattern(agg, pattern);
			return agg;
		}
		const formatMap = {
			guid: "uuid",
			url: "uri",
			datetime: "date-time",
			json_string: "json-string",
			regex: ""
		};
		const exactPatterns = /* @__PURE__ */ new Map([[base64Charset, base64], [base64urlCharset, base64url]]);
		const exactPattern = (p) => exactPatterns.get(p) ?? p;
		const stringProcessor = (schema, ctx, _json, _params) => {
			const json = _json;
			json.type = "string";
			const { minimum, maximum, format, patterns, contentEncoding, laxFormat } = aggregateChecks(schema);
			if (typeof minimum === "number") json.minLength = minimum;
			if (typeof maximum === "number") json.maxLength = maximum;
			if (format) {
				json.format = formatMap[format] ?? format;
				if (json.format === "") delete json.format;
				if (format === "time" || laxFormat) delete json.format;
			}
			if (contentEncoding) json.contentEncoding = contentEncoding;
			if (patterns && patterns.size > 0) {
				const patternList = [...patterns].map(exactPattern);
				if (patternList.length === 1) json.pattern = patternList[0].source;
				else if (patternList.length > 1) json.allOf = [...patternList.map((regex) => ({
					...ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0" ? { type: "string" } : {},
					pattern: regex.source
				}))];
			}
		};
		const numberProcessor = (schema, ctx, _json, params) => {
			const json = _json;
			const { minimum, maximum, multipleOf, exclusiveMaximum, exclusiveMinimum, isInt } = aggregateChecks(schema);
			json.type = isInt ? "integer" : "number";
			const exMin = typeof exclusiveMinimum === "number" && exclusiveMinimum >= (minimum ?? Number.NEGATIVE_INFINITY);
			const exMax = typeof exclusiveMaximum === "number" && exclusiveMaximum <= (maximum ?? Number.POSITIVE_INFINITY);
			const legacy = ctx.target === "draft-04" || ctx.target === "openapi-3.0";
			if (exMin) {
				if (legacy) {
					json.minimum = exclusiveMinimum;
					json.exclusiveMinimum = true;
				} else json.exclusiveMinimum = exclusiveMinimum;
			} else if (typeof minimum === "number") json.minimum = minimum;
			if (exMax) {
				if (legacy) {
					json.maximum = exclusiveMaximum;
					json.exclusiveMaximum = true;
				} else json.exclusiveMaximum = exclusiveMaximum;
			} else if (typeof maximum === "number") json.maximum = maximum;
			if (multipleOf) {
				const divisors = /* @__PURE__ */ new Set();
				for (const divisor of multipleOf) if (Number.isFinite(divisor) && divisor !== 0) divisors.add(Math.abs(divisor));
				else handleUnrepresentable(schema, ctx, json, params, `A multipleOf divisor of ${divisor} cannot be represented in JSON Schema`);
				const [first, ...rest] = divisors;
				if (first !== void 0) json.multipleOf = first;
				if (rest.length) json.allOf = [...json.allOf ?? [], ...rest.map((m) => ({ multipleOf: m }))];
			}
		};
		const booleanProcessor = (_schema, _ctx, json, _params) => {
			json.type = "boolean";
		};
		const undefinedProcessor = (schema, ctx, json, params) => {
			handleUnrepresentable(schema, ctx, json, params, "Undefined cannot be represented in JSON Schema");
		};
		const neverProcessor = (_schema, _ctx, json, _params) => {
			json.not = {};
		};
		const enumProcessor = (schema, _ctx, json, _params) => {
			const def = schema._zod.def;
			const values = getEnumValues(def.entries);
			if (values.length === 0) {
				json.not = {};
				return;
			}
			if (values.every((v) => typeof v === "number")) json.type = "number";
			if (values.every((v) => typeof v === "string")) json.type = "string";
			json.enum = values;
		};
		const literalProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			if (def.values.length === 0) {
				json.not = {};
				return;
			}
			const vals = [];
			for (const val of def.values) if (val === void 0) {
				if (handleUnrepresentable(schema, ctx, json, params, "Literal `undefined` cannot be represented in JSON Schema")) return;
			} else if (typeof val === "bigint") {
				if (handleUnrepresentable(schema, ctx, json, params, "BigInt literals cannot be represented in JSON Schema")) return;
				vals.push(Number(val));
			} else vals.push(val);
			if (vals.length === 0) {} else if (vals.length === 1) {
				const val = vals[0];
				json.type = val === null ? "null" : typeof val;
				if (ctx.target === "draft-04" || ctx.target === "openapi-3.0") json.enum = [val];
				else json.const = val;
			} else {
				if (vals.every((v) => typeof v === "number")) json.type = "number";
				if (vals.every((v) => typeof v === "string")) json.type = "string";
				if (vals.every((v) => typeof v === "boolean")) json.type = "boolean";
				if (vals.every((v) => v === null)) json.type = "null";
				json.enum = vals;
			}
		};
		const customProcessor = (schema, ctx, json, params) => {
			handleUnrepresentable(schema, ctx, json, params, "Custom types cannot be represented in JSON Schema");
		};
		const transformProcessor = (schema, ctx, json, params) => {
			handleUnrepresentable(schema, ctx, json, params, "Transforms cannot be represented in JSON Schema");
		};
		const arrayProcessor = (schema, ctx, _json, params) => {
			const json = _json;
			const def = schema._zod.def;
			const { minimum, maximum } = aggregateChecks(schema);
			if (typeof minimum === "number") json.minItems = minimum;
			if (typeof maximum === "number") json.maxItems = maximum;
			json.type = "array";
			json.items = processSchema(def.element, ctx, {
				...params,
				path: [...params.path, "items"]
			});
		};
		function inputOptin(schema) {
			const def = schema._zod.def;
			if (def.type === "pipe" && def.in._zod.traits.has("$ZodTransform")) return inputOptin(def.out);
			if (def.type === "catch") return inputOptin(def.innerType);
			return schema._zod.optin;
		}
		const objectProcessor = (schema, ctx, _json, params) => {
			const json = _json;
			const def = schema._zod.def;
			const shape = def.shape;
			if (Object.getOwnPropertySymbols(shape).length && handleUnrepresentable(schema, ctx, json, params, "Symbol keys cannot be represented in JSON Schema")) return;
			json.type = "object";
			json.properties = {};
			for (const key in shape) assignProp(json.properties, key, processSchema(shape[key], ctx, {
				...params,
				path: [
					...params.path,
					"properties",
					key
				]
			}));
			const requiredKeys = [];
			for (const key of Object.keys(shape)) {
				const field = def.shape[key];
				if (ctx.io === "input" ? inputOptin(field) === void 0 : field._zod.optout === void 0) requiredKeys.push(key);
			}
			if (requiredKeys.length > 0) json.required = requiredKeys;
			if (def.catchall?._zod.def.type === "never") json.additionalProperties = false;
			else if (!def.catchall) {
				if (ctx.io === "output") json.additionalProperties = false;
			} else if (def.catchall) json.additionalProperties = processSchema(def.catchall, ctx, {
				...params,
				path: [...params.path, "additionalProperties"]
			});
		};
		const unionProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			const isExclusive = def.inclusive === false;
			const options = def.options.map((x, i) => processSchema(x, ctx, {
				...params,
				path: [
					...params.path,
					isExclusive ? "oneOf" : "anyOf",
					i
				]
			}));
			if (isExclusive) json.oneOf = options;
			else json.anyOf = options;
		};
		const intersectionProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			const a = processSchema(def.left, ctx, {
				...params,
				path: [
					...params.path,
					"allOf",
					0
				]
			});
			const b = processSchema(def.right, ctx, {
				...params,
				path: [
					...params.path,
					"allOf",
					1
				]
			});
			const isSimpleIntersection = (val) => "allOf" in val && Object.keys(val).length === 1;
			const allOf = [...isSimpleIntersection(a) ? a.allOf : [a], ...isSimpleIntersection(b) ? b.allOf : [b]];
			json.allOf = allOf;
			ctx.intersections.push(allOf);
		};
		const nullableProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			const inner = processSchema(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			if (ctx.target === "openapi-3.0") {
				seen.ref = def.innerType;
				json.nullable = true;
			} else json.anyOf = [inner, { type: "null" }];
		};
		const nonoptionalProcessor = (schema, ctx, _json, params) => {
			const def = schema._zod.def;
			processSchema(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
		};
		/** Round-trips a default value through JSON so the emitted schema is guaranteed to be valid JSON.
		* A BigInt has no reliable encoding, so it goes through `unrepresentable` like any other
		* unrepresentable value. Returns a sentinel when the caller must not write a default of its own. */
		const UNREPRESENTABLE_DEFAULT = Symbol();
		function serializeDefaultValue(value, schema, ctx, json, params) {
			let unrepresentable = false;
			const serialized = JSON.stringify(value, (_, val) => {
				if (typeof val !== "bigint") return val;
				unrepresentable = true;
				return null;
			});
			if (!unrepresentable) return JSON.parse(serialized);
			handleUnrepresentable(schema, ctx, json, params, "BigInt defaults cannot be represented in JSON Schema");
			return UNREPRESENTABLE_DEFAULT;
		}
		const defaultProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			processSchema(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
			const value = serializeDefaultValue(def.defaultValue, schema, ctx, json, params);
			if (value !== UNREPRESENTABLE_DEFAULT) json.default = value;
		};
		const prefaultProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			processSchema(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
			if (ctx.io !== "input") return;
			const value = serializeDefaultValue(def.defaultValue, schema, ctx, json, params);
			if (value !== UNREPRESENTABLE_DEFAULT) json._prefault = value;
		};
		const catchProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			processSchema(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
			let catchValue;
			try {
				catchValue = def.catchValue(void 0);
			} catch {
				handleUnrepresentable(schema, ctx, json, params, "Dynamic catch values are not supported in JSON Schema");
				return;
			}
			json.default = catchValue;
		};
		const pipeProcessor = (schema, ctx, _json, params) => {
			const def = schema._zod.def;
			const inIsTransform = def.in._zod.traits.has("$ZodTransform");
			const innerType = ctx.io === "input" ? inIsTransform ? def.out : def.in : def.out;
			processSchema(innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = innerType;
		};
		const readonlyProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			processSchema(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
			json.readOnly = true;
		};
		const optionalProcessor = (schema, ctx, _json, params) => {
			const def = schema._zod.def;
			processSchema(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
		};
		//#endregion
		//#region node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/classic/errors.js
		const _installedErrorProtos = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]);
		function _lazyMethod(proto, key, make) {
			Object.defineProperty(proto, key, {
				configurable: true,
				enumerable: false,
				get() {
					const value = make(this);
					Object.defineProperty(this, key, {
						value,
						configurable: true,
						writable: true
					});
					return value;
				},
				set(value) {
					Object.defineProperty(this, key, {
						value,
						configurable: true,
						writable: true
					});
				}
			});
		}
		const initializer = (inst, issues) => {
			$ZodError.init(inst, issues);
			inst.name = "ZodError";
			const proto = Object.getPrototypeOf(inst);
			if (_installedErrorProtos.has(proto)) return;
			_installedErrorProtos.add(proto);
			_lazyMethod(proto, "format", (self) => (mapper) => formatError(self, mapper));
			_lazyMethod(proto, "flatten", (self) => (mapper) => flattenError(self, mapper));
			_lazyMethod(proto, "addIssue", (self) => (issue) => {
				self.issues.push(issue);
				self.message = JSON.stringify(self.issues, jsonStringifyReplacer, 2);
			});
			_lazyMethod(proto, "addIssues", (self) => (issues) => {
				self.issues.push(...issues);
				self.message = JSON.stringify(self.issues, jsonStringifyReplacer, 2);
			});
			Object.defineProperty(proto, "isEmpty", {
				configurable: true,
				enumerable: false,
				get() {
					return this.issues.length === 0;
				}
			});
		};
		const ZodRealError = /*@__PURE__*/ $constructor("ZodError", initializer, void 0, { Parent: Error });
		//#endregion
		//#region node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/classic/parse.js
		const parse = /* @__PURE__ */ _parse(ZodRealError);
		const parseAsync = /* @__PURE__ */ _parseAsync(ZodRealError);
		const safeParse = /* @__PURE__ */ _safeParse(ZodRealError);
		const safeParseAsync = /* @__PURE__ */ _safeParseAsync(ZodRealError);
		const encode = /* @__PURE__ */ _encode(ZodRealError);
		const decode = /* @__PURE__ */ _decode(ZodRealError);
		const encodeAsync = /* @__PURE__ */ _encodeAsync(ZodRealError);
		const decodeAsync = /* @__PURE__ */ _decodeAsync(ZodRealError);
		const safeEncode = /* @__PURE__ */ _safeEncode(ZodRealError);
		const safeDecode = /* @__PURE__ */ _safeDecode(ZodRealError);
		const safeEncodeAsync = /* @__PURE__ */ _safeEncodeAsync(ZodRealError);
		const safeDecodeAsync = /* @__PURE__ */ _safeDecodeAsync(ZodRealError);
		//#endregion
		//#region node_modules/.pnpm/zod@4.6.7/node_modules/zod/v4/classic/schemas.js
		function _ensureDefaultLocale() {
			if (!globalConfig.localeError) config(en_default());
		}
		function _ensureDefaultMemoizer() {
			if (!globalConfig.memoizer) config({ memoizer: memoizer() });
		}
		const ZodType = /*@__PURE__*/ $constructor("ZodType", (inst, def) => {
			_ensureDefaultLocale();
			$ZodType.init(inst, def);
			inst.def = def;
			inst.type = def.type;
			return inst;
		}, {
			check(...chks) {
				const def = this.def;
				return this.clone(mergeDefs(def, { checks: [...def.checks ?? [], ...chks.map((ch) => typeof ch === "function" ? { _zod: {
					check: ch,
					def: { check: "custom" },
					onattach: []
				} } : ch)] }), { parent: true });
			},
			with(...chks) {
				return this.check(...chks);
			},
			clone(def, params) {
				return clone(this, def, params);
			},
			brand() {
				return this;
			},
			register(reg, meta) {
				reg.add(this, meta);
				return this;
			},
			refine(check, params) {
				return this.check(refine(check, params));
			},
			superRefine(refinement, params) {
				return this.check(superRefine(refinement, params));
			},
			overwrite(fn) {
				return this.check(/* @__PURE__ */ _overwrite(fn));
			},
			optional() {
				return optional(this);
			},
			exactOptional() {
				return exactOptional(this);
			},
			nullable() {
				return nullable(this);
			},
			nullish() {
				return optional(nullable(this));
			},
			nonoptional(params) {
				return nonoptional(this, params);
			},
			array() {
				return array(this);
			},
			or(arg) {
				return union([this, arg]);
			},
			and(arg) {
				return intersection(this, arg);
			},
			transform(tx) {
				return pipe(this, transform(tx));
			},
			default(d) {
				return _default(this, d);
			},
			prefault(d) {
				return prefault(this, d);
			},
			catch(params) {
				return _catch(this, params);
			},
			pipe(target) {
				return pipe(this, target);
			},
			readonly() {
				return readonly(this);
			},
			describe(description) {
				const cl = this.clone();
				globalRegistry.add(cl, { description });
				return cl;
			},
			meta(...args) {
				if (args.length === 0) return globalRegistry.get(this);
				const cl = this.clone();
				globalRegistry.add(cl, args[0]);
				return cl;
			},
			isOptional() {
				return this.safeParse(void 0).success;
			},
			isNullable() {
				return this.safeParse(null).success;
			},
			apply(fn, ...args) {
				return args.length === 0 ? fn(this) : fn(this, ...args);
			},
			get "~standard"() {
				return hide(this, "~standard", {
					...standardProps(this),
					jsonSchema: {
						input: createStandardJSONSchemaMethod(this, "input"),
						output: createStandardJSONSchemaMethod(this, "output")
					}
				});
			},
			set "~standard"(value) {
				own(this, "~standard", value);
			},
			parse: function _parse(data, params) {
				return parse(this, data, params, { callee: _parse });
			},
			parseAsync: async function _parseAsync(data, params) {
				return await parseAsync(this, data, params, { callee: _parseAsync });
			},
			safeParse(data, params) {
				return safeParse(this, data, params);
			},
			async safeParseAsync(data, params) {
				return safeParseAsync(this, data, params);
			},
			get spa() {
				return this?.safeParseAsync;
			},
			set spa(value) {
				own(this, "spa", value);
			},
			validate(data, params) {
				return validate(this, data, params);
			},
			validateAsync(data, params) {
				return validateAsync$1(this, data, params);
			},
			encode: function _encode(data, params) {
				return encode(this, data, params, { callee: _encode });
			},
			decode: function _decode(data, params) {
				return decode(this, data, params, { callee: _decode });
			},
			encodeAsync: async function _encodeAsync(data, params) {
				return await encodeAsync(this, data, params, { callee: _encodeAsync });
			},
			decodeAsync: async function _decodeAsync(data, params) {
				return await decodeAsync(this, data, params, { callee: _decodeAsync });
			},
			safeEncode(data, params) {
				return safeEncode(this, data, params);
			},
			safeDecode(data, params) {
				return safeDecode(this, data, params);
			},
			async safeEncodeAsync(data, params) {
				return safeEncodeAsync(this, data, params);
			},
			async safeDecodeAsync(data, params) {
				return safeDecodeAsync(this, data, params);
			},
			toJSONSchema(params) {
				return createToJSONSchemaMethod(this, {})(params);
			},
			get description() {
				return globalRegistry.get(this)?.description;
			},
			get _def() {
				return this._zod.def;
			}
		});
		/** @internal */
		const _ZodString = /*@__PURE__*/ $constructor("_ZodString", (inst, def) => {
			$ZodString.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => stringProcessor(inst, ctx, json, params);
		}, /*@__PURE__*/ derived({
			format: (inst) => aggregateChecks(inst).format ?? null,
			minLength: (inst) => aggregateChecks(inst).minimum ?? null,
			maxLength: (inst) => aggregateChecks(inst).maximum ?? null
		}, {
			regex(...args) {
				return this.check(/* @__PURE__ */ _regex(...args));
			},
			includes(...args) {
				return this.check(/* @__PURE__ */ _includes(...args));
			},
			startsWith(...args) {
				return this.check(/* @__PURE__ */ _startsWith(...args));
			},
			endsWith(...args) {
				return this.check(/* @__PURE__ */ _endsWith(...args));
			},
			min(...args) {
				return this.check(/* @__PURE__ */ _minLength(...args));
			},
			max(...args) {
				return this.check(/* @__PURE__ */ _maxLength(...args));
			},
			length(...args) {
				return this.check(/* @__PURE__ */ _length(...args));
			},
			nonempty(...args) {
				return this.check(/* @__PURE__ */ _minLength(1, ...args));
			},
			lowercase(params) {
				return this.check(/* @__PURE__ */ _lowercase(params));
			},
			uppercase(params) {
				return this.check(/* @__PURE__ */ _uppercase(params));
			},
			trim() {
				return this.check(/* @__PURE__ */ _trim());
			},
			normalize(...args) {
				return this.check(/* @__PURE__ */ _normalize(...args));
			},
			toLowerCase() {
				return this.check(/* @__PURE__ */ _toLowerCase());
			},
			toUpperCase() {
				return this.check(/* @__PURE__ */ _toUpperCase());
			},
			slugify() {
				return this.check(/* @__PURE__ */ _slugify());
			}
		}));
		const ZodString = /*@__PURE__*/ $constructor("ZodString", (inst, def) => {
			$ZodString.init(inst, def);
			_ZodString.init(inst, def);
		}, {
			email(params) {
				return this.check(/* @__PURE__ */ _email(ZodEmail, params));
			},
			url(params) {
				return this.check(/* @__PURE__ */ _url(ZodURL, params));
			},
			jwt(params) {
				return this.check(/* @__PURE__ */ _jwt(ZodJWT, params));
			},
			emoji(params) {
				return this.check(/* @__PURE__ */ _emoji(ZodEmoji, params));
			},
			guid(params) {
				return this.check(/* @__PURE__ */ _guid(ZodGUID, params));
			},
			uuid(params) {
				return this.check(/* @__PURE__ */ _uuid(ZodUUID, params));
			},
			uuidv4(params) {
				return this.check(/* @__PURE__ */ _uuidv4(ZodUUID, params));
			},
			uuidv6(params) {
				return this.check(/* @__PURE__ */ _uuidv6(ZodUUID, params));
			},
			uuidv7(params) {
				return this.check(/* @__PURE__ */ _uuidv7(ZodUUID, params));
			},
			nanoid(params) {
				return this.check(/* @__PURE__ */ _nanoid(ZodNanoID, params));
			},
			cuid(params) {
				return this.check(/* @__PURE__ */ _cuid(ZodCUID, params));
			},
			cuid2(params) {
				return this.check(/* @__PURE__ */ _cuid2(ZodCUID2, params));
			},
			ulid(params) {
				return this.check(/* @__PURE__ */ _ulid(ZodULID, params));
			},
			base64(params) {
				return this.check(/* @__PURE__ */ _base64(ZodBase64, params));
			},
			base64url(params) {
				return this.check(/* @__PURE__ */ _base64url(ZodBase64URL, params));
			},
			xid(params) {
				return this.check(/* @__PURE__ */ _xid(ZodXID, params));
			},
			ksuid(params) {
				return this.check(/* @__PURE__ */ _ksuid(ZodKSUID, params));
			},
			ipv4(params) {
				return this.check(/* @__PURE__ */ _ipv4(ZodIPv4, params));
			},
			ipv6(params) {
				return this.check(/* @__PURE__ */ _ipv6(ZodIPv6, params));
			},
			cidrv4(params) {
				return this.check(/* @__PURE__ */ _cidrv4(ZodCIDRv4, params));
			},
			cidrv6(params) {
				return this.check(/* @__PURE__ */ _cidrv6(ZodCIDRv6, params));
			},
			e164(params) {
				return this.check(/* @__PURE__ */ _e164(ZodE164, params));
			},
			datetime(params) {
				return this.check(/* @__PURE__ */ _isoDateTime(ZodISODateTime, params));
			},
			date(params) {
				return this.check(/* @__PURE__ */ _isoDate(ZodISODate, params));
			},
			time(params) {
				return this.check(/* @__PURE__ */ _isoTime(ZodISOTime, params));
			},
			duration(params) {
				return this.check(/* @__PURE__ */ _isoDuration(ZodISODuration, params));
			}
		});
		function string(params) {
			return /* @__PURE__ */ _string(ZodString, params);
		}
		const ZodStringFormat = /*@__PURE__*/ $constructor("ZodStringFormat", (inst, def) => {
			$ZodStringFormat.init(inst, def);
			_ZodString.init(inst, def);
		});
		const ZodISODateTime = /*@__PURE__*/ $constructor("ZodISODateTime", (inst, def) => {
			$ZodISODateTime.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodISODate = /*@__PURE__*/ $constructor("ZodISODate", (inst, def) => {
			$ZodISODate.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodISOTime = /*@__PURE__*/ $constructor("ZodISOTime", (inst, def) => {
			$ZodISOTime.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodISODuration = /*@__PURE__*/ $constructor("ZodISODuration", (inst, def) => {
			$ZodISODuration.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodEmail = /*@__PURE__*/ $constructor("ZodEmail", (inst, def) => {
			$ZodEmail.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodGUID = /*@__PURE__*/ $constructor("ZodGUID", (inst, def) => {
			$ZodGUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodUUID = /*@__PURE__*/ $constructor("ZodUUID", (inst, def) => {
			$ZodUUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodURL = /*@__PURE__*/ $constructor("ZodURL", (inst, def) => {
			$ZodURL.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodEmoji = /*@__PURE__*/ $constructor("ZodEmoji", (inst, def) => {
			$ZodEmoji.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodNanoID = /*@__PURE__*/ $constructor("ZodNanoID", (inst, def) => {
			$ZodNanoID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link ZodCUID2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		const ZodCUID = /*@__PURE__*/ $constructor("ZodCUID", (inst, def) => {
			$ZodCUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodCUID2 = /*@__PURE__*/ $constructor("ZodCUID2", (inst, def) => {
			$ZodCUID2.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodULID = /*@__PURE__*/ $constructor("ZodULID", (inst, def) => {
			$ZodULID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodXID = /*@__PURE__*/ $constructor("ZodXID", (inst, def) => {
			$ZodXID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodKSUID = /*@__PURE__*/ $constructor("ZodKSUID", (inst, def) => {
			$ZodKSUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodIPv4 = /*@__PURE__*/ $constructor("ZodIPv4", (inst, def) => {
			$ZodIPv4.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodIPv6 = /*@__PURE__*/ $constructor("ZodIPv6", (inst, def) => {
			$ZodIPv6.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodCIDRv4 = /*@__PURE__*/ $constructor("ZodCIDRv4", (inst, def) => {
			$ZodCIDRv4.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodCIDRv6 = /*@__PURE__*/ $constructor("ZodCIDRv6", (inst, def) => {
			$ZodCIDRv6.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodBase64 = /*@__PURE__*/ $constructor("ZodBase64", (inst, def) => {
			$ZodBase64.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodBase64URL = /*@__PURE__*/ $constructor("ZodBase64URL", (inst, def) => {
			$ZodBase64URL.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodE164 = /*@__PURE__*/ $constructor("ZodE164", (inst, def) => {
			$ZodE164.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodJWT = /*@__PURE__*/ $constructor("ZodJWT", (inst, def) => {
			$ZodJWT.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodNumber = /*@__PURE__*/ $constructor("ZodNumber", (inst, def) => {
			$ZodNumber.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => numberProcessor(inst, ctx, json, params);
			inst.isFinite = true;
		}, /*@__PURE__*/ derived({
			minValue: (inst) => {
				const { minimum, exclusiveMinimum } = aggregateChecks(inst);
				return Math.max(minimum ?? Number.NEGATIVE_INFINITY, exclusiveMinimum ?? Number.NEGATIVE_INFINITY);
			},
			maxValue: (inst) => {
				const { maximum, exclusiveMaximum } = aggregateChecks(inst);
				return Math.min(maximum ?? Number.POSITIVE_INFINITY, exclusiveMaximum ?? Number.POSITIVE_INFINITY);
			},
			isInt: (inst) => {
				const { isInt, multipleOf } = aggregateChecks(inst);
				return !!isInt || !!multipleOf?.some(Number.isSafeInteger);
			},
			format: (inst) => aggregateChecks(inst).format ?? null
		}, {
			gt(value, params) {
				return this.check(/* @__PURE__ */ _gt(value, params));
			},
			gte(value, params) {
				return this.check(/* @__PURE__ */ _gte(value, params));
			},
			min(value, params) {
				return this.check(/* @__PURE__ */ _gte(value, params));
			},
			lt(value, params) {
				return this.check(/* @__PURE__ */ _lt(value, params));
			},
			lte(value, params) {
				return this.check(/* @__PURE__ */ _lte(value, params));
			},
			max(value, params) {
				return this.check(/* @__PURE__ */ _lte(value, params));
			},
			int(params) {
				return this.check(int(params));
			},
			safe(params) {
				return this.check(int(params));
			},
			positive(params) {
				return this.check(/* @__PURE__ */ _gt(0, params));
			},
			nonnegative(params) {
				return this.check(/* @__PURE__ */ _gte(0, params));
			},
			negative(params) {
				return this.check(/* @__PURE__ */ _lt(0, params));
			},
			nonpositive(params) {
				return this.check(/* @__PURE__ */ _lte(0, params));
			},
			multipleOf(value, params) {
				return this.check(/* @__PURE__ */ _multipleOf(value, params));
			},
			step(value, params) {
				return this.check(/* @__PURE__ */ _multipleOf(value, params));
			},
			finite() {
				return this;
			}
		}));
		function number(params) {
			return /* @__PURE__ */ _number(ZodNumber, params);
		}
		const ZodNumberFormat = /*@__PURE__*/ $constructor("ZodNumberFormat", (inst, def) => {
			$ZodNumberFormat.init(inst, def);
			ZodNumber.init(inst, def);
		});
		function int(params) {
			return /* @__PURE__ */ _int(ZodNumberFormat, params);
		}
		const ZodBoolean = /*@__PURE__*/ $constructor("ZodBoolean", (inst, def) => {
			$ZodBoolean.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => booleanProcessor(inst, ctx, json, params);
		});
		function boolean(params) {
			return /* @__PURE__ */ _boolean(ZodBoolean, params);
		}
		const ZodUndefined = /*@__PURE__*/ $constructor("ZodUndefined", (inst, def) => {
			$ZodUndefined.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => undefinedProcessor(inst, ctx, json, params);
		});
		function _undefined(params) {
			return /* @__PURE__ */ _undefined$1(ZodUndefined, params);
		}
		const ZodUnknown = /*@__PURE__*/ $constructor("ZodUnknown", (inst, def) => {
			$ZodUnknown.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => void 0;
		});
		function unknown() {
			return /* @__PURE__ */ _unknown(ZodUnknown);
		}
		const ZodNever = /*@__PURE__*/ $constructor("ZodNever", (inst, def) => {
			$ZodNever.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => neverProcessor(inst, ctx, json, params);
		});
		function never(params) {
			return /* @__PURE__ */ _never(ZodNever, params);
		}
		const ZodArray = /*@__PURE__*/ $constructor("ZodArray", (inst, def) => {
			_ensureDefaultMemoizer();
			$ZodArray.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => arrayProcessor(inst, ctx, json, params);
			inst.element = def.element;
		}, {
			min(n, params) {
				return this.check(/* @__PURE__ */ _minLength(n, params));
			},
			nonempty(params) {
				return this.check(/* @__PURE__ */ _minLength(1, params));
			},
			max(n, params) {
				return this.check(/* @__PURE__ */ _maxLength(n, params));
			},
			length(n, params) {
				return this.check(/* @__PURE__ */ _length(n, params));
			},
			unwrap() {
				return this.element;
			}
		});
		function array(element, params) {
			return /* @__PURE__ */ _array(ZodArray, element, params);
		}
		const ZodObject = /*@__PURE__*/ $constructor("ZodObject", (inst, def) => {
			_ensureDefaultMemoizer();
			$ZodObjectJIT.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => objectProcessor(inst, ctx, json, params);
			installLazyProp(inst, "shape", (self) => self._zod.def.shape, false);
		}, {
			keyof() {
				return _enum(Object.keys(this._zod.def.shape));
			},
			catchall(catchall) {
				return this.clone(mergeDefs(this._zod.def, { catchall }));
			},
			passthrough() {
				return this.clone(mergeDefs(this._zod.def, { catchall: unknown() }));
			},
			loose() {
				return this.clone(mergeDefs(this._zod.def, { catchall: unknown() }));
			},
			strict() {
				return this.clone(mergeDefs(this._zod.def, { catchall: never() }));
			},
			strip() {
				return this.clone(mergeDefs(this._zod.def, { catchall: void 0 }));
			},
			extend(incoming) {
				return extend(this, incoming);
			},
			safeExtend(incoming) {
				return safeExtend(this, incoming);
			},
			merge(other) {
				return merge(this, other);
			},
			pick(mask) {
				return pick(this, mask);
			},
			omit(mask) {
				return omit(this, mask);
			},
			partial(...args) {
				return partial(ZodOptional, this, args[0]);
			},
			exactPartial(...args) {
				return partial(ZodExactOptional, this, args[0], "exactPartial");
			},
			required(...args) {
				return required(ZodNonOptional, this, args[0]);
			}
		});
		function object(shape, params) {
			const def = {
				type: "object",
				shape: shape ?? {},
				...normalizeParams(params)
			};
			return new ZodObject(def);
		}
		function strictObject(shape, params) {
			return new ZodObject({
				type: "object",
				shape,
				catchall: never(),
				...normalizeParams(params)
			});
		}
		const ZodUnion = /*@__PURE__*/ $constructor("ZodUnion", (inst, def) => {
			$ZodUnion.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => unionProcessor(inst, ctx, json, params);
			inst.options = def.options;
		});
		function union(options, params) {
			return new ZodUnion({
				type: "union",
				options,
				...normalizeParams(params)
			});
		}
		const ZodDiscriminatedUnion = /*@__PURE__*/ $constructor("ZodDiscriminatedUnion", (inst, def) => {
			ZodUnion.init(inst, def);
			$ZodDiscriminatedUnion.init(inst, def);
		});
		function discriminatedUnion(discriminator, options, params) {
			return new ZodDiscriminatedUnion({
				type: "union",
				options,
				discriminator,
				...normalizeParams(params)
			});
		}
		const ZodIntersection = /*@__PURE__*/ $constructor("ZodIntersection", (inst, def) => {
			$ZodIntersection.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => intersectionProcessor(inst, ctx, json, params);
		});
		function intersection(left, right) {
			return new ZodIntersection({
				type: "intersection",
				left,
				right
			});
		}
		const ZodEnum = /*@__PURE__*/ $constructor("ZodEnum", (inst, def) => {
			$ZodEnum.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => enumProcessor(inst, ctx, json, params);
			inst.enum = def.entries;
			inst.options = [...inst._zod.values];
			const keys = new Set(Object.keys(def.entries));
			inst.extract = (values, params) => {
				const newEntries = {};
				for (const value of values) if (keys.has(value)) newEntries[value] = def.entries[value];
				else throw new Error(`Key ${value} not found in enum`);
				return new ZodEnum({
					...def,
					checks: [],
					...normalizeParams(params),
					entries: newEntries
				});
			};
			inst.exclude = (values, params) => {
				const newEntries = { ...def.entries };
				for (const value of values) if (keys.has(value)) delete newEntries[value];
				else throw new Error(`Key ${value} not found in enum`);
				return new ZodEnum({
					...def,
					checks: [],
					...normalizeParams(params),
					entries: newEntries
				});
			};
		});
		function _enum(values, params) {
			const entries = Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values;
			return new ZodEnum({
				type: "enum",
				entries,
				...normalizeParams(params)
			});
		}
		const ZodLiteral = /*@__PURE__*/ $constructor("ZodLiteral", (inst, def) => {
			$ZodLiteral.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => literalProcessor(inst, ctx, json, params);
			inst.values = new Set(def.values);
			Object.defineProperty(inst, "value", { get() {
				if (def.values.length > 1) throw new Error("This schema contains multiple valid literal values. Use `.values` instead.");
				return def.values[0];
			} });
		});
		function literal(value, params) {
			return new ZodLiteral({
				type: "literal",
				values: Array.isArray(value) ? value : [value],
				...normalizeParams(params)
			});
		}
		const ZodTransform = /*@__PURE__*/ $constructor("ZodTransform", (inst, def) => {
			_ensureDefaultMemoizer();
			$ZodTransform.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => transformProcessor(inst, ctx, json, params);
			inst._zod.parse = (payload, _ctx) => {
				if (_ctx.direction === "backward") throw new $ZodEncodeError(inst.constructor.name);
				payload.addIssue = (issue$1) => {
					if (typeof issue$1 === "string") payload.issues.push(issue(issue$1, payload.value, def));
					else {
						const _issue = issue$1;
						if (_issue.fatal) _issue.continue = false;
						_issue.code ?? (_issue.code = "custom");
						if (!("input" in _issue)) _issue.input = payload.value;
						_issue.inst ?? (_issue.inst = inst);
						payload.issues.push(issue(_issue));
					}
				};
				const output = def.transform(payload.value, payload);
				if (output instanceof Promise) return output.then((output) => {
					payload.value = output;
					return payload;
				});
				payload.value = output;
				return payload;
			};
		});
		function transform(fn) {
			return new ZodTransform({
				type: "transform",
				transform: fn
			});
		}
		const ZodOptional = /*@__PURE__*/ $constructor("ZodOptional", (inst, def) => {
			$ZodOptional.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function optional(innerType) {
			return new ZodOptional({
				type: "optional",
				innerType
			});
		}
		const ZodExactOptional = /*@__PURE__*/ $constructor("ZodExactOptional", (inst, def) => {
			$ZodExactOptional.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function exactOptional(innerType) {
			return new ZodExactOptional({
				type: "optional",
				innerType
			});
		}
		const ZodNullable = /*@__PURE__*/ $constructor("ZodNullable", (inst, def) => {
			$ZodNullable.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => nullableProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function nullable(innerType) {
			return new ZodNullable({
				type: "nullable",
				innerType
			});
		}
		const ZodDefault = /*@__PURE__*/ $constructor("ZodDefault", (inst, def) => {
			$ZodDefault.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => defaultProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
			inst.removeDefault = inst.unwrap;
		});
		function _default(innerType, defaultValue) {
			return new ZodDefault({
				type: "default",
				innerType,
				get defaultValue() {
					return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
				}
			});
		}
		const ZodPrefault = /*@__PURE__*/ $constructor("ZodPrefault", (inst, def) => {
			$ZodPrefault.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => prefaultProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function prefault(innerType, defaultValue) {
			return new ZodPrefault({
				type: "prefault",
				innerType,
				get defaultValue() {
					return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
				}
			});
		}
		const ZodNonOptional = /*@__PURE__*/ $constructor("ZodNonOptional", (inst, def) => {
			$ZodNonOptional.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => nonoptionalProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function nonoptional(innerType, params) {
			return new ZodNonOptional({
				type: "nonoptional",
				innerType,
				...normalizeParams(params)
			});
		}
		const ZodCatch = /*@__PURE__*/ $constructor("ZodCatch", (inst, def) => {
			$ZodCatch.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => catchProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
			inst.removeCatch = inst.unwrap;
		});
		function _catch(innerType, catchValue) {
			return new ZodCatch({
				type: "catch",
				innerType,
				catchValue: typeof catchValue === "function" ? catchValue : constantCatch(catchValue)
			});
		}
		const ZodPipe = /*@__PURE__*/ $constructor("ZodPipe", (inst, def) => {
			$ZodPipe.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => pipeProcessor(inst, ctx, json, params);
			inst.in = def.in;
			inst.out = def.out;
		});
		function pipe(in_, out) {
			return new ZodPipe({
				type: "pipe",
				in: in_,
				out
			});
		}
		const ZodReadonly = /*@__PURE__*/ $constructor("ZodReadonly", (inst, def) => {
			$ZodReadonly.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => readonlyProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function readonly(innerType) {
			return new ZodReadonly({
				type: "readonly",
				innerType
			});
		}
		const ZodCustom = /*@__PURE__*/ $constructor("ZodCustom", (inst, def) => {
			$ZodCustom.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => customProcessor(inst, ctx, json, params);
		});
		function refine(fn, _params = {}) {
			return /* @__PURE__ */ _refine(ZodCustom, fn, _params);
		}
		function superRefine(fn, params) {
			return /* @__PURE__ */ _superRefine(fn, params);
		}
		//#endregion
		//#region lib/typert.remote-client.js
		let dsh_intelligent_ui_intelligentUi_read_parameter_0$schema$value;
		const dsh_intelligent_ui_intelligentUi_read_parameter_0$schema = () => dsh_intelligent_ui_intelligentUi_read_parameter_0$schema$value ??= object({
			"sessionId": string().readonly(),
			"turn": number().readonly(),
			"messageId": string().readonly(),
			"sourceSeq": number().readonly(),
			"sourceHash": string().readonly()
		});
		let dsh_intelligent_ui_intelligentUi_read_result$schema$value;
		const dsh_intelligent_ui_intelligentUi_read_result$schema = () => dsh_intelligent_ui_intelligentUi_read_result$schema$value ??= union([
			object({ "status": literal("absent").readonly() }),
			object({ "status": literal("pending").readonly() }),
			object({
				"status": literal("skipped").readonly(),
				"reason": union([
					literal("not-structured"),
					literal("too-large"),
					literal("no-route"),
					literal("busy"),
					literal("model-skip"),
					literal("off")
				]).readonly()
			}),
			object({
				"status": literal("failed").readonly(),
				"reason": union([
					literal("model-error"),
					literal("timeout"),
					literal("truncated"),
					literal("invalid-output"),
					literal("storage")
				]).readonly(),
				"retryable": boolean().readonly()
			}),
			object({
				"status": literal("ready").readonly(),
				"view": object({ "items": array(union([
					object({
						"type": literal("markdown").readonly(),
						"markdown": string().readonly()
					}),
					object({
						"type": literal("cards").readonly(),
						"cards": array(object({
							"title": string().readonly(),
							"markdown": string().readonly()
						})).readonly()
					}),
					object({
						"type": literal("table").readonly(),
						"table": object({
							"headers": array(string()).readonly(),
							"align": array(union([
								literal("left"),
								literal("center"),
								literal("right"),
								literal("none")
							])).readonly(),
							"rows": array(array(string())).readonly()
						}).readonly(),
						"presentation": union([_undefined(), literal("comparison")]).readonly().optional()
					}),
					object({
						"type": literal("chart").readonly(),
						"chart": union([literal("bar"), literal("line")]).readonly(),
						"xLabel": string().readonly(),
						"unit": string().readonly(),
						"categories": array(string()).readonly(),
						"series": array(object({
							"name": string().readonly(),
							"values": array(union([literal(null), number()])).readonly()
						})).readonly(),
						"table": object({
							"headers": array(string()).readonly(),
							"align": array(union([
								literal("left"),
								literal("center"),
								literal("right"),
								literal("none")
							])).readonly(),
							"rows": array(array(string())).readonly()
						}).readonly()
					}),
					object({
						"type": literal("scenarios").readonly(),
						"label": string().readonly(),
						"options": array(object({
							"name": string().readonly(),
							"items": array(union([
								object({
									"type": literal("markdown").readonly(),
									"markdown": string().readonly()
								}),
								object({
									"type": literal("cards").readonly(),
									"cards": array(object({
										"title": string().readonly(),
										"markdown": string().readonly()
									})).readonly()
								}),
								object({
									"type": literal("table").readonly(),
									"table": object({
										"headers": array(string()).readonly(),
										"align": array(union([
											literal("left"),
											literal("center"),
											literal("right"),
											literal("none")
										])).readonly(),
										"rows": array(array(string())).readonly()
									}).readonly(),
									"presentation": union([_undefined(), literal("comparison")]).readonly().optional()
								}),
								object({
									"type": literal("chart").readonly(),
									"chart": union([literal("bar"), literal("line")]).readonly(),
									"xLabel": string().readonly(),
									"unit": string().readonly(),
									"categories": array(string()).readonly(),
									"series": array(object({
										"name": string().readonly(),
										"values": array(union([literal(null), number()])).readonly()
									})).readonly(),
									"table": object({
										"headers": array(string()).readonly(),
										"align": array(union([
											literal("left"),
											literal("center"),
											literal("right"),
											literal("none")
										])).readonly(),
										"rows": array(array(string())).readonly()
									}).readonly()
								})
							])).readonly()
						})).readonly()
					})
				])).readonly() }).readonly(),
				"usage": object({
					"inputTokens": union([_undefined(), number()]).readonly().optional(),
					"outputTokens": union([_undefined(), number()]).readonly().optional(),
					"durationMs": number().readonly()
				}).readonly()
			})
		]);
		let dsh_intelligent_ui_intelligentUi_retry_parameter_0$schema$value;
		const dsh_intelligent_ui_intelligentUi_retry_parameter_0$schema = () => dsh_intelligent_ui_intelligentUi_retry_parameter_0$schema$value ??= object({
			"sessionId": string().readonly(),
			"turn": number().readonly(),
			"messageId": string().readonly(),
			"sourceSeq": number().readonly(),
			"sourceHash": string().readonly()
		});
		let dsh_intelligent_ui_intelligentUi_retry_result$schema$value;
		const dsh_intelligent_ui_intelligentUi_retry_result$schema = () => dsh_intelligent_ui_intelligentUi_retry_result$schema$value ??= union([
			object({ "status": literal("absent").readonly() }),
			object({ "status": literal("pending").readonly() }),
			object({
				"status": literal("skipped").readonly(),
				"reason": union([
					literal("not-structured"),
					literal("too-large"),
					literal("no-route"),
					literal("busy"),
					literal("model-skip"),
					literal("off")
				]).readonly()
			}),
			object({
				"status": literal("failed").readonly(),
				"reason": union([
					literal("model-error"),
					literal("timeout"),
					literal("truncated"),
					literal("invalid-output"),
					literal("storage")
				]).readonly(),
				"retryable": boolean().readonly()
			}),
			object({
				"status": literal("ready").readonly(),
				"view": object({ "items": array(union([
					object({
						"type": literal("markdown").readonly(),
						"markdown": string().readonly()
					}),
					object({
						"type": literal("cards").readonly(),
						"cards": array(object({
							"title": string().readonly(),
							"markdown": string().readonly()
						})).readonly()
					}),
					object({
						"type": literal("table").readonly(),
						"table": object({
							"headers": array(string()).readonly(),
							"align": array(union([
								literal("left"),
								literal("center"),
								literal("right"),
								literal("none")
							])).readonly(),
							"rows": array(array(string())).readonly()
						}).readonly(),
						"presentation": union([_undefined(), literal("comparison")]).readonly().optional()
					}),
					object({
						"type": literal("chart").readonly(),
						"chart": union([literal("bar"), literal("line")]).readonly(),
						"xLabel": string().readonly(),
						"unit": string().readonly(),
						"categories": array(string()).readonly(),
						"series": array(object({
							"name": string().readonly(),
							"values": array(union([literal(null), number()])).readonly()
						})).readonly(),
						"table": object({
							"headers": array(string()).readonly(),
							"align": array(union([
								literal("left"),
								literal("center"),
								literal("right"),
								literal("none")
							])).readonly(),
							"rows": array(array(string())).readonly()
						}).readonly()
					}),
					object({
						"type": literal("scenarios").readonly(),
						"label": string().readonly(),
						"options": array(object({
							"name": string().readonly(),
							"items": array(union([
								object({
									"type": literal("markdown").readonly(),
									"markdown": string().readonly()
								}),
								object({
									"type": literal("cards").readonly(),
									"cards": array(object({
										"title": string().readonly(),
										"markdown": string().readonly()
									})).readonly()
								}),
								object({
									"type": literal("table").readonly(),
									"table": object({
										"headers": array(string()).readonly(),
										"align": array(union([
											literal("left"),
											literal("center"),
											literal("right"),
											literal("none")
										])).readonly(),
										"rows": array(array(string())).readonly()
									}).readonly(),
									"presentation": union([_undefined(), literal("comparison")]).readonly().optional()
								}),
								object({
									"type": literal("chart").readonly(),
									"chart": union([literal("bar"), literal("line")]).readonly(),
									"xLabel": string().readonly(),
									"unit": string().readonly(),
									"categories": array(string()).readonly(),
									"series": array(object({
										"name": string().readonly(),
										"values": array(union([literal(null), number()])).readonly()
									})).readonly(),
									"table": object({
										"headers": array(string()).readonly(),
										"align": array(union([
											literal("left"),
											literal("center"),
											literal("right"),
											literal("none")
										])).readonly(),
										"rows": array(array(string())).readonly()
									}).readonly()
								})
							])).readonly()
						})).readonly()
					})
				])).readonly() }).readonly(),
				"usage": object({
					"inputTokens": union([_undefined(), number()]).readonly().optional(),
					"outputTokens": union([_undefined(), number()]).readonly().optional(),
					"durationMs": number().readonly()
				}).readonly()
			})
		]);
		const TYPERT_REMOTE = {
			package: "dsh-intelligent-ui",
			descriptors: [{
				id: "dsh-intelligent-ui#intelligentUi/read",
				service: "intelligentUi",
				namespace: "intelligentUi",
				method: "read",
				invocation: { kind: "direct" },
				parameters: [{
					name: "request",
					wire: "request",
					source: "json",
					codec: {
						mode: "strict",
						typeSymbol: "dsh-intelligent-ui/types#IntelligentUiSourceRef",
						create: dsh_intelligent_ui_intelligentUi_read_parameter_0$schema
					}
				}],
				result: {
					mode: "strict",
					typeSymbol: "dsh-intelligent-ui/types#IntelligentUiReadResult",
					create: dsh_intelligent_ui_intelligentUi_read_result$schema
				},
				sourceLocation: {
					"file": "packages/dsh-intelligent-ui/src/index.ts",
					"line": 182,
					"column": 3
				}
			}, {
				id: "dsh-intelligent-ui#intelligentUi/retry",
				service: "intelligentUi",
				namespace: "intelligentUi",
				method: "retry",
				invocation: { kind: "direct" },
				parameters: [{
					name: "request",
					wire: "request",
					source: "json",
					codec: {
						mode: "strict",
						typeSymbol: "dsh-intelligent-ui/types#IntelligentUiSourceRef",
						create: dsh_intelligent_ui_intelligentUi_retry_parameter_0$schema
					}
				}],
				result: {
					mode: "strict",
					typeSymbol: "dsh-intelligent-ui/types#IntelligentUiReadResult",
					create: dsh_intelligent_ui_intelligentUi_retry_result$schema
				},
				sourceLocation: {
					"file": "packages/dsh-intelligent-ui/src/index.ts",
					"line": 193,
					"column": 3
				}
			}]
		};
		//#endregion
		//#region src/shared/source.ts
		/**
		* The one source-identity rule Host and Client share: which blocks of a final
		* answer form its Markdown, and how that text hashes. Pure, environment-free.
		*/
		/**
		* Join the visible text blocks of one answer, in order. Reasoning, tool calls,
		* images, and unknown blocks never enter the source.
		* @param blocks - the answer's blocks; Host maps `type` to `kind` first.
		* @returns the answer Markdown.
		*/
		function sourceMarkdown(blocks) {
			return blocks.filter((block) => block.kind === "text" && typeof block.text === "string").map((block) => block.text).join("\n\n");
		}
		/**
		* Hash one answer text with two independent 32-bit FNV-1a lanes over UTF-16
		* code units plus the length. Identity binding only, not a security hash.
		* @param text - answer Markdown from {@link sourceMarkdown}.
		* @returns a short lowercase hex identity.
		*/
		function hashSource(text) {
			let a = 2166136261;
			let b = 1523705862;
			for (let index = 0; index < text.length; index++) {
				const code = text.charCodeAt(index);
				a = Math.imul(a ^ code, 16777619);
				b = Math.imul(b ^ code, 1540483477) ^ b >>> 15;
			}
			const hex = (value) => (value >>> 0).toString(16).padStart(8, "0");
			return `${hex(a)}${hex(b)}${text.length.toString(16)}`;
		}
		/**
		* The idempotency key of one enhancement, path-safe for per-record storage.
		* @param ref - exact source identity.
		* @returns `[a-z0-9]` key bound to every identity field and the schema version.
		*/
		function enhancementKey(ref) {
			return `k${hashSource(JSON.stringify([
				ref.sessionId,
				ref.turn,
				ref.messageId,
				ref.sourceSeq,
				ref.sourceHash,
				1
			]))}`;
		}
		//#endregion
		//#region src/client/reader.ts
		const POLL_MS = 800;
		/** Host deadline plus grace: a `pending` older than this stops being polled. */
		const POLL_WINDOW_MS = 3e4;
		/** Transport failures tolerated (e.g. right after page load) before giving up. */
		const MAX_TRANSPORT_FAILURES = 5;
		/** Shared state store keyed by enhancement identity. */
		var EnhancementReader = class {
			remote;
			entries = /* @__PURE__ */ new Map();
			disposed = false;
			constructor(remote) {
				this.remote = remote;
			}
			/**
			* Subscribe to one identity, starting a read on first interest.
			* @param ref - exact source identity.
			* @param listener - called on every state change.
			* @returns unsubscribe; the last one stops polling.
			*/
			subscribe(ref, listener) {
				const key = enhancementKey(ref);
				let entry = this.entries.get(key);
				if (entry === void 0) {
					entry = {
						state: void 0,
						listeners: /* @__PURE__ */ new Set(),
						timer: void 0,
						deadline: Date.now() + POLL_WINDOW_MS,
						failures: 0,
						inFlight: false
					};
					this.entries.set(key, entry);
				}
				entry.listeners.add(listener);
				if (entry.state === void 0 || entry.state.status === "pending" && entry.timer === void 0) this.poll(key, ref, entry, 0);
				const current = entry;
				return () => {
					current.listeners.delete(listener);
					if (current.listeners.size > 0) return;
					clearTimeout(current.timer);
					current.timer = void 0;
				};
			}
			/** Current state of one identity, `undefined` before the first answer. */
			snapshot(ref) {
				return this.entries.get(enhancementKey(ref))?.state;
			}
			/**
			* Ask the Host for one new attempt of a failed enhancement.
			* @param ref - exact source identity.
			*/
			async retry(ref) {
				const key = enhancementKey(ref);
				const entry = this.entries.get(key);
				if (entry === void 0 || entry.state?.status !== "failed") return;
				const result = await this.remote.retry(ref).catch(() => void 0);
				if (this.disposed || result === void 0) return;
				entry.deadline = Date.now() + POLL_WINDOW_MS;
				this.update(entry, result);
				if (result.status === "pending") this.poll(key, ref, entry, POLL_MS);
			}
			/** Stop every timer; later results are dropped. */
			dispose() {
				this.disposed = true;
				for (const entry of this.entries.values()) clearTimeout(entry.timer);
				this.entries.clear();
			}
			poll(key, ref, entry, delay) {
				clearTimeout(entry.timer);
				entry.timer = setTimeout(() => {
					entry.timer = void 0;
					if (this.disposed || entry.listeners.size === 0 || entry.inFlight) return;
					entry.inFlight = true;
					this.remote.read(ref).catch(() => void 0).then((result) => {
						entry.inFlight = false;
						if (this.disposed || this.entries.get(key) !== entry) return;
						if (result === void 0) {
							entry.failures++;
							if (entry.failures >= MAX_TRANSPORT_FAILURES || Date.now() > entry.deadline) this.update(entry, { status: "unavailable" });
							else this.poll(key, ref, entry, POLL_MS * entry.failures);
							return;
						}
						entry.failures = 0;
						if (result.status === "pending" && Date.now() > entry.deadline) {
							this.update(entry, { status: "unavailable" });
							return;
						}
						this.update(entry, result);
						if (result.status === "pending") this.poll(key, ref, entry, POLL_MS);
					});
				}, delay);
			}
			update(entry, state) {
				entry.state = state;
				for (const listener of [...entry.listeners]) listener();
			}
		};
		//#endregion
		//#region src/numeric.ts
		/** Explicit empty markers; they become gaps, never zero. */
		const MISSING = /* @__PURE__ */ new Set([
			"",
			"-",
			"--",
			"—",
			"–",
			"n/a",
			"na",
			"null",
			"none",
			"/",
			"?",
			"？",
			"无",
			"暂无",
			"缺失",
			"未知",
			"未公布"
		]);
		const NUMBER = /^(?<pre>[$¥￥€£]?)(?<sign>[+\-−]?)(?<pre2>[$¥￥€£]?)(?<int>\d{1,3}(?:,\d{3})+|\d+)(?<frac>\.\d+)?\s?(?<suf>[%‰°A-Za-zµ一-鿿/]{1,8})?$/u;
		/** Significant digits a double represents exactly enough for display parity. */
		const SAFE_DIGITS = 15;
		/**
		* Classify one cell.
		* @param raw - cell text as shown in the answer.
		* @returns missing, a number with its unit, or text (including unsafe precision).
		*/
		function parseCell(raw) {
			const text = raw.trim();
			if (MISSING.has(text.toLowerCase())) return { kind: "missing" };
			const groups = NUMBER.exec(text)?.groups;
			if (groups === void 0) return { kind: "text" };
			const prefix = groups.pre ?? "";
			const prefix2 = groups.pre2 ?? "";
			if (prefix !== "" && prefix2 !== "") return { kind: "text" };
			const integer = (groups.int ?? "").replaceAll(",", "");
			const fraction = groups.frac ?? "";
			if (`${integer}${fraction.slice(1)}`.replace(/^0+/, "").length > SAFE_DIGITS) return { kind: "text" };
			const negative = groups.sign === "-" || groups.sign === "−";
			const value = Number(`${negative ? "-" : ""}${integer}${fraction}`);
			if (!Number.isFinite(value)) return { kind: "text" };
			return {
				kind: "number",
				value,
				unit: `${prefix}${prefix2}|${groups.suf ?? ""}`
			};
		}
		const MONTH_NAMES = [
			"january",
			"february",
			"march",
			"april",
			"may",
			"june",
			"july",
			"august",
			"september",
			"october",
			"november",
			"december"
		];
		const CN_QUARTER = {
			一: 1,
			二: 2,
			三: 3,
			四: 4
		};
		/** Recognized axis label shapes; each maps a label to its position on one scale. */
		const AXIS_FORMATS = [
			[
				"day",
				/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/,
				(m) => date(m[1], m[2], m[3])
			],
			[
				"day",
				/^(\d{4})年(\d{1,2})月(\d{1,2})日$/,
				(m) => date(m[1], m[2], m[3])
			],
			[
				"month",
				/^(\d{4})[-/.](\d{1,2})$/,
				(m) => date(m[1], m[2])
			],
			[
				"month",
				/^(\d{4})年(\d{1,2})月$/,
				(m) => date(m[1], m[2])
			],
			[
				"quarter",
				/^(\d{4})年?\s*[-/ ]?\s*Q([1-4])$/i,
				(m) => Number(m[1]) * 4 + Number(m[2])
			],
			[
				"quarter",
				/^(\d{4})年?第?([1-4一二三四])季度$/,
				(m) => Number(m[1]) * 4 + (CN_QUARTER[m[2] ?? ""] ?? Number(m[2]))
			],
			[
				"q",
				/^Q([1-4])$/i,
				(m) => Number(m[1])
			],
			[
				"q",
				/^第([1-4一二三四])季度$/,
				(m) => CN_QUARTER[m[1] ?? ""] ?? Number(m[1])
			],
			[
				"m",
				/^(\d{1,2})月$/,
				(m) => date("0", m[1])
			],
			[
				"year",
				/^(\d{4})年?$/,
				(m) => Number(m[1])
			]
		];
		function date(year = "", month = "", day = "1") {
			const [y, mo, d] = [
				Number(year),
				Number(month),
				Number(day)
			];
			return mo >= 1 && mo <= 12 && d >= 1 && d <= 31 ? (y * 12 + mo) * 32 + d : null;
		}
		/** One label's scale and position, or null when it is not a recognized time/sequence label. */
		function axisKey(raw) {
			const text = raw.trim();
			for (const [scale, pattern, key] of AXIS_FORMATS) {
				const match = pattern.exec(text);
				if (match !== null) {
					const value = key(match);
					return value === null ? null : {
						scale,
						key: value
					};
				}
			}
			const name = text.toLowerCase().replace(/\.$/, "");
			const month = name.length >= 3 ? MONTH_NAMES.findIndex((full) => full.startsWith(name)) : -1;
			if (month >= 0) return {
				scale: "m",
				key: month + 1
			};
			const nth = /^第\s*(\d+)\s*(年|个?月|周|天|期)$/.exec(text);
			if (nth !== null) return {
				scale: `nth${nth[2]}`,
				key: Number(nth[1])
			};
			const cell = parseCell(text);
			return cell.kind === "number" ? {
				scale: `number${cell.unit}`,
				key: cell.value
			} : null;
		}
		/**
		* Whether labels read as one time/sequence axis in the given row order. Rows
		* are never reordered: a shuffled, repeated, or mixed-format axis is not ordered.
		* @param cells - the column's cell texts, in row order.
		* @returns true only for at least two labels on one scale, strictly increasing.
		*/
		function isOrderedAxis(cells) {
			const keys = cells.map(axisKey);
			return keys.length >= 2 && keys.every((entry, index) => {
				const previous = index === 0 ? null : keys[index - 1];
				return entry !== null && (previous == null || previous.scale === entry.scale && previous.key < entry.key);
			});
		}
		/**
		* Analyze one column's cells.
		* @param cells - the column's cell texts, in row order.
		* @returns plottability and axis suitability.
		*/
		function analyzeColumn(cells) {
			const parsed = cells.map(parseCell);
			const categorical = cells.length > 0 && parsed.every((cell) => cell.kind !== "missing");
			const numbers = parsed.filter((cell) => cell.kind === "number");
			const units = new Set(numbers.map((cell) => cell.unit));
			return {
				numeric: numbers.length >= 2 && units.size === 1 && parsed.every((cell) => cell.kind !== "text") ? {
					unit: numbers[0]?.unit ?? "|",
					values: parsed.map((cell) => cell.kind === "number" ? cell.value : null)
				} : null,
				categorical,
				ordered: categorical && isOrderedAxis(cells)
			};
		}
		/**
		* Human-readable unit from an internal `prefix|suffix` key.
		* @param unit - internal unit key.
		* @returns the symbol to show beside axis values, or ''.
		*/
		function displayUnit(unit) {
			const [prefix = "", suffix = ""] = unit.split("|");
			return `${prefix}${suffix}`;
		}
		function niceStep(span) {
			const raw = span / 5;
			const power = 10 ** Math.floor(Math.log10(raw));
			const unit = raw / power;
			return (unit <= 1 ? 1 : unit <= 2 ? 2 : unit <= 5 ? 5 : 10) * power;
		}
		/**
		* Value axis of a chart. Bars always include zero so bar length stays
		* proportional. A line zooms to its data only when every value sits on one
		* side of zero and their spread is under a third of the largest magnitude
		* (e.g. 95→100), where a zero baseline would flatten the trend; every tick
		* stays labeled so the non-zero start is visible.
		* @param values - visible, non-missing values.
		* @param chart - chart kind.
		* @returns a finite axis with a bounded tick list.
		*/
		function valueAxis(values, chart) {
			const finite = values.filter(Number.isFinite);
			let low = finite.length === 0 ? 0 : Math.min(...finite);
			let high = finite.length === 0 ? 0 : Math.max(...finite);
			const magnitude = Math.max(Math.abs(low), Math.abs(high));
			const positive = low > 0;
			const zoom = chart === "line" && (positive || high < 0) && (high - low) * 3 < magnitude;
			if (zoom) {
				const pad = high > low ? (high - low) * .1 : magnitude * .05;
				low -= pad;
				high += pad;
			} else {
				low = Math.min(0, low);
				high = Math.max(0, high);
			}
			if (low === high) high = low + 1;
			const step = niceStep(high - low);
			let min = Math.floor(low / step) * step;
			let max = Math.ceil(high / step) * step;
			if (zoom && positive) min = Math.max(0, min);
			else if (zoom) max = Math.min(0, max);
			const ticks = [];
			for (let tick = min; tick <= max + step / 2; tick += step) ticks.push(Number(tick.toPrecision(12)));
			return {
				min,
				max,
				ticks,
				zeroBased: min <= 0 && max >= 0
			};
		}
		//#endregion
		//#region src/limits.ts
		/**
		* Initial resource guards of this plugin (not DSH or model limits). They stay
		* fixed protocol constants until a directed validation shows a problem.
		*/
		const LIMITS = {
			/** Answer Markdown accepted for an enhancement, in UTF-8 bytes. */
			inputBytes: 32768,
			/** Model output accepted as a program, in UTF-8 bytes. */
			programBytes: 16384,
			/** `inline-stream` tool arguments accepted as a view, in UTF-8 bytes. */
			inlineArgsBytes: 65536,
			/** Output-token cap of the one auxiliary call. */
			outputTokens: 2048,
			/** End-to-end deadline of the auxiliary call. */
			deadlineMs: 2e4,
			/** Business items per view. */
			items: 8,
			/** Cards per card group. */
			cards: 12,
			/** Referenced blocks per Markdown item or card. */
			blocksPerItem: 12,
			tableRows: 200,
			tableColumns: 12,
			chartSeries: 4,
			/** Options of one `inline-stream` scenarios item, and components per option. */
			scenarioOptions: 4,
			scenarioItems: 3,
			/** Concurrent auxiliary calls across all sessions. */
			concurrency: 2,
			/** In-memory pending/skipped/failed entries kept for reads and retries. */
			memoryEntries: 256
		};
		//#endregion
		//#region src/program.ts
		/**
		* The one UI program format: a strict JSON object that only selects source
		* ids and display enums. Validation rejects the whole program on any defect;
		* resolution then copies text and data from the source index, never from the
		* model.
		*/
		const blockId = string().regex(/^b\d{1,4}(?:i\d{1,4})?$/);
		const tableId = string().regex(/^t\d{1,3}$/);
		const columnId = string().regex(/^c\d{1,2}$/);
		const blockList = array(blockId).min(1).max(LIMITS.blocksPerItem);
		const programItem = discriminatedUnion("type", [
			strictObject({
				type: literal("markdown"),
				blocks: blockList
			}),
			strictObject({
				type: literal("cards"),
				cards: array(strictObject({ source: blockList })).min(2).max(LIMITS.cards)
			}),
			strictObject({
				type: literal("table"),
				table: tableId,
				presentation: literal("comparison").optional()
			}),
			strictObject({
				type: literal("chart"),
				table: tableId,
				chart: _enum(["bar", "line"]),
				x: columnId,
				series: array(columnId).min(1).max(LIMITS.chartSeries)
			})
		]);
		strictObject({
			version: literal(1),
			items: array(programItem).min(1).max(LIMITS.items)
		});
		/** A program referenced something the bound answer does not offer. */
		var BindingError = class extends Error {};
		function distinct(ids, what) {
			if (new Set(ids).size !== ids.length) throw new BindingError(`duplicate ${what}`);
		}
		/** Bind a table without rewriting cells; comparison cards need 2–4 distinct option names in column 0. */
		function bindTable(data, presentation) {
			if (presentation === void 0) return {
				type: "table",
				table: data
			};
			const names = data.rows.map((row) => row[0]?.trim() ?? "");
			if (data.headers.length < 2 || names.length < 2 || names.length > 4 || names.some((name) => name === "") || new Set(names).size !== names.length) throw new BindingError("comparison needs 2-4 distinct named options in column 0");
			return {
				type: "table",
				table: data,
				presentation
			};
		}
		/**
		* Bind a chart to verified table columns; every plotted value is parsed from
		* the table's own cell text, so the chart and its "view data" table agree.
		* @param source - table data with analyzed columns.
		* @param item - chart kind, category column id, and series column ids.
		* @returns the resolved chart item.
		* @throws {@link BindingError} when a column cannot serve its role.
		*/
		function bindChart(source, item) {
			distinct([item.x, ...item.series], "chart column");
			const x = source.columns.find((column) => column.id === item.x);
			if (x === void 0 || !x.analysis.categorical) throw new BindingError(`column ${item.x} is not a category axis`);
			if (item.chart === "line" && !x.analysis.ordered) throw new BindingError(`column ${item.x} is not an ordered time/sequence axis`);
			const series = item.series.map((id) => {
				const column = source.columns.find((candidate) => candidate.id === id);
				if (column?.analysis.numeric == null) throw new BindingError(`column ${id} is not a same-unit numeric column`);
				return {
					name: column.header,
					numeric: column.analysis.numeric
				};
			});
			if (new Set(series.map((entry) => entry.numeric.unit)).size !== 1) throw new BindingError("chart series mix units");
			if (source.data.rows.length < 2) throw new BindingError("chart needs at least two points");
			return {
				type: "chart",
				chart: item.chart,
				xLabel: x.header,
				unit: displayUnit(series[0]?.numeric.unit ?? "|"),
				categories: source.data.rows.map((row) => row[Number(item.x.slice(1))] ?? ""),
				series: series.map((entry) => ({
					name: entry.name,
					values: entry.numeric.values
				})),
				table: source.data
			};
		}
		//#endregion
		//#region src/inline.ts
		/**
		* `inline-stream` mode: the root agent's own model writes view data as the
		* arguments of one native tool call. Host and Client share this module, so
		* the streamed preview, the settled view, and the Host's tool result apply the
		* exact same rules. Client-safe: no Host imports.
		*/
		/** Wire name of the view tool; also the Client toolview key. */
		const INLINE_TOOL_NAME = "render_ui";
		const ALIGN = [
			"left",
			"center",
			"right",
			"none"
		];
		const cell = union([string(), number().refine(Number.isFinite)]).transform(String);
		const headers = array(string().min(1)).min(2).max(LIMITS.tableColumns);
		const rows = array(array(cell).max(LIMITS.tableColumns)).max(LIMITS.tableRows);
		const markdown = string().min(1);
		const itemSchema = discriminatedUnion("type", [
			strictObject({
				type: literal("markdown"),
				markdown
			}),
			strictObject({
				type: literal("cards"),
				cards: array(strictObject({
					title: string().min(1).max(120),
					markdown
				})).min(2).max(LIMITS.cards)
			}),
			strictObject({
				type: literal("table"),
				headers,
				rows: rows.min(1),
				align: array(_enum(ALIGN)).max(LIMITS.tableColumns).optional(),
				presentation: literal("comparison").optional()
			}),
			strictObject({
				type: literal("chart"),
				chart: _enum(["bar", "line"]),
				headers,
				rows: rows.min(2),
				x: number().int().nonnegative().default(0),
				series: array(number().int().nonnegative()).min(1).max(LIMITS.chartSeries)
			})
		]);
		`${LIMITS.items}${LIMITS.cards}${LIMITS.scenarioItems}${LIMITS.scenarioOptions}`;
		const scenariosSchema = strictObject({
			type: literal("scenarios"),
			label: string().min(1).max(60),
			options: array(strictObject({
				name: string().min(1).max(40),
				items: array(unknown()).min(1).max(LIMITS.scenarioItems)
			})).min(2).max(LIMITS.scenarioOptions)
		});
		/** Raw HTML, images, and script-capable link schemes never reach the renderer. */
		const UNSAFE_MARKDOWN = [
			/<[A-Za-z!/?]/,
			/!\[/,
			/\]\(\s*<?\s*(?:javascript|vbscript|data):/i
		];
		const UNSAFE = "HTML, image, or script content is not allowed";
		const CODE = /(?<!\\)(`+)[\s\S]*?[^`]\1(?!`)/g;
		const unsafe = (text) => {
			const prose = text.replace(CODE, "");
			return UNSAFE_MARKDOWN.some((pattern) => pattern.test(prose));
		};
		function unsafeText(item) {
			return (item.type === "markdown" ? [item.markdown] : item.type === "cards" ? item.cards.flatMap((card) => [card.title, card.markdown]) : [...item.headers, ...item.rows.flat()]).some(unsafe);
		}
		function consistent(width, data, what) {
			const bad = data.findIndex((row) => row.length !== width);
			if (bad >= 0) throw new BindingError(`${what} row ${bad} has ${data[bad]?.length} cells for ${width} headers`);
		}
		function inferType(item) {
			return [
				"chart",
				"markdown",
				"cards"
			].find((key) => key in item) ?? ("rows" in item ? "table" : "options" in item ? "scenarios" : void 0);
		}
		const withType = (value) => typeof value === "object" && value !== null && !("type" in value) ? {
			type: inferType(value),
			...value
		} : value;
		/** As in smart-auto, a table repeating a chart's own data stays reachable through the chart's data toggle. */
		function dropChartedTables(items) {
			const tableKey = (table) => JSON.stringify([table.headers, table.rows]);
			const charted = new Set(items.flatMap((item) => item.type === "chart" ? [tableKey(item.table)] : []));
			return items.filter((item) => item.type !== "table" || !charted.has(tableKey(item.table)));
		}
		/**
		* Validate and resolve one component written by the model.
		* @param value - one parsed element of the `items` array.
		* @returns the resolved item or a rejection; a rejection never renders.
		*/
		function resolveInlineItem(value) {
			const typed = withType(value);
			if (typeof typed !== "object" || typed === null || !("type" in typed) || typed.type !== "scenarios") return resolveBasicItem(typed);
			const parsed = scenariosSchema.safeParse(typed);
			if (!parsed.success) return {
				ok: false,
				detail: `schema: ${parsed.error.issues[0]?.message ?? "rejected"}`
			};
			const { label, options } = parsed.data;
			const names = options.map((option) => option.name);
			if ([label, ...names].some(unsafe)) return {
				ok: false,
				detail: UNSAFE
			};
			if (new Set(names).size !== names.length) return {
				ok: false,
				detail: "scenario option names must differ"
			};
			const resolved = [];
			for (const [index, option] of options.entries()) {
				const items = [];
				for (const [at, raw] of option.items.entries()) {
					const outcome = resolveBasicItem(withType(raw));
					if (!outcome.ok) return {
						ok: false,
						detail: `option ${index} item ${at}: ${outcome.detail}`
					};
					items.push(outcome.item);
				}
				resolved.push({
					name: option.name,
					items: dropChartedTables(items)
				});
			}
			return {
				ok: true,
				item: {
					type: "scenarios",
					label,
					options: resolved
				}
			};
		}
		function resolveBasicItem(typed) {
			const parsed = itemSchema.safeParse(typed);
			if (!parsed.success) return {
				ok: false,
				detail: `schema: ${parsed.error.issues[0]?.message ?? "rejected"}`
			};
			const item = parsed.data;
			if (unsafeText(item)) return {
				ok: false,
				detail: UNSAFE
			};
			try {
				switch (item.type) {
					case "markdown": return {
						ok: true,
						item
					};
					case "cards": return {
						ok: true,
						item: {
							type: "cards",
							cards: item.cards
						}
					};
					case "table": {
						consistent(item.headers.length, item.rows, "table");
						const align = item.align ?? item.headers.map(() => "none");
						if (align.length !== item.headers.length) throw new BindingError("table align does not match headers");
						return {
							ok: true,
							item: bindTable({
								headers: item.headers,
								align,
								rows: item.rows
							}, item.presentation)
						};
					}
					case "chart":
						consistent(item.headers.length, item.rows, "chart");
						return {
							ok: true,
							item: bindChart({
								data: {
									headers: item.headers,
									align: item.headers.map(() => "none"),
									rows: item.rows
								},
								columns: item.headers.map((header, index) => ({
									id: `c${index}`,
									header,
									analysis: analyzeColumn(item.rows.map((row) => row[index] ?? ""))
								}))
							}, {
								chart: item.chart,
								x: `c${item.x}`,
								series: item.series.map((index) => `c${index}`)
							})
						};
				}
			} catch (error) {
				if (error instanceof BindingError) return {
					ok: false,
					detail: error.message
				};
				throw error;
			}
		}
		const OVER_LIMIT = `arguments exceed ${LIMITS.inlineArgsBytes} bytes`;
		const overLimit = (text) => new TextEncoder().encode(text).length > LIMITS.inlineArgsBytes;
		/**
		* Validate complete tool arguments, as the Host executes them and as the
		* Client re-reads a settled call.
		* @param args - parsed tool arguments.
		* @returns all resolved items, or the first rejection.
		*/
		function validateInlineArgs(args) {
			if (overLimit(JSON.stringify(args) ?? "")) return {
				ok: false,
				detail: OVER_LIMIT
			};
			const top = strictObject({ items: array(unknown()).min(1).max(LIMITS.items) }).safeParse(args);
			if (!top.success) return {
				ok: false,
				detail: `schema: ${top.error.issues[0]?.message ?? "rejected"}`
			};
			const items = [];
			for (const [index, value] of top.data.items.entries()) {
				const outcome = resolveInlineItem(value);
				if (!outcome.ok) return {
					ok: false,
					detail: `item ${index}: ${outcome.detail}`
				};
				items.push(outcome.item);
			}
			if (items[0]?.type !== "markdown") return {
				ok: false,
				detail: "start with a markdown conclusion"
			};
			if (items.every((item) => item.type === "markdown")) return {
				ok: false,
				detail: "add at least one table, chart, or cards item"
			};
			return {
				ok: true,
				items: dropChartedTables(items)
			};
		}
		/**
		* Parse settled raw arguments text.
		* @param raw - the recorded call arguments.
		* @returns the validated items or a rejection.
		*/
		function readInlineArgs(raw) {
			if (overLimit(raw)) return {
				ok: false,
				detail: OVER_LIMIT
			};
			let value;
			try {
				value = JSON.parse(raw);
			} catch {
				return {
					ok: false,
					detail: "arguments are not one JSON value"
				};
			}
			return validateInlineArgs(value);
		}
		/**
		* Incremental scanner over the raw argument prefix of a preparing call. It
		* resumes where it stopped, cuts out each element of the top-level `items`
		* array once its closing bracket arrives, and validates that element alone.
		* Open elements are never parsed or shown.
		*/
		var InlineArgsStream = class {
			pos = 0;
			depth = 0;
			inString = false;
			escape = false;
			/** Inside the top-level object, the next string is a key. */
			expectKey = false;
			keyStart = -1;
			lastKey = "";
			itemsDepth = -1;
			elementStart = -1;
			closed = false;
			overLimit = false;
			items = [];
			snapshot = {
				items: [],
				closed: false,
				overLimit: false
			};
			source = "";
			/**
			* Advance over a longer prefix of the same arguments text.
			* @param raw - the current raw argument prefix.
			* @returns an identity-stable snapshot that changes only when it gains content.
			*/
			feed(raw) {
				if (!raw.startsWith(this.source)) this.reset();
				this.source = raw;
				const before = this.items.length;
				const wasClosed = this.closed;
				const wasOver = this.overLimit;
				if (overLimit(raw)) this.overLimit = true;
				for (; this.pos < raw.length && !this.closed && !this.overLimit; this.pos++) this.step(raw, this.pos);
				if (this.items.length !== before || this.closed !== wasClosed || this.overLimit !== wasOver) this.snapshot = {
					items: [...this.items],
					closed: this.closed,
					overLimit: this.overLimit
				};
				return this.snapshot;
			}
			reset() {
				Object.assign(this, {
					pos: 0,
					depth: 0,
					inString: false,
					escape: false,
					expectKey: false,
					keyStart: -1,
					lastKey: "",
					itemsDepth: -1,
					elementStart: -1,
					closed: false,
					overLimit: false,
					items: [],
					source: "",
					snapshot: {
						items: [],
						closed: false,
						overLimit: false
					}
				});
			}
			step(raw, index) {
				const char = raw[index];
				if (this.inString) {
					if (this.escape) this.escape = false;
					else if (char === "\\") this.escape = true;
					else if (char === "\"") {
						this.inString = false;
						if (this.keyStart >= 0) {
							this.lastKey = raw.slice(this.keyStart, index);
							this.keyStart = -1;
						}
					}
					return;
				}
				const inItems = this.itemsDepth >= 0 && this.depth === this.itemsDepth;
				if (inItems && this.elementStart < 0 && char !== void 0 && !/[\s,\]]/.test(char)) this.elementStart = index;
				switch (char) {
					case "\"":
						this.inString = true;
						if (this.depth === 1 && this.expectKey) {
							this.keyStart = index + 1;
							this.expectKey = false;
						}
						return;
					case "{":
					case "[":
						this.depth++;
						if (this.depth === 1) this.expectKey = true;
						if (char === "[" && this.depth === 2 && this.lastKey === "items" && this.itemsDepth < 0) this.itemsDepth = 2;
						return;
					case "}":
					case "]":
						this.depth--;
						if (this.itemsDepth >= 0 && this.depth === this.itemsDepth && this.elementStart >= 0) this.emit(raw, index + 1);
						else if (inItems && char === "]") {
							if (this.elementStart >= 0) this.emit(raw, index);
							this.closed = true;
						}
						return;
					case ",":
						if (this.depth === 1) this.expectKey = true;
						if (inItems && this.elementStart >= 0) this.emit(raw, index);
						return;
				}
			}
			emit(raw, end) {
				const text = raw.slice(this.elementStart, end);
				this.elementStart = -1;
				if (this.items.length >= LIMITS.items) {
					this.overLimit = true;
					return;
				}
				let value;
				try {
					value = JSON.parse(text);
				} catch {
					this.items.push({
						ok: false,
						detail: "element is not one JSON value"
					});
					return;
				}
				this.items.push(resolveInlineItem(value));
			}
		};
		//#endregion
		//#region src/client/View.tsx
		/**
		* The interactive region appended under one finished answer. Every string it
		* shows was copied from that answer by the Host; interactions are local only.
		*/
		/** Renders nothing when any part of the view throws; the original answer stays. */
		var ViewBoundary = class extends react.Component {
			state = { failed: false };
			static getDerivedStateFromError() {
				return { failed: true };
			}
			render() {
				return this.state.failed ? null : this.props.children;
			}
		};
		function Markdown({ text, t }) {
			const labels = (0, react.useMemo)(() => ({
				code: {
					copyLabel: t("markdown.copy"),
					copiedLabel: t("markdown.copied")
				},
				footnotes: t("markdown.footnotes")
			}), [t]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, {
				text,
				labels,
				variant: "compact"
			});
		}
		/**
		* The collapsible, closable region.
		* @param props - resolved view and translator.
		* @returns the region, or a restore button once closed.
		*/
		function Region({ view, t }) {
			const [open, setOpen] = (0, react.useState)(true);
			const [closed, setClosed] = (0, react.useState)(false);
			const bodyId = (0, react.useId)();
			const [note, main] = view.items;
			const composed = view.items.length === 2 && note?.type === "markdown" && note.markdown.length <= 320 && (main?.type === "chart" || main?.type === "table" && main.presentation === void 0);
			if (closed) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: "diu-link",
				onClick: () => {
					setClosed(false);
				},
				children: t("region.reopen")
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: "diu-region",
				"aria-label": t("region.label"),
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
					className: "diu-head",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "diu-toggle",
						"aria-expanded": open,
						"aria-controls": bodyId,
						onClick: () => {
							setOpen(!open);
						},
						title: t(open ? "region.collapse" : "region.expand"),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							"aria-hidden": "true",
							className: open ? "diu-caret diu-open" : "diu-caret",
							children: "▸"
						}), t("region.title")]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "diu-icon",
						"aria-label": t("region.close"),
						title: t("region.close"),
						onClick: () => {
							setClosed(true);
						},
						children: "×"
					})]
				}), open && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					id: bodyId,
					className: composed ? "diu-body diu-composed" : "diu-body",
					children: view.items.map((item, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Item, {
						item,
						t
					}, index))
				})]
			});
		}
		function Item({ item, t, scale }) {
			switch (item.type) {
				case "markdown": return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "diu-md",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Markdown, {
						text: item.markdown,
						t
					})
				});
				case "cards": return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Cards, {
					item,
					t
				});
				case "table": return item.presentation === "comparison" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Comparison, {
					table: item.table,
					t
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TableView, {
					table: item.table,
					t
				});
				case "chart": return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Chart, {
					item,
					t,
					scale
				});
				case "scenarios": return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Scenarios, {
					item,
					t
				});
				default: return null;
			}
		}
		/** Switches between precomputed options; nothing is recomputed here. */
		function Scenarios({ item, t }) {
			const [selected, setSelected] = (0, react.useState)(0);
			const option = item.options[selected] ?? item.options[0];
			const scale = (index) => {
				const charts = item.options.flatMap((entry) => entry.items[index]?.type === "chart" ? [entry.items[index]] : []);
				if (charts.length !== item.options.length) return void 0;
				return charts.flatMap((chart) => chart.series.flatMap((series) => series.values)).filter((value) => value !== null);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "diu-scenarios",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "diu-segments",
					role: "group",
					"aria-label": item.label,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "diu-muted",
						children: item.label
					}), item.options.map((entry, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-pressed": index === selected,
						onClick: () => {
							setSelected(index);
						},
						children: entry.name
					}, index))]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "diu-scenario",
					children: option?.items.map((child, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Item, {
						item: child,
						t,
						scale: scale(index)
					}, index))
				})]
			});
		}
		const CLAMP_CHARS = 400;
		function Cards({ item, t }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
				className: "diu-cards",
				children: item.cards.map((card, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CardView, {
					title: card.title,
					markdown: card.markdown,
					t
				}, index))
			});
		}
		function CardView({ title, markdown, t }) {
			const long = markdown.length > CLAMP_CHARS;
			const [expanded, setExpanded] = (0, react.useState)(!long);
			const bodyId = (0, react.useId)();
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
				className: "diu-card",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "diu-card-title",
						role: "heading",
						"aria-level": 4,
						children: title
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						id: bodyId,
						className: expanded ? "diu-card-body" : "diu-card-body diu-clamped",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Markdown, {
							text: markdown,
							t
						})
					}),
					long && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "diu-link",
						"aria-expanded": expanded,
						"aria-controls": bodyId,
						onClick: () => {
							setExpanded(!expanded);
						},
						children: t(expanded ? "card.collapse" : "card.expand")
					})
				]
			});
		}
		/** Source cells stay plain text, as in TableView; card formatting never interprets their Markdown. */
		function Comparison({ table, t }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "diu-comparison",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
					className: "diu-cards",
					children: table.rows.map((row, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
						className: "diu-card",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "diu-card-title",
							role: "heading",
							"aria-level": 4,
							children: row[0]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dl", {
							className: "diu-aspects",
							children: table.headers.slice(1).map((header, column) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: header }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: row[column + 1] })] }, column))
						})]
					}, index))
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", {
					className: "diu-details",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("summary", { children: t("comparison.viewTable") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TableView, {
						table,
						t
					})]
				})]
			});
		}
		/** Tables this short may hide their filter row; sorting stays on the headers. */
		const SMALL_ROWS = 6;
		/** Longer tables show their first rows until expanded, instead of scrolling inside the answer. */
		const FOLD_ROWS = 12;
		const FOLDED_ROWS = 10;
		/** Short cells (numbers with units, names) never wrap. */
		const NOWRAP_CHARS = 12;
		function compareCells(left, right) {
			const a = parseCell(left);
			const b = parseCell(right);
			if (a.kind === "number" && b.kind === "number" && a.unit === b.unit) return a.value - b.value;
			return left.localeCompare(right, void 0, { numeric: true });
		}
		/**
		* Sortable, filterable view of one source table; cells keep their original text.
		* @param props - table data and translator.
		* @returns the table with its controls.
		*/
		function TableView({ table, t }) {
			const [filter, setFilter] = (0, react.useState)("");
			const [sort, setSort] = (0, react.useState)(null);
			const [unfolded, setUnfolded] = (0, react.useState)(false);
			const filterId = (0, react.useId)();
			const alignments = (0, react.useMemo)(() => table.headers.map((_, column) => alignOf(table, column) ?? (analyzeColumn(table.rows.map((row) => row[column] ?? "")).numeric === null ? "left" : "right")), [table]);
			const rows = (0, react.useMemo)(() => {
				const needle = filter.trim().toLowerCase();
				const kept = needle === "" ? [...table.rows] : table.rows.filter((row) => row.some((cell) => cell.toLowerCase().includes(needle)));
				if (sort === null) return kept;
				const sign = sort.dir === "ascending" ? 1 : -1;
				return kept.sort((left, right) => {
					const a = left[sort.column] ?? "";
					const b = right[sort.column] ?? "";
					const missing = (parseCell(a).kind === "missing" ? 1 : 0) - (parseCell(b).kind === "missing" ? 1 : 0);
					return missing !== 0 ? missing : sign * compareCells(a, b);
				});
			}, [
				table,
				filter,
				sort
			]);
			const folded = !unfolded && filter.trim() === "" && rows.length > FOLD_ROWS;
			const cycle = (column) => {
				setSort(sort?.column !== column ? {
					column,
					dir: "ascending"
				} : sort.dir === "ascending" ? {
					column,
					dir: "descending"
				} : null);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "diu-table",
				"data-small": table.rows.length <= SMALL_ROWS || void 0,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "diu-controls",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
								htmlFor: filterId,
								className: "diu-sr",
								children: t("table.filter")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								id: filterId,
								type: "search",
								value: filter,
								placeholder: t("table.filterPlaceholder"),
								onChange: (event) => {
									setFilter(event.target.value);
								}
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "diu-link",
								disabled: filter === "" && sort === null,
								onClick: () => {
									setFilter("");
									setSort(null);
								},
								children: t("table.clear")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "diu-muted",
								"aria-live": "polite",
								children: t("table.count", {
									shown: rows.length,
									total: table.rows.length
								})
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "diu-scroll",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("table", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tr", { children: table.headers.map((header, column) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", {
							scope: "col",
							"aria-sort": sort?.column === column ? sort.dir : "none",
							style: { textAlign: alignments[column] },
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => {
									cycle(column);
								},
								title: t("table.sortBy", { column: header }),
								children: [header, /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									"aria-hidden": "true",
									className: "diu-sort",
									children: sort?.column === column ? sort.dir === "ascending" ? "▲" : "▼" : "↕"
								})]
							})
						}, column)) }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tbody", { children: rows.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
							colSpan: table.headers.length,
							className: "diu-muted",
							children: t("table.empty")
						}) }) : (folded ? rows.slice(0, FOLDED_ROWS) : rows).map((row, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tr", { children: table.headers.map((_, column) => {
							const text = row[column] ?? "";
							const kind = parseCell(text).kind;
							return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
								className: text.length <= NOWRAP_CHARS ? "diu-nowrap" : "diu-wrap",
								"data-kind": kind,
								style: { textAlign: alignments[column] },
								children: text
							}, column);
						}) }, index)) })] })
					}),
					(folded || unfolded && rows.length > FOLD_ROWS) && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "diu-link",
						"aria-expanded": !folded,
						onClick: () => {
							setUnfolded(!unfolded);
						},
						children: folded ? t("table.showAll", { total: rows.length }) : t("table.showLess")
					})
				]
			});
		}
		function alignOf(table, column) {
			const align = table.align[column];
			return align === void 0 || align === "none" ? void 0 : align;
		}
		const WIDTH = 640;
		const MIN_WIDTH = 240;
		const HEIGHT = 280;
		const MARGIN = {
			top: 16,
			right: 16,
			bottom: 44,
			left: 60
		};
		const DASHES = [
			"",
			"6 3",
			"2 3",
			"8 3 2 3"
		];
		const MAX_X_LABELS = 12;
		const X_LABEL_SPACING = 40;
		function formatNumber(value) {
			return value.toLocaleString(void 0, { maximumFractionDigits: 20 });
		}
		function Marker({ shape, x, y }) {
			switch (shape % 4) {
				case 1: return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
					x: x - 3.5,
					y: y - 3.5,
					width: 7,
					height: 7
				});
				case 2: return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: `M${x} ${y - 4.5}L${x + 4.5} ${y + 3.5}L${x - 4.5} ${y + 3.5}Z` });
				case 3: return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: `M${x} ${y - 5}L${x + 5} ${y}L${x} ${y + 5}L${x - 5} ${y}Z` });
				default: return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
					cx: x,
					cy: y,
					r: 4
				});
			}
		}
		/**
		* Bar or line chart over verified numeric columns, with tooltip, legend
		* toggles, and a data table disclosure.
		* @param props - chart item and translator.
		* @returns the chart figure.
		*/
		function Chart({ item, t, scale }) {
			const [hidden, setHidden] = (0, react.useState)(/* @__PURE__ */ new Set());
			const [active, setActive] = (0, react.useState)(null);
			const [showData, setShowData] = (0, react.useState)(false);
			const dataId = (0, react.useId)();
			const plotRef = (0, react.useRef)(null);
			const [width, setWidth] = (0, react.useState)(WIDTH);
			(0, react.useEffect)(() => {
				const node = plotRef.current;
				if (node === null || typeof ResizeObserver === "undefined") return;
				const observer = new ResizeObserver(([entry]) => {
					if (entry !== void 0 && entry.contentRect.width > 0) setWidth(Math.max(MIN_WIDTH, Math.round(entry.contentRect.width)));
				});
				observer.observe(node);
				return () => {
					observer.disconnect();
				};
			}, []);
			const visible = item.series.map((series, index) => ({
				series,
				index
			})).filter((entry) => !hidden.has(entry.index));
			const values = visible.flatMap((entry) => entry.series.values).filter((value) => value !== null);
			const { min, max, ticks, zeroBased } = valueAxis(scale === void 0 ? values : [...values, ...scale], item.chart);
			const plotW = width - MARGIN.left - MARGIN.right;
			const plotH = HEIGHT - MARGIN.top - MARGIN.bottom;
			const count = item.categories.length;
			const band = plotW / count;
			const y = (value) => MARGIN.top + (max - value) / (max - min) * plotH;
			const center = (index) => MARGIN.left + band * (index + .5);
			const labelEvery = Math.ceil(count / Math.max(2, Math.min(MAX_X_LABELS, Math.floor(plotW / X_LABEL_SPACING))));
			const toggle = (index) => {
				const next = new Set(hidden);
				if (next.has(index)) next.delete(index);
				else if (visible.length > 1) next.add(index);
				setHidden(next);
			};
			const label = t("chart.label", {
				kind: t(item.chart === "bar" ? "chart.bar" : "chart.line"),
				x: item.xLabel,
				series: item.series.map((series) => series.name).join("、")
			});
			const pointText = (index) => [item.categories[index] ?? "", ...visible.map(({ series }) => {
				const value = series.values[index];
				return `${series.name}: ${value === null || value === void 0 ? t("chart.missing") : `${formatNumber(value)}${item.unit === "" ? "" : ` ${item.unit}`}`}`;
			})].join("；");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("figure", {
				className: "diu-chart",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("figcaption", { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "diu-chart-title",
							children: t("chart.title", {
								x: item.xLabel,
								kind: t(item.chart === "bar" ? "chart.bar" : "chart.line")
							})
						}),
						item.unit !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "diu-muted",
							children: t("chart.unit", { unit: item.unit })
						}),
						!zeroBased && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "diu-muted",
							children: t("chart.axisFrom", { min: formatNumber(min) })
						})
					] }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "diu-legend",
						role: "group",
						"aria-label": t("chart.legend"),
						children: item.series.map((series, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							"aria-pressed": !hidden.has(index),
							className: "diu-legend-item",
							onClick: () => {
								toggle(index);
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
								width: "22",
								height: "12",
								"aria-hidden": "true",
								className: `diu-s${index}`,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("line", {
									x1: "1",
									y1: "6",
									x2: "21",
									y2: "6",
									strokeDasharray: item.chart === "line" ? DASHES[index] : void 0
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Marker, {
									shape: index,
									x: 11,
									y: 6
								})]
							}), series.name]
						}, index))
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "diu-plot",
						ref: plotRef,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
							viewBox: `0 0 ${width} ${HEIGHT}`,
							role: "img",
							"aria-label": label,
							onPointerLeave: (event) => {
								if (event.pointerType !== "touch") setActive(null);
							},
							children: [
								ticks.map((tick) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
									className: "diu-grid",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("line", {
										x1: MARGIN.left,
										x2: width - MARGIN.right,
										y1: y(tick),
										y2: y(tick),
										className: tick === 0 ? "diu-zero" : void 0
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("text", {
										x: MARGIN.left - 6,
										y: y(tick),
										dy: "0.32em",
										textAnchor: "end",
										children: formatNumber(tick)
									})]
								}, tick)),
								item.categories.map((category, index) => index % labelEvery === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("text", {
									className: "diu-xlabel",
									x: center(index),
									y: HEIGHT - MARGIN.bottom + 16,
									textAnchor: "middle",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("title", { children: category }), category.length > 10 ? `${category.slice(0, 9)}…` : category]
								}, index)),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("text", {
									className: "diu-xlabel",
									x: MARGIN.left + plotW / 2,
									y: 274,
									textAnchor: "middle",
									children: item.xLabel
								}),
								item.chart === "bar" ? visible.map(({ series, index: seriesIndex }, position) => {
									const width = band * .72 / visible.length;
									return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("g", {
										className: `diu-s${seriesIndex} diu-bars`,
										children: series.values.map((value, index) => value === null ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
											x: center(index) - band * .36 + position * width,
											width: Math.max(1, width - 1),
											y: Math.min(y(value), y(0)),
											height: Math.max(1, Math.abs(y(value) - y(0))),
											opacity: active === null || active === index ? 1 : .55
										}, index))
									}, seriesIndex);
								}) : visible.map(({ series, index: seriesIndex }) => {
									let path = "";
									let pen = false;
									series.values.forEach((value, index) => {
										if (value === null) {
											pen = false;
											return;
										}
										path += `${pen ? "L" : "M"}${center(index)} ${y(value)}`;
										pen = true;
									});
									return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
										className: `diu-s${seriesIndex} diu-line`,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
											d: path,
											strokeDasharray: DASHES[seriesIndex]
										}), series.values.map((value, index) => value === null ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Marker, {
											shape: seriesIndex,
											x: center(index),
											y: y(value)
										}, index))]
									}, seriesIndex);
								}),
								item.categories.map((_, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
									className: "diu-hit",
									x: MARGIN.left + band * index,
									y: MARGIN.top,
									width: band,
									height: plotH,
									tabIndex: 0,
									role: "img",
									"aria-label": pointText(index),
									onMouseEnter: () => {
										setActive(index);
									},
									onFocus: () => {
										setActive(index);
									},
									onBlur: () => {
										setActive(null);
									},
									onClick: () => {
										setActive(index);
									}
								}, index)),
								active !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("line", {
									className: "diu-cursor",
									x1: center(active),
									x2: center(active),
									y1: MARGIN.top,
									y2: MARGIN.top + plotH
								})
							]
						}), active !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "diu-tooltip",
							role: "tooltip",
							style: center(active) > width / 2 ? { right: `calc(${100 - center(active) / width * 100}% + 6px)` } : { left: `calc(${center(active) / width * 100}% + 6px)` },
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: item.categories[active] }), visible.map(({ series, index }) => {
								const value = series.values[active];
								return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "diu-tooltip-row",
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: `diu-swatch diu-s${index}`,
											"aria-hidden": "true"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: series.name }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "diu-tooltip-value",
											children: value === null || value === void 0 ? t("chart.missing") : formatNumber(value)
										})
									]
								}, index);
							})]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "diu-link",
						"aria-expanded": showData,
						"aria-controls": dataId,
						onClick: () => {
							setShowData(!showData);
						},
						children: t(showData ? "chart.hideData" : "chart.viewData")
					}),
					showData && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						id: dataId,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TableView, {
							table: item.table,
							t
						})
					})
				]
			});
		}
		//#endregion
		//#region src/client/inline.tsx
		/**
		* `inline-stream` presentation. While the root agent streams `render_ui`
		* arguments, the toolview renders each component as soon as it closes and
		* validates. Once the turn ends the Chat folds process rows, so the turn tail
		* re-reads the settled call from the Turn's own tool nodes and keeps the view
		* in the default chat flow; history and second windows replay the same nodes.
		*/
		/**
		* Settled calls whose view the turn tail currently shows. Their toolview rows
		* then render a pointer instead of a second copy (visible when the user
		* expands a folded turn or uses the verbose transcript).
		*/
		const shownInTail = /* @__PURE__ */ new Set();
		const tailListeners = /* @__PURE__ */ new Set();
		function setShownInTail(callIds, shown) {
			for (const callId of callIds) if (shown) shownInTail.add(callId);
			else shownInTail.delete(callId);
			for (const listener of [...tailListeners]) listener();
		}
		function subscribeTail(listener) {
			tailListeners.add(listener);
			return () => {
				tailListeners.delete(listener);
			};
		}
		function View({ items, t }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ViewBoundary, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Region, {
				view: { items },
				t
			}) });
		}
		/**
		* Keyed `tool.call.toolview` entry for `render_ui`.
		* @param props - phase-specific owner props.
		* @returns the streamed, settled, or failed view row.
		*/
		function InlineToolView(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "diu-root diu-inline",
				"data-diu-inline": props.callId,
				children: props.phase === "preparing" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Preparing, { ...props }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Settled, { ...props })
			});
		}
		/**
		* DSH 0.2.1-rc.2 dropped `useToolCallArgumentsPartial`. Its `block.args` view
		* grows in place but republishes only when an observed field answer changes,
		* and no public read follows an array prefix, so poll the view's text source
		* (`chunks`, the field it compares structurally) while the call prepares.
		* Without that field the row shows only the status until the call settles.
		*/
		function usePolledArguments(block) {
			const chunks = () => {
				const value = block.args?.chunks;
				return Array.isArray(value) && value.every((chunk) => typeof chunk === "string") ? value : void 0;
			};
			const [, refresh] = (0, react.useReducer)((count) => count + 1, 0);
			const rendered = chunks();
			const count = rendered?.length;
			(0, react.useEffect)(() => {
				const timer = setInterval(() => {
					if (chunks()?.length !== count) refresh();
				}, 50);
				return () => {
					clearInterval(timer);
				};
			}, [block, count]);
			return rendered?.join("") ?? "";
		}
		function Preparing({ useToolCallArgumentsPartial, block, t }) {
			const raw = typeof useToolCallArgumentsPartial === "function" ? useToolCallArgumentsPartial() : usePolledArguments(block);
			const snapshot = (0, react.useMemo)(() => new InlineArgsStream(), []).feed(raw);
			const shown = snapshot.items.flatMap((outcome) => outcome.ok ? [outcome.item] : []);
			const rejected = snapshot.items.length - shown.length;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [shown.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(View, {
				items: shown,
				t
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "diu-status",
				role: "status",
				children: [
					t("inline.streaming", { count: shown.length }),
					rejected > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("inline.rejected", { count: rejected }) }),
					snapshot.overLimit && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("inline.overLimit") })
				]
			})] });
		}
		function Settled({ phase, block, callId, t }) {
			const inTail = (0, react.useSyncExternalStore)(subscribeTail, () => shownInTail.has(callId));
			const raw = phase === "start" ? block.argsRaw : block.call?.argsRaw;
			const outcome = (0, react.useMemo)(() => raw === void 0 ? void 0 : readInlineArgs(raw), [raw]);
			if (phase === "result" && block.isError) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "diu-status",
				role: "status",
				children: t("inline.failed")
			});
			if (outcome === void 0 || !outcome.ok) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "diu-status",
				role: "status",
				children: t("inline.failed")
			});
			if (inTail) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "diu-status",
				children: t("inline.below")
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(View, {
				items: outcome.items,
				t
			});
		}
		const NO_CALLS = [];
		/** Successful native `render_ui` results of one Turn; identity changes only with the nodes. */
		function settledCalls(nodes) {
			const calls = (nodes ?? []).flatMap(({ root }) => "kind" in root && root.call?.name === "render_ui" && !root.isError && root.parentCallId === void 0 ? [root] : []);
			return calls.length === 0 ? NO_CALLS : calls;
		}
		/**
		* Completed-turn view of every successful `render_ui` call in that turn.
		* @param props - turn identity, the Turn's tool nodes, and the translator.
		* @returns the persisted views, or null for a turn without one.
		*/
		function InlineTail({ turn, useToolCalls, t }) {
			const nodes = useToolCalls(String(turn.turn));
			const calls = (0, react.useMemo)(() => settledCalls(nodes), [nodes]);
			const views = (0, react.useMemo)(() => calls.flatMap((call) => {
				const outcome = call.call === null ? void 0 : readInlineArgs(call.call.argsRaw);
				return outcome?.ok === true ? [{
					callId: call.callId,
					items: outcome.items
				}] : [];
			}), [calls]);
			const key = views.map((view) => view.callId).join(" ");
			(0, react.useEffect)(() => {
				const ids = key === "" ? [] : key.split(" ");
				setShownInTail(ids, true);
				return () => {
					setShownInTail(ids, false);
				};
			}, [key]);
			if (views.length === 0) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: views.map((view) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "diu-root diu-inline",
				"data-diu-inline-tail": view.callId,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(View, {
					items: view.items,
					t
				})
			}, view.callId)) });
		}
		//#endregion
		//#region src/client/locales.ts
		/** `intelligent-ui` namespace dictionaries. */
		/** Dictionary namespace owned by this plugin. */
		const NS = "intelligent-ui";
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"region.title": "交互视图",
			"region.label": "由原回答生成的交互视图，原文保持不变",
			"region.collapse": "收起交互视图",
			"region.expand": "展开交互视图",
			"region.close": "关闭交互视图",
			"region.reopen": "显示交互视图",
			"status.pending": "正在生成交互视图…",
			"status.failed": "交互视图生成失败，已保留原文",
			"status.retry": "重试",
			"card.expand": "展开",
			"card.collapse": "收起",
			"comparison.viewTable": "查看完整表格 · 排序与筛选",
			"table.filter": "筛选行",
			"table.filterPlaceholder": "输入关键字筛选",
			"table.clear": "清除",
			"table.count": "{shown} / {total} 行",
			"table.sortBy": "按 {column} 排序",
			"table.empty": "没有匹配的行",
			"table.showAll": "显示全部 {total} 行",
			"table.showLess": "收起",
			"chart.label": "{kind}：{x} 对比 {series}",
			"chart.title": "{x} · {kind}",
			"chart.bar": "柱状图",
			"chart.line": "折线图",
			"chart.legend": "图例（点击可显示或隐藏系列）",
			"chart.missing": "缺失",
			"chart.viewData": "查看数据",
			"chart.hideData": "隐藏数据",
			"chart.unit": "单位：{unit}",
			"chart.axisFrom": "纵轴从 {min} 起",
			"markdown.copy": "复制",
			"markdown.copied": "已复制",
			"markdown.footnotes": "脚注",
			"inline.streaming": "正在生成交互视图…已显示 {count} 个组件",
			"inline.rejected": "{count} 个组件未通过校验，未显示",
			"inline.overLimit": "内容超出限制，其余部分不再显示",
			"inline.failed": "交互视图未完成或未通过校验，请以文字回答为准",
			"inline.below": "交互视图显示在本轮回答下方"
		};
		/** English dictionary. */
		const en = {
			"region.title": "Interactive view",
			"region.label": "Interactive view generated from the answer above; the original text is unchanged",
			"region.collapse": "Collapse interactive view",
			"region.expand": "Expand interactive view",
			"region.close": "Close interactive view",
			"region.reopen": "Show interactive view",
			"status.pending": "Preparing interactive view…",
			"status.failed": "Interactive view failed; the original answer is kept",
			"status.retry": "Retry",
			"card.expand": "Expand",
			"card.collapse": "Collapse",
			"comparison.viewTable": "Full table · sort and filter",
			"table.filter": "Filter rows",
			"table.filterPlaceholder": "Type to filter",
			"table.clear": "Clear",
			"table.count": "{shown} / {total} rows",
			"table.sortBy": "Sort by {column}",
			"table.empty": "No matching rows",
			"table.showAll": "Show all {total} rows",
			"table.showLess": "Show fewer",
			"chart.label": "{kind}: {x} by {series}",
			"chart.title": "{x} · {kind}",
			"chart.bar": "Bar chart",
			"chart.line": "Line chart",
			"chart.legend": "Legend (click to show or hide a series)",
			"chart.missing": "missing",
			"chart.viewData": "View data",
			"chart.hideData": "Hide data",
			"chart.unit": "Unit: {unit}",
			"chart.axisFrom": "Y axis starts at {min}",
			"markdown.copy": "Copy",
			"markdown.copied": "Copied",
			"markdown.footnotes": "Footnotes",
			"inline.streaming": "Building interactive view… {count} components shown",
			"inline.rejected": "{count} components failed validation and are hidden",
			"inline.overLimit": "Content exceeds the limit; the rest is not shown",
			"inline.failed": "Interactive view incomplete or rejected; rely on the text answer",
			"inline.below": "Interactive view is shown below this turn"
		};
		//#endregion
		//#region src/client/styles.ts
		/** Scoped styles; theme tokens come from the host page, so dark mode follows it. */
		const STYLES = `
.diu-root{--diu-s0:#3b6fd8;--diu-s1:#d9822b;--diu-s2:#2f9e6e;--diu-s3:#9b59b6;--diu-surface:color-mix(in srgb,currentColor 3%,transparent);--diu-border:var(--dsw-alias-border-l1,rgba(127,127,127,.2));margin-top:16px;min-width:0;font-size:14px;line-height:1.55;color:var(--dsw-alias-label-primary,inherit)}
body[data-ds-dark-theme] .diu-root{--diu-s0:#7aa2f7;--diu-s1:#f0a35e;--diu-s2:#5cc797;--diu-s3:#c39ae0}
.diu-status{color:var(--dsw-alias-label-tertiary,#888);font-size:12px;display:flex;gap:8px;align-items:center}
.diu-region{container-type:inline-size;border:1px solid var(--diu-border);border-radius:var(--dsw-radius-lg,12px);padding:12px 20px 20px}
.diu-head{display:flex;align-items:center;justify-content:space-between;gap:12px;color:var(--dsw-alias-label-secondary,#666)}
.diu-root button{font:inherit;color:inherit;background:none;border:0;cursor:pointer;padding:5px 8px;border-radius:6px}
.diu-root button:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.12))}
.diu-root button:focus-visible,.diu-root input:focus-visible,.diu-hit:focus-visible{outline:2px solid var(--dsw-focus-ring-color,#3b6fd8);outline-offset:1px}
.diu-root button:disabled{opacity:.45;cursor:default}
.diu-root .diu-toggle{font-size:12px;font-weight:400;display:flex;gap:6px;align-items:center;padding-left:0}
.diu-caret{display:inline-block;transition:transform .15s}.diu-caret.diu-open{transform:rotate(90deg)}
.diu-root .diu-icon{font-size:18px;line-height:1;min-width:28px;min-height:28px}
.diu-link{color:var(--dsw-alias-state-business-primary,#3b6fd8)!important;font-size:12px}
.diu-muted{color:var(--dsw-alias-label-tertiary,#888);font-size:12px}
.diu-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.diu-body{display:flex;flex-direction:column;gap:20px;padding-top:12px;min-width:0}
.diu-md>div{font-size:inherit;color:inherit}
.diu-cards{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr));gap:12px}
.diu-cards:has(>:nth-child(4):last-child){grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr))}
.diu-card{background:var(--diu-surface);border:1px solid var(--diu-border);border-radius:10px;padding:16px;display:flex;flex-direction:column;gap:8px;min-width:0}
.diu-card-title{font-size:15px;font-weight:600;overflow-wrap:anywhere}
.diu-card-body{min-width:0;overflow-wrap:anywhere}
.diu-clamped{max-height:12em;overflow:hidden;-webkit-mask-image:linear-gradient(#000 60%,transparent)}
.diu-card .diu-link{align-self:flex-start}
.diu-comparison{display:flex;flex-direction:column;gap:16px;min-width:0}
.diu-aspects{margin:0;display:grid;gap:12px;overflow-wrap:anywhere}
.diu-aspects dt{font-size:12px;color:var(--dsw-alias-label-secondary,#666);margin-bottom:3px}
.diu-aspects dd{margin:0}
.diu-details{min-width:0}
.diu-details summary{cursor:pointer;color:var(--dsw-alias-state-business-primary,#3b6fd8);font-size:12px;padding:6px 0}
.diu-details summary:focus-visible{outline:2px solid var(--dsw-focus-ring-color,#3b6fd8);outline-offset:2px}
.diu-details[open] summary{margin-bottom:12px}
.diu-composed>.diu-md{background:var(--diu-surface);border-radius:10px;padding:16px;min-width:0;overflow-wrap:anywhere}
@container (min-width:600px){
  .diu-composed{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2fr);align-items:start}
  .diu-composed>.diu-chart,.diu-composed>.diu-table{min-width:0}
}
.diu-segments{display:flex;flex-wrap:wrap;gap:4px;align-items:center;margin-bottom:8px}
.diu-segments .diu-muted{margin-right:4px}
.diu-root .diu-segments button{border:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.35));border-radius:999px;padding:2px 10px}
.diu-root .diu-segments button[aria-pressed=true]{background:var(--dsw-alias-state-business-primary,#3b6fd8);border-color:transparent;color:#fff}
.diu-scenario{display:flex;flex-direction:column;gap:12px}
.diu-controls{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:12px;font-size:12px}
.diu-controls input{box-sizing:border-box;font:inherit;color:inherit;background:var(--diu-surface);border:1px solid var(--diu-border);border-radius:8px;padding:7px 10px;min-width:0;max-width:100%;flex:0 1 220px}
.diu-scroll{overflow-x:auto;max-width:100%}
.diu-nowrap{white-space:nowrap}
.diu-table table{border-collapse:collapse;width:100%}
.diu-table th,.diu-table td{border-bottom:1px solid var(--diu-border);padding:12px;text-align:left;vertical-align:top}
.diu-table td.diu-wrap{min-width:11rem;max-width:30rem;overflow-wrap:anywhere}
.diu-table td[data-kind=number]{font-variant-numeric:tabular-nums}
.diu-table td[data-kind=missing]{color:var(--dsw-alias-label-secondary,#666)}
.diu-table tbody tr:last-child td{border-bottom:0}
.diu-table tbody tr:hover{background:var(--diu-surface)}
.diu-table th{position:sticky;top:0;background:var(--dsw-alias-bg-l1,Canvas);font-weight:600;white-space:nowrap;font-size:12px;color:var(--dsw-alias-label-secondary,#666)}
.diu-table th button{font-weight:600;display:inline-flex;gap:6px;align-items:center;padding:0;min-height:24px}
.diu-sort{font-size:10px;color:var(--dsw-alias-label-tertiary,#888)}
.diu-chart{margin:0;display:flex;flex-direction:column;gap:14px;min-width:0}
.diu-chart>.diu-link{align-self:flex-start}
.diu-chart-title{font-size:16px;font-weight:600}
.diu-chart figcaption{display:flex;gap:6px 12px;flex-wrap:wrap;align-items:baseline}
.diu-legend{display:flex;flex-wrap:wrap;gap:8px}
.diu-root .diu-legend-item{display:inline-flex;gap:8px;align-items:center;font-size:12px;padding:6px 10px;border:1px solid var(--diu-border);border-radius:8px;text-align:left}
.diu-legend-item[aria-pressed=true]{background:var(--diu-surface)}
.diu-legend-item svg{flex-shrink:0}
.diu-legend-item[aria-pressed=false]{opacity:.45;text-decoration:line-through}
.diu-plot{position:relative;container-type:inline-size}
.diu-plot svg{width:100%;height:auto;display:block;overflow:visible}
.diu-grid line{stroke:var(--diu-border);stroke-opacity:.55}
.diu-grid line.diu-zero{stroke:var(--dsw-alias-label-tertiary,#888);stroke-opacity:1}
.diu-grid text,.diu-xlabel{fill:var(--dsw-alias-label-secondary,#666);font-size:11px}
.diu-s0{--c:var(--diu-s0)}.diu-s1{--c:var(--diu-s1)}.diu-s2{--c:var(--diu-s2)}.diu-s3{--c:var(--diu-s3)}
.diu-bars rect{fill:var(--c)}
.diu-line path{fill:none;stroke:var(--c);stroke-width:2}
.diu-line>circle,.diu-line>rect,.diu-line>path:not(:first-child){fill:var(--c);stroke:none}
.diu-legend-item svg line{stroke:var(--c);stroke-width:2}
.diu-legend-item svg circle,.diu-legend-item svg rect,.diu-legend-item svg path{fill:var(--c)}
.diu-hit{fill:transparent;outline:none}
.diu-cursor{stroke:var(--dsw-alias-label-tertiary,#888);stroke-dasharray:3 3;pointer-events:none}
.diu-tooltip{position:absolute;top:8px;pointer-events:none;background:var(--dsw-alias-bg-l1,Canvas);border:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.35));border-radius:10px;padding:10px 12px;font-size:12px;box-shadow:0 4px 16px rgba(0,0,0,.12);box-sizing:border-box;width:max-content;max-width:calc(50% - 8px);overflow-wrap:anywhere;z-index:1}
.diu-tooltip>strong{display:block;margin-bottom:6px}
.diu-tooltip-row{display:grid;grid-template-columns:8px minmax(0,1fr) auto;gap:8px;align-items:baseline;margin-top:4px}
.diu-tooltip-value{text-align:right;font-variant-numeric:tabular-nums;font-weight:600}
.diu-swatch{display:inline-block;width:8px;height:8px;border-radius:2px;background:var(--c)}
.diu-inline{font-size:14px}
.diu-inline .diu-region{border:0;padding:0}
.diu-inline .diu-toggle{font-weight:400;font-size:12px;color:var(--dsw-alias-label-tertiary,#888)}
.diu-inline .diu-body{padding-top:4px}
.diu-inline .diu-body>.diu-md:first-child{font-size:15px}
.diu-inline .diu-table[data-small] .diu-controls{display:none}
.diu-inline .diu-comparison .diu-table[data-small] .diu-controls{display:flex}
@container (max-width:420px){
  .diu-body{gap:16px}
  .diu-card{padding:12px}
  .diu-table th,.diu-table td{padding:10px 8px}
  .diu-tooltip{position:static;max-width:100%;width:100%;margin-top:8px}
}
@media (prefers-reduced-motion:reduce){.diu-caret{transition:none}}
`;
		//#endregion
		//#region src/client/index.tsx
		/**
		* dsh-intelligent-ui, browser half: mounts this plugin's own Remote
		* contribution and appends a read-only interactive view under a finished
		* root answer through `conversation.chat.turnTail`. It never generates and
		* never changes the original Markdown; composing the plugin out removes it.
		* The `inline-stream` views (`./inline.tsx`) register beside it.
		*/
		/** Required services: slots, dictionaries, and the Remote mount. */
		const inject = [
			"slots",
			"locale",
			"remote"
		];
		/**
		* Bind the closing answer of a completed turn to its exact identity.
		* @param owner - turn-tail owner props.
		* @param sessionId - owning session.
		* @returns the identity, or null when the turn has no settled final answer.
		*/
		function sourceRef(owner, sessionId) {
			if (owner.turn.end?.data.reason.kind !== "completed") return null;
			const closing = owner.turn.data.get("turn-tail")?.closing;
			const node = closing?.finalNode;
			if (closing?.status !== "settled" || node?.messageId === void 0 || node.seq !== owner.seq) return null;
			const text = sourceMarkdown(node.blocks.map((block) => block.kind === "text" ? {
				kind: "text",
				text: block.text
			} : { kind: block.kind }));
			if (text.trim() === "") return null;
			return {
				sessionId,
				turn: owner.turn.turn,
				messageId: node.messageId,
				sourceSeq: node.seq,
				sourceHash: hashSource(text)
			};
		}
		function IntelligentTail(props) {
			const ref = sourceRef(props, props.sessionId);
			return ref === null ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Bound, {
				reference: ref,
				reader: props.reader,
				t: props.t
			});
		}
		function Bound({ reference, reader, t }) {
			const subscribe = (0, react.useCallback)((listener) => reader.subscribe(reference, listener), [
				reader,
				reference.sessionId,
				reference.turn,
				reference.messageId,
				reference.sourceSeq,
				reference.sourceHash
			]);
			const state = (0, react.useSyncExternalStore)(subscribe, () => reader.snapshot(reference));
			if (state?.status === "pending") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "diu-root diu-status",
				role: "status",
				children: t("status.pending")
			});
			if (state?.status === "failed") return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "diu-root diu-status",
				role: "status",
				children: [t("status.failed"), state.retryable && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: "diu-link",
					onClick: () => {
						reader.retry(reference);
					},
					children: t("status.retry")
				})]
			});
			if (state?.status !== "ready") return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "diu-root",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ViewBoundary, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Region, {
					view: state.view,
					t
				}) })
			});
		}
		function unwrap(result) {
			return result.ok ? result.value : void 0;
		}
		/** Register the reader, styles, dictionaries, and tail entry once the namespace is mounted. */
		function registerUi(ctx) {
			const reader = new EnhancementReader({
				read: async (ref) => unwrap(await ctx.remote.intelligentUi.read(ref)),
				retry: async (ref) => unwrap(await ctx.remote.intelligentUi.retry(ref))
			});
			ctx.effect(() => () => {
				reader.dispose();
			}, "intelligent-ui: reader");
			ctx.effect(() => {
				const style = document.createElement("style");
				style.dataset.plugin = "dsh-intelligent-ui";
				style.textContent = STYLES;
				document.head.append(style);
				return () => {
					style.remove();
				};
			}, "intelligent-ui: styles");
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "intelligent-ui: dictionaries");
			ctx.slots.inject("conversation.chat.turnTail", () => ctx.slots.register({
				name: "conversation.chat.turnTail",
				id: "dsh-intelligent-ui",
				locale: NS,
				inject: () => ({ reader })
			}, IntelligentTail));
		}
		/** Register the `inline-stream` toolview and its completed-turn tail. */
		function registerInline(ctx) {
			ctx.slots.inject("tool.call.toolview", () => ctx.slots.register({
				name: "tool.call.toolview",
				key: INLINE_TOOL_NAME,
				locale: NS
			}, InlineToolView));
			ctx.slots.inject("conversation.chat.turnTail", () => ctx.slots.register({
				name: "conversation.chat.turnTail",
				id: "dsh-intelligent-ui:inline",
				locale: NS,
				inject: (sessionId) => {
					const chat = ctx.uiConversation.binding(sessionId).target("chat");
					return { keyedHooks: { toolCalls: (turn) => {
						const snapshot = chat.getSnapshot();
						if (snapshot === void 0) throw new Error("intelligent-ui: Chat target is unavailable");
						return snapshot.nodes.turnDataSource(Number(turn), "tool-call");
					} } };
				}
			}, InlineTail));
		}
		/**
		* Client plugin body: mount this plugin's own Remote namespace, then register
		* the UI in a child scope that declares it (the pattern DSH's own
		* self-mounting clients use).
		* @param ctx - client root context.
		*/
		async function apply(ctx) {
			const disposeRemote = await ctx.remote.$mount(TYPERT_REMOTE);
			const ui = ctx.inject([
				"remote.intelligentUi",
				"slots",
				"locale"
			], registerUi);
			ctx.inject([
				"slots",
				"locale",
				"uiConversation"
			], registerInline);
			try {
				await ui;
			} catch (error) {
				await ui.dispose();
				await disposeRemote();
				throw error;
			}
			ctx.effect(() => async () => {
				await ui.dispose();
				await disposeRemote();
			}, "intelligent-ui: remote");
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		exports.sourceRef = sourceRef;
		return module.exports;
	}
});
