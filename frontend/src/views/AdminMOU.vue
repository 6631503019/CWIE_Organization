  <template>
    <div class="admin_mou">
      <AdminNavbar />
      <AdminTopBar
      />
      
      <!-- Main Content Area -->
      <div class="main_content">
        <!-- Page Title -->
        <div class="mou_page_actions">
          <button type="button" class="add_mou_btn" @click="Open_Add_MOU">
            <span class="mou_plus_icon" aria-hidden="true">+</span>
            <span>Add MOU</span>
          </button>
        </div>
        
        <!-- Search and Filter Section -->
        <div class="search_filter_section">
          <div class="search_controls">
            <!-- Text Search -->
            <div class="search_input_wrapper">
              <input 
                type="text" 
                class="search_input" 
                placeholder="Search organization..."
                v-model="str_Search_Text"
              />
            </div>
            
            <!-- Status Filter -->
            <div class="status_filter">
              <div class="status_dropdown" @click="Toggle_Status_Dropdown">
                <span class="status_label">{{ str_Selected_Status || 'Status' }}</span>
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
        
        <!-- MOU Table -->
<div class="mou_table_container">
  <table class="mou_table">
    <thead>
      <tr>
        <th class="mou_table_org_col">Organization</th>
        <th class="mou_table_document_col">Document Name</th>
        <th class="mou_table_uploaded_col">Uploaded</th>
        <th class="mou_table_status_col">Status</th>
        <th class="mou_table_action_col">Actions</th>
      </tr>
    </thead>

    <tbody>
      <tr
        v-for="mou in Arr_Get_Paginated_MOUs"
        :key="mou.id"
        class="mou_table_row"
      >
        <!-- Organization -->
        <td class="mou_table_org">
          <span>{{ getLocalizedOrganizationName(mou) }}</span>
        </td>

        <!-- Document Name -->
        <td class="mou_table_document">
  <a
    v-if="mou.documentUrl"
    :href="mou.documentUrl"
    target="_blank"
    rel="noopener noreferrer"
    class="mou_document_link"
    @click.stop
  >
    {{ mou.documentName }}
  </a>

  <span v-else>
    {{ mou.documentName }}
  </span>
