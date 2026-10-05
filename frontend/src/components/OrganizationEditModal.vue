<template>
  <div v-if="modelValue" class="modal_overlay" @mousedown.self="handleOverlayMouseDown" @mouseup.self="handleOverlayMouseUp">
    <div class="add_org_modal" :class="`${activeTab}_active`">
      <!-- Right side tabs -->
      <div class="modal_tabs">
        <div 
          class="tab_item"
          :class="{ active: activeTab === 'organization' }"
          @click="activeTab = 'organization'"
        >
          <span>Organization</span>
        </div>
        <div 
          class="tab_item"
          :class="{ active: activeTab === 'review' }"
          @click="activeTab = 'review'"
        >
          <span>Review</span>
        </div>
        <div 
          class="tab_item"
          :class="{ active: activeTab === 'mou' }"
          @click="activeTab = 'mou'"
        >
          <span>MOU</span>
        </div>
      </div>

      <!-- Modal Content -->
      <div class="modal_content">
        <!-- Organization Tab -->
        <div v-if="activeTab === 'organization'" class="organization_tab">
          <h2 class="modal_title">{{ organizationId ? 'Edit' : 'Add' }} Organization</h2>
          <div class="form_divider"></div>
          
          <!-- Logo Upload -->
          <div class="logo_upload_section">
            <!-- Logo Preview -->
            <div class="logo_preview_circle">
              <img v-if="logoPreview" :src="logoPreview" alt="Logo Preview" class="preview_image" />
              <div v-else class="placeholder_icon"></div>
            </div>
            
            <!-- Upload Button -->
            <label class="upload_logo_btn">
              <input 
                type="file" 
                accept="image/*" 
                @change="handleLogoUpload"
                hidden
              />
              Upload Logo
            </label>
          </div>
          
          <!-- Form Fields -->
          <div class="form_row">
            <div class="form_field">
              <label>Organization Name (TH) <span class="required">*</span></label>
              <input type="text" v-model="formData.organizationNameTH" placeholder="Organization Name (TH)" />
            </div>
            <div class="form_field">
              <label>Organization Name (EN) <span class="required">*</span></label>
              <input type="text" v-model="formData.organizationNameEN" placeholder="Organization Name (EN)" />
            </div>
          </div>
          
          <div class="form_row">
            <div class="form_field">
              <label>Address (TH)</label>
              <input type="text" v-model="formData.addressTH" placeholder="Address (TH)" />
            </div>
            <div class="form_field">
              <label>Address (EN)</label>
              <input type="text" v-model="formData.addressEN" placeholder="Address (EN)" />
            </div>
          </div>
          
          <div class="form_row">
            <div class="form_field">
              <label>Organization Type <span class="required">*</span></label>
              <select v-model="formData.organizationType">
                <option value="">--Select Type--</option>
                <option>private company</option>
                <option>Government</option>
                <option>Oversea</option>
                <option>MFU</option>
              </select>
            </div>
            <div class="form_field">
              <label>Industry Category</label>
              <select v-model="formData.industryCategory">
                <option value="">--Select Category--</option>
                <option value="School of Applied Digital Technology">School of Applied Digital Technology</option>
                <option value="Agriculture and Food Products">Agriculture and Food Products</option>
                <option value="Automotive and Transportation Equipment">Automotive and Transportation Equipment</option>
                <option value="Banking, Finance and Insurance">Banking, Finance and Insurance</option>
                <option value="Business Services">Business Services</option>
                <option value="Energy">Energy</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Information and Communication Technology">Information and Communication Technology</option>
                <option value="Manufacturing and Industrial Products">Manufacturing and Industrial Products</option>
                <option value="Mining and Metal Products">Mining and Metal Products</option>
                <option value="Petrochemicals and Chemicals">Petrochemicals and Chemicals</option>
                <option value="Textile and Garments">Textile and Garments</option>
                <option value="Tourism and Hospitality">Tourism and Hospitality</option>
                <option value="Trading and Distribution">Trading and Distribution</option>
                <option value="Transportation and Logistics">Transportation and Logistics</option>
                <option value="Utilities">Utilities</option>
              </select>
            </div>
          </div>
          
          <div class="form_row">
            <div class="form_field">
              <label>Country</label>
              <div class="dropdown_wrapper">
                <div class="dropdown_header" @click="dropdownOpen.country = !dropdownOpen.country">
                  <span class="dropdown_text">{{ formData.country || '--Select Country--' }}</span>
                  <div class="dropdown_arrow" :class="{ open: dropdownOpen.country }"></div>
                </div>
                <div v-if="dropdownOpen.country" class="dropdown_options">
                  <div class="dropdown_search">
                    <input 
                      type="text" 
                      v-model="dropdownSearch.country" 
                      placeholder="Search..."
                      @click.stop
                      class="dropdown_search_input"
                    />
                  </div>
                  <div 
                    class="dropdown_option" 
                    v-for="option in filteredCountries" 
                    :key="option" 
                    @click="formData.country = option; dropdownOpen.country = false"
                  >
                    {{ option }}
                  </div>
                </div>
              </div>
            </div>
            <div class="form_field">
              <label>Geography</label>
              <div class="dropdown_wrapper">
                <div class="dropdown_header" @click="dropdownOpen.geography = !dropdownOpen.geography">
                  <span class="dropdown_text">{{ formData.geography || '--Select Geography--' }}</span>
                  <div class="dropdown_arrow" :class="{ open: dropdownOpen.geography }"></div>
                </div>
                <div v-if="dropdownOpen.geography" class="dropdown_options">
                  <div class="dropdown_search">
                    <input 
                      type="text" 
                      v-model="dropdownSearch.geography" 
                      placeholder="Search..."
                      @click.stop
                      class="dropdown_search_input"
                    />
                  </div>
                  <div 
                    class="dropdown_option" 
                    v-for="option in filteredGeographies" 
                    :key="option" 
                    @click="formData.geography = option; dropdownOpen.geography = false"
                  >
                    {{ option }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="form_row">
            <div class="form_field">
              <label>Province</label>
              <div class="dropdown_wrapper">
                <div class="dropdown_header" @click="dropdownOpen.province = !dropdownOpen.province">
                  <span class="dropdown_text">{{ formData.province || '--Select Province--' }}</span>
                  <div class="dropdown_arrow" :class="{ open: dropdownOpen.province }"></div>
                </div>
                <div v-if="dropdownOpen.province" class="dropdown_options">
                  <div class="dropdown_search">
                    <input 
                      type="text" 
                      v-model="dropdownSearch.province" 
                      placeholder="Search..."
                      @click.stop
                      class="dropdown_search_input"
                    />
                  </div>
                  <div 
                    class="dropdown_option" 
                    v-for="option in filteredProvinces" 
                    :key="option" 
                    @click="formData.province = option; dropdownOpen.province = false"
                  >
                    {{ option }}
                  </div>
                </div>
              </div>
            </div>
            <div class="form_field">
              <label>Email <span class="required">*</span></label>
              <input type="email" v-model="formData.email" placeholder="Email" />
            </div>
          </div>
          
          <div class="form_row">
            <div class="form_field">
              <label>Phone Number</label>
              <input type="tel" v-model="formData.phoneNumber" placeholder="Phone Number" />
            </div>
          </div>
          
          <div class="form_field full_width">
            <label>Details</label>
            <textarea v-model="formData.details" placeholder="Organization Details" rows="4"></textarea>
          </div>
          
          <!-- Public Toggle -->
          <div class="public_toggle">
            <label>Make Organization Public</label>
            <div class="toggle_switch" :class="{ active: formData.isPublic }" @click.stop="formData.isPublic = !formData.isPublic">
              <div class="toggle_slider" :class="{ active: formData.isPublic }"></div>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="modal_actions">
            <button class="cancel_btn" @click="$emit('update:modelValue', false)">Cancel</button>
            <button class="save_btn" @click="handleSaveOrganization" :disabled="loading">
              {{ loading ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </div>

        <!-- Review Tab -->
        <div v-if="activeTab === 'review'" class="review_tab">
          <h2 class="modal_title">Add Review</h2>
          <div class="form_divider"></div>
          
          <!-- Existing Reviews Carousel -->
          <div v-if="existingReviews.length > 0" class="existing_reviews_carousel">
            <h3 class="section_subtitle">Existing Reviews</h3>
            <div class="carousel_container">
              <!-- Previous Button -->
              <button 
                class="review_nav_btn prev" 
                @click="prevReview" 
                :disabled="currentReviewIndex === 0"
              >
                <div class="nav_arrow_left"></div>
              </button>
              
              <!-- Current Review Card -->
              <div class="review_carousel_card" v-if="currentReview">
                <div class="review_card_header">
                  <div class="review_position">{{ currentReview.job_position || 'N/A' }}</div>
                  <button class="delete_review_btn" @click="deleteExistingReview(currentReview._id)" title="Delete review">
                    <div class="delete_icon"></div>
                  </button>
                </div>
                <p class="review_card_text">{{ currentReview.review_text }}</p>
                <div class="review_counter">{{ currentReviewIndex + 1 }} / {{ existingReviews.length }}</div>
              </div>
              
              <!-- Next Button -->
              <button 
                class="review_nav_btn next" 
                @click="nextReview" 
                :disabled="currentReviewIndex === existingReviews.length - 1"
              >
                <div class="nav_arrow_right"></div>
              </button>
            </div>
            <div class="form_divider" style="margin: 20px 0;"></div>
          </div>
          
          <!-- Add New Review Form -->
          <h3 class="section_subtitle">Add New Review</h3>
          
          <div class="form_field">
            <label>Job Position</label>
            <input type="text" v-model="reviewData.jobPosition" placeholder="Job Position" />
          </div>
          
          <div class="form_field">
            <label>Review</label>
            <textarea v-model="reviewData.review" placeholder="Write your review..." rows="6"></textarea>
          </div>
          
          <!-- Action Buttons -->
          <div class="modal_actions">
            <button class="cancel_btn" @click="$emit('update:modelValue', false)">Cancel</button>
            <button class="save_btn" @click="handleSaveReview">Save</button>
          </div>
        </div>

        <!-- MOU Tab -->
        <div v-if="activeTab === 'mou'" class="mou_tab">
          <div class="mou_header">
            <h2 class="modal_title">Add MOU</h2>
            <div class="form_divider"></div>
          </div>

          <div class="mou_top_row">
            <label class="mou_upload" aria-label="Upload MOU">
              <div class="mou_icon"></div>
              <input
                type="file"
                class="file_input"
                accept=".pdf,.doc,.docx,image/*"
                @change="handleMOUUpload"
              />
            </label>
            <span class="mou_label">MOU</span>
          </div>

          <!-- MOU Document Preview -->
          <div v-if="mouPreview" class="mou_document_preview">
            <img v-if="mouData.mouFile?.type?.startsWith('image/') || (existingMouId && mouPreview.match(/\.(jpg|jpeg|png|gif)$/i))" :src="mouPreview" alt="MOU Preview" />
            <embed v-else-if="mouPreview.endsWith('.pdf')" :src="mouPreview" type="application/pdf" class="pdf_preview" />
            <div v-else class="document_placeholder">
              <div class="doc_icon"></div>
              <span>{{ mouData.mouFile?.name || 'MOU Document' }}</span>
            </div>
          </div>

          <div class="mou_date_row">
            <div class="form_group date_group">
              <label>Start Date *</label>
              <input type="date" v-model="mouData.startDate" class="date_input" />
            </div>
            <div class="form_group date_group">
              <label>End Date *</label>
              <input type="date" v-model="mouData.endDate" class="date_input" />
            </div>
          </div>

          <div class="modal_actions mou_actions">
            <button class="btn_cancel" @click="$emit('update:modelValue', false)">Cancel</button>
            <button class="btn_save" @click="handleSaveMOU" :disabled="loading">
              {{ loading ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { organizationAPI, mouAPI, reviewAPI, BACKEND_URL } from '../services/api'

// Props
const props = defineProps<{
  modelValue: boolean
  organizationId?: string | null
  initialTab?: 'organization' | 'review' | 'mou'
}>()

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'saved': []
}>()

// Track mouse down position for modal overlay
let mouseDownTarget: EventTarget | null = null

const handleOverlayMouseDown = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    mouseDownTarget = event.target
  } else {
    mouseDownTarget = null
  }
}

const handleOverlayMouseUp = (event: MouseEvent) => {
  if (event.target === event.currentTarget && mouseDownTarget === event.target) {
    emit('update:modelValue', false)
  }
  mouseDownTarget = null
}

// State
const activeTab = ref<'organization' | 'review' | 'mou'>(props.initialTab || 'organization')
const loading = ref(false)
const logoPreview = ref<string | null>(null)
const mouPreview = ref<string | null>(null)
const existingMouId = ref<string | null>(null)
const existingReviews = ref<any[]>([])
const currentReviewIndex = ref(0)

// Form data
const formData = reactive({
  logo: null as File | null,
  organizationNameTH: '',
  organizationNameEN: '',
  addressTH: '',
  addressEN: '',
  organizationType: '',
  industryCategory: '',
  country: '',
  geography: '',
  province: '',
  email: '',
  phoneNumber: '',
  details: '',
  isPublic: false
})

// Dropdown search states
const dropdownSearch = ref({
  country: '',
  geography: '',
  province: ''
})

const dropdownOpen = ref({
  country: false,
  geography: false,
  province: false
})

// Dropdown options
const countryOptions = ['Thailand', 'USA', 'Japan', 'China', 'Others']
const geographyOptions = ['Central Region', 'Northern Region', 'Northeastern Region', 'Southern Region', 'Eastern Region', 'Western Region']
const provinceOptions = [
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
]

// Filtered options
const filteredCountries = computed(() => {
  if (!dropdownSearch.value.country) return countryOptions
  return countryOptions.filter(option => 
    option.toLowerCase().includes(dropdownSearch.value.country.toLowerCase())
  )
})

const filteredGeographies = computed(() => {
  if (!dropdownSearch.value.geography) return geographyOptions
  return geographyOptions.filter(option => 
    option.toLowerCase().includes(dropdownSearch.value.geography.toLowerCase())
  )
})

const filteredProvinces = computed(() => {
  if (!dropdownSearch.value.province) return provinceOptions
  return provinceOptions.filter(option => 
    option.toLowerCase().includes(dropdownSearch.value.province.toLowerCase())
  )
})

const reviewData = reactive({
  jobPosition: '',
  review: ''
})

// Fetch existing reviews for organization
const fetchExistingReviews = async (orgId: string) => {
  try {
    const response = await reviewAPI.getByOrganization(orgId)
    existingReviews.value = response.data.data || []
    currentReviewIndex.value = 0
    console.log('Existing reviews loaded:', existingReviews.value.length, 'items')
  } catch (error: any) {
    console.warn('Error loading existing reviews:', error)
    existingReviews.value = []
    currentReviewIndex.value = 0
  }
}

// Navigate to previous review
const prevReview = () => {
  if (currentReviewIndex.value > 0) {
    currentReviewIndex.value--
  }
}

// Navigate to next review
const nextReview = () => {
  if (currentReviewIndex.value < existingReviews.value.length - 1) {
    currentReviewIndex.value++
  }
}

// Get current review
const currentReview = computed(() => {
  return existingReviews.value[currentReviewIndex.value] || null
})

// Delete a review
const deleteExistingReview = async (reviewId: string) => {
  const confirmed = confirm('Are you sure you want to delete this review?')
  if (!confirmed) return
  
  try {
    await reviewAPI.delete(reviewId)
    // Remove from local list
    existingReviews.value = existingReviews.value.filter(r => r._id !== reviewId)
    // Reset index if needed
    if (currentReviewIndex.value >= existingReviews.value.length) {
      currentReviewIndex.value = Math.max(0, existingReviews.value.length - 1)
    }
    console.log('Review deleted successfully')
  } catch (error: any) {
    console.error('Error deleting review:', error)
  }
}

const mouData = reactive({
  mouFile: null as File | null,
  startDate: '',
  endDate: ''
})

// Methods
const handleLogoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    formData.logo = target.files[0]
    
    if (logoPreview.value) {
      URL.revokeObjectURL(logoPreview.value)
    }
    logoPreview.value = URL.createObjectURL(target.files[0])
  }
}

const handleMOUUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    mouData.mouFile = target.files[0]
    
    if (mouPreview.value && mouPreview.value !== 'document') {
      URL.revokeObjectURL(mouPreview.value)
    }
    
    if (target.files[0].type.startsWith('image/')) {
      mouPreview.value = URL.createObjectURL(target.files[0])
    } else {
      mouPreview.value = 'document'
    }
  }
}

// Main function to save all data from all tabs
const saveAllData = async () => {
  // Validate required organization fields
  if (!formData.organizationNameEN || !formData.organizationNameTH || !formData.email || !formData.organizationType) {
    alert('Please fill in all required fields: Organization Name (EN/TH), Email, and Organization Type')
    return
  }

  loading.value = true
  const savedItems: string[] = []
  const errors: string[] = []
  let savedOrgId = props.organizationId

  try {
    // Step 1: Save Organization Data
    const formDataToSend = new FormData()
    formDataToSend.append('name_en', formData.organizationNameEN)
    formDataToSend.append('name_th', formData.organizationNameTH)
    formDataToSend.append('address_en', formData.addressEN)
    formDataToSend.append('address_th', formData.addressTH)
    formDataToSend.append('organization_type', formData.organizationType)
    
    if (formData.industryCategory) formDataToSend.append('industry_category_id', formData.industryCategory)
    if (formData.country) formDataToSend.append('country_id', formData.country)
    if (formData.geography) formDataToSend.append('geography_id', formData.geography)
    if (formData.province) formDataToSend.append('province_id', formData.province)
    
    formDataToSend.append('email', formData.email)
    formDataToSend.append('phone_number', formData.phoneNumber)
    formDataToSend.append('details', formData.details)
    formDataToSend.append('is_public', String(formData.isPublic))

    if (formData.logo) {
      formDataToSend.append('logo', formData.logo)
    }

    let response
    if (props.organizationId) {
      response = await organizationAPI.update(props.organizationId, formDataToSend)
      savedOrgId = props.organizationId
    } else {
      response = await organizationAPI.create(formDataToSend)
      savedOrgId = response.data.data._id
    }
    savedItems.push('Organization')
    console.log('Organization saved successfully')

    // Step 2: Save Review Data (if provided)
    if (reviewData.jobPosition && reviewData.review) {
      if (!savedOrgId) {
        errors.push('Review (No organization ID)')
      } else {
        try {
          const reviewPayload = {
            organization_id: savedOrgId,
            job_position: reviewData.jobPosition,
            review_text: reviewData.review
          }
          
          await reviewAPI.create(reviewPayload)
          savedItems.push('Review')
          console.log('Review saved successfully')
        } catch (reviewError: any) {
          console.error('Review save failed:', reviewError)
          errors.push('Review')
        }
      }
    }

    // Step 3: Save MOU Data (if provided)
    if (mouData.startDate && mouData.endDate) {
      if (new Date(mouData.endDate) <= new Date(mouData.startDate)) {
        errors.push('MOU (End date must be after start date)')
      } else if (!mouData.mouFile) {
        errors.push('MOU (No file selected)')
      } else if (!savedOrgId) {
        errors.push('MOU (No organization ID)')
      } else {
        try {
          const mouFormData = new FormData()
          
          const orgResponse = await organizationAPI.getById(savedOrgId)
          const orgData = orgResponse.data.data
          
          mouFormData.append('organization_name', orgData.name_en || orgData.name_th || 'Unknown')
          mouFormData.append('organization_id', savedOrgId)
          mouFormData.append('start_date', mouData.startDate)
          mouFormData.append('end_date', mouData.endDate)
          mouFormData.append('mou', mouData.mouFile)

          if (existingMouId.value) {
            await mouAPI.update(existingMouId.value, mouFormData)
          } else {
            await mouAPI.create(mouFormData)
          }
          savedItems.push('MOU')
          console.log('MOU saved successfully')
        } catch (mouError: any) {
          console.error('MOU save failed:', mouError)
          console.error('MOU error details:', mouError.response?.data)
          errors.push(`MOU (${mouError.response?.data?.message || mouError.message})`)
        }
      }
    }

    // Prepare success message
    if (errors.length === 0) {
      alert(`${savedItems.join(', ')} saved successfully!`)
    } else {
      alert(`${savedItems.join(', ')} saved, but ${errors.join(', ')} failed.`)
    }
    
    emit('saved')
    emit('update:modelValue', false)
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to save data'
    console.error('Save error:', error)
    alert(`Error: ${errorMessage}`)
  } finally {
    loading.value = false
  }
}

