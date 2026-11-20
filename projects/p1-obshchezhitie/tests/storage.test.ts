import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { initialRequests } from '../src/requests'
import { loadRequests, saveRequests } from '../src/storage'

const storageKey = 'zayavki-obshchezhitie'
const data = new Map<string, string>()

beforeEach(() => {
  data.clear()
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => data.set(key, value),
    },
  })
})

test('initial board has five unique requests in three statuses', () => {
  const requests = loadRequests()
  assert.equal(requests.length, 5)
  assert.equal(new Set(requests.map(request => request.id)).size, requests.length)
  assert.deepEqual(new Set(requests.map(request => request.status)), new Set(['Новая', 'В работе', 'Готово']))
})

test('saved requests retain their order and status when loaded again', () => {
  const requests = initialRequests.slice().reverse()
  requests[0] = { ...requests[0], status: 'Готово' }
  assert.equal(saveRequests(requests), true)
  assert.deepEqual(loadRequests(), requests)
})

test('removing all requests persists an empty board', () => {
  assert.equal(saveRequests([]), true)
  assert.deepEqual(loadRequests(), [])
})

test('an older saved request without an urgency flag loads as non-urgent', () => {
  const stored = JSON.parse(JSON.stringify(initialRequests[0]))
  delete stored.urgent
  data.set(storageKey, JSON.stringify([stored]))
  assert.deepEqual(loadRequests(), [{ ...initialRequests[0], urgent: false }])
})

test('damaged storage falls back to the initial board', () => {
  for (const malformed of ['[', '{}', '[{"id":"incomplete"}]']) {
    data.set(storageKey, malformed)
    assert.deepEqual(loadRequests(), initialRequests)
  }
})
