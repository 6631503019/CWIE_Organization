<template>
  <div class="admin-mou-detail">
    <AdminNavbar />
    
    <!-- Main Content Area -->
    <div class="main-content">
      <!-- Page Title -->
      <h1 class="page-title">MOU</h1>
      
      <!-- Search and Filter Section -->
      <div class="search-filter-section">
        <div class="search-controls">
          <!-- Text Search -->
          <div class="search-input-wrapper">
            <input 
              type="text" 
              class="search-input" 
              placeholder="Text Search (Name, Tags)"
              v-model="searchText"
            />
          </div>
          
          <!-- Status Filter -->
          <div class="status-filter">
            <div class="status-dropdown" @click="toggleStatusDropdown">
              <span class="status-label">--status--</span>
              <div class="dropdown-arrow"></div>
            </div>
            <div v-if="showStatusDropdown" class="status-options">
              <div class="status-option" @click="selectStatus('Active')">Active</div>
              <div class="status-option" @click="selectStatus('Inactive')">Inactive</div>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="action-buttons">
            <button class="reset-btn">Reset</button>
            <button class="search-btn">Search</button>
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
            <div class="org-status">{{ mou.status }}</div>
            <div class="org-duration">{{ mou.duration }}</div>
            
            <!-- Details Button -->
            <div class="details-section">
              <span class="details-text">Details</span>
              <div class="details-arrow"></div>
            </div>
            
            <!-- Edit Icon -->
            <div class="edit-icon">
              <div class="pencil-icon"></div>
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
            <img :src="mouDocumentImage" alt="MOU Document" />
          </div>
          
          <!-- More Details Link -->
          <div class="more-details" @click="viewFullDetails">
            More details
          </div>
        </div>
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
          <div class="org-status">{{ mou.status }}</div>
          <div class="org-duration">{{ mou.duration }}</div>
          
          <!-- Details Button -->
          <div class="details-section">
            <span class="details-text">Details</span>
            <div class="details-arrow"></div>
          </div>
          
          <!-- Edit Icon -->
          <div class="edit-icon">
            <div class="pencil-icon"></div>
          </div>
        </div>
      </div>
      
      <!-- Pagination Component -->
      <Pagination 
        :currentPage="state.currentPage"
        :totalPages="totalPages"
        :totalItems="totalItems"
        :loading="state.loading"
        @page-change="handlePageChange"
      /> 
        :current-page="state.currentPage"
        :total-pages="totalPages"
        :total-items="filteredMous.length"
        :loading="state.loading"
        :show-info="false"
        @page-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AdminNavbar from '../components/AdminNavbar.vue'
import Pagination from '../components/Pagination.vue'

const router = useRouter()
const route = useRoute()

// Reactive state management
const state = reactive({
  loading: false,
  error: null as string | null,
  currentPage: 1,
  itemsPerPage: 6,
  refreshInterval: null as number | null
})

// Search and filter data
const searchText = ref('')
const selectedStatus = ref('')
const showStatusDropdown = ref(false)
const mouDocumentImage = ref('/api/placeholder/291/408')

// MOU data from backend
const allMous = ref<any[]>([])

// Computed properties for layout
const leftColumnMous = computed(() => {
  return allMous.value.slice(0, 2) // First 2 MOUs for left column
})

const bottomMous = computed(() => {
  return allMous.value.slice(2, 4) // Next 2 MOUs for bottom
})

const selectedMou = computed(() => {
  const mouId = parseInt(route.params.id as string)
  return allMous.value.find(m => m.id === mouId) || allMous.value[0]
})

// Pagination computed properties
const totalPages = computed(() => Math.ceil(allMous.value.length / state.itemsPerPage))
const totalItems = computed(() => allMous.value.length)

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

const toggleStatusDropdown = () => {
  showStatusDropdown.value = !showStatusDropdown.value
}

const selectStatus = (status: string) => {
  selectedStatus.value = status
  showStatusDropdown.value = false
}

const closeDetail = () => {
  router.push('/admin/mou')
}

const viewFullDetails = () => {
  // Handle more details action
  console.log('View full details for:', selectedMou.value?.name)
}

onMounted(async () => {
  console.log('AdminMOUDetail mounted')
  state.loading = true
  
  try {
    // Fetch MOUs from backend
    const response = await fetch('http://localhost:5000/api/mou?limit=100')
    if (!response.ok) throw new Error('Failed to load MOUs')
    
    const result = await response.json()
    allMous.value = result.data.map((item: any) => ({
      id: item._id,
      name: item.organization_name || item.name,
      status: item.status || 'Active',
      duration: `Start ${new Date(item.start_date).toISOString().split('T')[0]}\nEnd ${new Date(item.end_date).toISOString().split('T')[0]}`,
      logo: item.logo_path || '/api/placeholder/95/95'
    }))
    
    console.log('MOU detail data loaded for ID:', route.params.id)
    
    // Setup refresh interval
    state.refreshInterval = window.setInterval(async () => {
      try {
        const res = await fetch('http://localhost:5000/api/mou?limit=100')
        if (res.ok) {
          const data = await res.json()
          allMous.value = data.data.map((item: any) => ({
            id: item._id,
            name: item.organization_name || item.name,
            status: item.status || 'Active',
            duration: `Start ${new Date(item.start_date).toISOString().split('T')[0]}\nEnd ${new Date(item.end_date).toISOString().split('T')[0]}`,
            logo: item.logo_path || '/api/placeholder/95/95'
          }))
        }
      } catch (err) {
        console.error('Auto-refresh error:', err)
      }
    }, 60000) // Every minute
    
  } catch (error) {
    state.error = 'Failed to load MOU details'
    console.error('Loading error:', error)
  } finally {
    state.loading = false
  }
})

