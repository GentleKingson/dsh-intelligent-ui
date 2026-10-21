/** Scoped styles; theme tokens come from the host page, so dark mode follows it. */
export const STYLES = `
.diu-root{--diu-s0:#3b6fd8;--diu-s1:#d9822b;--diu-s2:#2f9e6e;--diu-s3:#9b59b6;margin-top:8px;font-size:13px;color:var(--dsw-alias-label-primary,inherit)}
body[data-ds-dark-theme] .diu-root{--diu-s0:#7aa2f7;--diu-s1:#f0a35e;--diu-s2:#5cc797;--diu-s3:#c39ae0}
.diu-status{color:var(--dsw-alias-label-tertiary,#888);font-size:12px;display:flex;gap:8px;align-items:center}
.diu-region{border:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.25));border-radius:var(--dsw-radius-lg,10px);padding:8px 12px}
.diu-head{display:flex;align-items:center;justify-content:space-between}
.diu-root button{font:inherit;color:inherit;background:none;border:0;cursor:pointer;padding:2px 4px;border-radius:4px}
.diu-root button:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.12))}
.diu-root button:focus-visible,.diu-root input:focus-visible,.diu-hit:focus-visible{outline:2px solid var(--dsw-focus-ring-color,#3b6fd8);outline-offset:1px}
.diu-root button:disabled{opacity:.45;cursor:default}
.diu-toggle{font-weight:600;display:flex;gap:6px;align-items:center}
.diu-caret{display:inline-block;transition:transform .15s}.diu-caret.diu-open{transform:rotate(90deg)}
.diu-icon{font-size:16px;line-height:1;color:var(--dsw-alias-label-secondary,#666)}
.diu-link{color:var(--dsw-alias-state-business-primary,#3b6fd8)!important;font-size:12px}
.diu-muted{color:var(--dsw-alias-label-tertiary,#888);font-size:12px}
.diu-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.diu-body{display:flex;flex-direction:column;gap:12px;padding-top:8px}
.diu-cards{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr));gap:8px}
.diu-card{border:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.25));border-radius:8px;padding:8px 10px;display:flex;flex-direction:column;gap:4px;min-width:0}
.diu-card-title{font-weight:600}
.diu-card-body{min-width:0;overflow-wrap:anywhere}
.diu-clamped{max-height:7.5em;overflow:hidden;-webkit-mask-image:linear-gradient(#000 60%,transparent)}
.diu-card .diu-link{align-self:flex-start}
.diu-controls{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:6px}
.diu-controls input{font:inherit;color:inherit;background:transparent;border:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.35));border-radius:6px;padding:3px 8px;min-width:0;flex:0 1 200px}
.diu-scroll{overflow:auto;max-height:420px}
.diu-table table{border-collapse:collapse;width:100%}
.diu-table th,.diu-table td{border-bottom:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.2));padding:4px 8px;text-align:left;vertical-align:top}
.diu-table th{position:sticky;top:0;background:var(--dsw-alias-bg-l1,Canvas);font-weight:600;white-space:nowrap}
.diu-table th button{font-weight:600;display:inline-flex;gap:4px;align-items:center}
.diu-sort{font-size:10px;color:var(--dsw-alias-label-tertiary,#888)}
.diu-chart{margin:0;display:flex;flex-direction:column;gap:6px}
.diu-chart figcaption{display:flex;gap:8px;flex-wrap:wrap;align-items:baseline;font-weight:600}
.diu-legend{display:flex;flex-wrap:wrap;gap:4px}
.diu-legend-item{display:inline-flex;gap:4px;align-items:center;font-size:12px}
.diu-legend-item[aria-pressed=false]{opacity:.45;text-decoration:line-through}
.diu-plot{position:relative}
.diu-plot svg{width:100%;height:auto;display:block;overflow:visible}
.diu-grid line{stroke:var(--dsw-alias-border-l1,rgba(127,127,127,.25))}
.diu-grid line.diu-zero{stroke:var(--dsw-alias-label-tertiary,#888)}
.diu-grid text,.diu-xlabel{fill:var(--dsw-alias-label-secondary,#666);font-size:11px}
.diu-s0{--c:var(--diu-s0)}.diu-s1{--c:var(--diu-s1)}.diu-s2{--c:var(--diu-s2)}.diu-s3{--c:var(--diu-s3)}
.diu-bars rect{fill:var(--c)}
.diu-line path{fill:none;stroke:var(--c);stroke-width:2}
.diu-line>circle,.diu-line>rect,.diu-line>path:not(:first-child){fill:var(--c);stroke:none}
.diu-legend-item svg line{stroke:var(--c);stroke-width:2}
.diu-legend-item svg circle,.diu-legend-item svg rect,.diu-legend-item svg path{fill:var(--c)}
.diu-hit{fill:transparent;outline:none}
.diu-cursor{stroke:var(--dsw-alias-label-tertiary,#888);stroke-dasharray:3 3;pointer-events:none}
.diu-tooltip{position:absolute;top:8px;pointer-events:none;background:var(--dsw-alias-bg-l1,Canvas);border:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.35));border-radius:6px;padding:6px 8px;font-size:12px;box-shadow:0 2px 8px rgba(0,0,0,.15);width:max-content;max-width:calc(50% - 8px);overflow-wrap:anywhere;z-index:1}
.diu-swatch{display:inline-block;width:8px;height:8px;border-radius:2px;background:var(--c);margin-right:4px}
.diu-inline{font-size:14px}
.diu-inline .diu-region{border:0;padding:0}
.diu-inline .diu-toggle{font-weight:400;font-size:12px;color:var(--dsw-alias-label-tertiary,#888)}
.diu-inline .diu-body{padding-top:4px}
.diu-inline .diu-md>div{font-size:inherit;color:inherit}
.diu-inline .diu-body>.diu-md:first-child{font-size:15px}
.diu-inline .diu-table[data-small] .diu-controls{display:none}
`
