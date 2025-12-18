import type { PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'

export function RequireAuth({ children }: PropsWithChildren) {
  const { state } = useAuth()
  const loc = useLocation()

  const hasAuth =
    state?.mode === 'env' ||
    (state?.mode === 'bearer' && Boolean(state.bearerToken))

  if (!hasAuth) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  }

  return <>{children}</>
}

