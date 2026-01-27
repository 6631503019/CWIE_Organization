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
          <div class="mou-card" v-for="(mou, index) in leftColumnMous" :key="mou.id">
            <!-- Organization Logo -->
            <div class="org-logo">
              <img :src="mou.logo" :alt="mou.name" />
            </div>
            
            <!-- Organization Info -->
            <div class="org-name">{{ mou.name }}</div>
            <div class="org-status active">Active</div>
            <div class="org-duration">{{ mou.duration }}</div>
            
            <!-- Details Button -->
            <div class="details-section" @click="viewDetails(mou)">
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
      
      <!-- Additional MOU Cards (Bottom) -->
      <div class="bottom-mou-cards">
        <div class="mou-card" v-for="mou in bottomMous" :key="mou.id">
          <!-- Organization Logo -->
          <div class="org-logo">
            <img :src="mou.logo" :alt="mou.name" />
          </div>
          
          <!-- Organization Info -->
          <div class="org-name">{{ mou.name }}</div>
          <div class="org-status active">Active</div>
          <div class="org-duration">{{ mou.duration }}</div>
          
          <!-- Details Button -->
          <div class="details-section" @click="viewDetails(mou)">
            <span class="details-text">Details</span>
            <div class="details-arrow"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import UserNavbar from '../components/UserNavbar.vue'
import Pagination from '../components/Pagination.vue'
import { organizationAPI, mouAPI } from '../services/api'

const router = useRouter()
const route = useRoute()

// Reactive state management
const state = reactive({
  loading: false,
  error: null as string | null,
  currentPage: 1,
  itemsPerPage: 5
})

// Reactive filter data
const searchText = ref('')

// MOU data
const mous = ref<any[]>([])
const selectedMou = ref<any>(null)
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

// Paginated MOUs - split into columns
const paginatedMous = computed(() => {
  const start = (state.currentPage - 1) * state.itemsPerPage
  const end = start + state.itemsPerPage
  return filteredMous.value.slice(start, end)
})

// Left column (first 2 MOUs)
const leftColumnMous = computed(() => {
  return paginatedMous.value.slice(0, 2)
})

// Bottom MOUs (remaining 3)
const bottomMous = computed(() => {
  return paginatedMous.value.slice(2, 5)
})

// Pagination info
const totalPages = computed(() => 
  Math.ceil(filteredMous.value.length / state.itemsPerPage)
)

// Watchers
watch(searchText, () => {
  state.currentPage = 1
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

const viewDetails = async (mou: any) => {
  selectedMou.value = mou
  
  // Fetch MOU document
  try {
    const mouResponse = await mouAPI.getAll({ limit: 100 })
    const mouData = mouResponse.data.data.find((m: any) => {
      const orgId = m.organization_id?._id || m.organization_id
      return String(orgId) === String(mou.id)
    })
    
    if (mouData && mouData.document_image_path) {
      let docPath = mouData.document_image_path
      docPath = docPath.replace(/\\/g, '/')
      if (!docPath.startsWith('/')) {
        docPath = '/' + docPath
      }
      mouDocumentImage.value = `http://localhost:5000${docPath}`
      
      // Check if it's a PDF
      isMOUDocumentPDF.value = docPath.toLowerCase().endsWith('.pdf')
    } else {
      mouDocumentImage.value = null
      isMOUDocumentPDF.value = false
    }
  } catch (error) {
    console.error('Error loading MOU document:', error)
    mouDocumentImage.value = null
    isMOUDocumentPDF.value = false
  }
}

const closeDetail = () => {
  router.push('/user/mou')
}

const viewFullDetails = () => {
  if (selectedMou.value) {
    router.push(`/user/mou/${selectedMou.value.id}/more`)
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
        const logoUrl = logoPath ? `http://localhost:5000${logoPath}` : '/api/placeholder/95/95'
        
        return {
          id: item._id,
          name: item.name_en || item.name_th || 'No Name',
          duration: durationText,
          logo: logoUrl
        }
      })
    
    // Auto-select first MOU from route param
    const mouId = route.params.id
    if (mouId) {
      const foundMou = mous.value.find(m => m.id === mouId)
      if (foundMou) {
        await viewDetails(foundMou)
      }
    }
  } catch (error: any) {
    state.error = error.response?.data?.message || 'Failed to load MOUs'
    console.error('Loading error:', error)
  }
}

// Lifecycle
onMounted(async () => {
  state.loading = true
  try {
    await fetchPublishedMOUs()
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
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

.mou-left-column {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.mou-card {
  position: relative;
  background: #FFFFFF;
  border: 1px solid #E0E0E0;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 280px;
}

.mou-card:hover {
  transform: translateY(-2px);
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.1);
}

.org-logo {
  width: 95px;
  height: 95px;
  margin: 0 auto 20px;
  border-radius: 8px;
  overflow: hidden;
  background: #F5F5F5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.org-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.org-name {
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  font-size: 20px;
  line-height: 26px;
  color: #000000;
  text-align: center;
  margin-bottom: 12px;
  min-height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.org-status {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 12px;
  text-align: center;
  margin: 0 auto 12px;
  display: block;
  width: fit-content;
}

.org-status.active {
  background: #E8F5E9;
  color: #2E7D32;
}

.org-duration {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 13px;
  line-height: 18px;
  color: #666666;
  text-align: center;
  margin-bottom: 20px;
}

.details-section {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.details-text {
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #C70000;
}

.details-arrow {
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid #C70000;
  transform: rotate(-90deg);
}

/* Detail Panel */
.detail-panel {
  position: relative;
  background: #FFFFFF;
  border: 1px solid #E0E0E0;
  border-radius: 12px;
  padding: 40px 30px;
}

.close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 30px;
  height: 30px;
  cursor: pointer;
}

.close-line-1,
.close-line-2 {
  position: absolute;
  width: 20px;
  height: 2px;
  background: #000000;
  top: 14px;
  left: 5px;
}

.close-line-1 {
  transform: rotate(45deg);
}

.close-line-2 {
  transform: rotate(-45deg);
}

.org-detail-logo {
  width: 120px;
  height: 120px;
  margin: 0 auto 20px;
  border-radius: 8px;
  overflow: hidden;
  background: #F5F5F5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.org-detail-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.org-detail-name {
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  font-size: 24px;
  line-height: 32px;
  color: #000000;
  text-align: center;
  margin-bottom: 12px;
}

.org-detail-duration {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 14px;
  color: #666666;
  text-align: center;
  margin-bottom: 30px;
}

.mou-document {
  width: 100%;
  min-height: 400px;
  background: #F9F9F9;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  margin-bottom: 20px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mou-document img {
  width: 100%;
  height: auto;
  object-fit: contain;
}

.mou-pdf-viewer {
  width: 100%;
  min-height: 400px;
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
  font-family: 'Inter', sans-serif;
  font-size: 14px;
}

.more-details {
  text-align: center;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #C70000;
  cursor: pointer;
  text-decoration: underline;
}

/* Bottom MOU Cards */
.bottom-mou-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-bottom: 40px;
}

/* Pagination */
.mou-pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}
</style>
