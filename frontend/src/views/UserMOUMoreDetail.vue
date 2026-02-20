<template>
  <div class="user-mou-more-detail">
    <UserNavbar />
    
    <!-- Main Content Card -->
    <div class="content-card">
      <!-- Back Button -->
      <div class="back-button" @click="goBack">
        <div class="back-arrow"></div>
      </div>
      
      <!-- MOU Badge -->
      <div class="mou-badge" @click="openMOUDocument" :class="{ 'has-mou': mouDocumentUrl }">
        MOU
      </div>
      
      <!-- Organization Name -->
      <h1 class="org-title">{{ organization?.name_en || organization?.name_th || 'Organization Name' }}</h1>
      
      <!-- Organization Logo -->
      <div class="org-logo-large">
        <img :src="logoUrl" :alt="organization?.name_en" />
      </div>
      
      <!-- Address -->
      <div class="org-address">{{ fullAddress }}</div>
      
      <!-- Business Type Section -->
      <div class="section-label business-type-label">Business Type</div>
      <div class="tags-container business-tags">
        <div class="tag" v-for="(type, index) in businessTypes" :key="index">{{ type }}</div>
      </div>
      
      <!-- Location Section -->
      <div class="section-label location-label">Location</div>
      <div class="tags-container location-tags">
        <div class="tag">{{ organization?.address?.country || 'Thailand' }}</div>
        <div class="tag">{{ organization?.address?.region || 'Central' }}</div>
        <div class="tag">{{ organization?.address?.province || 'Bangkok' }}</div>
      </div>
      
      <!-- Email -->
      <div class="contact-item email-item">
        <div class="icon email-icon"></div>
        <span class="contact-text">{{ organization?.email || 'N/A' }}</span>
      </div>
      
      <!-- Phone -->
      <div class="contact-item phone-item">
        <div class="icon phone-icon"></div>
        <span class="contact-text">{{ organization?.tel || 'N/A' }}</span>
      </div>
      
      <!-- Details Section -->
      <div class="details-section">
        <h2 class="section-title">Details</h2>
        <p class="details-text">{{ organization?.details || 'No details available.' }}</p>
      </div>
      
      <!-- Reviews Section -->
      <div class="reviews-section">
        <h2 class="section-title">Reviews</h2>
        
        <!-- Review Navigation -->
        <div class="review-carousel" v-if="reviews.length > 0">
          <!-- Previous Button -->
          <button 
            class="review-nav-btn prev" 
            @click="prevReview" 
            :disabled="currentReviewIndex === 0"
          >
            <div class="nav-arrow left"></div>
          </button>
          
          <!-- Current Review Card -->
          <div class="review-card" v-if="currentReview">
            <div class="review-header">
              <span class="job-position-label">Job position : </span>
              <span class="job-position-value">{{ currentReview.job_position || 'N/A' }}</span>
            </div>
            <p class="review-text">{{ currentReview.review_text || 'No review available.' }}</p>
            <div class="review-rating">
              <span v-for="star in 5" :key="star" class="star" :class="{ filled: star <= (currentReview.rating || 0) }">
                ★
              </span>
            </div>
            <div class="review-counter">{{ currentReviewIndex + 1 }} / {{ reviews.length }}</div>
          </div>
          
          <!-- Next Button -->
          <button 
            class="review-nav-btn next" 
            @click="nextReview" 
            :disabled="currentReviewIndex === reviews.length - 1"
          >
            <div class="nav-arrow right"></div>
          </button>
        </div>
        
        <div class="no-reviews" v-else>
          <p>No reviews available yet.</p>
        </div>
      </div>
    </div>
    
    <!-- Notification Modal -->
    <NotificationModal 
      :show="showNotificationModal"
      :message="notificationMessage"
      :type="notificationType"
      @close="showNotificationModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UserNavbar from '../components/UserNavbar.vue'
import NotificationModal from '../components/NotificationModal.vue'
import { organizationAPI, reviewAPI, mouAPI, BACKEND_URL } from '../services/api'

const route = useRoute()
const router = useRouter()

// Reactive data
const organization = ref<any>(null)
const reviews = ref<any[]>([])
const currentReviewIndex = ref(0)
const showNotificationModal = ref(false)
const notificationMessage = ref('')
const notificationType = ref<'success' | 'error' | 'warning'>('warning')
const mouDocumentUrl = ref<string | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// Computed properties
const logoUrl = computed(() => {
  if (organization.value?.logo_path) {
    let logoPath = organization.value.logo_path.replace(/\\/g, '/')
    if (!logoPath.startsWith('/')) {
      logoPath = '/' + logoPath
    }
    return `${BACKEND_URL}${logoPath}`
  }
  return '/api/placeholder/435/435'
})

