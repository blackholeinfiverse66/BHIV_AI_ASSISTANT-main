import { Card } from '../components/Card'

export function SettingsPage() {
  return (
    <div className="grid">
      <Card title="Notes">
        <ul className="list">
          <li>
            Backend requires <code>X-API-Key</code> (or Bearer token) for all <code>/api</code> routes.
          </li>
          <li>
            API base URL and key are configured via environment variables.
          </li>
          <li>
            If you enable the optional auth router, you can issue a JWT token via <code>/api/auth/token</code>.
          </li>
        </ul>
      </Card>
    </div>
  )
}

