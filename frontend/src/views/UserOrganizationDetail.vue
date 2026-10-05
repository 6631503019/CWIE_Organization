<template>
  <div class="user_organization_detail">
    <UserNavbar />
    
    <!-- Main Content Card -->
    <div class="content_card">
      <!-- Back Button -->
      <div class="back_button" @click="goBack">
        <div class="back_arrow"></div>
      </div>
      
      <!-- MOU Badge -->
      <div class="mou_badge" @click="openMOUDocument" :class="{ 'has_mou': mouDocumentUrl }">
        MOU
      </div>
      
      <!-- Organization Name -->
      <h1 class="org_title">{{ organization?.name_en || organization?.name_th || 'Organization Name' }}</h1>
      
      <!-- Organization Logo -->
      <div class="org_logo_large">
        <img :src="logoUrl" :alt="organization?.name_en" />
      </div>
      
      <!-- Address -->
      <div class="org_address">{{ fullAddress }}</div>
      
      <!-- Business Type Section -->
      <div class="section_label business_type_label">Business Type</div>
      <div class="tags_container business_tags">
        <div class="tag" v-for="(type, index) in businessTypes" :key="index">{{ type }}</div>
      </div>
      
      <!-- Location Section -->
      <div class="section_label location_label">Location</div>
      <div class="tags_container location_tags">
        <div class="tag">{{ organization?.country_id?.name || organization?.country_id || 'Thailand' }}</div>
        <div class="tag">{{ organization?.geography_id?.name || organization?.geography_id || 'Central' }}</div>
        <div class="tag">{{ organization?.province_id?.name || organization?.province_id || 'Bangkok' }}</div>
      </div>
      
      <!-- Email -->
      <div class="contact_item email_item">
        <div class="icon email_icon"></div>
        <span class="contact_text">{{ organization?.email || 'N/A' }}</span>
      </div>
      
      <!-- Phone -->
      <div class="contact_item phone_item">
        <div class="icon phone_icon"></div>
        <span class="contact_text">{{ organization?.phone_number || 'N/A' }}</span>
      </div>
      
      <!-- Details Section -->
      <div class="details_section">
        <h2 class="section_title">Details</h2>
        <p class="details_text">{{ organization?.details || 'No details available.' }}</p>
      </div>
      
      <!-- Reviews Section -->
      <div class="reviews_section">
        <h2 class="section_title">Reviews</h2>
        
        <!-- Review Navigation -->
        <div class="review_carousel" v-if="reviews.length > 0">
          <!-- Previous Button -->
          <button 
            class="review_nav_btn prev" 
            @click="prevReview" 
            :disabled="currentReviewIndex === 0"
          >
            <div class="nav_arrow left"></div>
          </button>
          
          <!-- Current Review Card -->
          <div class="review_card" v-if="currentReview">
            <div class="review_header">
              <span class="job_position_label">Job position : </span>
              <span class="job_position_value">{{ currentReview.job_position || 'N/A' }}</span>
            </div>
            <p class="review_text">{{ currentReview.review_text || 'No review available.' }}</p>
            <div class="review_counter">{{ currentReviewIndex + 1 }} / {{ reviews.length }}</div>
          </div>
          
          <!-- Next Button -->
          <button 
            class="review_nav_btn next" 
            @click="nextReview" 
            :disabled="currentReviewIndex === reviews.length - 1"
          >
            <div class="nav_arrow right"></div>
          </button>
        </div>
        
        <div class="no_reviews" v-else>
          <p>No reviews available yet.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UserNavbar from '../components/UserNavbar.vue'
import { organizationAPI, reviewAPI, mouAPI, BACKEND_URL } from '../services/api'

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
    let logoPath = organization.value.logo_path.replace(/\\/g, '/')
    if (!logoPath.startsWith('/')) {
      logoPath = '/' + logoPath
    }
    return `${BACKEND_URL}${logoPath}`
  }
  return 'https://via.placeholder.com/435x435?text=No+Logo'
})

const fullAddress = computed(() => {
  if (!organization.value) return 'No address available'
  
  const org = organization.value
  const parts = []
  
  if (org.address_en) parts.push(org.address_en)
  else if (org.address_th) parts.push(org.address_th)
  
  return parts.join(', ') || 'No address available'
})

const businessTypes = computed(() => {
  if (!organization.value?.organization_type) return ['Individual']
  return [organization.value.organization_type]
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
    
    console.log('Fetching organization:', orgId)
    
    if (!orgId) {
      throw new Error('Organization ID is required')
    }
    
    const response = await organizationAPI.getById(orgId)
    organization.value = response.data.data
    
    console.log('Organization loaded:', organization.value)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load organization'
    console.debug('Organization loading failed:', {
      status: err.response?.status,
      message: err.message,
      data: err.response?.data
    })
  } finally {
    loading.value = false
  }
}

