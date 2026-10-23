/**
 * Arithmetic formulas of the `calculator` component. A formula is parsed into
 * closures over a fixed vocabulary (numbers, names, operators, a few Math
 * functions); nothing is ever evaluated as JavaScript. Client-safe.
 */
import { BindingError } from "./program.js";
const FUNCTIONS = {
    min: { min: 1, max: 8, fn: Math.min },
    max: { min: 1, max: 8, fn: Math.max },
    abs: { min: 1, max: 1, fn: Math.abs },
    floor: { min: 1, max: 1, fn: Math.floor },
    ceil: { min: 1, max: 1, fn: Math.ceil },
    sqrt: { min: 1, max: 1, fn: Math.sqrt },
    exp: { min: 1, max: 1, fn: Math.exp },
    ln: { min: 1, max: 1, fn: Math.log },
    log10: { min: 1, max: 1, fn: Math.log10 },
    pow: { min: 2, max: 2, fn: Math.pow },
    round: { min: 1, max: 2, fn: (value, digits = 0) => Math.round(value * 10 ** digits) / 10 ** digits },
};
const TOKEN = /\s*(?:(\d+(?:\.\d*)?(?:e[+-]?\d+)?|\.\d+(?:e[+-]?\d+)?)|([A-Za-z_]\w*)|(\*\*|<=|>=|==|!=|&&|\|\||[-+*/%^()<>?:,!]))/gy;
/**
 * Parse one formula.
 * @param source - e.g. `P * r / (1 - (1 + r) ^ -n)`; `^` and `**` are powers, comparisons yield 1 or 0, `c ? a : b` picks.
 * @returns the evaluator and the names it reads.
 * @throws BindingError on any syntax outside the vocabulary.
 */
export function parseFormula(source) {
    const tokens = [];
    TOKEN.lastIndex = 0;
    while (TOKEN.lastIndex < source.length) {
        const at = TOKEN.lastIndex;
        const match = TOKEN.exec(source);
        if (match === null) {
            if (/^\s*$/.test(source.slice(at)))
                break;
            throw new BindingError(`formula: unexpected "${source.slice(at).trim().slice(0, 12)}"`);
        }
        tokens.push(match[1] ?? match[2] ?? match[3] ?? '');
    }
    const names = new Set();
    let pos = 0;
    const peek = () => tokens[pos];
    const take = (expected) => {
        if (tokens[pos] !== expected)
            throw new BindingError(`formula: expected "${expected}"`);
        pos++;
    };
    const binary = (next, ops) => () => {
        let left = next();
        for (let op = peek(); op !== undefined && Object.hasOwn(ops, op); op = peek()) {
            pos++;
            const [a, b, apply] = [left, next(), ops[op]];
            left = env => apply(a(env), b(env));
        }
        return left;
    };
    const primary = () => {
        const token = tokens[pos++];
        if (token === undefined)
            throw new BindingError('formula: ends early');
        if (token === '(') {
            const inner = ternary();
            take(')');
            return inner;
        }
        if (/^[\d.]/.test(token)) {
            const value = Number(token);
            return () => value;
        }
        if (!/^[A-Za-z_]/.test(token))
            throw new BindingError(`formula: unexpected "${token}"`);
        if (peek() !== '(') {
            names.add(token);
            return env => env[token] ?? NaN;
        }
        const fn = Object.hasOwn(FUNCTIONS, token) ? FUNCTIONS[token] : undefined;
        if (fn === undefined)
            throw new BindingError(`formula: unknown function ${token}`);
        pos++;
        const args = [];
        if (peek() !== ')') {
            args.push(ternary());
            while (peek() === ',') {
                pos++;
                args.push(ternary());
            }
        }
        take(')');
        if (args.length < fn.min || args.length > fn.max)
            throw new BindingError(`formula: ${token} takes ${fn.min}-${fn.max} arguments`);
        return env => fn.fn(...args.map(arg => arg(env)));
    };
    const unary = () => {
        const op = peek();
        if (op === '-' || op === '+' || op === '!') {
            pos++;
            const operand = unary();
            return op === '-' ? env => -operand(env) : op === '!' ? env => Number(!operand(env)) : operand;
        }
        return power();
    };
    // Right-associative, and binds tighter than a leading minus on its left: -2^2 is -4, 2^-1 is 0.5.
    const power = () => {
        const base = primary();
        const op = peek();
        if (op !== '^' && op !== '**')
            return base;
        pos++;
        const exponent = unary();
        return env => base(env) ** exponent(env);
    };
    const product = binary(unary, { '*': (a, b) => a * b, '/': (a, b) => a / b, '%': (a, b) => a % b });
    const sum = binary(product, { '+': (a, b) => a + b, '-': (a, b) => a - b });
    const compare = binary(sum, {
        '<': (a, b) => Number(a < b), '<=': (a, b) => Number(a <= b), '>': (a, b) => Number(a > b),
        '>=': (a, b) => Number(a >= b), '==': (a, b) => Number(a === b), '!=': (a, b) => Number(a !== b),
    });
    const and = binary(compare, { '&&': (a, b) => Number(a !== 0 && b !== 0) });
    const or = binary(and, { '||': (a, b) => Number(a !== 0 || b !== 0) });
    const ternary = () => {
        const condition = or();
        if (peek() !== '?')
            return condition;
        pos++;
        const yes = ternary();
        take(':');
        const no = ternary();
        return env => condition(env) !== 0 ? yes(env) : no(env);
    };
    const evaluate = ternary();
    if (pos !== tokens.length)
        throw new BindingError(`formula: unexpected "${tokens[pos]}"`);
    return { evaluate, names };
}
/**
 * Outputs of a calculator for the given input values, in order; an output
 * that fails or is not finite is `null` and shows as missing, alone.
 * @param item - a calculator already accepted by {@link bindCalculator}.
 * @param values - one value per input.
 * @param formulas - parsed outputs, when the caller keeps them.
 * @returns one value or `null` per output.
 */
