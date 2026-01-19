import axios from 'axios'

// Use environment variables with fallback
const API_BASE_URL = 'http://localhost:3001/api'

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
        const token = localStorage.getItem('token')
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
            localStorage.removeItem('token')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default api

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