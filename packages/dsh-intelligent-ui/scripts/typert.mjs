/**
 * Generate this package's Typert artifacts with the official DSH generator.
 *
 * The generator only analyzes packages registered under `<root>/packages` of a
 * DSH-shaped workspace, and only trusts `@Remote` / `TypertRemoteService`
 * declared by a registered `@deepseek-ai/dsh-typert-protocol`. A standalone
 * plugin has neither, so this mirrors the minimum layout into a temporary
 * workspace, runs the generator there, and writes the artifacts into `lib/`.
 * Since 0.2.1 every declaration merged into an analyzed interface must come
 * from a registered package, so `dsh-session` (which augments
 * `TypertResourceMap`) is mirrored alongside the protocol.
 */

import { cpSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { WorkspaceTypertGenerator } from '@deepseek-ai/dsh-typert-generator'

const pkg = resolve(dirname(fileURLToPath(import.meta.url)), '..')
/** Published packages mirrored as registered, declaration-only packages. */
const MIRRORED = ['dsh-typert-protocol', 'dsh-session']
const root = mkdtempSync(join(tmpdir(), 'dsh-iui-typert-'))
try {
  const plugin = join(root, 'packages/dsh-intelligent-ui')
  mkdirSync(plugin, { recursive: true })
  cpSync(join(pkg, 'src'), join(plugin, 'src'), { recursive: true })
  cpSync(join(pkg, 'package.json'), join(plugin, 'package.json'))
  symlinkSync(join(pkg, 'node_modules'), join(plugin, 'node_modules'))

  const base = JSON.parse(readFileSync(join(pkg, '../../tsconfig.base.json'), 'utf8'))
  const options = {
    ...base.compilerOptions,
    composite: true,
    noEmit: false,
    emitDeclarationOnly: true,
    skipLibCheck: true,
    // The temporary root has no node_modules; `types: ["node"]` (which also
    // declares the global `Disposable` the protocol extends) resolves here.
    typeRoots: [join(pkg, 'node_modules/@types')],
  }
  const paths = {}
  for (const name of MIRRORED) {
    // The generator maps `lib/` export targets back to `src/*.ts`, which a
    // published package lacks; point the copy's exports straight at its
    // declarations instead.
    const source = realpathSync(join(pkg, 'node_modules/@deepseek-ai', name))
    const mirror = join(root, 'packages', name)
    cpSync(join(source, 'lib/types'), join(mirror, 'decl'), { recursive: true })
    const manifest = JSON.parse(readFileSync(join(source, 'package.json'), 'utf8'))
    const exports = {}
    for (const [subpath, target] of Object.entries(manifest.exports)) {
      if (typeof target?.types === 'string') exports[subpath] = target.types.replace('./lib/types/', './decl/')
    }
    writeFileSync(join(mirror, 'package.json'), JSON.stringify({ name: manifest.name, version: manifest.version, exports }))
    symlinkSync(dirname(dirname(source)), join(mirror, 'node_modules'))
    writeFileSync(join(mirror, 'tsconfig.json'), JSON.stringify({ compilerOptions: { ...options, outDir: 'out' }, include: ['decl/**/*.d.ts'] }))
    paths[manifest.name] = [`./packages/${name}/decl/index.d.ts`]
  }
  writeFileSync(join(plugin, 'tsconfig.host.json'), JSON.stringify({
    compilerOptions: { ...options, rootDir: 'src', outDir: 'out' },
    include: ['src'],
    exclude: ['src/client'],
  }))
  // The generator builds one program per face from the aggregate's options,
  // so the mirror redirects live here.
  writeFileSync(join(root, 'tsconfig.host.json'), JSON.stringify({
    compilerOptions: { ...options, paths },
    files: [],
    references: [
      ...MIRRORED.map(name => ({ path: `./packages/${name}/tsconfig.json` })),
      { path: './packages/dsh-intelligent-ui/tsconfig.host.json' },
    ],
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