// Wrapper functions for each tab
const handleSaveOrganization = async () => {
  await saveAllData()
}

const handleSaveReview = async () => {
  await saveAllData()
}

const handleSaveMOU = async () => {
  await saveAllData()
}

// Load organization data when editing
const loadOrganizationData = async () => {
  if (!props.organizationId) return
  
  loading.value = true
  try {
    const response = await organizationAPI.getById(props.organizationId)
    const orgData = response.data.data
    
    formData.organizationNameEN = orgData.name_en || ''
    formData.organizationNameTH = orgData.name_th || ''
    formData.addressEN = orgData.address_en || ''
    formData.addressTH = orgData.address_th || ''
    formData.organizationType = orgData.organization_type || ''
    formData.industryCategory = orgData.industry_category_id || ''
    formData.country = orgData.country_id || ''
    formData.geography = orgData.geography_id || ''
    formData.province = orgData.province_id || ''
    formData.email = orgData.email || ''
    formData.phoneNumber = orgData.phone_number || ''
    formData.details = orgData.details || ''
    formData.isPublic = orgData.is_public || false
    
    if (orgData.logo_path) {
      logoPreview.value = `${BACKEND_URL}${orgData.logo_path}`
    }
    
    // Load existing MOU if any
    await loadMOUData()
    
    // Fetch existing reviews
    await fetchExistingReviews(props.organizationId)
  } catch (error: any) {
    console.error('Error loading organization:', error)
    alert('Failed to load organization data')
  } finally {
    loading.value = false
  }
}

