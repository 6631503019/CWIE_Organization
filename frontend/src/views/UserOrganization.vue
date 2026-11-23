<template>
  <div class="admin_organization">
    <UserNavbar />
    
    <!-- Main content -->
    <main class="main_content">
      <AdminTopBar
      />

      <section class="content_area">
        <div class="page_heading">
          <div>
            <h1>{{ text('Organization', 'องค์กร') }}</h1>
            <p>{{ text('Manage and view all organization data in the database.', 'จัดการและดูข้อมูลทั้งหมดขององค์กรในฐานข้อมูล') }}</p>
          </div>
          <div class="page_actions"></div>
        </div>

        <section class="filter_section">
          <input type="text" :placeholder="text('Search organization...', 'ค้นหาองค์กร...')" class="search_input" v-model="searchText" />
          <div class="dropdowns_grid">
          <div class="filter_field business_category" :class="{ active: dropdowns.businessCategory }">
            <span class="filter_label">{{ text('Business Category', 'หมวดธุรกิจ') }}</span>
            <div class="dropdown_container">
            <div class="dropdown_header" @click="toggleDropdown('businessCategory')">
              <span class="dropdown_text">{{ getSelectedFilterLabel('businessCategory', selectedFilters.businessCategory) }}</span>
              <div class="dropdown_arrow"></div>
            </div>
            <div v-if="dropdowns.businessCategory" class="dropdown_options">
              <div class="dropdown_search">
                <input type="text" v-model="dropdownSearch.businessCategory" placeholder="Search..." @click.stop class="dropdown_search_input" />
              </div>
              <div class="dropdown_option" v-for="option in filteredBusinessCategory" :key="option" @click="selectOption('businessCategory', option)">
                {{ getFilterOptionLabel('businessCategory', option) }}
              </div>
            </div>
              </div>
            </div>
          </div>
          <div class="filter_field industry_cat" :class="{ active: dropdowns.industryCat }">
            <span class="filter_label">{{ text('School', 'สำนักวิชา') }}</span>
            <div class="dropdown_container">
            <div class="dropdown_header" @click="toggleDropdown('industryCat')">
              <span class="dropdown_text">{{ getSelectedFilterLabel('industryCat', selectedFilters.industryCat) }}</span>
              <div class="dropdown_arrow"></div>
            </div>
            <div v-if="dropdowns.industryCat" class="dropdown_options">
              <div class="dropdown_search">
                <input 
                  type="text" 
                  v-model="dropdownSearch.industryCat" 
                  placeholder="Search..."
                  @click.stop
                  class="dropdown_search_input"
                />
              </div>
              <div class="dropdown_option" v-for="option in filteredIndustryCat" :key="option" @click="selectOption('industryCat', option)">
                {{ getFilterOptionLabel('industryCat', option) }}
              </div>
            </div>
            </div>
          </div>
          <div class="filter_field country" :class="{ active: dropdowns.country }">
            <span class="filter_label">{{ text('Country', 'ประเทศ') }}</span>
            <div class="dropdown_container">
            <div class="dropdown_header" @click="toggleDropdown('country')">
              <span class="dropdown_text">{{ getSelectedFilterLabel('country', selectedFilters.country) }}</span>
              <div class="dropdown_arrow"></div>
            </div>
            <div v-if="dropdowns.country" class="dropdown_options">
              <div class="dropdown_search">
                <input 
                  type="text" 
                  v-model="dropdownSearch.country" 
                  placeholder="Search..."
                  @click.stop
                  class="dropdown_search_input"
                />
              </div>
              <div class="dropdown_option" v-for="option in filteredCountry" :key="option" @click="selectOption('country', option)">
                {{ getFilterOptionLabel('country', option) }}
              </div>
            </div>
            </div>
          </div>
          <div class="filter_field type" :class="{ active: dropdowns.type }">
            <span class="filter_label">{{ text('Type', 'ประเภท') }}</span>
            <div class="dropdown_container">
            <div class="dropdown_header" @click="toggleDropdown('type')">
              <span class="dropdown_text">{{ getSelectedFilterLabel('type', selectedFilters.type) }}</span>
              <div class="dropdown_arrow"></div>
            </div>
            <div v-if="dropdowns.type" class="dropdown_options">
              <div class="dropdown_search">
                <input
                  type="text"
                  v-model="dropdownSearch.type"
                  placeholder="Search..."
                  @click.stop
                  class="dropdown_search_input"
                />
              </div>
              <div class="dropdown_option" v-for="option in filteredType" :key="option" @click="selectOption('type', option)">
                {{ getFilterOptionLabel('type', option) }}
              </div>
            </div>
            </div>
          </div>
          <div class="filter_field province" :class="{ active: dropdowns.province }">
            <span class="filter_label">{{ text('Province', 'จังหวัด') }}</span>
            <div class="dropdown_container">
            <div class="dropdown_header" @click="toggleDropdown('province')">
              <span class="dropdown_text">{{ getSelectedFilterLabel('province', selectedFilters.province) }}</span>
              <div class="dropdown_arrow"></div>
            </div>
            <div v-if="dropdowns.province" class="dropdown_options">
              <div class="dropdown_search">
                <input 
                  type="text" 
                  v-model="dropdownSearch.province" 
                  placeholder="Search..."
                  @click.stop
                  class="dropdown_search_input"
                />
              </div>
              <div class="dropdown_option" v-for="option in filteredProvince" :key="option" @click="selectOption('province', option)">
                {{ getFilterOptionLabel('province', option) }}
              </div>
            </div>
          </div>
        </div>

          <div class="filter_buttons"><button class="reset_btn" @click="resetFilters">{{ text('Reset', 'รีเซ็ต') }}</button><button class="search_btn" @click="searchOrganizations">{{ text('search', 'ค้นหา') }}</button></div>
        </section>

        <div class="table_container">
          <div class="table_header"><span>{{ text('Organization', 'องค์กร') }}</span><span>{{ text('Type', 'ประเภท') }}</span><span>{{ text('Business Category', 'หมวดธุรกิจ') }}</span><span>{{ text('School', 'สำนักวิชา') }}</span><span>{{ text('Province', 'จังหวัด') }}</span><span>{{ text('Country', 'ประเทศ') }}</span><span>{{ text('Status', 'สถานะ') }}</span><span>{{ text('Actions', 'การดำเนินการ') }}</span></div>
          <div v-for="org in paginatedOrganizations" :key="org.id" class="table_row">
            <div class="org_name" @click="viewOrganizationDetail(org.id)">{{ getLocalizedOrganizationName(org.rawData) }}</div>
            <div class="org_category">{{ getOrganizationDisplayField(org.rawData, ['organization_type', 'business_type_en', 'business_type'], ['business_type_th', 'organization_type_th']) }}</div>
            <div class="org_business_category">{{ getOrganizationDisplayField(org.rawData, ['business_category_en', 'industry_category_en', 'industry_category_id'], ['business_category_th', 'industry_category_th']) === 'N/A' ? '-' : getOrganizationDisplayField(org.rawData, ['business_category_en', 'industry_category_en', 'industry_category_id'], ['business_category_th', 'industry_category_th']) }}</div>
            <div class="org_school">{{ getOrganizationDisplayField(org.rawData, ['school_en', 'school', 'school_name_en'], ['school_th', 'school_name_th'], ['school_id']) }}</div>
            <div class="org_province">{{ getOrganizationDisplayField(org.rawData, ['province_en', 'province'], ['province_th'], ['province_id']) }}</div>
            <div class="org_country">{{ getOrganizationDisplayField(org.rawData, ['country_en', 'country'], ['country_th'], ['country_id']) }}</div>
            <div><span class="status_pill" :class="org.status">{{ org.status === 'active' ? text('Active', 'ใช้งาน') : text('Inactive', 'ไม่ใช้งาน') }}</span></div>
            <div class="action_buttons"><button v-if="org.hasMOU" class="text_action" @click="!state.loading && viewDocument(org.id)">{{ text('View', 'ดู') }}</button></div>
          </div>
          <div v-if="!state.loading && paginatedOrganizations.length === 0" class="empty_state">No organizations found.</div>
        </div>
        <Pagination :current-page="state.currentPage" :total-pages="paginationInfo.totalPages" :total-items="paginationInfo.totalItems" :loading="state.loading" :show-info="false" @page-change="handlePageChange" />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import UserNavbar from '../components/UserNavbar.vue'
