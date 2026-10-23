/**
 * Arithmetic formulas of the `calculator` component. A formula is parsed into
 * closures over a fixed vocabulary (numbers, names, operators, a few Math
 * functions); nothing is ever evaluated as JavaScript. Client-safe.
 */

import type { IntelligentUiCalculatorItem } from './types.ts'
import { BindingError } from './program.ts'
import { LIMITS } from './limits.ts'

type Env = Readonly<Record<string, number>>
type Fn = (env: Env) => number

const FUNCTIONS: Readonly<Record<string, { min: number; max: number; fn: (...args: number[]) => number }>> = {
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
}

const TOKEN = /\s*(?:(\d+(?:\.\d*)?(?:[eE][+-]?\d+)?|\.\d+(?:[eE][+-]?\d+)?)|([A-Za-z_]\w*)|(\*\*|<=|>=|==|!=|&&|\|\||[-+*/%^()<>?:,!]))/gy

/** A parsed formula and the names it reads. */
export interface Formula {
  readonly evaluate: Fn
  readonly names: ReadonlySet<string>
}

/**
 * Parse one formula.
 * @param source - e.g. `P * r / (1 - (1 + r) ^ -n)`; `^` and `**` are powers, comparisons yield 1 or 0, `c ? a : b` picks.
 * @returns the evaluator and the names it reads.
 * @throws BindingError on any syntax outside the vocabulary.
 */
export function parseFormula(source: string): Formula {
  const tokens: string[] = []
  TOKEN.lastIndex = 0
  while (TOKEN.lastIndex < source.length) {
    const at = TOKEN.lastIndex
    const match = TOKEN.exec(source)
    if (match === null) {
      if (/^\s*$/.test(source.slice(at))) break
      throw new BindingError(`formula: unexpected "${source.slice(at).trim().slice(0, 12)}"`)
    }
    tokens.push(match[1] ?? match[2] ?? match[3] ?? '')
  }
  const names = new Set<string>()
  let pos = 0
  const peek = (): string | undefined => tokens[pos]
  const take = (expected: string): void => {
    if (tokens[pos] !== expected) throw new BindingError(`formula: expected "${expected}"`)
    pos++
  }
  const binary = (next: () => Fn, ops: Readonly<Record<string, (a: number, b: number) => number>>) => (): Fn => {
    let left = next()
    for (let op = peek(); op !== undefined && Object.hasOwn(ops, op); op = peek()) {
      pos++
      const [a, b, apply] = [left, next(), ops[op] as (a: number, b: number) => number]
      left = env => apply(a(env), b(env))
    }
    return left
  }
  const primary = (): Fn => {
    const token = tokens[pos++]
    if (token === undefined) throw new BindingError('formula: ends early')
    if (token === '(') {
      const inner = ternary()
      take(')')
      return inner
    }
    if (/^[\d.]/.test(token)) {
      const value = Number(token)
      return () => value
    }
    if (!/^[A-Za-z_]/.test(token)) throw new BindingError(`formula: unexpected "${token}"`)
    if (peek() !== '(') {
      names.add(token)
      return env => env[token] ?? NaN
    }
    const fn = Object.hasOwn(FUNCTIONS, token) ? FUNCTIONS[token] : undefined
    if (fn === undefined) throw new BindingError(`formula: unknown function ${token}`)
    pos++
    const args: Fn[] = []
    if (peek() !== ')') {
      args.push(ternary())
      while (peek() === ',') { pos++; args.push(ternary()) }
    }
    take(')')
    if (args.length < fn.min || args.length > fn.max) throw new BindingError(`formula: ${token} takes ${fn.min}-${fn.max} arguments`)
    return env => fn.fn(...args.map(arg => arg(env)))
  }
  const unary = (): Fn => {
    const op = peek()
    if (op === '-' || op === '+' || op === '!') {
      pos++
      const operand = unary()
      return op === '-' ? env => -operand(env) : op === '!' ? env => Number(!operand(env)) : operand
    }
    return power()
  }
  // Right-associative, and binds tighter than a leading minus on its left: -2^2 is -4, 2^-1 is 0.5.
  const power = (): Fn => {
    const base = primary()
    const op = peek()
    if (op !== '^' && op !== '**') return base
    pos++
    const exponent = unary()
    return env => base(env) ** exponent(env)
  }
  const product = binary(unary, { '*': (a, b) => a * b, '/': (a, b) => a / b, '%': (a, b) => a % b })
  const sum = binary(product, { '+': (a, b) => a + b, '-': (a, b) => a - b })
  const compare = binary(sum, {
    '<': (a, b) => Number(a < b), '<=': (a, b) => Number(a <= b), '>': (a, b) => Number(a > b),
    '>=': (a, b) => Number(a >= b), '==': (a, b) => Number(a === b), '!=': (a, b) => Number(a !== b),
  })
  const and = binary(compare, { '&&': (a, b) => Number(a !== 0 && b !== 0) })
  const or = binary(and, { '||': (a, b) => Number(a !== 0 || b !== 0) })
  const ternary = (): Fn => {
    const condition = or()
    if (peek() !== '?') return condition
    pos++
    const yes = ternary()
    take(':')
    const no = ternary()
    return env => condition(env) !== 0 ? yes(env) : no(env)
  }
  const evaluate = ternary()
  if (pos !== tokens.length) throw new BindingError(`formula: unexpected "${tokens[pos]}"`)
  return { evaluate, names }
}

