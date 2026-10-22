/**
 * Minimal source index over one final answer's Markdown: addressable block
 * ids, list-item ids, and GFM tables with column ids. It exists only so a
 * model can select content and the Host can bind the exact original text.
 */
import { fromMarkdown } from 'mdast-util-from-markdown';
import { gfmFromMarkdown } from 'mdast-util-gfm';
import { toString } from 'mdast-util-to-string';
import { gfm } from 'micromark-extension-gfm';
import { analyzeColumn } from "./numeric.js";
import { LIMITS } from "./limits.js";
const UNSAFE_NODES = new Set(['image', 'imageReference', 'html']);
const UNREFERENCEABLE_KINDS = new Set(['html', 'definition', 'footnoteDefinition', 'thematicBreak', 'yaml']);
function containsUnsafe(node) {
    if (UNSAFE_NODES.has(node.type))
        return true;
    return 'children' in node && node.children.some(containsUnsafe);
}
function slice(text, node) {
    const start = node.position?.start.offset;
    const end = node.position?.end.offset;
    return start === undefined || end === undefined ? '' : text.slice(start, end);
}
function oneLine(value) {
    const line = value.split('\n', 1)[0] ?? '';
    return line.trim();
}
/** A list item's lead: its leading strong text, or its first line. */
function itemTitle(item) {
    const first = item.children[0];
    if (first?.type === 'paragraph') {
        const lead = first.children[0];
        if (lead?.type === 'strong')
            return oneLine(toString(lead));
        return oneLine(toString(first));
    }
    return oneLine(toString(item));
}
function tableData(table) {
    const [head, ...body] = table.children;
    const width = head?.children.length ?? 0;
    const cells = (row) => Array.from({ length: width }, (_, index) => {
        const cell = row.children[index];
        return cell === undefined ? '' : toString(cell).trim();
    });
    return {
        headers: head === undefined ? [] : cells(head),
        align: Array.from({ length: width }, (_, index) => (table.align?.[index] ?? 'none')),
        rows: body.map(cells),
    };
}
/**
 * Parse one answer into its source index.
 * @param text - the answer Markdown.
 * @returns blocks, list items, and tables with stable positional ids.
 */
export function buildSourceIndex(text) {
    const root = fromMarkdown(text, { extensions: [gfm()], mdastExtensions: [gfmFromMarkdown()] });
    const blocks = new Map();
    const tables = new Map();
    const order = [];
    root.children.forEach((node, index) => {
        const id = `b${index}`;
        order.push(id);
        const referenceable = !UNREFERENCEABLE_KINDS.has(node.type) && !containsUnsafe(node);
        let tableId;
        if (node.type === 'table') {
            tableId = `t${tables.size}`;
            const data = tableData(node);
            const columns = data.headers.map((header, column) => ({
                id: `c${column}`,
                header,
                analysis: analyzeColumn(data.rows.map(row => row[column] ?? '')),
            }));
            tables.set(tableId, {
                id: tableId,
                blockId: id,
                data,
                columns,
                withinLimits: referenceable && data.rows.length >= 1 && data.rows.length <= LIMITS.tableRows
                    && data.headers.length >= 2 && data.headers.length <= LIMITS.tableColumns,
            });
        }
        blocks.set(id, {
            id,
            kind: node.type,
            markdown: slice(text, node),
            title: node.type === 'heading' ? oneLine(toString(node)) : oneLine(toString(node)).slice(0, 80),
            referenceable,
            ...node.type === 'heading' ? { headingDepth: node.depth } : {},
            ...tableId === undefined ? {} : { tableId },
        });
        if (node.type === 'list') {
            node.children.forEach((item, itemIndex) => {
                const itemId = `${id}i${itemIndex}`;
                blocks.set(itemId, {
                    id: itemId,
                    kind: 'list-item',
                    markdown: slice(text, item),
                    title: itemTitle(item),
                    referenceable: !containsUnsafe(item),
                });
            });
        }
    });
    return { blocks, order, tables };
}
//# sourceMappingURL=source-index.js.map