/**
 * A staged mode edit and the revision it was made against. The revision is
 * the one read when editing began, so a save after another editor's write is
 * refused by the Host instead of silently overwriting it.
 */

export const MODES = ['smart-auto', 'inline-stream', 'off'] as const
export type Mode = typeof MODES[number]

/** The staged mode and the revision the editor read when it began. */
export interface ModeDraft {
  readonly mode: Mode
  readonly revision: number | undefined
}

/** The write side of the page owner's form. */
interface ModeForm {
  mutate(ops: readonly { op: 'set'; path: string[]; value: unknown }[], expectedRevision?: number): Promise<boolean>
}

/**
 * Stage a mode, keeping the revision of the first edit.
 * @param draft - the current draft, if any.
 * @param mode - the mode just picked.
 * @param revision - the revision the page holds now.
 * @returns the next draft.
 */
export function editMode(draft: ModeDraft | undefined, mode: Mode, revision: number | undefined): ModeDraft {
  return { mode, revision: draft === undefined ? revision : draft.revision }
}

/**
 * Write the draft fenced by the revision it was made against.
 * @param form - the owner's form.
 * @param draft - the staged edit.
 * @returns true when the Host accepted it; false on refusal or transport failure.
 */
export async function saveMode(form: ModeForm, draft: ModeDraft): Promise<boolean> {
  try {
    return await form.mutate([{ op: 'set', path: ['mode'], value: draft.mode }], draft.revision)
  } catch {
    return false
  }
}