import AdminTopBar from '../components/admin/AdminTopBar.vue'
import Pagination from '../components/Pagination.vue'
import { organizationAPI, mouAPI, getMouFileUrl } from '../services/api'
import { useLanguage } from '../composables/useLanguage'

const router = useRouter()
const { currentLanguage, text } = useLanguage()
const state = reactive({ loading: false, error: null as string | null, currentPage: 1, itemsPerPage: 8, totalPages: 1, totalItems: 0 })
const organizations = ref<any[]>([])
const mouRecords = ref<any[]>([])
const searchText = ref('')
const dropdowns = reactive({ industryCat: false, country: false, type: false, province: false, businessCategory: false })
const dropdownSearch = reactive({ industryCat: '', country: '', type: '', province: '', businessCategory: '' })
const selectedFilters = reactive({ industryCat: '', country: '', type: '', province: '', businessCategory: '' })

const localized = (english: unknown, thai: unknown, fallback = '') => String((currentLanguage.value === 'TH' ? thai : english) || (currentLanguage.value === 'TH' ? english : thai) || fallback || 'N/A')
const getLocalizedOrganizationName = (organization: any) => localized(organization?.name_en, organization?.name_th)
const getOrganizationDisplayField = (organization: any, englishFields: string[], thaiFields: string[], idFields: string[] = []) => {
  const fields = currentLanguage.value === 'TH' ? thaiFields : englishFields
  const fallbackFields = currentLanguage.value === 'TH' ? englishFields : thaiFields
  for (const field of [...fields, ...fallbackFields, ...idFields]) {
    const value = organization?.[field]
    if (value !== undefined && value !== null && String(value).trim()) return String(value)
  }
  return 'N/A'
}
const optionsFor = (englishField: string, thaiField: string) => Array.from(new Set(organizations.value.map(item => localized(item.rawData[englishField], item.rawData[thaiField])).filter(value => value && value !== 'N/A'))).sort()
const filteredIndustryCat = computed(() => optionsFor('school_en', 'school_th').filter(value => !dropdownSearch.industryCat || value.toLowerCase().includes(dropdownSearch.industryCat.toLowerCase())))
const filteredCountry = computed(() => optionsFor('country_en', 'country_th').filter(value => !dropdownSearch.country || value.toLowerCase().includes(dropdownSearch.country.toLowerCase())))
const filteredProvince = computed(() => optionsFor('province_en', 'province_th').filter(value => !dropdownSearch.province || value.toLowerCase().includes(dropdownSearch.province.toLowerCase())))
const filteredType = computed(() => Array.from(new Set(organizations.value.map(item => getOrganizationDisplayField(item.rawData, ['organization_type', 'business_type_en', 'business_type'], ['business_type_th', 'organization_type_th'])).filter(value => value !== 'N/A'))).sort())
const filteredBusinessCategory = computed(() => {
  const values = Array.from(new Set(organizations.value.map(item =>
    getOrganizationDisplayField(item.rawData, ['business_category_en', 'industry_category_en', 'industry_category_id'], ['business_category_th', 'industry_category_th'])
  ).filter(value => value !== 'N/A'))).sort()
  const options = ['', ...values]
  const query = dropdownSearch.businessCategory.trim().toLowerCase()
  return options.filter(option => !query || getSelectedFilterLabel('businessCategory', option).toLowerCase().includes(query))
})

const toggleDropdown = (key: 'industryCat' | 'country' | 'type' | 'province' | 'businessCategory') => { dropdowns[key] = !dropdowns[key] }
const getSelectedFilterLabel = (key: keyof typeof selectedFilters, value: string) => value || ({ industryCat: text('School', 'สำนักวิชา'), country: text('Country', 'ประเทศ'), type: text('Type', 'ประเภท'), province: text('Province', 'จังหวัด'), businessCategory: text('Business Category', 'หมวดธุรกิจ') } as any)[key]
const getFilterOptionLabel = (_key: string, value: string) => value
const selectOption = (key: keyof typeof selectedFilters, value: string) => { selectedFilters[key] = value; dropdowns[key] = false }
const Handle_Dropdown_Outside = (event: PointerEvent) => {
  const target = event.target as Element | null
  if (!target?.closest('.filter_field')) {
    Object.keys(dropdowns).forEach(key => {
      dropdowns[key as keyof typeof dropdowns] = false
    })
  }
}

