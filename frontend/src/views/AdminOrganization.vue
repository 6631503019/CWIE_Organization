<template>
  <div class="admin-organization">
    <!-- AdminNavbar component -->
    <AdminNavbar />
    
    <!-- Main content -->
    <div class="main-content">
      <!-- Header Section -->
      <div class="header-section">
        <!-- Organization Title -->
        <div class="organization-title">Organization</div>
        
        <!-- Add Organization Button -->
        <div class="add-org-btn" @click="addOrganization">
          <div class="plus-icon"></div>
          <span class="button-text">Add Organization</span>
        </div>
      </div>
      
      
      <!-- Filter Section -->
      <div class="filter-section">
        <!-- Filter Organization title -->
        <div class="filter-title">Filter Organization</div>
        
        <!-- Search bar -->
        <div class="search-container">
          <input 
            type="text" 
            placeholder="Text Search (Name, Tags)"
            class="search-input"
            v-model="searchText"
          />
        </div>
        
        <!-- Dropdowns grid -->
        <div class="dropdowns-grid">
          <!-- Organization Type dropdown -->
          <div class="dropdown-container org-type">
            <div class="dropdown-header" @click="toggleDropdown('orgType')">
              <span class="dropdown-text">--Organization Type--</span>
              <div class="dropdown-arrow"></div>
            </div>
            <div v-if="dropdowns.orgType" class="dropdown-options">
              <div class="dropdown-option" v-for="option in orgTypeOptions" :key="option" @click="selectOption('orgType', option)">
                {{ option }}
              </div>
            </div>
          </div>
          
          <!-- Industry Category dropdown -->
          <div class="dropdown-container industry-cat">
            <div class="dropdown-header" @click="toggleDropdown('industryCat')">
              <span class="dropdown-text">--Industry Category--</span>
              <div class="dropdown-arrow"></div>
            </div>
            <div v-if="dropdowns.industryCat" class="dropdown-options">
              <div class="dropdown-option" v-for="option in industryCatOptions" :key="option" @click="selectOption('industryCat', option)">
                {{ option }}
              </div>
            </div>
          </div>
          
          <!-- Country dropdown -->
          <div class="dropdown-container country">
            <div class="dropdown-header" @click="toggleDropdown('country')">
              <span class="dropdown-text">---Country---</span>
              <div class="dropdown-arrow"></div>
            </div>
            <div v-if="dropdowns.country" class="dropdown-options">
              <div class="dropdown-option" v-for="option in countryOptions" :key="option" @click="selectOption('country', option)">
                {{ option }}
              </div>
            </div>
          </div>
          
          <!-- Geography dropdown -->
          <div class="dropdown-container geography">
            <div class="dropdown-header" @click="toggleDropdown('geography')">
              <span class="dropdown-text">--Geography--</span>
              <div class="dropdown-arrow"></div>
            </div>
            <div v-if="dropdowns.geography" class="dropdown-options">
              <div class="dropdown-option" v-for="option in geographyOptions" :key="option" @click="selectOption('geography', option)">
                {{ option }}
              </div>
            </div>
          </div>
          
          <!-- Province dropdown -->
          <div class="dropdown-container province">
            <div class="dropdown-header" @click="toggleDropdown('province')">
              <span class="dropdown-text">--Province--</span>
              <div class="dropdown-arrow"></div>
            </div>
            <div v-if="dropdowns.province" class="dropdown-options">
              <div class="dropdown-option" v-for="option in provinceOptions" :key="option" @click="selectOption('province', option)">
                {{ option }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Filter buttons -->
        <div class="filter-buttons">
          <button class="reset-btn" @click="resetFilters">Reset</button>
          <button class="search-btn" @click="searchOrganizations">search</button>
        </div>
      </div>
      
      <!-- Organizations Table -->
      <div class="table-container">
        <!-- Table header -->
        <div class="table-header">
          <div class="header-status">status</div>
          <div class="header-organization">Organization</div>
          <div class="header-category">Category</div>
          <div class="header-province">Province</div>
          <div class="header-created">Created when</div>
          <div class="header-edited">Edited on</div>
        </div>
        
        <!-- Table rows -->
        <div v-for="org in paginatedOrganizations" :key="org.id" class="table-row">
          <!-- Status indicator -->
          <div class="status-indicator" :class="org.status"></div>
          
          <!-- Organization name -->
          <div class="org-name">{{ org.name }}</div>
          
          <!-- Category -->
          <div class="org-category">{{ org.category }}</div>
          
          <!-- Province -->
          <div class="org-province">{{ org.province }}</div>
          
          <!-- Created date -->
          <div class="org-created">{{ org.createdDate }}</div>
          
          <!-- Edited date -->
          <div class="org-edited">{{ org.editedDate }}</div>
          
          <!-- Action buttons -->
          <div class="action-buttons">
            <div class="edit-btn" @click="editOrganization(org.id)" :disabled="state.loading"></div>
            <div class="delete-btn" @click="deleteOrganization(org.id)" :disabled="state.loading"></div>
            <div class="document-btn" @click="viewDocument(org.id)"></div>
          </div>
        </div>
      </div>
      
      <!-- Pagination -->
      <Pagination 
        :current-page="state.currentPage"
        :total-pages="paginationInfo.totalPages"
        :total-items="paginationInfo.totalItems"
        :loading="state.loading"
        :show-info="false"
        @page-change="handlePageChange"
      />
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="delete-modal-overlay">
      <div class="delete-modal-container">
        <div class="modal-header">
          <h3>Confirm Delete</h3>
        </div>
        
        <div class="modal-body">
          <p>Are you sure you want to delete this organization?</p>
          <div class="organization-info">
            <strong>{{ selectedOrganization?.name }}</strong>
          </div>
        </div>
        
        <div class="modal-actions">
          <button class="cancel-btn" @click="cancelDelete">Cancel</button>
          <button class="confirm-delete-btn" @click="confirmDelete">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, reactive } from 'vue'
