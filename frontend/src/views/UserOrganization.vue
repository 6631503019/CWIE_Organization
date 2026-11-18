<template>
  <div class="user_organization">
    <UserNavbar />
    <main class="main_content">
      <section class="content_area">
        <div class="page_heading">
          <div>
            <h1>{{ text('Organization', 'องค์กร') }}</h1>
            <p>{{ text('View all organization data in the database.', 'ดูข้อมูลทั้งหมดขององค์กรในฐานข้อมูล') }}</p>
          </div>
        </div>

        <section class="filter_section">
          <input v-model="searchText" type="text" :placeholder="text('Search organization...', 'ค้นหาองค์กร...')" class="search_input" />
          <div class="dropdowns_grid">
            <select v-model="selectedSchool" class="filter_select" aria-label="School">
              <option value="">{{ text('All schools', 'สำนักวิชาทั้งหมด') }}</option>
              <option v-for="option in schools" :key="option" :value="option">{{ option }}</option>
            </select>
            <select v-model="selectedCountry" class="filter_select" aria-label="Country">
              <option value="">{{ text('All countries', 'ทุกประเทศ') }}</option>
              <option v-for="option in countries" :key="option" :value="option">{{ option }}</option>
            </select>
            <select v-model="selectedType" class="filter_select" aria-label="Type">
              <option value="">{{ text('All types', 'ทุกประเภท') }}</option>
              <option v-for="option in types" :key="option" :value="option">{{ option }}</option>
            </select>
            <select v-model="selectedProvince" class="filter_select" aria-label="Province">
              <option value="">{{ text('All provinces', 'ทุกจังหวัด') }}</option>
              <option v-for="option in provinces" :key="option" :value="option">{{ option }}</option>
            </select>
          </div>
          <div class="filter_buttons">
            <button class="reset_btn" type="button" @click="resetFilters">{{ text('Reset', 'รีเซ็ต') }}</button>
            <button class="search_btn" type="button" @click="applyFilters">{{ text('Search', 'ค้นหา') }}</button>
          </div>
        </section>

        <div v-if="loading" class="empty_state">{{ text('Loading organizations...', 'กำลังโหลดองค์กร...') }}</div>
        <div v-else-if="error" class="empty_state error">{{ error }}</div>
        <div v-else class="table_container">
          <div class="table_header">
            <span>{{ text('Organization', 'องค์กร') }}</span>
            <span>{{ text('Type', 'ประเภท') }}</span>
            <span>{{ text('School', 'สำนักวิชา') }}</span>
            <span>{{ text('Province', 'จังหวัด') }}</span>
            <span>{{ text('Country', 'ประเทศ') }}</span>
            <span>{{ text('Status', 'สถานะ') }}</span>
            <span>{{ text('Actions', 'การดำเนินการ') }}</span>
          </div>
          <div v-for="org in paginatedOrganizations" :key="org.id" class="table_row">
            <button class="org_name" type="button" @click="viewOrganization(org.id)">
              {{ localized(org.raw.name_en, org.raw.name_th) }}
            </button>
            <div>{{ display(org.raw.organization_type, org.raw.business_type_en, org.raw.business_type_th) }}</div>
            <div>{{ localized(org.raw.school_en, org.raw.school_th) }}</div>
            <div>{{ localized(org.raw.province_en, org.raw.province_th) }}</div>
            <div>{{ localized(org.raw.country_en, org.raw.country_th) }}</div>
            <div><span class="status_pill" :class="org.status">{{ org.status === 'active' ? text('Active', 'ใช้งาน') : text('Inactive', 'ไม่ใช้งาน') }}</span></div>
            <div class="action_buttons">
              <button class="text_action" type="button" @click="viewOrganization(org.id)">{{ text('View', 'ดู') }}</button>
              <button v-if="org.hasMOU" class="text_action" type="button" @click="viewDocument(org.id)">{{ text('Document', 'เอกสาร') }}</button>
            </div>
          </div>
          <div v-if="paginatedOrganizations.length === 0" class="empty_state">{{ text('No organizations found.', 'ไม่พบองค์กร') }}</div>
        </div>
        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          :total-items="filteredOrganizations.length"
          :loading="loading"
          :show-info="false"
          @page-change="handlePageChange"
        />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import UserNavbar from '../components/UserNavbar.vue'
import Pagination from '../components/Pagination.vue'
import { organizationAPI, mouAPI, getMouFileUrl } from '../services/api'
import { useLanguage } from '../composables/useLanguage'

const router = useRouter()
const { currentLanguage, text } = useLanguage()
const organizations = ref<any[]>([])
const mous = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const searchText = ref('')
const selectedSchool = ref('')
const selectedCountry = ref('')
const selectedType = ref('')
const selectedProvince = ref('')
const currentPage = ref(1)
const itemsPerPage = 8

const localized = (english: unknown, thai: unknown, fallback = '') =>
  String((currentLanguage.value === 'TH' ? thai : english) || (currentLanguage.value === 'TH' ? english : thai) || fallback || 'N/A')

const display = (...values: unknown[]) =>
  String(values.find((value) => value !== undefined && value !== null && String(value).trim()) || 'N/A')

const uniqueLocalized = (fieldEn: string, fieldTh: string) => Array.from(new Set(organizations.value
  .map((organization) => localized(organization.raw[fieldEn], organization.raw[fieldTh]))
  .filter((value) => value && value !== 'N/A'))).sort()

