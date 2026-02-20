<template>
  <div class="user-roadshow">
    <UserNavbar />
    
    <!-- Roadshow Title -->
    <h1 class="roadshow-title">Roadshow</h1>

    <!-- Roadshow Cards Container -->
    <div class="roadshow-cards-container">
      <div v-if="state.error" class="error-message">
        {{ state.error }}
      </div>
      <div v-if="state.loading && roadshows.length === 0" class="loading-message">
        Loading roadshows...
      </div>
      <div 
        v-for="roadshow in paginatedRoadshows" 
        :key="roadshow.id" 
        class="roadshow-large-card"
        @click="$router.push(`/user/roadshow/${roadshow.id}`)"
      >
        <!-- Roadshow Image -->
        <div class="roadshow-image-large">
          <img 
            :src="roadshow.image" 
            :alt="roadshow.title"
            @error="(e) => (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27271%27 height=%27272%27%3E%3Crect fill=%27%23ddd%27 width=%27271%27 height=%27272%27/%3E%3Ctext fill=%27%23999%27 x=%2750%25%27 y=%2750%25%27 dominant-baseline=%27middle%27 text-anchor=%27middle%27 font-family=%27sans-serif%27 font-size=%2720%27%3ENo Image%3C/text%3E%3C/svg%3E'"
          />
        </div>
        
        <!-- Roadshow Content -->
        <div class="roadshow-content">
          <h2 class="roadshow-title-large">{{ roadshow.title }}</h2>
          <p class="roadshow-description">{{ roadshow.description }}</p>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="roadshow-pagination-container">
      <Pagination 
        :current-page="state.currentPage"
        :total-pages="totalPages"
        :total-items="roadshows.length"
        :loading="state.loading"
        :show-info="false"
        @page-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import UserNavbar from '../components/UserNavbar.vue'
import Pagination from '../components/Pagination.vue'
import { roadshowAPI, BACKEND_URL } from '../services/api'

const router = useRouter()

const state = reactive({
  loading: false,
  error: null as string | null,
  currentPage: 1,
  itemsPerPage: 2
})

const roadshows = ref<any[]>([])

const paginatedRoadshows = computed(() => {
  const start = (state.currentPage - 1) * state.itemsPerPage
  const end = start + state.itemsPerPage
  return roadshows.value.slice(start, end)
})

const totalPages = computed(() => 
  Math.ceil(roadshows.value.length / state.itemsPerPage)
)

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

const fetchPublicRoadshows = async () => {
  try {
    const response = await roadshowAPI.getAll({ limit: 100 })
    console.log('All public roadshows:', response.data.data)
    
    roadshows.value = response.data.data
      .filter((item: any) => {
        return item.is_public === true || item.is_public === 'true' || item.is_public === 1
      })
      .map((item: any) => {
        let posterPath = item.poster_path
        if (posterPath) {
          posterPath = posterPath.replace(/\\/g, '/')
          if (!posterPath.startsWith('/')) {
            posterPath = '/' + posterPath
          }
        }
        const imageUrl = posterPath ? `${BACKEND_URL}${posterPath}` : 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27271%27 height=%27272%27%3E%3Crect fill=%27%23ddd%27 width=%27271%27 height=%27272%27/%3E%3Ctext fill=%27%23999%27 x=%2750%25%27 y=%2750%25%27 dominant-baseline=%27middle%27 text-anchor=%27middle%27 font-family=%27sans-serif%27 font-size=%2720%27%3ENo Image%3C/text%3E%3C/svg%3E'
        
        return {
          id: item._id,
          title: item.topic || 'No Title',
          description: item.details || 'No description available',
          image: imageUrl,
          date: item.event_date
        }
      })
    
    console.log('Public roadshows loaded:', roadshows.value.length, 'items')
  } catch (error: any) {
    state.error = error.response?.data?.message || 'Failed to load roadshows'
    console.error('Loading error:', error)
    throw error
  }
}

onMounted(async () => {
  console.log('UserRoadshow mounted')
  state.loading = true
  
  try {
    await fetchPublicRoadshows()
  } catch (error) {
    // Error already handled
  } finally {
    state.loading = false
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');

.user-roadshow {
  position: relative;
  width: 100vw;
  height: 918px;
  background: #F6F7F8;
  overflow-x: auto;
}

.roadshow-title {
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

.roadshow-cards-container {
  position: absolute;
  left: 273px;
  top: 152px;
  width: 1035px;
}

.error-message {
  background: #FEE2E2;
  border: 1px solid #FECACA;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
  color: #DC2626;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
}

.loading-message {
  text-align: center;
  padding: 20px;
  color: #6B7280;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
}

.roadshow-large-card {
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

.roadshow-large-card:hover {
  transform: translateY(-2px);
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.15);
}

.roadshow-image-large {
  width: 270.72px;
  height: 271.7px;
  margin: 8px 0 0 37px;
  overflow: hidden;
  border-radius: 8px;
  background: #f5f5f5;
}

.roadshow-image-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.roadshow-content {
  flex: 1;
  padding: 17px 20px 20px 40px;
  display: flex;
  flex-direction: column;
}

.roadshow-title-large {
  margin: 0 0 15px 0;
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 32px;
  line-height: 40px;
  color: #000000;
}

.roadshow-description {
  margin: 0;
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 20px;
  line-height: 25px;
  color: #000000;
  flex: 1;
}

.roadshow-pagination-container {
  position: absolute;
  left: 1090px;
  top: 780px;
  width: 218px;
  height: 28px;
}
</style>
