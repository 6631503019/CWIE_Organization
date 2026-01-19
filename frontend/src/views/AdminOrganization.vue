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

    <!-- Add Organization Modal -->
    <div v-if="state.showAddModal" class="modal-overlay" @click="closeModal">
      <div class="add-org-modal" :class="`${state.activeTab}-active`" @click.stop>
        <!-- Right side tabs -->
        <div class="modal-tabs">
          <div 
            class="tab-item"
            :class="{ active: state.activeTab === 'organization' }"
            @click="switchTab('organization')"
          >
            <span>Organization</span>
          </div>
          <div 
            class="tab-item"
            :class="{ active: state.activeTab === 'review' }"
            @click="switchTab('review')"
          >
            <span>Review</span>
          </div>
          <div 
            class="tab-item"
            :class="{ active: state.activeTab === 'mou' }"
            @click="switchTab('mou')"
          >
            <span>MOU</span>
          </div>
        </div>

        <!-- Modal Content -->
        <div class="modal-content">
          <!-- Organization Tab -->
          <div v-if="state.activeTab === 'organization'" class="organization-tab">
            <h2 class="modal-title">Add Organization</h2>
            <div class="form-divider"></div>
            
            <!-- Logo Upload -->
            <div class="logo-upload-section">
              <div class="upload-area">
                <div class="upload-icon"></div>
                <input type="file" @change="handleLogoUpload" accept="image/*" class="file-input" />
              </div>
              <span class="upload-text">Upload logo here</span>
            </div>
            
            <!-- Form Fields -->
            <div class="form-row">
              <div class="form-group">
                <label>Organization Name(TH)*</label>
                <input type="text" v-model="formData.organizationNameTH" />
              </div>
              <div class="form-group">
                <label>Organization Name(EN)*</label>
                <input type="text" v-model="formData.organizationNameEN" />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Address(TH)*</label>
                <textarea class="textarea-md" v-model="formData.addressTH"></textarea>
              </div>
              <div class="form-group">
                <label>Address(EN)*</label>
                <textarea class="textarea-md" v-model="formData.addressEN"></textarea>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group full-width">
                <label>Organization Type*</label>
                <select v-model="formData.organizationType">
                  <option value="">--Organization Type--</option>
                  <option value="NGO">NGO</option>
                  <option value="government">Government</option>
                  <option value="individual">Individual</option>
                  <option value="school">School</option>
                </select>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group full-width">
                <label>Industry Category*</label>
                <select v-model="formData.industryCategory">
                  <option value="">--Industry Category--</option>
                  <option value="technology">Technology</option>
                  <option value="education">Education</option>
                  <option value="healthcare">Healthcare</option>
                </select>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Country*</label>
                <select v-model="formData.country">
                  <option value="">---Country---</option>
                  <option value="Thailand">Thailand</option>
                  <option value="USA">USA</option>
                  <option value="Japan">Japan</option>
                  <option value="China">China</option>
                  <option value="Korea">Korea</option>
                </select>
              </div>
              <div class="form-group">
                <label>Geography*</label>
                <select v-model="formData.geography">
                  <option value="">--Geography--</option>
                  <option value="Northern Thailand">Northern Thailand</option>
                  <option value="Central Thailand">Central Thailand</option>
                  <option value="Southern Thailand">Southern Thailand</option>
                  <option value="Northeastern Thailand">Northeastern Thailand</option>
                </select>
              </div>
              <div class="form-group">
                <label>Province*</label>
                <select v-model="formData.province">
                  <option value="">--Province--</option>
                  <option value="Bangkok">Bangkok</option>
                  <option value="Chiang Mai">Chiang Mai</option>
                  <option value="Chiang Rai">Chiang Rai</option>
                  <option value="Mae Hong Son">Mae Hong Son</option>
                </select>
              </div>
            </div>
            
            <div class="form-group">
              <label>Email</label>
              <input type="email" v-model="formData.email" />
            </div>
            
            <div class="form-group">
              <label>Phone Number</label>
              <input type="tel" v-model="formData.phoneNumber" />
            </div>
            
            <div class="form-group">
              <label>Details</label>
              <textarea class="textarea-lg" v-model="formData.details" rows="4"></textarea>
            </div>
            
            <!-- Public Toggle -->
            <div class="public-toggle">
              <label>Public</label>
              <div class="toggle-switch" :class="{ active: formData.isPublic }" @click="formData.isPublic = !formData.isPublic">
                <div class="toggle-slider"></div>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="modal-actions">
              <button class="btn-cancel" @click="closeModal">Cancel</button>
              <button class="btn-save" @click="saveOrganization">Save</button>
            </div>
          </div>
          
          <!-- Review Tab -->
          <div v-if="state.activeTab === 'review'" class="review-tab">
            <h2 class="modal-title">Add Review</h2>
            <div class="form-divider"></div>
            
            <!-- Review Form -->
            <div class="form-row">
              <div class="form-group">
                <label>Organization Name *</label>
                <input 
                  type="text" 
                  v-model="reviewData.organizationName" 
                  placeholder="Enter organization name"
                />
              </div>
              <div class="form-group">
                <label>Job Position *</label>
                <input 
                  type="text" 
                  v-model="reviewData.jobPosition" 
                  placeholder="Enter job position"
                />
              </div>
            </div>
            
            <!-- Review Text -->
            <div class="form-group full-width">
              <label>Review *</label>
              <textarea 
                class="textarea-lg"
                v-model="reviewData.review" 
                placeholder="Write your review here..."
                rows="6"
              ></textarea>
            </div>
            
            <!-- Star Rating -->
            <div class="rating-section">
              <div class="star-rating">
                <span 
                  v-for="star in 5" 
                  :key="star"
                  class="star"
                  :class="{ active: star <= reviewData.rating }"
                  @click="setRating(star)"
                >
                  ★
                </span>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="modal-actions">
              <button class="btn-cancel" @click="closeModal">Cancel</button>
              <button class="btn-save" @click="saveReview">Save</button>
            </div>
          </div>
          
          <!-- MOU Tab -->
          <div v-if="state.activeTab === 'mou'" class="mou-tab">
            <div class="mou-header">
              <h2 class="modal-title">Add MOU</h2>
              <div class="form-divider"></div>
            </div>

            <div class="mou-top-row">
              <label class="mou-upload" aria-label="Upload MOU">
                <div class="mou-icon"></div>
                <input
                  type="file"
                  class="file-input"
                  accept=".pdf,.doc,.docx"
                  @change="handleMOUUpload"
                />
              </label>
              <span class="mou-label">MOU</span>
            </div>

            <div class="mou-period-row">
              <div class="form-group period-group wide">
                <select v-model="mouData.period">
                  <option value="">--Period--</option>
                  <option value="6months">6 Months</option>
                  <option value="1year">1 Year</option>
                  <option value="2years">2 Years</option>
                  <option value="3years">3 Years</option>
                  <option value="5years">5 Years</option>
                </select>
                <div class="calendar-icon"></div>
              </div>
            </div>

            <div class="publish-toggle mou-publish">
              <label>Publish MOU</label>
              <div class="toggle-switch" :class="{ active: mouData.publishMOU }" @click="mouData.publishMOU = !mouData.publishMOU">
                <div class="toggle-slider"></div>
              </div>
            </div>

            <div class="modal-actions mou-actions">
              <button class="btn-cancel" @click="closeModal">Cancel</button>
              <button class="btn-save" @click="saveMOU">Save</button>
            </div>
          </div>
        </div>
      </div>
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
  itemsPerPage: 5,
  showAddModal: false,
  activeTab: 'organization' as 'organization' | 'review' | 'mou'
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

