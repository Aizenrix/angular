import { useState } from 'react'
import type { FormEvent } from 'react'
import { categories } from './requests'
import type { RequestDraft } from './requests'
import { fieldLimits, validateDraft } from './validation'
import type { DraftErrors } from './validation'

const emptyDraft: RequestDraft = {
  title: '', room: '', category: categories[0], details: '', urgent: false,
}

export default function RequestForm({ onAdd }: { onAdd: (draft: RequestDraft) => Promise<boolean> }) {
  const [draft, setDraft] = useState(emptyDraft)
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const errors: DraftErrors = submitted ? validateDraft(draft).errors : {}
  const messages = Object.entries(errors)

  function update<K extends keyof RequestDraft>(key: K, value: RequestDraft[K]) {
    setDraft(previous => ({ ...previous, [key]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const { normalized, errors } = validateDraft(draft)
    if (Object.keys(errors).length > 0) {
      setSubmitted(true)
      return
    }

    setSaving(true)
    try {
      if (await onAdd(normalized)) {
        setDraft(emptyDraft)
        setSubmitted(false)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="panel form" onSubmit={handleSubmit}>
      <h2>Новая заявка</h2>
      <fieldset disabled={saving}>
        <label>Что случилось
          <input value={draft.title} placeholder="Например, протекает труба"
            maxLength={fieldLimits.title} aria-required="true" aria-invalid={!!errors.title}
            aria-describedby={errors.title ? 'request-error-title' : undefined}
            onChange={event => update('title', event.target.value)} />
        </label>
        <label>Комната
          <input value={draft.room} placeholder="Например, 207"
            maxLength={fieldLimits.room} aria-required="true" aria-invalid={!!errors.room}
            aria-describedby={errors.room ? 'request-error-room' : undefined}
            onChange={event => update('room', event.target.value)} />
        </label>
        <label>Категория
          <select value={draft.category} onChange={event => {
            const category = categories.find(item => item === event.target.value)
            if (category) update('category', category)
          }}>
            {categories.map(category => <option key={category}>{category}</option>)}
          </select>
        </label>
        <label>Подробности
          <textarea rows={4} value={draft.details} placeholder="Опишите проблему"
            maxLength={fieldLimits.details} aria-invalid={!!errors.details}
            aria-describedby={errors.details ? 'request-error-details' : undefined}
            onChange={event => update('details', event.target.value)} />
        </label>
        <label className="check">
          <input type="checkbox" checked={draft.urgent}
            onChange={event => update('urgent', event.target.checked)} />
          Срочно
        </label>
        <button className="primary" type="submit">{saving ? 'Сохраняем…' : 'Отправить заявку'}</button>
      </fieldset>
      {messages.length > 0 && (
        <div className="error" role="alert">
          {messages.map(([field, message]) => (
            <p key={field} id={`request-error-${field}`}>{message}</p>
          ))}
        </div>
      )}
    </form>
  )
}
