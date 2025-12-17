import { useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { AuthContext } from './AuthContext'
import type { AuthContextValue, AuthState } from './authTypes'
import { readStoredAuth, writeStoredAuth } from './storage'
import { getDefaultApiBaseUrl } from '../../utils/env'

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AuthState | null>(() => {
    const stored = readStoredAuth()
    const base = stored?.apiBaseUrl || getDefaultApiBaseUrl()
    if (!stored) return { mode: 'apiKey', apiBaseUrl: base, apiKey: undefined }
    return {
      apiBaseUrl: base,
      mode: stored.mode,
      apiKey: stored.apiKey,
      bearerToken: stored.bearerToken,
      username: stored.username,
    }
  })

  const value: AuthContextValue = useMemo(
    () => ({
      state,
      setApiBaseUrl: (url) => {
        setState((prev) => {
          const next: AuthState = {
            ...(prev ?? { mode: 'apiKey', apiKey: undefined, bearerToken: undefined, username: undefined }),
            apiBaseUrl: url,
          }
          writeStoredAuth({
            apiBaseUrl: next.apiBaseUrl,
            mode: next.mode,
            apiKey: next.apiKey,
            bearerToken: next.bearerToken,
            username: next.username,
          })
          return next
        })
      },
      loginWithApiKey: (apiKey) => {
        const next: AuthState = { mode: 'apiKey', apiKey, apiBaseUrl: state?.apiBaseUrl || getDefaultApiBaseUrl() }
        setState(next)
        writeStoredAuth({ apiBaseUrl: next.apiBaseUrl, mode: next.mode, apiKey: next.apiKey })
      },
      loginWithBearerToken: (token, username) => {
        const next: AuthState = {
          mode: 'bearer',
          bearerToken: token,
          username,
          apiBaseUrl: state?.apiBaseUrl || getDefaultApiBaseUrl(),
        }
        setState(next)
        writeStoredAuth({
          apiBaseUrl: next.apiBaseUrl,
          mode: next.mode,
          bearerToken: next.bearerToken,
          username: next.username,
        })
      },
      logout: () => {
        setState({ mode: 'apiKey', apiBaseUrl: state?.apiBaseUrl || getDefaultApiBaseUrl(), apiKey: undefined })
        writeStoredAuth(null)
      },
    }),
    [state],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

