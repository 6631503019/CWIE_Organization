import { defineStore } from 'pinia'
import { ref } from 'vue'
// Temporarily disable imports to avoid errors
// import { roadshowAPI } from '../services/api'
// import websocketService from '../services/websocket'

interface Roadshow {
    id: string
    title: string
    description: string
    date: string
    location: string
    organizer: string
    capacity: number
    registeredCount: number
    posterUrl?: string
    activityImages?: string[]
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export const useRoadshowStore = defineStore('roadshow', () => {
    // State
    const roadshows = ref<Roadshow[]>([])
    const currentRoadshow = ref<Roadshow | null>(null)
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    const pagination = ref({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 10
    })

    // Actions
    const fetchRoadshows = async (params?: any) => {
        try {
            isLoading.value = true
            error.value = null

            // Mock API delay
            await new Promise(resolve => setTimeout(resolve, 500))

            // Mock roadshow data
            const mockRoadshows: Roadshow[] = [
                {
                    id: '1',
                    title: 'Tech Innovation Roadshow 2026',
                    description: 'Showcasing the latest technological innovations and startups',
                    date: '2026-03-15T10:00:00Z',
                    location: 'Kuala Lumpur Convention Centre',
                    organizer: 'TechHub Malaysia',
                    capacity: 500,
                    registeredCount: 324,
                    posterUrl: '/uploads/posters/roadshow1.jpg',
                    activityImages: ['/uploads/activities/roadshow1-1.jpg', '/uploads/activities/roadshow1-2.jpg'],
                    isActive: true,
                    createdAt: '2026-01-10T08:00:00Z',
                    updatedAt: '2026-01-15T14:30:00Z'
                },
                {
                    id: '2',
                    title: 'Digital Transformation Summit',
                    description: 'Learn about digital transformation strategies for businesses',
                    date: '2026-04-20T09:00:00Z',
                    location: 'Penang International Convention Centre',
                    organizer: 'Digital Malaysia',
                    capacity: 300,
                    registeredCount: 156,
                    posterUrl: '/uploads/posters/roadshow2.jpg',
                    activityImages: ['/uploads/activities/roadshow2-1.jpg'],
                    isActive: true,
                    createdAt: '2026-01-12T10:00:00Z',
                    updatedAt: '2026-01-16T16:45:00Z'
                },
                {
                    id: '3',
                    title: 'Startup Pitch Competition',
                    description: 'Young entrepreneurs showcase their innovative ideas',
                    date: '2026-05-10T14:00:00Z',
                    location: 'Johor Bahru City Square',
                    organizer: 'Startup Johor',
                    capacity: 200,
                    registeredCount: 89,
                    posterUrl: '/uploads/posters/roadshow3.jpg',
                    isActive: true,
                    createdAt: '2026-01-14T12:00:00Z',
                    updatedAt: '2026-01-17T11:20:00Z'
                }
            ]

            roadshows.value = mockRoadshows
            pagination.value = {
                currentPage: params?.page || 1,
                totalPages: Math.ceil(mockRoadshows.length / (params?.limit || 10)),
                totalCount: mockRoadshows.length,
                limit: params?.limit || 10
            }

            return { success: true }
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to fetch roadshows'
            return { success: false, error: error.value }
        } finally {
            isLoading.value = false
        }
    }

    const fetchRoadshowById = async (id: string) => {
        try {
            isLoading.value = true
            error.value = null

            // Mock API delay
            await new Promise(resolve => setTimeout(resolve, 300))

            // Mock roadshow data based on ID
            const mockRoadshow: Roadshow = {
                id: id,
                title: `Roadshow ${id}`,
                description: `This is a detailed description for roadshow ${id}. It includes comprehensive information about the event, speakers, and activities planned.`,
                date: '2026-03-15T10:00:00Z',
                location: 'Convention Centre',
                organizer: 'Event Organizer',
                capacity: 500,
                registeredCount: 234,
                posterUrl: `/uploads/posters/roadshow${id}.jpg`,
                activityImages: [`/uploads/activities/roadshow${id}-1.jpg`, `/uploads/activities/roadshow${id}-2.jpg`],
                isActive: true,
                createdAt: '2026-01-10T08:00:00Z',
                updatedAt: '2026-01-15T14:30:00Z'
            }

            currentRoadshow.value = mockRoadshow

            return { success: true, data: mockRoadshow }
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to fetch roadshow'
            return { success: false, error: error.value }
        } finally {
            isLoading.value = false
        }
    }

    const createRoadshow = async (data: FormData) => {
        try {
            isLoading.value = true
            error.value = null

            // Mock API delay
            await new Promise(resolve => setTimeout(resolve, 800))

            // Create mock roadshow from form data
            const mockRoadshow: Roadshow = {
                id: `roadshow_${Date.now()}`,
                title: data.get('title') as string || 'New Roadshow',
                description: data.get('description') as string || 'New roadshow description',
                date: data.get('date') as string || new Date().toISOString(),
                location: data.get('location') as string || 'Event Location',
                organizer: data.get('organizer') as string || 'Event Organizer',
                capacity: parseInt(data.get('capacity') as string) || 100,
                registeredCount: 0,
                posterUrl: data.get('poster') ? '/uploads/posters/new-roadshow.jpg' : undefined,
                activityImages: [],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }

            roadshows.value.unshift(mockRoadshow)

            return { success: true, data: mockRoadshow }
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to create roadshow'
            return { success: false, error: error.value }
        } finally {
            isLoading.value = false
        }
    }

    const updateRoadshow = async (id: string, data: FormData) => {
        try {
            isLoading.value = true
            error.value = null

            // Mock API delay
            await new Promise(resolve => setTimeout(resolve, 600))

            // Find existing roadshow and update it
            const existingIndex = roadshows.value.findIndex(roadshow => roadshow.id === id)
            const existing = existingIndex !== -1 ? roadshows.value[existingIndex] : currentRoadshow.value

            if (!existing) {
                throw new Error('Roadshow not found')
            }

            // Create updated roadshow with form data
            const updatedRoadshow: Roadshow = {
                ...existing,
                title: data.get('title') as string || existing.title,
                description: data.get('description') as string || existing.description,
                date: data.get('date') as string || existing.date,
                location: data.get('location') as string || existing.location,
                organizer: data.get('organizer') as string || existing.organizer,
                capacity: parseInt(data.get('capacity') as string) || existing.capacity,
                posterUrl: data.get('poster') ? `/uploads/posters/updated-${id}.jpg` : existing.posterUrl,
                updatedAt: new Date().toISOString()
            }

            // Update in roadshows array
            if (existingIndex !== -1) {
                roadshows.value[existingIndex] = updatedRoadshow
            }

            // Update current roadshow if it matches
            if (currentRoadshow.value?.id === id) {
                currentRoadshow.value = updatedRoadshow
            }

            return { success: true, data: updatedRoadshow }
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to update roadshow'
            return { success: false, error: error.value }
        } finally {
            isLoading.value = false
        }
    }

    const deleteRoadshow = async (id: string) => {
        try {
            isLoading.value = true
            error.value = null

            // Mock API delay
            await new Promise(resolve => setTimeout(resolve, 400))

            // Check if roadshow exists
            const existingIndex = roadshows.value.findIndex(roadshow => roadshow.id === id)
            if (existingIndex === -1 && currentRoadshow.value?.id !== id) {
                throw new Error('Roadshow not found')
            }

            // Remove from roadshows array
            roadshows.value = roadshows.value.filter(roadshow => roadshow.id !== id)

            // Clear current roadshow if it matches
            if (currentRoadshow.value?.id === id) {
                currentRoadshow.value = null
            }

            return { success: true }
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to delete roadshow'
            return { success: false, error: error.value }
        } finally {
            isLoading.value = false
        }
    }

    const clearError = () => {
        error.value = null
    }

    const clearCurrent = () => {
        currentRoadshow.value = null
    }

    // WebSocket event handlers (disabled for now)
    const setupWebSocketListeners = () => {
        console.log('Roadshow WebSocket listeners setup (mock)')
        // Will implement when WebSocket is ready
    }

    return {
        // State
        roadshows,
        currentRoadshow,
        isLoading,
        error,
        pagination,

        // Actions
        fetchRoadshows,
        fetchRoadshowById,
        createRoadshow,
        updateRoadshow,
        deleteRoadshow,
        clearError,
        clearCurrent,
        setupWebSocketListeners
    }
})