import { defineStore } from 'pinia'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================
/**
 * Interface for User object
 * Properties: id, name, email, role (admin | user | test)
 */
interface obj_User {
    id: string
    name: string
    email: string
    role: 'admin' | 'user' | 'test'
}

/**
 * Interface for Login Credentials
 * Properties: email, password
 */
interface obj_Login_Credentials {
    email: string
    password: string
}

/**
 * Interface for Login Response
 * Properties: success (boolean), message (optional string)
 */
interface obj_Login_Response {
    success: boolean
    message?: string
}

// ============================================================================
// CONSTANTS
// ============================================================================
const CONST_AUTH_STORE_NAME = 'auth'
const CONST_BACKEND_URL = 'http://localhost:5000'
const CONST_API_AUTH_LOGIN_ENDPOINT = '/api/auth/login'
const CONST_AUTH_TOKEN_STORAGE_KEY = 'auth_token'
const CONST_AUTH_USER_STORAGE_KEY = 'auth_user'
const CONST_AUTH_REFRESH_TOKEN_STORAGE_KEY = 'auth_refresh_token'
const CONST_AUTH_TOKEN_LEGACY_KEY = 'token'
const CONST_MOCK_LOGIN_DELAY_MS = 1000
const CONST_ERROR_BACKEND_LOGIN_FAILED = 'Backend login failed'
const CONST_ERROR_INVALID_CREDENTIALS = 'Invalid email or password'
const CONST_ERROR_PARSE_USER_DATA = 'Failed to parse stored user data'

// ============================================================================
// MOCK USER DATABASE
// ============================================================================
const obj_Mock_Users_Database = {
    'admin': {
        id: '1',
        name: 'Admin User',
        email: 'admin',
        password: 'admin123',
        role: 'admin' as const
    },
    'user': {
        id: '2',
        name: 'Regular User',
        email: 'user@mfu.ac.th',
        password: 'user123',
        role: 'user' as const
    },
    'test': {
        id: '3',
        name: 'Test User',
        email: 'test',
        password: 'test123',
        role: 'test' as const
    }
}

// ============================================================================
// PINIA STORE DEFINITION
// ============================================================================
/**
 * useAuthStore
 * Purpose: Central store for authentication state management
 * Manages: user data, authentication tokens, login/logout flows
 */
