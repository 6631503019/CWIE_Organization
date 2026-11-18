<template>
  <div class="user_roadshow_detail">
    <UserNavbar />
    <AdminTopBar />
    
    <!-- Back Button -->
    <button class="btn_back" @click="$router.back()">
      <span class="back_arrow">←</span>
    </button>

    <!-- Detail Card -->
    <div class="detail_card">
      <div v-if="state.loading" class="loading_message">
        {{ text('Loading roadshow details...', 'กำลังโหลดรายละเอียดโรดโชว์...') }}
      </div>
      <div v-else-if="state.error" class="error_message">
        {{ state.error }}
      </div>
      <div v-else-if="roadshow">
        <!-- Title -->
        <h1 class="roadshow_title_detail">{{ Get_Roadshow_Title(roadshow) }}</h1>
        
        <!-- Image -->
        <div class="roadshow_image_detail">
          <img 
            :src="posterBlob || 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27493%27 height=%27495%27%3E%3Crect fill=%27%23ddd%27 width=%27493%27 height=%27495%27/%3E%3Ctext fill=%27%23999%27 x=%2750%25%27 y=%2750%25%27 dominant-baseline=%27middle%27 text-anchor=%27middle%27 font-family=%27sans-serif%27 font-size=%2720%27%3ENo Image%3C/text%3E%3C/svg%3E'"
            :alt="Get_Roadshow_Title(roadshow)"
            @click="openImage(posterBlob, Get_Roadshow_Title(roadshow))"
            @error="(e) => (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27493%27 height=%27495%27%3E%3Crect fill=%27%23ddd%27 width=%27493%27 height=%27495%27/%3E%3Ctext fill=%27%23999%27 x=%2750%25%27 y=%2750%25%27 dominant-baseline=%27middle%27 text-anchor=%27middle%27 font-family=%27sans-serif%27 font-size=%2720%27%3ENo Image%3C/text%3E%3C/svg%3E'"
          />
        </div>
        
        <!-- Description -->
        <div class="roadshow_description_detail">
          {{ roadshow.details }}
        </div>

        <div v-if="roadshow.time" class="roadshow_time_detail">
          {{ text('Time', 'เวลา') }}: {{ formatRoadshowTime(roadshow.time) }}
        </div>

        <!-- Activity Images Grid -->
        <div v-if="(roadshow.activity_gridfs_ids?.length || roadshow.activity_image_paths?.length) > 0" class="activity_images_grid">
          <div v-for="(_, index) in (roadshow.activity_gridfs_ids?.length ? roadshow.activity_gridfs_ids : roadshow.activity_image_paths)" :key="index" class="activity_image_card">
            <img 
              :src="activityBlobs[index] || 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27493%27 height=%27495%27%3E%3Crect fill=%27%23ddd%27 width=%27493%27 height=%27495%27/%3E%3Ctext fill=%27%23999%27 x=%2750%25%27 y=%2750%25%27 dominant-baseline=%27middle%27 text-anchor=%27middle%27 font-family=%27sans-serif%27 font-size=%2720%27%3ENo Image%3C/text%3E%3C/svg%3E'"
              :alt="`Activity photo ${Number(index) + 1}`"
              @click="activityBlobs[index] && openImage(activityBlobs[index], `Activity photo ${Number(index) + 1}`)"
            />
          </div>
          <div v-if="lightboxUrl" class="image_lightbox" @click.self="closeImage">
            <button type="button" class="lightbox_close" aria-label="Close image" @click="closeImage">×</button>
            <img :src="lightboxUrl" :alt="lightboxAlt" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import UserNavbar from '../components/UserNavbar.vue'
import AdminTopBar from '../components/admin/AdminTopBar.vue'

import { roadshowAPI, fetchRoadshowPosterBlob, fetchRoadshowActivityBlob } from '../services/api'
import { formatRoadshowTime } from '../utils/roadshowTime'
import { useLanguage } from '../composables/useLanguage'

const route = useRoute()
const { currentLanguage, text } = useLanguage()

