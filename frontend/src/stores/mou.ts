import { defineStore } from 'pinia'
import { ref } from 'vue'
// Temporarily disable imports to avoid errors
// import { mouAPI } from '../services/api'
// import websocketService from '../services/websocket'

interface MOU {
    id: string
    title: string
    description: string
    partnerOrganization: string
    signingDate: string
    expiryDate: string
    status: 'active' | 'expired' | 'pending'
    documentUrl?: string
    createdAt: string
    updatedAt: string
}

export const useMouStore = defineStore('mou', () => {
    // State
    const mous = ref<MOU[]>([])
    const currentMou = ref<MOU | null>(null)
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    const pagination = ref({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 10
    })

    // Actions
    const fetchMous = async (params?: any) => {
        try {
            isLoading.value = true
            error.value = null

            // Mock API call - replace with real API when backend is ready
            await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
            const mockData = {
                data: {
                    mous: [],
                    pagination: {
                        currentPage: 1,
                        totalPages: 1,
                        totalCount: 0,
                        limit: 10
                    }
                }
            }

            mous.value = mockData.data.mous
            pagination.value = mockData.data.pagination

            return { success: true }
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to fetch MOUs'
            return { success: false, error: error.value }
        } finally {
            isLoading.value = false
        }
    }

    const fetchMouById = async (id: string) => {
        try {
            isLoading.value = true
            error.value = null

            // Mock API call - replace with real API when backend is ready
            await new Promise(resolve => setTimeout(resolve, 500))
            const mockMou = null // Mock: MOU not found
            currentMou.value = mockMou

            return { success: true, data: mockMou }
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to fetch MOU'
            return { success: false, error: error.value }
        } finally {
            isLoading.value = false
        }
    }

    const createMou = async (data: FormData) => {
        try {
            isLoading.value = true
            error.value = null

            // Mock API call - replace with real API when backend is ready
            await new Promise(resolve => setTimeout(resolve, 1000))
            const mockMou = {
                id: Date.now().toString(),
                title: 'Mock MOU',
                description: 'This is a mock MOU',
                partnerOrganization: 'Mock Organization',
                signingDate: new Date().toISOString(),
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'pending' as const,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }

            mous.value.unshift(mockMou)
            return { success: true, data: mockMou }
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to create MOU'
            return { success: false, error: error.value }
        } finally {
            isLoading.value = false
        }
    }

    const updateMou = async (id: string, data: FormData) => {
        try {
            isLoading.value = true
            error.value = null

            // Mock API call - replace with real API when backend is ready
            await new Promise(resolve => setTimeout(resolve, 1000))
            const index = mous.value.findIndex(mou => mou.id === id)

            if (index !== -1) {
                const updatedMou = {
                    ...mous.value[index],
                    title: 'Updated Mock MOU',
                    updatedAt: new Date().toISOString()
                }
                mous.value[index] = updatedMou

                if (currentMou.value?.id === id) {
                    currentMou.value = updatedMou
                }

                return { success: true, data: updatedMou }
            }

            return { success: false, error: 'MOU not found' }
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to update MOU'
            return { success: false, error: error.value }
        } finally {
            isLoading.value = false
        }
    }

    const deleteMou = async (id: string) => {
        try {
            isLoading.value = true
            error.value = null

            // Mock API call - replace with real API when backend is ready
            await new Promise(resolve => setTimeout(resolve, 500))
            mous.value = mous.value.filter(mou => mou.id !== id)

            if (currentMou.value?.id === id) {
                currentMou.value = null
            }

            return { success: true }
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to delete MOU'
            return { success: false, error: error.value }
        } finally {
            isLoading.value = false
        }
    }

    const clearError = () => {
        error.value = null
    }

    const clearCurrent = () => {
        currentMou.value = null
    }

    // WebSocket event handlers (disabled for now)
    const setupWebSocketListeners = () => {
        console.log('MOU WebSocket listeners setup (mock)')
        // Will implement when WebSocket is ready
    }

    return {
        // State
        mous,
        currentMou,
        isLoading,
        error,
        pagination,

        // Actions
        fetchMous,
        fetchMouById,
        createMou,
        updateMou,
        deleteMou,
        clearError,
        clearCurrent,
        setupWebSocketListeners
    }
})