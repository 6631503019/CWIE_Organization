<template>
  <div class="user_organization">
    <UserNavbar />
    
    <!-- Main Content Area -->
    <div class="main_content">
      <!-- Page Title -->
      <h1 class="page_title">Organization</h1>
      
      <!-- Filter Section -->
      <div class="filter_section">
        <div class="filter_title">Filter Organization</div>
        
        <!-- Text Search -->
        <div class="search_input_wrapper">
          <input 
            type="text" 
            class="search_input" 
            placeholder="Text Search (Name, Tags)"
            v-model="searchText"
          />
        </div>
        
        <!-- Organization Type Dropdown -->
        <div class="filter_dropdown org_type_dropdown">
          <div class="dropdown_toggle" @click="toggleDropdown('orgType')">
            <span class="dropdown_label">{{ selectedOrgType || '--Organization Type--' }}</span>
            <div class="dropdown_arrow"></div>
          </div>
          <div v-if="showDropdowns.orgType" class="dropdown_menu">
            <div class="dropdown_item" @click="selectOrgType('MFU')">MFU</div>
            <div class="dropdown_item" @click="selectOrgType('private company')">private company</div>
            <div class="dropdown_item" @click="selectOrgType('Government')">Government</div>
            <div class="dropdown_item" @click="selectOrgType('Oversea')">Oversea</div>
          </div>
        </div>
        
        <!-- Industry Category Dropdown -->
        <div class="filter_dropdown industry_dropdown">
          <div class="dropdown_toggle" @click="toggleDropdown('industry')">
            <span class="dropdown_label">{{ selectedIndustry || '--Industry Category--' }}</span>
            <div class="dropdown_arrow"></div>
          </div>
          <div v-if="showDropdowns.industry" class="dropdown_menu">
            <div class="dropdown_search">
              <input 
                type="text" 
                v-model="dropdownSearch.industry" 
                placeholder="Search..."
                @click.stop
                class="dropdown_search_input"
              />
            </div>
            <div class="dropdown_item" v-for="cat in filteredIndustryCategories" :key="cat" @click="selectIndustry(cat)">
              {{ cat }}
            </div>
          </div>
        </div>
        
        <!-- Country Dropdown -->
        <div class="filter_dropdown country_dropdown">
          <div class="dropdown_toggle" @click="toggleDropdown('country')">
            <span class="dropdown_label">{{ selectedCountry || '---Country---' }}</span>
            <div class="dropdown_arrow"></div>
          </div>
          <div v-if="showDropdowns.country" class="dropdown_menu">
            <div class="dropdown_search">
              <input 
                type="text" 
                v-model="dropdownSearch.country" 
                placeholder="Search..."
                @click.stop
                class="dropdown_search_input"
              />
            </div>
            <div class="dropdown_item" v-for="country in filteredCountries" :key="country" @click="selectCountry(country)">
              {{ country }}
            </div>
          </div>
        </div>
        
        <!-- Geography Dropdown -->
        <div class="filter_dropdown geography_dropdown">
          <div class="dropdown_toggle" @click="toggleDropdown('geography')">
            <span class="dropdown_label">{{ selectedGeography || '--Geography--' }}</span>
            <div class="dropdown_arrow"></div>
          </div>
          <div v-if="showDropdowns.geography" class="dropdown_menu">
            <div class="dropdown_search">
              <input 
                type="text" 
                v-model="dropdownSearch.geography" 
                placeholder="Search..."
                @click.stop
                class="dropdown_search_input"
              />
            </div>
            <div class="dropdown_item" v-for="geo in filteredGeographies" :key="geo" @click="selectGeography(geo)">
              {{ geo }}
            </div>
          </div>
        </div>
        
        <!-- Province Dropdown -->
        <div class="filter_dropdown province_dropdown">
          <div class="dropdown_toggle" @click="toggleDropdown('province')">
            <span class="dropdown_label">{{ selectedProvince || '--Province--' }}</span>
            <div class="dropdown_arrow"></div>
          </div>
          <div v-if="showDropdowns.province" class="dropdown_menu">
            <div class="dropdown_search">
              <input 
                type="text" 
                v-model="dropdownSearch.province" 
                placeholder="Search..."
                @click.stop
                class="dropdown_search_input"
              />
            </div>
            <div class="dropdown_item" v-for="province in filteredProvinces" :key="province" @click="selectProvince(province)">
              {{ province }}
            </div>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="filter_actions">
          <button class="reset_btn" @click="resetFilters">Reset</button>
          <button class="search_btn" @click="applyFilters">search</button>
        </div>
      </div>
      
      <!-- Organization Cards Grid -->
      <div class="org_cards_grid">
        <div 
          v-for="org in paginatedOrganizations" 
          :key="org._id" 
          class="org_card"
          @click="viewOrgDetails(org)"
        >
          <!-- Organization Name -->
          <div class="org_card_name">{{ org.name_en || org.name_th || 'N/A' }}</div>
          
          <!-- Organization Address -->
          <div class="org_card_address">{{ getShortAddress(org) }}</div>
          
          <!-- Business Type and Location Container -->
          <div class="tags_row">
            <!-- Business Type Tags -->
            <div class="tags_column">
              <div class="section_label">Business Type</div>
              <div class="tags_container business_tags">
                <div class="tag" v-for="(type, index) in getBusinessTypes(org)" :key="index">{{ type }}</div>
              </div>
            </div>
            
            <!-- Location Tags -->
            <div class="tags_column">
              <div class="section_label location_section">Location</div>
              <div class="tags_container location_tags">
                <div class="tag">{{ getCountry(org) }}</div>
                <div class="tag">{{ getGeography(org) }}</div>
                <div class="tag">{{ getProvince(org) }}</div>
              </div>
            </div>
          </div>
          
          <!-- Contact Row -->
          <div class="contact_row">
            <!-- Email -->
            <div class="contact_item email_contact">
              <div class="icon email_icon"></div>
              <span class="contact_text">{{ org.email || 'N/A' }}</span>
            </div>
            
            <!-- Phone -->
            <div class="contact_item phone_contact">
              <div class="icon phone_icon"></div>
              <span class="contact_text">{{ org.phone_number || 'N/A' }}</span>
            </div>
          </div>
          
          <!-- Review Count -->
          <div class="review_count_section">
            <span class="review_count">({{ getReviewCount(org) }} reviews)</span>
          </div>
          
          <!-- Divider Line -->
          <div class="card_divider"></div>
        </div>
      </div>
      
      <!-- Pagination -->
      <div class="pagination_container">
        <Pagination 
          :current-page="currentPage"
          :total-pages="totalPages"
          :total-items="filteredOrganizations.length"
          :loading="loading"
          @page-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import UserNavbar from '../components/UserNavbar.vue'
