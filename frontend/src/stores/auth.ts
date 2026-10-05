import { defineStore } from 'pinia'
import { signInWithPopup, signOut } from 'firebase/auth'
import { firebaseAuth, googleProvider } from '../config/firebase'

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
 * Interface for Login Response
 * Properties: success (boolean), message (optional string)
 */
interface obj_Login_Response {
    success: boolean
    message?: string
}

type Login_Type = 'admin' | 'student'

// ============================================================================
// CONSTANTS
// ============================================================================
const CONST_AUTH_STORE_NAME = 'auth'
const CONST_BACKEND_URL = 'http://localhost:5000'
const CONST_API_AUTH_GOOGLE_ENDPOINT = '/api/auth/google'
const CONST_AUTH_TOKEN_STORAGE_KEY = 'auth_token'
const CONST_AUTH_USER_STORAGE_KEY = 'auth_user'
const CONST_AUTH_REFRESH_TOKEN_STORAGE_KEY = 'auth_refresh_token'
const CONST_AUTH_TOKEN_LEGACY_KEY = 'token'
const CONST_ERROR_PARSE_USER_DATA = 'Failed to parse stored user data'

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
        async Login_With_Google(loginType: Login_Type): Promise<obj_Login_Response> {
            try {
                this.bln_Is_Loading = true
                const credential = await signInWithPopup(firebaseAuth, googleProvider)
                const idToken = await credential.user.getIdToken()
                const response = await fetch(`${CONST_BACKEND_URL}${CONST_API_AUTH_GOOGLE_ENDPOINT}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idToken, loginType })
                })
                const data = await response.json()

                if (!response.ok || !data.success) {
                    const error = new Error(data.message || 'Google login failed')
                        ; (error as Error & { code?: number }).code = data.errorCode
                    throw error
                }

                this.obj_Current_User = data.data
                this.str_Auth_Token = data.token
                localStorage.setItem(CONST_AUTH_TOKEN_STORAGE_KEY, data.token)
                localStorage.setItem(CONST_AUTH_USER_STORAGE_KEY, JSON.stringify(data.data))
                localStorage.setItem(CONST_AUTH_REFRESH_TOKEN_STORAGE_KEY, data.refreshToken)
                return { success: true, message: data.message }
            } catch (error) {
                await signOut(firebaseAuth).catch(() => undefined)
                return {
                    success: false,
                    message: error instanceof Error ? error.message : 'Google login failed'
                }
            } finally {
                this.bln_Is_Loading = false
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
                await signOut(firebaseAuth).catch(() => undefined)
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