</td>
        <!-- Uploaded -->
        <td class="mou_table_uploaded">
          <span>{{ mou.uploaded }}</span>
        </td>

        <!-- Status -->
        <td class="mou_table_status">
          <span
            class="mou_status_badge"
            :class="{
              active: mou.status === 'Active',
              inactive: mou.status === 'Inactive'
            }"
          >
            {{ mou.status }}
          </span>
        </td>

        <!-- Actions -->
        <td class="mou_table_action">
          <div class="mou_actions">

            <!-- View -->
            <button
              type="button"
              class="mou_action_btn view_btn"
              @click.stop="View_MOU_Details(mou)"
              title="View MOU"
            >
              View
            </button>

            <!-- Edit -->
            <button
              type="button"
              class="mou_action_btn edit_btn"
              @click.stop="Edit_MOU($event, mou)"
              title="Edit MOU"
            >
              Edit
            </button>

            <!-- Delete -->
            <button
              type="button"
              class="mou_action_btn delete_btn"
              @click.stop="Delete_MOU(mou)"
              title="Delete MOU"
            >
              Delete
            </button>

          </div>
        </td>
      </tr>

      <tr v-if="Arr_Get_Paginated_MOUs.length === 0">
        <td
          colspan="5"
          class="mou_table_empty"
        >
          No MOU found
        </td>
      </tr>
    </tbody>
  </table>
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

      <!-- Add MOU Modal -->
  <Teleport to="body">
    <div
      v-if="bln_Show_Add_MOU_Modal"
      class="add_mou_overlay"
      @click.self="Close_Add_MOU"
    >
      <form
        class="add_mou_modal"
        @submit.prevent="Submit_Add_MOU"
      >
        <!-- Close -->
        <button
          type="button"
          class="add_mou_close"
          aria-label="Close"
          @click="Close_Add_MOU"
        >
          ×
        </button>

        <!-- Title -->
        <h2 class="add_mou_title">Add MOU</h2>

        <div class="add_mou_divider"></div>

        <!-- Organization -->
        <div class="add_mou_field">
          <label
            class="add_mou_label"
            for="mou-organization"
          >
            Organization<span>*</span>
          </label>

          <div class="add_mou_organization_picker">
    <input
      id="mou-organization"
      v-model="str_Add_MOU_Organization_Search"
      type="text"
      class="add_mou_input"
      placeholder="Search organization"
      autocomplete="off"
      :disabled="obj_state.loading"
      @focus="bln_Show_Add_MOU_Organization_List = true"
    />

    <div
      v-if="bln_Show_Add_MOU_Organization_List"
      class="add_mou_organization_dropdown"
    >
      <button
        v-for="organization in arr_Filtered_Add_MOU_Organizations"
        :key="organization._id"
        type="button"
        class="add_mou_organization_option"
        @click="Select_Add_MOU_Organization(organization)"
      >
        {{ organization.name_en || organization.name_th || 'Unnamed Organization' }}
      </button>

      <div
        v-if="arr_Filtered_Add_MOU_Organizations.length === 0"
        class="add_mou_organization_empty"
      >
        No organizations found
      </div>
    </div>
  </div>
        </div>

        <!-- MOU File -->
        <div class="add_mou_field">
          <label
            class="add_mou_label"
            for="mou-file"
          >
            MOU Document<span>*</span>
          </label>

          <label
            class="add_mou_file_box"
            for="mou-file"
          >
            <span class="add_mou_file_text">
              {{ obj_Add_MOU.file?.name || 'Browse Files (PDF)' }}
            </span>

            <input
              id="mou-file"
              type="file"
              accept=".pdf,application/pdf"
              required
              @change="Handle_Add_MOU_File"
            />
          </label>
        </div>

        <!-- Error -->
        <p
          v-if="obj_state.error"
          class="add_mou_error"
        >
          {{ obj_state.error }}
        </p>

        <!-- Actions -->
        <div class="add_mou_actions">
          <button
            type="button"
            class="add_mou_cancel"
            :disabled="obj_state.loading"
            @click="Close_Add_MOU"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="add_mou_submit"
            :disabled="
              obj_state.loading ||
              !obj_Add_MOU.organizationId ||
              !obj_Add_MOU.file
            "
          >
            {{ obj_state.loading ? 'Uploading...' : 'Upload' }}
          </button>
        </div>
      </form>
    </div>
  </Teleport>
      
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
  import AdminTopBar from '../components/admin/AdminTopBar.vue'
  import Pagination from '../components/Pagination.vue'
  import OrganizationEditModal from '../components/OrganizationEditModal.vue'
  import { organizationAPI, mouAPI, BACKEND_URL } from '../services/api'
  import { useLanguage } from '../composables/useLanguage'

  const router = useRouter()
  const { currentLanguage } = useLanguage()

  const getLocalizedValue = (english: unknown, thai: unknown): string => {
    const preferred = currentLanguage.value === 'TH' ? thai : english
    const fallback = currentLanguage.value === 'TH' ? english : thai
    return String(preferred || fallback || 'N/A')
  }

  const getLocalizedOrganizationName = (mou: any): string =>
    getLocalizedValue(mou.name_en, mou.name_th)

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
  const bln_Show_Add_MOU_Modal = ref(false)
  const arr_Add_MOU_Organizations = ref<any[]>([])
  const obj_Add_MOU = reactive({ organizationId: '', file: null as File | null})
  const str_Add_MOU_Organization_Search = ref('')
  const bln_Show_Add_MOU_Organization_List = ref(false)

  const arr_Filtered_Add_MOU_Organizations = computed(() => {
    const search = str_Add_MOU_Organization_Search.value
      .trim()
      .toLowerCase()

    if (!search) {
      return arr_Add_MOU_Organizations.value
    }

    return arr_Add_MOU_Organizations.value.filter((organization) => {
      const nameEn = String(organization.name_en || '').toLowerCase()
      const nameTh = String(organization.name_th || '').toLowerCase()

      return (
        nameEn.includes(search) ||
        nameTh.includes(search)
      )
    })
  })



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
        getLocalizedOrganizationName(obj_MOU).toLowerCase().includes(str_Search) ||
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

  const Open_Add_MOU = async () => {
    obj_state.error = null
    bln_Show_Add_MOU_Modal.value = true
    if (arr_Add_MOU_Organizations.value.length > 0) return
    try {
      const response = await organizationAPI.getAll({ limit: 10000, public: 'false' })
      arr_Add_MOU_Organizations.value = response.data.data || []
    } catch (error: any) {
      obj_state.error = error.response?.data?.message || 'Failed to load organizations'
    }
  }

  const Close_Add_MOU = () => {
    bln_Show_Add_MOU_Modal.value = false
    obj_Add_MOU.organizationId = ''
    obj_Add_MOU.file = null
    obj_state.error = null
    str_Add_MOU_Organization_Search.value = ''
  bln_Show_Add_MOU_Organization_List.value = false
  obj_state.error = null
  }

  const Handle_Add_MOU_File = (event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0] || null

    if (file && file.type !== 'application/pdf') {
      obj_Add_MOU.file = null
      input.value = ''
      obj_state.error = 'MOU file must be a PDF document'
      return
    }

    obj_state.error = null
    obj_Add_MOU.file = file
  }

  const Select_Add_MOU_Organization = (organization: any) => {
    obj_Add_MOU.organizationId = organization._id

    str_Add_MOU_Organization_Search.value =
      organization.name_en ||
      organization.name_th ||
      'Unnamed Organization'

    bln_Show_Add_MOU_Organization_List.value = false
  }

  const Submit_Add_MOU = async () => {
    // Validate organization
    if (!obj_Add_MOU.organizationId) {
      obj_state.error = 'Please select an organization'
      return
    }

    // Validate file
    const file = obj_Add_MOU.file

    if (!file) {
      obj_state.error = 'Please select an MOU document'
      return
    }

    if (file.type !== 'application/pdf') {
      obj_state.error = 'MOU file must be a PDF document'
      return
    }

    obj_state.loading = true
    obj_state.error = null

    try {
      const formData = new FormData()

      formData.append(
        'organization_id',
        String(obj_Add_MOU.organizationId)
      )

      // ใช้ตัวแปร file ที่ผ่าน null check แล้ว
      formData.append('mou', file)

      await mouAPI.create(formData)

      Close_Add_MOU()

      await Load_Organizations_From_API()

    } catch (error: any) {
      console.error('Submit_Add_MOU error:', error)

      obj_state.error =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to upload MOU'

    } finally {
      obj_state.loading = false
    }
  }

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
      router.push(`/admin/mou/${obj_MOU.id}/more`)
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

  const Delete_MOU = async (obj_MOU: any) => {
  try {
    if (!obj_MOU?.id) {
      throw new Error('Invalid MOU ID')
    }

    const str_Confirm_Message =
      `Are you sure you want to delete the MOU for "${getLocalizedOrganizationName(obj_MOU)}"?`

    if (!window.confirm(str_Confirm_Message)) {
      return
    }

    obj_state.loading = true
    obj_state.error = null

    await mouAPI.delete(obj_MOU.id)

    // Reload real data from database
    await Load_Organizations_From_API()

    // Make sure current page is still valid
    const i_Total_Pages = Math.max(
      1,
      Math.ceil(
        Arr_Get_Filtered_MOUs.value.length /
        obj_state.itemsPerPage
      )
    )

    if (obj_state.currentPage > i_Total_Pages) {
      obj_state.currentPage = i_Total_Pages
    }

  } catch (error: any) {
    console.error('Delete_MOU error:', error)

    obj_state.error =
      error?.response?.data?.message ||
      'Failed to delete MOU'
  } finally {
    obj_state.loading = false
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
      const str_MOU_Path =
  obj_MOU_Data?.mou_path ||
  obj_MOU_Data?.mou_file_path ||
  ''

const str_MOU_URL = str_MOU_Path
  ? `${BACKEND_URL}${str_MOU_Path.startsWith('/') ? '' : '/'}${str_MOU_Path}`
  : ''

  return {
  id: obj_MOU_Data?._id,

  organizationId: obj_Organization?._id,

  name_en: obj_Organization?.name_en || '',
  name_th: obj_Organization?.name_th || '',

  documentName: str_MOU_Path
    ? String(str_MOU_Path)
        .replace(/\\/g, '/')
        .split('/')
        .pop() || 'MOU Document'
    : 'MOU Document',

  documentUrl: str_MOU_URL,

  uploaded: obj_MOU_Data?.createdAt
    ? new Date(obj_MOU_Data.createdAt).toLocaleDateString(
        'en-GB',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }
      )
    : 'N/A',

  status:
    obj_MOU_Data?.is_published === false
      ? 'Inactive'
      : 'Active',

  mou: obj_MOU_Data
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
  // IMPORTANT:
  // This is MOU ID, not Organization ID
  id: obj_MOU_Data?._id,

  // Keep Organization ID separately
  organizationId: obj_Organization?._id,

  // Organization
  name_en: obj_Organization?.name_en || '',
  name_th: obj_Organization?.name_th || '',

  // Document name
  documentName: obj_MOU_Data?.mou_file_path
    ? String(obj_MOU_Data.mou_file_path)
        .replace(/\\/g, '/')
        .split('/')
        .pop() || 'MOU Document'
    : 'MOU Document',

  // Uploaded date
  uploaded: obj_MOU_Data?.createdAt
    ? new Date(obj_MOU_Data.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : 'N/A',

  // Status
  status: str_Status,

  // Keep original MOU data for future use
  mou: obj_MOU_Data,

  // Logo can still be kept internally if needed
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
    width: 100%;
    min-width: 0;
    min-height: 100dvh;
    height: 100dvh;
    background: #F6F7F8;
    box-sizing: border-box;
  }

  .main_content {
  width: calc(100% - var(--admin-navbar-width, 66px));

  min-width: 0;

  min-height: calc(100dvh - 50px);

  height: auto;

  margin-left: var(--admin-navbar-width, 66px);

  padding: 24px clamp(16px, 3vw, 50px);

  box-sizing: border-box;

  overflow-y: auto;

  display: flex;

  flex-direction: column;

  gap: 20px;

  transition:
    width 0.2s ease,
    margin-left 0.2s ease;
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

  .mou_table_container {
  width: min(1090px, 100%);
  height: 277px;
  margin-left: 0;
  overflow-x: auto;
  overflow-y: hidden;
  background: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.12);
}

.mou_table {
  width: 1090px;
  min-width: 1090px;
  height: auto;
  table-layout: fixed;
  border-collapse: collapse;
  background: #FFFFFF;
}

/* Header */

.mou_table thead {
  height: 48px;
  background: #F3F4F6;
}

.mou_table th {
  padding: 0 14px;
  border-bottom: 1px solid #D9D9D9;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  line-height: 16px;
  color: #333333;
  text-align: left;
}

/* Column widths */

.mou_table_logo_col {
  width: 80px;
}

.mou_table_org_col {
  width: 300px;
}

.mou_table_status_col {
  width: 150px;
}

.mou_table_duration_col {
  width: 270px;
}

.mou_table_details_col {
  width: 190px;
}

.mou_table_action_col {
  width: 100px;
}

/* Rows */

.mou_table_row {
  height: 76px;
  border-bottom: 1px solid #E5E5E5;
  cursor: pointer;
  transition: background 0.15s ease;
}

.mou_table_row:hover {
  background: #FAFAFA;
}

.mou_table td {
  padding: 8px 14px;
  border-bottom: 1px solid #E5E5E5;
  vertical-align: middle;
}

/* Logo */

.mou_table_logo {
  text-align: center;
}

.mou_table_logo img {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  background: #E0E0E0;
}

/* Organization */

.mou_table_org {
  overflow: hidden;
}

.mou_table_org span {
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: #000000;
}

/* Status */

.mou_table_status {
  text-align: left;
}

.mou_status_badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 72px;
  height: 25px;
  padding: 0 12px;
  box-sizing: border-box;
  border-radius: 20px;

  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 500;
}

.mou_status_badge.active {
  background: #E8F8ED;
  color: #16803A;
}

.mou_status_badge.inactive {
  background: #FDECEC;
  color: #D00000;
}

/* Duration */

.mou_table_duration {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: #666666;
}

/* Details */

.mou_table_details {
  text-align: left;
}

.mou_details_btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;

  padding: 0;
  border: none;
  background: transparent;

  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #000000;

  cursor: pointer;
}