import Pagination from '../components/Pagination.vue'
import { organizationAPI, reviewAPI } from '../services/api'

const router = useRouter()

// Reactive state
const loading = ref(false)
const searchText = ref('')
const selectedOrgType = ref('')
const selectedIndustry = ref('')
const selectedCountry = ref('')
const selectedGeography = ref('')
const selectedProvince = ref('')
const currentPage = ref(1)
const itemsPerPage = 4 // 2x2 grid

const showDropdowns = reactive({
  orgType: false,
  industry: false,
  country: false,
  geography: false,
  province: false
})

const dropdownSearch = ref({
  industry: '',
  country: '',
  geography: '',
  province: ''
})

// Data
const organizations = ref<any[]>([])
const reviews = ref<any[]>([])

// Filter options
const industryCategories = ref(['ALL', 'Agriculture, forestry and fishing', 
  'Mining and quarrying', 'Manufacturing', 'Electricity, gas, steam and air conditioning supply',
  'Water supply; sewerage, waste management and remediation activities', 'Construction',
  'Wholesale and retail trade; repair of motor vehicles and motorcycles',
  'Transportation and storage', 'Accommodation and food service activities',
  'Information and communication', 'Financial and insurance activities',
  'Real estate activities', 'Professional, scientific and technical activities',
  'Administrative and support service activities', 'Public administration and defence; compulsory social security',
  'Education', 'Human health and social work activities'])

const countries = ref(['Thailand', 'Laos', 'Vietnam', 'China', 'Myanmar'])
const geographies = ref(['Northern Thailand', 'Northeastern Thailand', 'Central Thailand', 
  'Eastern Thailand', 'Western Thailand', 'Southern Thailand'])
