<template>
  <div class="user-roadshow-detail">
    <UserNavbar />
    
    <!-- Back Button -->
    <button class="btn-back" @click="$router.back()">
      <span class="back-arrow">←</span>
    </button>

    <!-- Detail Card -->
    <div class="detail-card">
      <div v-if="state.loading" class="loading-message">
        Loading roadshow details...
      </div>
      <div v-else-if="state.error" class="error-message">
        {{ state.error }}
      </div>
      <div v-else-if="roadshow">
        <!-- Title -->
        <h1 class="roadshow-title-detail">{{ roadshow.topic }}</h1>
        
        <!-- Image -->
        <div class="roadshow-image-detail">
          <img 
            :src="roadshow.poster_path ? `http://localhost:5000/${roadshow.poster_path.replace(/\\/g, '/')}` : 'https://via.placeholder.com/493x495?text=No+Image'" 
            :alt="roadshow.topic"
            @error="(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/493x495?text=No+Image'"
          />
        </div>
        
        <!-- Description -->
        <div class="roadshow-description-detail">
          {{ roadshow.details }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import UserNavbar from '../components/UserNavbar.vue'

const route = useRoute()

const state = reactive({
  loading: false,
  error: null as string | null
})

const roadshow = ref<any>(null)

onMounted(async () => {
  console.log('UserRoadshowDetail mounted, ID:', route.params.id)
  state.loading = true
  
  try {
    const response = await fetch(`http://localhost:5000/api/roadshows/${route.params.id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    })
    if (!response.ok) throw new Error('Failed to load roadshow details')
    
    const result = await response.json()
    roadshow.value = result.data
    console.log('Roadshow detail loaded:', roadshow.value)
  } catch (error) {
    state.error = 'Failed to load roadshow details'
    console.error('Loading error:', error)
  } finally {
    state.loading = false
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');

.user-roadshow-detail {
  position: relative;
  width: 100vw;
  min-height: 100vh;
  background: #F6F7F8;
  overflow-x: auto;
}

/* Back Button */
.btn-back {
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

.btn-back:hover {
  background: #f5f5f5;
  transform: scale(1.05);
}

.back-arrow {
  font-size: 24px;
  color: #000000;
}

/* Detail Card */
.detail-card {
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
.roadshow-title-detail {
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
.roadshow-image-detail {
  position: absolute;
  width: 493.21px;
  height: 495px;
  left: 290px;
  top: 90px;
  overflow: hidden;
  border-radius: 8px;
  background: #f5f5f5;
}

.roadshow-image-detail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Description */
.roadshow-description-detail {
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

.loading-message {
  text-align: center;
  padding: 40px;
  color: #6B7280;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
}

.error-message {
  background: #FEE2E2;
  border: 1px solid #FECACA;
  border-radius: 8px;
  padding: 16px;
  margin: 20px;
  color: #DC2626;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
}
</style>
