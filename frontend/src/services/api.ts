import axios from 'axios'

// ============================================================================
// CONSTANTS - API Configuration
// ============================================================================
const CONST_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://cwie-organization-backend.onrender.com/api'
const CONST_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://cwie-organization-backend.onrender.com'
const CONST_API_TIMEOUT_MS = 10000
const CONST_AUTH_HEADER_NAME = 'Authorization'
const CONST_AUTH_TOKEN_STORAGE_KEY = 'auth_token'
const CONST_AUTH_REFRESH_TOKEN_KEY = 'auth_refresh_token'
const CONST_AUTH_USER_STORAGE_KEY = 'auth_user'
const CONST_AUTH_ENDPOINT_REFRESH = '/auth/refresh'
const CONST_REFRESH_TIMEOUT_MS = 5000
const CONST_HTTP_UNAUTHORIZED = 401

// ============================================================================
// CONSTANTS - Token Management
// ============================================================================
let obj_Refresh_Promise: Promise<string> | null = null
let bln_Session_Expiry_Handled = false

if (typeof window !== 'undefined') {
    window.addEventListener('auth:started', () => {
        bln_Session_Expiry_Handled = false
    })
}

// Function: Str_Get_Stored_Auth_Token
// Purpose: Retrieve stored authentication token from localStorage
// Input: None
// Output: string or null - the stored token
// Side Effects: None
// ============================================================================
const Str_Get_Stored_Auth_Token = (): string | null => {
    try {
        // Try primary token key first, fallback to legacy key
        const str_Token = localStorage.getItem(CONST_AUTH_TOKEN_STORAGE_KEY) ||
            localStorage.getItem('token')
        return str_Token
    } catch (error) {
        console.error('Error retrieving auth token:', error)
        return null
    }
}

// ============================================================================
// Function: Clear_All_Auth_Data
// Purpose: Clear all authentication data from localStorage
// Input: None
// Output: None (clears localStorage)
// Side Effects: Removes all auth-related items from localStorage
// ============================================================================
const Clear_All_Auth_Data = (): void => {
    try {
        localStorage.removeItem(CONST_AUTH_TOKEN_STORAGE_KEY)
        localStorage.removeItem(CONST_AUTH_USER_STORAGE_KEY)
        localStorage.removeItem(CONST_AUTH_REFRESH_TOKEN_KEY)
        localStorage.removeItem('token') // Legacy key
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth:expired'))
        }

    } catch (error) {
        console.error('Error clearing auth data:', error)
    }
}

const Redirect_To_Login_Once = (): void => {
    if (typeof window === 'undefined' || window.location.pathname === '/' || window.location.pathname === '/login') return
    if (!bln_Session_Expiry_Handled) {
        bln_Session_Expiry_Handled = true
        window.location.assign('/')
    }
}

const Is_Auth_Endpoint = (url: unknown): boolean => {
    const value = String(url || '')
    return value.includes('/auth/google') || value.includes('/auth/refresh')
}

const Refresh_Access_Token = (): Promise<string> => {
    if (obj_Refresh_Promise) return obj_Refresh_Promise

    const refreshToken = typeof localStorage !== 'undefined'
        ? localStorage.getItem(CONST_AUTH_REFRESH_TOKEN_KEY)
        : null
    if (!refreshToken) return Promise.reject(new Error('No refresh token available'))

    obj_Refresh_Promise = axios.post(
        `${CONST_API_BASE_URL}${CONST_AUTH_ENDPOINT_REFRESH}`,
        { refreshToken },
        { timeout: CONST_REFRESH_TIMEOUT_MS }
    ).then(response => {
        const token = response.data?.token
        if (!token || typeof token !== 'string') throw new Error('Refresh response did not contain a valid access token')
        localStorage.setItem(CONST_AUTH_TOKEN_STORAGE_KEY, token)
        obj_API_Client.defaults.headers.common[CONST_AUTH_HEADER_NAME] = `Bearer ${token}`
        bln_Session_Expiry_Handled = false
        return token
    }).finally(() => {
        obj_Refresh_Promise = null
    })

    return obj_Refresh_Promise
}

// ============================================================================
// Create Axios Instance with Configuration
// ============================================================================
const obj_API_Client = axios.create({
    baseURL: CONST_API_BASE_URL,
    timeout: CONST_API_TIMEOUT_MS,
    headers: {
        'Content-Type': 'application/json',
    }
})

