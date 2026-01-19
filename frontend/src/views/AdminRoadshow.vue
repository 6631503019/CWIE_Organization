<template>
  <div class="admin-roadshow">
    <AdminNavbar />
    
    <!-- Main Content Area -->
    <div class="main-content">
      <!-- Page Title -->
      <h1 class="page-title">Roadshow</h1>
      
      <!-- Add Roadshow Button -->
      <button class="add-roadshow-btn" @click="showCreateModal = true">
        <div class="plus-icon">
          <div class="plus-line-h"></div>
          <div class="plus-line-v"></div>
        </div>
        <span class="button-text">Add Roadshow</span>
      </button>
      
      <!-- Main Roadshow Card -->
      <div class="roadshow-card">
        <div class="roadshow-image">
          <img :src="currentRoadshow.image" :alt="currentRoadshow.title" />
        </div>
        
        <div class="roadshow-content">
          <h2 class="roadshow-title">{{ currentRoadshow.title }}</h2>
          <p class="roadshow-description">{{ currentRoadshow.description }}</p>
        </div>
        
        <!-- Edit Icon -->
        <div class="edit-icon bottom-edit" @click="editRoadshow(currentRoadshow)">
          <div class="pencil-icon"></div>
        </div>
      </div>
      
      <!-- Pagination -->
      <Pagination 
        :current-page="state.currentPage"
        :total-pages="totalPages"
        :total-items="roadshows.length"
        :loading="state.loading"
        :show-info="false"
        @page-change="handlePageChange"
      />
    </div>
    
    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModals">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>{{ showCreateModal ? 'Add New Roadshow' : 'Edit Roadshow' }}</h2>
          <button class="btn-close" @click="closeModals">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitForm">
            <div class="form-group">
              <label>Roadshow Title</label>
              <input 
                type="text" 
                v-model="formData.title" 
                placeholder="Enter roadshow title"
                required 
              />
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea 
                v-model="formData.description" 
                rows="6"
                placeholder="Enter roadshow description"
                required
              ></textarea>
            </div>
            <div class="form-group">
              <label>Roadshow Image</label>
              <input 
                type="file" 
                @change="handleImageUpload" 
                accept="image/*"
              />
            </div>
            <div class="form-actions">
              <button type="button" class="btn-secondary" @click="closeModals">Cancel</button>
              <button type="submit" class="btn-primary">
                {{ showCreateModal ? 'Create' : 'Update' }} Roadshow
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import AdminNavbar from '../components/AdminNavbar.vue'
import Pagination from '../components/Pagination.vue'

// Reactive state management
const state = reactive({
  loading: false,
  error: null as string | null,
  currentPage: 1,
  itemsPerPage: 1,
  autoRefreshInterval: null as number | null
})

// Modal states
const showCreateModal = ref(false)
const showEditModal = ref(false)

// Roadshow data array
const roadshows = ref([
  {
    id: 1,
    title: 'MFU Internship & Job Fair 2025',
    description: 'Publicizing the MFU Internship & Job Fair 2025 under the theme "Happy Workplace: Where Passion Meets Purpose": A good workplace isn\'t just about having a desk and a job to do. It\'s about providing opportunities for people to grow, enjoy, and find meaning in what they do.',
    image: '/api/placeholder/271/272',
    createdDate: '2025-01-19'
  },
  {
    id: 2,
    title: 'Career Development Workshop',
    description: 'Professional development workshop for students and recent graduates',
    image: '/api/placeholder/271/272',
    createdDate: '2025-01-15'
  }
])

// Computed properties
const currentRoadshow = computed(() => {
  const index = (state.currentPage - 1) % roadshows.value.length
  return roadshows.value[index] || roadshows.value[0]
})

const totalPages = computed(() => roadshows.value.length)

// Watchers for reactive updates
watch(() => state.currentPage, (newPage) => {
  console.log('Page changed to:', newPage)
  // Could trigger data fetch for specific roadshow
})

watch(showCreateModal, (isOpen) => {
  if (!isOpen) resetForm()
})

watch(showEditModal, (isOpen) => {
  if (!isOpen) resetForm()
})

// Form data
const formData = reactive({
  title: '',
  description: '',
  image: null as File | null
})

const handlePageChange = async (page: number) => {
  if (page >= 1 && page <= totalPages.value && !state.loading) {
    state.loading = true
    try {
      state.currentPage = page
      // Simulate page load delay
      await new Promise(resolve => setTimeout(resolve, 200))
    } finally {
      state.loading = false
    }
  }
}

const addRoadshow = async () => {
  if (!formData.title.trim()) return
  
  state.loading = true
  try {
    const newRoadshow = {
      id: roadshows.value.length + 1,
      title: formData.title,
      description: formData.description,
      image: formData.image ? URL.createObjectURL(formData.image) : '/api/placeholder/271/272',
      createdDate: new Date().toISOString().split('T')[0]
    }
    
    roadshows.value.push(newRoadshow)
    showCreateModal.value = false
    resetForm()
    
  } catch (error) {
    state.error = 'Failed to add roadshow'
  } finally {
    state.loading = false
  }
}

