<template>
  <div class="admin_roadshow">
    <AdminNavbar />
    
    <!-- Roadshow Title -->
    <h1 class="roadshow_title">Roadshow</h1>
    
    <!-- Add Roadshow Button -->
    <button class="btn_add_roadshow" @click="bln_Show_Create_Modal = true">
      <div class="plus_icon"></div>
      <span class="button_text">Add Roadshow</span>
    </button>

    <!-- Roadshow Cards Container -->
    <div class="roadshow_cards_container">
      <div v-if="obj_state.error" class="error_message">
        {{ obj_state.error }}
      </div>
      <div v-if="obj_state.loading && arr_Roadshows.length === 0" class="loading_message">
        Loading roadshows...
      </div>
      <div 
        v-for="roadshow in Arr_Get_Paginated_Roadshows" 
        :key="roadshow.id" 
        class="roadshow_large_card"
        @click="$router.push(`/admin/roadshow/${roadshow.id}`)"
      >
        <!-- Roadshow Image -->
        <div class="roadshow_image_large">
          <img 
            :src="roadshow.image" 
            :alt="roadshow.title"
            @error="(e) => (e.target as HTMLImageElement).src = CONST_EMPTY_IMAGE_SVG"
          />
        </div>
        
        <!-- Roadshow Content -->
        <div class="roadshow_content">
          <h2 class="roadshow_title_large">{{ roadshow.title }}</h2>
          <p class="roadshow_description">{{ roadshow.description }}</p>
        </div>
        
        <!-- Edit Icon -->
        <div class="edit_icon_large" @click.stop="Edit_Roadshow(roadshow)">
          <div class="pencil_icon_large"></div>
        </div>
        
        <!-- Delete Icon -->
        <div class="delete_icon_large" @click.stop="Confirm_Delete_Roadshow(roadshow)">
          <div class="trash_icon_large"></div>
        </div>

        <!-- Countdown Timer Badge -->
        <div v-if="roadshow.deleted_date" class="countdown_badge" :class="Get_Countdown_Status(roadshow.deleted_date)">
          <span class="countdown_number">{{ Get_Days_Until_Deletion(roadshow.deleted_date) }}</span>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="roadshow_pagination_container">
      <Pagination 
        :current-page="obj_state.currentPage"
        :total-pages="i_Get_Total_Pages"
        :total-items="arr_Roadshows.length"
        :loading="obj_state.loading"
        :show-info="false"
        @page-change="Handle_Page_Change"
      />
    </div>
    
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

        <!-- Posted Date Field -->
        <div class="form_group">
          <label>Posted Date*</label>
          <div class="date_input_wrapper">
            <input 
              type="date" 
              v-model="obj_Form_Data.posted_date"
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
import NotificationModal from '../components/NotificationModal.vue'
import Pagination from '../components/Pagination.vue'

// ===========================
// CONSTANTS
// ===========================
const CONST_API_BASE_URL = 'http://localhost:5000'
const CONST_API_ROADSHOWS_ENDPOINT = '/api/roadshows'
const CONST_AUTH_HEADER_KEY = 'Authorization'
const CONST_AUTH_TOKEN_STORAGE_KEY = 'auth_token'
const CONST_AUTO_REFRESH_INTERVAL_MS = 45000 // 45 seconds
const CONST_ITEMS_PER_PAGE = 2
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
const i_Get_Total_Pages = computed(() => 
  Math.ceil(arr_Roadshows.value.length / obj_state.itemsPerPage)
)

/**
 * Get paginated roadshows array for current page
 * Purpose: Slice roadshows array based on current page and items per page
 * Input: obj_state.currentPage, obj_state.itemsPerPage, arr_Roadshows.value
 * Output: Array of roadshows for current page
 * Side effects: None
 */
const Arr_Get_Paginated_Roadshows = computed(() => {
  const i_Start = (obj_state.currentPage - 1) * obj_state.itemsPerPage
  const i_End = i_Start + obj_state.itemsPerPage
  return arr_Roadshows.value.slice(i_Start, i_End)
})

/**
 * Computed property for Posted Date in display format (mm/dd/yyyy)
 * Purpose: Provide bidirectional sync between storage format and display format
 * Input: obj_Form_Data.posted_date (YYYY-MM-DD)
 * Output: Display as mm/dd/yyyy, accept input and convert to YYYY-MM-DD
 * Side effects: Updates obj_Form_Data.posted_date when changed
 */
