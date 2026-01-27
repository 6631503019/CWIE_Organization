<template>
  <div class="user-organization">
    <UserNavbar />
    
    <!-- Main Content Area -->
    <div class="main-content">
      <!-- Page Title -->
      <h1 class="page-title">Organization</h1>
      
      <!-- Filter Section -->
      <div class="filter-section">
        <div class="filter-title">Filter Organization</div>
        
        <!-- Text Search -->
        <div class="search-input-wrapper">
          <input 
            type="text" 
            class="search-input" 
            placeholder="Text Search (Name, Tags)"
            v-model="searchText"
          />
        </div>
        
        <!-- Organization Type Dropdown -->
        <div class="filter-dropdown org-type-dropdown">
          <div class="dropdown-toggle" @click="toggleDropdown('orgType')">
            <span class="dropdown-label">{{ selectedOrgType || '--Organization Type--' }}</span>
            <div class="dropdown-arrow"></div>
          </div>
          <div v-if="showDropdowns.orgType" class="dropdown-menu">
            <div class="dropdown-item" @click="selectOrgType('MFU')">MFU</div>
            <div class="dropdown-item" @click="selectOrgType('private company')">private company</div>
            <div class="dropdown-item" @click="selectOrgType('Government')">Government</div>
            <div class="dropdown-item" @click="selectOrgType('Oversea')">Oversea</div>
          </div>
        </div>
        
        <!-- Industry Category Dropdown -->
        <div class="filter-dropdown industry-dropdown">
          <div class="dropdown-toggle" @click="toggleDropdown('industry')">
            <span class="dropdown-label">{{ selectedIndustry || '--Industry Category--' }}</span>
            <div class="dropdown-arrow"></div>
          </div>
          <div v-if="showDropdowns.industry" class="dropdown-menu">
            <div class="dropdown-item" v-for="cat in industryCategories" :key="cat" @click="selectIndustry(cat)">
              {{ cat }}
            </div>
          </div>
        </div>
        
        <!-- Country Dropdown -->
        <div class="filter-dropdown country-dropdown">
          <div class="dropdown-toggle" @click="toggleDropdown('country')">
            <span class="dropdown-label">{{ selectedCountry || '---Country---' }}</span>
            <div class="dropdown-arrow"></div>
          </div>
          <div v-if="showDropdowns.country" class="dropdown-menu">
            <div class="dropdown-item" v-for="country in countries" :key="country" @click="selectCountry(country)">
              {{ country }}
            </div>
          </div>
        </div>
        
        <!-- Geography Dropdown -->
        <div class="filter-dropdown geography-dropdown">
          <div class="dropdown-toggle" @click="toggleDropdown('geography')">
            <span class="dropdown-label">{{ selectedGeography || '--Geography--' }}</span>
            <div class="dropdown-arrow"></div>
          </div>
          <div v-if="showDropdowns.geography" class="dropdown-menu">
            <div class="dropdown-item" v-for="geo in geographies" :key="geo" @click="selectGeography(geo)">
              {{ geo }}
            </div>
          </div>
        </div>
        
        <!-- Province Dropdown -->
        <div class="filter-dropdown province-dropdown">
          <div class="dropdown-toggle" @click="toggleDropdown('province')">
            <span class="dropdown-label">{{ selectedProvince || '--Province--' }}</span>
            <div class="dropdown-arrow"></div>
          </div>
          <div v-if="showDropdowns.province" class="dropdown-menu">
            <div class="dropdown-item" v-for="province in provinces" :key="province" @click="selectProvince(province)">
              {{ province }}
            </div>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="filter-actions">
          <button class="reset-btn" @click="resetFilters">Reset</button>
          <button class="search-btn" @click="applyFilters">search</button>
        </div>
      </div>
      
      <!-- Organization Cards Grid -->
      <div class="org-cards-grid">
        <div 
          v-for="org in paginatedOrganizations" 
          :key="org._id" 
          class="org-card"
          @click="viewOrgDetails(org)"
        >
          <!-- Organization Name -->
          <div class="org-card-name">{{ org.name_en || org.name_th || 'N/A' }}</div>
          
          <!-- Organization Address -->
          <div class="org-card-address">{{ getShortAddress(org) }}</div>
          
          <!-- Business Type and Location Container -->
          <div class="tags-row">
            <!-- Business Type Tags -->
            <div class="tags-column">
              <div class="section-label">Business Type</div>
              <div class="tags-container business-tags">
                <div class="tag" v-for="(type, index) in getBusinessTypes(org)" :key="index">{{ type }}</div>
              </div>
            </div>
            
            <!-- Location Tags -->
            <div class="tags-column">
              <div class="section-label location-section">Location</div>
              <div class="tags-container location-tags">
                <div class="tag">{{ getCountry(org) }}</div>
                <div class="tag">{{ getGeography(org) }}</div>
                <div class="tag">{{ getProvince(org) }}</div>
              </div>
            </div>
          </div>
          
          <!-- Contact Row -->
          <div class="contact-row">
            <!-- Email -->
            <div class="contact-item email-contact">
              <div class="icon email-icon"></div>
              <span class="contact-text">{{ org.email || 'N/A' }}</span>
            </div>
            
            <!-- Phone -->
            <div class="contact-item phone-contact">
              <div class="icon phone-icon"></div>
              <span class="contact-text">{{ org.phone_number || 'N/A' }}</span>
            </div>
          </div>
          
          <!-- Rating and Reviews -->
          <div class="rating-section">
            <div class="stars">
              <span v-for="star in 5" :key="star" class="star" :class="{ filled: star <= getAverageRating(org) }">
                ★
              </span>
            </div>
            <span class="review-count">({{ getReviewCount(org) }} reviews)</span>
          </div>
          
          <!-- Divider Line -->
          <div class="card-divider"></div>
        </div>
      </div>
      
      <!-- Pagination -->
      <div class="pagination-container">
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
const provinces = ref(['Chiang Rai', 'Chiang Mai', 'Lamphun', 'Phayao', 'Lampang',
  'Phrae', 'Nan', 'Uttaradit', 'Mae Hong Son', 'Sukhothai', 'Tak',
  'Phitsanulok', 'Kamphaeng Phet', 'Phetchabun', 'Phichit'])

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
  // Close all other dropdowns
  Object.keys(showDropdowns).forEach(key => {
    if (key !== dropdown) {
      showDropdowns[key as keyof typeof showDropdowns] = false
    }
  })
  showDropdowns[dropdown as keyof typeof showDropdowns] = !showDropdowns[dropdown as keyof typeof showDropdowns]
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

