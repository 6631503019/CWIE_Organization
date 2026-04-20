<template>
  <div class="admin_mou">
    <AdminNavbar />
    
    <!-- Main Content Area -->
    <div class="main_content">
      <!-- Page Title -->
      <h1 class="page_title">MOU</h1>
      
      <!-- Search and Filter Section -->
      <div class="search_filter_section">
        <div class="search_controls">
          <!-- Text Search -->
          <div class="search_input_wrapper">
            <input 
              type="text" 
              class="search_input" 
              placeholder="Text Search (Name, Tags)"
              v-model="str_Search_Text"
            />
          </div>
          
          <!-- Status Filter -->
          <div class="status_filter">
            <div class="status_dropdown" @click="Toggle_Status_Dropdown">
              <span class="status_label">{{ str_Selected_Status || '__status__' }}</span>
              <div class="dropdown_arrow"></div>
            </div>
            <div v-if="bln_Show_Status_Dropdown" class="status_options">
              <div class="dropdown_search">
                <input 
                  type="text" 
                  v-model="str_Status_Dropdown_Search" 
                  placeholder="Search..."
                  @click.stop
                  class="dropdown_search_input"
                />
              </div>
              <div class="status_option" v-for="status in Arr_Get_Filtered_Status_Options" :key="status" @click="Select_Status(status)">{{ status }}</div>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="action_buttons">
            <button class="reset_btn">Reset</button>
            <button class="search_btn">Search</button>
          </div>
        </div>
      </div>
      
      <!-- MOU Cards Grid -->
      <div class="mou_cards_grid">
        <div 
          v-for="mou in Arr_Get_Paginated_MOUs" 
          :key="mou.id" 
          class="mou_card"
          @click="View_MOU_Details(mou)"
        >
          <!-- Organization Logo -->
          <div class="org_logo">
            <img :src="mou.logo" :alt="mou.name" />
          </div>
          
          <!-- Organization Info -->
          <div class="org_name">{{ mou.name }}</div>
          <div class="org_status" :class="{ 'active': mou.status === 'Active', 'inactive': mou.status === 'Inactive' }">{{ mou.status }}</div>
          <div class="org_duration">{{ mou.duration }}</div>
          
          <!-- Details Button -->
          <div class="details_section">
            <span class="details_text">Details</span>
            <div class="details_arrow"></div>
          </div>
          
          <!-- Edit Icon -->
          <div class="edit_icon" @click="Edit_MOU($event, mou)">
            <div class="pencil_icon"></div>
          </div>
        </div>
      </div>
      
      <!-- Pagination Component -->
      <div class="mou_pagination_container">
        <Pagination 
          :current-page="obj_state.currentPage"
          :total-pages="i_Get_Total_Pages"
          :total-items="Arr_Get_Filtered_MOUs.length"
          :loading="obj_state.loading"
          :show-info="false"
          @page-change="Handle_Page_Change"
        />
      </div>
    </div>
    
    <!-- Edit Modal -->
    <OrganizationEditModal 
      v-model="bln_Show_Edit_Modal"
      :organization-id="str_Editing_Org_ID"
      :initial-tab="str_Editing_Tab"
      @saved="Handle_Modal_Saved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import AdminNavbar from '../components/AdminNavbar.vue'
import Pagination from '../components/Pagination.vue'
import OrganizationEditModal from '../components/OrganizationEditModal.vue'
import { organizationAPI, mouAPI, BACKEND_URL } from '../services/api'

const router = useRouter()

// ===========================
// CONSTANTS
// ===========================
const CONST_ITEMS_PER_PAGE = 8
const CONST_AUTO_REFRESH_INTERVAL_MS = 30000 // 30 seconds
const CONST_PLACEHOLDER_LOGO = '/api/placeholder/95/95'

// ===========================
// STATUS OPTIONS
// ===========================
const CONST_STATUS_OPTIONS = ['All', 'Active', 'Inactive']

