import type { DormRequest } from './requests'
import { defaultWebhookUrl, sendToWebhook } from './webhook'

export async function notify(request: DormRequest): Promise<string> {
  const url = import.meta.env.VITE_N8N_WEBHOOK_URL?.trim() || defaultWebhookUrl
  const delivered = await sendToWebhook(url, request)
  return delivered
    ? 'Уведомление отправлено в Telegram.'
    : 'Заявка добавлена. Доставку уведомления в Telegram подтвердить не удалось.'
}
