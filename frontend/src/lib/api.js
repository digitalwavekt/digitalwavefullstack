import { useAuthStore } from '../hooks/useAuthStore'

const API_URL = (import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://digitalwavefullstack.onrender.com'))
  .replace(/\/+$/, '')
  .replace(/\/api$/, '')
const REQUEST_TIMEOUT_MS = 20000

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value || '{}')
  } catch {
    return {}
  }
}

export const getStoredToken = () => {
  const storeToken = useAuthStore.getState()?.token
  const localToken =
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken') ||
    safeJsonParse(localStorage.getItem('digitalwave-auth'))?.state?.token ||
    safeJsonParse(localStorage.getItem('auth-storage'))?.state?.token ||
    safeJsonParse(localStorage.getItem('authStore'))?.state?.token

  return storeToken || localToken || ''
}

export const apiFetch = async (endpoint, options = {}) => {
  if (!endpoint?.startsWith('/')) {
    throw new Error('API endpoint must start with /')
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  const headers = {
    Accept: 'application/json',
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  }

  const token = getStoredToken() || localStorage.getItem('studentProjectToken')

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    })

    const contentType = res.headers.get('content-type') || ''
    const data = contentType.includes('application/json')
      ? await res.json().catch(() => ({}))
      : await res.text().catch(() => '')

    if (!res.ok || data?.success === false) {
      const message = data?.message || data?.error || `Request failed with status ${res.status}`
      throw new Error(message)
    }

    return data
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout. Please try again.')
    }
    throw error
  } finally {
    clearTimeout(timeout)
  }
}