const provinces = ref([
  'Amnat Charoen', 'Ang Thong', 'Bangkok', 'Bueng Kan', 'Buri Ram', 
  'Chachoengsao', 'Chai Nat', 'Chaiyaphum', 'Chanthaburi', 'Chiang Mai', 
  'Chiang Rai', 'Chon Buri', 'Chumphon', 'Kalasin', 'Kamphaeng Phet', 
  'Kanchanaburi', 'Khon Kaen', 'Krabi', 'Lampang', 'Lamphun', 
  'Loei', 'Lop Buri', 'Mae Hong Son', 'Maha Sarakham', 'Mukdahan', 
  'Nakhon Nayok', 'Nakhon Pathom', 'Nakhon Phanom', 'Nakhon Ratchasima', 'Nakhon Sawan', 
  'Nakhon Si Thammarat', 'Nan', 'Narathiwat', 'Nong Bua Lam Phu', 'Nong Khai', 
  'Nonthaburi', 'Pathum Thani', 'Pattani', 'Phang Nga', 'Phatthalung', 
  'Phayao', 'Phetchabun', 'Phetchaburi', 'Phichit', 'Phitsanulok', 
  'Phra Nakhon Si Ayutthaya', 'Phrae', 'Phuket', 'Prachin Buri', 'Prachuap Khiri Khan', 
  'Ranong', 'Ratchaburi', 'Rayong', 'Roi Et', 'Sa Kaeo', 
  'Sakon Nakhon', 'Samut Prakan', 'Samut Sakhon', 'Samut Songkhram', 'Saraburi', 
  'Satun', 'Sing Buri', 'Si Sa Ket', 'Songkhla', 'Sukhothai', 
  'Suphan Buri', 'Surat Thani', 'Surin', 'Tak', 'Trang', 
  'Trat', 'Ubon Ratchathani', 'Udon Thani', 'Uthai Thani', 'Uttaradit', 
  'Yala', 'Yasothon'
])

// Filtered options based on search
const filteredIndustryCategories = computed(() => {
  if (!dropdownSearch.value.industry) return industryCategories.value
  return industryCategories.value.filter(option => 
    option.toLowerCase().includes(dropdownSearch.value.industry.toLowerCase())
  )
})

const filteredCountries = computed(() => {
  if (!dropdownSearch.value.country) return countries.value
  return countries.value.filter(option => 
    option.toLowerCase().includes(dropdownSearch.value.country.toLowerCase())
  )
})

const filteredGeographies = computed(() => {
  if (!dropdownSearch.value.geography) return geographies.value
  return geographies.value.filter(option => 
    option.toLowerCase().includes(dropdownSearch.value.geography.toLowerCase())
  )
})

const filteredProvinces = computed(() => {
  if (!dropdownSearch.value.province) return provinces.value
  return provinces.value.filter(option => 
    option.toLowerCase().includes(dropdownSearch.value.province.toLowerCase())
  )
})

// Computed properties
const filteredOrganizations = computed(() => {
  let filtered = organizations.value

  if (searchText.value.trim()) {
    const search = searchText.value.toLowerCase()
    filtered = filtered.filter(org => 
      (org.name_en && org.name_en.toLowerCase().includes(search)) ||
      (org.name_th && org.name_th.toLowerCase().includes(search)) ||
      (org.email && org.email.toLowerCase().includes(search))
    )
  }

  if (selectedOrgType.value) {
    filtered = filtered.filter(org => org.organization_type === selectedOrgType.value)
  }

  if (selectedIndustry.value && selectedIndustry.value !== 'ALL') {
    filtered = filtered.filter(org => org.industry_category_id === selectedIndustry.value)
  }

  if (selectedCountry.value) {
    filtered = filtered.filter(org => getCountry(org) === selectedCountry.value)
  }

  if (selectedGeography.value) {
    filtered = filtered.filter(org => getGeography(org) === selectedGeography.value)
  }

  if (selectedProvince.value) {
    filtered = filtered.filter(org => getProvince(org) === selectedProvince.value)
  }

  return filtered
})

const paginatedOrganizations = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredOrganizations.value.slice(start, end)
})

const totalPages = computed(() => 
  Math.ceil(filteredOrganizations.value.length / itemsPerPage)
)