.mou_document_link {
  color: #2563eb;
  text-decoration: none;
  cursor: pointer;
  font-weight: 500;
}

.mou_document_link:hover {
  text-decoration: underline;
}

.mou_details_btn:hover {
  text-decoration: underline;
}

.mou_details_arrow {
  font-size: 20px;
  line-height: 14px;
}

/* Edit */

.mou_table_action {
  text-align: center;
}

.mou_edit_btn {
  width: 30px;
  height: 30px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: 0;
  border: none;
  background: transparent;
  border-radius: 5px;

  cursor: pointer;
}

.mou_edit_btn:hover {
  background: #F0F0F0;
}

.mou_edit_btn .pencil_icon {
  width: 18px;
  height: 18px;
  background: #666;

  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39 0-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z'/%3E%3C/svg%3E")
    no-repeat center;
  mask-size: contain;
}

/* Empty */

.mou_table_empty {
  height: 180px;
  text-align: center;
  vertical-align: middle !important;

  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #777777;
}

  /* MOU Pagination Container */
  .mou_pagination_container {
    display: flex;
    justify-content: center;
    margin-top: 40px;
    margin-bottom: 50px;
  }

  .admin_mou { width: 100%; min-width: 0; min-height: 100dvh; height: 100dvh; background: #F6F7F8; }
  .admin_mou > .main_content { width: calc(100% - var(--admin-navbar-width, 66px)); min-width: 0; min-height: calc(100dvh - 50px); height: auto; margin-left: var(--admin-navbar-width, 66px); padding: 24px clamp(16px, 3vw, 50px); box-sizing: border-box; overflow-y: auto; }
  .admin_mou .search_filter_section { width: min(1135px, 100%); max-width: none; }
  .admin_mou .search_controls { display: grid; grid-template-columns: minmax(220px, 1fr) minmax(190px, 276px) auto; align-items: center; gap: clamp(16px, 3vw, 53px); }
  .admin_mou .search_input_wrapper, .admin_mou .status_filter, .admin_mou .status_dropdown, .admin_mou .status_options { width: 100%; max-width: none; }
  .admin_mou .mou_table_container {
  width: min(1090px, 100%);
  max-width: 1090px;
}
@media (max-width: 900px) {
  .admin_mou .mou_table_container {
    width: 100%;
    overflow-x: auto;
  }
}

  .admin_mou .mou_page_actions {
    display: flex;
    justify-content: flex-end;
    width: min(1135px, 100%);
    margin-bottom: -8px;
  }

  .admin_mou .add_mou_btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-width: 105px;
    height: 36px;
    padding: 8px 16px;
    border: 0;
    border-radius: 8px;
    background: #8B0000;
    color: #FFFFFF;
    cursor: pointer;
    font: 600 13px/16px Inter, sans-serif;
  }

  .admin_mou .add_mou_btn:hover { background: #700000; }
  .admin_mou .mou_plus_icon { font-size: 20px; line-height: 16px; }

  @media (max-width: 900px) {
    .admin_mou .search_controls { grid-template-columns: minmax(0, 1fr) minmax(170px, 276px); }
    .admin_mou .action_buttons { grid-column: 1 / -1; justify-content: flex-end; }
  }

  @media (max-width: 640px) {
    .admin_mou > .main_content { width: calc(100% - 66px); padding-inline: 12px; }
    .admin_mou .search_controls { grid-template-columns: 1fr; gap: 12px; padding: 16px; }
    .admin_mou .action_buttons { justify-content: flex-end; }
  }

  /* =========================================
    ADD MOU MODAL
    Figma Group 259
    ========================================= */

  .add_mou_overlay {
    position: fixed;
    inset: 0;

    display: flex;
    align-items: flex-start;
    justify-content: center;

    padding-top: 51px;

    background: rgba(0, 0, 0, 0.35);

    z-index: 9999;

    box-sizing: border-box;
  }

  .add_mou_modal {
    position: relative;

    width: 520px;
    min-height: 360px;
    max-width: calc(100vw - 32px);

    box-sizing: border-box;

    padding: 24px 32px 22px;

    background: #ffffff;

    border-radius: 12px;

    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.18);

    font-family: 'Inter', sans-serif;
  }

  .add_mou_close {
    position: absolute;
    top: 14px;
    right: 18px;

    width: 30px;
    height: 30px;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 0;

    border: none;
    background: transparent;

    color: #555555;

    font-size: 26px;
    line-height: 1;

    cursor: pointer;
  }

  .add_mou_close:hover {
    color: #000000;
  }

  .add_mou_title {
    margin: 0;

    font-family: 'Outfit', sans-serif;
    font-size: 24px;
    font-weight: 600;
    line-height: 30px;

    color: #000000;
  }

  .add_mou_divider {
    width: 100%;
    height: 1px;

    margin: 12px 0 18px;

    background: #d9d9d9;
  }

  .add_mou_field {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .add_mou_label {
    margin-bottom: 6px;

    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 600;
    line-height: 16px;

    color: #333333;
  }

  .add_mou_label span {
    color: #ab1c03;
    margin-left: 2px;
  }

  .add_mou_input {
    width: 100%;
    height: 36px;

    box-sizing: border-box;

    padding: 7px 10px;

    border: 1px solid #b1b1b1;
    border-radius: 6px;

    background: #ffffff;

    font-family: 'Inter', sans-serif;
    font-size: 13px;

    color: #333333;

    outline: none;
  }

  .add_mou_input:focus {
    border-color: #ab1c03;
  }

  .add_mou_input:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
  .add_mou_organization_picker {
    position: relative;
    width: 100%;
  }

  .add_mou_organization_dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    max-height: 180px;
    overflow-y: auto;
    background: #ffffff;
    border: 1px solid #b1b1b1;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    z-index: 10001;
  }

  .add_mou_organization_option {
    display: block;
    width: 100%;
    padding: 9px 10px;
    border: none;
    background: #ffffff;
    text-align: left;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    color: #333333;
    cursor: pointer;
  }

  .add_mou_organization_option:hover {
    background: #f5f5f5;
  }

  .add_mou_organization_empty {
    padding: 10px;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    color: #777777;
  }

  .add_mou_organization_picker {
    position: relative;
    width: 100%;
  }

  .add_mou_organization_dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    max-height: 180px;
    overflow-y: auto;
    background: #ffffff;
    border: 1px solid #b1b1b1;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    z-index: 10001;
  }

  .add_mou_organization_option {
    display: block;
    width: 100%;
    padding: 9px 10px;
    border: none;
    background: #ffffff;
    text-align: left;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    color: #333333;
    cursor: pointer;
  }

  .add_mou_organization_option:hover {
    background: #f5f5f5;
  }

  .add_mou_organization_empty {
    padding: 10px;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    color: #777777;
  }

  .add_mou_file_box {
    width: 100%;
    height: 36px;

    box-sizing: border-box;

    display: flex;
    align-items: center;

    padding: 0 10px;

    border: 1px dashed #b1b1b1;
    border-radius: 6px;

    background: #fafafa;

    cursor: pointer;
  }

  .add_mou_file_box:hover {
    border-color: #ab1c03;
    background: #fffafa;
  }

  .add_mou_file_box input[type='file'] {
    display: none;
  }

  .add_mou_file_text {
    overflow: hidden;

    white-space: nowrap;
    text-overflow: ellipsis;

    font-family: 'Inter', sans-serif;
    font-size: 12px;

    color: #666666;
  }

  .add_mou_dates {
    display: grid;

    grid-template-columns: 1fr 1fr;

    gap: 16px;

    margin-top: 12px;
  }

  .add_mou_error {
    margin: 8px 0 0;

    font-family: 'Inter', sans-serif;
    font-size: 11px;
    line-height: 14px;

    color: #d00000;
  }

  .add_mou_actions {
    display: flex;

    justify-content: flex-end;
    align-items: center;

    gap: 10px;

    margin-top: 16px;
  }

  .add_mou_cancel,
  .add_mou_submit {
    height: 32px;

    padding: 0 18px;

    border-radius: 6px;

    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 500;

    cursor: pointer;
  }

  .add_mou_cancel {
    border: 1px solid #b1b1b1;

    background: #ffffff;

    color: #333333;
  }

  .add_mou_cancel:hover {
    background: #f5f5f5;
  }

  .add_mou_submit {
    border: 1px solid #8b0000;

    background: #8b0000;

    color: #ffffff;
  }

  .add_mou_submit:hover {
    background: #700000;
  }

  .add_mou_submit:disabled,
  .add_mou_cancel:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }


  /* =========================================
    ADD MOU RESPONSIVE
    ========================================= */

  @media (max-width: 600px) {
    .add_mou_overlay {
      padding: 20px 16px;
      align-items: flex-start;
    }

    .add_mou_modal {
      width: 100%;
      max-width: 520px;

      padding: 22px 20px;
    }

    .add_mou_dates {
      grid-template-columns: 1fr;
      gap: 10px;
    }
  }

  .admin_mou .mou_table_container {
  width: 1090px;
  max-width: 1090px;
  height: 277px;

  margin-left: 0;
  padding: 0;

  overflow: hidden;

  background: #FFFFFF;
  border: 1px solid #E1E1E1;
  border-radius: 8px;

  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.10);

  box-sizing: border-box;
}

