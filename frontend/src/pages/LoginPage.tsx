import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Field } from '../components/Field'
import { Input } from '../components/Input'
import { Alert } from '../components/Alert'
import { useAuth } from '../app/auth/useAuth'
import { useApi } from '../api/useApi'
import { getErrorMessage } from '../api/errors'

export function LoginPage() {
  const { loginWithBearerToken } = useAuth()
  const api = useApi()

  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [testing, setTesting] = useState(false)
  const [username, setUsername] = useState('')
  const [tokenResult, setTokenResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [issuing, setIssuing] = useState(false)

  const issueToken = async () => {
    setTokenResult(null)
    setIssuing(true)
    try {
      if (!username.trim()) throw new Error('Username is required to issue a token')

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
      // Test with env API key
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
      <Card title="BHIV API Options" className="centerCard">
        <div className="stack">
          {testResult ? (
            <Alert variant={testResult.ok ? 'success' : 'danger'} title={testResult.ok ? 'Connection OK' : 'Connection failed'}>
              {testResult.message}
            </Alert>
          ) : null}

          <Button type="button" variant="secondary" onClick={testConnection} loading={testing}>
            Test API Connection
          </Button>

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
            API base URL and key are configured via environment variables.
          </p>
        </div>
      </Card>
    </div>
  )
}