// Modal form data
const formData = reactive({
  logo: null as File | null,
  organizationNameTH: '',
  organizationNameEN: '',
  addressTH: '',
  addressEN: '',
  organizationType: '',
  industryCategory: '',
  country: '',
  geography: '',
  province: '',
  email: '',
  phoneNumber: '',
  details: '',
  isPublic: false
})

// Review form data
const reviewData = reactive({
  organizationName: '',
  jobPosition: '',
  review: '',
  rating: 0
})

// MOU form data
const mouData = reactive({
  mouFile: null as File | null,
  period: '',
  publishMOU: false
})

// Modal methods
const closeModal = () => {
  state.showAddModal = false
  resetForm()
}

const resetForm = () => {
  Object.keys(formData).forEach(key => {
    if (key === 'isPublic') {
      formData[key] = false
    } else if (key === 'logo') {
      formData[key] = null
    } else {
      formData[key] = ''
    }
  })
  
  // Reset review data
  reviewData.organizationName = ''
  reviewData.jobPosition = ''
  reviewData.review = ''
  reviewData.rating = 0
  
  // Reset MOU data
  mouData.mouFile = null
  mouData.period = ''
  mouData.publishMOU = false
}

const switchTab = (tab: 'organization' | 'review' | 'mou') => {
  state.activeTab = tab
}