const getAverageRating = (org: any) => {
  const orgReviews = reviews.value.filter(r => 
    String(r.organization_id?._id || r.organization_id) === String(org._id)
  )
  if (orgReviews.length === 0) return 5
  
  const total = orgReviews.reduce((sum, r) => sum + (r.rating || 0), 0)
  return Math.round(total / orgReviews.length)
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
    console.error('Error loading organizations:', error)
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
    console.error('Error loading reviews:', error)
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

.user-organization {
  position: relative;
  width: 100vw;
  min-height: 100vh;
  background: #F6F7F8;
}

.main-content {
  margin-left: 232px;
  padding: 40px 20px 20px 20px;
  min-height: 100vh;
}

.page-title {
  margin: 0 0 30px 0;
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  font-size: 40px;
  line-height: 50px;
  color: #000000;
}

/* Filter Section */
.filter-section {
  position: relative;
  width: 1154px;
  height: 265px;
  background: #FFFFFF;
  box-shadow: 0px 4px 4px rgba(118, 118, 118, 0.5);
  border-radius: 8px;
  margin-bottom: 40px;
  padding: 15px 30px;
}

.filter-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  font-size: 20px;
  line-height: 25px;
  color: #000000;
  margin-bottom: 20px;
}

.search-input-wrapper {
  position: absolute;
  left: 30px;
  top: 59px;
  width: 1045px;
}

.search-input {
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

.search-input::placeholder {
  color: #B1B1B1;
}

.filter-dropdown {
  position: absolute;
}

.org-type-dropdown {
  left: 29px;
  top: 110px;
  width: 491px;
}

.industry-dropdown {
  left: 536px;
  top: 110px;
  width: 539px;
}

.country-dropdown {
  left: 29px;
  top: 157px;
  width: 368px;
}

.geography-dropdown {
  left: 410px;
  top: 157px;
  width: 342px;
}

.province-dropdown {
  left: 763px;
  top: 157px;
  width: 312px;
}

.dropdown-toggle {
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

.dropdown-label {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  color: #545454;
}

.dropdown-arrow {
  width: 5.83px;
  height: 4.38px;
  background: #000000;
  clip-path: polygon(0 0, 100% 0, 50% 100%);
}

.dropdown-menu {
  position: absolute;
  top: 36px;
  left: 0;
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  background: #FFFFFF;
  border: 1px solid #B1B1B1;
  border-radius: 8px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.dropdown-item {
  padding: 10px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #000000;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
}

.dropdown-item:hover {
  background: #F5F5F5;
}

.filter-actions {
  position: absolute;
  right: 30px;
  bottom: 30px;
  display: flex;
  gap: 10px;
}

.reset-btn {
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

.search-btn {
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
.org-cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 575px);
  gap: 30px 261px;
  margin-bottom: 50px;
}

.org-card {
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

.org-card:hover {
  transform: translateY(-2px);
  box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.15);
}

.org-card-name {
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  font-size: 24px;
  line-height: 30px;
  color: #000000;
  margin-bottom: 8px;
}

.org-card-address {
  font-family: 'Outfit', sans-serif;
  font-weight: 400;
  font-size: 15px;
  line-height: 19px;
  color: rgba(0, 0, 0, 0.8);
  margin-bottom: 15px;
}

.tags-row {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  margin-bottom: 12px;
}

.tags-column {
  min-width: 0;
}

.tags-column:first-child {
  flex: 0 0 180px;
}

.tags-column:last-child {
  flex: 1;
}

.section-label {
  font-family: 'Outfit', sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 20px;
  color: #000000;
  margin-bottom: 8px;
}

.location-section {
  margin-top: 0;
}

.tags-container {
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

.contact-row {
  display: flex;
  gap: 30px;
  margin-top: 15px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.email-contact {
  flex: 0 0 auto;
}

.icon {
  width: 15px;
  height: 15px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.email-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23000000'%3E%3Cpath d='M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z'/%3E%3C/svg%3E");
}

.phone-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23000000'%3E%3Cpath d='M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z'/%3E%3C/svg%3E");
}

.contact-text {
  font-family: 'Outfit', sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 17px;
  color: #000000;
}

.card-divider {
  position: absolute;
  left: 22px;
  right: 22px;
  bottom: 61px;
  height: 0px;
  border: 1px solid #000000;
}

.rating-section {
  position: absolute;
  left: 48px;
  bottom: 14px;
  display: flex;
  align-items: center;
  gap: 26px;
}

.stars {
  display: flex;
  gap: 8px;
  align-items: center;
}

.star {
  font-size: 25px;
  line-height: 25px;
  color: #D0D0D0;
  width: 25.12px;
  height: 25px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.star.filled {
  color: #FFF200;
}

.review-count {
  font-family: 'Outfit', sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.8);
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-bottom: 50px;
}
</style>
