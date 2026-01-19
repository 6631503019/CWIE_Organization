import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
// Temporarily disable imports to avoid errors
// import { organizationAPI } from '../services/api'
// import websocketService from '../services/websocket'

interface Organization {
    id: string
    name: string
    description: string
    website: string
    location: string
    category: string
    contactEmail: string
    contactPhone: string
    logoUrl?: string
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export const useOrganizationStore = defineStore('organization', () => {
    // State
    const organizations = ref<Organization[]>([])
    const currentOrganization = ref<Organization | null>(null)
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    const pagination = ref({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 10
    })

    // Getters
    const activeOrganizations = computed(() =>
        organizations.value.filter(org => org.isActive)
    )

    const organizationsByCategory = computed(() => {
        const grouped: Record<string, Organization[]> = {}
        organizations.value.forEach(org => {
            if (!grouped[org.category]) {
                grouped[org.category] = []
            }
            grouped[org.category].push(org)
        })
        return grouped
    })

    // Actions
    const fetchOrganizations = async (params?: any) => {
        try {
            isLoading.value = true
            error.value = null

            // Mock API call - replace with real API when backend is ready
            await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
            const mockData = {
                data: {
                    organizations: [],
                    pagination: {
                        currentPage: 1,
                        totalPages: 1,
                        totalCount: 0,
                        limit: 10
                    }
                }
            }

            organizations.value = mockData.data.organizations
            pagination.value = mockData.data.pagination

            return { success: true }
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to fetch organizations'
            return { success: false, error: error.value }
        } finally {
            isLoading.value = false
        }
    }

    const fetchOrganizationById = async (id: string) => {
        try {
            isLoading.value = true
            error.value = null

            // Mock API call - replace with real API when backend is ready
            await new Promise(resolve => setTimeout(resolve, 500))
            const mockOrganization = null // Mock: Organization not found
            currentOrganization.value = mockOrganization

            return { success: true, data: mockOrganization }
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to fetch organization'
            return { success: false, error: error.value }
        } finally {
            isLoading.value = false
        }
    }

    const createOrganization = async (data: FormData) => {
        try {
            isLoading.value = true
            error.value = null

            // Mock API call - replace with real API when backend is ready
            await new Promise(resolve => setTimeout(resolve, 1000))
            const mockOrganization = {
                id: Date.now().toString(),
                name: 'Mock Organization',
                description: 'This is a mock organization',
                website: 'https://mock-org.com',
                location: 'Mock City',
                category: 'Technology',
                contactEmail: 'contact@mock-org.com',
                contactPhone: '+1234567890',
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }

            organizations.value.unshift(mockOrganization)
            return { success: true, data: mockOrganization }
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to create organization'
            return { success: false, error: error.value }
        } finally {
            isLoading.value = false
        }
    }

    const updateOrganization = async (id: string, data: FormData) => {
        try {
            isLoading.value = true
            error.value = null

            // Mock API call - replace with real API when backend is ready
            await new Promise(resolve => setTimeout(resolve, 1000))
            const index = organizations.value.findIndex(org => org.id === id)

            if (index !== -1) {
                const updatedOrganization = {
                    ...organizations.value[index],
                    name: 'Updated Mock Organization',
                    updatedAt: new Date().toISOString()
                }
                organizations.value[index] = updatedOrganization

                if (currentOrganization.value?.id === id) {
                    currentOrganization.value = updatedOrganization
                }

                return { success: true, data: updatedOrganization }
            }

            return { success: false, error: 'Organization not found' }
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to update organization'
            return { success: false, error: error.value }
        } finally {
            isLoading.value = false
        }
    }

    const deleteOrganization = async (id: string) => {
        try {
            isLoading.value = true
            error.value = null

            // Mock API call - replace with real API when backend is ready
            await new Promise(resolve => setTimeout(resolve, 500))
            organizations.value = organizations.value.filter(org => org.id !== id)

            if (currentOrganization.value?.id === id) {
                currentOrganization.value = null
            }

            return { success: true }
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to delete organization'
            return { success: false, error: error.value }
        } finally {
            isLoading.value = false
        }
    }

    const clearError = () => {
        error.value = null
    }

    const clearCurrent = () => {
        currentOrganization.value = null
    }

    // WebSocket event handlers (disabled for now)
    const setupWebSocketListeners = () => {
        console.log('WebSocket listeners setup (mock)')
        // Will implement when WebSocket is ready
        /*
        websocketService.onOrganizationCreate((data) => {
          organizations.value.unshift(data)
        })
    
        websocketService.onOrganizationUpdate((data) => {
          const index = organizations.value.findIndex(org => org.id === data.id)
          if (index !== -1) {
            organizations.value[index] = data
          }
          
          if (currentOrganization.value?.id === data.id) {
            currentOrganization.value = data
          }
        })
    
        websocketService.onOrganizationDelete((data) => {
          organizations.value = organizations.value.filter(org => org.id !== data.id)
          
          if (currentOrganization.value?.id === data.id) {
            currentOrganization.value = null
          }
        })
        */
    }

    return {
        // State
        organizations,
        currentOrganization,
        isLoading,
        error,
        pagination,

        // Getters
        activeOrganizations,
        organizationsByCategory,

        // Actions
        fetchOrganizations,
        fetchOrganizationById,
        createOrganization,
        updateOrganization,
        deleteOrganization,
        clearError,
        clearCurrent,
        setupWebSocketListeners
    }
})