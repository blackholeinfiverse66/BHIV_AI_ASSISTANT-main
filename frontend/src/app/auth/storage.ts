const STORAGE_KEY = 'bhiv.auth.v1'

export type StoredAuth = {
  mode: 'env' | 'bearer'
  bearerToken?: string
  username?: string
}

export function readStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredAuth
    if (!parsed.mode) return null
    return parsed
  } catch {
    return null
  }
}

export function writeStoredAuth(value: StoredAuth | null) {
  if (!value) {
    localStorage.removeItem(STORAGE_KEY)
    return
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
}

