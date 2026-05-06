const API_URL = import.meta.env.VITE_API_URL

export const apiFetch = async (
    endpoint,
    options = {}
) => {
    const token = localStorage.getItem('token')

    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    }

    if (token) {
        headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(
        `${API_URL}${endpoint}`,
        {
            ...options,
            headers,
        }
    )

    let data = null

    try {
        data = await response.json()
    } catch {
        data = null
    }

    if (!response.ok) {
        throw new Error(
            data?.message || 'Request failed'
        )
    }

    return data
}