/**
 * Outputs of a calculator for the given input values, in order; an output
 * that fails or is not finite is `null` and shows as missing, alone.
 * @param item - a calculator already accepted by {@link bindCalculator}.
 * @param values - one value per input.
 * @param formulas - parsed outputs, when the caller keeps them.
 * @returns one value or `null` per output.
 */
export function computeCalculator(
  item: IntelligentUiCalculatorItem,
  values: readonly number[],
  formulas: readonly Formula[] = item.outputs.map(output => parseFormula(output.formula)),
): (number | null)[] {
  return evaluateOutputs(item, values, formulas).results
}

function evaluateOutputs(item: IntelligentUiCalculatorItem, values: readonly number[], formulas: readonly Formula[]) {
  const env: Record<string, number> = Object.create(null) as Record<string, number>
  item.inputs.forEach((input, index) => { env[input.id] = values[index] ?? input.value })
  const results = item.outputs.map((output, index) => {
    const value = formulas[index]?.evaluate(env) ?? NaN
    if (output.id !== undefined) env[output.id] = value
    return Number.isFinite(value) ? value : null
  })
  return { env, results }
}

/** Parsed formulas of a calculator's optional series. */
export interface SeriesFormulas {
  readonly from: Formula
  readonly to: Formula
  readonly columns: readonly Formula[]
}

/** Rows of a calculator series for the current inputs. */
export interface SeriesRows {
  /** Index values, one per row. */
  readonly index: readonly number[]
  /** One cell per column; `null` where a formula fails or is not finite. */
  readonly rows: readonly (readonly (number | null)[])[]
  /** The range held more rows than a table may show; only the first are kept. */
  readonly truncated: boolean
}

/**
 * Parse a series' formulas.
 * @param series - the calculator's series.
 * @returns parsed `from`, `to` and column formulas.
 */
export function parseSeries(series: NonNullable<IntelligentUiCalculatorItem['series']>): SeriesFormulas {
  return { from: parseFormula(series.from), to: parseFormula(series.to), columns: series.columns.map(column => parseFormula(column.formula)) }
}

/**
 * Recompute a calculator's series: the index runs from `from` to `to` by
 * `step`, and each column formula reads the inputs, every output and the index.
 * @param item - a calculator with a series, accepted by {@link bindCalculator}.
 * @param values - one value per input.
 * @param formulas - parsed outputs and series.
 * @returns the rows, or none when the range is not finite or runs backwards.
 */
export function computeSeries(
  item: IntelligentUiCalculatorItem,
  values: readonly number[],
  formulas: { readonly outputs: readonly Formula[]; readonly series: SeriesFormulas },
): SeriesRows {
  const series = item.series
  if (series === undefined) return { index: [], rows: [], truncated: false }
  const { env } = evaluateOutputs(item, values, formulas.outputs)
  const from = formulas.series.from.evaluate(env)
  const to = formulas.series.to.evaluate(env)
  if (!Number.isFinite(from) || !Number.isFinite(to) || to < from) return { index: [], rows: [], truncated: false }
  // Rounded so float noise in (to - from) / step neither drops nor adds the last row.
  const count = Math.floor((to - from) / series.step + 1e-9) + 1
  const index = Array.from({ length: Math.min(count, LIMITS.tableRows) }, (_, at) => Number((from + at * series.step).toPrecision(12)))
  const rows = index.map((x) => {
    env[series.x] = x
    return formulas.series.columns.map((column) => {
      const value = column.evaluate(env)
      return Number.isFinite(value) ? value : null
    })
  })
  return { index, rows, truncated: count > LIMITS.tableRows }
}

const IDENT = /^[A-Za-z_]\w{0,31}$/

/** The value lies on min + k·step, within float noise. */
const onGrid = (value: number, min: number, step: number): boolean => {
  const steps = (value - min) / step
  return Math.abs(steps - Math.round(steps)) < 1e-9
}

