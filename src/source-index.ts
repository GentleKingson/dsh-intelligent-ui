/**
 * Minimal source index over one final answer's Markdown: addressable block
 * ids, list-item ids, and GFM tables with column ids. It exists only so a
 * model can select content and the Host can bind the exact original text.
 */

import { fromMarkdown } from 'mdast-util-from-markdown'
import { gfmFromMarkdown } from 'mdast-util-gfm'
import { toString } from 'mdast-util-to-string'
import { gfm } from 'micromark-extension-gfm'
import type { ListItem, Nodes, Root, RootContent, Table } from 'mdast'
import type { IntelligentUiAlign, IntelligentUiTableData } from './types.ts'
import { analyzeColumn, type ColumnAnalysis } from './numeric.ts'
import { LIMITS } from './limits.ts'

/** One addressable top-level block or list item. */
export interface SourceBlock {
  readonly id: string
  readonly kind: string
  /** Exact source slice. */
  readonly markdown: string
  /** Plain-text heading or item lead, for card titles. */
  readonly title: string
  /** False for blocks a view must not repeat (images, raw HTML, definitions). */
  readonly referenceable: boolean
  readonly headingDepth?: number
  /** Table id when `kind === 'table'`. */
  readonly tableId?: string
}

/** One column of a source table. */
export interface SourceColumn {
  readonly id: string
  readonly header: string
  readonly analysis: ColumnAnalysis
}

/** One GFM table, addressable only when it fits the per-table budget. */
export interface SourceTable {
  readonly id: string
  readonly blockId: string
  readonly data: IntelligentUiTableData
  readonly columns: readonly SourceColumn[]
  readonly withinLimits: boolean
}

/** The bounded index a generation request and its validation share. */
export interface SourceIndex {
  readonly blocks: ReadonlyMap<string, SourceBlock>
  /** Top-level block ids in document order (list items excluded). */
  readonly order: readonly string[]
  readonly tables: ReadonlyMap<string, SourceTable>
}

const UNSAFE_NODES = new Set(['image', 'imageReference', 'html'])
const UNREFERENCEABLE_KINDS = new Set(['html', 'definition', 'footnoteDefinition', 'thematicBreak', 'yaml'])

function containsUnsafe(node: Nodes): boolean {
  if (UNSAFE_NODES.has(node.type)) return true
  return 'children' in node && (node.children as Nodes[]).some(containsUnsafe)
}

function slice(text: string, node: Nodes): string {
  const start = node.position?.start.offset
  const end = node.position?.end.offset
  return start === undefined || end === undefined ? '' : text.slice(start, end)
}

function oneLine(value: string): string {
  const line = value.split('\n', 1)[0] ?? ''
  return line.trim()
}

/** A list item's lead: its leading strong text, or its first line. */
function itemTitle(item: ListItem): string {
  const first = item.children[0]
  if (first?.type === 'paragraph') {
    const lead = first.children[0]
    if (lead?.type === 'strong') return oneLine(toString(lead))
    return oneLine(toString(first))
  }
  return oneLine(toString(item))
}

function tableData(table: Table): IntelligentUiTableData {
  const [head, ...body] = table.children
  const width = head?.children.length ?? 0
  const cells = (row: Table['children'][number]): string[] =>
    Array.from({ length: width }, (_, index) => {
      const cell = row.children[index]
      return cell === undefined ? '' : toString(cell).trim()
    })
  return {
    headers: head === undefined ? [] : cells(head),
    align: Array.from({ length: width }, (_, index) => (table.align?.[index] ?? 'none') as IntelligentUiAlign),
    rows: body.map(cells),
  }
}

/**
 * Parse one answer into its source index.
 * @param text - the answer Markdown.
 * @returns blocks, list items, and tables with stable positional ids.
 */
export function buildSourceIndex(text: string): SourceIndex {
  const root: Root = fromMarkdown(text, { extensions: [gfm()], mdastExtensions: [gfmFromMarkdown()] })
  const blocks = new Map<string, SourceBlock>()
  const tables = new Map<string, SourceTable>()
  const order: string[] = []
  root.children.forEach((node: RootContent, index) => {
    const id = `b${index}`
    order.push(id)
    const referenceable = !UNREFERENCEABLE_KINDS.has(node.type) && !containsUnsafe(node)
    let tableId: string | undefined
    if (node.type === 'table') {
      tableId = `t${tables.size}`
      const data = tableData(node)
      const columns = data.headers.map((header, column) => ({
        id: `c${column}`,
        header,
        analysis: analyzeColumn(data.rows.map(row => row[column] ?? '')),
      }))
      tables.set(tableId, {
        id: tableId,
        blockId: id,
        data,
        columns,
        withinLimits: referenceable && data.rows.length >= 1 && data.rows.length <= LIMITS.tableRows
          && data.headers.length >= 2 && data.headers.length <= LIMITS.tableColumns,
      })
    }
    blocks.set(id, {
      id,
      kind: node.type,
      markdown: slice(text, node),
      title: node.type === 'heading' ? oneLine(toString(node)) : oneLine(toString(node)).slice(0, 80),
      referenceable,
      ...node.type === 'heading' ? { headingDepth: node.depth } : {},
      ...tableId === undefined ? {} : { tableId },
    })
    if (node.type === 'list') {
      node.children.forEach((item, itemIndex) => {
        const itemId = `${id}i${itemIndex}`
        blocks.set(itemId, {
          id: itemId,
          kind: 'list-item',
          markdown: slice(text, item),
          title: itemTitle(item),
          referenceable: !containsUnsafe(item),
        })
      })
    }
  })
  return { blocks, order, tables }
}
