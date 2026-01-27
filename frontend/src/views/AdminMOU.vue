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
          <div class="org-status" :class="{ 'active': mou.status === 'Active', 'inactive': mou.status === 'Inactive' }">{{ mou.status }}</div>
          <div class="org-duration">{{ mou.duration }}</div>
          
          <!-- Details Button -->
          <div class="details-section">
            <span class="details-text">Details</span>
            <div class="details-arrow"></div>
          </div>
          
          <!-- Edit Icon -->
          <div class="edit-icon" @click="editMOU($event, mou)">
            <div class="pencil-icon"></div>
          </div>
        </div>
      </div>
      
      <!-- Pagination Component -->
      <div class="mou-pagination-container">
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
    
    <!-- Edit Modal -->
    <OrganizationEditModal 
      v-model="showEditModal"
      :organization-id="editingOrgId"
      :initial-tab="editingTab"
      @saved="handleModalSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import AdminNavbar from '../components/AdminNavbar.vue'
import Pagination from '../components/Pagination.vue'
import OrganizationEditModal from '../components/OrganizationEditModal.vue'
import { organizationAPI, mouAPI } from '../services/api'

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

// Modal state
const showEditModal = ref(false)
const editingOrgId = ref<string | null>(null)
const editingTab = ref<'organization' | 'review' | 'mou'>('organization')

// Organization data from backend (แสดงเป็น MOU cards)
const mous = ref<any[]>([])

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

const editMOU = (event: Event, mou: any) => {
  event.stopPropagation() // Prevent card click
  editingOrgId.value = mou.id
  editingTab.value = 'organization'
  showEditModal.value = true
}

const handleModalSaved = async () => {
  // Refresh data after save
  console.log('Modal saved - refreshing data...')
  state.loading = true
  
  // Small delay to ensure backend has processed the update
  await new Promise(resolve => setTimeout(resolve, 300))
  
  try {
    await fetchOrganizations()
    console.log('Data refreshed successfully')
  } catch (error) {
    console.error('Error refreshing data:', error)
  } finally {
    state.loading = false
  }
}

// Fetch organizations data
const fetchOrganizations = async () => {
  try {
    // Get all organizations including non-public ones (for admin)
    const response = await organizationAPI.getAll({ limit: 100, public: 'false' })
    console.log('🔍 Organization API response:', response.data)
    console.log('🔍 Organizations array:', response.data.data)
    console.log('🔍 Organizations count:', response.data.data?.length)
    
    // Get all MOUs (both published and not published)
    const mouResponse = await mouAPI.getAll({ limit: 100 })
    console.log('All MOUs:', mouResponse.data.data)
    
    // Create map of MOUs by organization_id (filter out null organization_id)
    const mouMap = new Map()
    mouResponse.data.data
      .filter((mou: any) => {
        // Filter out MOUs with null or undefined organization_id
        const orgId = mou.organization_id?._id || mou.organization_id
        if (!orgId || orgId === null || orgId === undefined) {
          console.log('⚠️ Skipping MOU with null organization_id:', mou._id)
          return false
        }
        return true
      })
      .forEach((mou: any) => {
        const orgId = mou.organization_id?._id || mou.organization_id
        console.log(`MOU organization_id: ${orgId}, is_published: ${mou.is_published}`)
        mouMap.set(String(orgId), mou)
      })
    
    console.log('MOU Map keys:', Array.from(mouMap.keys()))
    console.log('Organization IDs:', response.data.data.map((o: any) => o._id))
    
    // Filter and map organizations that have MOUs
    mous.value = response.data.data
      .filter((item: any) => {
        const hasMOU = mouMap.has(String(item._id))
        console.log(`Org ${item.name_en} (${item._id}): has MOU = ${hasMOU}`)
        return hasMOU
      })
      .map((item: any) => {
        const mou = mouMap.get(String(item._id))
        let durationText = 'N/A'
        let statusText = 'Inactive'
        
        // Use Organization.is_public for status instead of MOU.is_published
        const isPublic = item.is_public
        console.log(`Organization ${item.name_en}: is_public value =`, isPublic, `(type: ${typeof isPublic})`)
        
        // Check organization public status
        if (isPublic === true || isPublic === 'true' || isPublic === 1 || isPublic === '1') {
          statusText = 'Active'
        } else {
          statusText = 'Inactive'
        }
        
        console.log(`Final status for ${item.name_en}: ${statusText}`)
        
        if (mou) {
          console.log(`MOU for ${item.name_en}: is_published =`, mou.is_published)
          
          // Format dates if available
          if (mou.start_date && mou.end_date) {
            const startDate = new Date(mou.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
            const endDate = new Date(mou.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
            durationText = `Start: ${startDate} End: ${endDate}`
          }
        }
        
        console.log(`Final MOU for ${item.name_en}: is_published=${mou?.is_published}, status=${statusText}`)
        
        // Normalize logo path: replace backslashes with forward slashes and ensure leading slash
        let logoPath = item.logo_path
        if (logoPath) {
          logoPath = logoPath.replace(/\\/g, '/')
          if (!logoPath.startsWith('/')) {
            logoPath = '/' + logoPath
          }
        }
        const logoUrl = logoPath ? `http://localhost:5000${logoPath}` : '/api/placeholder/95/95'
        console.log(`Logo URL for ${item.name_en}:`, logoUrl, 'Raw path:', item.logo_path)
        
        return {
          id: item._id,
          name: item.name_en || item.name_th || 'No Name',
          status: statusText,
          duration: durationText,
          logo: logoUrl
        }
      })
    console.log('Organizations loaded:', mous.value.length, 'items')
  } catch (error: any) {
    state.error = error.response?.data?.message || 'Failed to load organizations'
    console.error('Loading error:', error)
    throw error
  }
}

// Lifecycle hooks
onMounted(async () => {
  console.log('AdminMOU mounted')
  state.loading = true
  
  try {
    await fetchOrganizations()
    
    // Setup auto-refresh
    state.autoRefreshInterval = window.setInterval(async () => {
      try {
        await fetchOrganizations()
      } catch (err) {
        console.error('Auto-refresh error:', err)
      }
    }, 30000) // Every 30 seconds
    
  } catch (error) {
    // Error already handled in fetchOrganizations
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
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-title {
  margin: 0 0 20px 0;
  
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 40px;
  line-height: 50px;
  color: #000000;
}

.search-filter-section {
  width: 100%;
  max-width: 1135px;
  background: #FFFFFF;
  box-shadow: 0px 4px 4px rgba(118, 118, 118, 0.5);
  border-radius: 8px;
  margin-bottom: 20px;
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
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 0px;
  gap: 42px;
  flex-wrap: wrap;
  margin-bottom: 30px;
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

/* MOU Pagination Container */
.mou-pagination-container {
  position: absolute;
  left: 1090px;
  top: 560px;
  width: 218px;
  height: 28px;
}
</style>