const editRoadshow = (roadshow: any) => {
  formData.title = roadshow.title
  formData.description = roadshow.description
  showEditModal.value = true
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  resetForm()
}

const resetForm = () => {
  formData.title = ''
  formData.description = ''
  formData.image = null
}

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    formData.image = target.files[0]
  }
}

const submitForm = () => {
  if (showCreateModal.value) {
    // Handle create roadshow
    console.log('Creating roadshow:', formData)
  } else {
    // Handle update roadshow
    console.log('Updating roadshow:', formData)
    currentRoadshow.value.title = formData.title
    currentRoadshow.value.description = formData.description
  }
  closeModals()
}

onMounted(async () => {
  console.log('AdminRoadshow mounted')
  state.loading = true
  
  try {
    // Simulate data loading
    await new Promise(resolve => setTimeout(resolve, 600))
    console.log('Roadshow data loaded:', roadshows.value.length, 'items')
    
    // Setup auto-refresh
    state.autoRefreshInterval = window.setInterval(() => {
      console.log('Auto-refresh roadshows...')
    }, 45000) // Every 45 seconds
    
  } catch (error) {
    state.error = 'Failed to load roadshow data'
    console.error('Loading error:', error)
  } finally {
    state.loading = false
  }
})

onBeforeUnmount(() => {
  console.log('AdminRoadshow unmounting - cleaning up')
  if (state.autoRefreshInterval) {
    clearInterval(state.autoRefreshInterval)
  }
  // Close modals
  showCreateModal.value = false
  showEditModal.value = false
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Inter:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');

.admin-roadshow {
  position: relative;
  width: 100vw;
  height: 918px;
  background: #F6F7F8;
  overflow-x: auto;
}

.main-content {
  margin-left: 232px;
  padding: 20px;
  height: calc(100vh - 40px);
  overflow-y: auto;
}

.page-title {
  position: absolute;
  width: 188px;
  height: 50px;
  left: 251px;
  top: 58px;
  margin: 0;
  
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 40px;
  line-height: 50px;
  color: #000000;
}

.add-roadshow-btn {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 6px 10px;
  gap: 6px;
  
  position: absolute;
  width: 145px;
  height: 32px;
  left: 1156px;
  top: 66px;
  
  background: #C70000;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}

.plus-icon {
  position: relative;
  width: 20px;
  height: 20px;
}

.plus-line-h, .plus-line-v {
  position: absolute;
  background: #FFFFFF;
}

.plus-line-h {
  width: 12px;
  height: 2px;
  left: 4px;
  top: 9px;
}

.plus-line-v {
  width: 2px;
  height: 12px;
  left: 9px;
  top: 4px;
}

.button-text {
  width: 99px;
  height: 20px;
  
  font-family: 'DM Sans', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #FFFFFF;
}

.roadshow-card {
  position: absolute;
  width: 1035px;
  height: 287px;
  left: 273px;
  top: 152px;
  
  background: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 15px;
  display: flex;
}

.roadshow-image {
  position: absolute;
  width: 270.72px;
  height: 271.7px;
  left: 37.52px;
  top: 7.83px;
}

.roadshow-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  background: #e0e0e0;
}

.roadshow-content {
  position: absolute;
  left: 417.6px;
  top: 17.24px;
  width: 597.75px;
}

.roadshow-title {
  width: 469.19px;
  height: 37.06px;
  margin: 0 0 24px 0;
  
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 32px;
  line-height: 40px;
  color: #000000;
}

.roadshow-description {
  width: 597.75px;
  height: 114.63px;
  margin: 0;
  
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 20px;
  line-height: 25px;
  color: #000000;
}

.edit-icon {
  position: absolute;
  width: 29.17px;
  height: 26.5px;
  
  background: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bottom-edit {
  right: 77px;
  top: 248px;
}

.pencil-icon {
  width: 24.31px;
  height: 22.08px;
  background: #666;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z'/%3E%3C/svg%3E") no-repeat;
  mask-size: contain;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: #FFFFFF;
  border-radius: 12px;
  width: 600px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #E5E5E5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-family: 'Outfit', sans-serif;
  font-size: 24px;
  font-weight: 600;
  color: #000000;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #374151;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #C70000;
  box-shadow: 0 0 0 3px rgba(199, 0, 0, 0.1);
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn-secondary {
  padding: 10px 20px;
  background: #FFFFFF;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
}

.btn-primary {
  padding: 10px 20px;
  background: #C70000;
  border: none;
  border-radius: 6px;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #FFFFFF;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #F9FAFB;
}

.btn-primary:hover {
  background: #B91C1C;
}
</style>