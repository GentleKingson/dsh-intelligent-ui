/**
 * Build: Host declarations and ESM (tsc), Typert artifacts (official
 * generator), then the browser bundle in the DSH closure-factory format
 * (`window.__ModuleLoader__.load`) with exactly the platform modules external.
 */

import { execFileSync } from 'node:child_process'
import { rmSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'tsdown'

const pkg = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const tsc = join(pkg, 'node_modules/typescript/bin/tsc')
const run = (...args) => { execFileSync(process.execPath, args, { cwd: pkg, stdio: 'inherit' }) }

/** Shell-provided module table (DSH packages/client/web/src/platform.ts at 0.2.1-rc.2). */
const PLATFORM_MODULES = new Set([
  'react', 'react/jsx-runtime', 'react-dom', 'react-dom/client', '@deepseek-ai/cordis', 'zod', '@tanstack/react-virtual',
  '@deepseek-ai/dsh-client-store', '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-ui-primitives', '@deepseek-ai/dsh-client-ui-dockkit',
])

rmSync(join(pkg, 'lib'), { recursive: true, force: true })
run(tsc, '-b', 'tsconfig.host.json')
run(join(pkg, 'scripts/typert.mjs'))
// The client imports the generated `./remote` contribution, so it checks last.
run(tsc, '-p', 'tsconfig.client.json', '--noEmit')

await build({
  config: false,
  cwd: pkg,
  entry: { client: 'src/client/index.tsx' },
  outDir: 'lib',
  format: 'cjs',
  platform: 'browser',
  target: 'es2024',
  dts: false,
  clean: false,
  sourcemap: false,
  tsconfig: 'tsconfig.client.json',
  deps: {
    neverBundle: specifier => PLATFORM_MODULES.has(specifier),
    alwaysBundle: specifier => !PLATFORM_MODULES.has(specifier),
  },
  inputOptions: { resolve: { conditionNames: ['production', 'browser', 'import', 'module', 'default'] } },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'import.meta.env.MODE': JSON.stringify('production'),
    'import.meta.env': JSON.stringify({ MODE: 'production' }),
  },
  outputOptions: {
    entryFileNames: 'client.js',
    codeSplitting: false,
    banner: 'window.__ModuleLoader__.load({ id: "dsh-intelligent-ui", factory: (require) => {',
    footer: 'return module.exports; } });',
    intro: 'var module = { exports: {} }; var exports = module.exports;',
  },
})
