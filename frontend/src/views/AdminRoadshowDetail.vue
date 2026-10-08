<template>
  <div class="admin_roadshow_detail">
    <AdminNavbar />

    <AdminTopBar />

    <main class="detail_main">
      <section class="detail_content">
        <div v-if="obj_UI_State.bln_Is_Loading" class="loading_message">
          Loading roadshow details...
        </div>

        <div v-else-if="obj_UI_State.str_Error_Message" class="error_message">
          {{ obj_UI_State.str_Error_Message }}
        </div>

        <template v-else-if="obj_Roadshow_Data">
          <section class="detail_header">
            <span class="status_pill" :class="Get_Status_Class(obj_Roadshow_Data)">
              {{ Get_Status(obj_Roadshow_Data) }}
            </span>
            <h1 class="roadshow_title_detail">{{ obj_Roadshow_Data.topic || '—' }}</h1>
            <p class="organized_by">
              Organized by {{ Get_Organization_Name(obj_Roadshow_Data) }}
            </p>
          </section>

          <div class="detail_layout">
            <div class="roadshow_image_detail">
              <img
                :src="Str_Get_Image_URL(obj_Roadshow_Data.poster_path)"
                :alt="obj_Roadshow_Data.topic || 'Roadshow'"
                @error="(e) => (e.target as HTMLImageElement).src = Str_Get_Image_URL(null)"
              />
            </div>

            <section class="event_info_grid">
              <div class="info_item">
                <span>Date</span>
                <strong>{{ Format_Date(obj_Roadshow_Data.event_date || obj_Roadshow_Data.posted_date) }}</strong>
              </div>
              <div class="info_item">
                <span>Time</span>
                <strong>{{ formatRoadshowTime(obj_Roadshow_Data.time) || '—' }}</strong>
              </div>
              <div class="info_item">
                <span>Organization</span>
                <strong>{{ Get_Organization_Name(obj_Roadshow_Data) }}</strong>
              </div>
              <div class="info_item">
                <span>Location</span>
                <strong>{{ obj_Roadshow_Data.location || '—' }}</strong>
              </div>
            </section>

            <section class="description_section">
              {{ obj_Roadshow_Data.details || '—' }}
            </section>

            <section class="agenda_section">
              <h2>Agenda</h2>
              <div v-if="Array.isArray(obj_Roadshow_Data.agenda) && obj_Roadshow_Data.agenda.length">
                <div v-for="(obj_Agenda, index) in obj_Roadshow_Data.agenda" :key="index" class="agenda_row">
                  <span>{{ obj_Agenda.time || '—' }}</span>
                  <span>{{ obj_Agenda.title || obj_Agenda.activity || '—' }}</span>
                </div>
              </div>
              <div v-else class="agenda_empty">—</div>
            </section>

            <div v-if="obj_Roadshow_Data.activity_image_paths && obj_Roadshow_Data.activity_image_paths.length" class="activity_images_grid">
              <div v-for="(str_Image_Path, index) in obj_Roadshow_Data.activity_image_paths" :key="index" class="activity_image_card">
                <img :src="Str_Get_Image_URL(str_Image_Path)" :alt="`Activity photo ${Number(index) + 1}`" />
              </div>
            </div>
          </div>

          <button class="btn_back" type="button" @click="$router.back()">Back to List</button>
          <button class="btn_edit" type="button" @click="$router.back()">Edit</button>
        </template>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AdminNavbar from '../components/AdminNavbar.vue'
import AdminTopBar from '../components/admin/AdminTopBar.vue'
import { formatRoadshowTime } from '../utils/roadshowTime'
import { useLanguage } from '../composables/useLanguage'

// ============================================================================
// Constants (naming convention: ALL_CAPS)
// ============================================================================
const CONST_API_BASE_URL = 'http://localhost:5000'
const CONST_API_ENDPOINT_ROADSHOWS = '/api/roadshows'
const CONST_ERROR_LOAD_ROADSHOW = 'Failed to load roadshow details'
const CONST_ERROR_INVALID_ID = 'Invalid roadshow ID'
const CONST_ERROR_NETWORK = 'Network error occurred'
const CONST_DEFAULT_NO_IMAGE_SVG = 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27493%27 height=%27495%27%3E%3Crect fill=%27%23ddd%27 width=%27493%27 height=%27495%27/%3E%3Ctext fill=%27%23999%27 x=%2750%25%27 y=%2750%25%27 dominant-baseline=%27middle%27 text-anchor=%27middle%27 font-family=%27sans-serif%27 font-size=%2720%27%3ENo Image%3C/text%3E%3C/svg%3E'

// ============================================================================
// State Management (naming convention: obj_State_Name)
// ============================================================================
const obj_UI_State = reactive({
  bln_Is_Loading: false,                 // Boolean: whether data is loading
  str_Error_Message: null as string | null  // String: error message to display
})