import AdminNavbar from '../components/AdminNavbar.vue'
import Pagination from '../components/Pagination.vue'

// Reactive state management
const state = reactive({
  loading: false,
  error: null as string | null,
  currentPage: 1,
  itemsPerPage: 5
})

// Search and filter data
const searchText = ref('')
const showDeleteModal = ref(false)
const selectedOrganization = ref<any>(null)
const dropdowns = ref({
  orgType: false,
  industryCat: false,
  country: false,
  geography: false,
  province: false
})

// Filter selections
const selectedFilters = reactive({
  orgType: 'All',
  industryCat: 'All',
  country: 'All',
  geography: 'All',
  province: 'All'
})

// Dropdown options
const orgTypeOptions = ['All', 'Company', 'Government', 'School']
const industryCatOptions = [
  'All', 
  'School of Applied Digital Technology',
  'Agriculture and Food Products',
  'Automotive and Transportation Equipment',
  'Banking, Finance and Insurance',
  'Business Services',
  'Energy',
  'Healthcare',
  'Information and Communication Technology',
  'Manufacturing and Industrial Products',
  'Mining and Metal Products',
  'Petrochemicals and Chemicals',
  'Textile and Garments',
  'Tourism and Hospitality',
  'Trading and Distribution',
  'Transportation and Logistics',
  'Utilities'
]
const countryOptions = ['Thailand', 'USA', 'Japan', 'China', 'Others']
const geographyOptions = ['Central Region', 'Northern Region', 'Northeastern Region', 'Southern Region', 'Eastern Region', 'Western Region']
const provinceOptions = [
  'Bangkok', 'Chiang Rai', 'Chiang Mai', 'Phuket', 'Pattaya', 'Khon Kaen', 
  'Nakhon Ratchasima', 'Udon Thani', 'Songkhla', 'Rayong', 'Samut Prakan', 
  'Nonthaburi', 'Pathum Thani', 'Hat Yai', 'Lopburi'
]

