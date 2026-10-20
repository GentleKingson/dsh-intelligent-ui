/**
 * Generate this package's Typert artifacts with the official DSH generator.
 *
 * The generator only analyzes packages registered under `<root>/packages` of a
 * DSH-shaped workspace, and only trusts `@Remote` / `TypertRemoteService`
 * declared by a registered `@deepseek-ai/dsh-typert-protocol`. A standalone
 * plugin has neither, so this mirrors the minimum layout into a temporary
 * workspace, runs the generator there, and writes the artifacts into `lib/`.
 */

import { cpSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { WorkspaceTypertGenerator } from '@deepseek-ai/dsh-typert-generator'

const pkg = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const protocol = realpathSync(join(pkg, 'node_modules/@deepseek-ai/dsh-typert-protocol'))
const root = mkdtempSync(join(tmpdir(), 'dsh-iui-typert-'))
try {
  const plugin = join(root, 'packages/dsh-intelligent-ui')
  const proto = join(root, 'packages/typert-protocol')
  mkdirSync(plugin, { recursive: true })
  cpSync(join(pkg, 'src'), join(plugin, 'src'), { recursive: true })
  cpSync(join(pkg, 'package.json'), join(plugin, 'package.json'))
  symlinkSync(join(pkg, 'node_modules'), join(plugin, 'node_modules'))
  // The generator maps `lib/` export targets back to `src/*.ts`, which a
  // published package lacks; point the copy's exports straight at its
  // declarations instead.
  cpSync(join(protocol, 'lib/types'), join(proto, 'decl'), { recursive: true })
  const manifest = JSON.parse(readFileSync(join(protocol, 'package.json'), 'utf8'))
  writeFileSync(join(proto, 'package.json'), JSON.stringify({
    name: manifest.name,
    version: manifest.version,
    exports: { '.': './decl/index.d.ts', './types': './decl/types.d.ts' },
  }))
  symlinkSync(dirname(dirname(protocol)), join(proto, 'node_modules'))

  const base = JSON.parse(readFileSync(join(pkg, '../../tsconfig.base.json'), 'utf8'))
  const options = { ...base.compilerOptions, composite: true, noEmit: false, emitDeclarationOnly: true, skipLibCheck: true }
  writeFileSync(join(proto, 'tsconfig.json'), JSON.stringify({ compilerOptions: { ...options, outDir: 'out' }, include: ['decl/**/*.d.ts'] }))
  writeFileSync(join(plugin, 'tsconfig.host.json'), JSON.stringify({
    compilerOptions: { ...options, rootDir: 'src', outDir: 'out' },
    include: ['src'],
    exclude: ['src/client'],
  }))
  // The generator builds one program per face from the aggregate's options,
  // so the protocol redirect lives here.
  writeFileSync(join(root, 'tsconfig.host.json'), JSON.stringify({
    compilerOptions: { ...options, paths: { '@deepseek-ai/dsh-typert-protocol': ['./packages/typert-protocol/decl/index.d.ts'] } },
    files: [],
    references: [{ path: './packages/typert-protocol/tsconfig.json' }, { path: './packages/dsh-intelligent-ui/tsconfig.host.json' }],
  }))

  const artifacts = new WorkspaceTypertGenerator(root, { checkDiagnostics: false }).generate(['dsh-intelligent-ui'], ['host'])
  const artifact = artifacts.find(entry => entry.package === 'dsh-intelligent-ui' && entry.face === 'host')
  if (artifact?.remote === undefined) throw new Error('typert: no host artifact with Remote methods was generated')
  const lib = join(pkg, 'lib')
  mkdirSync(lib, { recursive: true })
  writeFileSync(join(lib, 'typert.host.js'), artifact.js)
  writeFileSync(join(lib, 'typert.host.d.ts'), artifact.dts)
  writeFileSync(join(lib, 'typert.remote-client.js'), artifact.remote.js)
  writeFileSync(join(lib, 'typert.remote-client.d.ts'), artifact.remote.dts)
  if (artifact.remote.map !== undefined) writeFileSync(join(lib, 'typert.remote-client.d.ts.map'), artifact.remote.map)
  console.log('typert: wrote host + remote-client artifacts')
} finally {
  if (process.env.KEEP_TYPERT !== "1") rmSync(root, { recursive: true, force: true }); else console.log(root)
}
