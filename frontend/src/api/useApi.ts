import { useMemo } from 'react'
import { ApiClient } from './client'
import { createBhivApi } from './api'
import { useAuth } from '../app/auth/useAuth'

export function useApi() {
  const { state } = useAuth()

  return useMemo(() => {
    const client = new ApiClient(() => {
      if (!state) return null
      if (state.mode === 'bearer' && state.bearerToken) return { kind: 'bearer', token: state.bearerToken }
      return null
    })
    return createBhivApi(client)
  }, [state])
}

