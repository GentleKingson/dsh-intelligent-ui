import { describe, expect, it } from 'vitest'
import { editMode, saveMode } from '../src/client/mode-draft.ts'

/** A Host that refuses a write fenced by a stale revision, as DSH settings does. */
function host(revision: number) {
  const state = { revision, mode: 'smart-auto' as unknown }
  return {
    state,
    mutate: (ops: readonly { value: unknown }[], expected?: number) => {
      if (expected !== state.revision) return Promise.resolve(false)
      state.mode = ops[0]?.value
      state.revision += 1
      return Promise.resolve(true)
    },
  }
}

describe('mode draft', () => {
  it('keeps the revision of the first edit, so an external save in between is refused', async () => {
    const form = host(1)
    let draft = editMode(undefined, 'off', form.state.revision)
    // Another window saves while this one is editing; the page now holds revision 2.
    await form.mutate([{ value: 'inline-stream' }], 1)
    draft = editMode(draft, 'smart-auto', form.state.revision)
    expect(draft).toEqual({ mode: 'smart-auto', revision: 1 })
    expect(await saveMode(form, draft)).toBe(false)
    expect(form.state.mode).toBe('inline-stream')
  })

  it('saves a draft made against the current revision', async () => {
    const form = host(3)
    expect(await saveMode(form, editMode(undefined, 'off', 3))).toBe(true)
    expect(form.state.mode).toBe('off')
  })

  it('reports a transport failure as not saved', async () => {
    const form = { mutate: () => Promise.reject(new Error('offline')) }
    expect(await saveMode(form, { mode: 'off', revision: 0 })).toBe(false)
  })
})
