<template>
  <div class="user_roadshow_detail">
    <UserNavbar />
    
    <!-- Back Button -->
    <button class="btn_back" @click="$router.back()">
      <span class="back_arrow">←</span>
    </button>

    <!-- Detail Card -->
    <div class="detail_card">
      <div v-if="state.loading" class="loading_message">
        Loading roadshow details...
      </div>
      <div v-else-if="state.error" class="error_message">
        {{ state.error }}
      </div>
      <div v-else-if="roadshow">
        <!-- Title -->
        <h1 class="roadshow_title_detail">{{ roadshow.topic }}</h1>
        
        <!-- Image -->
        <div class="roadshow_image_detail">
          <img 
            :src="roadshow.poster_path ? `${BACKEND_URL}${roadshow.poster_path}` : 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27493%27 height=%27495%27%3E%3Crect fill=%27%23ddd%27 width=%27493%27 height=%27495%27/%3E%3Ctext fill=%27%23999%27 x=%2750%25%27 y=%2750%25%27 dominant-baseline=%27middle%27 text-anchor=%27middle%27 font-family=%27sans-serif%27 font-size=%2720%27%3ENo Image%3C/text%3E%3C/svg%3E'" 
            :alt="roadshow.topic"
            @error="(e) => (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27493%27 height=%27495%27%3E%3Crect fill=%27%23ddd%27 width=%27493%27 height=%27495%27/%3E%3Ctext fill=%27%23999%27 x=%2750%25%27 y=%2750%25%27 dominant-baseline=%27middle%27 text-anchor=%27middle%27 font-family=%27sans-serif%27 font-size=%2720%27%3ENo Image%3C/text%3E%3C/svg%3E'"
          />
        </div>
        
        <!-- Description -->
        <div class="roadshow_description_detail">
          {{ roadshow.details }}
        </div>

        <!-- Countdown Timer Badge -->
        <div v-if="roadshow.deleted_date" class="countdown_badge" :class="Get_Countdown_Status(roadshow.deleted_date)">
          <span class="countdown_number">{{ Get_Days_Until_Deletion(roadshow.deleted_date) }}</span>
        </div>

        <!-- Activity Images Grid -->
        <div v-if="roadshow.activity_image_paths && roadshow.activity_image_paths.length > 0" class="activity_images_grid">
          <div v-for="(str_Image_Path, index) in roadshow.activity_image_paths" :key="index" class="activity_image_card">
            <img 
              :src="`${BACKEND_URL}${str_Image_Path}`"
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
import UserNavbar from '../components/UserNavbar.vue'

import { BACKEND_URL, roadshowAPI } from '../services/api'

const route = useRoute()

const state = reactive({
  loading: false,
  error: null as string | null
})

const roadshow = ref<any>(null)

/**
 * Calculate days until deletion for countdown timer
 * Purpose: Returns number of days remaining until deletion date
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
 * Output: CSS class name (status_safe, status_warning, status_critical, or status_expired)
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

onMounted(async () => {
  console.log('UserRoadshowDetail mounted, ID:', route.params.id)
  state.loading = true
  
  try {
    const response = await roadshowAPI.getById(route.params.id as string)
    roadshow.value = response.data.data
    console.log('Roadshow detail loaded:', roadshow.value)
  } catch (error: any) {
    state.error = error.response?.data?.message || 'Failed to load roadshow details'
    console.error('Loading error:', error)
  } finally {
    state.loading = false
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');

.user_roadshow_detail {
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
  white-space: pre-wrap;
  word-wrap: break-word;
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

/* Countdown Timer Badge */
.countdown_badge {
  position: absolute;
  bottom: 12px;
  right: 12px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 18px;
  color: #FFFFFF;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.countdown_badge.status_safe {
  background: #10B981;
}

.countdown_badge.status_warning {
  background: #F59E0B;
}

.countdown_badge.status_critical {
  background: #EF4444;
}

.countdown_badge.status_expired {
  background: #6B7280;
}

.countdown_number {
  display: block;
  line-height: 1;
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

