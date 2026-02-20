import axios from 'axios'

// Use environment variables with fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
})

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear all auth data
            localStorage.removeItem('auth_token')
            localStorage.removeItem('auth_user')
            localStorage.removeItem('token')

            // Show alert before redirect
            const message = error.response?.data?.message || 'Session expired. Please login again.'
            console.warn('Authentication failed:', message)

            // Redirect to login
            if (window.location.pathname !== '/login') {
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

// Helper function to check if token is expired
export const isTokenExpired = (token: string): boolean => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const exp = payload.exp * 1000 // Convert to milliseconds
        return Date.now() >= exp
    } catch (error) {
        return true // If can't parse, consider it expired
    }
}

// Helper function to check token before making requests
export const checkTokenValidity = (): boolean => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token')

    if (!token) {
        console.warn('No auth token found')
        return false
    }

    if (isTokenExpired(token)) {
        console.warn('Token has expired')
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        localStorage.removeItem('token')
        window.location.href = '/login'
        return false
    }

    return true
}

export default api
export { BACKEND_URL }

// API endpoints
export const authAPI = {
    login: (credentials: { email: string; password: string }) =>
        api.post('/auth/login', credentials),
    register: (userData: any) =>
        api.post('/auth/register', userData),
    logout: () =>
        api.post('/auth/logout'),
    getProfile: () =>
        api.get('/auth/profile')
}

export const organizationAPI = {
    getAll: (params?: any) =>
        api.get('/organizations', { params }),
    getById: (id: string) =>
        api.get(`/organizations/${id}`),
    create: (data: FormData) =>
        api.post('/organizations', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    update: (id: string, data: FormData) =>
        api.put(`/organizations/${id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    delete: (id: string) =>
        api.delete(`/organizations/${id}`)
}

export const reviewAPI = {
    getAll: (params?: any) =>
        api.get('/reviews', { params }),
    getByOrganization: (orgId: string) =>
        api.get(`/reviews/organization/${orgId}`),
    create: (data: any) =>
        api.post('/reviews', data),
    update: (id: string, data: any) =>
        api.put(`/reviews/${id}`, data),
    delete: (id: string) =>
        api.delete(`/reviews/${id}`)
}

export const roadshowAPI = {
    getAll: (params?: any) =>
        api.get('/roadshows', { params }),
    getById: (id: string) =>
        api.get(`/roadshows/${id}`),
    create: (data: FormData) =>
        api.post('/roadshows', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    update: (id: string, data: FormData) =>
        api.put(`/roadshows/${id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    delete: (id: string) =>
        api.delete(`/roadshows/${id}`)
}

export const mouAPI = {
    getAll: (params?: any) =>
        api.get('/mou', { params }),
    getById: (id: string) =>
        api.get(`/mou/${id}`),
    create: (data: FormData) =>
        api.post('/mou', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    update: (id: string, data: FormData) =>
        api.put(`/mou/${id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    delete: (id: string) =>
        api.delete(`/mou/${id}`)
}