// ============================================================================
// REQUEST INTERCEPTOR - Add authorization token to all requests
// ============================================================================
obj_API_Client.interceptors.request.use(
    (config) => {
        try {
            // Retrieve token and add to request headers
            const str_Token = Str_Get_Stored_Auth_Token()
            if (str_Token) {
                config.headers[CONST_AUTH_HEADER_NAME] = `Bearer ${str_Token}`
                console.debug('Authorization token added to request')
            }
            return config
        } catch (error) {
            console.debug('Request interceptor error:', error)
            return Promise.reject(error)
        }
    },
    (error) => {
        return Promise.reject(error)
    }
)

// ============================================================================
// RESPONSE INTERCEPTOR - Handle errors and auto-refresh tokens
// ============================================================================
obj_API_Client.interceptors.response.use(
    (response) => response,
    async (error) => {
        try {
            const obj_Original_Request = error.config
            if (!obj_Original_Request) {
                return Promise.reject(error)
            }
            const str_Skip_Redirect = obj_Original_Request?._skipAuthRedirect
            const int_Status = error.response?.status

            console.debug('🔴 API Response Error:', {
                status: int_Status,
                url: obj_Original_Request?.url,
                skipRedirect: str_Skip_Redirect,
                message: error.response?.data?.message,
                errorCode: error.response?.data?.errorCode,
                fullError: error.response?.data
            })

            // Step 1: Check if error is 401 Unauthorized
            if (int_Status === CONST_HTTP_UNAUTHORIZED && !obj_Original_Request._retry && !Is_Auth_Endpoint(obj_Original_Request.url)) {
                console.debug('401 Unauthorized - attempting token refresh')

                // Early exit if no token (public endpoint access attempt)
                const str_Had_Token = Str_Get_Stored_Auth_Token()
                if (!str_Had_Token) {
                    console.debug('No token present - 401 is expected for public endpoints without auth')
                    // Don't attempt refresh if user never had a token
                    return Promise.reject(error)
                }

                obj_Original_Request._retry = true
                try {
                    const str_New_Token = await Refresh_Access_Token()
                    obj_Original_Request.headers[CONST_AUTH_HEADER_NAME] = `Bearer ${str_New_Token}`
                    return obj_API_Client(obj_Original_Request)
                } catch (err) {
                    Clear_All_Auth_Data()
                    if (!str_Skip_Redirect) Redirect_To_Login_Once()
                    return Promise.reject(err)
                }
            }

            // Step 9: Handle other 401 errors (already retried)
            if (int_Status === CONST_HTTP_UNAUTHORIZED) {
                const str_Had_Token = Str_Get_Stored_Auth_Token()
                Clear_All_Auth_Data()

                const str_Error_Message = error.response?.data?.message || 'Session expired. Please login again.'
                console.debug('Auth failed - skipRedirect:', str_Skip_Redirect, '- Message:', str_Error_Message)

                // Only redirect to login if user was already logged in (had a token)
                // If user has no token, a 401 is expected for public endpoints with optional auth
                const bln_Should_Redirect = !str_Skip_Redirect && str_Had_Token && typeof window !== 'undefined' && window.location.pathname !== '/login'

                if (bln_Should_Redirect) Redirect_To_Login_Once()
            }

            return Promise.reject(error)
        } catch (error) {
            console.debug('Response interceptor error:', error)
            return Promise.reject(error)
        }
    }
)

