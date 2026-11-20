import { useId, useState } from 'react'
import type { DormRequest } from './requests'

const actions = {
  'Новая': 'Взять в работу',
  'В работе': 'Завершить',
  'Готово': 'Убрать с доски',
}
const statusClasses = { 'Новая': 'new', 'В работе': 'working', 'Готово': 'done' }

interface Props {
  request: DormRequest
  onNext: (id: string) => void
  onReturn: (id: string) => void
}

export default function RequestCard({ request, onNext, onReturn }: Props) {
  const [expanded, setExpanded] = useState(false)
  const detailsId = useId()

  return (
    <article className={request.urgent ? 'panel card urgent' : 'panel card'}>
      <div className="card-top">
        <span>комн. {request.room} · {request.category}</span>
        <span className={`badge ${statusClasses[request.status]}`}>{request.status}</span>
      </div>
      <h3>{request.title}</h3>
      {request.urgent && <span className="urgent-label">Срочно</span>}
      <p className="details" id={detailsId} hidden={!expanded}>
        {request.details || 'Подробности не указаны.'}
      </p>
      <div className="actions">
        <button type="button" aria-expanded={expanded} aria-controls={detailsId}
          onClick={() => setExpanded(open => !open)}>
          {expanded ? 'Скрыть' : 'Подробнее'}
        </button>
        <button className="accent" type="button" onClick={() => onNext(request.id)}>
          {actions[request.status]}
        </button>
        {request.status === 'В работе' && (
          <button type="button" onClick={() => onReturn(request.id)}>Вернуть</button>
        )}
      </div>
    </article>
  )
}
