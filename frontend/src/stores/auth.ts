import { defineStore } from 'pinia'

interface User {
    id: string
    name: string
    email: string
    role: 'admin' | 'user' | 'test'
}

interface LoginCredentials {
    email: string
    password: string
}

interface LoginResponse {
    success: boolean
    message?: string
}

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null as User | null,
        token: null as string | null,
        isLoading: false,
    }),

    getters: {
        isLoggedIn: (state) => !!state.user && !!state.token,
        isAdmin: (state) => state.user?.role === 'admin'
    },

    actions: {
        async login(credentials: LoginCredentials): Promise<LoginResponse> {
            this.isLoading = true

            try {
                // Try backend login first
                const backendResponse = await this.loginWithBackend(credentials)
                if (backendResponse.success) {
                    return backendResponse
                }

                // If backend fails, fallback to mock authentication
                return await this.loginWithMock(credentials)

            } catch (error) {
                console.warn('Backend login failed, using mock authentication. Error:', error instanceof Error ? error.message : String(error))
                console.info('Make sure backend server is running on http://localhost:5000')
                // Fallback to mock authentication
                return await this.loginWithMock(credentials)
            } finally {
                this.isLoading = false
            }
        },

        async loginWithBackend(credentials: LoginCredentials): Promise<LoginResponse> {
            // Backend API URL - adjust port if needed
            const backendUrl = 'http://localhost:5000'

            try {
                const response = await fetch(`${backendUrl}/api/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(credentials)
                })

                // Check if response is ok and has content
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
                }

                // Check if response has content before parsing JSON
                const contentType = response.headers.get('content-type')
                if (!contentType || !contentType.includes('application/json')) {
                    throw new Error('Invalid content type: expected JSON')
                }

                const data = await response.json()

                if (data.success) {
                    this.user = data.data.user
                    this.token = data.data.token

                    // Store in localStorage for persistence
                    localStorage.setItem('auth_token', this.token!)
                    localStorage.setItem('auth_user', JSON.stringify(this.user))

                    return { success: true, message: 'Login successful' }
                } else {
                    throw new Error(data.message || 'Backend login failed')
                }

            } catch (error) {
                // Re-throw the error so it can be caught in the main login function
                throw error
            }
        },

        async loginWithMock(credentials: LoginCredentials): Promise<LoginResponse> {
            // Mock user database
            const mockUsers = {
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
                    email: 'user',
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

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1000))

            const foundUser = Object.values(mockUsers).find(user =>
                user.email === credentials.email && user.password === credentials.password
            )

            if (foundUser) {
                this.user = {
                    id: foundUser.id,
                    name: foundUser.name,
                    email: foundUser.email,
                    role: foundUser.role
                }
                this.token = 'mock_token_' + foundUser.id

                // Store in localStorage for persistence
                localStorage.setItem('auth_token', this.token)
                localStorage.setItem('auth_user', JSON.stringify(this.user))

                return { success: true, message: 'Login successful' }
            } else {
                return {
                    success: false,
                    message: 'Invalid email or password'
                }
            }
        },

        async logout() {
            this.user = null
            this.token = null

            // Clear localStorage
            localStorage.removeItem('auth_token')
            localStorage.removeItem('auth_user')
        },

        // Initialize auth from localStorage
        initAuth() {
            const token = localStorage.getItem('auth_token')
            const userStr = localStorage.getItem('auth_user')

            if (token && userStr) {
                try {
                    this.token = token
                    this.user = JSON.parse(userStr)
                } catch (error) {
                    console.error('Failed to parse stored user data:', error)
                    this.logout()
                }
            }
        }
    }
})