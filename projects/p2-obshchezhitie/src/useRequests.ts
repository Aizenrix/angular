import { useEffect, useRef, useState } from 'react'
import { createRequest, deleteRequest, listRequests, updateRequest } from './api'
import { subscribeRequests } from './realtime'
import { applyChange } from './requests'
import type { DormRequest, RequestChange, RequestDraft, Status } from './requests'
import { queueDispatch } from './webhook'

export type SyncMode = 'realtime' | 'polling'

export function useRequests(mode: SyncMode) {
  const [requests, setRequests] = useState<DormRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [syncWarning, setSyncWarning] = useState('')
  const [attempt, setAttempt] = useState(0)
  const pendingEvents = useRef<RequestChange[] | null>(null)
  const latestNotice = useRef(0)

  function retry() {
    setLoading(true)
    setError('')
    setAttempt(value => value + 1)
  }

  function merge(event: RequestChange) {
    pendingEvents.current?.push(event)
    setRequests(current => applyChange(current, event))
  }

  useEffect(() => {
    let disposed = false
    let activeLoad: AbortController | undefined
    let unsubscribe: (() => Promise<void>) | undefined

    async function load() {
      activeLoad?.abort()
      const controller = new AbortController()
      activeLoad = controller
      const events: RequestChange[] = []
      pendingEvents.current = events
      try {
        const records = await listRequests(controller.signal)
        if (!disposed && activeLoad === controller) {
          setRequests(events.reduce(applyChange, records))
          setError('')
        }
      } catch {
        if (!disposed && activeLoad === controller) {
          setError('Не удалось загрузить заявки из PocketBase.')
        }
      } finally {
        if (!disposed && activeLoad === controller) {
          setLoading(false)
          pendingEvents.current = null
        }
      }
    }

    void load()
    let timer: ReturnType<typeof setInterval> | undefined
    if (mode === 'polling') {
      setSyncWarning('')
      timer = setInterval(() => void load(), 10000)
    } else {
      void subscribeRequests(merge, () => {
        if (!disposed) void load()
      }).then(stop => {
        if (disposed) { void stop(); return }
        unsubscribe = stop
        setSyncWarning('')
        void load()
      }).catch(() => {
        if (!disposed) setSyncWarning('Подписка недоступна. Нажмите «Повторить» для переподключения.')
      })
    }

    return () => {
      disposed = true
      activeLoad?.abort()
      pendingEvents.current = null
      if (timer) clearInterval(timer)
      if (unsubscribe) void unsubscribe()
    }
  }, [attempt, mode])

  async function add(draft: RequestDraft): Promise<boolean> {
    const operation = ++latestNotice.current
    try {
      const record = await createRequest(draft)
      merge({ action: 'create', record })
      setNotice('Заявка сохранена. Передаём её диспетчеру…')
      void queueDispatch(record).then(accepted => {
        if (operation === latestNotice.current) {
          setNotice(accepted
            ? 'Заявка сохранена и передана ИИ-диспетчеру.'
            : 'Заявка сохранена. Запуск ИИ-диспетчера подтвердить не удалось.')
        }
      })
      return true
    } catch {
      setNotice('Не удалось сохранить заявку в PocketBase. Попробуйте ещё раз.')
      return false
    }
  }

  async function changeStatus(request: DormRequest, status: Status) {
    try {
      const record = await updateRequest(request.id, status)
      merge({ action: 'update', record })
    } catch {
      setNotice('Не удалось изменить статус. Обновите список и попробуйте ещё раз.')
    }
  }

  async function remove(request: DormRequest) {
    try {
      await deleteRequest(request.id)
      merge({ action: 'delete', record: request })
    } catch {
      setNotice('Не удалось убрать заявку. Удалить можно только завершённую заявку.')
    }
  }

  return { requests, loading, error, notice, syncWarning, retry, add, changeStatus, remove }
}
