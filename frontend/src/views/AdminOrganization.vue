<template>
  <div class="admin_organization">
    <!-- AdminNavbar component -->
    <AdminNavbar />
    
    <!-- Main content -->
    <main class="main_content">
      <div class="top_bar">
        <div class="top_bar_titles">
          <span class="top_bar_title">Organization</span>
          <span class="top_bar_subtitle">Manage and view all organization data in the database.</span>
        </div>
        <div class="top_bar_actions">
          <div class="language_switcher" aria-label="Language selector">
            <button class="language_active" :class="{ selected: currentLanguage === 'EN' }" @click="setLanguage('EN')">EN</button>
            <button class="language_option" :class="{ selected: currentLanguage === 'TH' }" @click="setLanguage('TH')">TH</button>
          </div>
          <div class="admin_badge"><span class="admin_avatar">A</span><span>Admin User</span></div>
        </div>
      </div>

      <section class="content_area">
        <div class="page_heading">
          <div>
            <h1>{{ text('Organization', 'องค์กร') }}</h1>
            <p>{{ text('Manage and view all organization data in the database.', 'จัดการและดูข้อมูลทั้งหมดขององค์กรในฐานข้อมูล') }}</p>
          </div>
          <div class="page_actions">
            <button class="import_btn" @click="showImportModal = true"><span class="upload_icon"></span>{{ text('Upload Organizations', 'อัปโหลดองค์กร') }}</button>
            <button class="add_org_btn" @click="addOrganization"><span class="plus_icon"></span>{{ text('Add Organization', 'เพิ่มองค์กร') }}</button>
          </div>
        </div>

        <section class="filter_section">
          <input type="text" :placeholder="text('Search organisation...', 'ค้นหาองค์กร...')" class="search_input" v-model="searchText" />
          <div class="filter_labels">
            <span>{{ text('Business Type', 'ประเภทธุรกิจ') }}</span><span>{{ text('Business Category', 'หมวดหมู่ธุรกิจ') }}</span><span>{{ text('Region', 'ภูมิภาค') }}</span><span>{{ text('Country', 'ประเทศ') }}</span><span>{{ text('Province', 'จังหวัด') }}</span>
          </div>
          <div class="dropdowns_grid">
          <!-- Organization Type dropdown -->
          <div class="dropdown_container org_type" :class="{ active: dropdowns.orgType }">
            <div class="dropdown_header" @click="toggleDropdown('orgType')">
              <span class="dropdown_text">{{ selectedFilters.orgType === 'All' ? text('--Organization Type--', '--เลือกประเภทองค์กร--') : orgTypeOptions.find(o => o.value === selectedFilters.orgType)?.label }}</span>
              <div class="dropdown_arrow"></div>
            </div>
            <div v-if="dropdowns.orgType" class="dropdown_options">
              <div class="dropdown_option" v-for="option in orgTypeOptions" :key="option.value" @click="selectOption('orgType', option.value)">
                {{ option.label }}
              </div>
            </div>
          </div>
          
          <!-- Industry Category dropdown -->
          <div class="dropdown_container industry_cat" :class="{ active: dropdowns.industryCat }">
            <div class="dropdown_header" @click="toggleDropdown('industryCat')">
              <span class="dropdown_text">{{ selectedFilters.industryCat === 'All' ? text('--Industry Category--', '--เลือกหมวดหมู่ธุรกิจ--') : selectedFilters.industryCat }}</span>
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
                {{ option }}
              </div>
            </div>
          </div>
          
          <!-- Country dropdown -->
          <div class="dropdown_container country" :class="{ active: dropdowns.country }">
            <div class="dropdown_header" @click="toggleDropdown('country')">
              <span class="dropdown_text">{{ selectedFilters.country === 'All' ? text('---Country---', '---เลือกประเทศ---') : selectedFilters.country }}</span>
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
                {{ option }}
              </div>
            </div>
          </div>
          
          <!-- Geography dropdown -->
          <div class="dropdown_container geography" :class="{ active: dropdowns.geography }">
            <div class="dropdown_header" @click="toggleDropdown('geography')">
              <span class="dropdown_text">{{ selectedFilters.geography === 'All' ? text('--Geography--', '--เลือกภูมิภาค--') : selectedFilters.geography }}</span>
              <div class="dropdown_arrow"></div>
            </div>
            <div v-if="dropdowns.geography" class="dropdown_options">
              <div class="dropdown_search">
                <input 
                  type="text" 
                  v-model="dropdownSearch.geography" 
                  placeholder="Search..."
                  @click.stop
                  class="dropdown_search_input"
                />
              </div>
              <div class="dropdown_option" v-for="option in filteredGeography" :key="option" @click="selectOption('geography', option)">
                {{ option }}
              </div>
            </div>
          </div>
          
          <!-- Province dropdown -->
          <div class="dropdown_container province" :class="{ active: dropdowns.province }">
            <div class="dropdown_header" @click="toggleDropdown('province')">
              <span class="dropdown_text">{{ selectedFilters.province === 'All' ? text('--Province--', '--เลือกจังหวัด--') : selectedFilters.province }}</span>
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
                {{ option }}
              </div>
            </div>
          </div>
        </div>

          <div class="filter_buttons"><button class="reset_btn" @click="resetFilters">{{ text('Reset', 'รีเซ็ต') }}</button><button class="search_btn" @click="searchOrganizations">{{ text('search', 'ค้นหา') }}</button></div>
        </section>

        <div class="table_container">
          <div class="table_header"><span>{{ text('Organization', 'องค์กร') }}</span><span>{{ text('Type', 'ประเภท') }}</span><span>{{ text('School', 'สำนักวิชา') }}</span><span>{{ text('Province', 'จังหวัด') }}</span><span>{{ text('Country', 'ประเทศ') }}</span><span>{{ text('Status', 'สถานะ') }}</span><span>{{ text('Actions', 'การดำเนินการ') }}</span></div>
          <div v-for="org in paginatedOrganizations" :key="org.id" class="table_row">
            <div class="org_name" @click="viewOrganizationDetail(org.id)">{{ org.name }}</div>
            <div class="org_category">{{ org.category }}</div>
            <div class="org_school">{{ org.industryCategory || 'SIT' }}</div>
            <div class="org_province">{{ org.province }}</div>
            <div class="org_country">{{ org.country || 'Thailand' }}</div>
            <div><span class="status_pill" :class="org.status">{{ org.status === 'active' ? text('Active', 'ใช้งาน') : text('Inactive', 'ไม่ใช้งาน') }}</span></div>
            <div class="action_buttons"><button class="text_action" @click="!state.loading && editOrganization(org.id)" :disabled="state.loading">{{ text('Edit', 'แก้ไข') }}</button><button class="text_action danger" @click="!state.loading && deleteOrganization(org.id)" :disabled="state.loading">{{ text('Delete', 'ลบ') }}</button><button v-if="org.hasMOU" class="text_action" @click="!state.loading && viewDocument(org.id)">{{ text('View', 'ดู') }}</button></div>
          </div>
          <div v-if="!state.loading && paginatedOrganizations.length === 0" class="empty_state">No organizations found.</div>
        </div>
        <Pagination :current-page="state.currentPage" :total-pages="paginationInfo.totalPages" :total-items="paginationInfo.totalItems" :loading="state.loading" :show-info="false" @page-change="handlePageChange" />
      </section>
    </main>

    <!-- Add Organization Modal -->
    <div v-if="state.showAddModal" class="modal_overlay" @mousedown.self="handleOverlayMouseDown" @mouseup.self="handleOverlayMouseUp">
      <div class="add_org_modal" :class="`${state.activeTab}_active`">
        <!-- Right side tabs -->
        <div class="modal_tabs">
          <div 
            class="tab_item"
            :class="{ active: state.activeTab === 'organization' }"
            @click="switchTab('organization')"
          >
            <span>Organization</span>
          </div>
          <div 
            class="tab_item"
            :class="{ active: state.activeTab === 'review' }"
            @click="switchTab('review')"
          >
            <span>Review</span>
          </div>
          <div 
            class="tab_item"
            :class="{ active: state.activeTab === 'mou' }"
            @click="switchTab('mou')"
          >
            <span>MOU</span>
          </div>
        </div>

        <!-- Modal Content -->
        <div class="modal_content">
          <!-- Organization Tab -->
          <div v-if="state.activeTab === 'organization'" class="organization_tab">
            <h2 class="modal_title">Add Organization</h2>
            <div class="form_divider"></div>
            
            <!-- Logo Upload -->
            <div class="logo_upload_section">
              <!-- Logo Preview -->
              <div v-if="logoPreviewUrl" class="logo_preview">
                <img :src="logoPreviewUrl" alt="Logo Preview" />
              </div>
              
              <div class="upload_area">
                <div class="upload_icon"></div>
                <input type="file" @change="handleLogoUpload" accept="image/*" class="file_input" />
              </div>
              <span class="upload_text">Upload logo here</span>
            </div>
            
            <!-- Form Fields -->
            <div class="form_row">
              <div class="form_group">
                <label>Organization Name(TH)*</label>
                <input type="text" v-model="formData.organizationNameTH" />
              </div>
              <div class="form_group">
                <label>Organization Name(EN)*</label>
                <input type="text" v-model="formData.organizationNameEN" />
              </div>
            </div>
            
            <div class="form_row">
              <div class="form_group">
                <label>Address(TH)*</label>
                <textarea class="textarea_md" v-model="formData.addressTH"></textarea>
              </div>
              <div class="form_group">
                <label>Address(EN)*</label>
                <textarea class="textarea_md" v-model="formData.addressEN"></textarea>
              </div>
            </div>
            
            <div class="form_row">
              <div class="form_group full_width">
                <label>Organization Type*</label>
                <div class="org_type_row_box">
                  <div class="org_type_col" v-for="type in orgTypeOptions" :key="type.value" @click="formData.organizationType = type.value" :class="{ active: formData.organizationType === type.value }">
                    <div class="org_type_name">{{ type.label }}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="form_row">
              <div class="form_group full_width">
                <label>Industry Category*</label>
                <div class="modal_dropdown_wrapper full_width">
                  <div class="modal_dropdown_header" @click="modalDropdownOpen.industryCategory = !modalDropdownOpen.industryCategory">
                    <span class="modal_dropdown_text">{{ displayLocationValue(formData.industryCategory, '--Select Category--') }}</span>
                    <div class="modal_dropdown_arrow" :class="{ open: modalDropdownOpen.industryCategory }"></div>
                  </div>
                  <div v-if="modalDropdownOpen.industryCategory" class="modal_dropdown_options">
                    <div class="modal_dropdown_search">
                      <input 
                        type="text" 
                        v-model="modalDropdownSearch.industryCategory" 
                        placeholder="Search..."
                        @click.stop
                        class="modal_dropdown_search_input"
                      />
                    </div>
                    <div 
                      class="modal_dropdown_option" 
                      v-for="option in modalFilteredIndustryCategory" 
                      :key="option" 
                      @click="formData.industryCategory = option; modalDropdownOpen.industryCategory = false"
                    >
                      {{ option }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="form_row">
              <div class="form_group">
                <label>Country*</label>
                <div class="modal_dropdown_wrapper">
                  <div class="modal_dropdown_header" @click="modalDropdownOpen.country = !modalDropdownOpen.country">
                    <span class="modal_dropdown_text">{{ displayLocationValue(formData.country, '---Country---') }}</span>
                    <div class="modal_dropdown_arrow" :class="{ open: modalDropdownOpen.country }"></div>
                  </div>
                  <div v-if="modalDropdownOpen.country" class="modal_dropdown_options">
                    <div class="modal_dropdown_search">
                      <input 
                        type="text" 
                        v-model="modalDropdownSearch.country" 
                        placeholder="Search..."
                        @click.stop
                        class="modal_dropdown_search_input"
                      />
                    </div>
                    <div 
                      class="modal_dropdown_option" 
                      v-for="option in modalFilteredCountry" 
                      :key="option" 
                      @click="formData.country = option; modalDropdownOpen.country = false"
                    >
                      {{ option }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="form_group">
                <label>Geography*</label>
                <div class="modal_dropdown_wrapper">
                  <div class="modal_dropdown_header" @click="modalDropdownOpen.geography = !modalDropdownOpen.geography">
                    <span class="modal_dropdown_text">{{ displayLocationValue(formData.geography, '--Geography--') }}</span>
                    <div class="modal_dropdown_arrow" :class="{ open: modalDropdownOpen.geography }"></div>
                  </div>
                  <div v-if="modalDropdownOpen.geography" class="modal_dropdown_options">
                    <div class="modal_dropdown_search">
                      <input 
                        type="text" 
                        v-model="modalDropdownSearch.geography" 
                        placeholder="Search..."
                        @click.stop
                        class="modal_dropdown_search_input"
                      />
                    </div>
                    <div 
                      class="modal_dropdown_option" 
                      v-for="option in modalFilteredGeography" 
                      :key="option" 
                      @click="formData.geography = option; modalDropdownOpen.geography = false"
                    >
                      {{ option }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="form_group">
                <label>Province*</label>
                <div class="modal_dropdown_wrapper">
                  <div class="modal_dropdown_header" @click="modalDropdownOpen.province = !modalDropdownOpen.province">
                    <span class="modal_dropdown_text">{{ displayLocationValue(formData.province, '--Province--') }}</span>
                    <div class="modal_dropdown_arrow" :class="{ open: modalDropdownOpen.province }"></div>
                  </div>
                  <div v-if="modalDropdownOpen.province" class="modal_dropdown_options">
                    <div class="modal_dropdown_search">
                      <input 
                        type="text" 
                        v-model="modalDropdownSearch.province" 
                        placeholder="Search..."
                        @click.stop
                        class="modal_dropdown_search_input"
                      />
                    </div>
                    <div 
                      class="modal_dropdown_option" 
                      v-for="option in modalFilteredProvince" 
                      :key="option" 
                      @click="formData.province = option; modalDropdownOpen.province = false"
                    >
                      {{ option }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="form_group">
              <label>Email</label>
              <input type="email" v-model="formData.email" />
            </div>
            
            <div class="form_group">
              <label>Phone Number</label>
              <input type="tel" v-model="formData.phoneNumber" />
            </div>
            
            <div class="form_group">
              <label>Details</label>
              <textarea class="textarea_lg" v-model="formData.details" rows="4"></textarea>
            </div>
            
            <!-- Public Toggle -->
            <div class="public_toggle">
              <label>Public</label>
              <div class="toggle_switch" :class="{ active: formData.isPublic }" @click="formData.isPublic = !formData.isPublic">
                <div class="toggle_slider"></div>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="modal_actions">
              <button class="btn_cancel" @click="closeModal">Cancel</button>
              <button class="btn_save" @click="saveOrganization">Save</button>
            </div>
          </div>
          
          <!-- Review Tab -->
          <div v-if="state.activeTab === 'review'" class="review_tab">
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
            <div class="form_group">
              <label>Job Position *</label>
              <input 
                type="text" 
                v-model="reviewData.jobPosition" 
                placeholder="Enter job position"
              />
            </div>
            
            <!-- Review Text -->
            <div class="form_group full_width">
              <label>Review *</label>
              <textarea 
                class="textarea_lg"
                v-model="reviewData.review" 
                placeholder="Write your review here..."
                rows="6"
              ></textarea>
            </div>
            
            <!-- Action Buttons -->
            <div class="modal_actions">
              <button class="btn_cancel" @click="closeModal">Cancel</button>
              <button class="btn_save" @click="saveReview">Save</button>
            </div>
          </div>
          
          <!-- MOU Tab -->
          <div v-if="state.activeTab === 'mou'" class="mou_tab">
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
            <div v-if="mouPreviewUrl" class="mou_document_preview">
              <img v-if="mouData.mouFile?.type?.startsWith('image/')" :src="mouPreviewUrl" alt="MOU Preview" />
              <div v-else class="document_placeholder">
                <div class="doc_icon"></div>
                <span>{{ mouData.mouFile?.name }}</span>
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

            <div class="publish_toggle mou_publish">
              <label>Publish MOU</label>
              <div class="toggle_switch" :class="{ active: mouData.publishMOU }" @click="mouData.publishMOU = !mouData.publishMOU">
                <div class="toggle_slider"></div>
              </div>
            </div>

            <div class="modal_actions mou_actions">
              <button class="btn_cancel" @click="closeModal">Cancel</button>
              <button class="btn_save" @click="saveMOU">Save</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="delete_modal_overlay" @mousedown.self="handleDeleteOverlayMouseDown" @mouseup.self="handleDeleteOverlayMouseUp">
      <div class="delete_modal_container">
        <div class="modal_header">
          <h3>Confirm Delete</h3>
        </div>
        
        <div class="modal_body">
          <p>Are you sure you want to delete this organization?</p>
          <div class="organization_info">
            <strong>{{ selectedOrganization?.name }}</strong>
          </div>
        </div>
        
        <div class="modal_actions">
          <button class="cancel_btn" @click="cancelDelete">Cancel</button>
          <button class="confirm_delete_btn" @click="confirmDelete">Delete</button>
        </div>
      </div>
    </div>
    
    <!-- Import CSV/Excel Modal -->
    <div v-if="showImportModal" class="modal_overlay" @mousedown.self="handleImportOverlayMouseDown" @mouseup.self="handleImportOverlayMouseUp">
      <div class="import_modal">
        <h2 class="modal_title">Import Organizations</h2>
        <div class="form_divider"></div>
        <p class="supported_formats">Supported formats: CSV, XLSX, XLS</p>
        
        <div class="file_upload_section">
          <input 
            type="file" 
            accept=".csv,.xlsx,.xls" 
            @change="handleImportFile"
            ref="importFileInput"
            style="display: none;"
          />
          <button class="btn_choose_file" @click="($refs.importFileInput as HTMLInputElement).click()">
            Choose File
          </button>
          <span class="file_name" v-if="importFile">{{ importFile.name }}</span>
          <span class="file_name" v-else>No file selected</span>
        </div>
        
        <div v-if="importResults" class="import_results">
          <p class="results_summary">
            <strong>Import Results:</strong> 
            {{ importResults.success.length }} succeeded, 
            {{ importResults.failed.length }} failed
          </p>
          <div v-if="importResults.failed.length > 0" class="failed_items">
            <p><strong>Failed rows:</strong></p>
            <div style="max-height: 300px; overflow-y: auto;">
              <ul>
                <li v-for="fail in importResults.failed" :key="fail.row" style="margin-bottom: 8px;">
                  <strong>Row {{ fail.row }}:</strong> {{ fail.error }}
                  <div v-if="fail.data" style="font-size: 0.85em; color: #666; margin-left: 20px;">
                    Data: {{ JSON.stringify(fail.data).substring(0, 100) }}...
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div v-if="importResults.success.length > 0" class="success_items" style="margin-top: 10px;">
            <p><strong>Successfully imported:</strong></p>
            <ul>
              <li v-for="success in importResults.success.slice(0, 5)" :key="success.row">
                Row {{ success.row }}: {{ success.name }}
              </li>
              <li v-if="importResults.success.length > 5" style="color: #666;">
                ... and {{ importResults.success.length - 5 }} more
              </li>
            </ul>
          </div>
        </div>
        
        <div class="modal_actions">
          <button class="btn_cancel" @click="showImportModal = false; importFile = null; importResults = null">Cancel</button>
          <button class="btn_save" @click="submitImport" :disabled="!importFile">Import</button>
        </div>
      </div>
    </div>
    
    <!-- Notification Modal -->
    <NotificationModal 
      :show="showNotificationModal"
      :message="notificationMessage"
      :type="notificationType"
      @close="showNotificationModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, reactive } from 'vue'
import { useRouter } from 'vue-router'
import AdminNavbar from '../components/AdminNavbar.vue'
import NotificationModal from '../components/NotificationModal.vue'
import Pagination from '../components/Pagination.vue'
import { organizationAPI, mouAPI, reviewAPI, checkTokenValidity, BACKEND_URL } from '../services/api'

// ===========================
// REACTIVE STATE MANAGEMENT
// ===========================
// Router instance
const router = useRouter()

// Reactive state management
const state = reactive({
  loading: false,
  error: null as string | null,
  currentPage: 1,
  itemsPerPage: 5,
  showAddModal: false,
  activeTab: 'organization' as 'organization' | 'review' | 'mou',
  editingOrgId: null as string | null
})

// Search and filter data
const searchText = ref('')
const currentLanguage = ref<'EN' | 'TH'>((localStorage.getItem('admin_language') as 'EN' | 'TH') || 'EN')

const text = (english: string, thai: string) => currentLanguage.value === 'TH' ? thai : english

const setLanguage = (language: 'EN' | 'TH') => {
  currentLanguage.value = language
  localStorage.setItem('admin_language', language)
}

const showDeleteModal = ref(false)
const showNotificationModal = ref(false)
const showImportModal = ref(false)
const importFile = ref<File | null>(null)
const importResults = ref<any>(null)
const IMPORT_MAX_FILE_SIZE = 25 * 1024 * 1024
const IMPORT_ALLOWED_EXTENSIONS = ['.csv', '.xlsx', '.xls']
const IMPORT_ALLOWED_MIME_TYPES = [
  'text/csv',
  'application/csv',
  'text/plain',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/octet-stream'
]
const notificationMessage = ref('')
const notificationType = ref<'success' | 'error' | 'warning'>('success')
const selectedOrganization = ref<any>(null)
const logoPreviewUrl = ref<string | null>(null)
const mouPreviewUrl = ref<string | null>(null)
const dropdowns = ref({
  orgType: false,
  industryCat: false,
  country: false,
  geography: false,
  province: false
})

// Search text for each dropdown
const dropdownSearch = ref({
  orgType: '',
  industryCat: '',
  country: '',
  geography: '',
  province: ''
})

// Filter selections
const selectedFilters = reactive({
  orgType: 'All',
  industryCat: 'All',
  country: 'All',
  geography: 'All',
  province: 'All'
})

// Dropdown options - match backend values
const orgTypeOptions = [
  { value: 'private company', label: 'Private Company' },
  { value: 'Government', label: 'Government' },
  { value: 'Oversea', label: 'Oversea' },
  { value: 'MFU', label: 'MFU' }
]
const industryCatOptions = [
  'All', 
  'School of Applied Digital Technology',
  'Agriculture and Food Products',
  'Automotive and Transportation Equipment',
  'Banking, Finance and Insurance',
  'Business Services',
  'Energy',
  'Healthcare',
  'Information and Communication Technology',
  'Manufacturing and Industrial Products',
  'Mining and Metal Products',
  'Petrochemicals and Chemicals',
  'Textile and Garments',
  'Tourism and Hospitality',
  'Trading and Distribution',
  'Transportation and Logistics',
  'Utilities'
]
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

// Thai to English mapping
const thaiToEnglishMap: Record<string, string> = {
  // Countries
  'ไทย': 'Thailand',
  'จีน': 'China',
  'ไต้หวัน': 'Taiwan',
  'สหรัฐอเมริกา': 'USA',
  'ญี่ปุ่น': 'Japan',
  
  // Geography/Regions
  'ภาคเหนือ': 'Northern Region',
  'ภาคกลาง': 'Central Region',
  'ภาคใต้': 'Southern Region',
  'ภาคตะวันออกเฉียงเหนือ': 'Northeastern Region',
  'ภาคตะวันออก': 'Eastern Region',
  'ภาคตะวันตก': 'Western Region',
  
  // Business Categories / Industry
  'เทคโนโลยีดิจิทัลประยุกต์': 'School of Applied Digital Technology',
  'การเกษตรและผลิตภัณฑ์อาหาร': 'Agriculture and Food Products',
  'ยานยนต์และอุปกรณ์การขนส่ง': 'Automotive and Transportation Equipment',
  'ธนาคาร การเงิน และการประกันภัย': 'Banking, Finance and Insurance',
  'บริการธุรกิจ': 'Business Services',
  'พลังงาน': 'Energy',
  'การดูแลสุขภาพ': 'Healthcare',
  'เทคโนโลยีสารสนเทศและการสื่อสาร': 'Information and Communication Technology',
  'การผลิตและผลิตภัณฑ์อุตสาหกรรม': 'Manufacturing and Industrial Products',
  'การทำเ광และผลิตภัณฑ์โลหะ': 'Mining and Metal Products',
  'ปิโตรเคมีและเคมีภัณฑ์': 'Petrochemicals and Chemicals',
  'สิ่งทอและเครื่องนุ่งห่ม': 'Textile and Garments',
  'การท่องเที่ยวและการบริการ': 'Tourism and Hospitality',
  'การค้าและการจัดจำหน่าย': 'Trading and Distribution',
  'การขนส่งและโลจิสติกส์': 'Transportation and Logistics',
  'สาธารณูปโภค': 'Utilities',
  // Government and organizations
  'หน่วยงานราชการ': 'Government',
  'ราชการ': 'Government',
  'รัฐวิสาหกิจ': 'Government',
  'องค์การมหาชน': 'Government',
  'องค์กรปกครองส่วนท้องถิ่น': 'Government',
  // Short forms and variations
  'เทคโนโลยีสารสนเทศ': 'Information and Communication Technology',
  'การท่องเที่ยว': 'Tourism and Hospitality',
  'การเกษตร': 'Agriculture and Food Products',
  'การผลิต': 'Manufacturing and Industrial Products',
  'การศึกษา': 'School of Applied Digital Technology',
  'การค้า': 'Trading and Distribution',
  'ธนาคาร': 'Banking, Finance and Insurance',
  'การเงิน': 'Banking, Finance and Insurance',
  'โรงแรม': 'Tourism and Hospitality',
  'ร้านอาหาร': 'Tourism and Hospitality',
  'โรงพยาบาล': 'Healthcare',
  'คลินิก': 'Healthcare',
  'ขนส่ง': 'Transportation and Logistics',
  'โลจิสติกส์': 'Transportation and Logistics',
  'อุตสาหกรรม': 'Manufacturing and Industrial Products',
  'เทคโนโลยี': 'Information and Communication Technology',
  'ไอที': 'Information and Communication Technology',
  'คอมพิวเตอร์': 'Information and Communication Technology',
  'ซอฟต์แวร์': 'Information and Communication Technology',
  'ก่อสร้าง': 'Manufacturing and Industrial Products',
  'อสังหาริมทรัพย์': 'Business Services',
  'สื่อสารมวลชน': 'Information and Communication Technology',
  'โฆษณา': 'Business Services',
  'การตลาด': 'Business Services',
  'ประกันภัย': 'Banking, Finance and Insurance',
  'หลักทรัพย์': 'Banking, Finance and Insurance',
  'บัญชี': 'Business Services',
  'กฎหมาย': 'Business Services',
  'ที่ปรึกษา': 'Business Services',
  'วิศวกรรม': 'Manufacturing and Industrial Products',
  'สถาปัตยกรรม': 'Manufacturing and Industrial Products',
  'การพิมพ์': 'Manufacturing and Industrial Products',
  'บรรจุภัณฑ์': 'Manufacturing and Industrial Products',
  'เภสัชกรรม': 'Healthcare',
  'การแพทย์': 'Healthcare',
  'สปา': 'Tourism and Hospitality',
  'ความงาม': 'Business Services',
  'แฟชั่น': 'Textile and Garments',
  'เสื้อผ้า': 'Textile and Garments',
  'อาหาร': 'Agriculture and Food Products',
  'เครื่องดื่ม': 'Agriculture and Food Products',
  'ภัตตาคาร': 'Tourism and Hospitality',
  'โรงงาน': 'Manufacturing and Industrial Products',
  'ซูเปอร์มาร์เก็ต': 'Trading and Distribution',
  'ค้าปลีก': 'Trading and Distribution',
  'ค้าส่ง': 'Trading and Distribution',
  'จำหน่าย': 'Trading and Distribution',
  'ขายส่ง': 'Trading and Distribution',
  'ขายปลีก': 'Trading and Distribution',
  'ไฟฟ้า': 'Energy',
  'น้ำประปา': 'Utilities',
  'ก๊าซ': 'Energy',
  'พลังงานทดแทน': 'Energy',
  'โซล่าร์เซลล์': 'Energy',
  
  // Provinces
  'เชียงราย': 'Chiang Rai',
  'เชียงใหม่': 'Chiang Mai',
  'กรุงเทพมหานคร': 'Bangkok',
  'นนทบุรี': 'Nonthaburi',
  'ปทุมธานี': 'Pathum Thani',
  'สมุทรปราการ': 'Samut Prakan',
  'ภูเก็ต': 'Phuket',
  'ชลบุรี': 'Chon Buri',
  'ระยอง': 'Rayong',
  'ขอนแก่น': 'Khon Kaen',
  'นครราชสีมา': 'Nakhon Ratchasima',
  'อุบลราชธานี': 'Ubon Ratchathani',
  'สงขลา': 'Songkhla',
  'ลำปาง': 'Lampang',
  'ลำพูน': 'Lamphun',
  'แม่ฮ่องสอน': 'Mae Hong Son',
  'น่าน': 'Nan',
  'พะเยา': 'Phayao',
  'แพร่': 'Phrae',
  'อุตรดิตถ์': 'Uttaradit',
  'กำแพงเพชร': 'Kamphaeng Phet',
  'พิษณุโลก': 'Phitsanulok',
  'เพชรบูรณ์': 'Phetchabun',
  'พิจิตร': 'Phichit',
  'สุโขทัย': 'Sukhothai',
  'ตาก': 'Tak',
  'อุทัยธานี': 'Uthai Thani',
  'นครสวรรค์': 'Nakhon Sawan',
  'ชัยนาท': 'Chai Nat',
  'ลพบุรี': 'Lop Buri',
  'สระบุรี': 'Saraburi',
  'สิงห์บุรี': 'Sing Buri',
  'อ่างทอง': 'Ang Thong',
  'พระนครศรีอยุธยา': 'Phra Nakhon Si Ayutthaya',
  'สุพรรณบุรี': 'Suphan Buri',
  'กาญจนบุรี': 'Kanchanaburi',
  'นครปฐม': 'Nakhon Pathom',
  'ราชบุรี': 'Ratchaburi',
  'สมุทรสาคร': 'Samut Sakhon',
  'สมุทรสงคราม': 'Samut Songkhram',
  'เพชรบุรี': 'Phetchaburi',
  'ประจวบคีรีขันธ์': 'Prachuap Khiri Khan',
  'ฉะเชิงเทรา': 'Chachoengsao',
  'จันทบุรี': 'Chanthaburi',
  'ตราด': 'Trat',
  'ปราจีนบุรี': 'Prachin Buri',
  'นครนายก': 'Nakhon Nayok',
  'สระแก้ว': 'Sa Kaeo',
  'กาฬสินธุ์': 'Kalasin',
  'มหาสารคาม': 'Maha Sarakham',
  'ร้อยเอ็ด': 'Roi Et',
  'สกลนคร': 'Sakon Nakhon',
  'หนองคาย': 'Nong Khai',
  'หนองบัวลำภู': 'Nong Bua Lam Phu',
  'เลย': 'Loei',
  'อุดรธานี': 'Udon Thani',
  'บึงกาฬ': 'Bueng Kan',
  'มุกดาหาร': 'Mukdahan',
  'นครพนม': 'Nakhon Phanom',
  'ยโสธร': 'Yasothon',
  'ศรีสะเกษ': 'Si Sa Ket',
  'สุรินทร์': 'Surin',
  'ชัยภูมิ': 'Chaiyaphum',
  'บุรีรัมย์': 'Buri Ram',
  'อำนาจเจริญ': 'Amnat Charoen',
  'กระบี่': 'Krabi',
  'ชุมพร': 'Chumphon',
  'นครศรีธรรมราช': 'Nakhon Si Thammarat',
  'พังงา': 'Phang Nga',
  'พัทลุง': 'Phatthalung',
  'ระนอง': 'Ranong',
  'สตูล': 'Satun',
  'สุราษฎร์ธานี': 'Surat Thani',
  'ตรัง': 'Trang',
  'ปัตตานี': 'Pattani',
  'ยะลา': 'Yala',
  'นราธิวาส': 'Narathiwat'
}

// Function to normalize value (handle both Thai and English)
const normalizeLocationValue = (value: string): string => {
  if (!value) return ''
  // If it's Thai, convert to English
  return thaiToEnglishMap[value] || value
}

// Function to display value (show English but accept Thai)
const displayLocationValue = (value: string, placeholder: string): string => {
  if (!value) return placeholder
  return normalizeLocationValue(value)
}

// Filtered options based on search
const filteredIndustryCat = computed(() => {
  if (!dropdownSearch.value.industryCat) return industryCatOptions
  return industryCatOptions.filter(option => 
    option.toLowerCase().includes(dropdownSearch.value.industryCat.toLowerCase())
  )
})

const filteredCountry = computed(() => {
  if (!dropdownSearch.value.country) return countryOptions
  return countryOptions.filter(option => 
    option.toLowerCase().includes(dropdownSearch.value.country.toLowerCase())
  )
})

const filteredGeography = computed(() => {
  if (!dropdownSearch.value.geography) return geographyOptions
  return geographyOptions.filter(option => 
    option.toLowerCase().includes(dropdownSearch.value.geography.toLowerCase())
  )
})

const filteredProvince = computed(() => {
  if (!dropdownSearch.value.province) return provinceOptions
  return provinceOptions.filter(option => 
    option.toLowerCase().includes(dropdownSearch.value.province.toLowerCase())
  )
})

// Organizations data from backend
const allOrganizations = ref<any[]>([])
const mouDataMap = ref<Record<string, any>>({})
const existingReviews = ref<any[]>([])

// Compute organization type counts
const organizationTypeCounts = computed(() => {
  const counts: Record<string, number> = {
    'private company': 0,
    'Government': 0,
    'Oversea': 0,
    'MFU': 0
  }
  
  allOrganizations.value.forEach(org => {
    if (org.organization_type && counts.hasOwnProperty(org.organization_type)) {
      counts[org.organization_type]++
    }
  })
  
  return counts
})

// Computed properties for reactive filtering
const filteredOrganizations = computed(() => {
  let filtered = allOrganizations.value
  
  // กรองเอาเฉพาะข้อมูลที่มีครบ (มี province และไม่เป็น 'N/A')
  filtered = filtered.filter(org => {
    const hasProvince = org.province && org.province !== 'N/A'
    const hasName = org.name && 
                    org.name !== 'Unknown' && 
                    org.name !== 'หน่วยงานราชการ' &&
                    org.name !== 'บริษัท' &&
                    org.name.trim() !== ''
    return hasProvince && hasName
  })
  
  // Search filter
  if (searchText.value.trim()) {
    const search = searchText.value.toLowerCase()
    filtered = filtered.filter(org => 
      org.name.toLowerCase().includes(search) ||
      org.category.toLowerCase().includes(search) ||
      org.province.toLowerCase().includes(search)
    )
  }
  
  // Dropdown filters
  if (selectedFilters.orgType !== 'All') {
    filtered = filtered.filter(org => org.category === selectedFilters.orgType)
  }
  
  if (selectedFilters.province !== 'All') {
    filtered = filtered.filter(org => org.province === selectedFilters.province)
  }
  
  return filtered
})

// Paginated organizations
const paginatedOrganizations = computed(() => {
  const start = (state.currentPage - 1) * state.itemsPerPage
  const end = start + state.itemsPerPage
  return filteredOrganizations.value.slice(start, end)
})

// Pagination info
const totalPages = computed(() => 
  Math.ceil(filteredOrganizations.value.length / state.itemsPerPage)
)

const paginationInfo = computed(() => ({
  currentPage: state.currentPage,
  totalPages: totalPages.value,
  totalItems: filteredOrganizations.value.length,
  hasNext: state.currentPage < totalPages.value,
  hasPrev: state.currentPage > 1
}))

// Pagination computed properties
const visiblePages = computed(() => {
  const pages = []
  const total = paginationInfo.value.totalPages
  const current = state.currentPage
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...', total)
    } else if (current >= total - 3) {
      pages.push(1, '...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1, '...', current - 1, current, current + 1, '...', total)
    }
  }
  
  return pages
})

const handlePageChange = async (page: number) => {
  if (page >= 1 && page <= paginationInfo.value.totalPages && !state.loading) {
    state.loading = true
    try {
      state.currentPage = page
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 100))
    } finally {
      state.loading = false
    }
  }
}

// Watchers for reactive updates
watch(searchText, () => {
  state.currentPage = 1 // Reset to first page when searching
})

watch(selectedFilters, () => {
  state.currentPage = 1 // Reset to first page when filtering
}, { deep: true })

// Methods
const toggleDropdown = (dropdown: string) => {
  const isOpening = !dropdowns.value[dropdown as keyof typeof dropdowns.value]
  
  // Close other dropdowns and clear their search
  Object.keys(dropdowns.value).forEach(key => {
    if (key !== dropdown) {
      dropdowns.value[key as keyof typeof dropdowns.value] = false
      dropdownSearch.value[key as keyof typeof dropdownSearch.value] = ''
    }
  })
  
  // Toggle current dropdown
  dropdowns.value[dropdown as keyof typeof dropdowns.value] = isOpening
  
  // Clear search if closing
  if (!isOpening) {
    dropdownSearch.value[dropdown as keyof typeof dropdownSearch.value] = ''
  }
}

const selectOption = (dropdown: string, option: string) => {
  selectedFilters[dropdown as keyof typeof selectedFilters] = option
  dropdowns.value[dropdown as keyof typeof dropdowns.value] = false
}

const resetFilters = () => {
  searchText.value = ''
  Object.keys(selectedFilters).forEach(key => {
    selectedFilters[key as keyof typeof selectedFilters] = 'All'
  })
  state.currentPage = 1
}

const searchOrganizations = () => {
  // Search is reactive via computed property
  console.log('Searching:', filteredOrganizations.value.length, 'results')
}

// Modal form data
const formData = reactive<Record<string, any>>({
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

// Modal dropdown search states
const modalDropdownSearch = ref({
  country: '',
  geography: '',
  province: '',
  industryCategory: ''
})

const modalDropdownOpen = ref({
  country: false,
  geography: false,
  province: false,
  industryCategory: false
})

// Filtered options for modal dropdowns
const modalFilteredCountry = computed(() => {
  const allCountryOptions = [
    ...countryOptions,
    'ไทย', 'จีน', 'ไต้หวัน', 'สหรัฐอเมริกา', 'ญี่ปุ่น'
  ]
  if (!modalDropdownSearch.value.country) return allCountryOptions
  return allCountryOptions.filter(option => 
    option.toLowerCase().includes(modalDropdownSearch.value.country.toLowerCase())
  )
})

const modalFilteredGeography = computed(() => {
  const geoOptions = [
    ...geographyOptions,
    'ภาคเหนือ', 'ภาคกลาง', 'ภาคใต้', 'ภาคตะวันออกเฉียงเหนือ', 'ภาคตะวันออก', 'ภาคตะวันตก'
  ]
  if (!modalDropdownSearch.value.geography) return geoOptions
  return geoOptions.filter(option => 
    option.toLowerCase().includes(modalDropdownSearch.value.geography.toLowerCase())
  )
})

const modalFilteredProvince = computed(() => {
  const allProvinceOptions = [
    ...provinceOptions,
    'เชียงราย', 'เชียงใหม่', 'กรุงเทพมหานคร', 'นนทบุรี', 'ปทุมธานี', 'สมุทรปราการ',
    'ภูเก็ต', 'ชลบุรี', 'ระยอง', 'ขอนแก่น', 'นครราชสีมา', 'อุบลราชธานี', 'สงขลา',
    'ลำปาง', 'ลำพูน', 'แม่ฮ่องสอน', 'น่าน', 'พะเยา', 'แพร่', 'อุตรดิตถ์'
  ]
  if (!modalDropdownSearch.value.province) return allProvinceOptions
  return allProvinceOptions.filter(option => 
    option.toLowerCase().includes(modalDropdownSearch.value.province.toLowerCase())
  )
})

const modalFilteredIndustryCategory = computed(() => {
  const allIndustryCategoryOptions = [
    'School of Applied Digital Technology',
    'Agriculture and Food Products',
    'Automotive and Transportation Equipment',
    'Banking, Finance and Insurance',
    'Business Services',
    'Energy',
    'Healthcare',
    'Information and Communication Technology',
    'Manufacturing and Industrial Products',
    'Mining and Metal Products',
    'Petrochemicals and Chemicals',
    'Textile and Garments',
    'Tourism and Hospitality',
    'Trading and Distribution',
    'Transportation and Logistics',
    'Utilities',
    // Thai options
    'เทคโนโลยีดิจิทัลประยุกต์',
    'การเกษตรและผลิตภัณฑ์อาหาร',
    'ยานยนต์และอุปกรณ์การขนส่ง',
    'ธนาคาร การเงิน และการประกันภัย',
    'บริการธุรกิจ',
    'พลังงาน',
    'การดูแลสุขภาพ',
    'เทคโนโลยีสารสนเทศและการสื่อสาร',
    'การผลิตและผลิตภัณฑ์อุตสาหกรรม',
    'การทำเ광และผลิตภัณฑ์โลหะ',
    'ปิโตรเคมีและเคมีภัณฑ์',
    'สิ่งทอและเครื่องนุ่งห่ม',
    'การท่องเที่ยวและการบริการ',
    'การค้าและการจัดจำหน่าย',
    'การขนส่งและโลจิสติกส์',
    'สาธารณูปโภค',
    'เทคโนโลยีสารสนเทศ',
    'การท่องเที่ยว',
    'การเกษตร',
    'การผลิต',
    'การศึกษา',
    'การค้า'
  ]
  if (!modalDropdownSearch.value.industryCategory) return allIndustryCategoryOptions
  return allIndustryCategoryOptions.filter(option => 
    option.toLowerCase().includes(modalDropdownSearch.value.industryCategory.toLowerCase())
  )
})

// Review form data
const reviewData = reactive({
  jobPosition: '',
  review: ''
})
const currentReviewIndex = ref(0)

// MOU form data
const mouData = reactive({
  mouFile: null as File | null,
  startDate: '',
  endDate: '',
  publishMOU: false
})

// Track mouse down position for modal overlay
let mouseDownTarget: EventTarget | null = null

// Handle overlay mousedown
const handleOverlayMouseDown = (event: MouseEvent) => {
  // Only track if clicking on the overlay itself (not modal content)
  if (event.target === event.currentTarget) {
    mouseDownTarget = event.target
  } else {
    mouseDownTarget = null
  }
}

// Handle overlay mouseup
const handleOverlayMouseUp = (event: MouseEvent) => {
  // Only close if both mousedown and mouseup happened on the overlay
  if (event.target === event.currentTarget && mouseDownTarget === event.target) {
    closeModal()
  }
  mouseDownTarget = null
}

// Modal methods
const closeModal = () => {
  state.showAddModal = false
  resetForm()
  
  // Clean up logo preview URL
  if (logoPreviewUrl.value) {
    URL.revokeObjectURL(logoPreviewUrl.value)
    logoPreviewUrl.value = null
  }
  
  // Clean up MOU preview URL
  if (mouPreviewUrl.value && mouPreviewUrl.value !== 'document') {
    URL.revokeObjectURL(mouPreviewUrl.value)
  }
  mouPreviewUrl.value = null
}

const resetForm = () => {
  Object.keys(formData).forEach(key => {
    if (key === 'isPublic') {
      formData[key] = false
    } else if (key === 'logo') {
      formData[key] = null
    } else {
      formData[key] = ''
    }
  })
  
  // Reset review data
  reviewData.jobPosition = ''
  reviewData.review = ''
  
  // Reset MOU data
  mouData.mouFile = null
  mouData.startDate = ''
  mouData.endDate = ''
  mouData.publishMOU = false
  
  // Reset existing reviews
  existingReviews.value = []
  currentReviewIndex.value = 0
}

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
    notificationMessage.value = 'Review deleted successfully!'
    notificationType.value = 'success'
    showNotificationModal.value = true
  } catch (error: any) {
    console.error('Error deleting review:', error)
    notificationMessage.value = 'Failed to delete review'
    notificationType.value = 'error'
    showNotificationModal.value = true
  }
}

const switchTab = (tab: 'organization' | 'review' | 'mou') => {
  state.activeTab = tab
}

// Main function to save all data from all tabs
const saveAllData = async () => {
  // Validate required fields for organization
  if (!formData.organizationNameEN || !formData.organizationNameTH || !formData.email || !formData.organizationType) {
    state.error = 'Please fill in all required fields'
    notificationMessage.value = 'Please fill in all required fields: Organization Name (EN/TH), Email, and Organization Type'
    notificationType.value = 'warning'
    showNotificationModal.value = true
    return
  }

  state.loading = true
  const savedItems: string[] = []
  const errors: string[] = []
  
  try {
    // Step 1: Save Organization Data
    const formDataToSend = new FormData()
    formDataToSend.append('name_en', formData.organizationNameEN)
    formDataToSend.append('name_th', formData.organizationNameTH)
    formDataToSend.append('address_en', formData.addressEN)
    formDataToSend.append('address_th', formData.addressTH)
    formDataToSend.append('organization_type', formData.organizationType)
    
    console.log('Saving organization with type:', formData.organizationType)
    
    if (formData.industryCategory) {
      formDataToSend.append('industry_category_id', formData.industryCategory)
    }
    if (formData.country) {
      formDataToSend.append('country_id', formData.country)
    }
    if (formData.geography) {
      formDataToSend.append('geography_id', formData.geography)
    }
    if (formData.province) {
      formDataToSend.append('province_id', formData.province)
    }
    
    formDataToSend.append('email', formData.email)
    formDataToSend.append('phone_number', formData.phoneNumber)
    formDataToSend.append('details', formData.details)
    formDataToSend.append('is_public', String(formData.isPublic))

    if (formData.logo) {
      formDataToSend.append('logo', formData.logo)
    }

    let result
    if (state.editingOrgId) {
      result = await organizationAPI.update(state.editingOrgId, formDataToSend)
    } else {
      result = await organizationAPI.create(formDataToSend)
      state.editingOrgId = result.data.data._id
    }
    savedItems.push('Organization')
    console.log('Organization saved successfully')

    const orgId = state.editingOrgId || result.data.data._id

    // Step 2: Save Review Data (if provided)
    if (reviewData.jobPosition && reviewData.review) {
      try {
        const reviewFormData = new FormData()
        reviewFormData.append('organization_id', orgId)
        reviewFormData.append('job_position', reviewData.jobPosition)
        reviewFormData.append('review_text', reviewData.review)
        
        await reviewAPI.create(reviewFormData)
        savedItems.push('Review')
        console.log('Review saved successfully:', reviewData)
      } catch (reviewError: any) {
        console.error('Review save failed:', reviewError)
        errors.push('Review')
      }
    }

    // Step 3: Save MOU Data (if provided)
    if (mouData.mouFile && mouData.startDate && mouData.endDate) {
      if (new Date(mouData.endDate) <= new Date(mouData.startDate)) {
        errors.push('MOU (End date must be after start date)')
      } else {
        try {
          await saveMOUData(orgId)
          savedItems.push('MOU')
          console.log('MOU saved successfully')
        } catch (mouError: any) {
          console.error('MOU save failed:', mouError)
          errors.push('MOU')
        }
      }
    }

    // Refresh the organizations list after save
    await fetchOrganizations()
    
    // Prepare notification message
    if (errors.length === 0) {
      notificationMessage.value = `${savedItems.join(', ')} saved successfully!`
      notificationType.value = 'success'
    } else {
      notificationMessage.value = `${savedItems.join(', ')} saved, but ${errors.join(', ')} failed.`
      notificationType.value = 'warning'
    }
    
    state.error = null
    showNotificationModal.value = true
    
    setTimeout(() => {
      state.editingOrgId = null
      closeModal()
    }, 1500)
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to save data'
    state.error = errorMessage
    console.error('Save error:', error)
    console.error('Error response data:', error.response?.data)
    console.error('Error details:', JSON.stringify(error.response?.data, null, 2))
    notificationMessage.value = `Error: ${errorMessage}`
    notificationType.value = 'error'
    showNotificationModal.value = true
  } finally {
    state.loading = false
  }
}

// Wrapper functions for each tab's Save button
const saveOrganization = async () => {
  await saveAllData()
}

// Fetch organizations from backend
const fetchOrganizations = async () => {  
  try {
    // Check token validity before making request
    if (!checkTokenValidity()) {
      return
    }
    
    const response = await organizationAPI.getAll({ limit: 100, public: 'false' })
    
    // Fetch all MOUs
    const mouResponse = await mouAPI.getAll({ limit: 100 })
    const allMOUs = mouResponse.data.data || []
    
    // Create MOU map for quick lookup
    const mouMap: Record<string, any> = {}
    allMOUs.forEach((mou: any) => {
      const orgId = typeof mou.organization_id === 'object' 
        ? mou.organization_id?._id 
        : mou.organization_id
      if (orgId) {
        mouMap[String(orgId)] = mou
      }
    })
    mouDataMap.value = mouMap
    
    allOrganizations.value = response.data.data.map((item: any) => {
      const hasMOU = !!mouMap[item._id]
      
      // Normalize all Thai values to English
      const normalizedProvince = normalizeLocationValue(item.province_id || 'N/A')
      const normalizedCountry = normalizeLocationValue(item.country_id || '')
      const normalizedGeography = normalizeLocationValue(item.geography_id || '')
      const normalizedCategory = normalizeLocationValue(item.industry_category_id || '')
      
      const org = {
        id: item._id,
        status: item.is_public ? 'active' : 'inactive',
        name: item.name_en || item.name_th || 'Unknown',
        category: item.organization_type || 'individual',
        province: normalizedProvince,
        country: normalizedCountry,
        geography: normalizedGeography,
        industryCategory: normalizedCategory,
        createdDate: item.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : 'N/A',
        editedDate: item.updatedAt ? new Date(item.updatedAt).toISOString().split('T')[0] : 'N/A',
        hasMOU: hasMOU,
        rawData: item // Keep full data for reference
      }
      console.log(`Org ${org.name}: is_public=${item.is_public}, status=${org.status}, hasMOU=${hasMOU}`)
      return org
    })
    console.log('Organizations loaded:', allOrganizations.value.length, 'items')
  } catch (error: any) {
    state.error = error.response?.data?.message || 'Failed to load organizations'
    console.error('Loading error:', error)
  }
}

const handleLogoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    formData.logo = target.files[0]
    
    // Create preview URL
    if (logoPreviewUrl.value) {
      URL.revokeObjectURL(logoPreviewUrl.value)
    }
    logoPreviewUrl.value = URL.createObjectURL(target.files[0])
  }
}

const handleMOUUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    mouData.mouFile = target.files[0]
    
    // Create preview URL for images
    if (mouPreviewUrl.value) {
      URL.revokeObjectURL(mouPreviewUrl.value)
    }
    
    if (target.files[0].type.startsWith('image/')) {
      mouPreviewUrl.value = URL.createObjectURL(target.files[0])
    } else {
      // For non-image files, just set a flag
      mouPreviewUrl.value = 'document'
    }
  }
}

const saveReview = async () => {
  await saveAllData()
}

// Helper function to save MOU data
const saveMOUData = async (orgId: string) => {
  if (!mouData.mouFile) {
    throw new Error('No MOU file selected')
  }
  
  const formDataToSend = new FormData()
  
  // Get organization details for MOU
  const orgResponse = await organizationAPI.getById(orgId)
  const orgData = orgResponse.data.data
  
  formDataToSend.append('organization_name', orgData.name_en || orgData.name_th || 'Unknown')
  formDataToSend.append('organization_id', orgId)
  formDataToSend.append('start_date', mouData.startDate)
  formDataToSend.append('end_date', mouData.endDate)
  formDataToSend.append('status', mouData.publishMOU ? 'active' : 'inactive')
  formDataToSend.append('mou', mouData.mouFile)

  await mouAPI.create(formDataToSend)
  
  // Reset MOU form
  mouData.mouFile = null
  mouData.startDate = ''
  mouData.endDate = ''
  mouData.publishMOU = false
  
  // Clear preview
  if (mouPreviewUrl.value) {
    URL.revokeObjectURL(mouPreviewUrl.value)
    mouPreviewUrl.value = null
  }
}

