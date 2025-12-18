export type AuthMode = 'env' | 'bearer'

export type AuthState = {
  mode: AuthMode
  bearerToken?: string
  username?: string
}

export type AuthContextValue = {
  state: AuthState | null
  loginWithBearerToken: (token: string, username?: string) => void
  logout: () => void
}