const fullAddress = computed(() => {
  if (!organization.value) return 'No address available'
  
  const org = organization.value
  const parts = []
  
  if (org.name_en || org.name_th) {
    parts.push(org.name_en || org.name_th)
  }
  
  if (org.address) {
    const addr = org.address
    if (addr.address_line) parts.push(addr.address_line)
    if (addr.district) parts.push(addr.district)
    if (addr.province) parts.push(addr.province)
    if (addr.postal_code) parts.push(addr.postal_code)
    if (addr.country) parts.push(addr.country)
  }
  
  return parts.join(', ') || 'No address available'
})

const businessTypes = computed(() => {
  if (!organization.value?.business_type) return ['Individual']
  
  if (Array.isArray(organization.value.business_type)) {
    return organization.value.business_type
  }
  
  if (typeof organization.value.business_type === 'string') {
    return organization.value.business_type.split(',').map((t: string) => t.trim())
  }
  
  return ['Individual']
})

const currentReview = computed(() => {
  if (reviews.value.length === 0) return null
  return reviews.value[currentReviewIndex.value]
})

// Review navigation
const nextReview = () => {
  if (currentReviewIndex.value < reviews.value.length - 1) {
    currentReviewIndex.value++
  }
}

const prevReview = () => {
  if (currentReviewIndex.value > 0) {
    currentReviewIndex.value--
  }
}

// Fetch organization data
const fetchOrganization = async () => {
  try {
    loading.value = true
    const orgId = route.params.id as string
    
    if (!orgId) {
      throw new Error('Organization ID is required')
    }
    
    const response = await organizationAPI.getById(orgId)
    organization.value = response.data.data
    
    console.log('Organization loaded:', organization.value)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load organization'
    console.error('Error loading organization:', err)
  } finally {
    loading.value = false
  }
}

// Fetch reviews for organization
const fetchReviews = async () => {
  try {
    const orgId = route.params.id as string
    
    if (!orgId) return
    
    const response = await reviewAPI.getByOrganization(orgId)
    reviews.value = response.data.data || []
    
    console.log('Reviews loaded:', reviews.value.length, 'items')
  } catch (err: any) {
    console.error('Error loading reviews:', err)
    reviews.value = []
  }
}

// Fetch MOU document for organization
const fetchMOUDocument = async () => {
  try {
    const orgId = route.params.id as string
    
    if (!orgId) {
      console.log('No organization ID provided')
      return
    }
    
    console.log('Fetching MOU for organization ID:', orgId)
    const response = await mouAPI.getAll({ limit: 100 })
    
    // Find published MOU for this organization
    const mou = response.data.data.find((item: any) => {
      const mouOrgId = typeof item.organization_id === 'object' 
        ? item.organization_id?._id 
        : item.organization_id
      
      const idMatch = String(mouOrgId) === String(orgId)
      const isPublished = item.is_published === true || item.is_published === 'true' || item.is_published === 1
      
      return idMatch && isPublished
    })
    
    console.log('Found published MOU:', mou)
    
    if (mou && mou.mou_path) {
      mouDocumentUrl.value = `${BACKEND_URL}${mou.mou_path}`
      console.log('✅ MOU document found:', mouDocumentUrl.value)
    } else {
      mouDocumentUrl.value = null
      console.log('❌ No published MOU document found for this organization')
    }
  } catch (err: any) {
    console.error('Error loading MOU document:', err)
    mouDocumentUrl.value = null
  }
}

// Open MOU document in new tab
const openMOUDocument = () => {
  if (mouDocumentUrl.value) {
    window.open(mouDocumentUrl.value, '_blank')
  } else {
    notificationMessage.value = 'No MOU document available for this organization'
    notificationType.value = 'warning'
    showNotificationModal.value = true
  }
}

// Navigation method
const goBack = () => {
  router.back()
}

