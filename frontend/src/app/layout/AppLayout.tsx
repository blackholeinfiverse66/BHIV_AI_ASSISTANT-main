import { Outlet } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { Button } from '../../components/Button'

export function AppLayout() {
  const { state, logout } = useAuth()
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar__brand">
          <span className="brandDot" aria-hidden />
          <span className="topbar__title">BHIV Client</span>
        </div>
        <div className="topbar__meta">
          <span className="pill">{state?.mode === 'bearer' ? `User: ${state.username || 'token'}` : 'API Key'}</span>
          <span className="pill pill--muted">{apiBaseUrl}</span>
          <Button variant="ghost" size="sm" onClick={logout}>
            Log out
          </Button>
        </div>
      </header>


      <main className="main" role="main" style={{ marginLeft: 0 }}>
        <Outlet />
      </main>
    </div>
  )
}