// ===========================
// REACTIVE STATE MANAGEMENT
// ===========================
const obj_state = reactive({
  loading: false,
  error: null as string | null,
  currentPage: 1,
  itemsPerPage: CONST_ITEMS_PER_PAGE,
  autoRefreshInterval: null as number | null
})

// ===========================
// FILTER STATES
// ===========================
const str_Search_Text = ref('')
const str_Selected_Status = ref('')
const bln_Show_Status_Dropdown = ref(false)
const str_Status_Dropdown_Search = ref('')

// ===========================
// MODAL STATES
// ===========================
const bln_Show_Edit_Modal = ref(false)
const str_Editing_Org_ID = ref<string | null>(null)
const str_Editing_Tab = ref<'organization' | 'review' | 'mou'>('organization')

// ===========================
// DATA ARRAYS
// ===========================
const arr_MOUs = ref<any[]>([])
// ===========================
// COMPUTED PROPERTIES
// ===========================
/**
 * Get filtered status options based on dropdown search
 * Purpose: Filter status options for dropdown display
 * Input: str_Status_Dropdown_Search
 * Output: Array of filtered status options
 * Side effects: None
 */
const Arr_Get_Filtered_Status_Options = computed(() => {
  if (!str_Status_Dropdown_Search.value) return CONST_STATUS_OPTIONS
  return CONST_STATUS_OPTIONS.filter(option => 
    option.toLowerCase().includes(str_Status_Dropdown_Search.value.toLowerCase())
  )
})

/**
 * Get filtered MOUs array based on search and status filter
 * Purpose: Apply all active filters to MOU list
 * Input: str_Search_Text, str_Selected_Status
 * Output: Filtered array of MOUs
 * Side effects: None
 */
const Arr_Get_Filtered_MOUs = computed(() => {
  let arr_Filtered = arr_MOUs.value
  
  // Step 1: Apply text search filter
  if (str_Search_Text.value.trim()) {
    const str_Search = str_Search_Text.value.toLowerCase()
    arr_Filtered = arr_Filtered.filter(obj_MOU => 
      obj_MOU.name.toLowerCase().includes(str_Search) ||
      obj_MOU.status.toLowerCase().includes(str_Search)
    )
  }
  
  // Step 2: Apply status filter
  if (str_Selected_Status.value && str_Selected_Status.value !== 'All') {
    arr_Filtered = arr_Filtered.filter(obj_MOU => obj_MOU.status === str_Selected_Status.value)
  }
  
  return arr_Filtered
})

/**
 * Get paginated MOUs for current page
 * Purpose: Slice filtered MOUs for display
 * Input: obj_state.currentPage, obj_state.itemsPerPage
 * Output: Array of MOUs for current page
 * Side effects: None
 */
const Arr_Get_Paginated_MOUs = computed(() => {
  const i_Start = (obj_state.currentPage - 1) * obj_state.itemsPerPage
  const i_End = i_Start + obj_state.itemsPerPage
  return Arr_Get_Filtered_MOUs.value.slice(i_Start, i_End)
})

/**
 * Calculate total number of pages
 * Purpose: Returns ceiling division for pagination
 * Input: Arr_Get_Filtered_MOUs.value.length
 * Output: Number of pages
 * Side effects: None
 */
const i_Get_Total_Pages = computed(() => 
  Math.ceil(Arr_Get_Filtered_MOUs.value.length / obj_state.itemsPerPage)
)

// ===========================
// WATCHERS FOR REACTIVE UPDATES
// ===========================
watch(str_Search_Text, () => {
  obj_state.currentPage = 1 // Reset to first page when searching
})

watch(str_Selected_Status, () => {
  obj_state.currentPage = 1 // Reset to first page when filtering
})
/**
 * Handle pagination page change
 * Purpose: Update current page with validation
 * Input: i_Page - new page number
 * Output: None (updates obj_state.currentPage)
 * Side effects: Sets loading state temporarily
 */