// Organizations data
const allOrganizations = ref([
  {
    id: 1,
    status: 'inactive',
    name: 'District Educational Service A...',
    category: 'government',
    province: 'Bangkok',
    createdDate: '2025-10-23',
    editedDate: '2025-10-23'
  },
  {
    id: 2,
    status: 'inactive',
    name: 'TVD Holdings Public Compan...',
    category: 'individual',
    province: 'Bangkok',
    createdDate: '2025-09-23',
    editedDate: '2025-10-23'
  },
  {
    id: 3,
    status: 'active',
    name: 'Excellent Business Corporation International (E B C I) Ltd.',
    category: 'individual',
    province: 'Bangkok',
    createdDate: '2025-10-23',
    editedDate: '2025-10-23'
  },
  {
    id: 4,
    status: 'active',
    name: 'SUNSU',
    category: 'individual',
    province: 'Bangkok',
    createdDate: '2025-10-23',
    editedDate: '2025-10-23'
  },
  {
    id: 5,
    status: 'active',
    name: 'Mae fah luang university',
    category: 'School of Applied Digital Technology',
    province: 'Chiang Rai',
    createdDate: '2025-10-23',
    editedDate: '2025-10-23'
  }
])

// Computed properties for reactive filtering
const filteredOrganizations = computed(() => {
  let filtered = allOrganizations.value
  
  // Search filter
  if (searchText.value.trim()) {
    const search = searchText.value.toLowerCase()
    filtered = filtered.filter(org => 
      org.name.toLowerCase().includes(search) ||
      org.category.toLowerCase().includes(search) ||
      org.province.toLowerCase().includes(search)
    )
  }
  
  // Dropdown filters
  if (selectedFilters.orgType !== 'All') {
    filtered = filtered.filter(org => org.category === selectedFilters.orgType)
  }
  
  if (selectedFilters.province !== 'All') {
    filtered = filtered.filter(org => org.province === selectedFilters.province)
  }
  
  return filtered
})

// Paginated organizations
const paginatedOrganizations = computed(() => {
  const start = (state.currentPage - 1) * state.itemsPerPage
  const end = start + state.itemsPerPage
  return filteredOrganizations.value.slice(start, end)
})

// Pagination info
const totalPages = computed(() => 
  Math.ceil(filteredOrganizations.value.length / state.itemsPerPage)
)

const paginationInfo = computed(() => ({
  currentPage: state.currentPage,
  totalPages: totalPages.value,
  totalItems: filteredOrganizations.value.length,
  hasNext: state.currentPage < totalPages.value,
  hasPrev: state.currentPage > 1
}))

// Pagination computed properties
const visiblePages = computed(() => {
  const pages = []
  const total = paginationInfo.value.totalPages
  const current = state.currentPage
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...', total)
    } else if (current >= total - 3) {
      pages.push(1, '...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1, '...', current - 1, current, current + 1, '...', total)
    }
  }
  
  return pages
})

const handlePageChange = async (page: number) => {
  if (page >= 1 && page <= paginationInfo.value.totalPages && !state.loading) {
    state.loading = true
    try {
      state.currentPage = page
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 100))
    } finally {
      state.loading = false
    }
  }
}

// Watchers for reactive updates
watch(searchText, () => {
  state.currentPage = 1 // Reset to first page when searching
})

watch(selectedFilters, () => {
  state.currentPage = 1 // Reset to first page when filtering
}, { deep: true })

// Methods
const toggleDropdown = (dropdown: string) => {
  dropdowns.value[dropdown as keyof typeof dropdowns.value] = !dropdowns.value[dropdown as keyof typeof dropdowns.value]
  
  // Close other dropdowns
  Object.keys(dropdowns.value).forEach(key => {
    if (key !== dropdown) {
      dropdowns.value[key as keyof typeof dropdowns.value] = false
    }
  })
}

const selectOption = (dropdown: string, option: string) => {
  selectedFilters[dropdown as keyof typeof selectedFilters] = option
  dropdowns.value[dropdown as keyof typeof dropdowns.value] = false
}

const resetFilters = () => {
  searchText.value = ''
  Object.keys(selectedFilters).forEach(key => {
    selectedFilters[key as keyof typeof selectedFilters] = 'All'
  })
  state.currentPage = 1
}

const searchOrganizations = () => {
  // Search is reactive via computed property
  console.log('Searching:', filteredOrganizations.value.length, 'results')
}

const addOrganization = async () => {
  state.loading = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Add organization clicked')
  } catch (error) {
    state.error = 'Failed to add organization'
  } finally {
    state.loading = false
  }
}

const editOrganization = async (id: number) => {
  const org = allOrganizations.value.find(o => o.id === id)
  if (org) {
    console.log('Edit organization:', org)
  }
}

