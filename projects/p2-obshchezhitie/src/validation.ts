import type { RequestDraft } from './requests'

export const fieldLimits = { title: 120, room: 40, details: 1500 }

const fieldRules = {
  title: { required: 'Опишите, что случилось.', label: 'Название' },
  room: { required: 'Укажите комнату.', label: 'Комната' },
  details: { required: '', label: 'Подробности' },
}

type Field = keyof typeof fieldLimits
export type DraftErrors = Partial<Record<Field, string>>

export function validateDraft(draft: RequestDraft) {
  const normalized = { ...draft }
  const errors: DraftErrors = {}

  for (const field of ['title', 'room', 'details'] as const) {
    const value = draft[field].trim()
    normalized[field] = value
    const { required, label } = fieldRules[field]

    if (!value && required) {
      errors[field] = required
    } else if (value.length > fieldLimits[field]) {
      errors[field] = `${label}: максимум ${fieldLimits[field]} символов.`
    }
  }

  return { normalized, errors }
}
