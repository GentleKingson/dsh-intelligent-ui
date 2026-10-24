/**
 * The interactive region appended under one finished answer. Every string it
 * shows was copied from that answer by the Host; interactions are local only.
 */

import { Component, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { MarkdownText } from '@deepseek-ai/dsh-client-ui-primitives'
import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import type {
  IntelligentUiCalculatorItem, IntelligentUiCardsItem, IntelligentUiChartItem, IntelligentUiChecklistItem, IntelligentUiCodeItem, IntelligentUiExplorerItem, IntelligentUiItem, IntelligentUiScenariosItem, IntelligentUiTableData,
  IntelligentUiView,
} from '../types.ts'
import { analyzeColumn, parseCell, valueAxis } from '../numeric.ts'
import { explore, explorerDefaults, explorerPlot } from '../explorer.ts'
import { clampInput, computeCalculator, computeSeries, parseFormula, parseSeries, seriesLabel } from '../formula.ts'
import type { SeriesRows } from '../formula.ts'
import type { NS } from './locales.ts'

type T = TranslateNS<typeof NS>

/** Renders nothing when any part of the view throws; the original answer stays. */
export class ViewBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false }
  static getDerivedStateFromError(): { failed: boolean } { return { failed: true } }
  override render(): ReactNode { return this.state.failed ? null : this.props.children }
}

/** Cell kind for styling, plus a sign so losses and other negatives stand out wherever a value is shown. */
function cellData(text: string): { 'data-kind': string; 'data-sign'?: 'negative' } {
  const cell = parseCell(text)
  return cell.kind === 'number' && cell.value < 0 ? { 'data-kind': cell.kind, 'data-sign': 'negative' } : { 'data-kind': cell.kind }
}

function Markdown({ text, t }: { text: string; t: T }) {
  const labels = useMemo(() => ({
    code: { copyLabel: t('markdown.copy'), copiedLabel: t('markdown.copied') },
    footnotes: t('markdown.footnotes'),
  }), [t])
  return <MarkdownText text={text} labels={labels} variant="compact" />
}

/**
 * The collapsible, closable region.
 * @param props - resolved view and translator.
 * @returns the region, plus a restore button once closed.
 */
export function Region({ view, t }: { view: IntelligentUiView; t: T }) {
  const [open, setOpen] = useState(true)
  const [closed, setClosed] = useState(false)
  const bodyId = useId()
  const [note, main] = view.items
  const composed = view.items.length === 2 && note?.type === 'markdown' && note.markdown.length <= 320
    && (main?.type === 'chart' || (main?.type === 'table' && main.presentation === undefined))
  // Collapsing or closing only hides the view, so checklist edits and calculator inputs survive reopening.
  return (
    <>
    {closed && <button type="button" className="diu-link" onClick={() => { setClosed(false) }}>{t('region.reopen')}</button>}
    <section className="diu-region" aria-label={t('region.label')} hidden={closed}>
      <header className="diu-head">
        <button type="button" className="diu-toggle" aria-expanded={open} aria-controls={bodyId}
          onClick={() => { setOpen(!open) }} title={t(open ? 'region.collapse' : 'region.expand')}>
          <span aria-hidden="true" className={open ? 'diu-caret diu-open' : 'diu-caret'}>▸</span>
          {t('region.title')}
        </button>
        <button type="button" className="diu-icon" aria-label={t('region.close')} title={t('region.close')}
          onClick={() => { setClosed(true) }}>×</button>
      </header>
      <div id={bodyId} className={composed ? 'diu-body diu-composed' : 'diu-body'} hidden={!open}>
        {view.items.map((item, index) => <Item key={index} item={item} t={t} />)}
      </div>
    </section>
    </>
  )
}

function Item({ item, t, scale }: { item: IntelligentUiItem; t: T; scale?: readonly number[] | undefined }) {
  switch (item.type) {
    case 'markdown': return <div className="diu-md"><Markdown text={item.markdown} t={t} /></div>
    case 'cards': return <Cards item={item} t={t} />
    case 'table': return item.presentation === 'comparison' ? <Comparison table={item.table} t={t} /> : <TableView table={item.table} t={t} />
    case 'chart': return <Chart item={item} t={t} scale={scale} />
    case 'scenarios': return <Scenarios item={item} t={t} />
    case 'explorer': return <Explorer item={item} t={t} />
    case 'calculator': return <Calculator item={item} t={t} />
    case 'code': return <CodeTabs item={item} t={t} />
    case 'checklist': return <Checklist item={item} t={t} />
    default: return null
  }
}

