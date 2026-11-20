import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { categories } from '../src/requests'

const load = (name: string) => JSON.parse(
  readFileSync(new URL(`../n8n/${name}.json`, import.meta.url), 'utf8'),
)
const dispatch = load('ii-dispetcher')
const take = load('knopka-vzyat')

test('classification uses the board categories, a boolean and a summary', () => {
  const expression = dispatch.nodes.find((node: { name: string }) => node.name === 'Модель').parameters.jsonBody
  const body = Function('$json', `return (${expression.slice(3, -2)})`)({
    title: 'Искрит розетка', room: '216Б', details: '', category: 'Мебель',
  })
  assert.equal(body.model, 'qwen2.5:3b')
  assert.deepEqual(body.format.properties.category.enum, categories)
  assert.deepEqual(body.format.required, ['category', 'urgent', 'summary'])
  assert.equal(body.format.properties.urgent.type, 'boolean')
  assert.ok(!body.messages.at(-1).content.includes('Мебель'))
})

test('only a button for the right board and configured chat can claim a request', () => {
  const expression = take.nodes.find((node: { name: string }) => node.name === 'Кнопка этой доски').parameters.conditions.conditions[0].leftValue
  const accepts = Function('$json', '$env', `return (${expression.slice(3, -2)})`)
  const input = { callback_query: { data: 'dorm2:abcdefghijkl123', message: { chat: { id: 123 } } } }
  assert.equal(accepts(input, { TELEGRAM_CHAT_ID: '123' }), true)
  assert.equal(accepts(input, { TELEGRAM_CHAT_ID: '111' }), false)
  assert.equal(accepts({ callback_query: { ...input.callback_query, data: 'take:abcdefghijkl123' } },
    { TELEGRAM_CHAT_ID: '123' }), false)
  assert.equal(accepts({}, { TELEGRAM_CHAT_ID: '123' }), false)
})

test('portable exports omit credentials and the recipient', () => {
  for (const workflow of [dispatch, take]) {
    for (const node of workflow.nodes) assert.equal(node.credentials, undefined)
  }
  assert.equal(dispatch.nodes.find((node: { name: string }) => node.name === 'Telegram').parameters.chatId, '')
})