const deleteOrganization = (id: number) => {
  const org = allOrganizations.value.find(o => o.id === id)
  if (org) {
    selectedOrganization.value = org
    showDeleteModal.value = true
  }
}

const cancelDelete = () => {
  showDeleteModal.value = false
  selectedOrganization.value = null
}

const confirmDelete = async () => {
  if (selectedOrganization.value) {
    state.loading = true
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Remove from array
      const index = allOrganizations.value.findIndex(org => org.id === selectedOrganization.value.id)
      if (index > -1) {
        allOrganizations.value.splice(index, 1)
      }
    } catch (error) {
      state.error = 'Failed to delete organization'
    } finally {
      state.loading = false
      showDeleteModal.value = false
      selectedOrganization.value = null
    }
  }
}

const viewDocument = (id: number) => {
  const org = allOrganizations.value.find(o => o.id === id)
  if (org) {
    console.log('View document for organization:', org)
    // Navigate to document or open modal
  }
}

// Lifecycle hooks
let intervalId: number | null = null

onMounted(async () => {
  console.log('AdminOrganization mounted')
  state.loading = true
  
  try {
    // Simulate API data loading
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Data loaded:', allOrganizations.value.length, 'organizations')
    
    // Setup auto-refresh (example)
    intervalId = window.setInterval(() => {
      console.log('Auto-refresh check...')
    }, 30000) // Every 30 seconds
    
  } catch (error) {
    state.error = 'Failed to load organizations'
    console.error('Loading error:', error)
  } finally {
    state.loading = false
  }
})