export function computeCalculator(item, values, formulas = item.outputs.map(output => parseFormula(output.formula))) {
    const env = Object.create(null);
    item.inputs.forEach((input, index) => { env[input.id] = values[index] ?? input.value; });
    return item.outputs.map((output, index) => {
        const value = formulas[index]?.evaluate(env) ?? NaN;
        if (output.id !== undefined)
            env[output.id] = value;
        return Number.isFinite(value) ? value : null;
    });
}
const IDENT = /^[A-Za-z_]\w{0,31}$/;
/**
 * Check a calculator written by the model: names, ranges, and that every
 * formula reads only inputs and earlier outputs and is finite at the defaults.
 * @param item - schema-checked calculator.
 * @returns the same item, with a default step on ranges that lack one.
 * @throws BindingError naming the first problem, so the model can correct it.
 */
export function bindCalculator(item) {
    const known = new Set();
    const define = (id) => {
        if (!IDENT.test(id) || Object.hasOwn(FUNCTIONS, id))
            throw new BindingError(`calculator: "${id}" is not a usable name`);
        if (known.has(id))
            throw new BindingError(`calculator: name "${id}" is defined twice`);
        known.add(id);
    };
    const inputs = item.inputs.map((input) => {
        define(input.id);
        if (input.options !== undefined) {
            if (input.min !== undefined || input.max !== undefined || input.step !== undefined) {
                throw new BindingError(`calculator: input ${input.id} has options, so it takes no min, max or step`);
            }
            if (new Set(input.options).size !== input.options.length)
                throw new BindingError(`calculator: input ${input.id} repeats an option`);
            if (!input.options.includes(input.value))
                throw new BindingError(`calculator: input ${input.id} default is not one of its options`);
            return input;
        }
        const { min, max } = input;
        if (min === undefined || max === undefined || !(min < max))
            throw new BindingError(`calculator: input ${input.id} needs options, or min < max`);
        if (input.value < min || input.value > max)
            throw new BindingError(`calculator: input ${input.id} default is outside min..max`);
        return { ...input, step: input.step ?? (max - min) / 100 };
    });
    const formulas = item.outputs.map((output) => {
        const formula = parseFormula(output.formula);
        for (const name of formula.names) {
            if (!known.has(name))
                throw new BindingError(`calculator: output "${output.label}" reads unknown name ${name}`);
        }
        if (output.id !== undefined)
            define(output.id);
        return formula;
    });
    const bound = { ...item, inputs };
    const defaults = computeCalculator(bound, inputs.map(input => input.value), formulas);
    const broken = defaults.findIndex(value => value === null);
    if (broken >= 0)
        throw new BindingError(`calculator: output "${item.outputs[broken]?.label}" is not a finite number at the default inputs`);
    return bound;
}
//# sourceMappingURL=formula.js.map