onBeforeUnmount(() => {
  console.log('AdminMOUDetail unmounting - cleaning up')
  if (state.refreshInterval) {
    clearInterval(state.refreshInterval)
  }
  // Close any open dropdowns
  showStatusDropdown.value = false
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');

.admin-mou-detail {
  position: relative;
  width: 100vw;
  height: 1024px;
  background: #F6F7F8;
  overflow-x: auto;
}

.main-content {
  margin-left: 232px;
  padding: 20px;
  height: calc(100vh - 40px);
  overflow-y: auto;
}

.page-title {
  position: absolute;
  width: 94px;
  height: 50px;
  left: 270px;
  top: 53px;
  margin: 0;
  
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 40px;
  line-height: 50px;
  color: #000000;
}

.search-filter-section {
  position: absolute;
  width: 1135px;
  height: 81px;
  left: 270px;
  top: 136px;
  
  background: #FFFFFF;
  box-shadow: 0px 4px 4px rgba(118, 118, 118, 0.5);
  border-radius: 8px;
}

.search-controls {
  display: flex;
  align-items: center;
  gap: 53px;
  padding: 24px 35px;
}

.search-input-wrapper {
  flex: 1;
  max-width: 510px;
}

.search-input {
  box-sizing: border-box;
  width: 100%;
  height: 34px;
  
  background: #FFFFFF;
  border: 1px solid #B1B1B1;
  border-radius: 8px;
  padding: 8px 11px;
  
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  color: #000000;
}

.search-input::placeholder {
  color: #B1B1B1;
}

.status-filter {
  position: relative;
  width: 276px;
}

.status-dropdown {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  gap: 174px;
  
  width: 276px;
  height: 34px;
  
  background: #FFFFFF;
  border: 1px solid #B1B1B1;
  border-radius: 8px;
  cursor: pointer;
}

.status-label {
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  color: #545454;
}

.dropdown-arrow {
  width: 5.83px;
  height: 4.38px;
  background: #000000;
  clip-path: polygon(0 0, 100% 0, 50% 100%);
}

.status-options {
  position: absolute;
  top: 38px;
  left: 0;
  width: 276px;
  background: #FFFFFF;
  border: 1px solid #B1B1B1;
  border-radius: 8px;
  z-index: 10;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

.status-option {
  padding: 10px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #000000;
  cursor: pointer;
}

.status-option:hover {
  background: #F0F0F0;
}

.action-buttons {
  display: flex;
  gap: 20px;
}

.reset-btn {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 8px 29px;
  gap: 10px;
  
  width: 78.21px;
  height: 24px;
  
  background: #FFFFFF;
  border: 1px solid #B1B1B1;
  border-radius: 20px;
  cursor: pointer;
  
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 17px;
  color: #000000;
}

.search-btn {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 7px 15px;
  gap: 10px;
  
  width: 78.21px;
  height: 24px;
  
  background: #AB1C03;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 17px;
  color: #FFFFFF;
}

.mou-grid-container {
  position: absolute;
  width: 600px;
  height: 791px;
  left: 270px;
  top: 250px;
  display: flex;
  gap: 50px;
}

.mou-left-column {
  width: 250px;
  display: flex;
  flex-direction: column;
  gap: 23px;
}

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
  width: 91px;
  height: 38.08px;
  left: 213px;
  top: 146px;
  
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 29px;
  line-height: 37px;
  letter-spacing: 0.12em;
  color: #000000;
  text-align: center;
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
  white-space: pre-line;
}

.mou-document {
  position: absolute;
  width: 291.15px;
  height: 408.61px;
  left: 114px;
  top: 260px;
}

.mou-document img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  background: #f0f0f0;
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
  color: #00FF5E;
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
  white-space: pre-line;
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

.edit-icon {
  position: absolute;
  width: 21px;
  height: 21px;
  right: 15px;
  top: 62px;
  z-index: 2;
}

.pencil-icon {
  width: 100%;
  height: 100%;
  background: #666;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z'/%3E%3C/svg%3E") no-repeat;
  mask-size: contain;
}

.bottom-mou-cards {
  position: absolute;
  width: 564px;
  height: 200px;
  left: 270px;
  top: 1193px;
  display: flex;
  gap: 64px;
}

/* MOU Detail Pagination Container */
.mou-detail-pagination-container {
  position: absolute;
  left: 453px;
  top: 1454px;
  width: 218px;
  height: 28px;
}
</style>