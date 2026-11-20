import { collection, pb } from './api'
import type { DormRequest, RequestChange } from './requests'

export async function subscribeRequests(onChange: (event: RequestChange) => void, onReconnect: () => void) {
  const stopRecords = await pb.collection(collection).subscribe<DormRequest>('*', ({ action, record }) => {
    if (action === 'create' || action === 'update' || action === 'delete') onChange({ action, record })
  })
  try {
    const stopReconnect = await pb.realtime.subscribe('PB_CONNECT', onReconnect)
    return async () => { await stopReconnect(); await stopRecords() }
  } catch (error) {
    await stopRecords()
    throw error
  }
}
