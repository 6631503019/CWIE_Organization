<template>
  <div class="user-mou-detail">
    <UserNavbar />
    
    <!-- Main Content Area -->
    <div class="main-content">
      <!-- Page Title -->
      <h1 class="page-title">MOU</h1>
      
      <!-- Search Section -->
      <div class="search-filter-section">
        <div class="search-controls">
          <!-- Text Search -->
          <div class="search-input-wrapper">
            <input 
              type="text" 
              class="search-input" 
              placeholder="Text Search (Name)"
              v-model="searchText"
            />
          </div>
          
          <!-- Action Buttons -->
          <div class="action-buttons">
            <button class="reset-btn" @click="resetSearch">Reset</button>
            <button class="search-btn" @click="applySearch">Search</button>
          </div>
        </div>
      </div>
      
      <!-- MOU Grid Layout -->
      <div class="mou-grid-container">
        <!-- Left Column MOUs -->
        <div class="mou-left-column">
          <div class="mou-card" v-for="mou in paginatedMous" :key="mou.id" @click="selectMou(mou)">
            <!-- Organization Logo -->
            <div class="org-logo">
              <img :src="mou.logo" :alt="mou.name" />
            </div>
            
            <!-- Organization Info -->
            <div class="org-name">{{ mou.name }}</div>
            <div class="org-status active">Active</div>
            <div class="org-duration">{{ mou.duration }}</div>
            
            <!-- Details Button -->
            <div class="details-section">
              <span class="details-text">Details</span>
              <div class="details-arrow"></div>
            </div>
          </div>
        </div>
        
        <!-- Right Detail Panel -->
        <div class="detail-panel">
          <!-- Close Button -->
          <div class="close-button" @click="closeDetail">
            <div class="close-line-1"></div>
            <div class="close-line-2"></div>
          </div>
          
          <!-- Organization Details -->
          <div class="org-detail-logo">
            <img :src="selectedMou?.logo" :alt="selectedMou?.name" />
          </div>
          
          <div class="org-detail-name">{{ selectedMou?.name }}</div>
          <div class="org-detail-duration">{{ selectedMou?.duration }}</div>
          
          <!-- MOU Document -->
          <div class="mou-document">
            <!-- PDF Document -->
            <object v-if="mouDocumentImage && isMOUDocumentPDF" :data="mouDocumentImage" type="application/pdf" class="mou-pdf-viewer">
              <p>PDF cannot be displayed. <a :href="mouDocumentImage" target="_blank">Click here to view</a></p>
            </object>
            
            <!-- Image Document -->
            <img v-else-if="mouDocumentImage && !isMOUDocumentPDF" :src="mouDocumentImage" alt="MOU Document" />
            
            <!-- Placeholder -->
            <div v-else class="mou-placeholder">
              <div class="placeholder-icon"></div>
              <span class="placeholder-text">No MOU Document</span>
            </div>
          </div>
          
          <!-- More Details Link -->
          <div class="more-details" @click="viewFullDetails">
            More details
          </div>
        </div>
      </div>
      
      <!-- Pagination Component -->
      <div class="mou-pagination-wrapper">
        <Pagination 
          :current-page="state.currentPage"
          :total-pages="totalPages"
          :total-items="filteredMous.length"
          :loading="state.loading"
          :show-info="false"
          @page-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import UserNavbar from '../components/UserNavbar.vue'
import Pagination from '../components/Pagination.vue'
import { organizationAPI, mouAPI, BACKEND_URL } from '../services/api'

const router = useRouter()
const route = useRoute()

// Reactive state management
const state = reactive({
  loading: false,
  error: null as string | null,
  currentPage: 1,
  itemsPerPage: 6
})

// Reactive filter data
const searchText = ref('')

// MOU data
const mous = ref<any[]>([])
const mouDocumentImage = ref<string | null>(null)
const isMOUDocumentPDF = ref(false)

// Computed properties for reactive filtering
const filteredMous = computed(() => {
  let filtered = mous.value
  
  if (searchText.value.trim()) {
    const search = searchText.value.toLowerCase()
    filtered = filtered.filter(mou => 
      mou.name.toLowerCase().includes(search)
    )
  }
  
  return filtered
})

// Paginated MOUs
const paginatedMous = computed(() => {
  const start = (state.currentPage - 1) * state.itemsPerPage
  const end = start + state.itemsPerPage
  return filteredMous.value.slice(start, end)
})

const selectedMou = computed(() => {
  const mouId = route.params.id as string
  const found = mous.value.find(m => {
    return String(m.id) === String(mouId) || m.id === mouId || m.id === parseInt(mouId)
  })
  
  if (!found) {
    console.warn(`MOU with ID ${mouId} not found, falling back to first MOU`)
  }
  
  return found || mous.value[0]
})

// Pagination info
const totalPages = computed(() => 
  Math.ceil(filteredMous.value.length / state.itemsPerPage)
)