const Handle_Page_Change = async (i_Page: number) => {
  try {
    if (i_Page >= 1 && i_Page <= i_Get_Total_Pages.value && !obj_state.loading) {
      obj_state.loading = true
      try {
        obj_state.currentPage = i_Page
        await new Promise(resolve => setTimeout(resolve, 150))
      } finally {
        obj_state.loading = false
      }
    }
  } catch (error) {
    console.error('Error in Handle_Page_Change:', error)
  }
}

/**
 * Toggle status dropdown visibility
 * Purpose: Show/hide status filter dropdown
 * Input: None
 * Output: None (updates bln_Show_Status_Dropdown)
 * Side effects: Clears dropdown search when closing
 */
const Toggle_Status_Dropdown = () => {
  try {
    const bln_Is_Opening = !bln_Show_Status_Dropdown.value
    bln_Show_Status_Dropdown.value = bln_Is_Opening
    if (!bln_Is_Opening) {
      str_Status_Dropdown_Search.value = ''
    }
  } catch (error) {
    console.error('Error in Toggle_Status_Dropdown:', error)
  }
}

/**
 * Select status filter option
 * Purpose: Set selected status and close dropdown
 * Input: str_Status - status value to select
 * Output: None (updates str_Selected_Status)
 * Side effects: Closes dropdown, resets page to 1
 */
const Select_Status = (str_Status: string) => {
  try {
    str_Selected_Status.value = str_Status
    bln_Show_Status_Dropdown.value = false
  } catch (error) {
    console.error('Error in Select_Status:', error)
  }
}

/**
 * Navigate to MOU detail page
 * Purpose: Route to MOU details view
 * Input: obj_MOU - MOU object with id
 * Output: None (routes to new page)
 * Side effects: Changes current route
 */
const View_MOU_Details = (obj_MOU: any) => {
  try {
    if (!obj_MOU || !obj_MOU.id) {
      throw new Error('Invalid MOU object provided')
    }
    router.push(`/admin/mou/${obj_MOU.id}`)
  } catch (error) {
    console.error('Error in View_MOU_Details:', error)
  }
}

/**
 * Open edit modal for MOU
 * Purpose: Show edit modal with organization data
 * Input: event - Click event, obj_MOU - MOU to edit
 * Output: None (opens edit modal)
 * Side effects: Sets editing state, opens modal
 */
const Edit_MOU = (event: Event, obj_MOU: any) => {
  try {
    event.stopPropagation() // Prevent card click
    
    if (!obj_MOU || !obj_MOU.id) {
      throw new Error('Invalid MOU object provided')
    }
    
    str_Editing_Org_ID.value = obj_MOU.id
    str_Editing_Tab.value = 'organization'
    bln_Show_Edit_Modal.value = true
  } catch (error) {
    console.error('Error in Edit_MOU:', error)
  }
}

/**
 * Handle modal save event
 * Purpose: Refresh data after modal save
 * Input: None
 * Output: None (refreshes data)
 * Side effects: Fetches organizations and updates arr_MOUs
 */
const Handle_Modal_Saved = async () => {
  try {
    console.log('Modal saved - refreshing data...')
    obj_state.loading = true
    
    // Step 1: Small delay to ensure backend has processed the update
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Step 2: Fetch updated organizations
    await Load_Organizations_From_API()
    console.log('Data refreshed successfully')
  } catch (error) {
    console.error('Error in Handle_Modal_Saved:', error)
  } finally {
    obj_state.loading = false
  }
}

/**
 * Create MOU object from API response
 * Purpose: Transform API response to UI object
 * Input: obj_Organization - organization from API, obj_MOU_Data - MOU data
 * Output: Formatted MOU object for display
 * Side effects: None
 */
