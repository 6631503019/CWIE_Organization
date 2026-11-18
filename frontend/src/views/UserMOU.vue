<template>
  <div class="user_mou">
    <UserNavbar />
    <main class="main_content">
      <div class="mou_page_actions">
        <h1>{{ text('MOU', 'บันทึกความร่วมมือ') }}</h1>
      </div>

      <div class="search_filter_section">
        <div class="search_controls">
          <input
            v-model="searchText"
            type="text"
            class="search_input"
            :placeholder="text('Search organization...', 'ค้นหาองค์กร...')"
          />
          <select v-model="selectedStatus" class="status_select">
            <option value="">{{ text('All statuses', 'ทุกสถานะ') }}</option>
            <option value="Active">{{ text('Active', 'ใช้งาน') }}</option>
            <option value="Inactive">{{ text('Inactive', 'ไม่ใช้งาน') }}</option>
          </select>
          <div class="action_buttons">
            <button class="reset_btn" type="button" @click="resetFilters">{{ text('Reset', 'รีเซ็ต') }}</button>
            <button class="search_btn" type="button" @click="applyFilters">{{ text('Search', 'ค้นหา') }}</button>
          </div>
        </div>
      </div>

      <div v-if="loading" class="table_message">{{ text('Loading MOUs...', 'กำลังโหลด MOU...') }}</div>
      <div v-else-if="error" class="table_message error">{{ error }}</div>
      <div v-else class="mou_table_container">
        <table class="mou_table">
          <thead>
            <tr>
              <th>{{ text('Organization', 'องค์กร') }}</th>
              <th>{{ text('Document Name', 'ชื่อเอกสาร') }}</th>
              <th>{{ text('Uploaded', 'อัปโหลดเมื่อ') }}</th>
              <th>{{ text('Status', 'สถานะ') }}</th>
              <th>{{ text('Actions', 'การดำเนินการ') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="mou in paginatedMous" :key="mou.id" class="mou_table_row">
              <td>{{ localized(mou.name_en, mou.name_th) }}</td>
              <td>
                <button v-if="mou.documentUrl" class="mou_document_link" type="button" @click="openDocument(mou)">
                  {{ mou.documentName }}
                </button>
                <span v-else>{{ mou.documentName }}</span>
              </td>
              <td>{{ mou.uploaded }}</td>
              <td><span class="mou_status_badge" :class="mou.status.toLowerCase()">{{ mou.status }}</span></td>
              <td>
                <button v-if="mou.documentUrl" class="mou_action_btn view_btn" type="button" @click="openDocument(mou)">
                  {{ text('View', 'ดู') }}
                </button>
              </td>
            </tr>
            <tr v-if="paginatedMous.length === 0">
              <td colspan="5" class="mou_table_empty">{{ text('No MOU found', 'ไม่พบ MOU') }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mou_pagination_container">
        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          :total-items="filteredMous.length"
          :loading="loading"
          :show-info="false"
          @page-change="handlePageChange"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import UserNavbar from '../components/UserNavbar.vue'
import Pagination from '../components/Pagination.vue'
import { organizationAPI, mouAPI, getMouFileUrl, getOrganizationLogoUrl } from '../services/api'
import { useLanguage } from '../composables/useLanguage'

const { currentLanguage, text } = useLanguage()
const loading = ref(false)
const error = ref('')
const searchText = ref('')
const selectedStatus = ref('')
const currentPage = ref(1)
const itemsPerPage = 8
const mous = ref<any[]>([])

const localized = (english: unknown, thai: unknown) => {
  const preferred = currentLanguage.value === 'TH' ? thai : english
  return String(preferred || (currentLanguage.value === 'TH' ? english : thai) || 'N/A')
}

const filteredMous = computed(() => {
  const query = searchText.value.trim().toLowerCase()
  return mous.value.filter((mou) => {
    const matchesSearch = !query || localized(mou.name_en, mou.name_th).toLowerCase().includes(query)
    const matchesStatus = !selectedStatus.value || mou.status === selectedStatus.value
    return matchesSearch && matchesStatus
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredMous.value.length / itemsPerPage)))
const paginatedMous = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredMous.value.slice(start, start + itemsPerPage)
})

watch(searchText, () => { currentPage.value = 1 })
watch(selectedStatus, () => { currentPage.value = 1 })

const resetFilters = () => {
  searchText.value = ''
  selectedStatus.value = ''
  currentPage.value = 1
}
const applyFilters = () => { currentPage.value = 1 }
const handlePageChange = (page: number) => {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page
}

let documentUrl = ''
const openDocument = (mou: any) => {
  if (!mou.id) return
  window.open(getMouFileUrl(mou.id), '_blank', 'noopener,noreferrer')
}

const isPublished = (value: any) => value === true || value === 'true' || value === 1 || value === '1'

const loadMOUs = async () => {
  loading.value = true
  error.value = ''
  try {
    const [organizationsResponse, mouResponse] = await Promise.all([
      organizationAPI.getAll({ limit: 100 }),
      mouAPI.getAll({ limit: 100 })
    ])
    const organizations = organizationsResponse.data?.data || []
    const organizationMap = new Map(organizations.map((organization: any) => [String(organization._id), organization]))
    const records = mouResponse.data?.data || mouResponse.data || []

    mous.value = records
      .filter((record: any) => isPublished(record.is_published))
      .map((record: any) => {
        const reference = record.organization_id
        const organizationId = typeof reference === 'object' ? reference?._id : reference
        const organization = typeof reference === 'object'
          ? reference
          : organizationMap.get(String(organizationId)) || {}
        const documentPath = record.mou_file_path || record.mou_path || ''
        return {
          id: String(record._id),
          name_en: organization.name_en || organization.organization_name_en || '',
          name_th: organization.name_th || organization.organization_name_th || '',
          documentName: String(documentPath).split('/').pop() || 'MOU Document',
          documentUrl: getMouFileUrl(record._id),
          uploaded: record.createdAt
            ? new Date(record.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : 'N/A',
          status: isPublished(record.is_published) ? 'Active' : 'Inactive',
          logo: getOrganizationLogoUrl(organization)
        }
      })
  } catch (requestError: any) {
    error.value = requestError.response?.data?.message || text('Unable to load MOUs.', 'ไม่สามารถโหลด MOU ได้')
  } finally {
    loading.value = false
  }
}

onMounted(loadMOUs)
onBeforeUnmount(() => {
  if (documentUrl) URL.revokeObjectURL(documentUrl)
})
</script>

<style scoped>
.user_mou { min-height: 100vh; background: #f6f7f8; }
.main_content { margin-left: 66px; padding: 28px 24px 60px; }
.mou_page_actions { max-width: 1100px; margin: 0 auto 18px; }
.mou_page_actions h1 { margin: 0; font: 600 40px/50px Outfit, sans-serif; }
.search_filter_section { max-width: 1100px; margin: 0 auto 20px; background: #fff; border-radius: 12px; padding: 16px; }
.search_controls { display: grid; grid-template-columns: minmax(240px, 1fr) 180px auto; gap: 12px; align-items: center; }
.search_input, .status_select { height: 42px; border: 1px solid #d1d5db; border-radius: 8px; padding: 0 12px; background: #fff; }
.action_buttons { display: flex; gap: 8px; }
.reset_btn, .search_btn, .mou_action_btn { border-radius: 8px; height: 40px; padding: 0 14px; border: 1px solid #d1d5db; background: #fff; cursor: pointer; }
.search_btn { background: #111827; color: #fff; border-color: #111827; }
.mou_table_container { max-width: 1100px; margin: 0 auto; overflow-x: auto; background: #fff; border-radius: 12px; }
.mou_table { width: 100%; border-collapse: collapse; }
.mou_table th, .mou_table td { padding: 14px 12px; text-align: left; border-bottom: 1px solid #edf0f2; }
.mou_document_link { border: 0; background: none; color: #2563eb; cursor: pointer; padding: 0; }
.mou_status_badge { display: inline-block; border-radius: 999px; padding: 5px 10px; font-size: 12px; }
.mou_status_badge.active { background: #dcfce7; color: #166534; }
.mou_status_badge.inactive { background: #fee2e2; color: #991b1b; }
.view_btn { color: #2563eb; }
.mou_table_empty, .table_message { text-align: center; padding: 30px; color: #6b7280; }
.table_message.error { max-width: 1100px; margin: 0 auto; background: #fff; color: #dc2626; border-radius: 12px; }
.mou_pagination_container { max-width: 1100px; margin: 16px auto 0; }
@media (max-width: 900px) { .main_content { margin-left: 66px; } .search_controls { grid-template-columns: 1fr; } }
</style>