const saveMOU = async () => {
  await saveAllData()
}

const viewOrganizationDetail = (id: string | number) => {
  router.push(`/admin/mou/${id}/more`)
}

const addOrganization = async () => {
  state.showAddModal = true
  state.activeTab = 'organization'
}

const editOrganization = async (id: string | number) => {
  state.loading = true
  try {
    // Fetch full organization data from backend
    const response = await organizationAPI.getById(id as string)
    const orgData = response.data.data
    
    // Pre-fill form with organization data
    formData.organizationNameEN = orgData.name_en || ''
    formData.organizationNameTH = orgData.name_th || ''
    formData.addressEN = orgData.address_en || ''
    formData.addressTH = orgData.address_th || ''
    formData.organizationType = orgData.organization_type || ''
    formData.industryCategory = orgData.industry_category_id || ''
    // Handle both ObjectId (old) and String (new) formats
    formData.country = typeof orgData.country_id === 'string' ? orgData.country_id : (orgData.country_id?.name_en || orgData.country_id?.name_th || '')
    formData.geography = typeof orgData.geography_id === 'string' ? orgData.geography_id : (orgData.geography_id?.name_en || orgData.geography_id?.name_th || '')
    formData.province = typeof orgData.province_id === 'string' ? orgData.province_id : (orgData.province_id?.name_en || orgData.province_id?.name_th || '')
    formData.email = orgData.email || ''
    formData.phoneNumber = orgData.phone_number || ''
    formData.details = orgData.details || ''
    formData.isPublic = orgData.is_public || false
    formData.logo = null // Reset logo
    
    // Load existing logo if available
    if (orgData.logo_path) {
      logoPreviewUrl.value = `${BACKEND_URL}${orgData.logo_path}`
    } else {
      logoPreviewUrl.value = null
    }

    // Load MOU data if exists
    const mouId = mouDataMap.value[id as string]
    if (mouId) {
      try {
        const mouResponse = await mouAPI.getById(mouId._id)
        const mouRecord = mouResponse.data.data
        
        // Extract YYYY-MM-DD from ISO datetime
        const extractDatePart = (dateString: string): string => {
          if (!dateString) return ''
          // Handle ISO format with time: "2026-04-19T00:00:00.000Z" -> "2026-04-19"
          if (dateString.includes('T')) {
            return dateString.split('T')[0]
          }
          // Already in YYYY-MM-DD format
          return dateString
        }
        
        mouData.startDate = extractDatePart(mouRecord.start_date)
        mouData.endDate = extractDatePart(mouRecord.end_date)
        mouData.publishMOU = mouRecord.is_published || false
        
        // Load MOU file preview if available
        if (mouRecord.mou_path) {
          if (mouRecord.mou_path.endsWith('.pdf')) {
            mouPreviewUrl.value = 'document' // Placeholder for PDF
          } else if (mouRecord.mou_path.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            mouPreviewUrl.value = `${BACKEND_URL}${mouRecord.mou_path}`
          }
        }
      } catch (mouError) {
        console.warn('Error loading MOU data:', mouError)
        // Continue even if MOU fails to load
      }
    } else {
      // No MOU for this organization, reset MOU form
      mouData.startDate = ''
      mouData.endDate = ''
      mouData.publishMOU = false
      mouPreviewUrl.value = null
    }
    
    state.editingOrgId = id as string
    
    // Fetch existing reviews
    await fetchExistingReviews(id as string)
    
    state.showAddModal = true
    state.activeTab = 'organization'
  } catch (error: any) {
    console.error('Error loading organization:', error)
    state.error = error.response?.data?.message || 'Failed to load organization data'
  } finally {
    state.loading = false
  }
}

