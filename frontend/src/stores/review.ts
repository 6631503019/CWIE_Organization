import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
// Temporarily disable imports to avoid errors
// import { reviewAPI } from '../services/api'
// import websocketService from '../services/websocket'

interface Review {
    id: string
    organizationId: string
    rating: number
    comment: string
    reviewerName: string
    reviewerEmail: string
    isApproved: boolean
    createdAt: string
    updatedAt: string
}

export const useReviewStore = defineStore('review', () => {
    // State
    const reviews = ref<Review[]>([])
    const currentReviews = ref<Review[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    // Getters
    const approvedReviews = computed(() =>
        reviews.value.filter(review => review.isApproved)
    )

    const pendingReviews = computed(() =>
        reviews.value.filter(review => !review.isApproved)
    )

    const averageRating = computed(() => {
        if (approvedReviews.value.length === 0) return 0
        const sum = approvedReviews.value.reduce((acc, review) => acc + review.rating, 0)
        return sum / approvedReviews.value.length
    })

    const ratingDistribution = computed(() => {
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        approvedReviews.value.forEach(review => {
            distribution[review.rating as keyof typeof distribution]++
        })
        return distribution
    })

    // Actions
    const fetchReviewsByOrganization = async (organizationId: string) => {
        try {
            isLoading.value = true
            error.value = null

            // Mock API delay
            await new Promise(resolve => setTimeout(resolve, 800))

            // Mock reviews data
            const mockReviews: Review[] = [
                {
                    id: `review-${organizationId}-1`,
                    organizationId,
                    rating: 5,
                    comment: "Excellent organization with great opportunities for internships!",
                    reviewerName: "John Doe",
                    reviewerEmail: "john.doe@example.com",
                    isApproved: true,
                    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: `review-${organizationId}-2`,
                    organizationId,
                    rating: 4,
                    comment: "Good experience overall, professional environment.",
                    reviewerName: "Jane Smith",
                    reviewerEmail: "jane.smith@example.com",
                    isApproved: true,
                    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: `review-${organizationId}-3`,
                    organizationId,
                    rating: 3,
                    comment: "Average experience, could be better.",
                    reviewerName: "Mike Johnson",
                    reviewerEmail: "mike.johnson@example.com",
                    isApproved: false,
                    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
                }
            ]

            currentReviews.value = mockReviews

            return { success: true, data: mockReviews }
        } catch (err: any) {
            error.value = 'Failed to fetch reviews'
            return { success: false, error: error.value }
        } finally {
            isLoading.value = false
        }
    }

    const createReview = async (reviewData: any) => {
        try {
            isLoading.value = true
            error.value = null

            // Mock API delay
            await new Promise(resolve => setTimeout(resolve, 600))

            // Create mock review with generated ID
            const mockReview: Review = {
                id: `review-${Date.now()}`,
                organizationId: reviewData.organizationId,
                rating: reviewData.rating,
                comment: reviewData.comment,
                reviewerName: reviewData.reviewerName,
                reviewerEmail: reviewData.reviewerEmail,
                isApproved: false, // New reviews start as unapproved
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }

            reviews.value.unshift(mockReview)
            currentReviews.value.unshift(mockReview)

            return { success: true, data: mockReview }
        } catch (err: any) {
            error.value = 'Failed to create review'
            return { success: false, error: error.value }
        } finally {
            isLoading.value = false
        }
    }

    const updateReview = async (id: string, reviewData: any) => {
        try {
            isLoading.value = true
            error.value = null

            // Mock API delay
            await new Promise(resolve => setTimeout(resolve, 500))

            const updateReviewInArray = (arr: Review[]) => {
                const index = arr.findIndex(review => review.id === id)
                if (index !== -1) {
                    // Create updated review with new data
                    const updatedReview: Review = {
                        ...arr[index],
                        ...reviewData,
                        updatedAt: new Date().toISOString()
                    }
                    arr[index] = updatedReview
                    return updatedReview
                }
                return null
            }

            const updatedReview = updateReviewInArray(reviews.value) || updateReviewInArray(currentReviews.value)

            if (!updatedReview) {
                throw new Error('Review not found')
            }

            return { success: true, data: updatedReview }
        } catch (err: any) {
            error.value = err.message || 'Failed to update review'
            return { success: false, error: error.value }
        } finally {
            isLoading.value = false
        }
    }

    const deleteReview = async (id: string) => {
        try {
            isLoading.value = true
            error.value = null

            // Mock API delay
            await new Promise(resolve => setTimeout(resolve, 400))

            // Check if review exists before deletion
            const reviewExists = reviews.value.some(review => review.id === id) ||
                currentReviews.value.some(review => review.id === id)

            if (!reviewExists) {
                throw new Error('Review not found')
            }

            reviews.value = reviews.value.filter(review => review.id !== id)
            currentReviews.value = currentReviews.value.filter(review => review.id !== id)

            return { success: true }
        } catch (err: any) {
            error.value = err.message || 'Failed to delete review'
            return { success: false, error: error.value }
        } finally {
            isLoading.value = false
        }
    }

    const approveReview = async (id: string) => {
        return await updateReview(id, { isApproved: true })
    }

    const clearError = () => {
        error.value = null
    }

    const clearCurrentReviews = () => {
        currentReviews.value = []
    }

    // WebSocket event handlers (disabled for now)
    const setupWebSocketListeners = () => {
        console.log('Review WebSocket listeners setup (mock)')
        // Will implement when WebSocket is ready
    }

    return {
        // State
        reviews,
        currentReviews,
        isLoading,
        error,

        // Getters
        approvedReviews,
        pendingReviews,
        averageRating,
        ratingDistribution,

        // Actions
        fetchReviewsByOrganization,
        createReview,
        updateReview,
        deleteReview,
        approveReview,
        clearError,
        clearCurrentReviews,
        setupWebSocketListeners
    }
})