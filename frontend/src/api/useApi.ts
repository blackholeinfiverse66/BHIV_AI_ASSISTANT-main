import { useMemo } from 'react'
import { ApiClient } from './client'
import { createBhivApi } from './api'
// import { useAuth } from '../app/auth/useAuth'

export function useApi() {
  // const { state } = useAuth()

  return useMemo(() => {
    const client = new ApiClient(() => {
      // No auth needed
      return null
    })
    return createBhivApi(client)
  }, [])
}