// Fetch reviews for organization
const fetchReviews = async () => {
  try {
    const orgId = route.params.id as string
    
    if (!orgId) return
    
    console.log('Fetching reviews for organization:', orgId)
    const response = await reviewAPI.getByOrganization(orgId)
    reviews.value = response.data.data || []
    
    console.log('Reviews loaded:', reviews.value.length, 'items')
  } catch (err: any) {
    console.debug('Reviews not available:', {
      status: err.response?.status,
      message: err.message
    })
    reviews.value = []
  }
}

// Fetch MOU document for organization
const fetchMOUDocument = async () => {
  try {
    const orgId = route.params.id as string
    
    if (!orgId) return
    
    console.log('Fetching MOU for organization:', orgId)
    const response = await mouAPI.getAll({ limit: 100 })
    
    const mou = response.data.data.find((item: any) => {
      const mouOrgId = typeof item.organization_id === 'object' 
        ? item.organization_id?._id 
        : item.organization_id
      
      return String(mouOrgId) === String(orgId) && item.is_published === true
    })
    
    if (mou && mou.mou_path) {
      mouDocumentUrl.value = `${BACKEND_URL}${mou.mou_path}`
      console.log('MOU document found')
    } else {
      mouDocumentUrl.value = null
      console.debug('No MOU document found for organization')
    }
  } catch (err: any) {
    console.debug('MOU document not available:', {
      status: err.response?.status,
      message: err.message
    })
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
  console.log('UserOrganizationDetail mounted for ID:', route.params.id)
  
  try {
    await fetchOrganization()
    await fetchReviews()
    await fetchMOUDocument()
    console.log('All data loaded successfully')
  } catch (err: any) {
    console.error('Error loading page data:', err)
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');

.user_organization_detail {
  position: relative;
  width: 1440px;
  height: 1176px;
  background: #F6F7F8;
  overflow-x: auto;
}

.content_card {
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

.back_button {
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

.back_button:hover {
  transform: translateX(-3px);
}

.back_arrow {
  width: 24px;
  height: 24px;
  background: #000000;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z'/%3E%3C/svg%3E") no-repeat center;
  mask-size: contain;
}

.mou_badge {
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

.mou_badge:hover {
  background: #C70000;
  color: #FFFFFF;
}

.mou_badge.has_mou {
  cursor: pointer;
}

.mou_badge:not(.has_mou) {
  opacity: 0.5;
  cursor: not-allowed;
}

.org_title {
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

.org_logo_large {
  position: absolute;
  width: 435px;
  height: 435px;
  left: 353px;
  top: 126px;
  border-radius: 50%;
  overflow: hidden;
}

.org_logo_large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #e0e0e0;
}

.org_address {
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

.section_label {
  position: absolute;
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 20px;
  line-height: 25px;
  color: #000000;
}

.business_type_label {
  width: 124px;
  height: 25px;
  left: 83px;
  top: 703px;
}

.location_label {
  width: 124px;
  height: 25px;
  left: 366px;
  top: 700px;
}

.tags_container {
  position: absolute;
  display: flex;
  gap: 8px;
}

.business_tags {
  left: 79px;
  top: 743px;
}

.location_tags {
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

.contact_item {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 8px;
}

.email_item {
  left: 79px;
  top: 786px;
}

.phone_item {
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

.email_icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23000000'%3E%3Cpath d='M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z'/%3E%3C/svg%3E");
}

.phone_icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23000000'%3E%3Cpath d='M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z'/%3E%3C/svg%3E");
}

.contact_text {
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 17px;
  color: #000000;
}

.details_section {
  position: absolute;
  left: 83px;
  top: 850px;
  width: 967px;
}

.section_title {
  margin: 0 0 15px 0;
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 19px;
  color: #000000;
}

.details_text {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 19px;
  color: #000000;
  white-space: pre-line;
}

.reviews_section {
  position: absolute;
  left: 83px;
  top: 1050px;
  width: 900px;
}

.review_carousel {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 33px;
}

.review_nav_btn {
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

.review_nav_btn:hover:not(:disabled) {
  background: #F5F5F5;
  border-color: #AB1C03;
}

.review_nav_btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.nav_arrow {
  width: 20px;
  height: 20px;
  background: #000000;
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
}

.nav_arrow.left {
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z'/%3E%3C/svg%3E");
}

.nav_arrow.right {
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z'/%3E%3C/svg%3E");
}

.review_card {
  flex: 1;
  height: auto;
  min-height: 70px;
  padding: 10px;
  position: relative;
  
  background: rgba(230, 229, 229, 0.5);
  border-radius: 5px;
}

.review_counter {
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #767676;
}

.review_header {
  margin-bottom: 10px;
}

.job_position_label {
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 19px;
  color: #545454;
}

.job_position_value {
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 19px;
  color: #000000;
}

.review_text {
  margin: 0 0 10px 0;
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 19px;
  color: #000000;
}

.no_reviews {
  margin-top: 33px;
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 19px;
  color: #767676;
}
</style>