const paginatedOrganizations = computed(() => {
  return organizations.value
})
const paginationInfo = computed(() => ({
  totalItems: state.totalItems,
  totalPages: Math.max(1, state.totalPages)
}))
let userSearchTimeout: number | null = null
watch([searchText, () => selectedFilters.industryCat, () => selectedFilters.country, () => selectedFilters.type, () => selectedFilters.province, () => selectedFilters.businessCategory], () => {
  state.currentPage = 1
  if (userSearchTimeout) window.clearTimeout(userSearchTimeout)
  userSearchTimeout = window.setTimeout(() => { void loadOrganizations() }, 300)
})
const resetFilters = () => { searchText.value = ''; selectedFilters.industryCat = ''; selectedFilters.country = ''; selectedFilters.type = ''; selectedFilters.province = ''; selectedFilters.businessCategory = ''; state.currentPage = 1 }
const searchOrganizations = () => { state.currentPage = 1 }
const handlePageChange = (page: number) => { if (page >= 1 && page <= paginationInfo.value.totalPages) state.currentPage = page }
const viewOrganizationDetail = (id: string) => router.push(`/user/organization/${id}`)
const isPublished = (value: any) => value === true || value === 'true' || value === 1 || value === '1'
const viewDocument = (organizationId: string) => {
  const mou = mouRecords.value.find(record => { const reference = record.organization_id; return String(typeof reference === 'object' ? reference?._id : reference) === organizationId })
  if (mou?._id) window.open(getMouFileUrl(mou._id), '_blank', 'noopener,noreferrer')
}
const loadOrganizations = async () => {
  state.loading = true
  state.error = null
  try {
    const params: any = { page: state.currentPage, limit: state.itemsPerPage, public: 'true' }
    if (searchText.value.trim()) params.search = searchText.value.trim()
    if (selectedFilters.industryCat) params.school = selectedFilters.industryCat
    if (selectedFilters.country) params.country = selectedFilters.country
    if (selectedFilters.type) params.type = selectedFilters.type
    if (selectedFilters.province) params.province = selectedFilters.province
    if (selectedFilters.businessCategory) params.businessCategory = selectedFilters.businessCategory
    const [organizationResponse, mouResponse] = await Promise.all([organizationAPI.getAll(params), mouAPI.getAll({ limit: 100 })])
    const records = organizationResponse.data?.data || []
    const pagination = organizationResponse.data?.pagination
    state.totalPages = pagination?.pages || Math.max(1, Math.ceil(records.length / state.itemsPerPage))
    state.totalItems = pagination?.total || records.length
    mouRecords.value = (mouResponse.data?.data || []).filter((record: any) => isPublished(record.is_published))
    const mouIds = new Set(mouRecords.value.map(record => { const reference = record.organization_id; return String(typeof reference === 'object' ? reference?._id : reference) }))
    organizations.value = records.map((record: any) => ({ id: String(record._id), rawData: record, status: isPublished(record.is_public) ? 'active' : 'inactive', hasMOU: mouIds.has(String(record._id)) }))
  } catch (error: any) {
    state.error = error.response?.data?.message || text('Unable to load organizations.', '??????????????????????')
  } finally { state.loading = false }
}
onMounted(() => {
  document.addEventListener('pointerdown', Handle_Dropdown_Outside)
  void loadOrganizations()
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', Handle_Dropdown_Outside)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600&family=Inter:wght@400;500;600;700&family=DM+Sans:wght@400;500&display=swap');

/* Header Section */
.header_section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1113px;
  margin-bottom: 30px;
  position: relative;
  gap: 8px;
}

/* Organization title */
.organization_title {
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 600;
  font-size: 40px;
  line-height: 50px;
  color: #000000;
  margin: 0;
}

