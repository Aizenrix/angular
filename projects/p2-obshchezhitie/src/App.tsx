import { useState } from 'react'
import Header from './Header'
import RequestCard from './RequestCard'
import RequestForm from './RequestForm'
import { statuses } from './requests'
import type { RequestDraft } from './requests'
import { useRequests } from './useRequests'
import type { SyncMode } from './useRequests'

const filters = ['Все', ...statuses] as const
type Filter = typeof filters[number]

export default function App() {
  const [filter, setFilter] = useState<Filter>('Все')
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<SyncMode>('realtime')
  const board = useRequests(mode)

  const counts = { Все: board.requests.length, Новая: 0, 'В работе': 0, Готово: 0 }
  for (const request of board.requests) counts[request.status] += 1
  const search = query.trim().toLowerCase()
  const visible = board.requests.filter(request =>
    (filter === 'Все' || request.status === filter)
    && request.title.toLowerCase().includes(search),
  )

  async function addRequest(draft: RequestDraft) {
    const saved = await board.add(draft)
    if (saved) {
      setFilter('Все')
      setQuery('')
    }
    return saved
  }

  return (
    <>
      <Header newCount={counts.Новая} />
      <main>
        <div>
          <RequestForm onAdd={addRequest} />
          <div className="feedback" role="status">{board.notice}</div>
        </div>
        <section aria-labelledby="requests">
          <div className="board-heading">
            <h2 id="requests">Заявки</h2>
            <label className="sync-option">Обновление
              <select value={mode} onChange={event => setMode(event.target.value === 'polling' ? 'polling' : 'realtime')}>
                <option value="realtime">По событиям</option>
                <option value="polling">Опрос каждые 10 с</option>
              </select>
            </label>
          </div>
          <input className="search" type="search" aria-label="Поиск по названию"
            placeholder="Поиск по названию" value={query} onChange={event => setQuery(event.target.value)} />
          <div className="filters" role="group" aria-label="Фильтр по статусу">
            {filters.map(item => (
              <button key={item} type="button" aria-pressed={filter === item} onClick={() => setFilter(item)}>
                {item} ({counts[item]})
              </button>
            ))}
          </div>
          {board.loading && <p className="panel empty" role="status">Загружаем заявки…</p>}
          {!board.loading && (board.error || board.syncWarning) && (
            <div className="panel empty" role="alert">
              <p>{board.error || board.syncWarning}</p>
              <button type="button" onClick={board.retry}>Повторить</button>
            </div>
          )}
          {!board.loading && !board.error && (
            <div className="cards">
              {visible.map(request => (
                <RequestCard key={request.id} request={request}
                  onNext={() => request.status === 'Готово'
                    ? board.remove(request)
                    : board.changeStatus(request, request.status === 'Новая' ? 'В работе' : 'Готово')}
                  onReturn={() => board.changeStatus(request, 'Новая')} />
              ))}
              {visible.length === 0 && <p className="panel empty">Заявок нет.</p>}
            </div>
          )}
        </section>
      </main>
    </>
  )
}
