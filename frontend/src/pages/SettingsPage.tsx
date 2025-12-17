import { useState } from 'react'
import { Card } from '../components/Card'
import { Field } from '../components/Field'
import { Input } from '../components/Input'
import { Button } from '../components/Button'
import { Alert } from '../components/Alert'
import { useAuth } from '../app/auth/useAuth'

export function SettingsPage() {
  const { state, setApiBaseUrl } = useAuth()
  const [url, setUrl] = useState(state?.apiBaseUrl || '')
  const [saved, setSaved] = useState(false)

  return (
    <div className="grid">
      <Card title="Settings">
        <div className="stack">
          <Field label="API Base URL" hint="Changing this will affect all API calls.">
            <Input value={url} onChange={(e) => setUrl(e.target.value)} />
          </Field>
          <Button
            variant="secondary"
            onClick={() => {
              setApiBaseUrl(url.replace(/\/$/, ''))
              setSaved(true)
              setTimeout(() => setSaved(false), 1500)
            }}
          >
            Save
          </Button>
          {saved ? <Alert variant="success">Saved.</Alert> : null}
        </div>
      </Card>
      <Card title="Notes">
        <ul className="list">
          <li>
            Backend requires <code>X-API-Key</code> (or Bearer token) for all <code>/api</code> routes.
          </li>
          <li>
            If you enable the optional auth router, you can issue a JWT token via <code>/api/auth/token</code>.
          </li>
        </ul>
      </Card>
    </div>
  )
}

