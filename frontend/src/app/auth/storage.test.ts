import { describe, expect, it } from 'vitest'
import { readStoredAuth, writeStoredAuth } from './storage'

describe('auth storage', () => {
  it('round-trips stored auth', () => {
    writeStoredAuth({ mode: 'env' })
    const v = readStoredAuth()
    expect(v?.mode).toBe('env')
  })
})

