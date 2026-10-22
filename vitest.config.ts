import ts from 'typescript'
import { defineConfig } from 'vitest/config'

/** Lower standard decorators with tsc first, as DSH's own test configs do; Vite's parser rejects them. */
const standardDecorators = {
  name: 'standard-decorators',
  enforce: 'pre' as const,
  transform(code: string, id: string) {
    const file = id.split('?', 1)[0] ?? id
    if (!/\.tsx?$/.test(file) || !/^\s*@[A-Za-z_$][\w$]*\(/m.test(code)) return undefined
    const result = ts.transpileModule(code, {
      fileName: file,
      compilerOptions: { target: ts.ScriptTarget.ES2024, module: ts.ModuleKind.ESNext, sourceMap: true },
    })
    return { code: result.outputText.replace(/\n?\/\/# sourceMappingURL=.*$/u, '\n'), map: result.sourceMapText }
  },
}

export default defineConfig({
  plugins: [standardDecorators],
  test: { include: ['tests/**/*.spec.ts'] },
})
