import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { Button } from '../../components/Button'

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/chat', label: 'Chat' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/nlu', label: 'NLU' },
  { to: '/embeddings', label: 'Embeddings' },
  { to: '/voice', label: 'Voice' },
  { to: '/decision', label: 'Decision Hub' },
  { to: '/external', label: 'External' },
  { to: '/settings', label: 'Settings' },
]

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


      <div className="content">
        <nav className="sidebar" aria-label="Primary">
          {navItems.map((it) => (
            <NavLink key={it.to} to={it.to} end={it.to === '/'} className={({ isActive }) => (isActive ? 'navLink navLink--active' : 'navLink')}>
              {it.label}
            </NavLink>
          ))}
        </nav>

        <main className="main" role="main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

