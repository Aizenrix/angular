import { useEffect, useRef, useState } from 'react'
import Header from './Header'
import RequestCard from './RequestCard'
import RequestForm from './RequestForm'
import { notify } from './notify'
import { statuses } from './requests'
import type { DormRequest, RequestDraft } from './requests'
import { loadRequests, saveRequests } from './storage'

const filters = ['Все', ...statuses] as const
type Filter = typeof filters[number]

export default function App() {
  const [requests, setRequests] = useState(loadRequests)
  const [filter, setFilter] = useState<Filter>('Все')
  const [query, setQuery] = useState('')
  const [feedback, setFeedback] = useState('')
  const [storageFailed, setStorageFailed] = useState(false)
  const latestNotification = useRef(0)

  useEffect(() => {
    setStorageFailed(!saveRequests(requests))
  }, [requests])

  const counts = { Все: requests.length, Новая: 0, 'В работе': 0, Готово: 0 }
  for (const request of requests) counts[request.status] += 1
  const search = query.trim().toLowerCase()
  const visible = requests.filter(request =>
    (filter === 'Все' || request.status === filter)
    && request.title.toLowerCase().includes(search),
  )

  async function addRequest(draft: RequestDraft) {
    const request: DormRequest = { ...draft, id: crypto.randomUUID(), status: 'Новая' }
    setRequests(previous => [request, ...previous])
    setFilter('Все')
    setQuery('')
    const notification = ++latestNotification.current
    setFeedback('Заявка добавлена. Проверяем доставку уведомления…')
    const result = await notify(request)
    if (notification === latestNotification.current) setFeedback(result)
  }

  function advance(id: string) {
    setRequests(previous => previous.flatMap(request => {
      if (request.id !== id) return [request]
      if (request.status === 'Готово') return []
      return [{ ...request, status: request.status === 'Новая' ? 'В работе' : 'Готово' }]
    }))
  }

  function returnRequest(id: string) {
    setRequests(previous => previous.map(request =>
      request.id === id && request.status === 'В работе'
        ? { ...request, status: 'Новая' }
        : request,
    ))
  }

  return (
    <>
      <Header newCount={counts.Новая} />
      <main>
        <div>
          <RequestForm onAdd={addRequest} />
          <div className="feedback" role="status">{feedback}</div>
          {storageFailed && <p className="error" role="alert">Не удалось сохранить заявки в браузере.</p>}
        </div>
        <section aria-labelledby="requests">
          <h2 id="requests">Заявки</h2>
          <input className="search" type="search" aria-label="Поиск по названию"
            placeholder="Поиск по названию" value={query} onChange={event => setQuery(event.target.value)} />
          <div className="filters" role="group" aria-label="Фильтр по статусу">
            {filters.map(item => (
              <button key={item} type="button" aria-pressed={filter === item} onClick={() => setFilter(item)}>
                {item} ({counts[item]})
              </button>
            ))}
          </div>
          <div className="cards">
            {visible.map(request => (
              <RequestCard key={request.id} request={request} onNext={advance} onReturn={returnRequest} />
            ))}
            {visible.length === 0 && <p className="panel empty">Заявок нет.</p>}
          </div>
        </section>
      </main>
    </>
  )
}