// Load MOU data for the organization
const loadMOUData = async () => {
  if (!props.organizationId) return
  
  try {
    const response = await mouAPI.getAll({ limit: 100 })
    const mou = response.data.data.find((item: any) => {
      const orgId = item.organization_id?._id || item.organization_id
      return String(orgId) === String(props.organizationId)
    })
    
    if (mou) {
      existingMouId.value = mou._id
      mouData.startDate = mou.start_date ? new Date(mou.start_date).toISOString().split('T')[0] : ''
      mouData.endDate = mou.end_date ? new Date(mou.end_date).toISOString().split('T')[0] : ''
      
      if (mou.mou_path) {
        mouPreview.value = `${BACKEND_URL}${mou.mou_path}`
      }
    }
  } catch (error: any) {
    console.error('Error loading MOU:', error)
  }
}

// Watch for modal opening with organization ID
watch(() => props.modelValue, (newValue) => {
  if (newValue && props.organizationId) {
    loadOrganizationData()
  }
  if (newValue && props.initialTab) {
    activeTab.value = props.initialTab
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');

.modal_overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(84, 84, 84, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.add_org_modal {
  position: relative;
  width: 657px;
  min-height: 400px;
  max-height: 657px;
  background: #FFFFFF;
  border-radius: 12px;
  display: flex;
}

.add_org_modal.organization_active {
  height: 657px;
  min-height: 657px;
  max-height: 657px;
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
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  font-size: 12px;
  color: #000000;
  transition: all 0.2s ease;
}

.tab_item.active {
  background: #AB1C03;
  color: #FFFFFF;
}

.tab_item span {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) rotate(90deg);
  transform-origin: center center;
  white-space: nowrap;
  color: inherit;
}

.modal_content {
  flex: 1;
  padding: 35px 45px;
  overflow-y: auto;
  max-height: 657px;
  max-width: 657px;
}

.modal_content::-webkit-scrollbar {
  width: 8px;
}

.modal_content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.modal_content::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.modal_content::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.modal_title {
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 24px;
  color: #000000;
  margin-bottom: 10px;
}

.form_divider {
  width: 100%;
  height: 1px;
  background: #E0E0E0;
  margin-bottom: 30px;
}

/* Logo Upload Section */
.logo_upload_section {
  display: flex;
  align-items: center;
  gap: 30px;
  margin-bottom: 30px;
}

.logo_preview_circle {
  width: 95px;
  height: 95px;
  border-radius: 50%;
  background: #F5F5F5;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.preview_image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder_icon {
  width: 40px;
  height: 40px;
  background: #D0D0D0;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E") no-repeat center;
  mask-size: contain;
}

.upload_logo_btn {
  padding: 10px 24px;
  background: #AB1C03;
  border-radius: 20px;
  color: #FFFFFF;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.upload_logo_btn:hover {
  background: #8A1602;
}

/* Form Fields */
.form_row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.form_field {
  flex: 1;
}

.form_field.full_width {
  width: 100%;
  margin-bottom: 20px;
}

.form_field label {
  display: block;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #000000;
  margin-bottom: 8px;
}

.required {
  color: #AB1C03;
}

.form_field input,
.form_field select,
.form_field textarea {
  width: 90%;
  padding: 10px;
  border: 1px solid #B1B1B1;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #000000;
}

/* Custom Dropdown Styles */
.dropdown_wrapper {
  position: relative;
  width: 100%;
}

.dropdown_header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 90%;
  padding: 10px;
  background: #FFFFFF;
  border: 1px solid #B1B1B1;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.dropdown_header:hover {
  border-color: #AB1C03;
}

.dropdown_text {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #333333;
}

.dropdown_arrow {
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #000000;
  transition: transform 0.2s;
}

.dropdown_arrow.open {
  transform: rotate(180deg);
}

.dropdown_options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  max-height: 250px;
  overflow-y: auto;
  background: #FFFFFF;
  border: 1px solid #B1B1B1;
  border-radius: 8px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.dropdown_search {
  position: sticky;
  top: 0;
  background: #FFFFFF;
  padding: 8px;
  border-bottom: 1px solid #E0E0E0;
  z-index: 1001;
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
  padding: 10px 12px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #333333;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dropdown_option:hover {
  background-color: #F5F5F5;
}

.form_field input:focus,
.form_field select:focus,
.form_field textarea:focus {
  outline: none;
  border-color: #AB1C03;
}

/* Toggle Switch */
.public_toggle,
.publish_toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 30px 0;
}

.public_toggle label,
.publish_toggle label {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #000000;
}

.toggle_switch {
  width: 50px;
  height: 26px;
  background: #D0D0D0;
  border-radius: 13px;
  cursor: pointer;
  position: relative;
  transition: background 0.3s;
}

.toggle_switch.active {
  background: #AB1C03;
}

.toggle_slider {
  width: 22px;
  height: 22px;
  background: #FFFFFF;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.3s, background 0.3s;
}

.toggle_slider.active {
  transform: translateX(24px);
  background: #FFFFFF;
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

.publish_toggle.mou_publish {
  margin: 10px 0 30px 0;
  padding: 8px 0;
  justify-content: flex-end;
  gap: 12px;
  display: flex;
  align-items: center;
}

.publish-toggle.mou-publish label {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 16px;
  color: #333333;
}

.modal-actions.mou_actions {
  justify-content: flex-end;
  gap: 12px;
  margin-top: 10px;
  display: flex;
}

.file_input {
  display: none;
}

/* MOU Upload Section */
.mou_upload_section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.mou_preview_area {
  width: 291px;
  height: 408px;
  border: 2px dashed #D0D0D0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F9F9F9;
}

.mou_preview_image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.document-placeholder,
.empty_preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  color: #999;
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
}

.doc-icon,
.empty_icon {
  width: 60px;
  height: 60px;
  background: #D0D0D0;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z'/%3E%3C/svg%3E") no-repeat center;
  mask-size: contain;
}

.upload_mou_btn {
  padding: 10px 24px;
  background: #AB1C03;
  border-radius: 20px;
  color: #FFFFFF;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.upload_mou_btn:hover {
  background: #8A1602;
}

/* Modal Actions */
.modal_actions {
  display: flex;
  gap: 20px;
  justify-content: flex-end;
  margin-top: 30px;
}

.btn-cancel,
.cancel-btn,
.save-btn,
.btn_save {
  padding: 10px 30px;
  border-radius: 20px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-cancel,
.cancel_btn {
  background: #FFFFFF;
  border: 1px solid #B1B1B1;
  color: #000000;
}

.btn_cancel:hover,
.cancel_btn:hover {
  background: #F5F5F5;
}

.btn-save,
.save_btn {
  background: #AB1C03;
  color: #FFFFFF;
}

.btn_save:hover,
.save_btn:hover {
  background: #8A1602;
}

.btn_save:disabled,
.save_btn:disabled {
  background: #D0D0D0;
  cursor: not-allowed;
}

/* Review Carousel Styles */
.existing_reviews_carousel {
  background: #F9F9F9;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.section_subtitle {
  font-family: 'Outfit';
  font-weight: 600;
  font-size: 16px;
  line-height: 20px;
  color: #000000;
  margin: 0 0 15px 0;
}

.carousel_container {
  display: flex;
  align-items: center;
  gap: 15px;
  justify-content: space-between;
  min-height: 180px;
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
  padding: 0;
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
  min-height: 160px;
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
  width: 24px;
  height: 24px;
  border: none;
  background: #F0F0F0;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
  padding: 0;
}

.delete_review_btn:hover {
  background: #E0E0E0;
}

.delete_icon {
  width: 12px;
  height: 12px;
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
  max-height: 100px;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.review_counter {
  font-family: 'Inter';
  font-size: 12px;
  color: #999999;
  text-align: right;
  margin-top: auto;
}

</style>


