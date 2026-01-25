<template>
  <div class="admin-mou-more-detail">
    <AdminNavbar />
    
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminNavbar from '../components/AdminNavbar.vue'
import { organizationAPI, reviewAPI, mouAPI } from '../services/api'

const route = useRoute()
const router = useRouter()

// Reactive data
const organization = ref<any>(null)
const reviews = ref<any[]>([])
const currentReviewIndex = ref(0)
const mouDocumentUrl = ref<string | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// Computed properties
const logoUrl = computed(() => {
  if (organization.value?.logo_path) {
    return `http://localhost:5000${organization.value.logo_path}`
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
  
  // If business_type is an array
  if (Array.isArray(organization.value.business_type)) {
    return organization.value.business_type
  }
  
  // If business_type is a string, split by comma
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
    
    // Use getByOrganization instead of getAll
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
    console.log('All MOUs from backend:', response.data.data)
    
    // Find MOU for this organization
    const mou = response.data.data.find((item: any) => {
      // organization_id can be either a string or an object with _id
      const mouOrgId = typeof item.organization_id === 'object' 
        ? item.organization_id?._id 
        : item.organization_id
      
      const idMatch = String(mouOrgId) === String(orgId)
      
      console.log('Comparing MOU org ID:', mouOrgId, 'with target:', orgId, '- Match:', idMatch)
      
      return idMatch
    })
    
    console.log('Found MOU:', mou)
    
    if (mou && mou.mou_path) {
      mouDocumentUrl.value = `http://localhost:5000${mou.mou_path}`
      console.log('✅ MOU document found:', mouDocumentUrl.value)
    } else {
      mouDocumentUrl.value = null
      console.log('❌ No MOU document found for this organization')
      console.log('Available MOUs:', response.data.data.length)
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
    alert('No MOU document available for this organization')
  }
}

// Navigation method
const goBack = () => {
  router.back()
}

// Lifecycle hooks
onMounted(async () => {
  console.log('AdminMOUMoreDetail mounted for ID:', route.params.id)
  
  await fetchOrganization()
  await fetchReviews()
  await fetchMOUDocument()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');

.admin-mou-more-detail {
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
  width: 744px;
  height: 48px;
  left: 187px;
  top: 18px;
  margin: 0;
  
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 28px;
  line-height: 35px;
  text-align: center;
  color: #000000;
}

.org-logo-large {
  position: absolute;
  width: 435px;
  height: 435px;
  left: 353px;
  top: 126px;
  border-radius: 50%;
  overflow: hidden;
}

.org-logo-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #e0e0e0;
}

.org-address {
  position: absolute;
  width: 909px;
  height: auto;
  left: 79px;
  top: 625px;
  
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 20px;
  line-height: 25px;
  color: #000000;
  text-align: center;
}

.section-label {
  position: absolute;
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 20px;
  line-height: 25px;
  color: #000000;
}

.business-type-label {
  width: 124px;
  height: 25px;
  left: 83px;
  top: 703px;
}

.location-label {
  width: 124px;
  height: 25px;
  left: 366px;
  top: 700px;
}

.tags-container {
  position: absolute;
  display: flex;
  gap: 8px;
}

.business-tags {
  left: 79px;
  top: 743px;
}

.location-tags {
  left: 366px;
  top: 739px;
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
  justify-content: center;
}

.contact-item {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 8px;
}

.email-item {
  left: 79px;
  top: 786px;
}

.phone-item {
  left: 366px;
  top: 783px;
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
  left: 83px;
  top: 850px;
  width: 967px;
}

.section-title {
  margin: 0 0 15px 0;
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 19px;
  color: #000000;
}

.details-text {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 19px;
  color: #000000;
}

.reviews-section {
  position: absolute;
  left: 83px;
  top: 950px;
  width: 900px;
}

.review-carousel {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 33px;
}

.review-nav-btn {
  width: 40px;
  height: 40px;
  background: #FFFFFF;
  border: 1px solid #D0D0D0;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.review-nav-btn:hover:not(:disabled) {
  background: #F5F5F5;
  border-color: #AB1C03;
}

.review-nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.nav-arrow {
  width: 20px;
  height: 20px;
  background: #000000;
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
}

.nav-arrow.left {
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z'/%3E%3C/svg%3E");
}

.nav-arrow.right {
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z'/%3E%3C/svg%3E");
}

.review-card {
  flex: 1;
  height: auto;
  min-height: 70px;
  padding: 10px;
  position: relative;
  
  background: rgba(230, 229, 229, 0.5);
  border-radius: 5px;
}

.review-counter {
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #767676;
}

.review-header {
  margin-bottom: 10px;
}

.job-position-label {
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 19px;
  color: #545454;
}

.job-position-value {
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 19px;
  color: #000000;
}

.review-text {
  margin: 0 0 10px 0;
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 19px;
  color: #000000;
}

.review-rating {
  display: flex;
  gap: 4px;
  margin-top: 8px;
}

.review-rating .star {
  font-size: 20px;
  color: #D0D0D0;
}

.review-rating .star.filled {
  color: #FFD700;
}

.no-reviews {
  margin-top: 33px;
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 19px;
  color: #767676;
}
</style>