const schools = computed(() => uniqueLocalized('school_en', 'school_th'))
const countries = computed(() => uniqueLocalized('country_en', 'country_th'))
const provinces = computed(() => uniqueLocalized('province_en', 'province_th'))
const types = computed(() => Array.from(new Set(organizations.value
  .map((organization) => String(organization.raw.organization_type || organization.raw.business_type_en || organization.raw.business_type_th || ''))
  .filter(Boolean))).sort())

const filteredOrganizations = computed(() => {
  const query = searchText.value.trim().toLowerCase()
  return organizations.value.filter((organization) => {
    const raw = organization.raw
    const matchesSearch = !query || [
      raw.name_en, raw.name_th, raw.organization_name_en, raw.organization_name_th,
      raw.email, raw.address_en, raw.address_th
    ].some((value) => String(value || '').toLowerCase().includes(query))
    const matchesSchool = !selectedSchool.value || localized(raw.school_en, raw.school_th) === selectedSchool.value
    const matchesCountry = !selectedCountry.value || localized(raw.country_en, raw.country_th) === selectedCountry.value
    const matchesProvince = !selectedProvince.value || localized(raw.province_en, raw.province_th) === selectedProvince.value
    const matchesType = !selectedType.value || String(raw.organization_type || raw.business_type_en || raw.business_type_th || '') === selectedType.value
    return matchesSearch && matchesSchool && matchesCountry && matchesProvince && matchesType
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredOrganizations.value.length / itemsPerPage)))
const paginatedOrganizations = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredOrganizations.value.slice(start, start + itemsPerPage)
})

watch([searchText, selectedSchool, selectedCountry, selectedType, selectedProvince], () => { currentPage.value = 1 })

const resetFilters = () => {
  searchText.value = ''
  selectedSchool.value = ''
  selectedCountry.value = ''
  selectedType.value = ''
  selectedProvince.value = ''
  currentPage.value = 1
}
const applyFilters = () => { currentPage.value = 1 }
const handlePageChange = (page: number) => {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page
}
const viewOrganization = (id: string) => router.push(`/user/organization/${id}`)

const isPublished = (value: any) => value === true || value === 'true' || value === 1 || value === '1'
const viewDocument = (organizationId: string) => {
  const mou = mous.value.find((record) => {
    const reference = record.organization_id
    return String(typeof reference === 'object' ? reference?._id : reference) === organizationId
  })
  if (mou?._id) window.open(getMouFileUrl(mou._id), '_blank', 'noopener,noreferrer')
}

const loadOrganizations = async () => {
  loading.value = true
  error.value = ''
  try {
    const [organizationResponse, mouResponse] = await Promise.all([
      organizationAPI.getAll({ limit: 100 }),
      mouAPI.getAll({ limit: 100 })
    ])
    const records = organizationResponse.data?.data || []
    mous.value = (mouResponse.data?.data || []).filter((record: any) => isPublished(record.is_published))
    const mouOrganizationIds = new Set(mous.value.map((record: any) => {
      const reference = record.organization_id
      return String(typeof reference === 'object' ? reference?._id : reference)
    }))
    organizations.value = records.map((record: any) => ({
      id: String(record._id),
      raw: record,
      status: record.is_public === true || record.is_public === 'true' || record.is_public === 1 ? 'active' : 'inactive',
      hasMOU: mouOrganizationIds.has(String(record._id))
    }))
  } catch (requestError: any) {
    error.value = requestError.response?.data?.message || text('Unable to load organizations.', 'ไม่สามารถโหลดองค์กรได้')
  } finally {
    loading.value = false
  }
}

onMounted(loadOrganizations)
</script>

<style scoped>
.user_organization { min-height: 100vh; background: #f6f7f8; }
.main_content { margin-left: 66px; }
.content_area { max-width: 1100px; margin: 0 auto; padding: 28px 24px 60px; }
.page_heading h1 { margin: 0; font: 600 40px/50px Outfit, sans-serif; }
.page_heading p { margin: 6px 0 18px; color: #6b7280; }
.filter_section { display: grid; grid-template-columns: 1fr; gap: 12px; background: #fff; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
.search_input, .filter_select { height: 42px; border: 1px solid #d1d5db; border-radius: 8px; padding: 0 12px; background: #fff; }
.dropdowns_grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.filter_buttons { display: flex; justify-content: flex-end; gap: 8px; }
.reset_btn, .search_btn, .text_action { height: 40px; border: 1px solid #d1d5db; border-radius: 8px; background: #fff; padding: 0 14px; cursor: pointer; }
.search_btn { background: #111827; color: #fff; border-color: #111827; }
.table_container { background: #fff; border-radius: 12px; overflow-x: auto; }
.table_header, .table_row { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr .7fr 1fr; align-items: center; min-width: 940px; }
.table_header { padding: 12px; font-weight: 600; background: #f9fafb; }
.table_row { padding: 10px 12px; border-top: 1px solid #edf0f2; }
.org_name { border: 0; background: none; text-align: left; color: #2563eb; cursor: pointer; }
.status_pill { border-radius: 999px; padding: 5px 10px; font-size: 12px; }
.status_pill.active { background: #dcfce7; color: #166534; }
.status_pill.inactive { background: #fee2e2; color: #991b1b; }
.action_buttons { display: flex; gap: 6px; }
.text_action { height: 34px; color: #2563eb; }
.empty_state { padding: 30px; text-align: center; background: #fff; border-radius: 12px; color: #6b7280; }
.empty_state.error { color: #dc2626; }
@media (max-width: 900px) { .dropdowns_grid { grid-template-columns: repeat(2, 1fr); } }
</style>
