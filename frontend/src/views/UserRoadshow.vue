<template>
  <div class="user_roadshow">
    <UserNavbar />
    <main class="main_content">
      <section class="roadshow_header_section">
        <h1>{{ text('Roadshow', 'โรดโชว์') }}</h1>
        <p>{{ text('View public roadshow events.', 'ดูข้อมูลกิจกรรมโรดโชว์ที่เผยแพร่') }}</p>
      </section>

      <div class="roadshow_search_bar">
        <input
          v-model="searchText"
          type="text"
          :placeholder="text('Search roadshow title or organization...', 'ค้นหาชื่อโรดโชว์หรือองค์กร...')"
        />
      </div>

      <div v-if="loading" class="message">{{ text('Loading roadshows...', 'กำลังโหลดโรดโชว์...') }}</div>
      <div v-else-if="error" class="message error">{{ error }}</div>
      <section v-else class="roadshow_table_wrapper">
        <table class="roadshow_table">
          <thead>
            <tr>
              <th>{{ text('Organization', 'องค์กร') }}</th>
              <th>{{ text('Roadshow title', 'ชื่อโรดโชว์') }}</th>
              <th>{{ text('Date', 'วันที่') }}</th>
              <th>{{ text('Time', 'เวลา') }}</th>
              <th>{{ text('Location', 'สถานที่') }}</th>
              <th>{{ text('Status', 'สถานะ') }}</th>
              <th>{{ text('Actions', 'การดำเนินการ') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="roadshow in paginatedRoadshows" :key="roadshow.id">
              <td>{{ localized(roadshow.organization_en, roadshow.organization_th) }}</td>
              <td>{{ localized(roadshow.title_en, roadshow.title_th) }}</td>
              <td>{{ formatDate(roadshow.event_date || roadshow.posted_date) }}</td>
              <td>{{ formatRoadshowTime(roadshow.time) || '—' }}</td>
              <td>{{ roadshow.location || '—' }}</td>
              <td><span class="status_pill" :class="statusClass(roadshow)">{{ statusText(roadshow) }}</span></td>
              <td><button class="table_action" type="button" @click="viewRoadshow(roadshow.id)">{{ text('View', 'ดู') }}</button></td>
            </tr>
            <tr v-if="paginatedRoadshows.length === 0">
              <td colspan="7" class="empty_table_cell">{{ text('No roadshows found.', 'ไม่พบโรดโชว์') }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <div class="roadshow_pagination_container">
        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          :total-items="filteredRoadshows.length"
          :loading="loading"
          :show-info="false"
          @page-change="handlePageChange"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import UserNavbar from '../components/UserNavbar.vue'
import Pagination from '../components/Pagination.vue'
import { roadshowAPI } from '../services/api'
import { formatRoadshowTime } from '../utils/roadshowTime'
import { useLanguage } from '../composables/useLanguage'

const router = useRouter()
const { currentLanguage, text } = useLanguage()
const roadshows = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const searchText = ref('')
const currentPage = ref(1)
const itemsPerPage = 8

const localized = (english: unknown, thai: unknown) =>
  String((currentLanguage.value === 'TH' ? thai : english) || (currentLanguage.value === 'TH' ? english : thai) || '—')

const filteredRoadshows = computed(() => {
  const query = searchText.value.trim().toLowerCase()
  if (!query) return roadshows.value
  return roadshows.value.filter((roadshow) =>
    String(localized(roadshow.title_en, roadshow.title_th)).toLowerCase().includes(query) ||
    String(localized(roadshow.organization_en, roadshow.organization_th)).toLowerCase().includes(query) ||
    String(roadshow.location || '').toLowerCase().includes(query)
  )
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRoadshows.value.length / itemsPerPage)))
const paginatedRoadshows = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredRoadshows.value.slice(start, start + itemsPerPage)
})

watch(searchText, () => { currentPage.value = 1 })
const handlePageChange = (page: number) => {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page
}
const viewRoadshow = (id: string) => router.push(`/user/roadshow/${id}`)

const formatDate = (value: any) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const statusText = (roadshow: any) => {
  if (roadshow.deleted_date) {
    const deleted = new Date(roadshow.deleted_date)
    if (!Number.isNaN(deleted.getTime()) && deleted < new Date()) return text('Completed', 'จบแล้ว')
  }
  return roadshow.is_public ? text('Active', 'ใช้งาน') : text('Upcoming', 'กำลังจะมา')
}

const statusClass = (roadshow: any) => {
  const status = statusText(roadshow)
  if (status === text('Completed', 'จบแล้ว')) return 'status_completed'
  if (status === text('Active', 'ใช้งาน')) return 'status_active'
  return 'status_upcoming'
}

const isPublic = (value: any) => value === true || value === 'true' || value === 1 || value === '1'

const loadRoadshows = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await roadshowAPI.getAll({ limit: 100 })
    roadshows.value = (response.data?.data || []).filter((roadshow: any) => isPublic(roadshow.is_public))
  } catch (requestError: any) {
    error.value = requestError.response?.data?.message || text('Unable to load roadshows.', 'ไม่สามารถโหลดโรดโชว์ได้')
  } finally {
    loading.value = false
  }
}

onMounted(loadRoadshows)
</script>

<style scoped>
.user_roadshow { min-height: 100vh; background: #f6f7f8; }
.main_content { margin-left: 66px; padding: 28px 24px 60px; }
.roadshow_header_section h1 { margin: 0; font: 600 40px/50px Outfit, sans-serif; }
.roadshow_header_section p { margin: 6px 0 18px; color: #6b7280; }
.roadshow_search_bar { max-width: 1100px; margin: 0 auto 16px; }
.roadshow_search_bar input { width: 100%; height: 44px; box-sizing: border-box; border: 1px solid #d1d5db; border-radius: 8px; padding: 0 12px; background: #fff; }
.roadshow_table_wrapper { max-width: 1100px; margin: 0 auto; overflow-x: auto; background: #fff; border-radius: 12px; }
.roadshow_table { width: 100%; border-collapse: collapse; min-width: 900px; }
.roadshow_table th, .roadshow_table td { padding: 14px 12px; text-align: left; border-bottom: 1px solid #edf0f2; }
.status_pill { border-radius: 999px; padding: 5px 10px; font-size: 12px; }
.status_active { background: #dcfce7; color: #166534; }
.status_completed { background: #e5e7eb; color: #374151; }
.status_upcoming { background: #dbeafe; color: #1d4ed8; }
.table_action { height: 34px; border: 1px solid #d1d5db; border-radius: 8px; background: #fff; color: #2563eb; cursor: pointer; }
.empty_table_cell, .message { text-align: center; padding: 30px; color: #6b7280; }
.message.error { max-width: 1100px; margin: 0 auto; background: #fff; color: #dc2626; border-radius: 12px; }
.roadshow_pagination_container { max-width: 1100px; margin: 16px auto 0; }
</style>
