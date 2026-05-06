import { useAuthStore } from '../hooks/useAuthStore'

const API_URL = import.meta.env.VITE_API_URL

export const apiFetch = async (endpoint, options = {}) => {
    const storeToken = useAuthStore.getState()?.token

    const localToken =
        localStorage.getItem('token') ||
        localStorage.getItem('accessToken') ||
        JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token ||
        JSON.parse(localStorage.getItem('authStore') || '{}')?.state?.token

    const token = storeToken || localToken

    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    }

    if (token) {
        headers.Authorization = `Bearer ${token}`
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok || data.success === false) {
        throw new Error(data.message || 'Request failed')
    }

    return data
}