export function isDebugApi() {
  return String(import.meta.env.VITE_DEBUG_API || '').toLowerCase() === 'true'
}

