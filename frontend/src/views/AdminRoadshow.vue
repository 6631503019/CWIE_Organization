<template>
  <div class="admin_roadshow">
    <AdminNavbar />
    <AdminTopBar
    />

    <main class="main_content">
    <!-- Roadshow Header -->
    <section class="roadshow_header_section">
      <div class="roadshow_heading">
        <h1 class="roadshow_page_title">Roadshow</h1>
        <p class="roadshow_page_subtitle">Manage and view all roadshow events.</p>
      </div>


      <button class="btn_add_roadshow" type="button" @click="bln_Show_Create_Modal = true">
        <span class="plus_icon">+</span>
        <span class="button_text">Add Roadshow</span>
      </button>
    </section>

    <!-- Search -->
    <div class="roadshow_search_bar">
      <span class="search_icon" aria-hidden="true"></span>
      <input
        v-model="str_Search_Query"
        type="text"
        placeholder="Search roadshow title or organization..."
        aria-label="Search roadshow title or organization"
      />
    </div>

    <!-- Roadshow Table -->
    <section class="roadshow_table_wrapper">
      <div v-if="obj_state.error" class="error_message">{{ obj_state.error }}</div>
      <div v-else-if="obj_state.loading && arr_Roadshows.length === 0" class="loading_message">
        Loading roadshows...
      </div>

      <table v-else class="roadshow_table">
        <thead>
          <tr>
            <th class="col_organization">Organization</th>
            <th class="col_title">Roadshow title</th>
            <th class="col_time">Time</th>
            <th class="col_location">Location</th>
            <th class="col_actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="roadshow in Arr_Get_Paginated_Roadshows" :key="roadshow.id">
            <td class="organization_cell">{{ roadshow.organization || '—' }}</td>
            <td class="title_cell" :title="roadshow.title">{{ roadshow.title || '—' }}</td>
            <td class="time_cell">{{ roadshow.time || '—' }}</td>
            <td class="location_cell">{{ roadshow.location || '—' }}</td>
            <td class="actions_cell">
              <div class="table_actions">
                <button type="button" class="table_action view_action" @click.stop="View_Roadshow(roadshow)">View</button>
                <button type="button" class="table_action edit_action" @click.stop="Edit_Roadshow(roadshow)">Edit</button>
                <button type="button" class="table_action delete_action" @click.stop="Confirm_Delete_Roadshow(roadshow)">Delete</button>
              </div>
            </td>
          </tr>
          <tr v-if="Arr_Get_Paginated_Roadshows.length === 0">
            <td colspan="5" class="empty_table_cell">No roadshows found.</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Pagination -->
    <div class="roadshow_pagination_container">
      <Pagination
        :current-page="obj_state.currentPage"
        :total-pages="i_Get_Total_Pages"
        :total-items="Arr_Get_Filtered_Roadshows.length"
        :loading="obj_state.loading"
        :show-info="false"
        @page-change="Handle_Page_Change"
      />
    </div>
    </main>

    <!-- Create/Edit Modal -->
    <div v-if="bln_Show_Create_Modal || bln_Show_Edit_Modal" class="modal_overlay" @mousedown.self="Handle_Overlay_Mouse_Down" @mouseup.self="Handle_Overlay_Mouse_Up">
      <div class="add_roadshow_modal">
        <h2 class="modal_title">{{ bln_Show_Create_Modal ? 'Add Roadshow' : 'Edit Roadshow' }}</h2>
        <div class="form_divider"></div>

        <!-- Topic Field -->
        <div class="form_group">
          <label>Topic*</label>
          <input 
            type="text" 
            v-model="obj_Form_Data.topic" 
            placeholder="Enter topic"
          />
        </div>

        <!-- Details Field -->
        <div class="form_group full_width">
          <label>Details*</label>
          <textarea 
            class="textarea_lg"
            v-model="obj_Form_Data.details" 
            placeholder="Write details here..."
            rows="6"
          ></textarea>
        </div>

        <!-- Time Range Field -->
        <div class="form_group">
          <label for="roadshow-time">Time*</label>
          <input
            id="roadshow-time"
            type="text"
            v-model="obj_Form_Data.time"
            placeholder="12.00 - 15.00"
            inputmode="numeric"
          />
          <small class="form_hint">Use 24-hour format: HH.MM - HH.MM</small>
        </div>

        <!-- Event Date Field -->
        <div class="form_group">
          <label>Event Date*</label>
          <div class="date_input_wrapper">
            <input 
              type="date" 
              v-model="obj_Form_Data.event_date"
            />
            <span class="calendar_icon">📅</span>
          </div>
        </div>

        <!-- Deleted Date Field -->
        <div class="form_group">
          <label>Deleted Date</label>
          <div class="date_input_wrapper">
            <input 
              type="date" 
              v-model="obj_Form_Data.deleted_date"
            />
            <span class="calendar_icon">🗑️</span>
          </div>
        </div>

        <!-- Add Picture Activity -->
        <div class="upload_section">
          <label>Add Picture Activity (Optional - upload multiple photos)</label>
          
          <!-- Show existing activity images when editing -->
          <div v-if="obj_Form_Data.existingActivityImagePaths.length > 0" class="existing_images_section">
            <p class="existing_label">📸 Currently Uploaded Photos ({{ obj_Form_Data.existingActivityImagePaths.length }}):</p>
            <div class="existing_images_grid">
              <div v-for="(imagePath, index) in obj_Form_Data.existingActivityImagePaths" :key="index" v-show="!obj_Form_Data.deleteActivityImageIndices.includes(index)" class="existing_image_card">
                <img :src="`${CONST_API_BASE_URL}${imagePath}`" :alt="`Activity photo ${index + 1}`" />
                <button type="button" class="delete_image_btn" @click="obj_Form_Data.deleteActivityImageIndices.push(index)" :title="`Delete photo ${index + 1}`">🗑️</button>
              </div>
            </div>
            <div v-if="obj_Form_Data.deleteActivityImageIndices.length > 0" class="deletion_summary">
              <p>⚠️ {{ obj_Form_Data.deleteActivityImageIndices.length }} photo(s) marked for deletion</p>
              <button type="button" class="undo_all_btn" @click="obj_Form_Data.deleteActivityImageIndices = []">↩️ Undo All</button>
            </div>
          </div>
          
          <!-- New image selection -->
          <label class="upload_btn">
            <span class="upload_icon">📤</span>
            <span>{{ obj_Form_Data.pictureFileNames.length > 0 ? `${obj_Form_Data.pictureFileNames.length} photo(s) selected` : 'Select Photos' }}</span>
            <input 
              type="file" 
              accept="image/*"
              multiple
              @change="Handle_Picture_Upload"
              style="display: none"
            />
          </label>
          <div v-if="str_Picture_Preview_URL" class="image_preview">
            <img :src="str_Picture_Preview_URL" :alt="obj_Form_Data.pictureFileNames[obj_Form_Data.pictureFileNames.length - 1]" />
            <button type="button" class="remove_preview_btn" @click="Remove_Picture_File()">✕ Remove All</button>
          </div>
          <div v-if="obj_Form_Data.pictureFileNames.length > 0" class="file_list">
            <div v-for="(fileName, index) in obj_Form_Data.pictureFileNames" :key="index" class="file_item">
              <span class="file_name">{{ index + 1 }}. {{ fileName }}</span>
              <button type="button" class="remove_btn" @click="Remove_Picture_File(index)">Remove</button>
            </div>
          </div>
        </div>

        <!-- Add Poster -->
        <div class="upload_section">
          <label>Add Poster</label>
          <label class="upload_btn">
            <span class="upload_icon">📄</span>
            <span>{{ obj_Form_Data.posterFileName || 'Select Poster' }}</span>
            <input 
              type="file" 
              accept="image/*"
              @change="Handle_Poster_Upload"
              style="display: none"
            />
          </label>
          <div v-if="str_Poster_Preview_URL" class="image_preview">
            <img :src="str_Poster_Preview_URL" :alt="obj_Form_Data.posterFileName" />
            <button type="button" class="remove_preview_btn" @click="Remove_Poster_File">✕ Remove</button>
          </div>
          <div v-else-if="obj_Form_Data.posterFileName" class="file_selected">
            <span class="file_name">✓ {{ obj_Form_Data.posterFileName }}</span>
            <button type="button" class="remove_btn" @click="Remove_Poster_File">Remove</button>
          </div>
        </div>

        <!-- Public Toggle -->
        <div class="public_toggle">
          <label>Public</label>
          <div class="toggle_switch" :class="{ active: obj_Form_Data.isPublic }" @click="obj_Form_Data.isPublic = !obj_Form_Data.isPublic">
            <div class="toggle_slider"></div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="modal_actions">
          <button class="btn_cancel" @click="Close_Modals">Cancel</button>
          <button class="btn_save" @click="Submit_Form">Save</button>
        </div>
      </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div v-if="bln_Show_Delete_Modal" class="modal_overlay" @mousedown.self="Handle_Delete_Overlay_Mouse_Down" @mouseup.self="Handle_Delete_Overlay_Mouse_Up">
      <div class="delete_confirmation_modal">
        <h2 class="modal_title">Confirm Delete</h2>
        <div class="form_divider"></div>
        <p class="delete_message">Are you sure you want to delete "{{ obj_Deleting_Roadshow?.title }}"?</p>
        <div class="modal_actions">
          <button class="btn_cancel" @click="Close_Modals">Cancel</button>
          <button class="btn_delete" @click="Delete_Roadshow">Delete</button>
        </div>
      </div>
    </div>
    
    <!-- Notification Modal -->
    <NotificationModal 
      :show="bln_Show_Notification_Modal"
      :message="str_Notification_Message"
      :type="str_Notification_Type"
      @close="bln_Show_Notification_Modal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import AdminNavbar from '../components/AdminNavbar.vue'
