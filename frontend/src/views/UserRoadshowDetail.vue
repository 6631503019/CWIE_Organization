<template>
  <div class="user_roadshow_detail">
    <UserNavbar />
    <main class="detail_main">
      <section class="detail_content">
        <div class="detail_toolbar">
          <button class="btn_back" type="button" @click="goBack">← {{ text('Back to List', 'กลับไปยังรายการ') }}</button>
        </div>

        <div v-if="loading" class="message">{{ text('Loading roadshow details...', 'กำลังโหลดรายละเอียดโรดโชว์...') }}</div>
        <div v-else-if="error" class="message error">{{ error }}</div>
        <template v-else-if="roadshow">
          <section class="detail_header">
            <div>
              <span class="status_pill" :class="statusClass">{{ statusText }}</span>
              <h1>{{ localized(roadshow.title_en, roadshow.title_th) }}</h1>
              <p>{{ organizationName }}</p>
            </div>
            <img
              class="header_poster"
              :src="posterBlob || defaultImage"
              :alt="localized(roadshow.title_en, roadshow.title_th)"
              @click="posterBlob && openImage(posterBlob)"
            />
          </section>

          <section class="detail_card">
            <h2>{{ text('Roadshow Information', 'ข้อมูลโรดโชว์') }}</h2>
            <div class="detail_grid">
              <div class="detail_item"><span>{{ text('Organization', 'องค์กร') }}</span><strong>{{ organizationName }}</strong></div>
              <div class="detail_item"><span>{{ text('Location', 'สถานที่') }}</span><strong>{{ roadshow.location || '—' }}</strong></div>
              <div class="detail_item"><span>{{ text('Event date', 'วันที่จัดงาน') }}</span><strong>{{ formatDate(roadshow.event_date || roadshow.posted_date) }}</strong></div>
              <div class="detail_item"><span>{{ text('Time', 'เวลา') }}</span><strong>{{ formatRoadshowTime(roadshow.time) || '—' }}</strong></div>
              <div class="detail_item"><span>{{ text('Posted date', 'วันที่ประกาศ') }}</span><strong>{{ formatDate(roadshow.posted_date) }}</strong></div>
              <div class="detail_item"><span>{{ text('Deleted date', 'วันที่สิ้นสุดการแสดง') }}</span><strong>{{ formatDate(roadshow.deleted_date) }}</strong></div>
            </div>
          </section>

          <section class="detail_card">
            <h2>{{ text('Description', 'รายละเอียด') }}</h2>
            <p class="description_text">{{ roadshow.details || '—' }}</p>
          </section>

          <section v-if="activityBlobs.length > 0" class="detail_card">
            <h2>{{ text('Activity images', 'รูปภาพกิจกรรม') }}</h2>
            <div class="activity_images_grid">
              <img
                v-for="(image, index) in activityBlobs"
                v-if="image"
                :key="index"
                :src="image"
                :alt="`Activity photo ${index + 1}`"
                @click="openImage(image)"
              />
            </div>
          </section>
        </template>
      </section>
    </main>

    <div v-if="lightboxUrl" class="image_lightbox" @click.self="closeImage">
      <button type="button" class="lightbox_close" aria-label="Close image" @click="closeImage">×</button>
      <img :src="lightboxUrl" :alt="localized(roadshow?.title_en, roadshow?.title_th)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UserNavbar from '../components/UserNavbar.vue'
import { roadshowAPI, fetchRoadshowPosterBlob, fetchRoadshowActivityBlob } from '../services/api'
import { formatRoadshowTime } from '../utils/roadshowTime'
import { useLanguage } from '../composables/useLanguage'

const route = useRoute()
const router = useRouter()
const { currentLanguage, text } = useLanguage()
const roadshow = ref<any>(null)
const posterBlob = ref('')
const activityBlobs = ref<string[]>([])
const loading = ref(false)
const error = ref('')
const lightboxUrl = ref('')

const defaultImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='493' height='495'%3E%3Crect fill='%23ddd' width='493' height='495'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20'%3ENo Image%3C/text%3E%3C/svg%3E"

const localized = (english: unknown, thai: unknown) =>
  String((currentLanguage.value === 'TH' ? thai : english) || (currentLanguage.value === 'TH' ? english : thai) || '—')

const organizationName = computed(() => {
  const manual = localized(roadshow.value?.organization_en, roadshow.value?.organization_th)
  if (manual !== '—') return manual
  const organization = roadshow.value?.organization_id
  if (organization && typeof organization === 'object') {
    return localized(organization.organization_name_en || organization.name_en, organization.organization_name_th || organization.name_th)
  }
  return roadshow.value?.organization || '—'
})

