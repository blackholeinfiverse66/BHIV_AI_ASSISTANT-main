import { useMemo } from 'react'
import { ApiClient } from './client'
import { createBhivApi } from './api'
import { useAuth } from '../app/auth/useAuth'

export function useApi() {
  const { state } = useAuth()

  return useMemo(() => {
    const baseUrl = (state?.apiBaseUrl || 'http://localhost:8000').replace(/\/$/, '')
    const client = new ApiClient(baseUrl, () => {
      if (!state) return null
      if (state.mode === 'apiKey' && state.apiKey) return { kind: 'apiKey', apiKey: state.apiKey }
      if (state.mode === 'bearer' && state.bearerToken) return { kind: 'bearer', token: state.bearerToken }
      return null
    })
    return createBhivApi(client)
  }, [state])
}