import AdminTopBar from '../components/admin/AdminTopBar.vue'
import NotificationModal from '../components/NotificationModal.vue'
import Pagination from '../components/Pagination.vue'
import { formatRoadshowTime, normalizeRoadshowTime } from '../utils/roadshowTime'
import { organizationAPI } from '../services/api'

// ===========================
// CONSTANTS
// ===========================
const CONST_API_BASE_URL = 'http://localhost:5000'
const CONST_API_ROADSHOWS_ENDPOINT = '/api/roadshows'
const CONST_AUTH_HEADER_KEY = 'Authorization'
const CONST_AUTH_TOKEN_STORAGE_KEY = 'auth_token'
const CONST_AUTO_REFRESH_INTERVAL_MS = 45000 // 45 seconds
const CONST_ITEMS_PER_PAGE = 5
const CONST_EMPTY_IMAGE_SVG = "data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27271%27 height=%27272%27%3E%3Crect fill=%27%23ddd%27 width=%27271%27 height=%27272%27/%3E%3Ctext fill=%27%23999%27 x=%2750%25%27 y=%2750%25%27 dominant-baseline=%27middle%27 text-anchor=%27middle%27 font-family=%27sans-serif%27 font-size=%2720%27%3ENo Image%3C/text%3E%3C/svg%3E"
const CONST_API_LIMIT_QUERY = '?limit=100&public=false'

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
// MODAL STATE MANAGEMENT
// ===========================
const bln_Show_Create_Modal = ref(false)
const bln_Show_Edit_Modal = ref(false)
const bln_Show_Delete_Modal = ref(false)
const bln_Show_Notification_Modal = ref(false)
const str_Notification_Message = ref('')
const str_Notification_Type = ref<'success' | 'error' | 'warning'>('success')
const obj_Deleting_Roadshow = ref<any>(null)
const str_Editing_Roadshow_ID = ref<string | null>(null)

// ===========================
// DATA ARRAYS
// ===========================
// Roadshow data array - will be populated from backend
const arr_Roadshows = ref<any[]>([])
const arr_Organizations = ref<any[]>([])
const str_Search_Query = ref('')

// ===========================
// IMAGE PREVIEW URLS
// ===========================
const str_Picture_Preview_URL = ref<string | null>(null)
const str_Poster_Preview_URL = ref<string | null>(null)

// ===========================
// COMPUTED PROPERTIES
// ===========================
/**
 * Calculate total number of pages for pagination
 * Purpose: Returns ceiling division of total items by items per page
 * Input: arr_Roadshows.value.length, obj_state.itemsPerPage
 * Output: Number representing total pages
 * Side effects: None
 */
const i_Get_Total_Pages = computed(() => Math.max(1, Math.ceil(Arr_Get_Filtered_Roadshows.value.length / obj_state.itemsPerPage)))

/**
 * Get paginated roadshows array for current page
 * Purpose: Slice roadshows array based on current page and items per page
 * Input: obj_state.currentPage, obj_state.itemsPerPage, arr_Roadshows.value
 * Output: Array of roadshows for current page
 * Side effects: None
 */
const Arr_Get_Filtered_Roadshows = computed(() => {
  const str_Query = str_Search_Query.value.trim().toLowerCase()
  if (!str_Query) return arr_Roadshows.value

  return arr_Roadshows.value.filter((roadshow) => {
    const str_Title = String(roadshow.title || '').toLowerCase()
    const str_Organization = String(roadshow.organization || '').toLowerCase()
    return str_Title.includes(str_Query) || str_Organization.includes(str_Query)
  })
})

const Arr_Get_Paginated_Roadshows = computed(() => {
  const i_Start = (obj_state.currentPage - 1) * obj_state.itemsPerPage
  const i_End = i_Start + obj_state.itemsPerPage
  return Arr_Get_Filtered_Roadshows.value.slice(i_Start, i_End)
})

watch(str_Search_Query, () => { obj_state.currentPage = 1 })


// ===========================
// WATCHERS FOR REACTIVE UPDATES
// ===========================
watch(() => obj_state.currentPage, (newPage) => {
  console.log('Page changed to:', newPage)
  // Could trigger data fetch for specific roadshow
})

watch(bln_Show_Create_Modal, (bln_Is_Open) => {
  if (!bln_Is_Open) Reset_Form()
})

