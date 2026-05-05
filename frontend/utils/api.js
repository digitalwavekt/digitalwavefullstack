import axios from 'axios'

// Get API URL from environment or use default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Create axios instance with proper config
const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for CORS with credentials
    timeout: 30000, // 30 second timeout
})

// Request interceptor - add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        // Log requests in development
        if (import.meta.env.DEV) {
            console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data)
        }

        return config
    },
    (error) => {
        console.error('❌ Request Error:', error)
        return Promise.reject(error)
    }
)

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => {
        if (import.meta.env.DEV) {
            console.log(`📥 API Response: ${response.config.url}`, response.data)
        }
        return response
    },
    (error) => {
        console.error('❌ API Error:', error)

        // Handle CORS errors
        if (error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
            console.error('🔥 CORS or Network Error - Check backend CORS config')
            console.error('Backend URL:', API_URL)
            console.error('Request URL:', error.config?.url)
        }

        // Handle 401 - Unauthorized
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            sessionStorage.removeItem('token')
            window.location.href = '/admin/login'
        }

        // Handle 403 - CORS blocked
        if (error.response?.status === 403 && error.response?.data?.message?.includes('CORS')) {
            console.error('🔒 CORS Blocked:', error.response.data)
            console.error('Your origin:', window.location.origin)
            console.error('Allowed origins:', error.response.data?.allowedOrigins)
        }

        return Promise.reject(error)
    }
)

export default api

// Helper functions for common API calls
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (data) => api.post('/auth/register', data),
    logout: () => api.post('/auth/logout'),
    me: () => api.get('/auth/me'),
}

export const studentAPI = {
    getAll: () => api.get('/student'),
    getById: (id) => api.get(`/student/${id}`),
    create: (data) => api.post('/student', data),
    update: (id, data) => api.put(`/student/${id}`, data),
    delete: (id) => api.delete(`/student/${id}`),
}

export const contactAPI = {
    submit: (data) => api.post('/contact', data),
    getAll: () => api.get('/contact'),
}

export const paymentAPI = {
    create: (data) => api.post('/payment/create', data),
    verify: (data) => api.post('/payment/verify', data),
}

export const adminAPI = {
    dashboard: () => api.get('/admin/dashboard'),
    stats: () => api.get('/admin/stats'),
    settings: () => api.get('/admin/settings'),
    updateSettings: (data) => api.put('/admin/settings', data),
}