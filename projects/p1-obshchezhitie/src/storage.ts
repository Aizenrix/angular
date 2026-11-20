import { categories, initialRequests, statuses } from './requests'
import type { DormRequest } from './requests'

const key = 'zayavki-obshchezhitie'

function isStoredRequest(value: unknown): value is Omit<DormRequest, 'urgent'> & { urgent?: boolean } {
  if (!value || typeof value !== 'object') return false
  const request = value as Record<string, unknown>
  return typeof request.id === 'string'
    && typeof request.title === 'string'
    && typeof request.room === 'string'
    && typeof request.details === 'string'
    && categories.some(category => category === request.category)
    && statuses.some(status => status === request.status)
    && (request.urgent === undefined || typeof request.urgent === 'boolean')
}

export function loadRequests(): DormRequest[] {
  try {
    const stored = localStorage.getItem(key)
    if (stored !== null) {
      const value: unknown = JSON.parse(stored)
      if (Array.isArray(value) && value.every(isStoredRequest)) {
        return value.map(request => ({ ...request, urgent: request.urgent ?? false }))
      }
    }
  } catch {
    // Доска может открыться и при недоступном хранилище.
  }
  return initialRequests
}

export function saveRequests(requests: DormRequest[]): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(requests))
    return true
  } catch {
    return false
  }
}