// Methods
const toggleDropdown = (dropdown: string) => {
  const isOpening = !showDropdowns[dropdown as keyof typeof showDropdowns]
  
  // Close all other dropdowns and clear their search
  Object.keys(showDropdowns).forEach(key => {
    if (key !== dropdown) {
      showDropdowns[key as keyof typeof showDropdowns] = false
      if (key in dropdownSearch.value) {
        dropdownSearch.value[key as keyof typeof dropdownSearch.value] = ''
      }
    }
  })
  
  showDropdowns[dropdown as keyof typeof showDropdowns] = isOpening
  
  // Clear search if closing
  if (!isOpening && dropdown in dropdownSearch.value) {
    dropdownSearch.value[dropdown as keyof typeof dropdownSearch.value] = ''
  }
}

const selectOrgType = (type: string) => {
  selectedOrgType.value = type
  showDropdowns.orgType = false
}

const selectIndustry = (industry: string) => {
  selectedIndustry.value = industry
  showDropdowns.industry = false
}

const selectCountry = (country: string) => {
  selectedCountry.value = country
  showDropdowns.country = false
}

const selectGeography = (geo: string) => {
  selectedGeography.value = geo
  showDropdowns.geography = false
}

const selectProvince = (province: string) => {
  selectedProvince.value = province
  showDropdowns.province = false
}

const resetFilters = () => {
  searchText.value = ''
  selectedOrgType.value = ''
  selectedIndustry.value = ''
  selectedCountry.value = ''
  selectedGeography.value = ''
  selectedProvince.value = ''
  currentPage.value = 1
}

const applyFilters = () => {
  currentPage.value = 1
  // Filters are applied automatically via computed property
}

const handlePageChange = (page: number) => {
  currentPage.value = page
}

const viewOrgDetails = (org: any) => {
  router.push(`/user/organization/${org._id}`)
}

// Helper methods
const getShortAddress = (org: any) => {
  if (!org) return 'No address available'
  const parts = []
  if (org.address_en) parts.push(org.address_en)
  else if (org.address_th) parts.push(org.address_th)
  return parts.join(', ') || 'No address available'
}

const getBusinessTypes = (org: any) => {
  if (!org.organization_type) return ['Individual']
  return [org.organization_type]
}

const getCountry = (org: any) => {
  return org.country_id?.name || org.country_id || 'Thailand'
}

const getGeography = (org: any) => {
  return org.geography_id?.name || org.geography_id || 'Central'
}

const getProvince = (org: any) => {
  return org.province_id?.name || org.province_id || 'Bangkok'
}

const getReviewCount = (org: any) => {
  return reviews.value.filter(r => 
    String(r.organization_id?._id || r.organization_id) === String(org._id)
  ).length
}

// Fetch data
const fetchOrganizations = async () => {
  try {
    loading.value = true
    // Only fetch public organizations
    const response = await organizationAPI.getAll({ limit: 100, public: 'true' })
    organizations.value = response.data.data
    console.log('Public organizations loaded:', organizations.value.length)
  } catch (error: any) {
    console.debug('Organizations loading failed:', error?.response?.status)
  } finally {
    loading.value = false
  }
}

const fetchReviews = async () => {
  try {
    const response = await reviewAPI.getAll({ limit: 1000 })
    reviews.value = response.data.data || []
    console.log('Reviews loaded:', reviews.value.length)
  } catch (error: any) {
    // Reviews are optional - silently fail if not available
    console.debug('Reviews not available:', error?.response?.status)
    reviews.value = []
  }
}