onBeforeUnmount(() => {
  console.log('AdminOrganization unmounting - cleaning up')
  if (intervalId) {
    clearInterval(intervalId)
  }
  // Close any open dropdowns
  Object.keys(dropdowns.value).forEach(key => {
    dropdowns.value[key as keyof typeof dropdowns.value] = false
  })
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600&family=Inter:wght@400;500;600;700&family=DM+Sans:wght@400;500&display=swap');

/* Main container */
.admin-organization {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #F6F7F8;
  overflow-x: auto;
  display: flex;
}

/* Main content area */
.main-content {
  position: relative;
  width: calc(100vw - 232px);
  min-width: 1200px;
  height: 100vh;
  background: #F6F7F8;
  margin-left: 232px;
  padding: 30px 50px;
  box-sizing: border-box;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* Header Section */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1113px;
  margin-bottom: 30px;
  position: relative;
}

/* Organization title */
.organization-title {
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 600;
  font-size: 40px;
  line-height: 50px;
  color: #000000;
  margin: 0;
}

/* Line separator */
.line-21 {
  display: none;
}

/* Filter section container */
.filter-section {
  position: relative;
  width: 100%;
  max-width: 1080px;
  background: #FFFFFF;
  box-shadow: 0px 4px 4px rgba(118, 118, 118, 0.5);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

/* Filter title */
.filter-title {
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 600;
  font-size: 20px;
  line-height: 25px;
  color: #000000;
  margin-bottom: 20px;
}

/* Search input container */
.search-container {
  width: 100%;
  margin-bottom: 20px;
}

.search-input {
  box-sizing: border-box;
  width: 100%;
  height: 35px;
  background: #FFFFFF;
  border: 1px solid #B1B1B1;
  border-radius: 8px;
  padding: 0 14px;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  color: #000000;
}

.search-input::placeholder {
  color: #B1B1B1;
}

/* Dropdown containers */
.dropdown-container {
  position: relative;
  z-index: 10;
  margin-bottom: 15px;
}

.dropdowns-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.dropdown-container.org-type,
.dropdown-container.industry-cat {
  grid-column: span 1;
}

.dropdown-container.country,
.dropdown-container.geography,
.dropdown-container.province {
  grid-column: span 1;
}

.dropdown-header {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 7px;
  width: 100%;
  height: 32px;
  background: #FFFFFF;
  border: 1px solid #B1B1B1;
  border-radius: 8px;
  cursor: pointer;
}

.dropdown-text {
  font-family: 'Inter';
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
  clip-path: polygon(50% 100%, 0 0, 100% 0);
}

.dropdown-options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #FFFFFF;
  border: 1px solid #B1B1B1;
  border-top: none;
  border-radius: 0 0 8px 8px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 20;
}

.dropdown-option {
  display: flex;
  align-items: center;
  padding: 10px;
  height: 30px;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  color: #000000;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
}

.dropdown-option:hover {
  background: #f8f8f8;
}

.dropdown-option:last-child {
  border-bottom: none;
}

/* Filter buttons */
.filter-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  align-items: center;
}

.reset-btn {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 5px 16px;
  background: #FFFFFF;
  border: 1px solid #B1B1B1;
  border-radius: 20px;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 17px;
  color: #000000;
  cursor: pointer;
}

.search-btn {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 5px 16px;
  background: #AB1C03;
  border: none;
  border-radius: 20px;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 17px;
  color: #FFFFFF;
  cursor: pointer;
}

/* Add Organization Button */
.add-org-btn {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 6px 10px;
  gap: 6px;
  width: 166px;
  height: 32px;
  background: #C70000;
  border-radius: 6px;
  cursor: pointer;
  flex-shrink: 0;
}

.plus-icon {
  width: 20px;
  height: 20px;
  position: relative;
}

.plus-icon::before,
.plus-icon::after {
  content: '';
  position: absolute;
  background: #FFFFFF;
  border-radius: 1px;
}

.plus-icon::before {
  width: 12px;
  height: 2px;
  left: 4px;
  top: 9px;
}

.plus-icon::after {
  width: 2px;
  height: 12px;
  left: 9px;
  top: 4px;
}

.button-text {
  width: 115px;
  height: 20px;
  font-family: 'DM Sans';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #FFFFFF;
}

/* Table container */
.table-container {
  position: relative;
  width: 100%;
  max-width: 1113px;
  min-height: 411px;
  background: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 12px;
  overflow-x: auto;
  margin-bottom: 30px;
  flex-shrink: 0;
}

/* Table header */
.table-header {
  position: relative;
  width: 100%;
  height: 67px;
  background: #FFFFFF;
  border-bottom: 1px solid #000000;
}

.header-status {
  position: absolute;
  width: 64px;
  height: 39.73px;
  left: 5px;
  top: 11.92px;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 19px;
  color: #000000;
}

.header-organization {
  position: absolute;
  width: 102px;
  height: 39.73px;
  left: 86px;
  top: 11.92px;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 19px;
  color: #000000;
}

.header-category {
  position: absolute;
  width: 76px;
  height: 39.73px;
  left: 342px;
  top: 11.92px;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 19px;
  color: #000000;
}

.header-province {
  position: absolute;
  width: 69px;
  height: 39.73px;
  left: 554px;
  top: 11.92px;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 19px;
  color: #000000;
}

.header-created {
  position: absolute;
  width: 111px;
  height: 39.73px;
  left: 728px;
  top: 11.92px;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 19px;
  color: #000000;
}

.header-edited {
  position: absolute;
  width: 78px;
  height: 16.14px;
  left: 860px;
  top: 11.92px;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 19px;
  color: #000000;
}

/* Table rows */
.table-row {
  position: relative;
  width: 100%;
  height: 70px;
  background: #FFFFFF;
  border-bottom: 1px solid #000000;
}



/* Status indicators */
.status-indicator {
  position: absolute;
  width: 17.12px;
  height: 21.26px;
  left: 14.43px;
  top: 24px;
  border-radius: 50%;
}

.status-indicator.active {
  background: #00FF5E;
}

.status-indicator.inactive {
  background: #FF0000;
}

/* Organization name */
.org-name {
  position: absolute;
  width: 214.04px;
  height: 32.95px;
  left: 84.76px;
  top: 18px;
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 400;
  font-size: 15px;
  line-height: 19px;
  color: #000000;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Category */
.org-category {
  position: absolute;
  width: 171.23px;
  height: 39.33px;
  left: 342px;
  top: 15px;
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 400;
  font-size: 15px;
  line-height: 19px;
  color: #000000;
}

/* Province */
.org-province {
  position: absolute;
  width: 78px;
  height: 19.87px;
  left: 554px;
  top: 25px;
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 400;
  font-size: 15px;
  line-height: 19px;
  color: #000000;
}

/* Created date */
.org-created {
  position: absolute;
  width: 85.62px;
  height: 22.32px;
  left: 729.44px;
  top: 23px;
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 400;
  font-size: 15px;
  line-height: 19px;
  color: #000000;
}

/* Edited date */
.org-edited {
  position: absolute;
  width: 85.62px;
  height: 22.32px;
  left: 858px;
  top: 23px;
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 400;
  font-size: 15px;
  line-height: 19px;
  color: #000000;
}

/* Action buttons */
.action-buttons {
  position: absolute;
  right: 20px;
  top: 20px;
  display: flex;
  gap: 20px;
  align-items: center;
}

.edit-btn, .delete-btn, .document-btn {
  width: 20px;
  height: 20px;
  cursor: pointer;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.edit-btn {
  background-color: #666;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z'/%3E%3C/svg%3E") no-repeat center;
  mask-size: contain;
}

.delete-btn {
  background-color: #ff4444;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z'/%3E%3C/svg%3E") no-repeat center;
  mask-size: contain;
}

.document-btn {
  background-color: #4CAF50;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z'/%3E%3C/svg%3E") no-repeat center;
  mask-size: contain;
}

/* Additional responsive styles */
.org-type {
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Inter';
  font-weight: 500;
  font-size: 12px;
  text-transform: uppercase;
}

.org-type.government {
  background: #E3F2FD;
  color: #1976D2;
}

.org-type.private {
  background: #F3E5F5;
  color: #7B1FA2;
}

.org-type.ngo {
  background: #E8F5E8;
  color: #388E3C;
}

.org-type.educational {
  background: #FFF3E0;
  color: #F57C00;
}

.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Inter';
  font-weight: 500;
  font-size: 12px;
  text-transform: capitalize;
}

.status.active {
  background: #E8F5E8;
  color: #2E7D32;
}

.status.inactive {
  background: #FFEBEE;
  color: #C62828;
}

.status.pending {
  background: #FFF3E0;
  color: #EF6C00;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-action {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
}

.btn-action.edit {
  background: #E3F2FD;
  color: #1976D2;
}

.btn-action.view {
  background: #F3E5F5;
  color: #7B1FA2;
}

.btn-action.delete {
  background: #FFEBEE;
  color: #C62828;
}

.btn-action:hover {
  opacity: 0.8;
}

/* Responsive */
@media (max-width: 1200px) {
  .main-content {
    margin-left: 200px;
  }
}

/* Delete Modal Styles - Following Figma Design */
.delete-modal-overlay {
  position: fixed;
  width: 100vw;
  height: 100vh;
  left: 0px;
  top: 0px;
  background: rgba(84, 84, 84, 0.5);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.delete-modal-container {
  position: relative;
  width: 450px;
  min-height: 300px;
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15);
  padding: 30px;
  box-sizing: border-box;
}

.modal-header {
  margin-bottom: 25px;
}

.modal-header h3 {
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 600;
  font-size: 24px;
  line-height: 30px;
  color: #000000;
  margin: 0;
}

.modal-body {
  margin-bottom: 35px;
}

.modal-body p {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 20px;
  color: #545454;
  margin: 0 0 15px 0;
}

.organization-info {
  padding: 15px;
  background: #F8F9FA;
  border-radius: 8px;
  border-left: 4px solid #C70000;
}

.organization-info strong {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 20px;
  color: #000000;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

.cancel-btn {
  background: #FFFFFF;
  color: #545454;
  border: 1px solid #B1B1B1;
  border-radius: 6px;
  padding: 10px 20px;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn:hover {
  background: #F8F9FA;
  border-color: #999999;
}

.confirm-delete-btn {
  background: #C70000;
  color: #FFFFFF;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.confirm-delete-btn:hover {
  background: #AB1C03;
}

/* Modal Animation */
.delete-modal-overlay {
  animation: fadeIn 0.3s ease-out;
}

.delete-modal-container {
  animation: slideIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { 
    opacity: 0;
    transform: translateY(-30px) scale(0.9);
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 180px;
    padding: 20px;
  }
  
  .organization-controls {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .search-box {
    width: 100%;
  }
  
  .organizations-table {
    font-size: 12px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>