const Obj_Create_MOU_From_Response = (obj_Organization: any, obj_MOU_Data: any): any => {
  try {
    // Determine status based on organization is_public flag
    let str_Status = 'Inactive'
    const bln_Is_Public = obj_Organization.is_public
    
    if (bln_Is_Public === true || bln_Is_Public === 'true' || bln_Is_Public === 1 || bln_Is_Public === '1') {
      str_Status = 'Active'
    }
    
    // Format duration text from MOU dates
    let str_Duration = 'N/A'
    if (obj_MOU_Data && obj_MOU_Data.start_date && obj_MOU_Data.end_date) {
      const str_Start_Date = new Date(obj_MOU_Data.start_date).toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      })
      const str_End_Date = new Date(obj_MOU_Data.end_date).toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      })
      str_Duration = `Start: ${str_Start_Date} End: ${str_End_Date}`
    }
    
    // Process logo path
    let str_Logo_Path = obj_Organization.logo_path
    if (str_Logo_Path) {
      str_Logo_Path = str_Logo_Path.replace(/\\/g, '/')
      if (!str_Logo_Path.startsWith('/')) {
        str_Logo_Path = '/' + str_Logo_Path
      }
    }
    const str_Logo_URL = str_Logo_Path ? `${BACKEND_URL}${str_Logo_Path}` : CONST_PLACEHOLDER_LOGO
    
    return {
      id: obj_Organization._id,
      name: obj_Organization.name_en || obj_Organization.name_th || 'No Name',
      status: str_Status,
      duration: str_Duration,
      logo: str_Logo_URL
    }
  } catch (error) {
    console.error('Error in Obj_Create_MOU_From_Response:', error)
    throw error
  }
}
/**
 * Load organizations with MOUs from API
 * Purpose: Fetch all organizations and MOUs, then combine them
 * Input: None
 * Output: None (updates arr_MOUs)
 * Side effects: Updates arr_MOUs with combined organization+MOU data
 */
const Load_Organizations_From_API = async (): Promise<void> => {
  try {
    // Step 1: Get all organizations (including non-public ones for admin)
    const obj_Org_Response = await organizationAPI.getAll({ limit: 100, public: 'false' })
    const arr_Organizations = obj_Org_Response.data.data || []
    
    // Step 2: Get all MOUs (both published and not published)
    const obj_MOU_Response = await mouAPI.getAll({ limit: 100 })
    const arr_All_MOUs = obj_MOU_Response.data.data || []
    
    // Step 3: Create map of MOUs by organization_id for quick lookup
    const obj_MOU_Map = new Map()
    arr_All_MOUs
      .filter((obj_MOU: any) => {
        // Filter out MOUs with null organization_id
        const str_Org_ID = obj_MOU.organization_id?._id || obj_MOU.organization_id
        return str_Org_ID && str_Org_ID !== null && str_Org_ID !== undefined
      })
      .forEach((obj_MOU: any) => {
        const str_Org_ID = obj_MOU.organization_id?._id || obj_MOU.organization_id
        obj_MOU_Map.set(String(str_Org_ID), obj_MOU)
      })
    
    // Step 4: Filter organizations that have MOUs and transform them
    arr_MOUs.value = arr_Organizations
      .filter((obj_Org: any) => obj_MOU_Map.has(String(obj_Org._id)))
      .map((obj_Org: any) => {
        const obj_MOU = obj_MOU_Map.get(String(obj_Org._id))
        return Obj_Create_MOU_From_Response(obj_Org, obj_MOU)
      })
    
    console.log('Organizations loaded:', arr_MOUs.value.length, 'items')
  } catch (error: any) {
    obj_state.error = error.response?.data?.message || 'Failed to load organizations'
    console.error('Error in Load_Organizations_From_API:', error)
    throw error
  }
}

/**
 * Component mounted lifecycle hook
 * Purpose: Initialize component, load data, setup auto-refresh
 * Input: None
 * Output: None (loads organizations, sets up refresh)
 * Side effects: Fetches MOUs, sets up auto-refresh interval
 */