const obj_Roadshow_Data = ref<any>(null)  // Object: roadshow details from API

const route = useRoute()
const { currentLanguage } = useLanguage()

function Get_Organization_Name(obj_Roadshow: any): string {
  const obj_Organization = obj_Roadshow?.organization_id
  if (obj_Organization && typeof obj_Organization === 'object') {
    return currentLanguage.value === 'TH'
      ? obj_Organization.organization_name_th || obj_Organization.name_th || '—'
      : obj_Organization.organization_name_en || obj_Organization.name_en || '—'
  }
  return obj_Roadshow?.organization || obj_Roadshow?.organization_name || '—'
}

// ============================================================================
// Function: Str_Get_Image_URL
// Purpose: Generate image URL with fallback to default SVG
// Input: str_Image_Path (string | null) - Image path from server
// Output: string - Complete image URL
// ============================================================================
function Str_Get_Image_URL(str_Image_Path: string | null): string {
  // Validation: Check if image path exists and is valid
  if (!str_Image_Path || typeof str_Image_Path !== 'string') {
    return CONST_DEFAULT_NO_IMAGE_SVG
  }
  
  // Return complete URL by combining base URL with image path
  return `${CONST_API_BASE_URL}${str_Image_Path}`
}

// ============================================================================
// Function: Get_Status
// Purpose: Convert roadshow data into the status text shown in the detail page
// ============================================================================
function Get_Status(obj_Roadshow: any): string {
  if (!obj_Roadshow) return 'Upcoming'

  if (obj_Roadshow.deleted_date) {
    const obj_Deleted_Date = new Date(obj_Roadshow.deleted_date)
    if (!Number.isNaN(obj_Deleted_Date.getTime())) {
      const obj_Today = new Date()
      obj_Today.setHours(0, 0, 0, 0)
      if (obj_Deleted_Date.getTime() < obj_Today.getTime()) {
        return 'Completed'
      }
    }
  }

  return obj_Roadshow.isPublic ? 'Active' : 'Upcoming'
}

// ============================================================================
// Function: Get_Status_Class
// Purpose: Return CSS class matching the current roadshow status
// ============================================================================
function Get_Status_Class(obj_Roadshow: any): string {
  const str_Status = Get_Status(obj_Roadshow)

  if (str_Status === 'Completed') return 'status_completed'
  if (str_Status === 'Active') return 'status_active'
  return 'status_upcoming'
}

