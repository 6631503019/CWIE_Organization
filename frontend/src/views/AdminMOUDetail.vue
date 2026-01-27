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
            <div class="org-status" :class="{ 'active': mou.status === 'Active', 'inactive': mou.status === 'Inactive' }">{{ mou.status }}</div>
            <div class="org-duration">{{ mou.duration }}</div>
            
            <!-- Details Button -->
            <div class="details-section">
              <span class="details-text">Details</span>
              <div class="details-arrow"></div>
            </div>
            
            <!-- Edit Icon -->
            <div class="edit-icon" @click.stop="editMOU(mou)">
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
          <div class="org-status" :class="{ 'active': mou.status === 'Active', 'inactive': mou.status === 'Inactive' }">{{ mou.status }}</div>
          <div class="org-duration">{{ mou.duration }}</div>
          
          <!-- Details Button -->
          <div class="details-section">
            <span class="details-text">Details</span>
            <div class="details-arrow"></div>
          </div>
          
          <!-- Edit Icon -->
          <div class="edit-icon" @click.stop="editMOU(mou)">
            <div class="pencil-icon"></div>
          </div>
        </div>
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
import { useRouter, useRoute } from 'vue-router'
import AdminNavbar from '../components/AdminNavbar.vue'
import Pagination from '../components/Pagination.vue'
import OrganizationEditModal from '../components/OrganizationEditModal.vue'
import { organizationAPI, mouAPI } from '../services/api'

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

// Modal state
const showEditModal = ref(false)
const editingOrgId = ref<string | null>(null)
const editingTab = ref<'organization' | 'review' | 'mou'>('organization')

// MOU data from backend
const allMous = ref<any[]>([])

// Computed for filtered MOUs
const filteredMous = computed(() => {
  let filtered = allMous.value
  
  if (searchText.value.trim()) {
    const search = searchText.value.toLowerCase()
    filtered = filtered.filter(mou => 
      mou.name.toLowerCase().includes(search) ||
      (mou.status && mou.status.toLowerCase().includes(search))
    )
  }
  
  if (selectedStatus.value && selectedStatus.value !== 'All') {
    filtered = filtered.filter(mou => mou.status === selectedStatus.value)
  }
  
  return filtered
})

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

// Check if MOU document is PDF
const isMOUDocumentPDF = computed(() => {
  if (!mouDocumentImage.value) return false
  const url = mouDocumentImage.value.toLowerCase()
  return url.endsWith('.pdf') || url.includes('.pdf')
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

const closeDetail = () => {
  router.push('/admin/mou')
}

const viewFullDetails = () => {
  if (selectedMou.value) {
    router.push(`/admin/mou/${selectedMou.value.id}/more`)
  }
}

const editMOU = (mou: any) => {
  // Open edit modal with organization data
  editingOrgId.value = mou.id
  editingTab.value = 'organization'
  showEditModal.value = true
}

const handleModalSaved = async () => {
  // Refresh data after save
  await fetchOrganizations()
  if (route.params.id) {
    await fetchMOUDocument(route.params.id as string)
  }
}

// Fetch Organizations data (for displaying org cards with logos)
const fetchOrganizations = async () => {
  try {
    const response = await organizationAPI.getAll({ limit: 100, public: 'false' })
    
    // Get all MOUs to match with organizations (both published and not published)
    const mouResponse = await mouAPI.getAll({ limit: 100 })
    const mouMap = new Map()
    mouResponse.data.data.forEach((mou: any) => {
      const orgId = mou.organization_id?._id || mou.organization_id
      mouMap.set(String(orgId), mou)
    })
    
    allMous.value = response.data.data
      .filter((item: any) => {
        // Only show organizations that have MOU
        const mou = mouMap.get(item._id)
        return mou !== undefined
      })
      .map((item: any) => {
        const mou = mouMap.get(item._id)
        let durationText = 'N/A'
        let statusText = 'Inactive'
        
        // Use Organization.is_public for status instead of MOU.is_published
        const isPublic = item.is_public
        if (isPublic === true || isPublic === 'true' || isPublic === 1 || isPublic === '1') {
          statusText = 'Active'
        } else {
          statusText = 'Inactive'
        }
        
        if (mou) {
          // Format dates if available
          if (mou.start_date && mou.end_date) {
            const startDate = new Date(mou.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
            const endDate = new Date(mou.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
            durationText = `Start: ${startDate} End: ${endDate}`
          }
        }
        
        // Normalize logo path: replace backslashes with forward slashes and ensure leading slash
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
          status: statusText,
          duration: durationText,
          logo: logoUrl
        }
      })
    
    console.log('Organizations loaded for MOU detail:', allMous.value.length, 'items')
  } catch (error: any) {
    state.error = error.response?.data?.message || 'Failed to load organizations'
    console.error('Loading error:', error)
    throw error
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
      mouDocumentImage.value = `http://localhost:5000${mou.mou_path}`
      console.log('MOU document URL set to:', mouDocumentImage.value)
    } else {
      console.log('No MOU found for this organization')
      mouDocumentImage.value = ''
    }
  } catch (error) {
    console.error('Error loading MOU document:', error)
    mouDocumentImage.value = ''
  }
}

onMounted(async () => {
  console.log('AdminMOUDetail mounted for ID:', route.params.id)
  state.loading = true
  
  try {
    await fetchOrganizations()
    
    // Fetch MOU document if we have organization ID
    if (route.params.id) {
      await fetchMOUDocument(route.params.id as string)
    }
    
    // Setup refresh interval
    state.refreshInterval = window.setInterval(async () => {
      try {
        await fetchOrganizations()
        if (route.params.id) {
          await fetchMOUDocument(route.params.id as string)
        }
      } catch (err) {
        console.error('Auto-refresh error:', err)
      }
    }, 60000) // Every minute
    
  } catch (error) {
    // Error already handled in fetchOrganizations
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
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  background: #f9f9f9;
  border-radius: 8px;
}

.placeholder-icon {
  width: 60px;
  height: 60px;
  background: #d0d0d0;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z'/%3E%3C/svg%3E") no-repeat center;
  mask-size: contain;
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

.bottom-mou-cards {
  position: absolute;
  width: 564px;
  height: 200px;
  left: 270px;
  top: 1193px;
  display: flex;
  gap: 64px;
}

/* Pagination Wrapper */
.mou-pagination-wrapper {
  position: absolute;
  left: 453px;
  top: 1090px;
  width: 218px;
  height: 28px;
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