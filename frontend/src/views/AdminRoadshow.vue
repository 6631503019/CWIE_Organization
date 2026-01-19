<template>
  <div class="admin-roadshow">
    <AdminNavbar />
    
    <!-- Roadshow Title -->
    <h1 class="roadshow-title">Roadshow</h1>
    
    <!-- Add Roadshow Button -->
    <button class="btn-add-roadshow" @click="showCreateModal = true">
      <div class="plus-icon"></div>
      <span class="button-text">Add Roadshow</span>
    </button>

    <!-- Roadshow Cards Container -->
    <div class="roadshow-cards-container">
      <div 
        v-for="roadshow in paginatedRoadshows" 
        :key="roadshow.id" 
        class="roadshow-large-card"
      >
        <!-- Roadshow Image -->
        <div class="roadshow-image-large">
          <img :src="roadshow.image" :alt="roadshow.title" />
        </div>
        
        <!-- Roadshow Content -->
        <div class="roadshow-content">
          <h2 class="roadshow-title-large">{{ roadshow.title }}</h2>
          <p class="roadshow-description">{{ roadshow.description }}</p>
        </div>
        
        <!-- Edit Icon -->
        <div class="edit-icon-large" @click="editRoadshow(roadshow)">
          <div class="pencil-icon-large"></div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="roadshow-pagination-container">
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
      <div class="add-roadshow-modal" @click.stop>
        <h2 class="modal-title">Add Roadshow</h2>
        <div class="form-divider"></div>

        <!-- Topic Field -->
        <div class="form-group">
          <label>Topic*</label>
          <input 
            type="text" 
            v-model="formData.topic" 
            placeholder="Enter topic"
          />
        </div>

        <!-- Details Field -->
        <div class="form-group full-width">
          <label>Details*</label>
          <textarea 
            class="textarea-lg"
            v-model="formData.details" 
            placeholder="Write details here..."
            rows="6"
          ></textarea>
        </div>

        <!-- Date Field -->
        <div class="form-group">
          <label>Date*</label>
          <div class="date-input-wrapper">
            <input 
              type="date" 
              v-model="formData.date"
            />
            <div class="calendar-icon"></div>
          </div>
        </div>

        <!-- Add Picture Activity -->
        <div class="upload-section">
          <label>Add Picture Activity (Not required)</label>
          <label class="upload-btn">
            <div class="upload-icon"></div>
            <span>Select Photo</span>
            <input 
              type="file" 
              accept="image/*"
              @change="(e) => formData.pictureFile = (e.target as HTMLInputElement).files?.[0] || null"
              style="display: none"
            />
          </label>
        </div>

        <!-- Add Poster -->
        <div class="upload-section">
          <label>Add Poster</label>
          <label class="upload-btn">
            <div class="upload-icon"></div>
            <span>Select Poster</span>
            <input 
              type="file" 
              accept="image/*"
              @change="(e) => formData.posterFile = (e.target as HTMLInputElement).files?.[0] || null"
              style="display: none"
            />
          </label>
        </div>

        <!-- Public Toggle -->
        <div class="public-toggle">
          <label>Public</label>
          <div class="toggle-switch" :class="{ active: formData.isPublic }" @click="formData.isPublic = !formData.isPublic">
            <div class="toggle-slider"></div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="modal-actions">
          <button class="btn-cancel" @click="closeModals">Cancel</button>
          <button class="btn-save" @click="submitForm">Save</button>
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
  itemsPerPage: 2,
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
  },
  {
    id: 3,
    title: 'Technology Showcase Event',
    description: 'Showcasing the latest technology trends and innovations',
    image: '/api/placeholder/271/272',
    createdDate: '2025-01-10'
  },
  {
    id: 4,
    title: 'Startup Pitch Competition',
    description: 'Students present their startup ideas to industry experts',
    image: '/api/placeholder/271/272',
    createdDate: '2025-01-05'
  }
])

// Computed properties for pagination
const totalPages = computed(() => 
  Math.ceil(roadshows.value.length / state.itemsPerPage)
)