// ============================================================================
// Function: Format_Date
// Purpose: Format a date for the Roadshow detail page
// ============================================================================
function Format_Date(str_Date: string | null | undefined): string {
  if (!str_Date) return '—'

  const obj_Date = new Date(str_Date)
  if (Number.isNaN(obj_Date.getTime())) return String(str_Date)

  return obj_Date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

// ============================================================================
// Function: Format_Date_Time
// Purpose: Format date and time values used by the Additional Information panel
// ============================================================================
function Format_Date_Time(str_Date_Time: string | null | undefined): string {
  if (!str_Date_Time) return '—'

  const obj_Date = new Date(str_Date_Time)
  if (Number.isNaN(obj_Date.getTime())) return String(str_Date_Time)

  return obj_Date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

// ============================================================================
// Function: Bln_Validate_Roadshow_ID
// Purpose: Validate that roadshow ID exists and is valid
// Input: str_ID (any) - Roadshow ID to validate
// Output: boolean - true if valid, false otherwise
// ============================================================================
function Bln_Validate_Roadshow_ID(str_ID: any): boolean {
  // Check if ID exists
  if (!str_ID) {
    obj_UI_State.str_Error_Message = CONST_ERROR_INVALID_ID
    return false
  }
  
  // Check if ID is a string
  if (typeof str_ID !== 'string') {
    obj_UI_State.str_Error_Message = CONST_ERROR_INVALID_ID
    return false
  }
  
  // ID validation successful
  return true
}

// ============================================================================
// Function: Load_Roadshow_Details
// Purpose: Fetch roadshow data from API and populate component state
// Input: None (uses route.params.id from Vue Router)
// Output: Promise<void>
// Side Effects: Updates obj_Roadshow_Data and obj_UI_State
// ============================================================================
async function Load_Roadshow_Details(): Promise<void> {
  let str_Roadshow_ID = ''
  
  try {
    // Step 1: Validate input - Roadshow ID from URL
    str_Roadshow_ID = route.params.id as string
    if (!Bln_Validate_Roadshow_ID(str_Roadshow_ID)) {
      return
    }
    
    // Step 2: Reset error and set loading state
    obj_UI_State.bln_Is_Loading = true
    obj_UI_State.str_Error_Message = null
    
    // Step 3: Retrieve authentication token
    const str_Auth_Token = localStorage.getItem('auth_token')
    if (!str_Auth_Token) {
      throw new Error('Authentication token not found')
    }
    
    // Step 4: Construct API request URL
    const str_API_URL = `${CONST_API_BASE_URL}${CONST_API_ENDPOINT_ROADSHOWS}/${str_Roadshow_ID}`
    
    console.log('Loading roadshow details for ID:', str_Roadshow_ID)
    
    // Step 5: Fetch data from API
    const response = await fetch(str_API_URL, {
      headers: {
        'Authorization': `Bearer ${str_Auth_Token}`
      }
    })
    
    // Step 6: Check if response is successful
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`)
    }
    
    // Step 7: Parse JSON response
    const obj_Response = await response.json()
    
    // Step 8: Validate response data
    if (!obj_Response.data) {
      throw new Error('Invalid response format: missing data')
    }
    
    // Step 9: Update component data
    obj_Roadshow_Data.value = obj_Response.data
    console.log('Roadshow details loaded successfully:', obj_Roadshow_Data.value)
    
  } catch (error) {
    // Error handling: Log and display user-friendly message
    console.error('Error loading roadshow details:', error)
    
    // Determine appropriate error message
    if (error instanceof Error) {
      if (error.message.includes('HTTP')) {
        obj_UI_State.str_Error_Message = CONST_ERROR_LOAD_ROADSHOW
      } else if (error.message.includes('fetch')) {
        obj_UI_State.str_Error_Message = CONST_ERROR_NETWORK
      } else {
        obj_UI_State.str_Error_Message = error.message
      }
    } else {
      obj_UI_State.str_Error_Message = CONST_ERROR_LOAD_ROADSHOW
    }
    
  } finally {
    // Always reset loading state
    obj_UI_State.bln_Is_Loading = false
  }
}

// ============================================================================
// Vue Lifecycle Hook: onMounted
// Purpose: Initialize component by loading roadshow data when component mounts
// ============================================================================
onMounted(async () => {
  await Load_Roadshow_Details()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

/* =========================================================
   Roadshow Detail — Figma 1326 × 737
   Sidebar = 66px | Main content starts at x = 80px
   The 1244px design frame is preserved on PC/Laptop.
   Smaller screens can scroll horizontally instead of breaking
   the Figma layout.
   ========================================================= */
.admin_roadshow_detail {
  position: relative;
  width: 100%;
  min-width: 1100px;
  min-height: 100vh;
  background: #FFFFFF;
  overflow-x: auto;
  overflow-y: auto;
  font-family: 'Inter', sans-serif;
  color: #1F2937;
}

/* Layout shell: sidebar = 66px; Figma content starts at x=80px */
.detail_main {
  position: relative;
  width: calc(100% - 66px);
  min-width: 1244px;
  min-height: 670px;
  margin-left: 66px;
  margin-top: 0;
  padding-left: 14px;
  box-sizing: border-box;
  background: #F3F4F6;
  overflow-x: visible;
}

/* Figma detail frame = 1244px wide. It starts immediately
   below the 67px TopBar supplied by AdminTopBar. */
.detail_content {
  position: relative;
  width: 1244px;
  min-width: 1244px;
  height: 654px;
  margin: 0;
  background: #FFFFFF;
  overflow: visible;
}

/* ---------------------------------------------------------
   Header: x=61, y=0 relative to content
   --------------------------------------------------------- */
.detail_header {
  position: absolute;
  left: 61px;
  top: 0;
  width: 603px;
  height: 88px;
}

.status_pill {
  position: absolute;
  left: 0;
  top: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 18px;
  padding: 3px 8px;
  box-sizing: border-box;
  border-radius: 10px;
  color: #FFFFFF;
  font-size: 10px;
  line-height: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.status_upcoming { width: 66px; background: #0A48A6; }
.status_active { width: 55px; background: #F11408; }
.status_completed { width: 70px; background: #22C55E; }

.roadshow_title_detail {
  position: absolute;
  left: 0;
  top: 24px;
  width: 540px;
  height: 29px;
  margin: 0;
  color: #1F2937;
  font-size: 24px;
  line-height: 29px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.organized_by {
  position: absolute;
  left: 0;
  top: 59px;
  width: 540px;
  height: 17px;
  margin: 0;
  color: #73737A;
  font-size: 14px;
  line-height: 17px;
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail_layout {
  position: absolute;
  inset: 0;
}

/* Figma image: x=60, y=88, 603×531 */
.roadshow_image_detail {
  position: absolute;
  left: 60px;
  top: 88px;
  width: 603px;
  height: 531px;
  overflow: hidden;
  background: #F3F4F6;
}

.roadshow_image_detail img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ---------------------------------------------------------
   Event information: exact Figma positions
   Organization x=751 y=24
   Date x=751 y=78
   Time x=950 y=78
   Location x=1086 y=78
   --------------------------------------------------------- */
.event_info_grid {
  position: absolute;
  left: 751px;
  top: 24px;
  width: 378px;
  height: 83px;
}

.info_item {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: #FFFFFF;
  min-width: 0;
}

.info_item span {
  color: #73737A;
  font-size: 10px;
  line-height: 12px;
  font-weight: 400;
}

.info_item strong {
  color: #1F2937;
  font-size: 12px;
  line-height: 15px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info_item:nth-child(1) { left: 0; top: 54px; width: 141px; }
.info_item:nth-child(2) { left: 199px; top: 54px; width: 78px; }
.info_item:nth-child(3) { left: 0; top: 0; width: 150px; }
.info_item:nth-child(4) { left: 335px; top: 54px; width: 43px; }

/* Figma description: x=831, y=217, width=417 */
.description_section {
  position: absolute;
  left: 831px;
  top: 217px;
  width: 417px;
  min-height: 68px;
  color: #000000;
  font-size: 14px;
  line-height: 17px;
  font-weight: 400;
  overflow-wrap: anywhere;
}

/* Figma agenda: x=830, y=306, width=420 */
.agenda_section {
  position: absolute;
  left: 830px;
  top: 306px;
  width: 420px;
  color: #1F2937;
}

.agenda_section h2 {
  margin: 0 0 7px;
  font-size: 14px;
  line-height: 17px;
  font-weight: 400;
}

.agenda_row {
  display: flex;
  gap: 16px;
  width: 420px;
  min-height: 15px;
  margin-bottom: 5px;
  font-size: 12px;
  line-height: 15px;
  font-weight: 400;
}

.agenda_row span:first-child {
  width: 100px;
  flex: 0 0 100px;
  color: #000000;
}

.agenda_row span:last-child {
  min-width: 0;
  color: #1F2937;
}

.agenda_empty {
  font-size: 12px;
}

/* ---------------------------------------------------------
   Additional information
   The supplied Figma coordinate (x=1300) is outside the 1326px
   canvas, so it is intentionally kept out of the visible 1244px
   detail frame instead of covering Agenda/Back/Edit.
   It remains available below the detail content when data exists.
   --------------------------------------------------------- */

.additional_row {
  display: flex;
  gap: 12px;
  width: 100%;
  min-height: 15px;
  margin-bottom: 7px;
}

.additional_row span {
  width: 90px;
  flex: 0 0 90px;
  color: #73737A;
  font-size: 11px;
  line-height: 13px;
  font-weight: 600;
}

.additional_row strong {
  min-width: 0;
  color: #1F2937;
  font-size: 12px;
  line-height: 15px;
  font-weight: 400;
  overflow-wrap: anywhere;
}

/* Figma Back: x=997, y=590, 96×31 */
.btn_back {
  position: absolute;
  left: 997px;
  top: 590px;
  width: 96px;
  height: 31px;
  box-sizing: border-box;
  padding: 8px 14px;
  border: 1px solid #D9D9DB;
  border-radius: 8px;
  background: #FFFFFF;
  color: #000000;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  line-height: 15px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

/* Figma Edit: x=1184, y=671, 57×32 */
.btn_edit {
  position: absolute;
  left: 1184px;
  top: 671px;
  width: 57px;
  height: 32px;
  padding: 8px 16px;
  box-sizing: border-box;
  border: 0;
  border-radius: 8px;
  background: #8B0000;
  color: #FFFFFF;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  line-height: 16px;
  font-weight: 600;
  cursor: pointer;
}

.btn_back:hover { background: #F3F4F6; }
.btn_edit:hover { background: #600606; }

.activity_images_grid {
  position: absolute;
  left: 60px;
  top: 635px;
  width: 603px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.activity_image_card {
  height: 120px;
  overflow: hidden;
  border-radius: 8px;
  background: #F3F4F6;
}

.activity_image_card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.loading_message {
  padding: 40px;
  color: #73737A;
  font-size: 14px;
  text-align: center;
}

.error_message {
  margin: 20px;
  padding: 16px;
  border: 1px solid #FECACA;
  border-radius: 8px;
  background: #FEE2E2;
  color: #DC2626;
  font-size: 14px;
}

/* =========================================================
   Laptop / PC behavior
   1326px and above: exact Figma coordinates.
   Below 1326px: preserve the design frame and allow horizontal
   scrolling; do not squeeze individual Figma elements.
   ========================================================= */
@media (max-width: 1325px) {
  .admin_roadshow_detail {
    min-width: 1326px;
  }

  .detail_main {
    width: calc(100% - 66px);
    min-width: 1260px;
    margin-left: 66px;
  }
}

@media (min-width: 1326px) {
  .detail_main {
    width: calc(100% - 66px);
  }
}
</style>