// ============================================================================
// Function: Bln_Is_Token_Expired
// Purpose: Check if JWT token is expired
// Input: str_Token - JWT token string
// Output: boolean - true if expired, false if valid
// Side Effects: None
// ============================================================================
export const Bln_Is_Token_Expired = (str_Token: string): boolean => {
    try {
        // Validate input
        if (!str_Token || typeof str_Token !== 'string') {
            return true
        }

        // Split token and extract payload
        const arr_Token_Parts = str_Token.split('.')
        if (arr_Token_Parts.length !== 3) {
            return true
        }

        // Decode payload and check expiration
        const str_Base64_Payload_Unpadded = arr_Token_Parts[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/')
        const str_Base64_Payload = str_Base64_Payload_Unpadded.padEnd(
            Math.ceil(str_Base64_Payload_Unpadded.length / 4) * 4,
            '='
        )
        const binary = atob(str_Base64_Payload)
        const bytes = Uint8Array.from(binary, character => character.charCodeAt(0))
        const obj_Payload = JSON.parse(new TextDecoder().decode(bytes))
        if (typeof obj_Payload.exp !== 'number') {
            return true
        }
        const i_Expiration_Time = obj_Payload.exp * 1000 // Convert to milliseconds

        return Date.now() >= i_Expiration_Time
    } catch (error) {
        console.error('Error checking token expiration:', error)
        return true // Consider invalid token as expired
    }
}

// ============================================================================
// Function: Bln_Check_Token_Validity
// Purpose: Check if stored token is valid and not expired
// Input: None
// Output: boolean - true if valid and not expired, false otherwise
// Side Effects: None
// ============================================================================
export const Bln_Check_Token_Validity = (): boolean => {
    try {
        const str_Token = Str_Get_Stored_Auth_Token()

        // Validation: Check if token exists
        if (!str_Token) {
            console.warn('No auth token found')
            return false
        }

        // Validation: Check if token is expired
        if (Bln_Is_Token_Expired(str_Token)) {
            console.warn('Auth token is expired')
            return false
        }

        return true
    } catch (error) {
        console.error('Error checking token validity:', error)
        return false
    }
}

// Export configured API client
export default obj_API_Client

// ============================================================================
// API ENDPOINT DEFINITIONS - RESTful API endpoints with proper naming
// ============================================================================

/**
 * obj_Auth_API
 * Purpose: Authentication endpoints for the authenticated session
 */
export const obj_Auth_API = {
    logout: () =>
        obj_API_Client.post('/auth/logout'),
    getProfile: () =>
        obj_API_Client.get('/auth/profile')
}

/**
 * obj_Organization_API
 * Purpose: Organization management endpoints (CRUD operations)
 */
export const obj_Organization_API = {
    getAll: (obj_Params?: any) => {
        const { _skipAuthRedirect, _timeoutMs, ...obj_Query_Params } = obj_Params || {}
        return obj_API_Client.get('/organizations', {
            params: obj_Query_Params,
            _skipAuthRedirect,
            timeout: _timeoutMs
        } as any)
    },
    getById: (str_ID: string, obj_Config?: any) =>
        obj_API_Client.get(`/organizations/${str_ID}`, obj_Config),
    create: (obj_Form_Data: FormData) =>
        obj_API_Client.post('/organizations', obj_Form_Data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    update: (str_ID: string, obj_Form_Data: FormData) =>
        obj_API_Client.put(`/organizations/${str_ID}`, obj_Form_Data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    delete: (str_ID: string) =>
        obj_API_Client.delete(`/organizations/${str_ID}`)
}

/**
 * obj_Review_API
 * Purpose: Review management endpoints
 */
export const obj_Review_API = {
    getAll: (obj_Params?: any) => {
        const { _skipAuthRedirect, ...obj_Query_Params } = obj_Params || {}
        return obj_API_Client.get('/reviews', {
            params: obj_Query_Params,
            _skipAuthRedirect
        } as any)
    },
    getByOrganization: (str_Org_ID: string, obj_Config?: any) =>
        obj_API_Client.get(`/reviews/organization/${str_Org_ID}`, obj_Config),
    create: (obj_Data: any) =>
        obj_API_Client.post('/reviews', obj_Data),
    update: (str_ID: string, obj_Data: any) =>
        obj_API_Client.put(`/reviews/${str_ID}`, obj_Data),
    delete: (str_ID: string) =>
        obj_API_Client.delete(`/reviews/${str_ID}`)
}

/**
 * obj_Roadshow_API
 * Purpose: Roadshow management endpoints
 */
export const obj_Roadshow_API = {
    getAll: (obj_Params?: any) =>
        obj_API_Client.get('/roadshows', { params: obj_Params }),
    getById: (str_ID: string) =>
        obj_API_Client.get(`/roadshows/${str_ID}`),
    create: (obj_Form_Data: FormData) =>
        obj_API_Client.post('/roadshows', obj_Form_Data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    update: (str_ID: string, obj_Form_Data: FormData) =>
        obj_API_Client.put(`/roadshows/${str_ID}`, obj_Form_Data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    delete: (str_ID: string) =>
        obj_API_Client.delete(`/roadshows/${str_ID}`)
}

/**
 * obj_MOU_API
 * Purpose: MOU (Memorandum of Understanding) management endpoints
 */
export const obj_MOU_API = {
    getAll: (obj_Params?: any) => {
        const { _skipAuthRedirect, _timeoutMs, ...obj_Query_Params } = obj_Params || {}
        return obj_API_Client.get('/mou', {
            params: obj_Query_Params,
            _skipAuthRedirect,
            timeout: _timeoutMs
        } as any)
    },
    getById: (str_ID: string, obj_Config?: any) =>
        obj_API_Client.get(`/mou/${str_ID}`, obj_Config),
    create: (obj_Form_Data: FormData) =>
        obj_API_Client.post('/mou', obj_Form_Data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    update: (str_ID: string, obj_Form_Data: FormData) =>
        obj_API_Client.put(`/mou/${str_ID}`, obj_Form_Data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    delete: (str_ID: string) =>
        obj_API_Client.delete(`/mou/${str_ID}`)
}

// ============================================================================
// LEGACY EXPORTS (Deprecated - use new naming convention)
// ============================================================================
export const authAPI = obj_Auth_API
export const organizationAPI = obj_Organization_API
export const reviewAPI = obj_Review_API
export const roadshowAPI = obj_Roadshow_API
export const mouAPI = obj_MOU_API
export const BACKEND_URL = CONST_BACKEND_URL
export const getOrganizationLogoUrl = (organization: any): string => {
    if (!organization) return ''
    if (organization.logo_gridfs_id && organization._id) {
        return `${CONST_API_BASE_URL}/organizations/${encodeURIComponent(String(organization._id))}/logo`
    }
    return getUploadedFileUrl(organization.logo_path)
}
export const getUploadedFileUrl = (value: unknown): string => {
    if (!value) return ''
    const strValue = String(value).replace(/\\/g, '/').trim()
    if (/^https?:\/\//i.test(strValue)) return strValue
    if (strValue.startsWith('/uploads/')) return `${CONST_BACKEND_URL}${strValue}`
    const normalized = strValue.replace(/^\/+/, '')
    if (normalized.startsWith('uploads/')) return `${CONST_BACKEND_URL}/${normalized}`
    return `${CONST_BACKEND_URL}/uploads/${normalized}`
}

export const getMouFileUrl = (mouId: unknown, download = false): string => {
    if (!mouId) return ''
    const id = String(mouId)
    return `${CONST_API_BASE_URL}/mou/${encodeURIComponent(id)}/file${download ? '?download=1' : ''}`
}

export const fetchMouFileBlob = async (mouId: unknown): Promise<string> => {
    if (!mouId) return ''
    const response = await obj_API_Client.get(`/mou/${encodeURIComponent(String(mouId))}/file`, {
        responseType: 'blob'
    })
    return URL.createObjectURL(response.data)
}

export const fetchRoadshowPosterBlob = async (roadshowId: unknown): Promise<string> => {
    if (!roadshowId) return ''
    const response = await obj_API_Client.get(
        `/roadshows/${encodeURIComponent(String(roadshowId))}/image/poster`,
        { responseType: 'blob' }
    )
    if (!(response.data instanceof Blob) || (
        response.data.type &&
        response.data.type !== 'application/octet-stream' &&
        !response.data.type.startsWith('image/')
    )) {
        throw new Error('Roadshow poster is not an image')
    }
    return URL.createObjectURL(response.data)
}

export const fetchRoadshowActivityBlob = async (roadshowId: unknown, index: number): Promise<string> => {
    if (!roadshowId) return ''
    const response = await obj_API_Client.get(
        `/roadshows/${encodeURIComponent(String(roadshowId))}/image/activity/${index}`,
        { responseType: 'blob' }
    )
    if (!(response.data instanceof Blob) || (
        response.data.type &&
        response.data.type !== 'application/octet-stream' &&
        !response.data.type.startsWith('image/')
    )) {
        throw new Error('Roadshow activity image is not an image')
    }
    return URL.createObjectURL(response.data)
}
export const isTokenExpired = Bln_Is_Token_Expired
export const checkTokenValidity = Bln_Check_Token_Validity
