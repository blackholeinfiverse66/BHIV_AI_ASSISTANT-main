import { useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Field } from '../components/Field'
import { Input } from '../components/Input'
import { Alert } from '../components/Alert'
import { getEnvApiKeyPrefill, getDefaultApiBaseUrl } from '../utils/env'
import { useAuth } from '../app/auth/useAuth'
import { useApi } from '../api/useApi'
import { getErrorMessage } from '../api/errors'

const schema = z.object({
  apiBaseUrl: z.string().url().transform((s) => s.replace(/\/$/, '')),
  apiKey: z.string().min(3, 'API key is required'),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const { state, setApiBaseUrl, loginWithApiKey, loginWithBearerToken } = useAuth()
  const api = useApi()
  const nav = useNavigate()
  const loc = useLocation() as any

  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [testing, setTesting] = useState(false)
  const [username, setUsername] = useState('')
  const [tokenResult, setTokenResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [issuing, setIssuing] = useState(false)

  const defaultValues: FormValues = useMemo(
    () => ({
      apiBaseUrl: state?.apiBaseUrl || getDefaultApiBaseUrl(),
      apiKey: state?.apiKey || getEnvApiKeyPrefill() || '',
    }),
    [state],
  )

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const onSubmit = (values: FormValues) => {
    setApiBaseUrl(values.apiBaseUrl)
    loginWithApiKey(values.apiKey)
    const next = loc?.state?.from || '/'
    nav(next, { replace: true })
  }

  const issueToken = async () => {
    setTokenResult(null)
    setIssuing(true)
    try {
      const values = schema.parse(form.getValues())
      if (!username.trim()) throw new Error('Username is required to issue a token')

      // Token issuance requires API key, then you can switch to Bearer for subsequent calls.
      setApiBaseUrl(values.apiBaseUrl)
      loginWithApiKey(values.apiKey)

      const token = await api.token({ username: username.trim() })
      loginWithBearerToken(token.access_token, username.trim())

      setTokenResult({ ok: true, message: 'Issued JWT token and switched to Bearer auth.' })
    } catch (e) {
      setTokenResult({ ok: false, message: getErrorMessage(e) })
    } finally {
      setIssuing(false)
    }
  }

  const testConnection = async () => {
    setTestResult(null)
    setTesting(true)
    try {
      const values = schema.parse(form.getValues())
      setApiBaseUrl(values.apiBaseUrl)
      loginWithApiKey(values.apiKey)
      // Lightweight check: intent endpoint
      const r = await api.intent({ text: 'hello' })
      setTestResult({ ok: true, message: `OK. Intent response keys: ${Object.keys(r).slice(0, 6).join(', ') || '(none)'}` })
    } catch (e) {
      setTestResult({ ok: false, message: getErrorMessage(e) })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="centerPage">
      <Card title="Connect to BHIV API" className="centerCard">
        <form onSubmit={form.handleSubmit(onSubmit)} className="stack">
          <Field
            label="API Base URL"
            hint="Your backend host. Example: http://localhost:8000"
            error={form.formState.errors.apiBaseUrl?.message}
          >
            <Input placeholder="http://localhost:8000" {...form.register('apiBaseUrl')} />
          </Field>
          <Field label="X-API-Key" hint="Required for all /api routes" error={form.formState.errors.apiKey?.message}>
            <Input type="password" placeholder="your-api-key" autoComplete="off" {...form.register('apiKey')} />
          </Field>

          {testResult ? (
            <Alert variant={testResult.ok ? 'success' : 'danger'} title={testResult.ok ? 'Connection OK' : 'Connection failed'}>
              {testResult.message}
            </Alert>
          ) : null}

          <div className="row">
            <Button type="button" variant="secondary" onClick={testConnection} loading={testing}>
              Test
            </Button>
            <Button type="submit">Continue</Button>
          </div>

          <div className="divider" role="separator" aria-label="Optional authentication" />
          <p className="muted">
            Optional: if the backend exposes <code>/api/auth/token</code>, you can issue a short-lived JWT and use Bearer auth.
          </p>
          <Field label="Username (for token issuance)" hint="Backend must include the auth router under /api.">
            <Input value={username} onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)} placeholder="e.g., alice" />
          </Field>
          {tokenResult ? (
            <Alert variant={tokenResult.ok ? 'success' : 'danger'} title={tokenResult.ok ? 'Token issued' : 'Token issuance failed'}>
              {tokenResult.message}
            </Alert>
          ) : null}
          <Button type="button" variant="secondary" onClick={issueToken} loading={issuing}>
            Issue JWT & switch to Bearer
          </Button>

          <p className="muted">
            Security note: API keys are stored in your browser localStorage for convenience. Use a dedicated dev key.
          </p>
        </form>
      </Card>
    </div>
  )
}

