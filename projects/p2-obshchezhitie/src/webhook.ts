import type { DormRequest } from './requests'

export const defaultWebhookUrl = 'http://localhost:5678/webhook/zayavka'

export async function queueDispatch(request: DormRequest): Promise<boolean> {
  try {
    const url = import.meta.env.VITE_N8N_WEBHOOK_URL?.trim() || defaultWebhookUrl
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: request.id }),
      signal: AbortSignal.timeout(10000),
    })
    return response.ok
  } catch {
    return false
  }
}
