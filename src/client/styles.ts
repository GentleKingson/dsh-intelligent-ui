/** Scoped styles; theme tokens come from the host page, so dark mode follows it. */
export const STYLES = `
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
`
