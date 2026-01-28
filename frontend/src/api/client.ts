import { ApiError } from './errors'
import { isDebugApi } from '../utils/env'

type RetryOptions = {
  retries: number
  baseDelayMs: number
}

type RequestOptions = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  query?: Record<string, string | number | boolean | undefined>
  headers?: Record<string, string | undefined>
  json?: unknown
  formData?: FormData
  timeoutMs?: number
  retry?: Partial<RetryOptions>
}

export type AuthHeaders =
  | { kind: 'apiKey'; apiKey: string }
  | { kind: 'bearer'; token: string }

const defaultRetry: RetryOptions = { retries: 2, baseDelayMs: 350 }

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function buildUrl(baseUrl: string, path: string, query?: RequestOptions['query']) {
  const u = new URL(path.startsWith('http') ? path : `${baseUrl}${path}`)
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined) continue
      u.searchParams.set(k, String(v))
    }
  }
  return u.toString()
}

async function parseJsonSafe(res: Response): Promise<unknown> {
  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    const text = await res.text().catch(() => '')
    return text ? { raw: text } : null
  }
  return res.json().catch(() => null)
}

function deriveMessage(payload: unknown): string {
  if (!payload) return 'Request failed'
  if (typeof payload === 'string') return payload
  if (typeof payload === 'object') {
    const maybe = payload as any
    if (typeof maybe.detail === 'string') return maybe.detail
    if (typeof maybe.error === 'string') return maybe.error
    if (typeof maybe.message === 'string') return maybe.message
  }
  return 'Request failed'
}

export class ApiClient {
  readonly isConfigured: boolean
  private readonly baseUrl: string
  private readonly apiKey: string
  private readonly getAuth: () => AuthHeaders | null

  constructor(getAuth: () => AuthHeaders | null) {
    // ✅ FIX: normalize base URL (remove trailing slash)
    const rawBaseUrl = import.meta.env.VITE_API_BASE_URL
    this.baseUrl = rawBaseUrl ? rawBaseUrl.replace(/\/$/, '') : ''
    this.apiKey = import.meta.env.VITE_API_KEY

    // ✅ FIX: Don't throw - expose configuration status instead
    this.isConfigured = Boolean(this.baseUrl && this.apiKey)

    this.getAuth = getAuth
  }

  async request<T>(opts: RequestOptions): Promise<T> {
    const retry = { ...defaultRetry, ...(opts.retry || {}) }

    // In development, use relative URLs for /api/* paths to leverage Vite proxy
    const isDevelopment = import.meta.env.DEV
    const isApiPath =
      opts.path.startsWith('/api') ||
      opts.path.startsWith('/health') ||
      opts.path.startsWith('/metrics')

    const baseUrl = isDevelopment && isApiPath ? '' : this.baseUrl
    const url = buildUrl(baseUrl, opts.path, opts.query)

    const auth = this.getAuth()
    const headers: Record<string, string> = {}

    if (opts.headers) {
      for (const [key, value] of Object.entries(opts.headers)) {
        if (value !== undefined) headers[key] = value
      }
    }

    headers['X-API-Key'] = this.apiKey
    if (auth?.kind === 'bearer') {
      headers['Authorization'] = `Bearer ${auth.token}`
    }

    let body: BodyInit | undefined
    if (opts.formData) {
      body = opts.formData
    } else if (opts.json !== undefined) {
      headers['Content-Type'] = 'application/json'
      body = JSON.stringify(opts.json)
    }

    const timeoutMs = opts.timeoutMs ?? 30_000

    for (let attempt = 0; attempt <= retry.retries; attempt++) {
      const controller = new AbortController()
      const t = setTimeout(() => controller.abort(new Error('Timeout')), timeoutMs)

      try {
        if (isDebugApi()) {
          // eslint-disable-next-line no-console
          console.debug('[api]', opts.method, url, { attempt, headers, hasBody: Boolean(body) })
        }

        const res = await fetch(url, {
          method: opts.method,
          headers,
          body,
          signal: controller.signal,
        })

        if (res.ok) {
          return (await parseJsonSafe(res)) as T
        }

        const payload = await parseJsonSafe(res)
        const msg = deriveMessage(payload)
        const err = new ApiError(msg, {
          status: res.status,
          requestId: res.headers.get('x-request-id') || undefined,
          payload,
        })

        const shouldRetry = [429, 502, 503, 504].includes(res.status)
        if (!shouldRetry || attempt >= retry.retries) throw err

        const retryAfter = res.headers.get('retry-after')
        const delay = retryAfter
          ? Number(retryAfter) * 1000
          : retry.baseDelayMs * Math.pow(2, attempt)

        await sleep(delay)
      } catch (e) {
        const error = e as Error
        const isAbort = error?.name === 'AbortError'
        const isNetwork = error instanceof TypeError
        const shouldRetry = (isAbort || isNetwork) && attempt < retry.retries

        if (!shouldRetry) {
          if (error instanceof ApiError) throw error
          throw new ApiError(error?.message || 'Network error', { status: 0 })
        }

        await sleep(retry.baseDelayMs * Math.pow(2, attempt))
      } finally {
        clearTimeout(t)
      }
    }

    throw new ApiError('Request failed after retries', { status: 0 })
  }
}