.admin_mou .mou_table {
  width: 1090px;
  min-width: 1090px;
  height: auto;

  table-layout: fixed;
  border-collapse: collapse;

  background: #FFFFFF;

  font-family: 'Inter', sans-serif;
}


.admin_mou .mou_table th {
  height: 48px;

  padding: 0 18px;

  box-sizing: border-box;

  background: #8B0000;

  border-bottom: 1px solid #FFFFFF;
  border-right: 1px solid #BCBCBE;

  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  line-height: 16px;

  color: #FFFFFF;

  text-align: left;
  vertical-align: middle;
}
.admin_mou .mou_table td {
  height: 76px;
  padding: 0 18px;
  box-sizing: border-box;

  border-bottom: 1px solid #000000;
  border-right: 1px solid #BCBCBE;

  vertical-align: middle;
}

.admin_mou .mou_table th:last-child {
  border-right: none;
}

/* =========================================================
   COLUMN WIDTHS
   Total = 1090px
   ========================================================= */

.admin_mou .mou_table_org_col {
  width: 300px;
}

.admin_mou .mou_table_document_col {
  width: 270px;
}

.admin_mou .mou_table_uploaded_col {
  width: 160px;
}

.admin_mou .mou_table_status_col {
  width: 140px;
}

.admin_mou .mou_table_action_col {
  width: 220px;
}

