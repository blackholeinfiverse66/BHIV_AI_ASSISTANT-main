import { describe, expect, it, vi } from 'vitest'
import { ApiClient } from './client'
import { ApiError } from './errors'

describe('ApiClient', () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('retries on 503 then succeeds', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ detail: 'busy' }), { status: 503, headers: { 'content-type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } }))

    globalThis.fetch = fetchMock as any

    const api = new ApiClient('http://example.com', () => ({ kind: 'apiKey', apiKey: 'k' }))
    const res = await api.request<{ ok: boolean }>({ method: 'GET', path: '/api/test', retry: { retries: 1, baseDelayMs: 1 } })

    expect(res.ok).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('throws ApiError with status for non-retriable error', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ detail: 'nope' }), { status: 400, headers: { 'content-type': 'application/json' } }))

    globalThis.fetch = fetchMock as any

    const api = new ApiClient('http://example.com', () => ({ kind: 'apiKey', apiKey: 'k' }))
    await expect(api.request({ method: 'GET', path: '/api/test', retry: { retries: 2, baseDelayMs: 1 } })).rejects.toBeInstanceOf(ApiError)
  })
})