watch(bln_Show_Edit_Modal, (bln_Is_Open) => {
  if (!bln_Is_Open) Reset_Form()
})

// ===========================
// FORM DATA OBJECT
// ===========================
const obj_Form_Data = reactive({
  topic: '',
  details: '',
  organization_id: '',
  location: '',
  time: '',
  event_date: '',
  posted_date: '',
  deleted_date: '',
  pictureFiles: [] as File[],
  pictureFileNames: [] as string[],
  posterFile: null as File | null,
  posterFileName: '',
  isPublic: false,
  existingActivityImagePaths: [] as string[],
  deleteActivityImageIndices: [] as number[]
})

/**
 * Format date from storage format (YYYY-MM-DD) to display format (mm/dd/yyyy)
 * Purpose: Convert internal date format to user-friendly display format
 * Input: str_Date - date string in YYYY-MM-DD format or empty
 * Output: Formatted date string in mm/dd/yyyy format or empty string
 * Side effects: None
 */
const Format_Date_To_Display = (str_Date: string): string => {
  try {
    if (!str_Date) return ''
    
    // Handle both YYYY-MM-DD and mm/dd/yyyy formats
    if (str_Date.includes('-')) {
      const [year, month, day] = str_Date.split('-')
      return `${month}/${day}/${year}`
    }
    
    // If already in mm/dd/yyyy format, return as-is
    return str_Date
  } catch (error) {
    console.error('Error formatting date to display:', error)
    return str_Date
  }
}

/**
 * Format date from display format (mm/dd/yyyy) to storage format (YYYY-MM-DD)
 * Purpose: Convert user input to internal date format for API
 * Input: str_Date - date string in mm/dd/yyyy format or YYYY-MM-DD
 * Output: Formatted date string in YYYY-MM-DD format or empty string
 * Side effects: None
 */
const Format_Date_To_Storage = (str_Date: string): string => {
  try {
    if (!str_Date) return ''
    
    // Handle mm/dd/yyyy format
    if (str_Date.includes('/') && !str_Date.includes('-')) {
      const [month, day, year] = str_Date.split('/')
      if (month && day && year && month.length === 2 && day.length === 2 && year.length === 4) {
        return `${year}-${month}-${day}`
      }
    }
    
    // If already in YYYY-MM-DD format, return as-is
    if (str_Date.includes('-')) {
      return str_Date
    }
    
    return str_Date
  } catch (error) {
    console.error('Error formatting date to storage:', error)
    return str_Date
  }
}

/**
 * Handle page change in pagination
 * Purpose: Update current page if valid and not loading
 * Input: page - new page number to navigate to
 * Output: None (updates obj_state.currentPage)
 * Side effects: Modifies obj_state.currentPage when valid
 */
const Handle_Page_Change = async (i_Page: number) => {
  try {
    // Input validation
    if (!i_Page || typeof i_Page !== 'number') {
      throw new Error('Invalid page number provided')
    }
    
    if (i_Page >= 1 && i_Page <= i_Get_Total_Pages.value && !obj_state.loading) {
      obj_state.currentPage = i_Page
    }
  } catch (error) {
    console.error('Error in Handle_Page_Change:', error)
  }
}

/**
 * Populate edit form with roadshow data
 * Purpose: Load roadshow details into form and open edit modal
 * Input: obj_Roadshow - the roadshow object to edit
 * Output: None (updates obj_Form_Data and opens modal)
 * Side effects: Modifies obj_Form_Data, updates bln_Show_Edit_Modal and str_Editing_Roadshow_ID
 */
const View_Roadshow = (obj_Roadshow: any): void => {
  if (obj_Roadshow?.id) window.location.href = `/admin/roadshow/${obj_Roadshow.id}`
}

const Edit_Roadshow = (obj_Roadshow: any) => {
  try {
    // Input validation
    if (!obj_Roadshow || !obj_Roadshow.id) {
      throw new Error('Invalid roadshow object provided')
    }
    
    // Load roadshow data into form
    str_Editing_Roadshow_ID.value = obj_Roadshow.id
    obj_Form_Data.topic = obj_Roadshow.title || ''
    obj_Form_Data.details = obj_Roadshow.description || ''
    obj_Form_Data.organization_id = obj_Roadshow.organization_id || ''
    obj_Form_Data.location = obj_Roadshow.location || ''
    obj_Form_Data.time = formatRoadshowTime(obj_Roadshow.time || '')
    obj_Form_Data.event_date = obj_Roadshow.event_date || obj_Roadshow.posted_date || ''
    // Store dates in YYYY-MM-DD format internally
    obj_Form_Data.posted_date = obj_Roadshow.posted_date || ''
    obj_Form_Data.deleted_date = obj_Roadshow.deleted_date || ''
    obj_Form_Data.isPublic = obj_Roadshow.isPublic || false
    obj_Form_Data.existingActivityImagePaths = obj_Roadshow.activityImagePaths || []
    obj_Form_Data.deleteActivityImageIndices = []
    
    // DEBUG: Log entire roadshow object
    console.log('🔍 DEBUG Edit_Roadshow - Full Roadshow Object:')
    console.log('   obj_Roadshow:', obj_Roadshow)
    console.log('   after form load - posted_date:', obj_Form_Data.posted_date)
    console.log('   after form load - deleted_date:', obj_Form_Data.deleted_date)
    
    // Clear newly selected picture files when editing
    obj_Form_Data.pictureFiles = []
    obj_Form_Data.pictureFileNames = []
    str_Picture_Preview_URL.value = ''
    
    bln_Show_Edit_Modal.value = true
  } catch (error) {
    console.error('Error in Edit_Roadshow:', error)
    obj_state.error = error instanceof Error ? error.message : 'Failed to edit roadshow'
  }
}

/**
 * Show delete confirmation modal for a roadshow
 * Purpose: Display confirmation dialog before deleting roadshow
 * Input: obj_Roadshow - the roadshow to delete
 * Output: None (opens delete confirmation modal)
 * Side effects: Sets obj_Deleting_Roadshow and opens bln_Show_Delete_Modal
 */
const Confirm_Delete_Roadshow = (obj_Roadshow: any) => {
  try {
    // Input validation
    if (!obj_Roadshow || !obj_Roadshow.id) {
      throw new Error('Invalid roadshow object provided')
    }
    
    obj_Deleting_Roadshow.value = obj_Roadshow
    bln_Show_Delete_Modal.value = true
  } catch (error) {
    console.error('Error in Confirm_Delete_Roadshow:', error)
    obj_state.error = error instanceof Error ? error.message : 'Failed to confirm delete'
  }
}

/**
 * Delete a roadshow from database
 * Purpose: Remove roadshow record and update local state
 * Input: None (uses obj_Deleting_Roadshow.value)
 * Output: None (updates arr_Roadshows)
 * Side effects: Modifies arr_Roadshows, obj_state properties, and modal states
 */