const statusText = computed(() => {
  if (!roadshow.value) return 'Upcoming'
  if (roadshow.value.deleted_date) {
    const deleted = new Date(roadshow.value.deleted_date)
    if (!Number.isNaN(deleted.getTime()) && deleted < new Date()) return text('Completed', 'จบแล้ว')
  }
  return roadshow.value.is_public ? text('Active', 'ใช้งาน') : text('Upcoming', 'กำลังจะมา')
})
const statusClass = computed(() => {
  if (statusText.value === text('Completed', 'จบแล้ว')) return 'status_completed'
  if (statusText.value === text('Active', 'ใช้งาน')) return 'status_active'
  return 'status_upcoming'
})

const formatDate = (value: any) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const revokeUrls = () => {
  if (posterBlob.value.startsWith('blob:')) URL.revokeObjectURL(posterBlob.value)
  activityBlobs.value.forEach((url) => {
    if (url.startsWith('blob:')) URL.revokeObjectURL(url)
  })
  posterBlob.value = ''
  activityBlobs.value = []
}

const openImage = (url: string) => { lightboxUrl.value = url }
const closeImage = () => { lightboxUrl.value = '' }

let loadRequest = 0
const loadRoadshow = async (id: string) => {
  const request = ++loadRequest
  loading.value = true
  error.value = ''
  try {
    const response = await roadshowAPI.getById(id)
    const nextRoadshow = response.data?.data || response.data
    let nextPoster = ''
    try { nextPoster = await fetchRoadshowPosterBlob(id) } catch {}
    const count = nextRoadshow.activity_gridfs_ids?.length || nextRoadshow.activity_image_paths?.length || 0
    const nextActivities = await Promise.all(Array.from({ length: count }, async (_, index) => {
      try { return await fetchRoadshowActivityBlob(id, index) } catch { return '' }
    }))
    if (request !== loadRequest) {
      if (nextPoster.startsWith('blob:')) URL.revokeObjectURL(nextPoster)
      nextActivities.forEach((url) => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url)
      })
      return
    }
    revokeUrls()
    roadshow.value = nextRoadshow
    posterBlob.value = nextPoster
    activityBlobs.value = nextActivities
  } catch (requestError: any) {
    error.value = requestError.response?.data?.message || text('Unable to load roadshow details.', 'ไม่สามารถโหลดรายละเอียดโรดโชว์ได้')
  } finally {
    if (request === loadRequest) loading.value = false
  }
}

const goBack = () => router.push('/user/roadshow')

onMounted(() => loadRoadshow(String(route.params.id || '')))
watch(() => route.params.id, (id, previous) => {
  if (id && id !== previous) loadRoadshow(String(id))
})
onBeforeUnmount(() => {
  loadRequest++
  revokeUrls()
})
</script>

<style scoped>
.user_roadshow_detail { min-height: 100vh; background: #f6f7f8; }
.detail_main { margin-left: 66px; }
.detail_content { max-width: 1100px; margin: 0 auto; padding: 28px 24px 60px; }
.detail_toolbar { margin-bottom: 16px; }
.btn_back { height: 40px; border: 1px solid #d1d5db; border-radius: 8px; background: #fff; padding: 0 14px; cursor: pointer; }
.detail_header { display: flex; justify-content: space-between; gap: 24px; align-items: center; background: #fff; border-radius: 12px; padding: 24px; margin-bottom: 20px; }
.detail_header h1 { margin: 10px 0 6px; }
.detail_header p { margin: 0; color: #6b7280; }
.header_poster { width: 180px; height: 180px; object-fit: cover; border-radius: 10px; cursor: zoom-in; }
.detail_card { background: #fff; border-radius: 12px; padding: 24px; margin-bottom: 20px; }
.detail_grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.detail_item { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
.detail_item span { display: block; color: #6b7280; font-size: 12px; margin-bottom: 6px; }
.description_text { white-space: pre-wrap; }
.status_pill { border-radius: 999px; padding: 5px 10px; font-size: 12px; }
.status_active { background: #dcfce7; color: #166534; }
.status_completed { background: #e5e7eb; color: #374151; }
.status_upcoming { background: #dbeafe; color: #1d4ed8; }
.activity_images_grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
.activity_images_grid img { width: 100%; height: 180px; object-fit: cover; border-radius: 8px; cursor: zoom-in; }
.image_lightbox { position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,.85); display: grid; place-items: center; }
.image_lightbox img { max-width: 92vw; max-height: 92vh; object-fit: contain; }
.lightbox_close { position: absolute; right: 24px; top: 24px; width: 42px; height: 42px; border: 0; border-radius: 50%; background: #fff; font-size: 28px; cursor: pointer; }
.message { max-width: 1100px; margin: 0 auto; padding: 30px; background: #fff; border-radius: 12px; text-align: center; color: #6b7280; }
.message.error { color: #dc2626; }
@media (max-width: 800px) { .detail_grid { grid-template-columns: repeat(2, 1fr); } .detail_header { align-items: flex-start; } }
</style>