/** One literal code block per tab; the fence outruns any backtick run in the code, so nothing renders as markup. */
function CodeTabs({ item, t }: { item: IntelligentUiCodeItem; t: T }) {
  const [selected, setSelected] = useState(0)
  const tab = item.tabs[selected] ?? item.tabs[0]
  if (tab === undefined) return null
  const fence = '`'.repeat(Math.max(3, ...[...tab.code.matchAll(/`+/g)].map(run => run[0].length + 1)))
  return (
    <div className="diu-code">
      <div className="diu-segments" role="group" aria-label={t('code.label')}>
        {item.tabs.map((entry, index) => (
          <button key={index} type="button" aria-pressed={index === selected} onClick={() => { setSelected(index) }}>{entry.label}</button>
        ))}
      </div>
      <div className="diu-md"><Markdown text={`${fence}${tab.language}\n${tab.code}\n${fence}`} t={t} /></div>
    </div>
  )
}

/** Ticks, additions and removals stay in this view; nothing is saved or sent. */
function Checklist({ item, t }: { item: IntelligentUiChecklistItem; t: T }) {
  const initial = (): { id: number; text: string; checked: boolean; group?: string | undefined }[] => item.items.map((entry, id) => ({ ...entry, id }))
  const [entries, setEntries] = useState(initial)
  const [draft, setDraft] = useState('')
  const next = useRef(item.items.length)
  const done = entries.filter(entry => entry.checked).length
  const groups = [...new Set(entries.map(entry => entry.group))]
  const add = (): void => {
    const text = draft.trim()
    if (text === '') return
    setEntries([...entries, { id: next.current++, text, checked: false }])
    setDraft('')
  }
  return (
    <section className="diu-explorer diu-checklist" aria-label={item.title}>
      <div className="diu-explorer-head">
        <div className="diu-chart-title" role="heading" aria-level={3}>{item.title}</div>
        <span className="diu-muted" aria-live="polite">{t('checklist.progress', { done, total: entries.length })}</span>
        <button type="button" className="diu-link" onClick={() => { setEntries(initial()) }}>{t('calculator.reset')}</button>
      </div>
      {groups.map(group => (
        <div key={group ?? ''} role="group" aria-label={group}>
          {group !== undefined && <div className="diu-checklist-group">{group}</div>}
          <ul>
            {entries.filter(entry => entry.group === group).map(entry => (
              <li key={entry.id}>
                <label>
                  <input type="checkbox" checked={entry.checked}
                    onChange={() => { setEntries(entries.map(other => other.id === entry.id ? { ...other, checked: !other.checked } : other)) }} />
                  <span>{entry.text}</span>
                </label>
                {item.editable && (
                  <button type="button" className="diu-icon" aria-label={t('checklist.remove', { text: entry.text })} title={t('checklist.remove', { text: entry.text })}
                    onClick={() => { setEntries(entries.filter(other => other.id !== entry.id)) }}>×</button>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
      {item.editable && (
        <form className="diu-checklist-add" onSubmit={(event) => { event.preventDefault(); add() }}>
          <input type="text" value={draft} maxLength={200} placeholder={t('checklist.placeholder')} aria-label={t('checklist.placeholder')}
            onChange={(event) => { setDraft(event.target.value) }} />
          <button type="submit" className="diu-link" disabled={draft.trim() === ''}>{t('checklist.add')}</button>
        </form>
      )}
    </section>
  )
}

/** Local inputs drive arithmetic outputs; nothing is sent anywhere. */
function Calculator({ item, t }: { item: IntelligentUiCalculatorItem; t: T }) {
  const defaults = useMemo(() => item.inputs.map(input => input.value), [item])
  const [values, setValues] = useState(defaults)
  // Text of a number box being edited: it may be empty or partial ("", "1.") while the reader types.
  const [drafts, setDrafts] = useState<Readonly<Record<string, string>>>({})
  const formulas = useMemo(() => item.outputs.map(output => parseFormula(output.formula)), [item])
  const results = useMemo(() => computeCalculator(item, values, formulas), [item, values, formulas])
  const seriesFormulas = useMemo(() => item.series === undefined ? undefined : parseSeries(item.series), [item])
  const series = useMemo(() => seriesFormulas === undefined ? undefined
    : computeSeries(item, values, { outputs: formulas, series: seriesFormulas }), [item, values, formulas, seriesFormulas])
  const id = useId()
  // Formulas only ever read in-range values; while typing passes through 1 → 10 → 100 the box keeps its text.
  const set = (index: number, value: number): void => {
    const input = item.inputs[index]
    if (input === undefined || !Number.isFinite(value)) return
    setValues(current => current.map((old, at) => at === index ? clampInput(input, value) : old))
  }
  const settle = (inputId: string): void => {
    const { [inputId]: _, ...rest } = drafts
    setDrafts(rest)
  }
  return (
    <section className="diu-explorer diu-calculator" aria-label={item.title}>
      <div className="diu-explorer-head">
        <div className="diu-chart-title" role="heading" aria-level={3}>{item.title}</div>
        <button type="button" className="diu-link" disabled={Object.keys(drafts).length === 0 && values.every((value, index) => value === defaults[index])}
          onClick={() => { setValues(defaults); setDrafts({}) }}>{t('calculator.reset')}</button>
      </div>
      <div className="diu-filter-fields">
        {item.inputs.map((input, index) => {
          const value = values[index] ?? input.value
          const unit = input.unit === undefined ? '' : ` ${input.unit}`
          if (input.options !== undefined) {
            return (
              <div key={input.id} className="diu-calc-input" role="group" aria-label={input.label}>
                <span>{input.label}</span>
                <div className="diu-segments">
                  {input.options.map(option => (
                    <button key={option} type="button" aria-pressed={option === value} onClick={() => { set(index, option) }}>{formatNumber(option)}{unit}</button>
                  ))}
                </div>
              </div>
            )
          }
          return (
            <div key={input.id} className="diu-calc-input">
              <label htmlFor={`${id}-${input.id}`}>{input.label}{unit && ` (${input.unit})`}</label>
              <div className="diu-calc-range">
                <input type="range" aria-label={input.label} min={input.min} max={input.max} step={input.step} value={value}
                  onChange={(event) => { settle(input.id); set(index, Number(event.target.value)) }} />
                <input id={`${id}-${input.id}`} type="number" min={input.min} max={input.max} step={input.step}
                  value={drafts[input.id] ?? value}
                  onChange={(event) => {
                    const text = event.target.value
                    setDrafts({ ...drafts, [input.id]: text })
                    // An empty or unfinished entry keeps the last number until it parses.
                    if (text.trim() !== '') set(index, Number(text))
                  }}
                  onBlur={() => { settle(input.id) }} />
              </div>
            </div>
          )
        })}
      </div>
      <div aria-live="polite" aria-atomic="true">
        <div className="diu-metrics">
          {item.outputs.map((output, index) => {
            // Round first, so float noise such as -0.0000001 shows as 0.00 rather than a red -0.00.
            const value = results[index] == null ? null : Number(results[index].toFixed(output.decimals)) || 0
            if (output.hidden === true) return null
            return (
              <div key={index} className="diu-metric">
                <span className="diu-muted">{output.label}</span>
                <strong data-sign={value !== null && value < 0 ? 'negative' : undefined}>
                  {value === null ? '—' : value.toLocaleString(undefined, { minimumFractionDigits: output.decimals, maximumFractionDigits: output.decimals })}
                  {output.unit && <small>{output.unit}</small>}
                </strong>
              </div>
            )
          })}
        </div>
        <div className="diu-metric-note diu-muted">{t('calculator.live')}</div>
      </div>
      {item.series !== undefined && series !== undefined && <CalculatorSeries spec={item.series} rows={series} t={t} />}
      {/* Wrong logic would otherwise be silent; the formulas let the reader check what the numbers mean. */}
      <details className="diu-details">
        <summary>{t('calculator.formulas')}</summary>
        <dl className="diu-aspects">
          {item.outputs.map((output, index) => (
            <div key={index}><dt>{output.label}{output.id !== undefined && ` · ${output.id}`}</dt><dd><code>{output.formula}</code></dd></div>
          ))}
          {item.series !== undefined && (
            <div><dt>{item.series.label} · {item.series.x}</dt><dd><code>{item.series.from} … {item.series.to}{item.series.step === 1 ? '' : ` (+${formatNumber(item.series.step)})`}</code></dd></div>
          )}
          {item.series?.columns.map((column, index) => (
            <div key={`s${index}`}><dt>{column.label}</dt><dd><code>{column.formula}</code></dd></div>
          ))}
        </dl>
      </details>
    </section>
  )
}

/** A calculator's recomputed rows, drawn by the same chart and table as model-written data. */
function CalculatorSeries({ spec, rows, t }: { spec: NonNullable<IntelligentUiCalculatorItem['series']>; rows: SeriesRows; t: T }) {
  const view = useMemo(() => {
    // en-US grouping is what the shared cell parser reads back for sorting and the chart's data view.
    const cell = (value: number | null, decimals: number): string => value === null ? '—'
      : value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    const table: IntelligentUiTableData = {
      headers: [spec.label, ...spec.columns.map(column => column.unit === undefined ? column.label : `${column.label}（${column.unit}）`)],
      align: ['left', ...spec.columns.map(() => 'right' as const)],
      rows: rows.index.map((x, at) => [seriesLabel(x), ...spec.columns.map((column, index) => cell(rows.rows[at]?.[index] ?? null, column.decimals))]),
    }
    if (spec.chart === undefined || rows.index.length === 0) return { table, chart: undefined }
    const unit = spec.columns[0]?.unit ?? ''
    const plotted = spec.columns.flatMap((column, index) => (column.unit ?? '') === unit ? [{ column, index }] : [])
    const others = spec.columns.filter(column => (column.unit ?? '') !== unit).map(column => column.label)
    const chart: IntelligentUiChartItem = {
      type: 'chart', chart: spec.chart, xLabel: spec.label, unit, categories: rows.index.map(seriesLabel), table,
      // Tooltips and the axis show what the table shows, not float tails such as 928,877.5212385055.
      series: plotted.map(({ column, index }) => ({
        name: column.label,
        values: rows.rows.map((row) => { const value = row[index] ?? null; return value === null ? null : Number(value.toFixed(column.decimals)) }),
      })),
      tableOnly: others.length > 0 ? others : undefined,
    }
    return { table, chart }
  }, [spec, rows])
  return (
    <div className="diu-calc-series">
      {view.chart === undefined ? <TableView table={view.table} t={t} /> : <Chart item={view.chart} t={t} />}
      {rows.truncated && <div className="diu-muted">{t('calculator.truncated', { count: rows.index.length })}</div>}
    </div>
  )
}

/** Switches between precomputed options; nothing is recomputed here. */
function Scenarios({ item, t }: { item: IntelligentUiScenariosItem; t: T }) {
  const [selected, setSelected] = useState(0)
  const option = item.options[selected] ?? item.options[0]
  // Charts in the same place share one value axis, so switching shows the change rather than a rescaled copy.
  const scale = (index: number): readonly number[] | undefined => {
    const charts = item.options.flatMap(entry => entry.items[index]?.type === 'chart' ? [entry.items[index]] : [])
    if (charts.length !== item.options.length) return undefined
    return charts.flatMap(chart => chart.series.flatMap(series => series.values)).filter((value): value is number => value !== null)
  }
  return (
    <div className="diu-scenarios">
      <div className="diu-segments" role="group" aria-label={item.label}>
        <span className="diu-muted">{item.label}</span>
        {item.options.map((entry, index) => (
          <button key={index} type="button" aria-pressed={index === selected} onClick={() => { setSelected(index) }}>{entry.name}</button>
        ))}
      </div>
      <div className="diu-scenario">
        {option?.items.map((child, index) => <Item key={index} item={child} t={t} scale={scale(index)} />)}
      </div>
    </div>
  )
}

/** One state owner for the filters, computed summaries and complete record inspector. */
function Explorer({ item, t }: { item: IntelligentUiExplorerItem; t: T }) {
  const [filters, setFilters] = useState(() => explorerDefaults(item))
  const [selectedKey, setSelected] = useState(item.table.rows[0]?.[item.selection] ?? '')
  const [query, setQuery] = useState('')
  const id = useId()
  const { rows, selected, metrics } = useMemo(() => explore(item, filters, selectedKey, 0, query), [item, filters, selectedKey, query])
  const visibleTable = useMemo(() => ({ ...item.table, rows }), [item.table, rows])
  const at = selected === undefined ? -1 : rows.indexOf(selected)
  const selectRow = (row: readonly string[]): void => {
    setFilters(filters.map((value, index) => value === null || value === row[item.filters[index]?.column ?? 0]
      ? value : row[item.filters[index]?.column ?? 0] ?? ''))
    setSelected(row[item.selection] ?? '')
  }
  return (
    <section className="diu-explorer" aria-label={item.title}>
      <div className="diu-explorer-head">
        <div className="diu-chart-title" role="heading" aria-level={3}>{item.title}</div>
        <button type="button" className="diu-link" onClick={() => {
          setFilters(explorerDefaults(item)); setQuery(''); setSelected(item.table.rows[0]?.[item.selection] ?? '')
        }}>{t('explorer.reset')}</button>
      </div>
      <div className="diu-filter-fields">
        <label>
          <span>{t('explorer.search')}</span>
          <input type="search" value={query} placeholder={t('table.filterPlaceholder')} onChange={(event) => {
            const next = event.target.value
            setQuery(next)
            setSelected(explore(item, filters, selectedKey, 0, next).selected?.[item.selection] ?? '')
          }} />
        </label>
        {item.filters.map((filter, index) => {
          const options = [...new Set(item.table.rows.map(row => row[filter.column] ?? ''))]
          const value = filters[index]
          return (
            <label key={filter.column}>
              <span>{item.table.headers[filter.column]}</span>
              <select value={value == null ? '' : options.indexOf(value)} onChange={(event) => {
                const next = [...filters]
                next[index] = event.target.value === '' ? null : options[Number(event.target.value)] ?? ''
                // A4 and B4 may name the same step in two scenarios; keep its position when names differ.
                const nextSelected = explore(item, next, selectedKey, item.steps ? at : 0, query).selected
                setFilters(next)
                setSelected(nextSelected?.[item.selection] ?? '')
              }}>
                {filter.all && <option value="">{t('explorer.all')}</option>}
                {options.map((option, at) => <option key={at} value={at}>{option || t('chart.missing')}</option>)}
              </select>
            </label>
          )
        })}
      </div>
      {item.plot !== undefined && <ExplorerPlot item={item} rows={rows} selected={selected} onSelect={selectRow} t={t} />}
      {metrics.length > 0 && (
        <div aria-live="polite" aria-atomic="true">
          <div className="diu-metrics">
            {metrics.map((metric, index) => (
              <div key={index} className="diu-metric">
                <span className="diu-muted">{metric.label}</span>
                <strong>{metric.value === null ? '—' : metric.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}{metric.unit && ` ${metric.unit}`}</strong>
                {metric.count !== undefined && <span className="diu-muted">n={metric.count}</span>}
              </div>
            ))}
          </div>
          <div className="diu-metric-note diu-muted">{t('explorer.computed')}</div>
        </div>
      )}
      <section className="diu-card diu-selection" aria-label={t('explorer.details')}>
        <div className="diu-selection-control">
          <label htmlFor={`${id}-record`}>{item.table.headers[item.selection]}</label>
          <select id={`${id}-record`} disabled={selected === undefined} value={selected?.[item.selection] ?? ''}
            onChange={(event) => { setSelected(event.target.value) }}>
            {rows.map(row => <option key={row[item.selection]} value={row[item.selection]}>{row[item.selection]}</option>)}
          </select>
        </div>
        {item.steps && (
          <div className="diu-stepper">
            <button type="button" disabled={at <= 0} onClick={() => { setSelected(rows[at - 1]?.[item.selection] ?? '') }}>{t('explorer.previous')}</button>
            <span className="diu-muted">{at + 1} / {rows.length}</span>
            <button type="button" disabled={at < 0 || at >= rows.length - 1}
              onClick={() => { setSelected(rows[at + 1]?.[item.selection] ?? '') }}>{t('explorer.next')}</button>
          </div>
        )}
        {selected === undefined ? <p role="status">{t('table.empty')}</p> : (
          <dl className="diu-aspects" aria-live="polite" aria-atomic="true">
            {item.table.headers.map((header, column) => (
              <div key={column} className={(selected[column]?.length ?? 0) > 100 ? 'diu-wide' : undefined}>
                <dt>{header}</dt><dd {...cellData(selected[column] ?? '')}>{selected[column]}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>
      {/* Without a plot the rows are the main content (e.g. a list to browse), so they start visible. */}
      <details className="diu-details" open={item.plot === undefined}>
        <summary>{t('explorer.source', { shown: rows.length, total: item.table.rows.length })}</summary>
        {/* The explorer's search and filters already chose these rows; a second keyword box would diverge from them. */}
        <TableView table={visibleTable} t={t} onSelect={selectRow} selectedRow={selected} selectColumn={item.selection} searchable={false} />
      </details>
    </section>
  )
}

/** React owns the SVG and delegates every selection to the explorer's single state owner. */
function ExplorerPlot({ item, rows, selected, onSelect, t }: {
  item: IntelligentUiExplorerItem; rows: readonly (readonly string[])[]; selected: readonly string[] | undefined
  onSelect: (row: readonly string[]) => void; t: T
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(640)
  const id = useId()
  useEffect(() => {
    const node = ref.current
    if (node === null || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(([entry]) => {
      if (entry !== undefined && entry.contentRect.width > 0) setWidth(Math.max(240, Math.round(entry.contentRect.width)))
    })
    observer.observe(node)
    return () => { observer.disconnect() }
  }, [])
  const data = useMemo(() => explorerPlot(item, rows), [item, rows])
  const plot = item.plot
  if (data === undefined || plot === undefined) return null
  const scatter = plot.type === 'scatter'
  const groups = data.groups.map((name, index) => ({ name, index })).filter(group => data.points.some(point => point.group === group.index))
  const height = scatter ? 280 : Math.max(1, groups.length) * 84 + 60
  const left = 60, right = width - 24, top = 20, bottom = height - 38
  const x = (value: number) => left + (value - data.xAxis.min) / (data.xAxis.max - data.xAxis.min) * (right - left)
  const y = (point: typeof data.points[number]) => scatter
    ? bottom - (point.y - data.yAxis.min) / (data.yAxis.max - data.yAxis.min) * (bottom - top)
    : 30 + groups.findIndex(group => group.index === point.group) * 84
  const label = (point: typeof data.points[number]) => [item.table.headers[item.selection], point.row[item.selection],
    `${item.table.headers[plot.x]}: ${point.row[plot.x]}`,
    ...(plot.type === 'scatter' ? [`${item.table.headers[plot.y]}: ${point.row[plot.y]}`] : []),
    ...(plot.groupBy === undefined ? [] : [point.row[plot.groupBy]])].join(' · ')
  const chosen = data.points.find(point => point.row === selected)
  return (
    <figure className="diu-chart diu-explorer-plot" aria-labelledby={`${id}-title`}>
      <figcaption id={`${id}-title`}>
        <strong>{t(scatter ? 'plot.scatter' : 'plot.timeline')}</strong>
        <span>{plot.type === 'scatter' ? `${item.table.headers[plot.y]} × ${item.table.headers[plot.x]}` : item.table.headers[plot.x]}</span>
        <span className="diu-muted">{t('plot.count', { shown: data.points.length, total: rows.length })}</span>
      </figcaption>
      {plot.groupBy !== undefined && <div className="diu-legend" aria-label={item.table.headers[plot.groupBy]}>
        {groups.map(group => <span key={group.index} className={`diu-plot-key diu-s${group.index}`}>
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><Marker shape={group.index} x={8} y={8} /></svg>{group.name || t('chart.missing')}
        </span>)}
      </div>}
      <div ref={ref} className="diu-plot">
        {data.points.length === 0 ? <p role="status">{t('plot.empty')}</p> : (
          <svg viewBox={`0 0 ${width} ${height}`} role="group" aria-label={t(scatter ? 'plot.scatter' : 'plot.timeline')}>
            {scatter && data.yAxis.ticks.map(tick => {
              const at = bottom - (tick - data.yAxis.min) / (data.yAxis.max - data.yAxis.min) * (bottom - top)
              return <g key={tick} className="diu-grid"><line x1={left} x2={right} y1={at} y2={at} /><text x={left - 8} y={at + 4} textAnchor="end">{tick.toLocaleString()}</text></g>
            })}
            {data.xAxis.ticks.filter((_, index) => width >= 420 || index % 2 === 0).map(tick => (
              <g key={tick} className="diu-grid"><line x1={x(tick)} x2={x(tick)} y1={top} y2={bottom} />
                <text x={x(tick)} y={height - 16} textAnchor="middle">{tick.toLocaleString()}</text></g>
            ))}
            {!scatter && data.points.map((point, index) => {
              const previous = data.points.slice(0, index).findLast(entry => entry.group === point.group)
              if (previous === undefined) return null
              const interval = point.x - previous.x
              return <g key={index} className={`diu-interval diu-s${point.group}`}>
                <line x1={x(previous.x)} x2={x(point.x)} y1={y(point)} y2={y(point)} />
                <text x={(x(previous.x) + x(point.x)) / 2} y={y(point) + 32} textAnchor="middle">Δ {formatNumber(interval)}{data.unit && ` ${data.unit}`}</text>
              </g>
            })}
            {data.points.map((point, index) => <g key={index} className={`diu-mark diu-s${point.group}`}
              role="button" tabIndex={0} aria-label={label(point)} aria-pressed={point.row === selected}
              onClick={() => { onSelect(point.row) }} onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(point.row) }
              }}>
              <title>{label(point)}</title>
              <circle className="diu-point-hit" cx={x(point.x)} cy={y(point)} r={12} />
              {point.row === selected && <circle className="diu-point-selected" cx={x(point.x)} cy={y(point)} r={9} />}
              <Marker shape={point.group} x={x(point.x)} y={y(point)} />
              {!scatter && <text x={x(point.x)} y={y(point) - 16} textAnchor="middle">{point.row[plot.x]}</text>}
            </g>)}
          </svg>
        )}
      </div>
      <div className="diu-muted" role="status">{chosen === undefined
        ? selected === undefined ? t('table.empty') : t('plot.selectedMissing')
        : label(chosen)}</div>
      {!scatter && <div className="diu-muted">{t('plot.interval')}</div>}
    </figure>
  )
}

const CLAMP_CHARS = 400

function Cards({ item, t }: { item: IntelligentUiCardsItem; t: T }) {
  return (
    <ul className="diu-cards">
      {item.cards.map((card, index) => <CardView key={index} title={card.title} markdown={card.markdown} t={t} />)}
    </ul>
  )
}

function CardView({ title, markdown, t }: { title: string; markdown: string; t: T }) {
  const long = markdown.length > CLAMP_CHARS
  const [expanded, setExpanded] = useState(!long)
  const bodyId = useId()
  return (
    <li className="diu-card">
      <div className="diu-card-title" role="heading" aria-level={4}>{title}</div>
      <div id={bodyId} className={expanded ? 'diu-card-body' : 'diu-card-body diu-clamped'}><Markdown text={markdown} t={t} /></div>
      {long && (
        <button type="button" className="diu-link" aria-expanded={expanded} aria-controls={bodyId}
          onClick={() => { setExpanded(!expanded) }}>{t(expanded ? 'card.collapse' : 'card.expand')}</button>
      )}
    </li>
  )
}

/** Source cells stay plain text, as in TableView; card formatting never interprets their Markdown. */
function Comparison({ table, t }: { table: IntelligentUiTableData; t: T }) {
  const [selectedIndex, setSelected] = useState(0)
  const selected = Math.min(selectedIndex, Math.max(0, table.rows.length - 1))
  const row = table.rows[selected]
  const detailsId = useId()
  return (
    <div className="diu-comparison">
      <div className="diu-segments" role="group" aria-label={t('comparison.select')}>
        <span className="diu-muted">{t('comparison.select')}</span>
        {table.rows.map((row, index) => (
          <button key={index} type="button" aria-pressed={index === selected} aria-controls={detailsId}
            onClick={() => { setSelected(index) }}>{row[0]}</button>
        ))}
      </div>
      {row !== undefined && (
        <section id={detailsId} className="diu-card diu-selection" aria-live="polite" aria-atomic="true">
          <div className="diu-card-title" role="heading" aria-level={4}>{row[0]}</div>
          <dl className="diu-aspects">
            {table.headers.slice(1).map((header, column) => (
              <div key={column}><dt>{header}</dt><dd>{row[column + 1]}</dd></div>
            ))}
          </dl>
        </section>
      )}
      <details className="diu-details">
        <summary>{t('comparison.viewTable')}</summary>
        <TableView table={table} t={t} />
      </details>
    </div>
  )
}

type SortDir = 'ascending' | 'descending'

/** Tables this short may hide their filter row; sorting stays on the headers. */
const SMALL_ROWS = 6
/** Longer tables show their first rows until expanded, instead of scrolling inside the answer. */
const FOLD_ROWS = 12
const FOLDED_ROWS = 10
/** Short cells (numbers with units, names) never wrap. */
const NOWRAP_CHARS = 12

function compareCells(left: string, right: string): number {
  const a = parseCell(left)
  const b = parseCell(right)
  if (a.kind === 'number' && b.kind === 'number' && a.unit === b.unit) return a.value - b.value
  return left.localeCompare(right, undefined, { numeric: true })
}

/**
 * Sortable, filterable view of one source table; cells keep their original text.
 * @param props - table data and translator.
 * @returns the table with its controls.
 */
export function TableView({ table, t, onSelect, selectedRow, selectColumn = 0, searchable = true }: {
  table: IntelligentUiTableData; t: T
  onSelect?: ((row: readonly string[]) => void) | undefined
  selectedRow?: readonly string[] | undefined
  selectColumn?: number | undefined
  searchable?: boolean | undefined
}) {
  const [filter, setFilter] = useState('')
  const [sort, setSort] = useState<{ column: number; dir: SortDir } | null>(null)
  const [unfolded, setUnfolded] = useState(false)
  const filterId = useId()
  const alignments = useMemo(() => table.headers.map((_, column) =>
    alignOf(table, column) ?? (analyzeColumn(table.rows.map(row => row[column] ?? '')).numeric === null ? 'left' : 'right'),
  ), [table])
  const rows = useMemo(() => {
    const needle = filter.trim().toLowerCase()
    const kept = needle === '' ? [...table.rows] : table.rows.filter(row => row.some(cell => cell.toLowerCase().includes(needle)))
    if (sort === null) return kept
    const sign = sort.dir === 'ascending' ? 1 : -1
    return kept.sort((left, right) => {
      const a = left[sort.column] ?? ''
      const b = right[sort.column] ?? ''
      // Missing cells always sort last, whatever the direction.
      const missing = (parseCell(a).kind === 'missing' ? 1 : 0) - (parseCell(b).kind === 'missing' ? 1 : 0)
      return missing !== 0 ? missing : sign * compareCells(a, b)
    })
  }, [table, filter, sort])
  const folded = !unfolded && filter.trim() === '' && rows.length > FOLD_ROWS
  const cycle = (column: number): void => {
    setSort(sort?.column !== column ? { column, dir: 'ascending' } : sort.dir === 'ascending' ? { column, dir: 'descending' } : null)
  }
  return (
    <div className="diu-table" data-small={table.rows.length <= SMALL_ROWS || undefined}>
      {searchable && (
        <div className="diu-controls">
          <label htmlFor={filterId} className="diu-sr">{t('table.filter')}</label>
          <input id={filterId} type="search" value={filter} placeholder={t('table.filterPlaceholder')}
            onChange={(event) => { setFilter(event.target.value) }} />
          <button type="button" className="diu-link" disabled={filter === '' && sort === null}
            onClick={() => { setFilter(''); setSort(null) }}>{t('table.clear')}</button>
          <span className="diu-muted" aria-live="polite">{t('table.count', { shown: rows.length, total: table.rows.length })}</span>
        </div>
      )}
      <div className="diu-scroll">
        <table>
          <thead>
            <tr>
              {table.headers.map((header, column) => (
                <th key={column} scope="col" aria-sort={sort?.column === column ? sort.dir : 'none'}
                  style={{ textAlign: alignments[column] }}>
                  <button type="button" onClick={() => { cycle(column) }} title={t('table.sortBy', { column: header })}>
                    {header}
                    <span aria-hidden="true" className="diu-sort">{sort?.column === column ? (sort.dir === 'ascending' ? '▲' : '▼') : '↕'}</span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0
              ? <tr><td colSpan={table.headers.length} className="diu-muted">{t('table.empty')}</td></tr>
              : (folded ? rows.slice(0, FOLDED_ROWS) : rows).map((row, index) => (
                <tr key={index}>
                  {table.headers.map((_, column) => {
                    const text = row[column] ?? ''
                    return <td key={column} className={text.length <= NOWRAP_CHARS ? 'diu-nowrap' : 'diu-wrap'}
                      {...cellData(text)} style={{ textAlign: alignments[column] }}>
                      {onSelect !== undefined && column === selectColumn
                        ? <button type="button" className="diu-link" aria-pressed={row === selectedRow} onClick={() => { onSelect(row) }}>{text}</button>
                        : text}
                    </td>
                  })}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {(folded || (unfolded && rows.length > FOLD_ROWS)) && (
        <button type="button" className="diu-link" aria-expanded={!folded}
          onClick={() => { setUnfolded(!unfolded) }}>{folded ? t('table.showAll', { total: rows.length }) : t('table.showLess')}</button>
      )}
    </div>
  )
}

function alignOf(table: IntelligentUiTableData, column: number): 'left' | 'center' | 'right' | undefined {
  const align = table.align[column]
  return align === undefined || align === 'none' ? undefined : align
}

const WIDTH = 640
const MIN_WIDTH = 240
const HEIGHT = 280
const MARGIN = { top: 16, right: 16, bottom: 44, left: 60 }
const DASHES = ['', '6 3', '2 3', '8 3 2 3']
const KIND = { bar: 'chart.bar', line: 'chart.line', area: 'chart.area', pie: 'chart.pie' } as const
const MAX_X_LABELS = 12
const X_LABEL_SPACING = 40

function formatNumber(value: number): string {
  return value.toLocaleString(undefined, { maximumFractionDigits: 20 })
}

function Marker({ shape, x, y }: { shape: number; x: number; y: number }) {
  switch (shape % 4) {
    case 1: return <rect x={x - 3.5} y={y - 3.5} width={7} height={7} />
    case 2: return <path d={`M${x} ${y - 4.5}L${x + 4.5} ${y + 3.5}L${x - 4.5} ${y + 3.5}Z`} />
    case 3: return <path d={`M${x} ${y - 5}L${x + 5} ${y}L${x} ${y + 5}L${x - 5} ${y}Z`} />
    default: return <circle cx={x} cy={y} r={4} />
  }
}

/**
 * Bar or line chart over verified numeric columns, with tooltip, legend
 * toggles, and a data table disclosure.
 * @param props - chart item and translator.
 * @returns the chart figure.
 */
export function Chart({ item, t, scale }: { item: IntelligentUiChartItem; t: T; scale?: readonly number[] | undefined }) {
  const [hidden, setHidden] = useState<ReadonlySet<number>>(new Set())
  const [active, setActive] = useState<number | null>(null)
  const [selectedIndex, setSelected] = useState(0)
  const [showData, setShowData] = useState(false)
  const dataId = useId()
  // Draw at the rendered width so axis text keeps its size on narrow screens.
  const plotRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(WIDTH)
  useEffect(() => {
    const node = plotRef.current
    if (node === null || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(([entry]) => {
      if (entry !== undefined && entry.contentRect.width > 0) setWidth(Math.max(MIN_WIDTH, Math.round(entry.contentRect.width)))
    })
    observer.observe(node)
    return () => { observer.disconnect() }
  }, [])
  const visible = item.series.map((series, index) => ({ series, index })).filter(entry => !hidden.has(entry.index))
  const values = visible.flatMap(entry => entry.series.values).filter((value): value is number => value !== null)
  // An area's fill measures from zero, so it never zooms like a line.
  const { min, max, ticks, zeroBased } = valueAxis(scale === undefined ? values : [...values, ...scale], item.chart === 'line' ? 'line' : 'bar')
  const plotW = width - MARGIN.left - MARGIN.right
  const plotH = HEIGHT - MARGIN.top - MARGIN.bottom
  const count = item.categories.length
  const selected = Math.min(selectedIndex, Math.max(0, count - 1))
  const selectedRow = item.table.rows[selected]
  const band = plotW / count
  const y = (value: number): number => MARGIN.top + (max - value) / (max - min) * plotH
  const center = (index: number): number => MARGIN.left + band * (index + 0.5)
  // Labels are cut to 10 characters; space them by the longest so "2025-01" labels never run together.
  const spacing = Math.max(X_LABEL_SPACING, Math.min(10, Math.max(...item.categories.map(category => category.length))) * 7 + 8)
  const labelEvery = Math.ceil(count / Math.max(2, Math.min(MAX_X_LABELS, Math.floor(plotW / spacing))))
  const toggle = (index: number): void => {
    const next = new Set(hidden)
    if (next.has(index)) next.delete(index)
    else if (visible.length > 1) next.add(index)
    setHidden(next)
  }
  const label = t('chart.label', {
    kind: t(KIND[item.chart]),
    x: item.xLabel,
    series: item.series.map(series => series.name).join('、'),
  })
  const pointText = (index: number): string => [
    item.categories[index] ?? '',
    ...visible.map(({ series }) => {
      const value = series.values[index]
      return `${series.name}: ${value === null || value === undefined ? t('chart.missing') : `${formatNumber(value)}${item.unit === '' ? '' : ` ${item.unit}`}`}`
    }),
  ].join('；')
  return (
    <figure className="diu-chart">
      <figcaption>
        <span className="diu-chart-title">{t('chart.title', { x: item.xLabel, kind: t(KIND[item.chart]) })}</span>
        {item.unit !== '' && <span className="diu-muted">{t('chart.unit', { unit: item.unit })}</span>}
        {!zeroBased && item.chart !== 'pie' && <span className="diu-muted">{t('chart.axisFrom', { min: formatNumber(min) })}</span>}
        {item.tableOnly !== undefined && <span className="diu-muted">{t('chart.tableOnly', { columns: item.tableOnly.join('、') })}</span>}
      </figcaption>
      {item.chart === 'pie' ? <Pie item={item} selected={selected} onSelect={setSelected} t={t} /> : <>
      <div className="diu-legend" role="group" aria-label={t('chart.legend')}>
        {item.series.map((series, index) => (
          <button key={index} type="button" aria-pressed={!hidden.has(index)} className="diu-legend-item"
            onClick={() => { toggle(index) }}>
            <svg width="22" height="12" aria-hidden="true" className={`diu-s${index}`}>
              <line x1="1" y1="6" x2="21" y2="6" strokeDasharray={item.chart === 'bar' ? undefined : DASHES[index]} />
              <Marker shape={index} x={11} y={6} />
            </svg>
            {series.name}
          </button>
        ))}
      </div>
      <div className="diu-plot" ref={plotRef}>
        <svg viewBox={`0 0 ${width} ${HEIGHT}`} role="img" aria-label={label}
          // A tap ends with a synthetic leave; only a mouse/pen leaving hides the tooltip.
          onPointerLeave={(event) => { if (event.pointerType !== 'touch') setActive(null) }}>
          {ticks.map(tick => (
            <g key={tick} className="diu-grid">
              <line x1={MARGIN.left} x2={width - MARGIN.right} y1={y(tick)} y2={y(tick)} className={tick === 0 ? 'diu-zero' : undefined} />
              <text x={MARGIN.left - 6} y={y(tick)} dy="0.32em" textAnchor="end">{formatNumber(tick)}</text>
            </g>
          ))}
          {item.categories.map((category, index) => index % labelEvery === 0 && (
            <text key={index} className="diu-xlabel" x={center(index)} y={HEIGHT - MARGIN.bottom + 16} textAnchor="middle">
              <title>{category}</title>
              {category.length > 10 ? `${category.slice(0, 9)}…` : category}
            </text>
          ))}
          <text className="diu-xlabel" x={MARGIN.left + plotW / 2} y={HEIGHT - 6} textAnchor="middle">{item.xLabel}</text>
          {item.chart === 'bar'
            ? visible.map(({ series, index: seriesIndex }, position) => {
              const width = band * 0.72 / visible.length
              return (
                <g key={seriesIndex} className={`diu-s${seriesIndex} diu-bars`}>
                  {series.values.map((value, index) => value === null ? null : (
                    <rect key={index} className={value < 0 ? 'diu-neg' : undefined} x={center(index) - band * 0.36 + position * width} width={Math.max(1, width - 1)}
                      y={Math.min(y(value), y(0))} height={Math.max(1, Math.abs(y(value) - y(0)))}
                      opacity={active === null || active === index ? 1 : 0.55} />
                  ))}
                </g>
              )
            })
            : visible.map(({ series, index: seriesIndex }) => {
              // A missing value breaks the line; it is never drawn as zero.
              let path = ''
              let area = ''
              let run: number[] = []
              const close = (): void => {
                if (run.length > 0) area += `M${center(run[0]!)} ${y(0)}${run.map(index => `L${center(index)} ${y(series.values[index]!)}`).join('')}L${center(run.at(-1)!)} ${y(0)}Z`
                run = []
              }
              series.values.forEach((value, index) => {
                if (value === null) { close(); return }
                path += `${run.length > 0 ? 'L' : 'M'}${center(index)} ${y(value)}`
                run.push(index)
              })
              close()
              return (
                <g key={seriesIndex} className={`diu-s${seriesIndex} diu-line`}>
                  <path d={path} strokeDasharray={DASHES[seriesIndex]} />
                  {item.chart === 'area' && <path className="diu-area" d={area} />}
                  {series.values.map((value, index) => value === null ? null : (
                    <Marker key={index} shape={seriesIndex} x={center(index)} y={y(value)} />
                  ))}
                </g>
              )
            })}
          {item.categories.map((_, index) => (
            <rect key={index} className="diu-hit" x={MARGIN.left + band * index} y={MARGIN.top} width={band} height={plotH}
              tabIndex={0} role="img" aria-label={pointText(index)}
              onMouseEnter={() => { setActive(index) }} onFocus={() => { setActive(index); setSelected(index) }} onBlur={() => { setActive(null) }}
              onClick={() => { setActive(index); setSelected(index) }} />
          ))}
          {count > 0 && <line className="diu-cursor" x1={center(active ?? selected)} x2={center(active ?? selected)} y1={MARGIN.top} y2={MARGIN.top + plotH} />}
        </svg>
        {active !== null && (
          <div className="diu-tooltip" role="tooltip"
            style={center(active) > width / 2
              ? { right: `calc(${100 - center(active) / width * 100}% + 6px)` }
              : { left: `calc(${center(active) / width * 100}% + 6px)` }}>
            <strong>{item.categories[active]}</strong>
            {visible.map(({ series, index }) => {
              const value = series.values[active]
              return (
                <div key={index} className="diu-tooltip-row">
                  <span className={`diu-swatch diu-s${index}`} aria-hidden="true" />
                  <span>{series.name}</span>
                  <span className="diu-tooltip-value">{value === null || value === undefined ? t('chart.missing') : formatNumber(value)}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
      </>}
      {selectedRow !== undefined && (
        <div className="diu-card diu-selection">
          <div className="diu-selection-control">
            <label htmlFor={`${dataId}-category`}>{t('chart.select')}</label>
            <select id={`${dataId}-category`} value={selected} aria-controls={`${dataId}-selection`}
              onChange={(event) => { setSelected(Number(event.target.value)); setActive(null) }}>
              {item.categories.map((category, index) => <option key={index} value={index}>{category}</option>)}
            </select>
          </div>
          <dl id={`${dataId}-selection`} className="diu-aspects" aria-live="polite" aria-atomic="true">
            {item.table.headers.map((header, column) => (
              <div key={column}><dt>{header}</dt><dd {...cellData(selectedRow[column] ?? '')}>{selectedRow[column]}</dd></div>
            ))}
          </dl>
        </div>
      )}
      <button type="button" className="diu-link" aria-expanded={showData} aria-controls={dataId}
        onClick={() => { setShowData(!showData) }}>{t(showData ? 'chart.hideData' : 'chart.viewData')}</button>
      {showData && <div id={dataId}><TableView table={item.table} t={t} /></div>}
    </figure>
  )
}

const PIE = { size: 220, outer: 100, inner: 62 }

/** Donut of one series; each category is a slice, and a missing value has none. */
function Pie({ item, selected, onSelect, t }: { item: IntelligentUiChartItem; selected: number; onSelect: (index: number) => void; t: T }) {
  const values = item.series[0]?.values ?? []
  const total = values.reduce<number>((sum, value) => sum + (value ?? 0), 0)
  const c = PIE.size / 2
  const point = (angle: number, radius: number): string => `${c + radius * Math.sin(angle)} ${c - radius * Math.cos(angle)}`
  const unit = item.unit === '' ? '' : ` ${item.unit}`
  const share = (value: number): string => `${(value / total * 100).toFixed(1)}%`
  let start = 0
  const slices = values.map((value, index) => {
    if (value === null || value <= 0) return null
    const end = start + value / total * Math.PI * 2
    const large = end - start > Math.PI ? 1 : 0
    const d = `M${point(start, PIE.outer)}A${PIE.outer} ${PIE.outer} 0 ${large} 1 ${point(end, PIE.outer)}L${point(end, PIE.inner)}A${PIE.inner} ${PIE.inner} 0 ${large} 0 ${point(start, PIE.inner)}Z`
    start = end
    return { index, value, d }
  })
  const current = values[selected]
  return (
    <div className="diu-pie">
      <svg viewBox={`0 0 ${PIE.size} ${PIE.size}`} role="img"
        aria-label={t('chart.label', { kind: t('chart.pie'), x: item.xLabel, series: item.series[0]?.name ?? '' })}>
        {slices.map(slice => slice !== null && (
          <path key={slice.index} d={slice.d} className={`diu-s${slice.index}`} tabIndex={0} role="img"
            aria-label={`${item.categories[slice.index]}：${formatNumber(slice.value)}${unit}（${share(slice.value)}）`}
            opacity={selected === slice.index ? 1 : 0.6}
            onClick={() => { onSelect(slice.index) }} onFocus={() => { onSelect(slice.index) }} />
        ))}
        <text x={c} y={c - 8} textAnchor="middle" className="diu-pie-name">{item.categories[selected]}</text>
        <text x={c} y={c + 14} textAnchor="middle" className="diu-pie-value">
          {current === null || current === undefined ? t('chart.missing') : share(current)}
        </text>
      </svg>
      <div className="diu-legend" role="group" aria-label={item.xLabel}>
        {item.categories.map((category, index) => {
          const value = values[index]
          return (
            <button key={index} type="button" aria-pressed={selected === index} className="diu-legend-item" onClick={() => { onSelect(index) }}>
              <span className={`diu-swatch diu-s${index}`} aria-hidden="true" />
              {category}
              <span className="diu-muted">{value === null || value === undefined ? t('chart.missing') : `${formatNumber(value)}${unit} · ${share(value)}`}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