const Delete_Roadshow = async () => {
  try {
    // Input validation
    if (!obj_Deleting_Roadshow.value || !obj_Deleting_Roadshow.value.id) {
      throw new Error('No roadshow selected for deletion')
    }
    
    obj_state.loading = true
    bln_Show_Delete_Modal.value = false
    
    // Step 1: Make DELETE request to API
    const str_Auth_Token = localStorage.getItem(CONST_AUTH_TOKEN_STORAGE_KEY)
    const str_Delete_URL = `${CONST_API_BASE_URL}${CONST_API_ROADSHOWS_ENDPOINT}/${obj_Deleting_Roadshow.value.id}`
    
    const response = await fetch(str_Delete_URL, {
      method: 'DELETE',
      headers: {
        [CONST_AUTH_HEADER_KEY]: `Bearer ${str_Auth_Token}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to delete roadshow')
    }
    
    // Step 2: Remove from local array
    arr_Roadshows.value = arr_Roadshows.value.filter(r => r.id !== obj_Deleting_Roadshow.value.id)
    
    // Step 3: Adjust current page if needed
    if (arr_Roadshows.value.length > 0 && obj_state.currentPage > i_Get_Total_Pages.value) {
      obj_state.currentPage = i_Get_Total_Pages.value
    }
    
    obj_Deleting_Roadshow.value = null
    obj_state.error = null
    str_Notification_Message.value = 'Roadshow deleted successfully'
    str_Notification_Type.value = 'success'
    bln_Show_Notification_Modal.value = true
  } catch (error) {
    obj_state.error = error instanceof Error ? error.message : 'Failed to delete roadshow'
    str_Notification_Message.value = obj_state.error
    str_Notification_Type.value = 'error'
    bln_Show_Notification_Modal.value = true
    console.error('Error in Delete_Roadshow:', error)
  } finally {
    obj_state.loading = false
  }
}

// ===========================
// MODAL OVERLAY EVENT HANDLERS
// ===========================
let obj_Mouse_Down_Target: EventTarget | null = null
let obj_Delete_Mouse_Down_Target: EventTarget | null = null

/**
 * Track mouse down position for modal overlay dismiss
 * Purpose: Store target element when mouse down on overlay
 * Input: event - MouseEvent from overlay
 * Output: None (updates obj_Mouse_Down_Target)
 * Side effects: Sets obj_Mouse_Down_Target if clicked on overlay itself
 */
const Handle_Overlay_Mouse_Down = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    obj_Mouse_Down_Target = event.target
  } else {
    obj_Mouse_Down_Target = null
  }
}

/**
 * Handle mouse up on overlay to dismiss modal
 * Purpose: Close modal if mouse down and up occurred on overlay
 * Input: event - MouseEvent from overlay
 * Output: None (closes modal if conditions met)
 * Side effects: Calls Close_Modals() and resets obj_Mouse_Down_Target
 */
const Handle_Overlay_Mouse_Up = (event: MouseEvent) => {
  if (event.target === event.currentTarget && obj_Mouse_Down_Target === event.target) {
    Close_Modals()
  }
  obj_Mouse_Down_Target = null
}

/**
 * Track mouse down position for delete confirmation overlay
 * Purpose: Store target element when mouse down on delete overlay
 * Input: event - MouseEvent from overlay
 * Output: None (updates obj_Delete_Mouse_Down_Target)
 * Side effects: Sets obj_Delete_Mouse_Down_Target if clicked on overlay itself
 */
const Handle_Delete_Overlay_Mouse_Down = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    obj_Delete_Mouse_Down_Target = event.target
  } else {
    obj_Delete_Mouse_Down_Target = null
  }
}

/**
 * Handle mouse up on delete confirmation overlay
 * Purpose: Close delete modal if mouse down and up occurred on overlay
 * Input: event - MouseEvent from overlay
 * Output: None (closes modal if conditions met)
 * Side effects: Calls Close_Modals() and resets obj_Delete_Mouse_Down_Target
 */
const Handle_Delete_Overlay_Mouse_Up = (event: MouseEvent) => {
  if (event.target === event.currentTarget && obj_Delete_Mouse_Down_Target === event.target) {
    Close_Modals()
  }
  obj_Delete_Mouse_Down_Target = null
}

/**
 * Close all open modals and reset state
 * Purpose: Cleanup and dismiss all active modals
 * Input: None
 * Output: None (closes all modals)
 * Side effects: Sets all modal flags to false, clears editing state, calls Reset_Form
 */
const Close_Modals = () => {
  try {
    bln_Show_Create_Modal.value = false
    bln_Show_Edit_Modal.value = false
    bln_Show_Delete_Modal.value = false
    str_Editing_Roadshow_ID.value = null
    obj_Deleting_Roadshow.value = null
    Reset_Form()
  } catch (error) {
    console.error('Error in Close_Modals:', error)
  }
}

/**
 * Reset form fields and preview URLs
 * Purpose: Clear all form data and temporary state
 * Input: None
 * Output: None (resets obj_Form_Data and preview URLs)
 * Side effects: Clears form fields, revokes object URLs, resets preview states
 */
const Reset_Form = () => {
  try {
    obj_Form_Data.topic = ''
    obj_Form_Data.details = ''
    obj_Form_Data.organization_id = ''
    obj_Form_Data.location = ''
    obj_Form_Data.time = ''
    obj_Form_Data.event_date = ''
    obj_Form_Data.posted_date = ''
    obj_Form_Data.deleted_date = ''
    obj_Form_Data.pictureFiles = []
    obj_Form_Data.pictureFileNames = []
    obj_Form_Data.posterFile = null
    obj_Form_Data.posterFileName = ''
    obj_Form_Data.isPublic = false
    obj_Form_Data.existingActivityImagePaths = []
    obj_Form_Data.deleteActivityImageIndices = []
    
    // Clear preview URLs and revoke object URLs
    if (str_Picture_Preview_URL.value) {
      URL.revokeObjectURL(str_Picture_Preview_URL.value)
      str_Picture_Preview_URL.value = null
    }
    if (str_Poster_Preview_URL.value) {
      URL.revokeObjectURL(str_Poster_Preview_URL.value)
      str_Poster_Preview_URL.value = null
    }
  } catch (error) {
    console.error('Error in Reset_Form:', error)
  }
}

/**
 * Calculate days remaining until deleted_date
 * Purpose: Compute countdown days from today to deleted_date
 * Input: str_Deleted_Date - date string in YYYY-MM-DD format
 * Output: Number of days remaining (returns 0 if date is in past)
 * Side effects: None
 */
const Format_Table_Date = (str_Date: string): string => {
  if (!str_Date) return '—'
  const obj_Date = new Date(str_Date)
  if (Number.isNaN(obj_Date.getTime())) return str_Date
  return obj_Date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const Get_File_Name = (str_Path: string): string => {
  const str_Normalized = String(str_Path || '').split('?')[0].replace(/\\/g, '/')
  return str_Normalized.split('/').pop() || 'Image'
}

const Get_Table_Status = (obj_Roadshow: any): string => {
  if (obj_Roadshow?.deleted_date) {
    const obj_Deleted = new Date(obj_Roadshow.deleted_date)
    if (!Number.isNaN(obj_Deleted.getTime()) && obj_Deleted.getTime() < new Date().setHours(0, 0, 0, 0)) {
      return 'Completed'
    }
  }
  return obj_Roadshow?.isPublic ? 'Active' : 'Upcoming'
}

const Get_Table_Status_Class = (obj_Roadshow: any): string => {
  const str_Status = Get_Table_Status(obj_Roadshow)
  if (str_Status === 'Completed') return 'status_completed'
  if (str_Status === 'Active') return 'status_active'
  return 'status_upcoming'
}

const Get_Days_Until_Deletion = (str_Deleted_Date: string): number => {
  try {
    if (!str_Deleted_Date) return 0
    
    const obj_Today = new Date()
    obj_Today.setHours(0, 0, 0, 0)
    
    const obj_Deleted_Date = new Date(str_Deleted_Date)
    obj_Deleted_Date.setHours(0, 0, 0, 0)
    
    const i_Days_Remaining = Math.ceil((obj_Deleted_Date.getTime() - obj_Today.getTime()) / (1000 * 60 * 60 * 24))
    
    return Math.max(0, i_Days_Remaining)
  } catch (error) {
    console.error('Error calculating days until deletion:', error)
    return 0
  }
}

/**
 * Get countdown status class for styling
 * Purpose: Return CSS class based on urgency level
 * Input: str_Deleted_Date - date string in YYYY-MM-DD format
 * Output: CSS class name (warning, critical, or safe)
 * Side effects: None
 */
const Get_Countdown_Status = (str_Deleted_Date: string): string => {
  try {
    const i_Days = Get_Days_Until_Deletion(str_Deleted_Date)
    
    if (i_Days <= 0) return 'status_expired'
    if (i_Days <= 3) return 'status_critical'
    if (i_Days <= 7) return 'status_warning'
    return 'status_safe'
  } catch (error) {
    console.error('Error determining countdown status:', error)
    return 'status_safe'
  }
}

/**
 * Handle picture file selection and preview
 * Purpose: Process multiple picture uploads and create preview
 * Input: event - Change event from file input
 * Output: None (updates obj_Form_Data and str_Picture_Preview_URL)
 * Side effects: Adds files to obj_Form_Data, creates object URL for preview
 */
const Handle_Picture_Upload = (event: Event) => {
  try {
    const target = event.target as HTMLInputElement
    const files = target.files
    
    // Input validation
    if (!files || files.length === 0) {
      throw new Error('No files selected')
    }
    
    // Step 1: Add all selected files to array
    for (let i = 0; i < files.length; i++) {
      obj_Form_Data.pictureFiles.push(files[i])
      obj_Form_Data.pictureFileNames.push(files[i].name)
    }
    
    // Step 2: Create preview for last selected file
    if (files.length > 0) {
      if (str_Picture_Preview_URL.value) {
        URL.revokeObjectURL(str_Picture_Preview_URL.value)
      }
      str_Picture_Preview_URL.value = URL.createObjectURL(files[files.length - 1])
    }
  } catch (error) {
    console.error('Error in Handle_Picture_Upload:', error)
    obj_state.error = error instanceof Error ? error.message : 'Failed to upload picture'
  }
}

/**
 * Handle poster file selection and preview
 * Purpose: Process poster file upload and create preview
 * Input: event - Change event from file input
 * Output: None (updates obj_Form_Data and str_Poster_Preview_URL)
 * Side effects: Sets obj_Form_Data.posterFile, creates object URL for preview
 */
const Handle_Poster_Upload = (event: Event) => {
  try {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    
    // Input validation
    if (!file) {
      throw new Error('No file selected')
    }
    
    obj_Form_Data.posterFile = file
    obj_Form_Data.posterFileName = file.name
    
    // Create preview URL
    if (str_Poster_Preview_URL.value) {
      URL.revokeObjectURL(str_Poster_Preview_URL.value)
    }
    str_Poster_Preview_URL.value = URL.createObjectURL(file)
  } catch (error) {
    console.error('Error in Handle_Poster_Upload:', error)
    obj_state.error = error instanceof Error ? error.message : 'Failed to upload poster'
  }
}

/**
 * Remove picture file(s) from upload list
 * Purpose: Delete specific or all picture files from form
 * Input: i_Index - optional index of file to remove (removes all if not provided)
 * Output: None (updates obj_Form_Data and str_Picture_Preview_URL)
 * Side effects: Modifies obj_Form_Data arrays, revokes object URLs
 */
const Remove_Picture_File = (i_Index?: number) => {
  try {
    if (i_Index !== undefined) {
      // Remove specific file from array
      obj_Form_Data.pictureFiles.splice(i_Index, 1)
      obj_Form_Data.pictureFileNames.splice(i_Index, 1)
      
      // Update preview if this was the last file
      if (obj_Form_Data.pictureFiles.length === 0 && str_Picture_Preview_URL.value) {
        URL.revokeObjectURL(str_Picture_Preview_URL.value)
        str_Picture_Preview_URL.value = null
      }
    } else {
      // Remove all files
      obj_Form_Data.pictureFiles = []
      obj_Form_Data.pictureFileNames = []
      if (str_Picture_Preview_URL.value) {
        URL.revokeObjectURL(str_Picture_Preview_URL.value)
        str_Picture_Preview_URL.value = null
      }
    }
  } catch (error) {
    console.error('Error in Remove_Picture_File:', error)
  }
}

/**
 * Remove poster file from upload
 * Purpose: Delete poster file and preview
 * Input: None
 * Output: None (updates obj_Form_Data and str_Poster_Preview_URL)
 * Side effects: Clears obj_Form_Data poster fields, revokes object URL
 */
const Remove_Poster_File = () => {
  try {
    obj_Form_Data.posterFile = null
    obj_Form_Data.posterFileName = ''
    if (str_Poster_Preview_URL.value) {
      URL.revokeObjectURL(str_Poster_Preview_URL.value)
      str_Poster_Preview_URL.value = null
    }
  } catch (error) {
    console.error('Error in Remove_Poster_File:', error)
  }
}

/**
 * Create image URL from poster path or fallback to placeholder
 * Purpose: Generate complete image URL for display
 * Input: str_Poster_Path - path from API response
 * Output: Complete image URL string
 * Side effects: None
 */
const Str_Get_Image_URL = (str_Poster_Path: string | null): string => {
  return str_Poster_Path ? `${CONST_API_BASE_URL}${str_Poster_Path}` : CONST_EMPTY_IMAGE_SVG
}

/**
 * Create roadshow object from API response
 * Purpose: Map API response data to frontend roadshow object
 * Input: obj_Response_Data - data from API
 * Output: Formatted roadshow object
 * Side effects: None
 */
const Obj_Create_Roadshow_From_Response = (obj_Response_Data: any): any => {
  /**
   * Helper: Extract YYYY-MM-DD from any date format (ISO string with time or plain date)
   */
  const Extract_Date_Part = (str_Date: string): string => {
    if (!str_Date) return ''
    
    // Handle ISO format with time: "2026-04-19T00:00:00.000Z" -> "2026-04-19"
    if (str_Date.includes('T')) {
      return str_Date.split('T')[0]
    }
    
    // Already in YYYY-MM-DD format
    return str_Date
  }
  
  const str_Poster_Path = obj_Response_Data.poster_path || ''
  const obj_Result = {
    id: obj_Response_Data._id,
    title: obj_Response_Data.topic,
    description: obj_Response_Data.details,
    image: Str_Get_Image_URL(str_Poster_Path),
    imageName: str_Poster_Path ? String(str_Poster_Path).replace(/\\/g, '/').split('/').pop() || 'Poster' : '—',
    isPublic: obj_Response_Data.is_public,
    event_date: Extract_Date_Part(obj_Response_Data.event_date),
    posted_date: Extract_Date_Part(obj_Response_Data.posted_date),
    deleted_date: Extract_Date_Part(obj_Response_Data.deleted_date),
    activityImagePaths: obj_Response_Data.activity_image_paths || [],
    organization_id: typeof obj_Response_Data.organization_id === 'object'
      ? obj_Response_Data.organization_id?._id
      : obj_Response_Data.organization_id || '',
    organization: obj_Response_Data.organization_name
      || obj_Response_Data.organization_id?.name_en
      || obj_Response_Data.organization_id?.name_th
      || obj_Response_Data.organization
      || '',
    time: formatRoadshowTime(obj_Response_Data.time || obj_Response_Data.roadshow_time || ''),
    location: obj_Response_Data.location || obj_Response_Data.venue || ''
  }
  
  // DEBUG: Log the mapping to see what fields are coming from API
  console.log('🔍 DEBUG Obj_Create_Roadshow_From_Response:')
  console.log('   API response posted_date:', obj_Response_Data.posted_date)
  console.log('   Extracted posted_date:', obj_Result.posted_date)
  console.log('   API response deleted_date:', obj_Response_Data.deleted_date)
  console.log('   Extracted deleted_date:', obj_Result.deleted_date)
  
  return obj_Result
}

/**
 * Submit roadshow form (create or update)
 * Purpose: Validate, serialize, and submit form data to API
 * Input: None (uses obj_Form_Data, bln_Show_Create_Modal, bln_Show_Edit_Modal)
 * Output: None (updates arr_Roadshows and modals)
 * Side effects: Makes API call, updates state, closes modals
 */
const Submit_Form = async () => {
  try {
    // Step 1: Input validation - check required fields
    if (!obj_Form_Data.topic.trim()) {
      throw new Error('Topic is required')
    }
    if (!obj_Form_Data.details.trim()) {
      throw new Error('Details are required')
    }
    const str_Normalized_Time = normalizeRoadshowTime(obj_Form_Data.time)
    if (!str_Normalized_Time) {
      throw new Error('Time must use HH.MM - HH.MM format')
    }
    if (!obj_Form_Data.event_date) {
      throw new Error('Event Date is required')
    }
    if (!obj_Form_Data.organization_id) {
      throw new Error('Organization is required')
    }
    if (!obj_Form_Data.location.trim()) {
      throw new Error('Location is required')
    }

    obj_state.loading = true
    
    // Step 2: Build FormData with all fields
    const obj_FormData_To_Send = new FormData()
    obj_FormData_To_Send.append('topic', obj_Form_Data.topic.trim())
    obj_FormData_To_Send.append('details', obj_Form_Data.details.trim())
    obj_FormData_To_Send.append('organization_id', obj_Form_Data.organization_id)
    obj_FormData_To_Send.append('location', obj_Form_Data.location.trim())
    obj_FormData_To_Send.append('time', str_Normalized_Time)
    obj_FormData_To_Send.append('event_date', obj_Form_Data.event_date)
    obj_FormData_To_Send.append('posted_date', obj_Form_Data.event_date)
    if (obj_Form_Data.deleted_date) {
      obj_FormData_To_Send.append('deleted_date', obj_Form_Data.deleted_date)
    }
    obj_FormData_To_Send.append('is_public', String(obj_Form_Data.isPublic))

    // Step 3: Add activity images
    if (obj_Form_Data.pictureFiles.length > 0) {
      obj_Form_Data.pictureFiles.forEach((obj_File) => {
        obj_FormData_To_Send.append('activity_image', obj_File)
      })
    } else if (obj_Form_Data.deleteActivityImageIndices.length > 0) {
      // Signal to backend which images to delete
      obj_FormData_To_Send.append('delete_activity_image_indices', JSON.stringify(obj_Form_Data.deleteActivityImageIndices))
    }
    
    // Step 4: Add poster image if provided
    if (obj_Form_Data.posterFile) {
      obj_FormData_To_Send.append('poster', obj_Form_Data.posterFile)
    }

    // Step 5: Determine if creating or updating
    if (bln_Show_Create_Modal.value) {
      await Bln_Submit_Create_Roadshow(obj_FormData_To_Send)
    } else if (bln_Show_Edit_Modal.value && str_Editing_Roadshow_ID.value) {
      await Bln_Submit_Update_Roadshow(obj_FormData_To_Send)
    } else {
      throw new Error('No modal open or invalid state')
    }

    obj_state.error = null
    str_Notification_Message.value = 'Roadshow saved successfully'
    str_Notification_Type.value = 'success'
    bln_Show_Notification_Modal.value = true
    Close_Modals()
  } catch (error) {
    obj_state.error = error instanceof Error ? error.message : 'Failed to save roadshow'
    str_Notification_Message.value = obj_state.error
    str_Notification_Type.value = 'error'
    bln_Show_Notification_Modal.value = true
    console.error('Error in Submit_Form:', error)
  } finally {
    obj_state.loading = false
  }
}

/**
 * Submit create roadshow request
 * Purpose: Make API POST request to create new roadshow
 * Input: obj_FormData_To_Send - FormData object with roadshow data
 * Output: Boolean indicating success
 * Side effects: Updates arr_Roadshows with new roadshow
 */
const Bln_Submit_Create_Roadshow = async (obj_FormData_To_Send: FormData): Promise<boolean> => {
  try {
    const str_Auth_Token = localStorage.getItem(CONST_AUTH_TOKEN_STORAGE_KEY)
    const str_Create_URL = `${CONST_API_BASE_URL}${CONST_API_ROADSHOWS_ENDPOINT}`
    
    // Make POST request
    const obj_Response = await fetch(str_Create_URL, {
      method: 'POST',
      headers: {
        [CONST_AUTH_HEADER_KEY]: `Bearer ${str_Auth_Token}`
      },
      body: obj_FormData_To_Send
    })

    if (!obj_Response.ok) {
      const obj_Error_Data = await obj_Response.json().catch(() => ({}))
      throw new Error(obj_Error_Data.message || `Failed to create roadshow: ${obj_Response.status}`)
    }
    
    const obj_Result = await obj_Response.json()
    
    // Create roadshow object and add to beginning of array
    const obj_New_Roadshow = Obj_Create_Roadshow_From_Response(obj_Result.data)
    arr_Roadshows.value.unshift(obj_New_Roadshow)
    
    return true
  } catch (error) {
    throw error
  }
}

/**
 * Submit update roadshow request
 * Purpose: Make API PUT request to update existing roadshow
 * Input: obj_FormData_To_Send - FormData object with roadshow data
 * Output: Boolean indicating success
 * Side effects: Updates arr_Roadshows with updated roadshow
 */
const Bln_Submit_Update_Roadshow = async (obj_FormData_To_Send: FormData): Promise<boolean> => {
  try {
    // Input validation
    if (!str_Editing_Roadshow_ID.value) {
      throw new Error('No roadshow ID available for update')
    }
    
    const str_Auth_Token = localStorage.getItem(CONST_AUTH_TOKEN_STORAGE_KEY)
    const str_Update_URL = `${CONST_API_BASE_URL}${CONST_API_ROADSHOWS_ENDPOINT}/${str_Editing_Roadshow_ID.value}`
    
    // Make PUT request
    const obj_Response = await fetch(str_Update_URL, {
      method: 'PUT',
      headers: {
        [CONST_AUTH_HEADER_KEY]: `Bearer ${str_Auth_Token}`
      },
      body: obj_FormData_To_Send
    })

    if (!obj_Response.ok) {
      const obj_Error_Data = await obj_Response.json().catch(() => ({}))
      throw new Error(obj_Error_Data.message || `Failed to update roadshow: ${obj_Response.status}`)
    }
    
    const obj_Result = await obj_Response.json()
    
    // Update roadshow in array
    const i_Index = arr_Roadshows.value.findIndex(r => r.id === str_Editing_Roadshow_ID.value)
    if (i_Index !== -1) {
      const obj_Updated_Roadshow = Obj_Create_Roadshow_From_Response(obj_Result.data)
      arr_Roadshows.value[i_Index] = obj_Updated_Roadshow
    }
    
    return true
  } catch (error) {
    throw error
  }
}

/**
 * Load roadshows from API into local array
 * Purpose: Fetch roadshows and transform API response to UI objects
 * Input: None
 * Output: Array of roadshow objects
 * Side effects: Updates arr_Roadshows
 */
const Load_Roadshows_From_API = async (): Promise<void> => {
  try {
    const str_Fetch_URL = `${CONST_API_BASE_URL}${CONST_API_ROADSHOWS_ENDPOINT}${CONST_API_LIMIT_QUERY}`
    
    const obj_Response = await fetch(str_Fetch_URL)
    if (!obj_Response.ok) {
      throw new Error(`Failed to load roadshows: ${obj_Response.status}`)
    }
    
    const obj_Result = await obj_Response.json()
    
    // Transform API response to UI objects
    arr_Roadshows.value = obj_Result.data.map((obj_Item: any) => 
      Obj_Create_Roadshow_From_Response(obj_Item)
    )
    
    console.log('Roadshow data loaded:', arr_Roadshows.value.length, 'items')
  } catch (error) {
    throw error
  }
}

/**
 * Setup auto-refresh interval for roadshows
 * Purpose: Periodically fetch and update roadshows
 * Input: None
 * Output: Interval ID stored in obj_state
 * Side effects: Sets obj_state.autoRefreshInterval
 */
const Setup_Auto_Refresh = (): void => {
  try {
    obj_state.autoRefreshInterval = window.setInterval(async () => {
      try {
        console.log('Auto-refresh roadshows...')
        await Load_Roadshows_From_API()
        const organizationResponse = await organizationAPI.getAll({ limit: 10000, public: 'false' })
        arr_Organizations.value = organizationResponse.data.data || []
      } catch (error) {
        console.error('Auto-refresh error:', error)
      }
    }, CONST_AUTO_REFRESH_INTERVAL_MS)
  } catch (error) {
    console.error('Error in Setup_Auto_Refresh:', error)
  }
}

/**
 * Component mounted lifecycle hook
 * Purpose: Initialize component, load data, setup auto-refresh
 * Input: None
 * Output: None (updates arr_Roadshows and obj_state)
 * Side effects: Fetches roadshows, sets up auto-refresh, updates obj_state
 */
onMounted(async () => {
  try {
    console.log('AdminRoadshow component mounted')
    obj_state.loading = true
    
    // Step 1: Load initial roadshows
    await Load_Roadshows_From_API()
    
    // Step 2: Setup auto-refresh interval
    Setup_Auto_Refresh()
    
    obj_state.error = null
  } catch (error) {
    obj_state.error = 'Failed to load roadshow data'
    str_Notification_Message.value = obj_state.error
    str_Notification_Type.value = 'error'
    bln_Show_Notification_Modal.value = true
    console.error('Error in onMounted:', error)
  } finally {
    obj_state.loading = false
  }
})

/**
 * Component unmount lifecycle hook
 * Purpose: Cleanup resources before component is destroyed
 * Input: None
 * Output: None (clears intervals, closes modals)
 * Side effects: Clears auto-refresh interval, closes all modals
 */
onBeforeUnmount(() => {
  try {
    console.log('AdminRoadshow component unmounting - cleaning up resources')
    
    // Step 1: Clear auto-refresh interval
    if (obj_state.autoRefreshInterval) {
      clearInterval(obj_state.autoRefreshInterval)
      obj_state.autoRefreshInterval = null
    }
    
    // Step 2: Close all modals
    bln_Show_Create_Modal.value = false
    bln_Show_Edit_Modal.value = false
    bln_Show_Delete_Modal.value = false
    
    // Step 3: Reset form data
    Reset_Form()
  } catch (error) {
    console.error('Error in onBeforeUnmount:', error)
  }
})
</script>

<style scoped>
/* =========================================================
   Admin Roadshow - Figma 1326 × 737 / Responsive Laptop + PC
   UI-only styles. API / CRUD / modal logic is unchanged.
   ========================================================= */

.admin_roadshow {
  --sidebar-width: 66px;
  --main-max-width: 1244px;
  --table-width: 1090px;
  --search-width: 1053px;
  width: 100%;
  min-height: 100dvh;
  background: #F3F4F6;
  overflow-x: hidden;
  font-family: 'Inter', sans-serif;
}

/* Main area starts after the existing AdminNavbar/sidebar. */
.admin_roadshow > .main_content {
  width: min(var(--main-max-width), calc(100% - var(--sidebar-width)));
  min-height: calc(100dvh - 67px);
  margin-left: var(--sidebar-width);
  margin-right: 0;
  padding: 0 0 32px;
  box-sizing: border-box;
  background: #F3F4F6;
  overflow-x: hidden;
  overflow-y: visible;
}

/* Figma Content starts immediately below the 67px AdminTopBar. */
.roadshow_header_section {
  position: relative;
  width: 100%;
  height: 67px;
  margin: 0;
  background: #F3F4F6;
}

.roadshow_heading {
  position: absolute;
  left: 59px;
  top: 0;
  width: 349px;
}

.roadshow_page_title {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 24px;
  line-height: 29px;
  font-weight: 700;
  color: #1F2937;
}

.roadshow_page_subtitle {
  margin: 2px 0 0;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  line-height: 16px;
  font-weight: 400;
  color: #73737A;
}

.btn_add_roadshow {
  position: absolute;
  top: 14px;
  right: 20px;
  width: 131px;
  height: 36px;
  padding: 10px 16px;
  box-sizing: border-box;
  border: 0;
  border-radius: 8px;
  background: #8B0000;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
}

.btn_add_roadshow:hover { background: #760000; }

.btn_add_roadshow .plus_icon {
  width: auto;
  height: auto;
  position: static;
  background: transparent;
  font-size: 16px;
  line-height: 16px;
  color: #FFFFFF;
}

.btn_add_roadshow .button_text {
  width: auto;
  height: 16px;
  font-size: 13px;
  line-height: 16px;
  font-weight: 600;
  color: #FFFFFF;
  white-space: nowrap;
}

/* Figma search: 1053 × 40. At smaller widths it shrinks safely. */
.roadshow_search_bar {
  width: min(var(--search-width), calc(100% - 102px));
  height: 40px;
  margin: 45px auto 23px;
  padding: 0 16px;
  box-sizing: border-box;
  border: 0.4px solid #A8A8AC;
  border-radius: 8px;
  background: #FFFFFF;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
}

.roadshow_search_bar input {
  width: 100%;
  min-width: 0;
  height: 100%;
  padding: 0;
  border: 0;
  outline: none;
  background: transparent;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  line-height: 16px;
  color: #1F2937;
}

.roadshow_search_bar input::placeholder { color: #73737A; }

.search_icon {
  width: 14px;
  height: 14px;
  flex: 0 0 14px;
  border: 1.5px solid #73737A;
  border-radius: 50%;
  position: relative;
  box-sizing: border-box;
}

.search_icon::after {
  content: '';
  position: absolute;
  width: 6px;
  height: 1.5px;
  background: #73737A;
  right: -4px;
  bottom: -2px;
  transform: rotate(45deg);
  transform-origin: left center;
}

/* Figma table: 1090 × 277. Scroll belongs to the table wrapper only. */
.roadshow_table_wrapper {
  width: min(var(--table-width), calc(100% - 102px));
  min-height: 277px;
  margin: 0 auto;
  background: #FFFFFF;
  border: 1px solid #D1D1D2;
  border-radius: 12px;
  box-sizing: border-box;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
}

.roadshow_table {
  width: var(--table-width);
  min-width: var(--table-width);
  height: 277px;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
  background: #FFFFFF;
  font-family: 'Inter', sans-serif;
}

.roadshow_table thead tr {
  height: 37px;
  background: #8B0000;
}

.roadshow_table th {
  height: 37px;
  padding: 0 10px;
  box-sizing: border-box;
  text-align: left;
  color: #FFFFFF;
  font-size: 11px;
  line-height: 13px;
  font-weight: 600;
  white-space: nowrap;
  border-right: 1px solid rgba(255, 255, 255, 0.45);
}

.roadshow_table th:last-child { border-right: 0; }

.roadshow_table tbody tr {
  height: 48px;
  background: #FFFFFF;
}

.roadshow_table td {
  height: 48px;
  padding: 0 10px;
  box-sizing: border-box;
  color: #1F2937;
  font-size: 12px;
  line-height: 15px;
  font-weight: 400;
  vertical-align: middle;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-top: 1px solid #BCBCBE;
  border-right: 1px solid #D1D1D2;
}

.roadshow_table td:last-child { border-right: 0; }

/* Exactly 5 columns: Organization | Roadshow title | Time | Location | Actions */
.col_organization { width: 300px; padding-left: 20px !important; }
.col_title { width: 320px; }
.col_time { width: 160px; }
.col_location { width: 170px; }
.col_actions { width: 140px; }

.organization_cell {
  padding-left: 20px !important;
  font-weight: 600 !important;
}

.title_cell {
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
}

.actions_cell {
  overflow: visible !important;
  text-overflow: clip !important;
  white-space: nowrap !important;
  padding-left: 10px !important;
  padding-right: 8px !important;
}

.actions_cell .table_actions {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  width: max-content;
  min-width: 100%;
}

.table_action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  padding: 0;
  margin: 0;
  border: 0;
  background: transparent;
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  line-height: 13px;
  font-weight: 400;
  color: #73737A;
  cursor: pointer;
  white-space: nowrap;
}

.table_action:hover { text-decoration: underline; }
.delete_action:hover { color: #DC2626; }

.empty_table_cell {
  height: 48px;
  text-align: center !important;
  color: #73737A !important;
}

/* Align pagination to the table's right edge. */
.roadshow_pagination_container {
  width: 218px;
  min-height: 28px;
  margin: 18px max(51px, calc((100% - var(--table-width)) / 2)) 0 auto;
}

.error_message,
.loading_message {
  min-height: 275px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  color: #73737A;
  font-size: 13px;
  text-align: center;
}

/* =========================================================
   Laptop: preserve Figma proportions while shrinking safely.
   ========================================================= */
@media (max-width: 1200px) {
  .admin_roadshow > .main_content {
    width: calc(100% - var(--sidebar-width));
  }

  .roadshow_heading {
    left: 32px;
  }

  .btn_add_roadshow {
    right: 20px;
  }

  .roadshow_search_bar,
  .roadshow_table_wrapper {
    width: calc(100% - 64px);
  }

  .roadshow_pagination_container {
    margin-right: 32px;
  }
}

@media (max-width: 900px) {
  .roadshow_header_section {
    height: auto;
    min-height: 112px;
    padding: 20px 24px 14px;
    box-sizing: border-box;
  }

  .roadshow_heading {
    position: static;
    width: calc(100% - 155px);
  }

  .btn_add_roadshow {
    top: 20px;
    right: 24px;
  }

  .roadshow_search_bar {
    width: calc(100% - 48px);
    margin: 20px 24px 23px;
  }

  .roadshow_table_wrapper {
    width: calc(100% - 48px);
    margin-inline: 24px;
  }

  .roadshow_pagination_container {
    margin-right: 24px;
  }
}

@media (max-width: 700px) {
  .admin_roadshow > .main_content {
    width: calc(100% - var(--sidebar-width));
  }

  .roadshow_header_section {
    min-height: 146px;
    padding: 18px 16px 14px;
  }

  .roadshow_heading {
    width: 100%;
  }

  .roadshow_page_title {
    font-size: 22px;
    line-height: 27px;
  }

  .roadshow_page_subtitle {
    font-size: 12px;
    line-height: 15px;
  }

  .btn_add_roadshow {
    position: static;
    margin-top: 14px;
  }

  .roadshow_search_bar {
    width: calc(100% - 32px);
    margin: 16px 16px 20px;
  }

  .roadshow_table_wrapper {
    width: calc(100% - 24px);
    margin-inline: 12px;
  }

  .roadshow_pagination_container {
    width: 218px;
    max-width: calc(100% - 24px);
    margin-right: 12px;
  }
}

/* Keep modal responsive without changing its existing functionality. */
.modal_overlay {
  padding: 16px;
  box-sizing: border-box;
  overflow-y: auto;
}

.add_roadshow_modal,
.delete_confirmation_modal {
  max-width: min(760px, calc(100vw - 32px));
  max-height: calc(100dvh - 32px);
  overflow-y: auto;
  box-sizing: border-box;
}

@media (max-width: 640px) {
  .add_roadshow_modal,
  .delete_confirmation_modal {
    width: 100%;
    max-width: 100%;
  }
}
</style>