const deleteOrganization = (id: number) => {
  const org = allOrganizations.value.find(o => o.id === id)
  if (org) {
    selectedOrganization.value = org
    showDeleteModal.value = true
  }
}

// Track mouse down for delete modal
let deleteMouseDownTarget: EventTarget | null = null

const handleDeleteOverlayMouseDown = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    deleteMouseDownTarget = event.target
  } else {
    deleteMouseDownTarget = null
  }
}

const handleDeleteOverlayMouseUp = (event: MouseEvent) => {
  if (event.target === event.currentTarget && deleteMouseDownTarget === event.target) {
    cancelDelete()
  }
  deleteMouseDownTarget = null
}

const cancelDelete = () => {
  showDeleteModal.value = false
  selectedOrganization.value = null
}

const confirmDelete = async () => {
  if (selectedOrganization.value) {
    state.loading = true
    try {
      // Call API to delete organization using rawData._id
      const orgId = selectedOrganization.value.rawData?._id || selectedOrganization.value.id
      await organizationAPI.delete(orgId)
      
      // Remove from local array after successful deletion
      const index = allOrganizations.value.findIndex(org => org.id === selectedOrganization.value.id)
      if (index > -1) {
        allOrganizations.value.splice(index, 1)
      }
      
      notificationMessage.value = 'Organization deleted successfully!'
      notificationType.value = 'success'
      showNotificationModal.value = true
    } catch (error: any) {
      console.error('Delete error:', error)
      const errorMsg = error.response?.data?.message || 'Failed to delete organization'
      notificationMessage.value = `Error: ${errorMsg}`
      notificationType.value = 'error'
      showNotificationModal.value = true
      state.error = errorMsg
    } finally {
      state.loading = false
      showDeleteModal.value = false
      selectedOrganization.value = null
    }
  }
}

