import type { DormRequest } from './requests'

export const defaultWebhookUrl = 'http://localhost:5678/webhook/zayavka'

export async function sendToWebhook(url: string, request: DormRequest): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(15000),
    })

    if (!response.ok) return false
    const result: { delivered?: boolean } | null = await response.json()
    return result?.delivered === true
  } catch {
    return false
  }
}