/* =========================================================
   ROW
   ========================================================= */

.admin_mou .mou_table_row {
  height: 76px;

  border-bottom: 1px solid #E1E1E1;

  background: #FFFFFF;

  cursor: default;

  transition: background 0.15s ease;
}

.admin_mou .mou_table_row:hover {
  background: #FAFAFA;
}

/* =========================================================
   CELL
   ========================================================= */

.admin_mou .mou_table td {
  height: 76px;

  padding: 0 18px;

  box-sizing: border-box;

  border-bottom: 1px solid #E1E1E1;

  vertical-align: middle;
}

/* =========================================================
   ORGANIZATION
   ========================================================= */

.admin_mou .mou_table_org {
  width: 300px;

  overflow: hidden;

  text-align: left;
}

.admin_mou .mou_table_org span {
  display: block;

  width: 100%;

  overflow: hidden;

  white-space: nowrap;

  text-overflow: ellipsis;

  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 18px;

  color: #111111;
}

/* =========================================================
   DOCUMENT NAME
   ========================================================= */

.admin_mou .mou_table_document {
  width: 270px;

  overflow: hidden;

  text-align: left;
}

.admin_mou .mou_document_link {
  display: block;

  max-width: 100%;

  overflow: hidden;

  white-space: nowrap;

  text-overflow: ellipsis;

  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 18px;

  color: #2563EB;

  text-decoration: none;

  cursor: pointer;
}

