<template>
  <div class="user_mou">
    <UserNavbar />
    
    <!-- Main Content Area -->
    <div class="main_content">
      <!-- Page Title -->
      <h1 class="page_title">MOU</h1>
      
      <!-- Search Section -->
      <div class="search_filter_section">
        <div class="search_controls">
          <!-- Text Search -->
          <div class="search_input_wrapper">
            <input 
              type="text" 
              class="search_input" 
              placeholder="Text Search (Name)"
              v-model="searchText"
            />
          </div>
          
          <!-- Action Buttons -->
          <div class="action_buttons">
            <button class="reset_btn" @click="resetSearch">Reset</button>
            <button class="search_btn" @click="applySearch">Search</button>
          </div>
        </div>
      </div>
      
      <!-- MOU Cards Grid -->
      <div class="mou_cards_grid">
        <div 
          v-for="mou in paginatedMous" 
          :key="mou.id" 
          class="mou_card"
          @click="viewMouDetails(mou)"
        >
          <!-- Organization Logo -->
          <div class="org_logo">
            <img :src="mou.logo" :alt="mou.name" />
          </div>
          
          <!-- Organization Info -->
          <div class="org_name">{{ mou.name }}</div>
          <div class="org_status active">Active</div>
          <div class="org_duration">{{ mou.duration }}</div>
          
          <!-- Details Button -->
          <div class="details_section">
            <span class="details_text">Details</span>
            <div class="details_arrow"></div>
          </div>
        </div>
      </div>
      
      <!-- Pagination Component -->
      <div class="mou_pagination_container">
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
import { useRouter } from 'vue-router'
import UserNavbar from '../components/UserNavbar.vue'
import Pagination from '../components/Pagination.vue'
import { organizationAPI, mouAPI, BACKEND_URL } from '../services/api'

const router = useRouter()

// Reactive state management
const state = reactive({
  loading: false,
  error: null as string | null,
  currentPage: 1,
  itemsPerPage: 8
})

// Reactive filter data
const searchText = ref('')

// Organization data (only published MOUs)
const mous = ref<any[]>([])

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

// Pagination info
const totalPages = computed(() => 
  Math.ceil(filteredMous.value.length / state.itemsPerPage)
)

// Watchers for reactive updates
watch(searchText, () => {
  state.currentPage = 1 // Reset to first page when searching
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

const viewMouDetails = (mou: any) => {
  // Navigate to MOU detail page (read-only)
  router.push(`/user/mou/${mou.id}`)
}

// Fetch organizations data (only published MOUs)
const fetchPublishedMOUs = async () => {
  try {
    const response = await organizationAPI.getAll({ limit: 100 })
    
    // Get only published MOUs
    const mouResponse = await mouAPI.getAll({ limit: 100 })
    console.log('All MOUs:', mouResponse.data.data)
    
    // Create map of published MOUs by organization_id
    const mouMap = new Map()
    mouResponse.data.data
      .filter((mou: any) => mou.is_published === true || mou.is_published === 'true' || mou.is_published === 1)
      .forEach((mou: any) => {
        const orgId = mou.organization_id?._id || mou.organization_id
        console.log(`Published MOU organization_id: ${orgId}`)
        mouMap.set(String(orgId), mou)
      })
    
    console.log('Published MOU Map keys:', Array.from(mouMap.keys()))
    
    // Filter and map organizations that have published MOUs
    mous.value = response.data.data
      .filter((item: any) => {
        const hasPublishedMOU = mouMap.has(String(item._id))
        console.log(`Org ${item.name_en} (${item._id}): has published MOU = ${hasPublishedMOU}`)
        return hasPublishedMOU
      })
      .map((item: any) => {
        const mou = mouMap.get(String(item._id))
        let durationText = 'N/A'
        
        if (mou) {
          // Format dates if available
          if (mou.start_date && mou.end_date) {
            const startDate = new Date(mou.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
            const endDate = new Date(mou.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
            durationText = `Start: ${startDate} End: ${endDate}`
          }
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
    console.log('Published MOUs loaded:', mous.value.length, 'items')
  } catch (error: any) {
    state.error = error.response?.data?.message || 'Failed to load MOUs'
    console.error('Loading error:', error)
    throw error
  }
}

// Lifecycle hooks
onMounted(async () => {
  console.log('UserMOU mounted')
  state.loading = true
  
  try {
    await fetchPublishedMOUs()
  } catch (error) {
    // Error already handled
  } finally {
    state.loading = false
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');

.user_mou {
  position: relative;
  width: 100vw;
  min-height: 100vh;
  background: #F6F7F8;
}

.main_content {
  margin-left: 232px;
  padding: 40px 20px 20px 20px;
  min-height: 100vh;
}

.page_title {
  margin: 0 0 30px 0;
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  font-size: 40px;
  line-height: 50px;
  color: #000000;
}

/* Search Section */
.search_filter_section {
  margin-bottom: 40px;
}

.search_controls {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search_input_wrapper {
  flex: 1;
  max-width: 800px;
}

.search_input {
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

.search_input::placeholder {
  color: #B1B1B1;
}

.action_buttons {
  display: flex;
  gap: 10px;
}

.reset_btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 20px;
  background: #FFFFFF;
  border: 1px solid #B1B1B1;
  border-radius: 20px;
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 14px;
  color: #000000;
  cursor: pointer;
  transition: background 0.2s;
}

.reset_btn:hover {
  background: #F5F5F5;
}

.search_btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 20px;
  background: #AB1C03;
  border: none;
  border-radius: 20px;
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 14px;
  color: #FFFFFF;
  cursor: pointer;
  transition: background 0.2s;
}

.search_btn:hover {
  background: #8B1502;
}

/* MOU Cards Grid */
.mou_cards_grid {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 0px;
  gap: 42px;
  flex-wrap: wrap;
  margin-bottom: 30px;
}

.mou_card {
  position: relative;
  width: 250px;
  height: 248px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.mou_card:hover {
  transform: translateY(-2px);
}

.mou_card::before {
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

.org_logo {
  position: absolute;
  width: 95px;
  height: 95px;
  left: 77px;
  top: 0px;
  z-index: 2;
}

.org_logo img {
  width: 100%;
  height: 100%;
  border-radius: 47.5px;
  object-fit: cover;
  background: #e0e0e0;
}

.org_name {
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

.org_status {
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

.org_status.active {
  color: #00FF5E;
}

.org_status.inactive {
  color: #FF0000;
}

.org_duration {
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

.details_section {
  position: absolute;
  left: 94px;
  top: 200px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 8px;
}

.details_text {
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 18px;
  color: #000000;
}

.details_arrow {
  width: 10px;
  height: 4.84px;
  border: 1px solid #000000;
  transform: rotate(90deg);
  clip-path: polygon(0 0, 100% 50%, 0 100%);
}

/* Pagination */
.mou_pagination_container {
  display: flex;
  justify-content: center;
  margin-top: 40px;
  margin-bottom: 50px;
}
</style>


