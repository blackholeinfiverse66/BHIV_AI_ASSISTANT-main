import { useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { AuthContext } from './AuthContext'
import type { AuthContextValue, AuthState } from './authTypes'
import { readStoredAuth, writeStoredAuth } from './storage'

// build-fix-1

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AuthState | null>(() => {
    const stored = readStoredAuth()
    if (!stored) return { mode: 'env' }
    return {
      mode: stored.mode,
      bearerToken: stored.bearerToken,
      username: stored.username,
    }
  })

  const value: AuthContextValue = useMemo(
    () => ({
      state,
      loginWithBearerToken: (token, username) => {
        const next: AuthState = {
          mode: 'bearer',
          bearerToken: token,
          username,
        }
        setState(next)
        writeStoredAuth({
          mode: next.mode,
          bearerToken: next.bearerToken,
          username: next.username,
        })
      },
      logout: () => {
        setState({ mode: 'env' })
        writeStoredAuth(null)
      },
    }),
    [state],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

