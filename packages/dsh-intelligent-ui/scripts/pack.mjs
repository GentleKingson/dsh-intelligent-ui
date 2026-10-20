/** Build, pack the publishable tarball into ../../dist, and record its SHA-256. */

import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const pkg = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(pkg, '../../dist')
mkdirSync(dist, { recursive: true })
execFileSync(process.execPath, [join(pkg, 'scripts/build.mjs')], { cwd: pkg, stdio: 'inherit' })
const output = execFileSync('pnpm', ['pack', '--pack-destination', dist], { cwd: pkg, encoding: 'utf8' })
const tarball = output.trim().split('\n').reverse().find(line => line.endsWith('.tgz'))
if (tarball === undefined) throw new Error(`pnpm pack printed no tarball:\n${output}`)
const file = resolve(dist, basename(tarball))
const sha256 = createHash('sha256').update(readFileSync(file)).digest('hex')
writeFileSync(join(dist, `${basename(file)}.sha256`), `${sha256}  ${basename(file)}\n`)
console.log(`${sha256}  ${file}`)