const saveOrganization = () => {
  // TODO: Implement save logic
  console.log('Saving organization:', formData)
  closeModal()
}

const handleLogoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    formData.logo = target.files[0]
  }
}

const handleMOUUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    mouData.mouFile = target.files[0]
  }
}

const setRating = (rating: number) => {
  reviewData.rating = rating
}

const saveReview = () => {
  console.log('Saving review:', reviewData)
  // Add review save logic here
  closeModal()
}

const saveMOU = () => {
  console.log('Saving MOU:', mouData)
  // Add MOU save logic here
  closeModal()
}

const addOrganization = async () => {
  state.showAddModal = true
  state.activeTab = 'organization'
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

/* Add Organization Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(84, 84, 84, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.add-org-modal {
  position: relative;
  width: 657px;
  min-height: 400px;
  max-height: 657px;
  background: #FFFFFF;
  border-radius: 12px;
  display: flex;
}

.add-org-modal.organization-active {
  height: 657px;
  min-height: 657px;
  max-height: 657px;
}

.add-org-modal.review-active,
.add-org-modal.mou-active {
  min-height: 400px;
  max-height: 657px;
  height: auto;
}

.modal-tabs {
  position: absolute;
  width: 42px;
  height: 280px;
  left: 657px;
  top: 35px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  background: transparent;
}

.tab-item {
  position: relative;
  width: 42px;
  height: 75px;
  background: #D9D9D9;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 11px;
  line-height: 13px;
  color: #000000;
}

/* Remove individual positioning for tabs */
.tab-item:nth-child(1),
.tab-item:nth-child(2),
.tab-item:nth-child(3) {
  position: relative;
  left: auto;
  right: auto;
  top: auto;
  bottom: auto;
}

.tab-item span {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) rotate(90deg);
  transform-origin: center center;
  white-space: nowrap;
  color: inherit;
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 11px;
  line-height: 13px;
}

.tab-item.active {
  background: #AB1C03;
  color: #FFFFFF;
}

.tab-item:hover:not(.active) {
  background: #E0E0E0;
}

.modal-content {
  position: absolute;
  left: 0.8%;
  right: 6.5%;
  top: 0%;
  bottom: 0%;
  background: #FFFFFF;
  border-radius: 12px;
  padding: 20px;
  overflow-y: auto;
  box-sizing: border-box;
}

.modal-title {
  margin: 0 0 10px 0;
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 19px;
  color: #000000;
}

.form-divider {
  width: 100%;
  height: 1px;
  background: #767676;
  margin: 10px 0 20px 0;
}

.logo-upload-section {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
}