.admin_mou .mou_document_link:hover {
  color: #1D4ED8;
  text-decoration: underline;
}

/* =========================================================
   UPLOADED
   ========================================================= */

.admin_mou .mou_table_uploaded {
  width: 160px;

  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 18px;

  color: #333333;

  text-align: left;
}

/* =========================================================
   STATUS
   ========================================================= */

.admin_mou .mou_table_status {
  width: 140px;

  text-align: left;
}

.admin_mou .mou_status_badge {
  display: inline-flex;

  align-items: center;
  justify-content: center;

  min-width: 82px;
  height: 30px;

  padding: 0 16px;

  box-sizing: border-box;

  border-radius: 20px;

  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  line-height: 16px;
}

.admin_mou .mou_status_badge.active {
  background: #E8F8ED;
  color: #16803A;
}

.admin_mou .mou_status_badge.inactive {
  background: #FDECEC;
  color: #D00000;
}

/* =========================================================
   ACTIONS
   ========================================================= */

.admin_mou .mou_table_action {
  width: 220px;

  padding-left: 18px !important;
  padding-right: 18px !important;

  text-align: left;
}

.admin_mou .mou_actions {
  display: flex;

  flex-direction: row;

  align-items: center;

  justify-content: flex-start;

  gap: 8px;

  width: 100%;

  white-space: nowrap;
}