onMounted(async () => {
  try {
    console.log('AdminMOU component mounted')
    obj_state.loading = true
    
    // Step 1: Load initial organizations/MOUs
    await Load_Organizations_From_API()
    
    // Step 2: Setup auto-refresh interval
    obj_state.autoRefreshInterval = window.setInterval(async () => {
      try {
        console.log('Auto-refresh MOUs...')
        await Load_Organizations_From_API()
      } catch (error) {
        console.error('Auto-refresh error:', error)
      }
    }, CONST_AUTO_REFRESH_INTERVAL_MS)
    
  } catch (error) {
    // Error already handled in Load_Organizations_From_API
    console.error('Error in onMounted:', error)
  } finally {
    obj_state.loading = false
  }
})

/**
 * Component unmount lifecycle hook
 * Purpose: Cleanup resources before component is destroyed
 * Input: None
 * Output: None (cleans up intervals)
 * Side effects: Clears auto-refresh interval
 */
onBeforeUnmount(() => {
  try {
    console.log('AdminMOU component unmounting - cleaning up resources')
    if (obj_state.autoRefreshInterval) {
      clearInterval(obj_state.autoRefreshInterval)
      obj_state.autoRefreshInterval = null
    }
  } catch (error) {
    console.error('Error in onBeforeUnmount:', error)
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');

.admin_mou {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #F6F7F8;
  overflow-x: auto;
}

.main_content {
  margin-left: 232px;
  padding: 20px;
  height: calc(100vh - 40px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page_title {
  margin: 0 0 20px 0;
  
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 40px;
  line-height: 50px;
  color: #000000;
}

.search_filter_section {
  width: 100%;
  max-width: 1135px;
  background: #FFFFFF;
  box-shadow: 0px 4px 4px rgba(118, 118, 118, 0.5);
  border-radius: 8px;
  margin-bottom: 20px;
}

.search_controls {
  display: flex;
  align-items: center;
  gap: 53px;
  padding: 24px 35px;
}

.search_input_wrapper {
  flex: 1;
  max-width: 510px;
}

.search_input {
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

.search_input::placeholder {
  color: #B1B1B1;
}

.status_filter {
  position: relative;
  width: 276px;
}

.status_dropdown {
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

.status_label {
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  color: #545454;
}

.dropdown_arrow {
  width: 5.83px;
  height: 4.38px;
  background: #000000;
  clip-path: polygon(0 0, 100% 0, 50% 100%);
}

.status_options {
  position: absolute;
  top: 38px;
  left: 0;
  width: 276px;
  max-height: 250px;
  overflow-y: auto;
  background: #FFFFFF;
  border: 1px solid #B1B1B1;
  border-radius: 8px;
  z-index: 10;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

.dropdown_search {
  position: sticky;
  top: 0;
  background: #FFFFFF;
  padding: 8px;
  border-bottom: 1px solid #E0E0E0;
  z-index: 11;
}

.dropdown_search_input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #D0D0D0;
  border-radius: 4px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #333333;
}

.dropdown_search_input:focus {
  outline: none;
  border-color: #AB1C03;
}

.dropdown_search_input::placeholder {
  color: #999999;
}

.status_option {
  padding: 10px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #000000;
  cursor: pointer;
}

.status_option:hover {
  background: #F0F0F0;
}

.action_buttons {
  display: flex;
  gap: 20px;
}

.reset_btn {
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

.search_btn {
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

.edit_icon {
  position: absolute;
  width: 21px;
  height: 21px;
  right: 15px;
  top: 62px;
  z-index: 2;
}

.pencil_icon {
  width: 100%;
  height: 100%;
  background: #666;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z'/%3E%3C/svg%3E") no-repeat;
  mask-size: contain;
}

/* MOU Pagination Container */
.mou_pagination_container {
  display: flex;
  justify-content: center;
  margin-top: 40px;
  margin-bottom: 50px;
}
</style>

