import { describe, expect, it } from 'vitest'
import { readStoredAuth, writeStoredAuth } from './storage'

describe('auth storage', () => {
  it('round-trips stored auth', () => {
    writeStoredAuth({ apiBaseUrl: 'http://localhost:8000', mode: 'apiKey', apiKey: 'x' })
    const v = readStoredAuth()
    expect(v?.apiBaseUrl).toBe('http://localhost:8000')
    expect(v?.mode).toBe('apiKey')
    expect(v?.apiKey).toBe('x')
  })
})

