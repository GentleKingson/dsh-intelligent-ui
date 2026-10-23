/**
 * Conservative cell parsing for charts. A column is plottable only when every
 * non-missing cell is a plain number with the same unit; anything unclear
 * keeps the column table-only. Display always uses the original cell text.
 */
/** Explicit empty markers; they become gaps, never zero. */
const MISSING = new Set(['', '-', '--', '—', '–', 'n/a', 'na', 'null', 'none', '/', '?', '？', '无', '暂无', '缺失', '未知', '未公布']);
const NUMBER = /^(?<pre>[$¥￥€£]?)(?<sign>[+\-−]?)(?<pre2>[$¥￥€£]?)(?<int>\d{1,3}(?:,\d{3})+|\d+)(?<frac>\.\d+)?\s?(?<suf>[%‰°A-Za-zµ一-鿿/]{1,8})?$/u;
/** Significant digits a double represents exactly enough for display parity. */
const SAFE_DIGITS = 15;
/**
 * Classify one cell.
 * @param raw - cell text as shown in the answer.
 * @returns missing, a number with its unit, or text (including unsafe precision).
 */
export function parseCell(raw) {
    const text = raw.trim();
    if (MISSING.has(text.toLowerCase()))
        return { kind: 'missing' };
    const match = NUMBER.exec(text);
    const groups = match?.groups;
    if (groups === undefined)
        return { kind: 'text' };
    const prefix = groups.pre ?? '';
    const prefix2 = groups.pre2 ?? '';
    if (prefix !== '' && prefix2 !== '')
        return { kind: 'text' };
    const integer = (groups.int ?? '').replaceAll(',', '');
    const fraction = groups.frac ?? '';
    const digits = `${integer}${fraction.slice(1)}`.replace(/^0+/, '');
    if (digits.length > SAFE_DIGITS)
        return { kind: 'text' };
    const negative = groups.sign === '-' || groups.sign === '−';
    const value = Number(`${negative ? '-' : ''}${integer}${fraction}`);
    if (!Number.isFinite(value))
        return { kind: 'text' };
    return { kind: 'number', value, unit: `${prefix}${prefix2}|${groups.suf ?? ''}` };
}
const MONTH_NAMES = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const CN_QUARTER = { 一: 1, 二: 2, 三: 3, 四: 4 };
/** Recognized axis label shapes; each maps a label to its position on one scale. */
const AXIS_FORMATS = [
    ['day', /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/, m => date(m[1], m[2], m[3])],
    ['day', /^(\d{4})年(\d{1,2})月(\d{1,2})日$/, m => date(m[1], m[2], m[3])],
    ['month', /^(\d{4})[-/.](\d{1,2})$/, m => date(m[1], m[2])],
    ['month', /^(\d{4})年(\d{1,2})月$/, m => date(m[1], m[2])],
    ['quarter', /^(\d{4})年?\s*[-/ ]?\s*Q([1-4])$/i, m => Number(m[1]) * 4 + Number(m[2])],
    ['quarter', /^(\d{4})年?第?([1-4一二三四])季度$/, m => Number(m[1]) * 4 + (CN_QUARTER[m[2] ?? ''] ?? Number(m[2]))],
    ['q', /^Q([1-4])$/i, m => Number(m[1])],
    ['q', /^第([1-4一二三四])季度$/, m => CN_QUARTER[m[1] ?? ''] ?? Number(m[1])],
    ['m', /^(\d{1,2})月$/, m => date('0', m[1])],
    ['year', /^(\d{4})年?$/, m => Number(m[1])],
];
function date(year = '', month = '', day = '1') {
    const [y, mo, d] = [Number(year), Number(month), Number(day)];
    return mo >= 1 && mo <= 12 && d >= 1 && d <= 31 ? (y * 12 + mo) * 32 + d : null;
}
/** One label's scale and position, or null when it is not a recognized time/sequence label. */
function axisKey(raw) {
    const text = raw.trim();
    for (const [scale, pattern, key] of AXIS_FORMATS) {
        const match = pattern.exec(text);
        if (match !== null) {
            const value = key(match);
            return value === null ? null : { scale, key: value };
        }
    }
    const name = text.toLowerCase().replace(/\.$/, '');
    const month = name.length >= 3 ? MONTH_NAMES.findIndex(full => full.startsWith(name)) : -1;
    if (month >= 0)
        return { scale: 'm', key: month + 1 };
    const nth = /^第\s*(\d+)\s*(年|个?月|周|天|期)$/.exec(text);
    if (nth !== null)
        return { scale: `nth${nth[2]}`, key: Number(nth[1]) };
    const cell = parseCell(text);
    return cell.kind === 'number' ? { scale: `number${cell.unit}`, key: cell.value } : null;
}
/**
 * Whether labels read as one time/sequence axis in the given row order. Rows
 * are never reordered: a shuffled, repeated, or mixed-format axis is not ordered.
 * @param cells - the column's cell texts, in row order.
 * @returns true only for at least two labels on one scale, strictly increasing.
 */