export const useAuthStore = defineStore(CONST_AUTH_STORE_NAME, {
    // ========================================================================
    // STATE DEFINITION
    // ========================================================================
    state: () => ({
        obj_Current_User: null as obj_User | null,        // Currently logged-in user object
        str_Auth_Token: null as string | null,             // JWT authentication token
        bln_Is_Loading: false,                             // Loading state for async operations
    }),

    // ========================================================================
    // GETTERS (Computed Properties)
    // ========================================================================
    getters: {
        /**
         * Getter: bln_Is_Logged_In
         * Purpose: Check if user is authenticated
         * Return: true if both user and token exist, false otherwise
         */
        bln_Is_Logged_In: (state) => !!state.obj_Current_User && !!state.str_Auth_Token,

        /**
         * Getter: bln_Is_Admin
         * Purpose: Check if current user has admin role
         * Return: true if user is admin, false otherwise
         */
        bln_Is_Admin: (state) => state.obj_Current_User?.role === 'admin',

        /**
         * Getter: bln_Is_User
         * Purpose: Check if current user has user role
         * Return: true if user is regular user, false otherwise
         */
        bln_Is_User: (state) => state.obj_Current_User?.role === 'user',

        // ======================================================================
        // LEGACY GETTERS (Backward Compatibility)
        // ======================================================================
        // These are kept for backward compatibility with existing code
        // that hasn't been updated to use the new naming convention

        /**
         * Getter: isLoggedIn (LEGACY)
         * Purpose: Alias for bln_Is_Logged_In
         * @deprecated Use bln_Is_Logged_In instead
         */
        isLoggedIn: (state) => !!state.obj_Current_User && !!state.str_Auth_Token,

        /**
         * Getter: isAdmin (LEGACY)
         * Purpose: Alias for bln_Is_Admin
         * @deprecated Use bln_Is_Admin instead
         */
        isAdmin: (state) => state.obj_Current_User?.role === 'admin',

        /**
         * Getter: isUser (LEGACY)
         * Purpose: Alias for bln_Is_User
         * @deprecated Use bln_Is_User instead
         */
        isUser: (state) => state.obj_Current_User?.role === 'user',

        /**
         * Getter: user (LEGACY)
         * Purpose: Alias for obj_Current_User
         * @deprecated Use obj_Current_User instead
         */
        user: (state) => state.obj_Current_User,

        /**
         * Getter: token (LEGACY)
         * Purpose: Alias for str_Auth_Token
         * @deprecated Use str_Auth_Token instead
         */
        token: (state) => state.str_Auth_Token,

        /**
         * Getter: isLoading (LEGACY)
         * Purpose: Alias for bln_Is_Loading
         * @deprecated Use bln_Is_Loading instead
         */
        isLoading: (state) => state.bln_Is_Loading
    },

    // ========================================================================
    // ACTIONS (Methods that modify state)
    // ========================================================================
    actions: {
        /**
         * Action: Login
         * Purpose: Authenticate user with backend, fallback to mock if backend unavailable
         * Input: obj_Credentials - object with email and password
         * Output: Promise<obj_Login_Response> - login result
         * Side Effects: Updates state, stores tokens in localStorage
         */
        async Login(obj_Credentials: obj_Login_Credentials): Promise<obj_Login_Response> {
            try {
                // Input validation
                if (!obj_Credentials || !obj_Credentials.email || !obj_Credentials.password) {
                    throw new Error('Email and password are required')
                }

                this.bln_Is_Loading = true

                // Step 1: Try backend login first
                try {
                    const obj_Backend_Response = await this.Login_With_Backend(obj_Credentials)
                    if (obj_Backend_Response.success) {
                        return obj_Backend_Response
                    }
                } catch (error) {
                    console.warn('Backend login failed:', error instanceof Error ? error.message : String(error))
                    console.info('Switching to mock authentication...')
                }

                // Step 2: If backend fails, fallback to mock authentication
                return await this.Login_With_Mock(obj_Credentials)

            } catch (error) {
                console.error('Login error:', error)
                return {
                    success: false,
                    message: error instanceof Error ? error.message : CONST_ERROR_BACKEND_LOGIN_FAILED
                }
            } finally {
                this.bln_Is_Loading = false
            }
        },

        /**
         * Action: Login_With_Backend
         * Purpose: Attempt authentication against backend API
         * Input: obj_Credentials - object with email and password
         * Output: Promise<obj_Login_Response> - login result from backend
         * Side Effects: Updates state and localStorage if successful
         */
        async Login_With_Backend(obj_Credentials: obj_Login_Credentials): Promise<obj_Login_Response> {
            try {
                // Step 1: Validate input
                if (!obj_Credentials || !obj_Credentials.email || !obj_Credentials.password) {
                    throw new Error('Invalid credentials provided')
                }

                // Step 2: Construct API URL
                const str_Login_URL = `${CONST_BACKEND_URL}${CONST_API_AUTH_LOGIN_ENDPOINT}`

                // Step 3: Send login request to backend
                const response = await fetch(str_Login_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(obj_Credentials)
                })

                // Step 4: Validate response status
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
                }

                // Step 5: Validate content type
                const str_Content_Type = response.headers.get('content-type')
                if (!str_Content_Type || !str_Content_Type.includes('application/json')) {
                    throw new Error('Invalid content type: expected JSON')
                }

                // Step 6: Parse response
                const obj_Data = await response.json()

                // Step 7: Handle successful response
                if (obj_Data.success) {
                    this.obj_Current_User = obj_Data.data
                    this.str_Auth_Token = obj_Data.token

                    // Step 8: Store tokens in localStorage
                    localStorage.setItem(CONST_AUTH_TOKEN_STORAGE_KEY, this.str_Auth_Token!)
                    localStorage.setItem(CONST_AUTH_USER_STORAGE_KEY, JSON.stringify(this.obj_Current_User))

                    // Step 9: Store refresh token if provided
                    if (obj_Data.refreshToken) {
                        localStorage.setItem(CONST_AUTH_REFRESH_TOKEN_STORAGE_KEY, obj_Data.refreshToken)
                    }

                    return { success: true, message: 'Login successful' }
                } else {
                    throw new Error(obj_Data.message || CONST_ERROR_BACKEND_LOGIN_FAILED)
                }

            } catch (error) {
                // Re-throw error to be caught by parent handler
                throw error
            }
        },

        /**
         * Action: Login_With_Mock
         * Purpose: Authenticate using mock user database (for development)
         * Input: obj_Credentials - object with email and password
         * Output: Promise<obj_Login_Response> - login result
         * Side Effects: Updates state and localStorage
         */
        async Login_With_Mock(obj_Credentials: obj_Login_Credentials): Promise<obj_Login_Response> {
            try {
                // Input validation
                if (!obj_Credentials || !obj_Credentials.email || !obj_Credentials.password) {
                    return {
                        success: false,
                        message: CONST_ERROR_INVALID_CREDENTIALS
                    }
                }

                // Step 1: Simulate network delay
                await new Promise(resolve => setTimeout(resolve, CONST_MOCK_LOGIN_DELAY_MS))

                // Step 2: Find user in mock database
                const obj_Found_User = Object.values(obj_Mock_Users_Database).find(obj_User =>
                    obj_User.email === obj_Credentials.email && obj_User.password === obj_Credentials.password
                )

                // Step 3: Return failure if user not found
                if (!obj_Found_User) {
                    return {
                        success: false,
                        message: CONST_ERROR_INVALID_CREDENTIALS
                    }
                }

                // Step 4: Update state with user data
                this.obj_Current_User = {
                    id: obj_Found_User.id,
                    name: obj_Found_User.name,
                    email: obj_Found_User.email,
                    role: obj_Found_User.role
                }

                // Step 5: Generate mock token
                this.str_Auth_Token = 'mock_token_' + obj_Found_User.id

                // Step 6: Store in localStorage
                localStorage.setItem(CONST_AUTH_TOKEN_STORAGE_KEY, this.str_Auth_Token)
                localStorage.setItem(CONST_AUTH_USER_STORAGE_KEY, JSON.stringify(this.obj_Current_User))

                return { success: true, message: 'Login successful (mock)' }

            } catch (error) {
                console.error('Mock login error:', error)
                return {
                    success: false,
                    message: error instanceof Error ? error.message : CONST_ERROR_BACKEND_LOGIN_FAILED
                }
            }
        },

        /**
         * Action: Logout
         * Purpose: Clear authentication state and remove tokens
         * Input: None
         * Output: None (updates state and localStorage)
         * Side Effects: Clears all auth data from memory and storage
         */
        async Logout(): Promise<void> {
            try {
                // Step 1: Clear state
                this.obj_Current_User = null
                this.str_Auth_Token = null

                // Step 2: Clear all localStorage auth items
                localStorage.removeItem(CONST_AUTH_TOKEN_STORAGE_KEY)
                localStorage.removeItem(CONST_AUTH_USER_STORAGE_KEY)
                localStorage.removeItem(CONST_AUTH_REFRESH_TOKEN_STORAGE_KEY)
                localStorage.removeItem(CONST_AUTH_TOKEN_LEGACY_KEY)
            } catch (error) {
                console.error('Logout error:', error)
            }
        },

        /**
         * Action: Initialize_Auth
         * Purpose: Restore authentication from localStorage on app startup
         * Input: None
         * Output: None (updates state if valid data found)
         * Side Effects: Restores state from localStorage or clears invalid data
         */
        Initialize_Auth(): void {
            try {
                // Step 1: Retrieve token and user from localStorage
                const str_Stored_Token = localStorage.getItem(CONST_AUTH_TOKEN_STORAGE_KEY)
                const str_Stored_User = localStorage.getItem(CONST_AUTH_USER_STORAGE_KEY)

                // Step 2: Validate that both token and user exist
                if (str_Stored_Token && str_Stored_User && str_Stored_User !== 'undefined') {
                    try {
                        // Step 3: Parse user data
                        this.str_Auth_Token = str_Stored_Token
                        this.obj_Current_User = JSON.parse(str_Stored_User)
                    } catch (error) {
                        // Step 4: Handle parse error by clearing invalid data
                        console.error(CONST_ERROR_PARSE_USER_DATA, error)
                        this.Clear_All_Auth_Data()
                    }
                }
            } catch (error) {
                console.error('Initialize auth error:', error)
            }
        },

        /**
         * Action: Clear_All_Auth_Data
         * Purpose: Helper method to clear all authentication data
         * Input: None
         * Output: None (updates state and localStorage)
         * Side Effects: Clears everything auth-related
         */
        Clear_All_Auth_Data(): void {
            try {
                this.obj_Current_User = null
                this.str_Auth_Token = null
                localStorage.removeItem(CONST_AUTH_TOKEN_STORAGE_KEY)
                localStorage.removeItem(CONST_AUTH_USER_STORAGE_KEY)
                localStorage.removeItem(CONST_AUTH_REFRESH_TOKEN_STORAGE_KEY)
                localStorage.removeItem(CONST_AUTH_TOKEN_LEGACY_KEY)
            } catch (error) {
                console.error('Error clearing auth data:', error)
            }
        },

        // ======================================================================
        // LEGACY ACTIONS (Backward Compatibility)
        // ======================================================================
        // These are kept for backward compatibility with existing code
        // that hasn't been updated to use the new naming convention

        /**
         * Action: login (LEGACY)
         * Purpose: Alias for Login action
         * @deprecated Use Login instead
         */
        login(obj_Credentials: { username: string; password: string }): Promise<boolean> {
            return this.Login(obj_Credentials)
        },

        /**
         * Action: logout (LEGACY)
         * Purpose: Alias for Logout action
         * @deprecated Use Logout instead
         */
        async logout(): Promise<void> {
            await this.Logout()
        },

        /**
         * Action: initAuth (LEGACY)
         * Purpose: Alias for Initialize_Auth action
         * @deprecated Use Initialize_Auth instead
         */
        initAuth(): void {
            this.Initialize_Auth()
        }
    }
})
