export class ApiError extends Error {
  public status: number
  public requestId?: string
  public payload?: unknown

  constructor(message: string, opts: { status: number; requestId?: string; payload?: unknown }) {
    super(message)
    this.name = 'ApiError'
    this.status = opts.status
    this.requestId = opts.requestId
    this.payload = opts.payload
  }
}

export function getErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return `${err.status}: ${err.message}`
  if (err instanceof Error) return err.message
  return 'Unknown error'
}

