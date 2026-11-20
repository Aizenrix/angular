import assert from 'node:assert/strict'
import { test } from 'node:test'
import { applyChange } from '../src/requests'
import type { DormRequest } from '../src/requests'

const original: DormRequest = {
  id: 'first', title: 'Дверь', room: '310', category: 'Мебель', details: '',
  urgent: false, status: 'Новая', master: '',
  created: '2026-11-20 06:00:00.000Z', updated: '2026-11-20 06:00:00.000Z',
}

test('an SSE echo of an HTTP create keeps exactly one card', () => {
  assert.deepEqual(applyChange([original], { action: 'create', record: original }), [original])
})

test('a later Telegram update keeps its master and is not overwritten by a slow response', () => {
  const record = { ...original, status: 'В работе' as const, master: 'Мастер', updated: '2026-11-20 06:01:00.000Z' }
  const updated = applyChange([original], { action: 'update', record })
  assert.deepEqual(applyChange(updated, { action: 'create', record: original }), [record])
})

test('new records are first and update does not reorder by modification time', () => {
  const record = { ...original, id: 'second', created: '2026-11-20 06:02:00.000Z' }
  const list = applyChange([original], { action: 'create', record })
  assert.deepEqual(list.map(r => r.id), ['second', 'first'])
  const changed = { ...original, updated: '2026-11-20 06:03:00.000Z' }
  assert.deepEqual(applyChange(list, { action: 'update', record: changed }).map(r => r.id), ['second', 'first'])
})

test('deletion removes only that card and repeated events are safe', () => {
  const other = { ...original, id: 'second' }
  assert.deepEqual(applyChange([original, other], { action: 'delete', record: original }), [other])
  assert.deepEqual(applyChange([other], { action: 'delete', record: original }), [other])
})