/* Buttons Group */
.buttons_group {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* Line separator */
.line_21 {
  display: none;
}

/* Filter section container */
.filter_section {
  position: relative;
  width: 100%;
  max-width: 1080px;
  background: #FFFFFF;
  box-shadow: 0px 4px 4px rgba(118, 118, 118, 0.5);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

/* Filter title */
.filter_title {
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 600;
  font-size: 20px;
  line-height: 25px;
  color: #000000;
  margin-bottom: 20px;
}

/* Search input container */
.search_container {
  width: 100%;
  margin-bottom: 20px;
}

.search_input {
  box-sizing: border-box;
  width: 100%;
  height: 35px;
  background: #FFFFFF;
  border: 1px solid #B1B1B1;
  border-radius: 8px;
  padding: 0 14px;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  color: #000000;
}

.search_input::placeholder {
  color: #B1B1B1;
}

/* Dropdown containers */
.dropdown_container {
  position: relative;
  z-index: 1;
  margin-bottom: 15px;
}

.dropdown_container.active {
  z-index: 9999;
}

.dropdowns_grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.dropdown_container.org_type,
.dropdown_container.industry_cat {
  grid-column: span 1;
}

.dropdown_container.country,
.dropdown_container.type,
.dropdown_container.province {
  grid-column: span 1;
}

.dropdown_header {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 7px;
  width: 100%;
  height: 32px;
  background: #FFFFFF;
  border: 1px solid #B1B1B1;
  border-radius: 8px;
  cursor: pointer;
}

.dropdown_text {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  color: #545454;
}

.dropdown_arrow {
  width: 5.83px;
  height: 4.38px;
  background: #000000;
  clip-path: polygon(50% 100%, 0 0, 100% 0);
}

.dropdown_options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #FFFFFF;
  border: 1px solid #B1B1B1;
  border-top: none;
  border-radius: 0 0 8px 8px;
  max-height: 250px;
  overflow-y: auto;
  z-index: 9999;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

.dropdown_search {
  position: sticky;
  top: 0;
  background: #FFFFFF;
  padding: 8px;
  border-bottom: 1px solid #E0E0E0;
  z-index: 10000;
}

.dropdown_search_input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #D0D0D0;
  border-radius: 4px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #333333;
}

.dropdown_search_input:focus {
  outline: none;
  border-color: #AB1C03;
}

.dropdown_search_input::placeholder {
  color: #999999;
}

.dropdown_option {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  min-height: 32px;
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #000000;
  cursor: pointer;
  transition: background 0.15s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown_option:hover {
  background: #F3F4F6;
}

.dropdown_option:last-child {
  border-radius: 0 0 8px 8px;
}

/* Filter buttons */
.filter_buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  align-items: center;
}

.reset_btn {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 5px 16px;
  background: #FFFFFF;
  border: 1px solid #B1B1B1;
  border-radius: 20px;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 17px;
  color: #000000;
  cursor: pointer;
}

.search_btn {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 5px 16px;
  background: #AB1C03;
  border: none;
  border-radius: 20px;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 17px;
  color: #FFFFFF;
  cursor: pointer;
}

/* Add Organization Button */
.add_org_btn {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 6px 12px;
  gap: 6px;
  height: 32px;
  background: #C70000;
  border-radius: 6px;
  cursor: pointer;
  flex-shrink: 0;
}

/* Import Button */
.import_btn {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 6px 12px;
  gap: 6px;
  height: 32px;
  background: #16A34A;
  border-radius: 6px;
  cursor: pointer;
  flex-shrink: 0;
}

.import_btn:hover {
  background: #15803D;
}

.upload_icon {
  width: 20px;
  height: 20px;
  background: #FFFFFF;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z'/%3E%3C/svg%3E") no-repeat center;
  mask-size: contain;
}

.plus_icon {
  width: 20px;
  height: 20px;
  position: relative;
}

.plus_icon::before,
.plus_icon::after {
  content: '';
  position: absolute;
  background: #FFFFFF;
  border-radius: 1px;
}

.plus_icon::before {
  width: 12px;
  height: 2px;
  left: 4px;
  top: 9px;
}

.plus_icon::after {
  width: 2px;
  height: 12px;
  left: 9px;
  top: 4px;
}

.button_text {
  height: 20px;
  font-family: 'DM Sans';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #FFFFFF;
  white-space: nowrap;
}

/* Table container */
.table_container {
  position: relative;
  width: 100%;
  max-width: 1113px;
  min-height: 411px;
  background: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 12px;
  overflow-x: auto;
  margin-bottom: 30px;
  flex-shrink: 0;
}

/* Table header */
.table_header {
  position: relative;
  width: 100%;
  height: 67px;
  background: #FFFFFF;
  border-bottom: 1px solid #000000;
}

.header_status {
  position: absolute;
  width: 64px;
  height: 39.73px;
  left: 5px;
  top: 11.92px;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 19px;
  color: #000000;
}

.header_organization {
  position: absolute;
  width: 102px;
  height: 39.73px;
  left: 86px;
  top: 11.92px;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 19px;
  color: #000000;
}

/* Table rows */
.table_row {
  position: relative;
  width: 100%;
  height: 70px;
  background: #FFFFFF;
  border-bottom: 1px solid #BCBCBE;
}



/* Status indicators */
.status_indicator {
  position: absolute;
  width: 17.12px;
  height: 21.26px;
  left: 14.43px;
  top: 24px;
  border-radius: 50%;
}

.status_indicator.active {
  background: #00FF5E;
}

.status_indicator.inactive {
  background: #FF0000;
}

/* Organization name */
.org_name {
  position: absolute;
  width: 214.04px;
  height: 32.95px;
  left: 84.76px;
  top: 18px;
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 400;
  font-size: 15px;
  line-height: 19px;
  color: #000000;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  transition: color 0.2s ease;
}

.org_name:hover {
  color: #0066cc;
  text-decoration: underline;
}

/* Category */
/* Created date */
.org_created {
  position: absolute;
  width: 85.62px;
  height: 22.32px;
  left: 729.44px;
  top: 23px;
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 400;
  font-size: 15px;
  line-height: 19px;
  color: #000000;
}

/* Edited date */
/* Action buttons */
.action_buttons {
  position: absolute;
  right: 20px;
  top: 20px;
  display: flex;
  gap: 20px;
  align-items: center;
}

.edit_btn, .delete_btn, .document_btn {
  width: 20px;
  height: 20px;
  cursor: pointer;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.edit_btn {
  background-color: #000000;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z'/%3E%3C/svg%3E") no-repeat center;
  mask-size: contain;
}

.delete_btn {
  background-color: #ff4444;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z'/%3E%3C/svg%3E") no-repeat center;
  mask-size: contain;
}

.document_btn {
  background-color: #4CAF50;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z'/%3E%3C/svg%3E") no-repeat center;
  mask-size: contain;
}

/* Button hover and disabled states */
.edit_btn:hover,
.delete_btn:hover,
.document_btn:hover {
  opacity: 0.8;
  cursor: pointer;
}

.edit_btn[disabled],
.delete_btn[disabled],
.document_btn[disabled] {
  opacity: 0.5;
}

/* Additional responsive styles */
.org_type {
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Inter';
  font-weight: 500;
  font-size: 12px;
  text-transform: uppercase;
}

.org_type.government {
  background: #E3F2FD;
  color: #1976D2;
}

.org_type.private {
  background: #F3E5F5;
  color: #7B1FA2;
}

.org_type.ngo {
  background: #E8F5E8;
  color: #388E3C;
}

.org_type.educational {
  background: #FFF3E0;
  color: #F57C00;
}

.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Inter';
  font-weight: 500;
  font-size: 12px;
  text-transform: capitalize;
}

.status.active {
  background: #E8F5E8;
  color: #2E7D32;
}

.status.inactive {
  background: #FFEBEE;
  color: #C62828;
}

.status.pending {
  background: #FFF3E0;
  color: #EF6C00;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn_action {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
}

.btn-action.edit {
  background: #E3F2FD;
  color: #1976D2;
}

.btn-action.view {
  background: #F3E5F5;
  color: #7B1FA2;
}

.btn-action.delete {
  background: #FFEBEE;
  color: #C62828;
}

.btn_action:hover {
  opacity: 0.8;
}

/* Delete Modal Styles - Following Figma Design */
.delete_modal_overlay {
  position: fixed;
  width: 100%;
  height: 100dvh;
  left: 0px;
  top: 0px;
  background: rgba(84, 84, 84, 0.5);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.delete_modal_container {
  position: relative;
  width: 450px;
  min-height: 300px;
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15);
  padding: 30px;
  box-sizing: border-box;
}

.modal_header {
  margin-bottom: 25px;
}

.modal-header h3 {
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 600;
  font-size: 24px;
  line-height: 30px;
  color: #000000;
  margin: 0;
}

.modal_body {
  margin-bottom: 35px;
}

.modal-body p {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 20px;
  color: #545454;
  margin: 0 0 15px 0;
}

.organization_info {
  padding: 15px;
  background: #F8F9FA;
  border-radius: 8px;
  border-left: 4px solid #C70000;
}

.organization-info strong {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 20px;
  color: #000000;
}

.modal_actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

.cancel_btn {
  background: #FFFFFF;
  color: #545454;
  border: 1px solid #B1B1B1;
  border-radius: 6px;
  padding: 10px 20px;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel_btn:hover {
  background: #F8F9FA;
  border-color: #999999;
}

.confirm_delete_btn {
  background: #C70000;
  color: #FFFFFF;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.confirm_delete_btn:hover {
  background: #AB1C03;
}

/* Modal Animation */
.delete_modal_overlay {
  animation: fadeIn 0.3s ease-out;
}

.delete_modal_container {
  animation: slideIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { 
    opacity: 0;
    transform: translateY(-30px) scale(0.9);
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 768px) {
  .organization_controls {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .search_box {
    width: 100%;
  }
  
  .organizations_table {
    font-size: 12px;
  }
  
  .form_row {
    grid-template-columns: 1fr;
  }
}

/* Add Organization Modal Styles */
.modal_overlay {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100dvh;
  padding: 24px;
  box-sizing: border-box;
  background: rgba(84, 84, 84, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.add_org_modal {
  position: relative;
  width: min(657px, calc(100vw - 48px));
  min-height: 400px;
  max-height: calc(100dvh - 48px);
  background: #FFFFFF;
  border-radius: 12px;
  display: flex;
}

.add_org_modal.organization_active {
  height: auto;
  min-height: 657px;
  max-height: calc(100dvh - 48px);
}

.add_org_modal.review_active,
.add_org_modal.mou_active {
  min-height: 400px;
  max-height: 657px;
  height: auto;
}

.modal_tabs {
  position: absolute;
  width: 42px;
  height: 280px;
  left: 657px;
  top: 35px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  background: transparent;
}

.tab_item {
  position: relative;
  width: 42px;
  height: 75px;
  background: #D9D9D9;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 11px;
  line-height: 13px;
  color: #000000;
}

/* Remove individual positioning for tabs */
.tab_item:nth-child(1),
.tab_item:nth-child(2),
.tab_item:nth-child(3) {
  position: relative;
  left: auto;
  right: auto;
  top: auto;
  bottom: auto;
}

.tab_item span {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) rotate(90deg);
  transform-origin: center center;
  white-space: nowrap;
  color: inherit;
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 11px;
  line-height: 13px;
}

.tab_item.active {
  background: #AB1C03;
  color: #FFFFFF;
}

.tab_item:hover:not(.active) {
  background: #E0E0E0;
}

.modal_content {
  position: absolute;
  left: 0.8%;
  right: 6.5%;
  top: 0%;
  bottom: 0%;
  background: #FFFFFF;
  border-radius: 12px;
  padding: 20px;
  overflow-y: auto;
  max-height: calc(100dvh - 48px);
  box-sizing: border-box;
}

.modal_title {
  margin: 0 0 10px 0;
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 19px;
  color: #000000;
}



.logo_upload_section {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
}

.logo_preview {
  width: 95px;
  height: 95px;
  border-radius: 47.5px;
  overflow: hidden;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.15);
}

.logo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload_area {
  width: 58px;
  height: 58px;
  background: #D9D9D9;
  border-radius: 9px;
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload_icon {
  width: 20px;
  height: 20px;
  background: #000;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z'/%3E%3C/svg%3E") no-repeat;
  mask-size: contain;
}

.file_input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.upload_text {
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 19px;
  color: #545454;
}

.form_row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.form_group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form_group.full_width {
  width: 100%;
}

.form_group label {
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 19px;
  color: #000000;
}

/* Modal Dropdown Styles */
.modal_dropdown_wrapper {
  position: relative;
  width: 100%;
}

.modal_dropdown_header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 90%;
  height: 40px;
  padding: 8px 12px;
  background: #FFFFFF;
  border: 1px solid #B1B1B1;
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.modal_dropdown_header:hover {
  border-color: #AB1C03;
}

.modal_dropdown_text {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #333333;
}

.modal_dropdown_arrow {
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #000000;
  transition: transform 0.2s;
}

.modal_dropdown_arrow.open {
  transform: rotate(180deg);
}

.modal_dropdown_options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  max-height: 250px;
  overflow-y: auto;
  background: #FFFFFF;
  border: 1px solid #B1B1B1;
  border-radius: 6px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.modal_dropdown_search {
  position: sticky;
  top: 0;
  background: #FFFFFF;
  padding: 8px;
  border-bottom: 1px solid #E0E0E0;
  z-index: 1001;
}

.modal_dropdown_search_input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #D0D0D0;
  border-radius: 4px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #333333;
}

.modal_dropdown_search_input:focus {
  outline: none;
  border-color: #AB1C03;
}

.modal_dropdown_search_input::placeholder {
  color: #999999;
}

.modal_dropdown_option {
  padding: 10px 12px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #333333;
  cursor: pointer;
  transition: background-color 0.2s;
}

.modal_dropdown_option:hover {
  background-color: #F5F5F5;
}

.form_group input,
.form_group textarea,
.form_group select {
  padding: 8px 12px;
  background: #FFFFFF;
  border: 1px solid #767676;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #000000;
}

.form_group input,
.form_group select {
  height: 36px;
  line-height: 20px;
}

.form_group input:focus,
.form_group textarea:focus,
.form_group select:focus {
  outline: none;
  border-color: #AB1C03;
}

.form_group textarea {
  resize: vertical;
  min-height: 60px;
}

.textarea_md {
  min-height: 96px;
}

.textarea_lg {
  min-height: 128px;
}

.public_toggle {
  display: flex;
  align-items: center;
  gap: 15px;
  margin: 20px 0;
}

.public_toggle label {
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 19px;
  color: #000000;
}

.toggle_switch {
  width: 36px;
  height: 18px;
  background: #A1A1A1;
  border-radius: 9px;
  position: relative;
  cursor: pointer;
  transition: background 0.2s ease;
}

.toggle_switch.active {
  background: #4CAF50;
}

.toggle_slider {
  width: 14px;
  height: 14px;
  background: #FFFFFF;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.2s ease;
}

.toggle_switch.active .toggle_slider {
  transform: translateX(18px);
}

.modal_actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

.btn_cancel,
.btn_save {
  padding: 8px 20px;
  border-radius: 20px;
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 13px;
  line-height: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn_cancel {
  background: #FFFFFF;
  border: 1px solid #B1B1B1;
  color: #000000;
}

.btn_cancel:hover {
  background: #F5F5F5;
}

.btn_save {
  background: #AB1C03;
  border: none;
  color: #FFFFFF;
}

.btn_save:hover {
  background: #8A1502;
}

.review_tab,
.mou_tab {
  padding: 10px 8px 0 8px;
}

/* Star Rating Styles */
.rating_section {
  margin: 20px 0;
}

/* Review Tab Styles */
.review_tab {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section_subtitle {
  font-family: 'Outfit';
  font-weight: 600;
  font-size: 16px;
  line-height: 20px;
  color: #000000;
  margin: 0;
  padding-top: 10px;
}

.existing_reviews_carousel {
  background: #F9F9F9;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  padding: 20px;
}

.carousel_container {
  display: flex;
  align-items: center;
  gap: 15px;
  justify-content: space-between;
  min-height: 200px;
}

.review_nav_btn {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border: 1px solid #D0D0D0;
  background: #FFFFFF;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.review_nav_btn:hover:not(:disabled) {
  background: #F0F0F0;
  border-color: #AB1C03;
}

.review_nav_btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav_arrow_left,
.nav_arrow_right {
  width: 6px;
  height: 6px;
  background: #000000;
}

.nav_arrow_left {
  clip-path: polygon(100% 0, 0 50%, 100% 100%);
}

.nav_arrow_right {
  clip-path: polygon(0 0, 100% 50%, 0 100%);
}

.review_carousel_card {
  flex: 1;
  background: #FFFFFF;
  border: 1px solid #E0E0E0;
  border-radius: 6px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 180px;
}

.review_card_header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.review_position {
  font-family: 'Inter';
  font-weight: 600;
  font-size: 14px;
  color: #545454;
}

.delete_review_btn {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border: none;
  background: #F0F0F0;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.delete_review_btn:hover {
  background: #E0E0E0;
}

.delete_icon {
  width: 14px;
  height: 14px;
  background: #C70000;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z'/%3E%3C/svg%3E") no-repeat center;
  mask-size: contain;
}

.review_card_text {
  font-family: 'Inter';
  font-size: 13px;
  line-height: 1.5;
  color: #333333;
  margin: 0;
  flex: 1;
  overflow-y: auto;
  max-height: 120px;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.review_counter {
  font-family: 'Inter';
  font-size: 12px;
  color: #999999;
  text-align: right;
}


/* MOU Tab Styles */
.mou_header .form_divider {
  margin: 6px 0 20px 0;
}

.mou_top_row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
}

.mou_upload {
  width: 60px;
  height: 60px;
  background: #F2F2F2;
  border: 1px solid #D0D0D0;
  border-radius: 10px;
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.mou_upload:hover {
  background: #E9E9E9;
  border-color: #AB1C03;
}

.mou_icon {
  width: 22px;
  height: 22px;
  background: #000;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M14,17H7V15H14M17,13H7V11H17M17,9H7V7H17M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19Z'/%3E%3C/svg%3E") no-repeat;
  mask-size: contain;
}

.mou_label {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 16px;
  line-height: 19px;
  color: #000000;
}

.mou_document_preview {
  margin: 20px 0;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mou_document_preview img {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  object-fit: contain;
}

.document_placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 30px;
  color: #666;
}

.doc_icon {
  width: 48px;
  height: 48px;
  background: #AB1C03;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M14,17H7V15H14M17,13H7V11H17M17,9H7V7H17M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19Z'/%3E%3C/svg%3E") no-repeat;
  mask-size: contain;
}

.document_placeholder span {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  word-break: break-word;
  max-width: 300px;
}

.mou_date_row {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
}

.date_group {
  flex: 1;
}

.date_group label {
  display: block;
  margin-bottom: 8px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #333333;
}

.date_input {
  width: 90%;
  height: 40px;
  padding: 8px 12px;
  background: #FFFFFF;
  border: 1px solid #D0D0D0;
  border-radius: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #333333;
  cursor: pointer;
}

.date_input:focus {
  outline: none;
  border-color: #AB1C03;
}

.mou_period_row {
  margin-bottom: 24px;
}

.period_group {
  position: relative;
  max-width: 200px;
}

.period_group.wide {
  max-width: 260px;
}

.period_group select {
  width: 100%;
  height: 40px;
  padding: 8px 40px 8px 12px;
  background: #FFFFFF;
  border: 1px solid #D0D0D0;
  border-radius: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #333333;
  appearance: none;
  cursor: pointer;
}

.calendar_icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  background: #666;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M19,3H18V1H16V3H8V1H6V3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19Z'/%3E%3C/svg%3E") no-repeat;
  mask-size: contain;
  pointer-events: none;
}

.publish_toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20px 0;
  padding: 10px 0;
}

.publish_toggle.mou_publish {
  margin: 10px 0 30px 0;
  padding: 8px 0;
  justify-content: flex-end;
  gap: 12px;
}

.publish_toggle label {
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 15px;
  line-height: 19px;
  color: #767676;
}

.publish_toggle.mou_publish label {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 16px;
  color: #333333;
}

.modal_actions.mou_actions {
  justify-content: flex-end;
  gap: 12px;
  margin-top: 10px;
}

/* Organization Type Row Box Design */
.org_type_row_box {
  position: relative;
  width: 100%;
  max-width: 771px;
  height: 54px;
  margin: 0 auto 18px auto;
  background: #fff;
  border: 1px solid #B1B1B1;
  border-radius: 8px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  box-sizing: border-box;
}

.org_type_col {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1 1 0;
  cursor: pointer;
  height: 44px;
  margin: 0 2px;
  transition: background 0.2s, color 0.2s;
  border-radius: 6px;
}

.org_type_col.active {
  background: #AB1C03;
  color: #fff;
}

.org_type_name {
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 15px;
  line-height: 17px;
  color: inherit;
  margin-bottom: 2px;
}

.org_type_count {
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  color: inherit;
}

.org_type_col:hover {
  background: #F5F5F5;
  color: #AB1C03;
}

.org_type_col.active .org_type_count {
  color: #fff;
}

/* Import Modal */
.import_modal {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15);
}

.import_instructions {
  margin: 20px 0;
  padding: 16px;
  background: #F9FAFB;
  border-radius: 8px;
}

.import-instructions p {
  margin: 0 0 12px 0;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #374151;
  font-weight: 600;
}

.import-instructions ul {
  margin: 0;
  padding-left: 20px;
}

.import-instructions li {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: #6B7280;
  margin: 6px 0;
  line-height: 1.5;
}

.import-instructions strong {
  color: #374151;
  font-weight: 600;
}

.file_upload_section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
}

.btn_choose_file {
  padding: 8px 16px;
  background: #3B82F6;
  border: none;
  border-radius: 6px;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #FFFFFF;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn_choose_file:hover {
  background: #2563EB;
}

.file_name {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #6B7280;
  font-style: italic;
}

.import_progress_panel {
  margin: 16px 0;
  padding: 16px;
  background: #EFF6FF;
  border: 1px solid #93C5FD;
  border-radius: 8px;
}

.import_progress_header,
.import_progress_stats {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: #1E3A8A;
}

.import_progress_track {
  width: 100%;
  height: 10px;
  margin: 12px 0 8px;
  overflow: hidden;
  background: #DBEAFE;
  border-radius: 5px;
}

.import_progress_fill {
  height: 100%;
  background: #2563EB;
  border-radius: 5px;
  transition: width 0.3s ease;
}

.import_progress_stage,
.import_progress_note {
  margin: 8px 0;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: #1E40AF;
}

.import_results {
  margin: 16px 0;
  padding: 16px;
  background: #F0FDF4;
  border: 1px solid #86EFAC;
  border-radius: 8px;
}

.results_summary {
  margin: 0 0 12px 0;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #166534;
}

.failed_items {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #86EFAC;
}

.failed-items p {
  margin: 0 0 8px 0;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: #DC2626;
  font-weight: 600;
}

.failed-items ul {
  margin: 0;
  padding-left: 20px;
}

.failed-items li {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: #991B1B;
  margin: 4px 0;
}

.top_bar {
  position: relative;
  height: 50px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}
.top_bar_titles { display: none; }
.top_bar_actions {
  position: absolute;
  top: 11px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 18px;
  transform: none;
}
.language_switcher { display: flex; gap: 3px; height: 26px; }
.language_switcher button { display: grid; place-items: center; width: 33px; height: 26px; box-sizing: border-box; border-radius: 2px; font: 600 12px/15px Inter, sans-serif; cursor: pointer; }
.language_active { background: #8b0000; border: 1px solid #8b0000; color: #ffffff; }
.language_option { background: #ffffff; border: 1px solid #a1a1a1; color: #1f2937; }
.language_switcher button.selected { background: #8b0000; border: 1px solid #8b0000; color: #ffffff; }
.language_switcher button:not(.selected) { background: #ffffff; border: 1px solid #a1a1a1; color: #1f2937; }
.admin_badge { display: flex; align-items: center; gap: 8px; width: 120px; height: 36px; padding: 6px 10px; box-sizing: border-box; border-radius: 20px; background: #f3f4f6; font: 600 12px/15px Inter, sans-serif; }
.admin_avatar { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 50%; background: #8b0000; color: #ffffff; }

.content_area { width: min(1110px, calc(100% - 48px)); max-width: 1110px; margin: 0 auto; padding-top: 24px; box-sizing: border-box; }
.page_heading { display: flex; align-items: flex-start; justify-content: space-between; min-height: 50px; }
.page_heading h1 { margin: 0; font: 700 18px/22px Inter, sans-serif; color: #1f2937; }
.page_heading p { margin: 1px 0 0; font: 400 10px/12px Inter, sans-serif; color: #73737a; }
.page_actions { display: flex; gap: 14px; padding-top: 11px; transform: none; flex: 0 0 auto; }
.page_actions button { height: 36px; box-sizing: border-box; border-radius: 8px; font: 600 13px/16px Inter, sans-serif; cursor: pointer; }
.page_actions .import_btn { display: flex; align-items: center; gap: 6px; width: 120px; padding: 10px 13px; background: #ffffff; border: 0.9px solid #a8a8ac; color: #000000; }
.page_actions .add_org_btn { display: flex; align-items: center; gap: 5px; width: 154px; padding: 10px 16px; background: #8b0000; border: 0; color: #ffffff; }
.page_actions .upload_icon { width: 12px; height: 12px; background: #000000; }
.page_actions .plus_icon { width: 12px; height: 12px; }

.filter_section { width: 100%; height: auto; min-height: 146px; box-sizing: border-box; margin: 0 0 22px; padding: 12px 20px 11px; background: #ffffff; border-radius: 0; box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25); overflow: visible; }
.dropdown_options {
  z-index: 2000;
  max-height: 250px;
  overflow-y: auto;
  overflow-x: hidden;
}
.search_input { width: 100%; height: 30px; box-sizing: border-box; padding: 9px 12px; border: 0.4px solid #a8a8ac; border-radius: 8px; font: 400 10px/12px Inter, sans-serif; color: #1f2937; }
.filter_labels { display: none; }
.dropdowns_grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  column-gap: 8px;
  row-gap: 12px;
  margin: 14px 0 0;
}
.filter_field {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.filter_field {
  position: relative;
}
.filter_field.active {
  z-index: 1000;
}
.filter_field.province {
  grid-column: 1;
  grid-row: 2;
  width: 100%;
}
.filter_label {
  min-width: 0;
  font: 500 10px/12px Inter, sans-serif;
  color: #000000;
}
.dropdown_container { margin: 0; min-width: 0; width: 100%; }
.dropdown_header { height: 28px; box-sizing: border-box; padding: 7px; border: 0.4px solid #a8a8ac; border-radius: 8px; }
.dropdown_text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font: 400 10px/12px Inter, sans-serif; color: #73737a; }
.dropdown_arrow { width: 8px; height: 6px; background: #000000; }
.filter_buttons { display: flex; justify-content: flex-end; gap: 8px; margin-top: 13px; }
.reset_btn, .search_btn { height: 20px; padding: 4px 12px; border-radius: 20px; font: 400 10px/12px Inter, sans-serif; cursor: pointer; }
.reset_btn { background: #ffffff; border: 1px solid #b1b1b1; color: #000000; }
.search_btn { background: #ab1c03; border: 0; color: #ffffff; }

.table_container { width: 100%; max-width: none; min-height: 208px; margin: 0 auto; box-sizing: border-box; overflow: hidden; background: #ffffff; border: 1px solid #d1d1d2; border-radius: 12px; }
.table_header, .table_row { display: grid; grid-template-columns: minmax(0, 2.35fr) minmax(82px, 1fr) minmax(100px, 1.2fr) minmax(100px, 1.2fr) minmax(82px, 1fr) minmax(82px, 1fr) minmax(76px, .9fr) minmax(132px, 1.4fr); align-items: center; }
.table_header { height: 36px; padding: 0 16px; box-sizing: border-box; background: #8b0000; color: #ffffff; font: 600 10px/12px Inter, sans-serif; }
.table_row { min-height: 52px; padding: 0 16px; box-sizing: border-box; border-top: 1px solid #e6e6e8; color: #1f2937; font: 400 13px/16px Outfit, sans-serif; }
.table_header > span + span,
.table_row > div + div {
  border-left: 1px solid #BCBCBE;
  padding-left: 12px;
  align-self: stretch;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}
.table_header > span + span { border-left-color: rgba(255, 255, 255, 0.45); }
.table_row > div {
  position: relative !important;
  align-self: stretch;

  width: auto !important;
  height: auto !important;
  min-width: 0 !important;
  max-width: 100% !important;
  margin: 0;

  padding-top: 0;
  padding-bottom: 0;

  display: flex;
  align-items: center;

  transform: none;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;

  font-family: Outfit, sans-serif !important;
  font-size: inherit !important;
  font-weight: inherit !important;
  line-height: inherit !important;
  box-sizing: border-box;
}
.table_row .org_name { position: static !important; min-width: 0 !important; max-width: 100% !important; font-size: 13px; line-height: 16px; }
.table_row .action_buttons { display: flex; position: static !important; gap: 5px; align-items: center; }
.table_header::after,
.table_row::after { display: none; }
.org_name { font-weight: 600; cursor: pointer; }
.org_name:hover { color: #8b0000; }
.status_pill { display: inline-flex; padding: 3px 8px; border-radius: 10px; font: 600 10px/12px Inter, sans-serif; color: #ffffff; }
.status_pill.active { background: #22c55e; }
.status_pill.inactive { background: #ef4444; }
.action_buttons { display: flex; gap: 7px; align-items: center; }
.text_action { padding: 0; border: 0; background: transparent; color: #73737a; font: 400 11px/13px Inter, sans-serif; cursor: pointer; }
.text_action:hover { color: #8b0000; text-decoration: underline; }
.text_action.danger:hover { color: #dc2626; }
.empty_state { padding: 45px 20px; text-align: center; color: #73737a; font: 400 13px/16px Inter, sans-serif; }
.content_area :deep(.pagination_wrapper) { display: flex; justify-content: flex-end; width: 100%; margin-top: 14px; padding-right: 4px; transform: none; }

@media (max-width: 1100px) {
  .content_area { width: calc(100% - 32px); }
  .table_container { overflow-x: hidden; }
  .table_header, .table_row { min-width: 0; }
}

/* Responsive Figma layout: preserve the desktop proportions without a fixed canvas. */
.admin_organization {
  width: 100%;
  min-width: 0;
  min-height: 100dvh;
  height: 100dvh;
  overflow: hidden;
}

.main_content {
  width: calc(100% - 66px);
  min-width: 0;
  height: 100dvh;
  min-height: 0;
  margin-left: 66px;
  overflow-x: hidden;
  overflow-y: auto;
}

.content_area {
  width: min(1110px, calc(100% - 48px));
  max-width: 1110px;
  padding-top: 24px;
}

.page_heading {
  gap: 24px;
}

.page_heading > div:first-child {
  min-width: 0;
}

.page_heading h1,
.page_heading p {
  overflow: hidden;
  text-overflow: ellipsis;
}

.page_actions {
  flex: 0 0 auto;
  transform: none;
}

.filter_section {
  width: 100%;
  height: auto;
  min-height: 146px;
}

.filter_labels,
.dropdowns_grid {
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}

.table_container {
  width: 100%;
  max-width: none;
  min-height: 208px;
  overflow-x: hidden;
}

.table_header,
.table_row {
  grid-template-columns: minmax(0, 2.35fr) minmax(82px, 1fr) minmax(100px, 1.2fr) minmax(100px, 1.2fr) minmax(82px, 1fr) minmax(82px, 1fr) minmax(76px, .9fr) minmax(132px, 1.4fr);
}

.content_area :deep(.pagination_wrapper) {
  transform: none;
}

@media (max-width: 1250px) {
  .content_area {
    width: calc(100% - 32px);
  }

  .filter_labels,
  .dropdowns_grid {
    gap: 6px;
  }

  .table_header,
  .table_row {
    grid-template-columns: minmax(0, 2fr) minmax(76px, .9fr) minmax(90px, 1.1fr) minmax(76px, .9fr) minmax(76px, .9fr) minmax(70px, .8fr) minmax(116px, 1.2fr);
  }

  .text_action {
    font-size: 10px;
  }
}

@media (max-width: 900px) {
  .content_area {
    width: calc(100% - 24px);
  }

  .page_heading {
    align-items: stretch;
    flex-direction: column;
  }

  .page_actions {
    padding-top: 0;
    justify-content: flex-end;
  }

  .filter_labels,
  .dropdowns_grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .filter_section {
    padding: 12px;
  }
}

@media (max-width: 640px) {
  .main_content {
    width: calc(100% - 66px);
  }

  .content_area {
    width: calc(100% - 16px);
  }

  .top_bar_actions { right: 10px; }

  .page_actions {
    justify-content: stretch;
  }

  .page_actions button {
    flex: 1 1 0;
    min-width: 0;
  }

  .filter_labels,
  .dropdowns_grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .table_header,
  .table_row {
    grid-template-columns: minmax(0, 1.7fr) minmax(62px, .8fr) minmax(76px, .95fr) minmax(68px, .8fr) minmax(64px, .75fr) minmax(64px, .75fr) minmax(102px, 1fr);
    padding-inline: 8px;
  }

  .table_row .action_buttons {
    gap: 3px;
  }
}

/* Viewport-safe modal sizing for laptop and desktop screens. */
.modal_overlay,
.delete_modal_overlay {
  width: 100%;
  height: 100dvh;
  padding: 16px;
  box-sizing: border-box;
  overflow-y: auto;
}

.add_org_modal {
  width: min(657px, calc(100vw - 32px));
  max-width: 100%;
  max-height: calc(100dvh - 32px);
  min-height: 0;
  height: auto;
  overflow-y: auto;
}

.add_org_modal.organization_active {
  height: min(657px, calc(100dvh - 32px));
  min-height: 0;
  max-height: calc(100dvh - 32px);
}

.modal_tabs {
  left: 100%;
  margin-left: 8px;
}

.delete_modal_container {
  width: min(450px, 100%);
  max-height: calc(100dvh - 32px);
  overflow-y: auto;
}

@media (max-width: 1250px) and (min-width: 901px) {
  .content_area { width: calc(100% - 32px); }
  .filter_labels,
  .dropdowns_grid { gap: 6px; }
  .table_header,
  .table_row {
    grid-template-columns: minmax(0, 2fr) minmax(64px, .9fr) minmax(82px, 1fr) minmax(60px, .75fr) minmax(76px, .9fr) minmax(70px, .8fr) minmax(70px, .8fr) minmax(116px, 1.2fr);
  }
}

.filter_field,
.dropdown_container {
  min-width: 0;
}

.filter_buttons {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  column-gap: 8px;
  margin-top: 13px;
}

@media (max-width: 900px) {
  .dropdowns_grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 8px;
    row-gap: 12px;
  }
  .filter_field.province {
    grid-column: auto;
    grid-row: auto;
  }
}

@media (max-width: 640px) {
  .dropdowns_grid {
    grid-template-columns: minmax(0, 1fr);
    row-gap: 12px;
  }
  .filter_field,
  .filter_field.province {
    grid-column: 1;
    grid-row: auto;
  }
  .filter_buttons {
    width: 100%;
  }
}

</style>
