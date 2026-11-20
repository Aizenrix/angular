import PocketBase, { BaseAuthStore } from 'pocketbase'
import type { DormRequest, RequestDraft, Status } from './requests'

export const collection = 'obshchezhitie'
const baseUrl = import.meta.env.VITE_POCKETBASE_URL?.trim() || 'http://localhost:8090'
export const pb = new PocketBase(baseUrl, new BaseAuthStore())
pb.autoCancellation(false)
const records = pb.collection(collection)

export function listRequests(signal: AbortSignal) {
  return records.getFullList<DormRequest>({ sort: '-created,-id', signal })
}

export function createRequest(draft: RequestDraft) {
  return records.create<DormRequest>({ ...draft, status: 'Новая' })
}

export function updateRequest(id: string, status: Status) {
  return records.update<DormRequest>(id, status === 'Новая' ? { status, master: '' } : { status })
}

export function deleteRequest(id: string) {
  return records.delete(id)
}
