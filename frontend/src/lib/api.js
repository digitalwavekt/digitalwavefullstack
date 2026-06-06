import { useAuthStore } from '../hooks/useAuthStore'

// Get API URL from environment or determine based on hostname
const getAPIUrl = () => {
  // First priority: explicit environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }

  // If running in browser, check hostname
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    const protocol = window.location.protocol

    // Map frontend domains to API domains
    const domainMap = {
      'digitalwaveitsolution.online': 'https://api.digitalwaveitsolution.online',
      'www.digitalwaveitsolution.online': 'https://api.digitalwaveitsolution.online',
      'localhost': 'http://localhost:5000',
      '127.0.0.1': 'http://localhost:5000',
    }

    // Check if hostname matches any known domain
    for (const [key, value] of Object.entries(domainMap)) {
      if (hostname.includes(key)) {
        return value
      }
    }

    // Fallback: use same origin but ensure protocol is https on production
    const origin = `${protocol}//${hostname}`
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return origin
    }
    // For production, try to use api subdomain
    if (protocol === 'https:') {
      return 'https://api.digitalwaveitsolution.online'
    }
  }

  // Last resort fallback
  return 'https://api.digitalwaveitsolution.online'
}

const API_URL = getAPIUrl()
  .replace(/\/+$/, '')
  .replace(/\/api$/, '')

console.log('🌐 API URL:', API_URL) // Debug log

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
    const fullUrl = `${API_URL}${endpoint}`
    console.log('📡 Fetching:', fullUrl) // Debug log

    const res = await fetch(fullUrl, {
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
    console.error('❌ API Error:', error.message) // Debug log
    throw error
  } finally {
    clearTimeout(timeout)
  }
}
