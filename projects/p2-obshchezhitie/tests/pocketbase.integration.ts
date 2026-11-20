import assert from 'node:assert/strict'
import { test } from 'node:test'

const url = (process.env.POCKETBASE_URL || 'http://127.0.0.1:8090') + '/api/collections/obshchezhitie/records'
const example = { title: 'Проверка правил коллекции', room: '216Б', category: 'Мебель', details: 'Тест', urgent: false }
function request(method: string, path = '', data?: object) {
  return fetch(url + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: data && JSON.stringify(data),
    signal: AbortSignal.timeout(5000),
  })
}

test('public list contains seed requests for all statuses', async () => {
  const response = await request('GET')
  assert.equal(response.status, 200)
  const result = await response.json()
  assert.ok(result.items.length >= 5)
  assert.deepEqual(new Set(result.items.map((record: { status: string }) => record.status)),
    new Set(['Новая', 'В работе', 'Готово']))
})

test('invalid status, missing room and a foreign category cannot be created', async () => {
  const invalid = [
    { ...example, status: 'Готово' },
    { ...example, status: 'Новая', room: '' },
    { ...example, status: 'Новая', category: 'Другое' },
  ]
  for (const input of invalid) assert.equal((await request('POST', '', input)).status, 400)
})

test('public editing allows category and taking, protects texts and only deletes completed cards', async () => {
  const created = await request('POST', '', { ...example, status: 'Новая' })
  assert.equal(created.status, 200)
  const { id } = await created.json()
  const path = '/' + id
  try {
    assert.equal((await request('GET', path)).status, 200)
    for (const field of ['title', 'room', 'details']) {
      assert.equal((await request('PATCH', path, { [field]: 'Запрещённое изменение' })).status, 404)
    }
    assert.equal((await request('DELETE', path)).status, 404)
    const classified = await request('PATCH', path, { category: 'Электрика', urgent: true })
    assert.equal(classified.status, 200)
    assert.equal((await classified.json()).category, 'Электрика')
    const taken = await request('PATCH', path, { status: 'В работе', master: 'Проверка' })
    assert.equal(taken.status, 200)
    assert.equal((await taken.json()).master, 'Проверка')
    assert.equal((await request('PATCH', path, { status: 'В работе', master: 'Другой' })).status, 404)
  } finally {
    assert.equal((await request('PATCH', path, { status: 'Готово' })).status, 200)
    assert.equal((await request('DELETE', path)).status, 204)
  }
  assert.equal((await request('GET', path)).status, 404)
})