// Watchers
watch(searchText, () => {
  state.currentPage = 1
})

watch(() => route.params.id, async (newId) => {
  if (newId) {
    await fetchMOUDocument(newId as string)
  }
})

// Methods
const handlePageChange = async (page: number) => {
  if (page >= 1 && page <= totalPages.value && !state.loading) {
    state.loading = true
    try {
      state.currentPage = page
      await new Promise(resolve => setTimeout(resolve, 150))
    } finally {
      state.loading = false
    }
  }
}

const resetSearch = () => {
  searchText.value = ''
}

const applySearch = () => {
  state.currentPage = 1
}

const selectMou = (mou: any) => {
  router.push(`/user/mou/${mou.id}`)
}

const closeDetail = () => {
  router.push('/user/mou')
}

const viewFullDetails = () => {
  if (selectedMou.value) {
    router.push(`/user/mou/${selectedMou.value.id}/more`)
  }
}

// Fetch MOU document for selected organization
const fetchMOUDocument = async (orgId: string) => {
  try {
    console.log('Fetching MOU for organization ID:', orgId)
    const response = await mouAPI.getAll({ limit: 100 })
    console.log('All MOUs from backend:', response.data.data)
    
    // Try multiple matching strategies
    const mou = response.data.data.find((item: any) => {
      const mouOrgId = item.organization_id?._id || item.organization_id
      console.log(`Comparing MOU org ID: ${mouOrgId} with target: ${orgId}`)
      return String(mouOrgId) === String(orgId)
    })
    
    console.log('Found MOU:', mou)
    
    if (mou && mou.mou_path) {
      mouDocumentImage.value = `${BACKEND_URL}${mou.mou_path}`
      isMOUDocumentPDF.value = mou.mou_path.toLowerCase().endsWith('.pdf')
      console.log('MOU document URL set to:', mouDocumentImage.value)
    } else {
      console.log('No MOU found for this organization')
      mouDocumentImage.value = null
      isMOUDocumentPDF.value = false
    }
  } catch (error) {
    console.error('Error loading MOU document:', error)
    mouDocumentImage.value = null
    isMOUDocumentPDF.value = false
  }
}

