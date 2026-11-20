export const categories = ['Сантехника', 'Электрика', 'Мебель', 'Интернет'] as const
export const statuses = ['Новая', 'В работе', 'Готово'] as const
export type Category = typeof categories[number]
export type Status = typeof statuses[number]

export interface RequestDraft {
  title: string
  room: string
  category: Category
  details: string
  urgent: boolean
}

export interface DormRequest extends RequestDraft {
  id: string
  status: Status
  master: string
  created: string
  updated: string
}

export type RequestChange = {
  action: 'create' | 'update' | 'delete'
  record: DormRequest
}

export function applyChange(requests: DormRequest[], { action, record }: RequestChange): DormRequest[] {
  if (action === 'delete') return requests.filter(request => request.id !== record.id)
  const current = requests.find(request => request.id === record.id)
  if (current && current.updated > record.updated) return requests
  return [record, ...requests.filter(request => request.id !== record.id)].sort((a, b) =>
    b.created.localeCompare(a.created) || b.id.localeCompare(a.id),
  )
}