export function isOrderedAxis(cells) {
    const keys = cells.map(axisKey);
    return keys.length >= 2 && keys.every((entry, index) => {
        const previous = index === 0 ? null : keys[index - 1];
        return entry !== null && (previous == null || (previous.scale === entry.scale && previous.key < entry.key));
    });
}
/**
 * Analyze one column's cells.
 * @param cells - the column's cell texts, in row order.
 * @returns plottability and axis suitability.
 */
export function analyzeColumn(cells) {
    const parsed = cells.map(parseCell);
    const categorical = cells.length > 0 && parsed.every(cell => cell.kind !== 'missing');
    const numbers = parsed.filter((cell) => cell.kind === 'number');
    const units = new Set(numbers.map(cell => cell.unit));
    const plottable = numbers.length >= 2 && units.size === 1 && parsed.every(cell => cell.kind !== 'text');
    return {
        numeric: plottable
            ? { unit: numbers[0]?.unit ?? '|', values: parsed.map(cell => cell.kind === 'number' ? cell.value : null) }
            : null,
        categorical,
        ordered: categorical && isOrderedAxis(cells),
    };
}
/**
 * Human-readable unit from an internal `prefix|suffix` key.
 * @param unit - internal unit key.
 * @returns the symbol to show beside axis values, or ''.
 */
export function displayUnit(unit) {
    const [prefix = '', suffix = ''] = unit.split('|');
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
export function valueAxis(values, chart) {
    const finite = values.filter(Number.isFinite);
    let low = finite.length === 0 ? 0 : Math.min(...finite);
    let high = finite.length === 0 ? 0 : Math.max(...finite);
    const magnitude = Math.max(Math.abs(low), Math.abs(high));
    const positive = low > 0;
    const negative = high < 0;
    const zoom = chart === 'scatter' || (chart === 'line' && (positive || negative) && (high - low) * 3 < magnitude);
    if (zoom) {
        const pad = high > low ? (high - low) * 0.1 : (chart === 'scatter' ? Math.max(magnitude * 0.05, 1) : magnitude * 0.05);
        low -= pad;
        high += pad;
    }
    else {
        low = Math.min(0, low);
        high = Math.max(0, high);
    }
    if (low === high)
        high = low + 1;
    const step = niceStep(high - low);
    let min = Math.floor(low / step) * step;
    let max = Math.ceil(high / step) * step;
    // Padding never pushes a one-sided series across zero.
    if (zoom && positive)
        min = Math.max(0, min);
    else if (zoom && negative)
        max = Math.min(0, max);
    const ticks = [];
    for (let tick = min; tick <= max + step / 2; tick += step)
        ticks.push(Number(tick.toPrecision(12)));
    return { min, max, ticks, zeroBased: min <= 0 && max >= 0 };
}
//# sourceMappingURL=numeric.js.map