const viewDocument = async (id: number) => {
  const org = allOrganizations.value.find(o => o.id === id)
  if (!org) return
  
  const orgId = String(org.rawData?._id || org.id)
  const mou = mouDataMap.value[orgId]
  
  if (mou && mou.mou_path) {
    const mouUrl = `${BACKEND_URL}${mou.mou_path}`
    window.open(mouUrl, '_blank')
  } else {
    notificationMessage.value = 'No MOU document available for this organization'
    notificationType.value = 'warning'
    showNotificationModal.value = true
  }
}

// Track mouse down for import modal
let importMouseDownTarget: EventTarget | null = null

const handleImportOverlayMouseDown = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    importMouseDownTarget = event.target
  } else {
    importMouseDownTarget = null
  }
}

const handleImportOverlayMouseUp = (event: MouseEvent) => {
  if (event.target === event.currentTarget && importMouseDownTarget === event.target) {
    showImportModal.value = false
  }
  importMouseDownTarget = null
}

const handleImportFile = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    
    // Validate file type
    const fileName = file.name.toLowerCase()
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'))
    const isValidExtension = IMPORT_ALLOWED_EXTENSIONS.includes(fileExtension)
    const isValidMimeType = !file.type || IMPORT_ALLOWED_MIME_TYPES.includes(file.type)
    
    if (!isValidExtension || !isValidMimeType) {
      notificationMessage.value = 'Invalid file type. Please upload a CSV or Excel file (.csv, .xlsx, .xls)'
      notificationType.value = 'error'
      showNotificationModal.value = true
      target.value = ''
      return
    }
    
    // Validate file size (max 10MB)
    if (file.size > IMPORT_MAX_FILE_SIZE) {
      notificationMessage.value = 'File size too large. Maximum 25MB allowed'
      notificationType.value = 'error'
      showNotificationModal.value = true
      target.value = ''
      return
    }
    
    importFile.value = file
    console.log('File selected:', file.name, 'Size:', (file.size / 1024).toFixed(2), 'KB')
  }
}