// Lifecycle hooks
onMounted(async () => {
  console.log('UserMOUMoreDetail mounted for ID:', route.params.id)
  
  await fetchOrganization()
  await fetchReviews()
  await fetchMOUDocument()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');

.user-mou-more-detail {
  position: relative;
  width: 1440px;
  height: 1176px;
  background: #F6F7F8;
  overflow-x: auto;
}

.content-card {
  box-sizing: border-box;
  position: absolute;
  width: 1118px;
  height: 1232px;
  left: 250px;
  top: 50px;
  
  background: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 15px;
}

.back-button {
  position: absolute;
  width: 40px;
  height: 40px;
  left: 20px;
  top: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.back-button:hover {
  transform: translateX(-3px);
}

.back-arrow {
  width: 24px;
  height: 24px;
  background: #000000;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z'/%3E%3C/svg%3E") no-repeat center;
  mask-size: contain;
}

.mou-badge {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 5px 3px;
  gap: 10px;
  
  position: absolute;
  width: 71px;
  height: 28px;
  left: 1022px;
  top: 22px;
  
  border: 1px solid #C70000;
  border-radius: 5px;
  
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 18px;
  color: #C70000;
  
  cursor: pointer;
  transition: all 0.2s ease;
}

.mou-badge:hover {
  background: #C70000;
  color: #FFFFFF;
}

.mou-badge.has-mou {
  cursor: pointer;
}

.mou-badge:not(.has-mou) {
  opacity: 0.5;
  cursor: not-allowed;
}

.org-title {
  position: absolute;
  left: 74px;
  right: 74px;
  top: 77px;
  
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 28px;
  line-height: 35px;
  text-align: center;
  color: #000000;
  margin: 0;
}

.org-logo-large {
  position: absolute;
  width: 435px;
  height: 435px;
  left: 342px;
  top: 145px;
  
  background: #F5F5F5;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.org-logo-large img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.org-address {
  position: absolute;
  left: 74px;
  right: 74px;
  top: 600px;
  
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 15px;
  line-height: 19px;
  text-align: center;
  color: rgba(0, 0, 0, 0.8);
}

.section-label {
  position: absolute;
  left: 74px;
  
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 20px;
  color: #000000;
}

.business-type-label {
  top: 640px;
}

.location-label {
  top: 693px;
}

.tags-container {
  position: absolute;
  left: 74px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.business-tags {
  top: 668px;
}

.location-tags {
  top: 721px;
}

.tag {
  box-sizing: border-box;
  padding: 1px 8px;
  height: 20px;
  background: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 6px;
  
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 18px;
  color: #000000;
  
  display: flex;
  align-items: center;
}

.contact-item {
  position: absolute;
  left: 74px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.email-item {
  top: 760px;
}

.phone-item {
  top: 787px;
}

.icon {
  width: 15px;
  height: 15px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.email-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23000000'%3E%3Cpath d='M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z'/%3E%3C/svg%3E");
}

.phone-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23000000'%3E%3Cpath d='M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z'/%3E%3C/svg%3E");
}

.contact-text {
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 17px;
  color: #000000;
}

.details-section {
  position: absolute;
  left: 74px;
  right: 74px;
  top: 840px;
}

.section-title {
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 20px;
  line-height: 25px;
  color: #000000;
  margin: 0 0 12px 0;
}

.details-text {
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.8);
  margin: 0;
  white-space: pre-wrap;
}

.reviews-section {
  position: absolute;
  left: 74px;
  right: 74px;
  top: 950px;
}

.review-carousel {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
}

.review-nav-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 10px;
  transition: opacity 0.2s;
}

.review-nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.review-nav-btn:not(:disabled):hover {
  opacity: 0.7;
}

.nav-arrow {
  width: 0;
  height: 0;
  border-style: solid;
}

.nav-arrow.left {
  border-width: 10px 15px 10px 0;
  border-color: transparent #000000 transparent transparent;
}

.nav-arrow.right {
  border-width: 10px 0 10px 15px;
  border-color: transparent transparent transparent #000000;
}

.review-card {
  flex: 1;
  background: #F9F9F9;
  border: 1px solid #E0E0E0;
  border-radius: 12px;
  padding: 24px;
  min-height: 180px;
  position: relative;
}

.review-header {
  margin-bottom: 16px;
}

.job-position-label {
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #000000;
}

.job-position-value {
  font-family: 'Outfit', sans-serif;
  font-weight: 400;
  font-size: 14px;
  color: #666666;
}

.review-text {
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.8);
  margin: 0 0 20px 0;
  min-height: 60px;
}

.review-rating {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
}

.star {
  font-size: 20px;
  color: #D0D0D0;
}

.star.filled {
  color: #FFF200;
}

.review-counter {
  position: absolute;
  bottom: 24px;
  right: 24px;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 12px;
  color: #999999;
}

.no-reviews {
  text-align: center;
  padding: 40px;
  color: #999999;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
}
</style>