const state = reactive({
  loading: false,
  error: null as string | null
})

const roadshow = ref<any>(null)
const posterBlob = ref('')
const activityBlobs = ref<string[]>([])
const lightboxUrl = ref('')
const lightboxAlt = ref('')
let loadRequest = 0

const Get_Roadshow_Title = (item: any) => currentLanguage.value === 'TH'
  ? item?.title_th || item?.title_en || item?.topic || '—'
  : item?.title_en || item?.title_th || item?.topic || '—'

const openImage = (url: string, alt: string) => {
  if (!url) return
  lightboxUrl.value = url
  lightboxAlt.value = alt
}
const closeImage = () => {
  lightboxUrl.value = ''
  lightboxAlt.value = ''
}
const revokeImageUrls = () => {
  if (posterBlob.value.startsWith('blob:')) URL.revokeObjectURL(posterBlob.value)
  activityBlobs.value.forEach(url => {
    if (url.startsWith('blob:')) URL.revokeObjectURL(url)
  })
  posterBlob.value = ''
  activityBlobs.value = []
}

const loadRoadshow = async () => {
  const request = ++loadRequest
  state.loading = true
  state.error = null

  try {
    const response = await roadshowAPI.getById(route.params.id as string)
    const nextRoadshow = response.data?.data || response.data
    const roadshowId = nextRoadshow._id || route.params.id

    let nextPoster = ''
    try { nextPoster = await fetchRoadshowPosterBlob(roadshowId) } catch {}
    const nextActivities = await Promise.all(
      (nextRoadshow.activity_gridfs_ids || nextRoadshow.activity_image_paths || []).map(
        async (_: unknown, index: number) => {
          try { return await fetchRoadshowActivityBlob(roadshowId, index) } catch { return '' }
        }
      )
    )

    if (request !== loadRequest) {
      if (nextPoster.startsWith('blob:')) URL.revokeObjectURL(nextPoster)
      nextActivities.forEach(url => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url)
      })
      return
    }

    revokeImageUrls()
    roadshow.value = nextRoadshow
    posterBlob.value = nextPoster
    activityBlobs.value = nextActivities
  } catch (error: any) {
    state.error = error.response?.data?.message || 'Failed to load roadshow details'
  } finally {
    if (request === loadRequest) state.loading = false
  }
}

onMounted(loadRoadshow)
watch(() => route.params.id, async (newId, oldId) => {
  if (newId && newId !== oldId) await loadRoadshow()
})
onBeforeUnmount(() => {
  loadRequest++
  revokeImageUrls()
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

.roadshow_time_detail {
  position: absolute;
  width: 978px;
  left: 31px;
  top: 1080px;
  font-family: 'Outfit', sans-serif;
  font-size: 24px;
  line-height: 30px;
  color: #000000;
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

.image_lightbox {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(0, 0, 0, .88);
}
.image_lightbox img {
  max-width: 92vw;
  max-height: 92vh;
  object-fit: contain;
  border-radius: 8px;
}
.lightbox_close {
  position: fixed;
  top: 20px;
  right: 24px;
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 50%;
  background: #fff;
  color: #111;
  font-size: 28px;
  cursor: pointer;
}

@media (max-width: 1100px) {
  .detail_card {
    position: relative;
    width: calc(100% - 32px);
    min-height: 0;
    left: auto;
    top: auto;
    margin: 96px 16px 32px 82px;
  }
  .roadshow_title_detail,
  .roadshow_image_detail,
  .roadshow_description_detail,
  .roadshow_time_detail,
  .activity_images_grid {
    position: relative;
    width: 100%;
    left: auto;
    top: auto;
  }
  .roadshow_title_detail { height: auto; text-align: left; margin-bottom: 20px; }
  .roadshow_image_detail { height: min(495px, 60vw); margin-bottom: 20px; }
  .roadshow_description_detail { max-height: none; margin-bottom: 20px; }
  .roadshow_time_detail { margin-bottom: 20px; }
  .btn_back { left: 82px; top: 75px; }
}
</style>