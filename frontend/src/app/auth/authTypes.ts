export type AuthMode = 'apiKey' | 'bearer'

export type AuthState = {
  mode: AuthMode
  apiKey?: string
  bearerToken?: string
  username?: string
  apiBaseUrl: string
}

export type AuthContextValue = {
  state: AuthState | null
  setApiBaseUrl: (url: string) => void
  loginWithApiKey: (apiKey: string) => void
  loginWithBearerToken: (token: string, username?: string) => void
  logout: () => void
}

