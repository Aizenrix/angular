import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { RequestDraft } from '../src/requests'
import { fieldLimits, validateDraft } from '../src/validation'

const draft: RequestDraft = {
  title: 'Сломалась ручка двери',
  room: '308А',
  category: 'Мебель',
  details: 'Ручка выпадает при открытии.',
  urgent: true,
}

test('a blank title is rejected independently of the room', () => {
  const { errors } = validateDraft({ ...draft, title: ' \t ' })
  assert.deepEqual(errors, { title: 'Опишите, что случилось.' })
})

test('a blank room is rejected independently of the title', () => {
  const { errors } = validateDraft({ ...draft, room: ' \n ' })
  assert.deepEqual(errors, { room: 'Укажите комнату.' })
})

test('both required fields are reported when the form is empty', () => {
  const { errors } = validateDraft({ ...draft, title: '', room: '' })
  assert.deepEqual(Object.keys(errors), ['title', 'room'])
})

test('spaces are trimmed while room letters, category and urgency are preserved', () => {
  const { normalized, errors } = validateDraft({
    ...draft,
    title: `  ${draft.title}  `,
    room: ` ${draft.room}\t`,
    details: `\n${draft.details} `,
  })
  assert.deepEqual(errors, {})
  assert.deepEqual(normalized, draft)
})

test('details are optional', () => {
  const { normalized, errors } = validateDraft({ ...draft, details: ' ' })
  assert.deepEqual(errors, {})
  assert.equal(normalized.details, '')
})

test('each text field accepts its limit and reports any extra character', () => {
  for (const field of ['title', 'room', 'details'] as const) {
    const text = 'а'.repeat(fieldLimits[field])
    assert.deepEqual(validateDraft({ ...draft, [field]: text }).errors, {})
    assert.deepEqual(
      Object.keys(validateDraft({ ...draft, [field]: text + 'а' }).errors),
      [field],
    )
  }
})
