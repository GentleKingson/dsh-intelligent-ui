/** `intelligent-ui` namespace dictionaries. */

/** Dictionary namespace owned by this plugin. */
export const NS = 'intelligent-ui'

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'region.title': '交互视图',
  'region.label': '由原回答生成的交互视图，原文保持不变',
  'region.collapse': '收起交互视图',
  'region.expand': '展开交互视图',
  'region.close': '关闭交互视图',
  'region.reopen': '显示交互视图',
  'status.pending': '正在生成交互视图…',
  'status.failed': '交互视图生成失败，已保留原文',
  'status.retry': '重试',
  'card.expand': '展开',
  'card.collapse': '收起',
  'table.filter': '筛选行',
  'table.filterPlaceholder': '输入关键字筛选',
  'table.clear': '清除',
  'table.count': '{shown} / {total} 行',
  'table.sortBy': '按 {column} 排序',
  'table.empty': '没有匹配的行',
  'chart.label': '{kind}：{x} 对比 {series}',
  'chart.bar': '柱状图',
  'chart.line': '折线图',
  'chart.legend': '图例（点击可显示或隐藏系列）',
  'chart.missing': '缺失',
  'chart.viewData': '查看数据',
  'chart.hideData': '隐藏数据',
  'chart.unit': '单位：{unit}',
  'chart.axisFrom': '纵轴从 {min} 起',
  'markdown.copy': '复制',
  'markdown.copied': '已复制',
  'markdown.footnotes': '脚注',
} as const

/** Key union of this namespace. */
export type IntelligentUiKey = keyof typeof zh

/** English dictionary. */
export const en: Record<IntelligentUiKey, string> = {
  'region.title': 'Interactive view',
  'region.label': 'Interactive view generated from the answer above; the original text is unchanged',
  'region.collapse': 'Collapse interactive view',
  'region.expand': 'Expand interactive view',
  'region.close': 'Close interactive view',
  'region.reopen': 'Show interactive view',
  'status.pending': 'Preparing interactive view…',
  'status.failed': 'Interactive view failed; the original answer is kept',
  'status.retry': 'Retry',
  'card.expand': 'Expand',
  'card.collapse': 'Collapse',
  'table.filter': 'Filter rows',
  'table.filterPlaceholder': 'Type to filter',
  'table.clear': 'Clear',
  'table.count': '{shown} / {total} rows',
  'table.sortBy': 'Sort by {column}',
  'table.empty': 'No matching rows',
  'chart.label': '{kind}: {x} by {series}',
  'chart.bar': 'Bar chart',
  'chart.line': 'Line chart',
  'chart.legend': 'Legend (click to show or hide a series)',
  'chart.missing': 'missing',
  'chart.viewData': 'View data',
  'chart.hideData': 'Hide data',
  'chart.unit': 'Unit: {unit}',
  'chart.axisFrom': 'Y axis starts at {min}',
  'markdown.copy': 'Copy',
  'markdown.copied': 'Copied',
  'markdown.footnotes': 'Footnotes',
}