/* ทุกปุ่ม Action ขนาดเท่ากัน */
.admin_mou .mou_action_btn {
  display: inline-flex;

  align-items: center;
  justify-content: center;

  flex: 0 0 auto;

  width: 58px;
  height: 30px;

  padding: 0;

  box-sizing: border-box;

  border: 1px solid #BDBDBD;
  border-radius: 4px;

  background: #FFFFFF;

  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 16px;

  color: #222222;

  cursor: pointer;
}

.admin_mou .mou_action_btn:hover {
  background: #F5F5F5;
}

/* View */
.admin_mou .mou_action_btn.view_btn {
  color: #333333;
}

/* Edit */
.admin_mou .mou_action_btn.edit_btn {
  color: #333333;
}

/* Delete */
.admin_mou .mou_action_btn.delete_btn {
  color: #B00000;
  border-color: #C8C8C8;
}

.admin_mou .mou_action_btn.delete_btn:hover {
  background: #FFF3F3;
}

/* =========================================================
   EMPTY STATE
   ========================================================= */

.admin_mou .mou_table_empty {
  height: 180px;

  padding: 0 !important;

  text-align: center;

  vertical-align: middle !important;

  font-family: 'Inter', sans-serif;
  font-size: 14px;

  color: #777777;

  border-bottom: none !important;
}
  </style>
