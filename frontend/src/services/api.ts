import axios from 'axios'

// ============================================================================
// CONSTANTS - API Configuration
// ============================================================================
const CONST_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
const CONST_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'
const CONST_API_TIMEOUT_MS = 10000
const CONST_AUTH_HEADER_NAME = 'Authorization'
const CONST_AUTH_TOKEN_STORAGE_KEY = 'auth_token'
const CONST_AUTH_REFRESH_TOKEN_KEY = 'auth_refresh_token'
const CONST_AUTH_USER_STORAGE_KEY = 'auth_user'
const CONST_AUTH_ENDPOINT_REFRESH = '/api/auth/refresh'
const CONST_REFRESH_TIMEOUT_MS = 5000
const CONST_HTTP_UNAUTHORIZED = 401

// ============================================================================
// CONSTANTS - Token Management
// ============================================================================
let bln_Is_Token_Refreshing = false
let arr_Failed_Request_Queue: any[] = []

// ============================================================================
// Function: Process_Token_Refresh_Queue
// Purpose: Process queued requests after token refresh
// Input: obj_Error (error to reject with) or str_New_Token (new token)
// Output: None (resolves/rejects all queued promises)
// Side Effects: Clears arr_Failed_Request_Queue, resets bln_Is_Token_Refreshing
// ============================================================================
const Process_Token_Refresh_Queue = (obj_Error: any = null, str_New_Token: string | null = null): void => {
    try {
        arr_Failed_Request_Queue.forEach(obj_Promise => {
            // Reject if error occurred, resolve with new token otherwise
            if (obj_Error) {
                obj_Promise.reject(obj_Error)
            } else {
                obj_Promise.resolve(str_New_Token)
            }
        })

        bln_Is_Token_Refreshing = false
        arr_Failed_Request_Queue = []
    } catch (error) {
        console.error('Error processing token refresh queue:', error)
        bln_Is_Token_Refreshing = false
        arr_Failed_Request_Queue = []
    }
}

// ============================================================================
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
    } catch (error) {
        console.error('Error clearing auth data:', error)
    }
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
                console.debug('Token added to request:', str_Token.substring(0, 20) + '...')
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
            if (int_Status === CONST_HTTP_UNAUTHORIZED && !obj_Original_Request._retry) {
                console.debug('401 Unauthorized - attempting token refresh')

                // Early exit if no token (public endpoint access attempt)
                const str_Had_Token = Str_Get_Stored_Auth_Token()
                if (!str_Had_Token) {
                    console.debug('No token present - 401 is expected for public endpoints without auth')
                    // Don't attempt refresh if user never had a token
                    return Promise.reject(error)
                }

                // Step 2: If already refreshing, queue this request
                if (bln_Is_Token_Refreshing) {
                    return new Promise((resolve, reject) => {
                        arr_Failed_Request_Queue.push({ resolve, reject })
                    }).then(str_New_Token => {
                        obj_Original_Request.headers[CONST_AUTH_HEADER_NAME] = `Bearer ${str_New_Token}`
                        return obj_API_Client(obj_Original_Request)
                    }).catch(err => {
                        return Promise.reject(err)
                    })
                }

                // Step 3: Mark as retry and start refresh process
                obj_Original_Request._retry = true
                bln_Is_Token_Refreshing = true

                try {
                    // Step 4: Get refresh token from storage
                    const str_Refresh_Token = localStorage.getItem(CONST_AUTH_REFRESH_TOKEN_KEY)

                    if (!str_Refresh_Token) {
                        throw new Error('No refresh token available')
                    }

                    // Step 5: Make refresh token request
                    const obj_Response = await axios.post(
                        `${CONST_BACKEND_URL}${CONST_AUTH_ENDPOINT_REFRESH}`,
                        { refreshToken: str_Refresh_Token },
                        { timeout: CONST_REFRESH_TIMEOUT_MS }
                    )

                    const str_New_Token = obj_Response.data.token

                    // Step 6: Update token in storage and headers
                    localStorage.setItem(CONST_AUTH_TOKEN_STORAGE_KEY, str_New_Token)
                    obj_API_Client.defaults.headers.common[CONST_AUTH_HEADER_NAME] = `Bearer ${str_New_Token}`
                    obj_Original_Request.headers[CONST_AUTH_HEADER_NAME] = `Bearer ${str_New_Token}`

                    // Step 7: Process queued requests with new token
                    Process_Token_Refresh_Queue(null, str_New_Token)

                    // Step 8: Retry original request
                    return obj_API_Client(obj_Original_Request)
                } catch (err) {
                    // Check if user had token BEFORE clearing
                    const str_Had_Token_Before = Str_Get_Stored_Auth_Token()

                    // Token refresh failed - clear auth and redirect
                    Clear_All_Auth_Data()
                    Process_Token_Refresh_Queue(err, null)

                    // Only redirect if user had a token before (was logged in)
                    // No token = expected for public endpoints
                    const bln_Should_Redirect_On_Refresh_Fail = !str_Skip_Redirect && str_Had_Token_Before && typeof window !== 'undefined' && window.location.pathname !== '/login'

                    console.debug('Token refresh failed:', {
                        skipRedirect: str_Skip_Redirect,
                        hadTokenBefore: !!str_Had_Token_Before,
                        shouldRedirect: bln_Should_Redirect_On_Refresh_Fail,
                        error: (err as any).message
                    })

                    if (bln_Should_Redirect_On_Refresh_Fail) {
                        console.debug('User was logged in but token refresh failed - redirecting to login')
                        window.location.href = '/login'
                    } else {
                        console.debug('No token or skip requested - not redirecting on refresh fail')
                    }

                    return Promise.reject(err)
                }
            }

            // Step 9: Handle other 401 errors (already retried)
            if (int_Status === CONST_HTTP_UNAUTHORIZED) {
                // Check if user had token BEFORE clearing auth data
                const str_Had_Token = Str_Get_Stored_Auth_Token()

                Clear_All_Auth_Data()

                const str_Error_Message = error.response?.data?.message || 'Session expired. Please login again.'
                console.debug('Auth failed - skipRedirect:', str_Skip_Redirect, '- Message:', str_Error_Message)

                // Only redirect to login if user was already logged in (had a token)
                // If user has no token, a 401 is expected for public endpoints with optional auth
                const bln_Should_Redirect = !str_Skip_Redirect && str_Had_Token && typeof window !== 'undefined' && window.location.pathname !== '/login'

                if (bln_Should_Redirect) {
                    console.debug('User was logged in but auth failed - redirecting to login')
                    window.location.href = '/login'
                } else {
                    console.debug('No active token or skip requested - not redirecting to login')
                }
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
        const obj_Payload = JSON.parse(atob(arr_Token_Parts[1]))
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
 * Purpose: Authentication endpoints (login, register, logout, profile)
 */
export const obj_Auth_API = {
    login: (obj_Credentials: { email: string; password: string }) =>
        obj_API_Client.post('/auth/login', obj_Credentials),
    register: (obj_User_Data: any) =>
        obj_API_Client.post('/auth/register', obj_User_Data),
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
        const { _skipAuthRedirect, ...obj_Query_Params } = obj_Params || {}
        return obj_API_Client.get('/organizations', {
            params: obj_Query_Params,
            _skipAuthRedirect
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
        const { _skipAuthRedirect, ...obj_Query_Params } = obj_Params || {}
        return obj_API_Client.get('/mou', {
            params: obj_Query_Params,
            _skipAuthRedirect
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
export const isTokenExpired = Bln_Is_Token_Expired
export const checkTokenValidity = Bln_Check_Token_Validity
