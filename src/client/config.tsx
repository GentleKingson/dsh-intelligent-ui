/**
 * The row's Configure page on the Plugins page: pick one of the three modes
 * and save it through the page owner's form. The Host service reads `mode`
 * once at start, so a saved mode applies after the Profile restarts; the page
 * says so only after the Host accepted the write.
 */

import { useId, useState } from 'react'
import type { PluginConfigViewProps } from '@deepseek-ai/dsh-client-ui-plugin-manager/client'
import { SegmentedControl, SettingsForm } from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { NS } from './locales.ts'
import { editMode, MODES, saveMode, type Mode, type ModeDraft } from './mode-draft.ts'

function isMode(value: unknown): value is Mode {
  return MODES.some(mode => mode === value)
}

type Props = PluginConfigViewProps & PropsLocale<typeof NS>

/**
 * Render the summary line or the mode form.
 * @param props - the requested view, the owner's form, and the dictionary.
 * @returns the one-liner, or the form with its save control.
 */
export function ModeConfig({ view, form, t }: Props) {
  const id = useId()
  const [draft, setDraft] = useState<ModeDraft>()
  const [outcome, setOutcome] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle')
  if (view === 'summary') return <>{t('config.summary')}</>
  if (form?.state.status === 'loading') return <p role="status">{t('config.loading')}</p>
  const state = form?.state
  const stored = state?.value?.['mode']
  const current: Mode = isMode(stored) ? stored : 'smart-auto'
  const selected = draft?.mode ?? current
  const writable = state?.writable === true
  const saving = outcome === 'saving'
  const save = async (): Promise<void> => {
    if (form === undefined || draft === undefined) return
    setOutcome('saving')
    const accepted = await saveMode(form, draft)
    // A refused draft is dropped either way: the page shows the Host's current value to edit again.
    setDraft(undefined)
    setOutcome(accepted ? 'saved' : 'failed')
  }
  return (
    <SettingsForm
      labels={{
        unavailable: t('config.unavailable'), readOnly: t('config.readOnly'), saveFailed: t('config.saveFailed'),
        save: t('config.save'), saving: t('config.saving'),
      }}
      state={{
        available: state?.status === 'ready', writable, dirty: draft !== undefined && draft.mode !== current,
        invalid: false, saving, failed: outcome === 'failed',
      }}
      onSave={() => { void save() }}
      onDiscard={() => { setDraft(undefined) }}
    >
      <SegmentedControl
        id={id}
        label={t('config.mode')}
        value={selected}
        disabled={!writable || saving}
        options={MODES.map(mode => ({ value: mode, label: t(`config.mode.${mode}`) }))}
        onChange={(next) => { setDraft(editMode(draft, next, state?.revision)); setOutcome('idle') }}
      />
      <p id={`${id}-${selected}-panel`} role="tabpanel" aria-labelledby={`${id}-${selected}`}>
        {t(`config.mode.${selected}.hint`)}
      </p>
      {outcome === 'saved' && <p role="status">{t('config.saved')}</p>}
    </SettingsForm>
  )
}