const str_Posted_Date_Display = computed({
  get: () => Format_Date_To_Display(obj_Form_Data.posted_date),
  set: (str_Value: string) => {
    obj_Form_Data.posted_date = Format_Date_To_Storage(str_Value)
  }
})

/**
 * Computed property for Deleted Date in display format (mm/dd/yyyy)
 * Purpose: Provide bidirectional sync between storage format and display format
 * Input: obj_Form_Data.deleted_date (YYYY-MM-DD)
 * Output: Display as mm/dd/yyyy, accept input and convert to YYYY-MM-DD
 * Side effects: Updates obj_Form_Data.deleted_date when changed
 */
const str_Deleted_Date_Display = computed({
  get: () => Format_Date_To_Display(obj_Form_Data.deleted_date),
  set: (str_Value: string) => {
    obj_Form_Data.deleted_date = Format_Date_To_Storage(str_Value)
  }
})

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
  
  const obj_Result = {
    id: obj_Response_Data._id,
    title: obj_Response_Data.topic,
    description: obj_Response_Data.details,
    image: Str_Get_Image_URL(obj_Response_Data.poster_path),
    isPublic: obj_Response_Data.is_public,
    posted_date: Extract_Date_Part(obj_Response_Data.posted_date),
    deleted_date: Extract_Date_Part(obj_Response_Data.deleted_date),
    activityImagePaths: obj_Response_Data.activity_image_paths || []
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
    if (!obj_Form_Data.posted_date) {
      throw new Error('Posted Date is required')
    }

    obj_state.loading = true
    
    // Step 2: Build FormData with all fields
    const obj_FormData_To_Send = new FormData()
    obj_FormData_To_Send.append('topic', obj_Form_Data.topic.trim())
    obj_FormData_To_Send.append('details', obj_Form_Data.details.trim())
    obj_FormData_To_Send.append('posted_date', obj_Form_Data.posted_date)
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
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Inter:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');

.admin_roadshow {
  position: relative;
  width: 100vw;
  height: 918px;
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

/* Header Section */
.header_section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page_title {
  margin: 0;
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 40px;
  line-height: 50px;
  color: #000000;
}

.add_roadshow_btn {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 6px 10px;
  gap: 6px;
  width: 166px;
  height: 32px;
  background: #C70000;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: #FFFFFF;
}

.plus_icon {
  width: 20px;
  height: 20px;
  position: relative;
  flex: none;
  order: 0;
  flex-grow: 0;
}

.plus_icon::before,
.plus_icon::after {
  content: '';
  position: absolute;
  background: #FFFFFF;
  border-radius: 1px;
}

.plus_icon::before {
  width: 12px;
  height: 2px;
  left: 4px;
  top: 9px;
}

.plus_icon::after {
  width: 2px;
  height: 12px;
  left: 9px;
  top: 4px;
}

.button_text {
  width: 99px;
  height: 20px;
  
  font-family: 'DM Sans', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #FFFFFF;
  
  flex: none;
  order: 1;
  flex-grow: 0;
}

/* Roadshow Cards Grid */
.roadshow_cards_grid {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 0px;
  gap: 42px;
  flex-wrap: wrap;
  margin-bottom: 30px;
}

.roadshow_card {
  position: relative;
  width: 271px;
  height: 350px;
  background: #FFFFFF;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.roadshow_card:hover {
  transform: translateY(-4px);
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.15);
}

.roadshow_image {
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.roadshow_image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.roadshow_card:hover .roadshow_image img {
  transform: scale(1.05);
}

/* Main Roadshow Title */
.roadshow_title {
  position: absolute;
  width: 188px;
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

/* Add Roadshow Button */
.btn_add_roadshow {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 6px 10px;
  gap: 6px;
  
  position: absolute;
  width: 145px;
  height: 32px;
  left: 1156px;
  top: 66px;
  
  background: #C70000;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn_add_roadshow:hover {
  background: #A50000;
}

.plus_icon {
  width: 20px;
  height: 20px;
  position: relative;
  flex: none;
  order: 0;
  flex-grow: 0;
}

.plus_icon::before,
.plus_icon::after {
  content: '';
  position: absolute;
  background: #FFFFFF;
  border-radius: 1px;
}

.plus_icon::before {
  width: 12px;
  height: 2px;
  left: 4px;
  top: 9px;
}

.plus_icon::after {
  width: 2px;
  height: 12px;
  left: 9px;
  top: 4px;
}

.button_text {
  width: 99px;
  height: 20px;
  
  font-family: 'DM Sans', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #FFFFFF;
  
  flex: none;
  order: 1;
  flex-grow: 0;
}

/* Roadshow Cards Container */
.roadshow_cards_container {
  position: absolute;
  left: 273px;
  top: 152px;
  width: 1035px;
}

.error_message {
  background: #FEE2E2;
  border: 1px solid #FECACA;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
  color: #DC2626;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
}

.loading_message {
  text-align: center;
  padding: 20px;
  color: #6B7280;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
}

/* Large Roadshow Card */
.roadshow_large_card {
  position: relative;
  width: 1035px;
  height: 287px;
  margin-bottom: 25px;
  
  background: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 15px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  
  display: flex;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.roadshow_large_card:hover {
  transform: translateY(-2px);
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.15);
}

/* Large Roadshow Image */
.roadshow_image_large {
  width: 270.72px;
  height: 271.7px;
  margin: 8px 0 0 37px;
  overflow: hidden;
  border-radius: 8px;
  background: #f5f5f5;
}

.roadshow_image_large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Roadshow Content */
.roadshow_content {
  flex: 1;
  padding: 17px 20px 20px 40px;
  display: flex;
  flex-direction: column;
}

/* Large Roadshow Title */
.roadshow_title_large {
  margin: 0 0 15px 0;
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 32px;
  line-height: 40px;
  color: #000000;
}

/* Roadshow Description */
.roadshow_description {
  margin: 0;
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 20px;
  line-height: 25px;
  color: #000000;
  flex: 1;
}

/* Countdown Badge */
.countdown_badge {
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-family: 'DM Sans', sans-serif;
  font-size: 16px;
  font-weight: 700;
  background: #E5E7EB;
  color: #374151;
  border: 2px solid #D1D5DB;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
  transition: all 0.3s ease;
}

.countdown_number {
  margin: 0;
  line-height: 1;
  display: inline-block;
  min-width: 24px;
  text-align: center;
}

/* Status: Safe (more than 7 days) */
.countdown_badge.status_safe {
  background: #D1FAE5;
  color: #047857;
  border-color: #6EE7B7;
}

/* Status: Warning (3-7 days) */
.countdown_badge.status_warning {
  background: #FEF3C7;
  color: #92400E;
  border-color: #FCD34D;
}

/* Status: Critical (0-3 days) */
.countdown_badge.status_critical {
  background: #FEE2E2;
  color: #991B1B;
  border-color: #FCA5A5;
  animation: pulse_critical 2s ease-in-out infinite;
}

/* Status: Expired (past date) */
.countdown_badge.status_expired {
  background: #F3F4F6;
  color: #6B7280;
  border-color: #D1D5DB;
  opacity: 0.6;
}

/* Pulse animation for critical status */
@keyframes pulse_critical {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

/* Large Edit Icon */
.edit_icon_large {
  position: absolute;
  width: 29.17px;
  height: 26.5px;
  right: 20px;
  top: 20px;
  
  background: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 6px;
  
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit_icon_large:hover {
  background: #f5f5f5;
  transform: scale(1.05);
}

/* Large Delete Icon */
.delete_icon_large {
  position: absolute;
  width: 29.17px;
  height: 26.5px;
  right: 20px;
  top: 56px;
  
  background: #FFFFFF;
  border: 1px solid #DC2626;
  border-radius: 6px;
  
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete_icon_large:hover {
  background: #FEE2E2;
  transform: scale(1.05);
}

/* Large Pencil Icon */
.pencil_icon_large {
  width: 24.31px;
  height: 22.08px;
  background: #000;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z'/%3E%3C/svg%3E") no-repeat;
  mask-size: contain;
}

/* Large Trash Icon */
.trash_icon_large {
  width: 20px;
  height: 20px;
  background: #DC2626;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z'/%3E%3C/svg%3E") no-repeat;
  mask-size: contain;
}

.roadshow_date {
  padding: 0px 20px 15px 20px;
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 15px;
  color: #767676;
  text-align: left;
}

.edit_icon {
  position: absolute;
  width: 32px;
  height: 32px;
  right: 12px;
  top: 12px;
  z-index: 3;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0;
  transform: scale(0.8);
}

.roadshow_card:hover .edit_icon {
  opacity: 1;
  transform: scale(1);
}

.edit_icon:hover {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
}

.pencil_icon {
  width: 14px;
  height: 14px;
  background: #666;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z'/%3E%3C/svg%3E") no-repeat;
  mask-size: contain;
  transition: background 0.2s ease;
}

.edit_icon:hover .pencil_icon {
  background: #333;
}

/* Roadshow Pagination Container */
.roadshow_pagination_container {
  position: absolute;
  left: 1090px;
  top: 780px;
  width: 218px;
  height: 28px;
}

.plus_line_h, .plus_line_v {
  position: absolute;
  background: #FFFFFF;
}

.plus_line_h {
  width: 12px;
  height: 2px;
  left: 4px;
  top: 9px;
}

.plus_line_v {
  width: 2px;
  height: 12px;
  left: 9px;
  top: 4px;
}

.button_text {
  width: 99px;
  height: 20px;
  
  font-family: 'DM Sans', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #FFFFFF;
}

.roadshow_card {
  position: absolute;
  width: 1035px;
  height: 287px;
  left: 273px;
  top: 152px;
  
  background: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 15px;
  display: flex;
}

.roadshow_image {
  width: 350px;
  height: 272px;
  flex-shrink: 0;
}

.roadshow_image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  background: #e0e0e0;
}

.roadshow_content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.roadshow_title {
  margin: 0 0 24px 0;
  
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 32px;
  line-height: 40px;
  color: #000000;
}

.roadshow_description {
  margin: 0;
  
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 20px;
  line-height: 25px;
  color: #000000;
  max-width: 600px;
}

.edit_icon {
  position: absolute;
  width: 29.17px;
  height: 26.5px;
  
  background: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bottom_edit {
  right: 77px;
  top: 248px;
}

.pencil_icon {
  width: 24.31px;
  height: 22.08px;
  background: #666;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z'/%3E%3C/svg%3E") no-repeat;
  mask-size: contain;
}

/* Modal Styles */
.modal_overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.add_roadshow_modal {
  background: #FFFFFF;
  border-radius: 12px;
  width: 850px;
  height: 689px;
  overflow-y: auto;
  padding: 40px;
  box-sizing: border-box;
}

.modal_title {
  margin: 0;
  font-family: 'Outfit', sans-serif;
  font-size: 28px;
  font-weight: 600;
  color: #000000;
  margin-bottom: 24px;
}

.form_divider {
  height: 1px;
  background-color: #767676;
  margin-bottom: 24px;
}

.date_input_wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.date_input_wrapper input {
  width: 100%;
  padding: 10px 12px;
  padding-right: 36px;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  box-sizing: border-box;
  background-color: #FFFFFF;
  color: #000000;
  cursor: pointer;
  transition: all 0.2s ease;
}

.date_input_wrapper input:hover {
  border-color: #9CA3AF;
  background-color: #F9FAFB;
}

.date_input_wrapper input:focus {
  outline: none;
  border-color: #C70000;
  box-shadow: 0 0 0 3px rgba(199, 0, 0, 0.1);
  background-color: #FFFFFF;
}

/* Chrome/Edge calendar picker styling */
.date_input_wrapper input::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.date_input_wrapper input::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}

.calendar_icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  font-size: 18px;
  color: #6B7280;
  opacity: 0.6;
}

.upload_section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.upload_section label {
  display: block;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 13px;
  color: #6B7280;
}

.upload_btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background: #F3F4F6;
  border: 2px dashed #D1D5DB;
  border-radius: 6px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #6B7280;
  transition: all 0.3s ease;
}

.upload_btn:hover {
  border-color: #AB1C03;
  background: #FEF2F2;
  color: #AB1C03;
}

.upload_icon {
  font-size: 18px;
}

.upload_btn input[type="file"] {
  display: none;
}

.image_preview {
  position: relative;
  width: 100%;
  height: 200px;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  overflow: hidden;
  margin-top: 8px;
  background: #F3F4F6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image_preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.remove_preview_btn {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 6px 12px;
  background: #DC2626;
  border: none;
  border-radius: 4px;
  color: #FFFFFF;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove_preview_btn:hover {
  background: #B91C1C;
}

.file_selected {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: #F0F9FF;
  border: 1px solid #92CDF0;
  border-radius: 6px;
  margin-top: 8px;
  gap: 8px;
}

.file_list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
  max-height: 200px;
  overflow-y: auto;
}

.file_item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: #F0F9FF;
  border: 1px solid #92CDF0;
  border-radius: 6px;
  gap: 8px;
}

.file_name {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: #0369A1;
  font-weight: 500;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove_btn {
  padding: 4px 12px;
  background: #FEE2E2;
  border: 1px solid #FECACA;
  border-radius: 4px;
  color: #DC2626;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.remove_btn:hover {
  background: #FCA5A5;
  border-color: #DC2626;
}

.public_toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.public_toggle label {
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #374151;
}

.toggle_switch {
  width: 44px;
  height: 24px;
  background: #D1D5DB;
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: background 0.3s ease;
}

.toggle_switch.active {
  background: #AB1C03;
}

.toggle_slider {
  width: 20px;
  height: 20px;
  background: #FFFFFF;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: left 0.3s ease;
}

.toggle_switch.active .toggle_slider {
  left: 22px;
}

.modal_actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn_cancel {
  padding: 8px 20px;
  background: #FFFFFF;
  border: 1px solid #D1D5DB;
  border-radius: 20px;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  width: 77px;
  height: 23px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn_cancel:hover {
  background: #F9FAFB;
  border-color: #9CA3AF;
}

.btn_save {
  padding: 8px 20px;
  background: #AB1C03;
  border: none;
  border-radius: 20px;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 13px;
  color: #FFFFFF;
  cursor: pointer;
  width: 77px;
  height: 23px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn_save:hover {
  background: #8B1600;
}

.form_group {
  margin-bottom: 20px;
}

.form_group.full_width {
  width: 100%;
}

.form_group label {
  display: block;
  margin-bottom: 8px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #374151;
}

.form_group input,
.form_group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  box-sizing: border-box;
}

.form_group input:focus,
.form_group textarea:focus {
  outline: none;
  border-color: #AB1C03;
  box-shadow: 0 0 0 3px rgba(171, 28, 3, 0.1);
}

.textarea_lg {
  min-height: 128px;
  resize: vertical;
}

/* Delete Confirmation Modal */
.delete_confirmation_modal {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15);
}

.delete_message {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  color: #374151;
  margin: 20px 0;
  line-height: 1.5;
}

.btn_delete {
  padding: 8px 20px;
  background: #DC2626;
  border: none;
  border-radius: 20px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 13px;
  color: #FFFFFF;
  cursor: pointer;
  width: 77px;
  height: 23px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.btn_delete:hover {
  background: #B91C1C;
}

/* Existing Image Section */
.existing_image_section {
  margin-bottom: 20px;
  padding: 16px;
  background: #F0FDF4;
  border: 2px solid #86EFAC;
  border-radius: 8px;
}

.existing_label {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #15803D;
  margin: 0 0 12px 0;
}

.existing_image_preview {
  position: relative;
  width: 150px;
  height: 150px;
  background: #F3F4F6;
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.existing_image_preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.delete_existing_btn {
  position: absolute;
  bottom: 8px;
  right: 8px;
  padding: 6px 10px;
  background: #DC2626;
  border: none;
  border-radius: 4px;
  color: #FFFFFF;
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete_existing_btn:hover {
  background: #B91C1C;
}

/* Deletion Notice */
.deletion_notice {
  margin-bottom: 20px;
  padding: 12px 16px;
  background: #FEF2F2;
  border: 2px solid #FECACA;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.deletion_notice p {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #DC2626;
  margin: 0;
}

.undo_delete_btn {
  padding: 6px 12px;
  background: #FFFFFF;
  border: 1px solid #FECACA;
  border-radius: 4px;
  color: #DC2626;
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.undo_delete_btn:hover {
  background: #FEE2E2;
  border-color: #DC2626;
}

/* Existing Images Section (Multiple) */
.existing_images_section {
  margin-bottom: 20px;
  padding: 16px;
  background: #F0FDF4;
  border: 2px solid #86EFAC;
  border-radius: 8px;
}

.existing_images_grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.existing_image_card {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  background: #F3F4F6;
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #D1D5DB;
}

.existing_image_card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.delete_image_btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 28px;
  height: 28px;
  background: #DC2626;
  border: none;
  border-radius: 50%;
  color: #FFFFFF;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
}

.existing_image_card:hover .delete_image_btn {
  opacity: 1;
}

.delete_image_btn:hover {
  background: #B91C1C;
  transform: scale(1.1);
}

.deletion_summary {
  padding: 12px;
  background: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.deletion_summary p {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #DC2626;
  margin: 0;
}

.undo_all_btn {
  padding: 6px 12px;
  background: #FFFFFF;
  border: 1px solid #FECACA;
  border-radius: 4px;
  color: #DC2626;
  font-family: 'Inter', sans-serif;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.undo_all_btn:hover {
  background: #FEE2E2;
  border-color: #DC2626;
}

</style>