const submitImport = async () => {
  if (!importFile.value) {
    notificationMessage.value = 'Please select a file to import'
    notificationType.value = 'warning'
    showNotificationModal.value = true
    return
  }

  // Check token validity before import
  if (!checkTokenValidity()) {
    notificationMessage.value = 'Session expired. Please login again.'
    notificationType.value = 'error'
    showNotificationModal.value = true
    return
  }

  state.loading = true
  try {
    console.log('Starting import for file:', importFile.value.name)
    
    const formData = new FormData()
    formData.append('file', importFile.value)

    const response = await fetch(`${BACKEND_URL}/api/import/organizations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
      console.error('Import failed:', response.status, errorData)
      throw new Error(errorData.message || `Import failed (${response.status})`)
    }
    
    const result = await response.json()
    console.log('Import result:', result)
    console.log('Success count:', result.data.success.length)
    console.log('Failed count:', result.data.failed.length)
    
    // Log all failed rows for debugging
    if (result.data.failed.length > 0) {
      console.error('Failed rows details:')
      result.data.failed.forEach((fail: any, index: number) => {
        console.error(`  ${index + 1}. Row ${fail.row}: ${fail.error}`)
        if (fail.data) {
          console.error('     Columns found:', Object.keys(fail.data))
          console.error('     Data:', fail.data)
        }
      })
    }
    
    importResults.value = result.data
    
    // Refresh organizations list
    await fetchOrganizations()
    
    notificationMessage.value = result.message || 'Organizations imported successfully'
    notificationType.value = 'success'
    showNotificationModal.value = true
    
    setTimeout(() => {
      showImportModal.value = false
      importFile.value = null
      importResults.value = null
    }, 2000)
    
  } catch (error: any) {
    console.error('Import error:', error)
    notificationMessage.value = error.message || 'Failed to import file'
    notificationType.value = 'error'
    showNotificationModal.value = true
  } finally {
    state.loading = false
  }
}

// Lifecycle hooks
let intervalId: number | null = null

onMounted(async () => {
  console.log('AdminOrganization mounted')
  state.loading = true
  
  try {
    await fetchOrganizations()
    
    // Setup auto-refresh
    intervalId = window.setInterval(async () => {
      try {
        await fetchOrganizations()
      } catch (err) {
        console.error('Auto-refresh error:', err)
      }
    }, 30000) // Every 30 seconds
    
  } catch (error) {
    state.error = 'Failed to load organizations'
    console.error('Loading error:', error)
  } finally {
    state.loading = false
  }
})

onBeforeUnmount(() => {
  console.log('AdminOrganization unmounting - cleaning up')
  if (intervalId) {
    clearInterval(intervalId)
  }
  // Close any open dropdowns
  Object.keys(dropdowns.value).forEach(key => {
    dropdowns.value[key as keyof typeof dropdowns.value] = false
  })
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600&family=Inter:wght@400;500;600;700&family=DM+Sans:wght@400;500&display=swap');

/* Main container */
.admin_organization {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #F6F7F8;
  overflow-x: auto;
  display: flex;
}

/* Main content area */
.main_content {
  position: relative;
  width: calc(100vw - 232px);
  min-width: 1200px;
  height: 100vh;
  background: #F6F7F8;
  margin-left: 232px;
  padding: 30px 50px;
  box-sizing: border-box;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

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
.dropdown_container.geography,
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

.header_category {
  position: absolute;
  width: 76px;
  height: 39.73px;
  left: 342px;
  top: 11.92px;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 19px;
  color: #000000;
}

.header_province {
  position: absolute;
  width: 69px;
  height: 39.73px;
  left: 554px;
  top: 11.92px;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 19px;
  color: #000000;
}

.header_created {
  position: absolute;
  width: 111px;
  height: 39.73px;
  left: 728px;
  top: 11.92px;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 19px;
  color: #000000;
}

.header_edited {
  position: absolute;
  width: 78px;
  height: 16.14px;
  left: 860px;
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
  border-bottom: 1px solid #000000;
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
.org_category {
  position: absolute;
  width: 171.23px;
  height: 39.33px;
  left: 342px;
  top: 15px;
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 400;
  font-size: 15px;
  line-height: 19px;
  color: #000000;
}

/* Province */
.org_province {
  position: absolute;
  width: 78px;
  height: 19.87px;
  left: 554px;
  top: 25px;
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 400;
  font-size: 15px;
  line-height: 19px;
  color: #000000;
}

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
.org_edited {
  position: absolute;
  width: 85.62px;
  height: 22.32px;
  left: 858px;
  top: 23px;
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 400;
  font-size: 15px;
  line-height: 19px;
  color: #000000;
}

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

/* Responsive */
@media (max-width: 1200px) {
  .main_content {
    margin-left: 200px;
  }
}

/* Delete Modal Styles - Following Figma Design */
.delete_modal_overlay {
  position: fixed;
  width: 100vw;
  height: 100vh;
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
  .main_content {
    margin-left: 180px;
    padding: 20px;
  }
  
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

.form_divider {
  width: 100%;
  height: 1px;
  background: #767676;
  margin: 10px 0 20px 0;
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

/* Figma organization page */
.admin_organization {
  width: 100%;
  min-width: 0;
  height: 100vh;
  overflow: hidden;
  display: flex;
  background: #ffffff;
  color: #1f2937;
}

.main_content {
  position: relative;
  width: calc(100% - 66px);
  min-width: 0;
  height: 100vh;
  margin-left: 66px;
  padding: 0;
  overflow: auto;
  background: #f3f4f6;
  display: block;
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
  transform: scale(.75);
  transform-origin: top right;
}
.language_switcher { display: flex; gap: 3px; height: 26px; }
.language_switcher button { display: grid; place-items: center; width: 33px; height: 26px; box-sizing: border-box; border-radius: 2px; font: 600 12px/15px Inter, sans-serif; cursor: pointer; }
.language_active { background: #8b0000; border: 1px solid #8b0000; color: #ffffff; }
.language_option { background: #ffffff; border: 1px solid #a1a1a1; color: #1f2937; }
.language_switcher button.selected { background: #8b0000; border: 1px solid #8b0000; color: #ffffff; }
.language_switcher button:not(.selected) { background: #ffffff; border: 1px solid #a1a1a1; color: #1f2937; }
.admin_badge { display: flex; align-items: center; gap: 8px; width: 120px; height: 36px; padding: 6px 10px; box-sizing: border-box; border-radius: 20px; background: #f3f4f6; font: 600 12px/15px Inter, sans-serif; }
.admin_avatar { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 50%; background: #8b0000; color: #ffffff; }

.content_area { width: min(820px, calc(100% - 47px)); margin: 0 auto; padding-top: 15px; }
.page_heading { display: flex; align-items: flex-start; justify-content: space-between; min-height: 50px; }
.page_heading h1 { margin: 0; font: 700 18px/22px Inter, sans-serif; color: #1f2937; }
.page_heading p { margin: 1px 0 0; font: 400 10px/12px Inter, sans-serif; color: #73737a; }
.page_actions { display: flex; gap: 14px; padding-top: 11px; transform: scale(.75); transform-origin: top right; }
.page_actions button { height: 36px; box-sizing: border-box; border-radius: 8px; font: 600 13px/16px Inter, sans-serif; cursor: pointer; }
.page_actions .import_btn { display: flex; align-items: center; gap: 6px; width: 120px; padding: 10px 13px; background: #ffffff; border: 0.9px solid #a8a8ac; color: #000000; }
.page_actions .add_org_btn { display: flex; align-items: center; gap: 5px; width: 154px; padding: 10px 16px; background: #8b0000; border: 0; color: #ffffff; }
.page_actions .upload_icon { width: 12px; height: 12px; background: #000000; }
.page_actions .plus_icon { width: 12px; height: 12px; }

.filter_section { width: min(810px, 100%); height: 146px; box-sizing: border-box; margin: 0 0 22px; padding: 12px 10px 11px 20px; background: #ffffff; border-radius: 0; box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25); }
.search_input { width: 100%; height: 30px; box-sizing: border-box; padding: 9px 12px; border: 0.4px solid #a8a8ac; border-radius: 8px; font: 400 10px/12px Inter, sans-serif; color: #1f2937; }
.filter_labels { display: grid; grid-template-columns: repeat(5, 122px); gap: 3px; margin-top: 14px; padding: 0 2px; font: 500 10px/12px Inter, sans-serif; color: #000000; }
.dropdowns_grid { display: grid; grid-template-columns: repeat(5, 122px); gap: 3px; margin: 0; }
.dropdown_container { margin: 0; min-width: 0; }
.dropdown_header { height: 28px; box-sizing: border-box; padding: 7px; border: 0.4px solid #a8a8ac; border-radius: 8px; }
.dropdown_text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font: 400 10px/12px Inter, sans-serif; color: #73737a; }
.dropdown_arrow { width: 8px; height: 6px; background: #000000; }
.filter_buttons { display: flex; justify-content: flex-end; gap: 8px; margin-top: 13px; }
.reset_btn, .search_btn { height: 20px; padding: 4px 12px; border-radius: 20px; font: 400 10px/12px Inter, sans-serif; cursor: pointer; }
.reset_btn { background: #ffffff; border: 1px solid #b1b1b1; color: #000000; }
.search_btn { background: #ab1c03; border: 0; color: #ffffff; }

.table_container { width: 818px; max-width: 100%; min-height: 208px; margin: 0 auto; box-sizing: border-box; overflow: hidden; background: #ffffff; border: 1px solid #d1d1d2; border-radius: 12px; }
.table_header, .table_row { display: grid; grid-template-columns: minmax(0, 201px) minmax(0, 81px) minmax(0, 66px) minmax(0, 81px) minmax(0, 76px) minmax(0, 76px) minmax(0, 1fr); align-items: center; }
.table_header { height: 28px; padding: 0 15px; box-sizing: border-box; background: #8b0000; color: #ffffff; font: 600 8px/10px Inter, sans-serif; }
.table_row { min-height: 36px; padding: 0 15px; box-sizing: border-box; border-top: 1px solid #e6e6e8; color: #1f2937; font: 400 9px/11px Inter, sans-serif; }
.table_header > span + span,
.table_row > div + div { border-left: 1px solid #d1d1d2; padding-left: 10px; }
.table_header > span + span { border-left-color: rgba(255, 255, 255, 0.45); }
.table_row > div {
  position: static !important;
  inset: auto !important;
  width: auto !important;
  height: auto !important;
  min-width: 0 !important;
  max-width: 100% !important;
  margin: 0;
  padding: 0;
  transform: none;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
  font-family: Inter, sans-serif !important;
  font-size: inherit !important;
  font-weight: inherit !important;
  line-height: inherit !important;
}
.table_row .org_name { position: static !important; min-width: 0 !important; max-width: 100% !important; font-size: 9px; line-height: 11px; }
.table_row .action_buttons { display: flex; position: static !important; gap: 5px; align-items: center; }
.table_header > span + span,
.table_row > div + div { border-left: 0; padding-left: 0; }
.table_header,
.table_row { position: relative; }
.table_header::after,
.table_row::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  pointer-events: none;
  background: linear-gradient(to right, transparent 0, transparent 25%, rgba(255, 255, 255, .45) 25%, rgba(255, 255, 255, .45) calc(25% + 1px), transparent calc(25% + 1px), transparent 35%, rgba(255, 255, 255, .45) 35%, rgba(255, 255, 255, .45) calc(35% + 1px), transparent calc(35% + 1px), transparent 43%, rgba(255, 255, 255, .45) 43%, rgba(255, 255, 255, .45) calc(43% + 1px), transparent calc(43% + 1px), transparent 53%, rgba(255, 255, 255, .45) 53%, rgba(255, 255, 255, .45) calc(53% + 1px), transparent calc(53% + 1px), transparent 62%, rgba(255, 255, 255, .45) 62%, rgba(255, 255, 255, .45) calc(62% + 1px), transparent calc(62% + 1px), transparent 71%, rgba(255, 255, 255, .45) 71%, rgba(255, 255, 255, .45) calc(71% + 1px), transparent calc(71% + 1px));
}
.table_row::after {
  background: linear-gradient(to right, transparent 0, transparent 25%, #d1d1d2 25%, #d1d1d2 calc(25% + 1px), transparent calc(25% + 1px), transparent 35%, #d1d1d2 35%, #d1d1d2 calc(35% + 1px), transparent calc(35% + 1px), transparent 43%, #d1d1d2 43%, #d1d1d2 calc(43% + 1px), transparent calc(43% + 1px), transparent 53%, #d1d1d2 53%, #d1d1d2 calc(53% + 1px), transparent calc(53% + 1px), transparent 62%, #d1d1d2 62%, #d1d1d2 calc(62% + 1px), transparent calc(62% + 1px), transparent 71%, #d1d1d2 71%, #d1d1d2 calc(71% + 1px), transparent calc(71% + 1px));
}
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
.content_area :deep(.pagination_wrapper) { margin-top: 14px; padding-right: 4px; transform: scale(.75); transform-origin: top right; }

@media (max-width: 1100px) {
  .content_area { width: calc(100% - 32px); }
  .table_container { overflow-x: auto; }
  .table_header, .table_row { min-width: 1090px; }
}

</style>

