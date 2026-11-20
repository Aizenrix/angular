import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { categories } from '../src/requests'

const tests = [
  { title: 'Вода из прорванной трубы заливает этаж', details: 'Вода продолжает течь.', category: 'Сантехника', urgent: true },
  { title: 'Искрит розетка возле стола', details: 'Видны искры и пахнет гарью.', category: 'Электрика', urgent: true },
  { title: 'Разболталась петля дверцы шкафа', details: 'Дверца немного провисает.', category: 'Мебель', urgent: false },
  { title: 'Пропал Wi-Fi у жильцов всего этажа', details: 'Никто не может подключиться.', category: 'Интернет', urgent: true },
  { title: 'Туго поворачивается кран', details: 'Течи нет, пользоваться можно.', category: 'Сантехника', urgent: false },
  { title: 'Медленный интернет в одной комнате', details: 'У соседей подключение работает.', category: 'Интернет', urgent: false },
] as const

const document = JSON.parse(readFileSync(new URL('../n8n/ii-dispetcher.json', import.meta.url), 'utf8'))
const expression = document.nodes.find((node: { name: string }) => node.name === 'Модель').parameters.jsonBody
const buildPayload = Function('$json', `return (${expression.slice(3, -2)})`)
const api = process.env.OLLAMA_URL || 'http://127.0.0.1:11434'

let correctCategory = 0
let correctUrgency = 0
const lines = [
  '# Проверка модели qwen2.5:3b', '',
  'Использованы инструкция, JSON-схема и параметры узла «Модель» из выгрузки n8n. Запуск из корня проекта — `npm run test:model`.', '',
  '| Заявка | Ожидаемая категория | Ответ | Ожидаемая срочность | Ответ | Время, с |',
  '|---|---|---|---|---|---|',
]
const yesNo = (value: boolean) => value ? 'да' : 'нет'
for (const sample of tests) {
  const start = performance.now()
  const response = await fetch(api + '/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildPayload({ ...sample, room: '216Б' })),
    signal: AbortSignal.timeout(120000),
  })
  assert.equal(response.status, 200)
  const body = await response.json()
  const result = JSON.parse(body.message.content)
  assert.ok(categories.includes(result.category))
  assert.equal(typeof result.urgent, 'boolean')
  assert.ok(typeof result.summary === 'string' && result.summary.trim())
  correctCategory += Number(result.category === sample.category)
  correctUrgency += Number(result.urgent === sample.urgent)
  lines.push(`| ${sample.title} | ${sample.category} | ${result.category} | ${yesNo(sample.urgent)} | ${yesNo(result.urgent)} | ${((performance.now() - start) / 1000).toFixed(1)} |`)
}
lines.push('', `Совпадения на этой выборке — категория **${correctCategory} из ${tests.length}**, срочность **${correctUrgency} из ${tests.length}**. Небольшая выборка иллюстрирует поведение модели на этих примерах.`)
console.log(lines.join('\n'))
