import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { test } from 'node:test'
import { initialRequests } from '../src/requests'
import { defaultWebhookUrl, sendToWebhook } from '../src/webhook'

const request = initialRequests[0]

async function withWebhook(
  status: number,
  body: string,
  verify: (url: string) => Promise<void>,
) {
  const server = createServer(async (incoming, response) => {
    incoming.setEncoding('utf8')
    let payload = ''
    for await (const chunk of incoming) payload += chunk

    if (incoming.method !== 'POST'
      || incoming.headers['content-type'] !== 'application/json'
      || payload !== JSON.stringify(request)) {
      response.writeHead(400).end()
      return
    }
    response.writeHead(status, { 'Content-Type': 'application/json' }).end(body)
  })

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })

  try {
    const address = server.address()
    assert.ok(address && typeof address === 'object')
    await verify(`http://127.0.0.1:${address.port}/webhook/zayavka`)
  } finally {
    await new Promise<void>(resolve => server.close(() => resolve()))
  }
}

test('sends a JSON POST with the new request and accepts explicit delivery confirmation', async () => {
  await withWebhook(200, '{"delivered":true}', async url => {
    assert.equal(await sendToWebhook(url, request), true)
  })
})

test('an HTTP error never confirms delivery', async () => {
  await withWebhook(500, '{"delivered":true}', async url => {
    assert.equal(await sendToWebhook(url, request), false)
  })
})

test('a generic success response without confirmation is insufficient', async () => {
  await withWebhook(200, '{"message":"Workflow started"}', async url => {
    assert.equal(await sendToWebhook(url, request), false)
  })
})

test('unreadable JSON and connection errors are treated as unconfirmed delivery', async () => {
  await withWebhook(200, 'invalid-json', async url => {
    assert.equal(await sendToWebhook(url, request), false)
  })
  assert.equal(await sendToWebhook('http://127.0.0.1:1/webhook/zayavka', request), false)
})

test('the n8n workflow and the board agree on path, payload and delivery confirmation', () => {
  const workflow = JSON.parse(
    readFileSync(new URL('../avtomatizaciya/zayavka-telegram.json', import.meta.url), 'utf8'),
  )
  const [webhook, telegram, reply] = workflow.nodes
  assert.equal(webhook.parameters.httpMethod, 'POST')
  assert.equal(webhook.parameters.responseMode, 'responseNode')
  assert.equal(new URL(defaultWebhookUrl).pathname, `/webhook/${webhook.parameters.path}`)
  assert.ok(webhook.parameters.options.allowedOrigins.split(',').includes('http://localhost:5173'))
  for (const field of ['title', 'room', 'category', 'status', 'urgent', 'details']) {
    assert.ok(telegram.parameters.text.includes(`$json.body.${field}`))
  }
  assert.equal(telegram.parameters.chatId, '')
  assert.equal(telegram.credentials, undefined)
  assert.equal(workflow.connections[webhook.name].main[0][0].node, telegram.name)
  assert.equal(workflow.connections[telegram.name].main[0][0].node, reply.name)
  assert.deepEqual(JSON.parse(reply.parameters.responseBody), { delivered: true })
})