// Fetch published MOUs
const fetchPublishedMOUs = async () => {
  try {
    const response = await organizationAPI.getAll({ limit: 100 })
    
    // Get only published MOUs
    const mouResponse = await mouAPI.getAll({ limit: 100 })
    
    // Create map of published MOUs
    const mouMap = new Map()
    mouResponse.data.data
      .filter((mou: any) => mou.is_published === true || mou.is_published === 'true' || mou.is_published === 1)
      .forEach((mou: any) => {
        const orgId = mou.organization_id?._id || mou.organization_id
        mouMap.set(String(orgId), mou)
      })
    
    // Filter and map organizations with published MOUs
    mous.value = response.data.data
      .filter((item: any) => mouMap.has(String(item._id)))
      .map((item: any) => {
        const mou = mouMap.get(String(item._id))
        let durationText = 'N/A'
        
        if (mou && mou.start_date && mou.end_date) {
          const startDate = new Date(mou.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
          const endDate = new Date(mou.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
          durationText = `Start: ${startDate} End: ${endDate}`
        }
        
        // Normalize logo path
        let logoPath = item.logo_path
        if (logoPath) {
          logoPath = logoPath.replace(/\\/g, '/')
          if (!logoPath.startsWith('/')) {
            logoPath = '/' + logoPath
          }
        }
        const logoUrl = logoPath ? `${BACKEND_URL}${logoPath}` : '/api/placeholder/95/95'
        
        return {
          id: item._id,
          name: item.name_en || item.name_th || 'No Name',
          duration: durationText,
          logo: logoUrl
        }
      })
    
  } catch (error: any) {
    state.error = error.response?.data?.message || 'Failed to load MOUs'
    console.error('Loading error:', error)
  }
}

// Lifecycle
onMounted(async () => {
  console.log('UserMOUDetail mounted for ID:', route.params.id)
  state.loading = true
  
  try {
    await fetchPublishedMOUs()
    
    // Fetch MOU document if we have organization ID
    if (route.params.id) {
      await fetchMOUDocument(route.params.id as string)
    }
  } finally {
    state.loading = false
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');

.user-mou-detail {
  position: relative;
  width: 100vw;
  min-height: 100vh;
  background: #F6F7F8;
}

.main-content {
  margin-left: 232px;
  padding: 40px 20px 20px 20px;
  min-height: 100vh;
}

.page-title {
  margin: 0 0 30px 0;
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  font-size: 40px;
  line-height: 50px;
  color: #000000;
}

/* Search Section */
.search-filter-section {
  margin-bottom: 40px;
}

.search-controls {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search-input-wrapper {
  flex: 1;
  max-width: 800px;
}

.search-input {
  box-sizing: border-box;
  width: 100%;
  height: 40px;
  background: #FFFFFF;
  border: 1px solid #B1B1B1;
  border-radius: 8px;
  padding: 10px 16px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #000000;
}

.search-input::placeholder {
  color: #B1B1B1;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.reset-btn {
  padding: 8px 20px;
  background: #FFFFFF;
  border: 1px solid #B1B1B1;
  border-radius: 20px;
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 14px;
  color: #000000;
  cursor: pointer;
}

.search-btn {
  padding: 8px 20px;
  background: #AB1C03;
  border: none;
  border-radius: 20px;
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 14px;
  color: #FFFFFF;
  cursor: pointer;
}

/* MOU Grid Layout */
.mou-grid-container {
  position: absolute;
  width: 600px;
  left: 270px;
  top: 250px;
  display: flex;
  gap: 50px;
}

.mou-left-column {
  width: 550px;
  display: grid;
  grid-template-columns: repeat(2, 250px);
  gap: 23px 50px;
}

.mou-card {
  position: relative;
  width: 250px;
  height: 248px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.mou-card:hover {
  transform: translateY(-2px);
}

.mou-card::before {
  content: '';
  position: absolute;
  width: 250px;
  height: 200px;
  left: 0px;
  top: 48px;
  
  background: #FFFFFF;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 12px;
  z-index: 1;
}

.org-logo {
  position: absolute;
  width: 95px;
  height: 95px;
  left: 77px;
  top: 0px;
  z-index: 2;
}

.org-logo img {
  width: 100%;
  height: 100%;
  border-radius: 47.5px;
  object-fit: cover;
  background: #e0e0e0;
}

.org-name {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 107px;
  z-index: 2;
  
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 18px;
  line-height: 23px;
  letter-spacing: 0.12em;
  color: #000000;
  text-align: center;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.org-status {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 132px;
  z-index: 2;
  
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 18px;
  color: #767676;
}

.org-status.active {
  color: #00FF5E;
}

.org-status.inactive {
  color: #FF0000;
}

.org-duration {
  position: absolute;
  width: 100px;
  left: 75px;
  top: 156px;
  z-index: 2;
  
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 11px;
  line-height: 15px;
  text-align: center;
  color: #767676;
}

.details-section {
  position: absolute;
  left: 94px;
  top: 200px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 8px;
}

.details-text {
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 18px;
  color: #000000;
}

.details-arrow {
  width: 10px;
  height: 4.84px;
  border: 1px solid #000000;
  transform: rotate(90deg);
  clip-path: polygon(0 0, 100% 50%, 0 100%);
}

/* Detail Panel */
.detail-panel {
  position: absolute;
  width: 518px;
  height: 781.16px;
  left: 617px;
  top: 0px;
  
  background: #FFFFFF;
  box-shadow: 0px 4px 20px 1px rgba(0, 0, 0, 0.25);
  border-radius: 12px;
}

.close-button {
  position: absolute;
  width: 18px;
  height: 16.21px;
  right: 33px;
  top: 32px;
  cursor: pointer;
}

.close-line-1, .close-line-2 {
  position: absolute;
  width: 23px;
  height: 2px;
  background: #000000;
}

.close-line-1 {
  transform: rotate(45deg);
  top: 7px;
}

.close-line-2 {
  transform: rotate(-45deg);
  top: 7px;
}

.org-detail-logo {
  position: absolute;
  width: 89.43px;
  height: 89.43px;
  left: 214px;
  top: 47px;
}

.org-detail-logo img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  background: #e0e0e0;
}

.org-detail-name {
  position: absolute;
  width: 400px;
  max-height: 80px;
  left: 59px;
  top: 146px;
  
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 24px;
  line-height: 30px;
  letter-spacing: 0.08em;
  color: #000000;
  text-align: center;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  word-wrap: break-word;
}

.org-detail-duration {
  position: absolute;
  width: 110px;
  height: 36.13px;
  left: 204px;
  top: 190px;
  
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 15px;
  text-align: center;
  color: #000000;
}

.mou-document {
  position: absolute;
  width: 291.15px;
  height: 408.61px;
  left: 114px;
  top: 260px;
  border-radius: 8px;
  overflow: hidden;
  background: #f0f0f0;
}

.mou-document img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  background: #f0f0f0;
}

.mou-pdf-viewer {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 8px;
}

.mou-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #999999;
}

.placeholder-icon {
  width: 60px;
  height: 60px;
  background: #E0E0E0;
  border-radius: 50%;
}

.placeholder-text {
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  color: #999;
  text-align: center;
}

.more-details {
  position: absolute;
  width: 131px;
  height: 18px;
  left: 194px;
  top: 732px;
  
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 15px;
  line-height: 19px;
  color: #000000;
  cursor: pointer;
  text-align: center;
}

.more-details:hover {
  text-decoration: underline;
}

/* Pagination */
.mou-pagination-wrapper {
  position: absolute;
  left: 453px;
  top: 1090px;
  width: 218px;
  height: 28px;
}
</style>
