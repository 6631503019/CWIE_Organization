<template>
  <div class="admin-mou">
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
      
      <!-- MOU Cards Grid -->
      <div class="mou-cards-grid">
        <div 
          v-for="mou in filteredMous" 
          :key="mou.id" 
          class="mou-card"
          @click="viewMouDetails(mou)"
        >
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
import { useRouter } from 'vue-router'
import AdminNavbar from '../components/AdminNavbar.vue'
import Pagination from '../components/Pagination.vue'

const router = useRouter()

// Reactive state management
const state = reactive({
  loading: false,
  error: null as string | null,
  currentPage: 1,
  itemsPerPage: 6,
  autoRefreshInterval: null as number | null
})

// Reactive filter data
const searchText = ref('')
const selectedStatus = ref('')
const showStatusDropdown = ref(false)

// Mock MOU data based on Figma
const mous = ref([
  {
    id: 1,
    name: 'EBCI',
    status: 'Active',
    duration: 'Start 2025-09-24\nEnd 2026-08-23',
    logo: '/api/placeholder/95/95'
  },
  {
    id: 2,
    name: 'SUNSU',
    status: 'Active',
    duration: 'Start 2025-10-23\nEnd 2026-10-23',
    logo: '/api/placeholder/95/95'
  },
  {
    id: 3,
    name: 'TVD Holdings Public Company limited',
    status: 'Active',
    duration: 'Start 2025-10-23\nEnd 2026-10-23',
    logo: '/api/placeholder/95/95'
  }
])

// Computed properties for reactive filtering
const filteredMous = computed(() => {
  let filtered = mous.value
  
  if (searchText.value.trim()) {
    const search = searchText.value.toLowerCase()
    filtered = filtered.filter(mou => 
      mou.name.toLowerCase().includes(search) ||
      mou.status.toLowerCase().includes(search)
    )
  }
  
  if (selectedStatus.value && selectedStatus.value !== 'All') {
    filtered = filtered.filter(mou => mou.status === selectedStatus.value)
  }
  
  return filtered
})

// Paginated MOUs
const paginatedMous = computed(() => {
  const start = (state.currentPage - 1) * state.itemsPerPage
  const end = start + state.itemsPerPage
  return filteredMous.value.slice(start, end)
})

// Pagination info
const totalPages = computed(() => 
  Math.ceil(filteredMous.value.length / state.itemsPerPage)
)

// Watchers for reactive updates
watch(searchText, () => {
  state.currentPage = 1 // Reset to first page when searching
})

watch(selectedStatus, () => {
  state.currentPage = 1 // Reset to first page when filtering
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

const toggleStatusDropdown = () => {
  showStatusDropdown.value = !showStatusDropdown.value
}

const selectStatus = (status: string) => {
  selectedStatus.value = status
  showStatusDropdown.value = false
}

const viewMouDetails = (mou: any) => {
  // Navigate to MOU detail page
  router.push(`/admin/mou/${mou.id}`)
}

// Lifecycle hooks
onMounted(async () => {
  console.log('AdminMOU mounted')
  state.loading = true
  
  try {
    // Simulate API data loading
    await new Promise(resolve => setTimeout(resolve, 800))
    console.log('MOU data loaded:', mous.value.length, 'items')
    
    // Setup auto-refresh
    state.autoRefreshInterval = window.setInterval(() => {
      console.log('Auto-refresh MOUs...')
    }, 30000) // Every 30 seconds
    
  } catch (error) {
    state.error = 'Failed to load MOU data'
    console.error('Loading error:', error)
  } finally {
    state.loading = false
  }
})

onBeforeUnmount(() => {
  console.log('AdminMOU unmounting - cleaning up')
  if (state.autoRefreshInterval) {
    clearInterval(state.autoRefreshInterval)
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');

.admin-mou {
  position: relative;
  width: 100vw;
  height: 100vh;
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
  left: 251px;
  top: 58px;
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
  left: 251px;
  top: 125px;
  
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

.mou-cards-grid {
  position: absolute;
  width: 849px;
  height: 250px;
  left: 250px;
  top: 267px;
  
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 0px;
  gap: 42px;
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
</style>