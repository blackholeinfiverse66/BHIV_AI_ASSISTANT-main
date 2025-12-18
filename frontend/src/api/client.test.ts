import { describe, expect, it, vi } from 'vitest'
import { ApiClient } from './client'
import { ApiError } from './errors'

describe('ApiClient', () => {
  const originalFetch = globalThis.fetch
  const originalEnv = import.meta.env

  afterEach(() => {
    globalThis.fetch = originalFetch
    ;(import.meta as any).env = originalEnv
  })

  it('retries on 503 then succeeds', async () => {
    ;(import.meta as any).env = { ...originalEnv, VITE_API_BASE_URL: 'http://example.com', VITE_API_KEY: 'k' }

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ detail: 'busy' }), { status: 503, headers: { 'content-type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } }))

    globalThis.fetch = fetchMock as any

    const api = new ApiClient(() => null)
    const res = await api.request<{ ok: boolean }>({ method: 'GET', path: '/api/test', retry: { retries: 1, baseDelayMs: 1 } })

    expect(res.ok).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('throws ApiError with status for non-retriable error', async () => {
    ;(import.meta as any).env = { ...originalEnv, VITE_API_BASE_URL: 'http://example.com', VITE_API_KEY: 'k' }

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ detail: 'nope' }), { status: 400, headers: { 'content-type': 'application/json' } }))

    globalThis.fetch = fetchMock as any

    const api = new ApiClient(() => null)
    await expect(api.request({ method: 'GET', path: '/api/test', retry: { retries: 2, baseDelayMs: 1 } })).rejects.toBeInstanceOf(ApiError)
  })
})

