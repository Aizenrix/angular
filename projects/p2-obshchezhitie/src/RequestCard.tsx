import { useId, useState } from 'react'
import type { DormRequest } from './requests'

const actions = {
  'Новая': 'Взять в работу',
  'В работе': 'Завершить',
  'Готово': 'Убрать с доски',
}
const displayDate = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Moscow',
})

const statusClasses = { 'Новая': 'new', 'В работе': 'working', 'Готово': 'done' }

interface Props {
  request: DormRequest
  onNext: () => void
  onReturn: () => void
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
      <div className="card-meta">
        <time dateTime={request.created}>Создана {displayDate.format(new Date(request.created.replace(' ', 'T')))}</time>
        {request.master && <span>Взял: {request.master}</span>}
      </div>
      {request.urgent && <span className="urgent-label">Срочно</span>}
      <p className="details" id={detailsId} hidden={!expanded}>
        {request.details || 'Подробности не указаны.'}
      </p>
      <div className="actions">
        <button type="button" aria-expanded={expanded} aria-controls={detailsId}
          onClick={() => setExpanded(open => !open)}>
          {expanded ? 'Скрыть' : 'Подробнее'}
        </button>
        <button className="accent" type="button" onClick={onNext}>
          {actions[request.status]}
        </button>
        {request.status === 'В работе' && (
          <button type="button" onClick={onReturn}>Вернуть</button>
        )}
      </div>
    </article>
  )
}
