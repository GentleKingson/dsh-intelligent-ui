/**
 * The interactive region appended under one finished answer. Every string it
 * shows was copied from that answer by the Host; interactions are local only.
 */

import { Component, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { MarkdownText } from '@deepseek-ai/dsh-client-ui-primitives'
import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import type {
  IntelligentUiCardsItem, IntelligentUiChartItem, IntelligentUiItem, IntelligentUiTableData, IntelligentUiView,
} from '../types.ts'
import { parseCell, valueAxis } from '../numeric.ts'
import type { NS } from './locales.ts'

type T = TranslateNS<typeof NS>

/** Renders nothing when any part of the view throws; the original answer stays. */
export class ViewBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false }
  static getDerivedStateFromError(): { failed: boolean } { return { failed: true } }
  override render(): ReactNode { return this.state.failed ? null : this.props.children }
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
 * @returns the region, or a restore button once closed.
 */
export function Region({ view, t }: { view: IntelligentUiView; t: T }) {
  const [open, setOpen] = useState(true)
  const [closed, setClosed] = useState(false)
  const bodyId = useId()
  if (closed) {
    return <button type="button" className="diu-link" onClick={() => { setClosed(false) }}>{t('region.reopen')}</button>
  }
  return (
    <section className="diu-region" aria-label={t('region.label')}>
      <header className="diu-head">
        <button type="button" className="diu-toggle" aria-expanded={open} aria-controls={bodyId}
          onClick={() => { setOpen(!open) }} title={t(open ? 'region.collapse' : 'region.expand')}>
          <span aria-hidden="true" className={open ? 'diu-caret diu-open' : 'diu-caret'}>▸</span>
          {t('region.title')}
        </button>
        <button type="button" className="diu-icon" aria-label={t('region.close')} title={t('region.close')}
          onClick={() => { setClosed(true) }}>×</button>
      </header>
      {open && (
        <div id={bodyId} className="diu-body">
          {view.items.map((item, index) => <Item key={index} item={item} t={t} />)}
        </div>
      )}
    </section>
  )
}