const paginatedRoadshows = computed(() => {
  const start = (state.currentPage - 1) * state.itemsPerPage
  const end = start + state.itemsPerPage
  return roadshows.value.slice(start, end)
})

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
  topic: '',
  details: '',
  date: '',
  pictureFile: null as File | null,
  posterFile: null as File | null,
  isPublic: false
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
  formData.topic = ''
  formData.details = ''
  formData.date = ''
  formData.pictureFile = null
  formData.posterFile = null
  formData.isPublic = false
}

const submitForm = () => {
  if (showCreateModal.value) {
    // Handle create roadshow
    console.log('Creating roadshow:', formData)
  } else {
    // Handle update roadshow
    console.log('Updating roadshow:', formData)
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
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Header Section */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-title {
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
  justify-content: center;
  align-items: center;
  padding: 6px 10px;
  gap: 6px;
  width: 166px;
  height: 32px;
  background: #C70000;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: #FFFFFF;
}

.plus-icon {
  width: 20px;
  height: 20px;
  position: relative;
  flex: none;
  order: 0;
  flex-grow: 0;
}

.plus-icon::before,
.plus-icon::after {
  content: '';
  position: absolute;
  background: #FFFFFF;
  border-radius: 1px;
}

.plus-icon::before {
  width: 12px;
  height: 2px;
  left: 4px;
  top: 9px;
}

.plus-icon::after {
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
  
  flex: none;
  order: 1;
  flex-grow: 0;
}

/* Roadshow Cards Grid */
.roadshow-cards-grid {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 0px;
  gap: 42px;
  flex-wrap: wrap;
  margin-bottom: 30px;
}

.roadshow-card {
  position: relative;
  width: 271px;
  height: 350px;
  background: #FFFFFF;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.roadshow-card:hover {
  transform: translateY(-4px);
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.15);
}

.roadshow-image {
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.roadshow-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.roadshow-card:hover .roadshow-image img {
  transform: scale(1.05);
}

/* Main Roadshow Title */
.roadshow-title {
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

/* Add Roadshow Button */
.btn-add-roadshow {
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
  transition: background 0.2s ease;
}

.btn-add-roadshow:hover {
  background: #A50000;
}

.plus-icon {
  width: 20px;
  height: 20px;
  position: relative;
  flex: none;
  order: 0;
  flex-grow: 0;
}

.plus-icon::before,
.plus-icon::after {
  content: '';
  position: absolute;
  background: #FFFFFF;
  border-radius: 1px;
}

.plus-icon::before {
  width: 12px;
  height: 2px;
  left: 4px;
  top: 9px;
}

.plus-icon::after {
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
  
  flex: none;
  order: 1;
  flex-grow: 0;
}

/* Roadshow Cards Container */
.roadshow-cards-container {
  position: absolute;
  left: 273px;
  top: 152px;
  width: 1035px;
}

/* Large Roadshow Card */
.roadshow-large-card {
  position: relative;
  width: 1035px;
  height: 287px;
  margin-bottom: 25px;
  
  background: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 15px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  
  display: flex;
  overflow: hidden;
}

/* Large Roadshow Image */
.roadshow-image-large {
  width: 270.72px;
  height: 271.7px;
  margin: 8px 0 0 37px;
  overflow: hidden;
  border-radius: 8px;
  background: #f5f5f5;
}

.roadshow-image-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Roadshow Content */
.roadshow-content {
  flex: 1;
  padding: 17px 20px 20px 40px;
  display: flex;
  flex-direction: column;
}

/* Large Roadshow Title */
.roadshow-title-large {
  margin: 0 0 15px 0;
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 32px;
  line-height: 40px;
  color: #000000;
}

/* Roadshow Description */
.roadshow-description {
  margin: 0;
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 20px;
  line-height: 25px;
  color: #000000;
  flex: 1;
}

/* Large Edit Icon */
.edit-icon-large {
  position: absolute;
  width: 29.17px;
  height: 26.5px;
  right: 20px;
  top: 20px;
  
  background: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 6px;
  
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-icon-large:hover {
  background: #f5f5f5;
  transform: scale(1.05);
}

/* Large Pencil Icon */
.pencil-icon-large {
  width: 24.31px;
  height: 22.08px;
  background: #000;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z'/%3E%3C/svg%3E") no-repeat;
  mask-size: contain;
}

.roadshow-date {
  padding: 0px 20px 15px 20px;
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 15px;
  color: #767676;
  text-align: left;
}

.edit-icon {
  position: absolute;
  width: 32px;
  height: 32px;
  right: 12px;
  top: 12px;
  z-index: 3;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0;
  transform: scale(0.8);
}

.roadshow-card:hover .edit-icon {
  opacity: 1;
  transform: scale(1);
}

.edit-icon:hover {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
}

.pencil-icon {
  width: 14px;
  height: 14px;
  background: #666;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z'/%3E%3C/svg%3E") no-repeat;
  mask-size: contain;
  transition: background 0.2s ease;
}

.edit-icon:hover .pencil-icon {
  background: #333;
}

/* Roadshow Pagination Container */
.roadshow-pagination-container {
  position: absolute;
  left: 1090px;
  top: 780px;
  width: 218px;
  height: 28px;
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
  width: 350px;
  height: 272px;
  flex-shrink: 0;
}

.roadshow-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  background: #e0e0e0;
}

.roadshow-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.roadshow-title {
  margin: 0 0 24px 0;
  
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 32px;
  line-height: 40px;
  color: #000000;
}

.roadshow-description {
  margin: 0;
  
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 20px;
  line-height: 25px;
  color: #000000;
  max-width: 600px;
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

.add-roadshow-modal {
  background: #FFFFFF;
  border-radius: 12px;
  width: 850px;
  height: 689px;
  overflow-y: auto;
  padding: 40px;
  box-sizing: border-box;
}

.modal-title {
  margin: 0;
  font-family: 'Outfit', sans-serif;
  font-size: 28px;
  font-weight: 600;
  color: #000000;
  margin-bottom: 24px;
}

.form-divider {
  height: 1px;
  background-color: #767676;
  margin-bottom: 24px;
}

.date-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.date-input-wrapper input {
  width: 100%;
  padding: 10px 12px;
  padding-right: 36px;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  box-sizing: border-box;
}

.calendar-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  font-size: 18px;
  color: #6B7280;
}

.upload-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.upload-section label {
  display: block;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 13px;
  color: #6B7280;
}

.upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background: #F3F4F6;
  border: 2px dashed #D1D5DB;
  border-radius: 6px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #6B7280;
  transition: all 0.3s ease;
}

.upload-btn:hover {
  border-color: #AB1C03;
  background: #FEF2F2;
  color: #AB1C03;
}

.upload-icon {
  font-size: 18px;
}

.upload-btn input[type="file"] {
  display: none;
}

.public-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.public-toggle label {
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #374151;
}

.toggle-switch {
  width: 44px;
  height: 24px;
  background: #D1D5DB;
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: background 0.3s ease;
}

.toggle-switch.active {
  background: #AB1C03;
}

.toggle-switch::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  background: #FFFFFF;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: left 0.3s ease;
}

.toggle-switch.active::after {
  left: 22px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn-cancel {
  padding: 8px 20px;
  background: #FFFFFF;
  border: 1px solid #D1D5DB;
  border-radius: 20px;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  width: 77px;
  height: 23px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  background: #F9FAFB;
  border-color: #9CA3AF;
}

.btn-save {
  padding: 8px 20px;
  background: #AB1C03;
  border: none;
  border-radius: 20px;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 13px;
  color: #FFFFFF;
  cursor: pointer;
  width: 77px;
  height: 23px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-save:hover {
  background: #8B1600;
}

.form-group {
  margin-bottom: 20px;
}

.form-group.full-width {
  width: 100%;
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
  border-color: #AB1C03;
  box-shadow: 0 0 0 3px rgba(171, 28, 3, 0.1);
}

.textarea-lg {
  min-height: 128px;
  resize: vertical;
}

</style>