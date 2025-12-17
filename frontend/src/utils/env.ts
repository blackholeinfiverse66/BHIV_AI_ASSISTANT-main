export function getDefaultApiBaseUrl() {
  const fromEnv = import.meta.env.VITE_API_BASE_URL as string | undefined
  return (fromEnv || 'http://localhost:8000').replace(/\/$/, '')
}

export function getEnvApiKeyPrefill() {
  const v = import.meta.env.VITE_API_KEY as string | undefined
  return v && v.trim() ? v.trim() : undefined
}

export function isDebugApi() {
  return String(import.meta.env.VITE_DEBUG_API || '').toLowerCase() === 'true'
}