// Lifecycle hooks
onMounted(async () => {
  await fetchOrganizations()
  await fetchReviews()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');

.user_organization {
  position: relative;
  width: 100vw;
  min-height: 100vh;
  background: #F6F7F8;
}

.main_content {
  margin-left: 232px;
  padding: 40px 20px 20px 20px;
  min-height: 100vh;
}

.page_title {
  margin: 0 0 30px 0;
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  font-size: 40px;
  line-height: 50px;
  color: #000000;
}

/* Filter Section */
.filter_section {
  position: relative;
  width: 1154px;
  height: 265px;
  background: #FFFFFF;
  box-shadow: 0px 4px 4px rgba(118, 118, 118, 0.5);
  border-radius: 8px;
  margin-bottom: 40px;
  padding: 15px 30px;
}

.filter_title {
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  font-size: 20px;
  line-height: 25px;
  color: #000000;
  margin-bottom: 20px;
}

.search_input_wrapper {
  position: absolute;
  left: 30px;
  top: 59px;
  width: 1045px;
}

.search_input {
  box-sizing: border-box;
  width: 100%;
  height: 31px;
  background: #FFFFFF;
  border: 1px solid #B1B1B1;
  border-radius: 8px;
  padding: 7px 14px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #000000;
}

.search_input::placeholder {
  color: #B1B1B1;
}

.filter_dropdown {
  position: absolute;
}

.org_type_dropdown {
  left: 29px;
  top: 110px;
  width: 491px;
}

.industry_dropdown {
  left: 536px;
  top: 110px;
  width: 539px;
}

.country_dropdown {
  left: 29px;
  top: 157px;
  width: 368px;
}

.geography_dropdown {
  left: 410px;
  top: 157px;
  width: 342px;
}

.province_dropdown {
  left: 763px;
  top: 157px;
  width: 312px;
}

.dropdown_toggle {
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7px 12px;
  background: #FFFFFF;
  border: 1px solid #B1B1B1;
  border-radius: 8px;
  height: 32px;
  cursor: pointer;
}

.dropdown_label {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  color: #545454;
}

.dropdown_arrow {
  width: 5.83px;
  height: 4.38px;
  background: #000000;
  clip-path: polygon(0 0, 100% 0, 50% 100%);
}

.dropdown_menu {
  position: absolute;
  top: 36px;
  left: 0;
  right: 0;
  max-height: 250px;
  overflow-y: auto;
  background: #FFFFFF;
  border: 1px solid #B1B1B1;
  border-radius: 8px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.dropdown_search {
  position: sticky;
  top: 0;
  background: #FFFFFF;
  padding: 8px;
  border-bottom: 1px solid #E0E0E0;
  z-index: 11;
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

.dropdown_item {
  padding: 10px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #000000;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
}

.dropdown_item:hover {
  background: #F5F5F5;
}

.filter_actions {
  position: absolute;
  right: 30px;
  bottom: 30px;
  display: flex;
  gap: 10px;
}

.reset_btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px 16px;
  background: #FFFFFF;
  border: 1px solid #B1B1B1;
  border-radius: 20px;
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 14px;
  color: #000000;
  cursor: pointer;
}

.search_btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px 16px;
  background: #AB1C03;
  border: none;
  border-radius: 20px;
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 14px;
  color: #FFFFFF;
  cursor: pointer;
}

/* Organization Cards Grid */
.org_cards_grid {
  display: grid;
  grid-template-columns: repeat(2, 575px);
  gap: 30px 60px;
  margin-bottom: 50px;
}

.org_card {
  box-sizing: border-box;
  position: relative;
  width: 575px;
  min-height: 256px;
  background: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 15px;
  padding: 19px 25px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.org_card:hover {
  transform: translateY(-2px);
  box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.15);
}

.org_card_name {
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  font-size: 24px;
  line-height: 30px;
  color: #000000;
  margin-bottom: 8px;
}

.org_card_address {
  font-family: 'Outfit', sans-serif;
  font-weight: 400;
  font-size: 15px;
  line-height: 19px;
  color: rgba(0, 0, 0, 0.8);
  margin-bottom: 15px;
}

.tags_row {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  margin-bottom: 12px;
}

.tags_column {
  min-width: 0;
}

.tags_column:first-child {
  flex: 0 0 180px;
}

.tags_column:last-child {
  flex: 1;
}

.section_label {
  font-family: 'Outfit', sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 20px;
  color: #000000;
  margin-bottom: 8px;
}

.location_section {
  margin-top: 0;
}

.tags_container {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.tag {
  box-sizing: border-box;
  padding: 1px 8px;
  height: 20px;
  background: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 6px;
  font-family: 'Outfit', sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 18px;
  color: #000000;
  display: flex;
  align-items: center;
}

.contact_row {
  display: flex;
  gap: 30px;
  margin-top: 15px;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #000000;
}

.contact_item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.email_contact {
  flex: 0 0 auto;
}

.icon {
  width: 15px;
  height: 15px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.email_icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23000000'%3E%3Cpath d='M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z'/%3E%3C/svg%3E");
}

.phone_icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23000000'%3E%3Cpath d='M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z'/%3E%3C/svg%3E");
}

.contact_text {
  font-family: 'Outfit', sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 17px;
  color: #000000;
}

.card_divider {
  display: none;
}

.review_count_section {
  position: relative;
  left: auto;
  bottom: auto;
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.review_count {
  font-family: 'Outfit', sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.8);
}

/* Pagination */
.pagination_container {
  display: flex;
  justify-content: center;
  margin-bottom: 50px;
}
</style>