/**
 * A round step for a range without one: a power of ten near 1/100 of the
 * range (1 for an all-integer range), refined until the default lies on it.
 */
function defaultStep(min: number, max: number, value: number): number {
  let step = 10 ** Math.floor(Math.log10((max - min) / 100))
  if ([min, max, value].every(Number.isInteger)) step = Math.max(1, step)
  while (!onGrid(value, min, step) && step > 1e-9) step /= 10
  return step
}

/**
 * Keep a reader's value inside the input's declared range; options need no clamp.
 * @param input - one bound calculator input.
 * @param value - the value the reader entered.
 * @returns the value the formulas may read.
 */
export function clampInput(input: IntelligentUiCalculatorItem['inputs'][number], value: number): number {
  return Math.min(input.max ?? value, Math.max(input.min ?? value, value))
}

/**
 * Check a calculator written by the model: names, ranges, and that every
 * formula reads only inputs and earlier outputs and is finite at the defaults.
 * @param item - schema-checked calculator.
 * @returns the same item, with a default step on ranges that lack one.
 * @throws BindingError naming the first problem, so the model can correct it.
 */
export function bindCalculator(item: IntelligentUiCalculatorItem): IntelligentUiCalculatorItem {
  const known = new Set<string>()
  const define = (id: string): void => {
    if (!IDENT.test(id) || Object.hasOwn(FUNCTIONS, id)) throw new BindingError(`calculator: "${id}" is not a usable name`)
    if (known.has(id)) throw new BindingError(`calculator: name "${id}" is defined twice`)
    known.add(id)
  }
  const inputs = item.inputs.map((input) => {
    define(input.id)
    if (input.options !== undefined) {
      if (input.min !== undefined || input.max !== undefined || input.step !== undefined) {
        throw new BindingError(`calculator: input ${input.id} has options, so it takes no min, max or step`)
      }
      if (new Set(input.options).size !== input.options.length) throw new BindingError(`calculator: input ${input.id} repeats an option`)
      if (!input.options.includes(input.value)) throw new BindingError(`calculator: input ${input.id} default is not one of its options`)
      return input
    }
    const { min, max } = input
    if (min === undefined || max === undefined || !(min < max)) throw new BindingError(`calculator: input ${input.id} needs options, or min < max`)
    if (input.value < min || input.value > max) throw new BindingError(`calculator: input ${input.id} default is outside min..max`)
    if (input.step === undefined) return { ...input, step: defaultStep(min, max, input.value) }
    if (input.step > max - min) throw new BindingError(`calculator: input ${input.id} step is larger than max - min`)
    // A slider draws an off-grid default at the nearest step, so the thumb and the results would disagree.
    if (!onGrid(input.value, min, input.step)) throw new BindingError(`calculator: input ${input.id} default is not min + a whole number of steps`)
    return input
  })
  const formulas = item.outputs.map((output) => {
    const formula = parseFormula(output.formula)
    for (const name of formula.names) {
      if (!known.has(name)) throw new BindingError(`calculator: output "${output.label}" reads unknown name ${name}`)
    }
    if (output.id !== undefined) define(output.id)
    return formula
  })
  const bound = { ...item, inputs }
  const defaults = computeCalculator(bound, inputs.map(input => input.value), formulas)
  const broken = defaults.findIndex(value => value === null)
  if (broken >= 0) throw new BindingError(`calculator: output "${item.outputs[broken]?.label}" is not a finite number at the default inputs`)
  if (item.series === undefined) return bound
  const { series } = item
  // The index is visible only inside the series, so it may not shadow an input or output.
  define(series.x)
  const parsed = parseSeries(series)
  for (const [what, formula] of [['from', parsed.from], ['to', parsed.to], ...parsed.columns.map((column, at) => [series.columns[at]?.label ?? '', column] as const)] as const) {
    for (const name of formula.names) {
      const readable = known.has(name) && (name !== series.x || (what !== 'from' && what !== 'to'))
      if (!readable) throw new BindingError(`calculator: series ${what} reads unknown name ${name}`)
    }
  }
  const { index, rows, truncated } = computeSeries(bound, inputs.map(input => input.value), { outputs: formulas, series: parsed })
  if (index.length === 0) throw new BindingError('calculator: series from..to is empty or not finite at the default inputs')
  if (truncated) throw new BindingError(`calculator: series has more than ${LIMITS.tableRows} rows at the default inputs`)
  const column = series.columns.findIndex((_, at) => rows.some(row => row[at] === null))
  if (column >= 0) throw new BindingError(`calculator: series column "${series.columns[column]?.label}" is not a finite number for every row at the default inputs`)
  return bound
}