function Item({ item, t }: { item: IntelligentUiItem; t: T }) {
  switch (item.type) {
    case 'markdown': return <div className="diu-md"><Markdown text={item.markdown} t={t} /></div>
    case 'cards': return <Cards item={item} t={t} />
    case 'table': return <TableView table={item.table} t={t} />
    case 'chart': return <Chart item={item} t={t} />
    default: return null
  }
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
export function TableView({ table, t }: { table: IntelligentUiTableData; t: T }) {
  const [filter, setFilter] = useState('')
  const [sort, setSort] = useState<{ column: number; dir: SortDir } | null>(null)
  const [unfolded, setUnfolded] = useState(false)
  const filterId = useId()
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
      <div className="diu-controls">
        <label htmlFor={filterId} className="diu-sr">{t('table.filter')}</label>
        <input id={filterId} type="search" value={filter} placeholder={t('table.filterPlaceholder')}
          onChange={(event) => { setFilter(event.target.value) }} />
        <button type="button" className="diu-link" disabled={filter === '' && sort === null}
          onClick={() => { setFilter(''); setSort(null) }}>{t('table.clear')}</button>
        <span className="diu-muted" aria-live="polite">{t('table.count', { shown: rows.length, total: table.rows.length })}</span>
      </div>
      <div className="diu-scroll">
        <table>
          <thead>
            <tr>
              {table.headers.map((header, column) => (
                <th key={column} scope="col" aria-sort={sort?.column === column ? sort.dir : 'none'}
                  style={{ textAlign: alignOf(table, column) }}>
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
                    return <td key={column} className={text.length <= NOWRAP_CHARS ? 'diu-nowrap' : undefined} style={{ textAlign: alignOf(table, column) }}>{text}</td>
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
export function Chart({ item, t }: { item: IntelligentUiChartItem; t: T }) {
  const [hidden, setHidden] = useState<ReadonlySet<number>>(new Set())
  const [active, setActive] = useState<number | null>(null)
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
  const { min, max, ticks, zeroBased } = valueAxis(values, item.chart)
  const plotW = width - MARGIN.left - MARGIN.right
  const plotH = HEIGHT - MARGIN.top - MARGIN.bottom
  const count = item.categories.length
  const band = plotW / count
  const y = (value: number): number => MARGIN.top + (max - value) / (max - min) * plotH
  const center = (index: number): number => MARGIN.left + band * (index + 0.5)
  const labelEvery = Math.ceil(count / Math.max(2, Math.min(MAX_X_LABELS, Math.floor(plotW / X_LABEL_SPACING))))
  const toggle = (index: number): void => {
    const next = new Set(hidden)
    if (next.has(index)) next.delete(index)
    else if (visible.length > 1) next.add(index)
    setHidden(next)
  }
  const label = t('chart.label', {
    kind: t(item.chart === 'bar' ? 'chart.bar' : 'chart.line'),
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
        <span>{label}</span>
        {item.unit !== '' && <span className="diu-muted">{t('chart.unit', { unit: item.unit })}</span>}
        {!zeroBased && <span className="diu-muted">{t('chart.axisFrom', { min: formatNumber(min) })}</span>}
      </figcaption>
      <div className="diu-legend" role="group" aria-label={t('chart.legend')}>
        {item.series.map((series, index) => (
          <button key={index} type="button" aria-pressed={!hidden.has(index)} className="diu-legend-item"
            onClick={() => { toggle(index) }}>
            <svg width="22" height="12" aria-hidden="true" className={`diu-s${index}`}>
              <line x1="1" y1="6" x2="21" y2="6" strokeDasharray={item.chart === 'line' ? DASHES[index] : undefined} />
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
                    <rect key={index} x={center(index) - band * 0.36 + position * width} width={Math.max(1, width - 1)}
                      y={Math.min(y(value), y(0))} height={Math.max(1, Math.abs(y(value) - y(0)))}
                      opacity={active === null || active === index ? 1 : 0.55} />
                  ))}
                </g>
              )
            })
            : visible.map(({ series, index: seriesIndex }) => {
              // A missing value breaks the line; it is never drawn as zero.
              let path = ''
              let pen = false
              series.values.forEach((value, index) => {
                if (value === null) { pen = false; return }
                path += `${pen ? 'L' : 'M'}${center(index)} ${y(value)}`
                pen = true
              })
              return (
                <g key={seriesIndex} className={`diu-s${seriesIndex} diu-line`}>
                  <path d={path} strokeDasharray={DASHES[seriesIndex]} />
                  {series.values.map((value, index) => value === null ? null : (
                    <Marker key={index} shape={seriesIndex} x={center(index)} y={y(value)} />
                  ))}
                </g>
              )
            })}
          {item.categories.map((_, index) => (
            <rect key={index} className="diu-hit" x={MARGIN.left + band * index} y={MARGIN.top} width={band} height={plotH}
              tabIndex={0} role="img" aria-label={pointText(index)}
              onMouseEnter={() => { setActive(index) }} onFocus={() => { setActive(index) }} onBlur={() => { setActive(null) }}
              onClick={() => { setActive(index) }} />
          ))}
          {active !== null && <line className="diu-cursor" x1={center(active)} x2={center(active)} y1={MARGIN.top} y2={MARGIN.top + plotH} />}
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
                <div key={index}>
                  <span className={`diu-swatch diu-s${index}`} aria-hidden="true" />
                  {series.name}: {value === null || value === undefined ? t('chart.missing') : `${formatNumber(value)}${item.unit === '' ? '' : ` ${item.unit}`}`}
                </div>
              )
            })}
          </div>
        )}
      </div>
      <button type="button" className="diu-link" aria-expanded={showData} aria-controls={dataId}
        onClick={() => { setShowData(!showData) }}>{t(showData ? 'chart.hideData' : 'chart.viewData')}</button>
      {showData && <div id={dataId}><TableView table={item.table} t={t} /></div>}
    </figure>
  )
}
