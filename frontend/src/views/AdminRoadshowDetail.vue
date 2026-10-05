<template>
  <div class="admin_roadshow_detail">
    <AdminNavbar />
    
    <!-- Back Button -->
    <button class="btn_back" @click="$router.back()">
      <span class="back_arrow">←</span>
    </button>

    <!-- Detail Card -->
    <div class="detail_card">
      <!-- Loading State -->
      <div v-if="obj_UI_State.bln_Is_Loading" class="loading_message">
        Loading roadshow details...
      </div>
      
      <!-- Error State -->
      <div v-else-if="obj_UI_State.str_Error_Message" class="error_message">
        {{ obj_UI_State.str_Error_Message }}
      </div>
      
      <!-- Success State: Display roadshow details -->
      <div v-else-if="obj_Roadshow_Data">
        <!-- Title -->
        <h1 class="roadshow_title_detail">{{ obj_Roadshow_Data.topic }}</h1>
        
        <!-- Poster Image -->
        <div class="roadshow_image_detail">
          <img 
            :src="Str_Get_Image_URL(obj_Roadshow_Data.poster_path)"
            :alt="obj_Roadshow_Data.topic"
            @error="(e) => (e.target as HTMLImageElement).src = Str_Get_Image_URL(null)"
          />
        </div>
        
        <!-- Description -->
        <div class="roadshow_description_detail">
          {{ obj_Roadshow_Data.details }}
        </div>

        <!-- Activity Images Grid -->
        <div v-if="obj_Roadshow_Data.activity_image_paths && obj_Roadshow_Data.activity_image_paths.length > 0" class="activity_images_grid">
          <div v-for="(str_Image_Path, index) in obj_Roadshow_Data.activity_image_paths" :key="index" class="activity_image_card">
            <img 
              :src="Str_Get_Image_URL(str_Image_Path)"
              :alt="`Activity photo ${Number(index) + 1}`" 
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AdminNavbar from '../components/AdminNavbar.vue'

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
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');

.admin_roadshow_detail {
  position: relative;
  width: 100vw;
  min-height: 100vh;
  background: #F6F7F8;
  overflow-x: auto;
}

/* Back Button */
.btn_back {
  position: absolute;
  left: 290px;
  top: 67px;
  width: 40px;
  height: 40px;
  background: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
}

.btn_back:hover {
  background: #f5f5f5;
  transform: scale(1.05);
}

.back_arrow {
  font-size: 24px;
  color: #000000;
}

/* Detail Card */
.detail_card {
  box-sizing: border-box;
  position: absolute;
  width: 1073.05px;
  height: auto;
  min-height: 1315px;
  left: 276px;
  top: 36px;
  padding: 40px;
  
  background: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 15px;
}

/* Title */
.roadshow_title_detail {
  position: absolute;
  width: 424px;
  height: 35px;
  left: 325px;
  top: 31px;
  margin: 0;
  
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 28px;
  line-height: 35px;
  text-align: center;
  
  color: #000000;
}

/* Image */
.roadshow_image_detail {
  position: absolute;
  width: 493.21px;
  height: 495px;
  left: 290px;
  top: 90px;
  overflow: hidden;
  border-radius: 8px;
  background: #f5f5f5;
}

.roadshow_image_detail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Description */
.roadshow_description_detail {
  position: absolute;
  width: 978px;
  max-height: 424px;
  left: 31px;
  top: 640px;
  
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 24px;
  line-height: 30px;
  
  color: #000000;
  overflow-y: auto;
}

.loading_message {
  text-align: center;
  padding: 40px;
  color: #6B7280;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
}

.error_message {
  background: #FEE2E2;
  border: 1px solid #FECACA;
  border-radius: 8px;
  padding: 16px;
  margin: 20px;
  color: #DC2626;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
}

/* Activity Images Section */
.activity_images_grid {
  position: absolute;
  width: 978px;
  left: 31px;
  top: 1100px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  padding: 0;
}

.activity_image_card {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  background: #F3F4F6;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #D1D5DB;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.activity_image_card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.activity_image_card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>