.upload-area {
  width: 58px;
  height: 58px;
  background: #D9D9D9;
  border-radius: 9px;
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-icon {
  width: 20px;
  height: 20px;
  background: #000;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z'/%3E%3C/svg%3E") no-repeat;
  mask-size: contain;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.upload-text {
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 19px;
  color: #545454;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full-width {
  width: 100%;
}

.form-group label {
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 19px;
  color: #000000;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 8px 12px;
  background: #FFFFFF;
  border: 1px solid #767676;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #000000;
}

.form-group input,
.form-group select {
  height: 36px;
  line-height: 20px;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #AB1C03;
}

.form-group textarea {
  resize: vertical;
  min-height: 60px;
}

.textarea-md {
  min-height: 96px;
}

.textarea-lg {
  min-height: 128px;
}

.public-toggle {
  display: flex;
  align-items: center;
  gap: 15px;
  margin: 20px 0;
}

.public-toggle label {
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 19px;
  color: #000000;
}

.toggle-switch {
  width: 36px;
  height: 18px;
  background: #A1A1A1;
  border-radius: 9px;
  position: relative;
  cursor: pointer;
  transition: background 0.2s ease;
}

.toggle-switch.active {
  background: #4CAF50;
}

.toggle-slider {
  width: 14px;
  height: 14px;
  background: #FFFFFF;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.2s ease;
}

.toggle-switch.active .toggle-slider {
  transform: translateX(18px);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

.btn-cancel,
.btn-save {
  padding: 8px 20px;
  border-radius: 20px;
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 13px;
  line-height: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: #FFFFFF;
  border: 1px solid #B1B1B1;
  color: #000000;
}

.btn-cancel:hover {
  background: #F5F5F5;
}

.btn-save {
  background: #AB1C03;
  border: none;
  color: #FFFFFF;
}

.btn-save:hover {
  background: #8A1502;
}

.review-tab,
.mou-tab {
  padding: 10px 8px 0 8px;
}

/* Star Rating Styles */
.rating-section {
  margin: 20px 0;
}

.star-rating {
  display: flex;
  gap: 3px;
  align-items: center;
}

.star {
  font-size: 30px;
  color: #D9D9D9;
  cursor: pointer;
  transition: color 0.2s ease;
  user-select: none;
}

.star.active,
.star:hover {
  color: #FFD700;
}


/* MOU Tab Styles */
.mou-header .form-divider {
  margin: 6px 0 20px 0;
}

.mou-top-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
}

.mou-upload {
  width: 60px;
  height: 60px;
  background: #F2F2F2;
  border: 1px solid #D0D0D0;
  border-radius: 10px;
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.mou-upload:hover {
  background: #E9E9E9;
  border-color: #AB1C03;
}

.mou-icon {
  width: 22px;
  height: 22px;
  background: #000;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M14,17H7V15H14M17,13H7V11H17M17,9H7V7H17M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z'/%3E%3C/svg%3E") no-repeat;
  mask-size: contain;
}

.mou-label {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 16px;
  line-height: 19px;
  color: #000000;
}

.mou-period-row {
  margin-bottom: 24px;
}

.period-group {
  position: relative;
  max-width: 200px;
}

.period-group.wide {
  max-width: 260px;
}

.period-group select {
  width: 100%;
  height: 40px;
  padding: 8px 40px 8px 12px;
  background: #FFFFFF;
  border: 1px solid #D0D0D0;
  border-radius: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #333333;
  appearance: none;
  cursor: pointer;
}

.calendar-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  background: #666;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M19,3H18V1H16V3H8V1H6V3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19Z'/%3E%3C/svg%3E") no-repeat;
  mask-size: contain;
  pointer-events: none;
}

.publish-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20px 0;
  padding: 10px 0;
}

.publish-toggle.mou-publish {
  margin: 10px 0 30px 0;
  padding: 8px 0;
  justify-content: flex-end;
  gap: 12px;
}

.publish-toggle label {
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 15px;
  line-height: 19px;
  color: #767676;
}

.publish-toggle.mou-publish label {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 16px;
  color: #333333;
}

.modal-actions.mou-actions {
  justify-content: flex-end;
  gap: 12px;
  margin-top: 10px;
}
</style>