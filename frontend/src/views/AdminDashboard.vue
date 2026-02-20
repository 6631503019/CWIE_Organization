<template>
  <div class="admin-dashboard">
    <AdminNavbar />
    
    <!-- Dashboard Title -->
    <h1 class="dashboard-title">Dashboard</h1>
    
    <!-- Statistics Card -->
    <div class="stats-card">
      <!-- Establishment Section -->
      <div class="establishment-section">
        <span class="establishment-label">Establishment</span>
        <span class="establishment-count">{{ stats.totalEstablishments }}</span>
      </div>
      
      <!-- First Separator Line -->
      <div class="separator-line-1"></div>
      
      <!-- Categories Frame -->
      <div class="categories-frame">
        <div class="category-item private">
          <span class="category-label">private company</span>
          <span class="category-count">{{ stats.privateCompany }}</span>
        </div>
        <div class="category-item government">
          <span class="category-label">Government</span>
          <span class="category-count">{{ stats.government }}</span>
        </div>
        <div class="category-item overseas">
          <span class="category-label">Oversea</span>
          <span class="category-count">{{ stats.overseas }}</span>
        </div>
        <div class="category-item mfu">
          <span class="category-label">MFU</span>
          <span class="category-count">{{ stats.mfu }}</span>
        </div>
      </div>
      
      <!-- Second Separator Line -->
      <div class="separator-line-2"></div>
      
      <!-- Roadshow Section -->
      <div class="roadshow-section">
        <span class="roadshow-label">Roadshow</span>
        <span class="roadshow-count">{{ stats.roadshows }}</span>
      </div>
    </div>
    
    <!-- Notification Title -->
    <h2 class="notification-title">Notification</h2>
    
    <!-- Notification Table -->
    <div class="notification-table">
      <!-- Table Header Line -->
      <div class="table-header-line"></div>
      
      <!-- Column Headers -->
      <div class="requested-by-header">Requested By</div>
      <div class="annotation-header">Annotation</div>
      <div class="establishment-header">Establishment</div>
      <div class="date-header">Date</div>
      
      <!-- Header Separator -->
      <div class="header-separator-line"></div>
      
      <!-- Table Rows -->
      <div class="table-rows">
        <!-- Row separators -->
        <div class="row-separator" style="top: 45.83px;"></div>
        <div class="row-separator" style="top: 91.67px;"></div>
        <div class="row-separator" style="top: 137.5px;"></div>
        <div class="row-separator" style="top: 183.33px;"></div>
        <div class="row-separator" style="top: 229.17px;"></div>
        <div class="row-separator" style="top: 275px;"></div>
        <div class="row-separator" style="top: 320.83px;"></div>
        <div class="row-separator" style="top: 366.67px;"></div>
        <div class="row-separator" style="top: 412.5px;"></div>
        <div class="row-separator" style="top: 458.33px;"></div>
        
        <!-- Highlighted rows -->
        <div class="row-highlight" style="top: 91.67px;"></div>
        <div class="row-highlight" style="top: 137.5px;"></div>
        <div class="row-highlight" style="top: 365.75px;"></div>
        <div class="row-highlight" style="top: 320.83px;"></div>
        <div class="row-highlight" style="top: 458.33px;"></div>
        
        <!-- Requested By Column -->
        <div class="requested-by-column">
          <div v-for="(notif, index) in notifications" :key="notif._id" class="requested-by-item" :class="{ grayed: notif.is_read }">
            {{ notif.requested_by_name?.substring(0, 10) || 'Unknown' }}{{ notif.requested_by_name?.length > 10 ? '...' : '' }}
          </div>
        </div>
        
        <!-- Annotation Column -->
        <div class="annotation-column">
          <div v-for="(notif, index) in notifications" :key="notif._id" class="annotation-item" :class="{ grayed: notif.is_read }">
            {{ notif.action }}
          </div>
        </div>
        
        <!-- Establishment Column -->
        <div class="establishment-column">
          <div v-for="(notif, index) in notifications" :key="notif._id" class="establishment-item" :class="{ grayed: notif.is_read }">
            {{ notif.establishment_name }}
          </div>
        </div>
        
        <!-- Date Column -->
        <div class="date-column">
          <div v-for="(notif, index) in notifications" :key="notif._id" class="date-item" :class="{ grayed: notif.is_read }" :style="{ top: (index * 45.83) + 'px' }">
            {{ new Date(notif.date).toISOString().split('T')[0] }}
          </div>
        </div>
        
        <!-- Delete Icons -->
        <div class="delete-icons">
          <i v-for="(notif, index) in notifications" :key="notif._id" class="pi pi-trash delete-icon" :style="{ top: (66.92 + index * 45.83) + 'px' }" @click="deleteNotification(notif._id)"></i>
        </div>
      </div>
    </div>
    
    <!-- Pagination Component -->
    <div class="dashboard-pagination-container">
      <Pagination 
        :currentPage="notificationPage"
        :totalPages="Math.ceil(notificationTotal / 11)"
        :totalItems="notificationTotal"
        :showInfo="false"
        @page-change="goToPage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from '../stores/auth'
import AdminNavbar from '../components/AdminNavbar.vue'
import Pagination from '../components/Pagination.vue'
import { BACKEND_URL } from '../services/api'

const authStore = useAuthStore()

// Reactive state management
const state = reactive({
  loading: false,
  error: null as string | null,
  refreshInterval: null as number | null
})

// Dashboard statistics from backend
const stats = reactive({
  totalEstablishments: 0,
  privateCompany: 0,
  government: 0,
  overseas: 0,
  mfu: 0,
  roadshows: 0
})

// Computed properties for dynamic calculations
const totalCalculated = computed(() => 
  stats.privateCompany + stats.government + stats.overseas + stats.mfu
)

// Check if user is admin with reactive auth check
watch(() => authStore.isAdmin, (isAdmin) => {
  if (!isAdmin) {
    window.location.href = authStore.user?.role === 'user' ? '/home' : '/'
  }
})

// Auto-refresh stats
const refreshStats = async () => {
  state.loading = true
  try {
    // Fetch organization statistics - include both public and private
    const orgResponse = await fetch(`${BACKEND_URL}/api/organizations?limit=1000&public=false`)
    if (!orgResponse.ok) throw new Error('Failed to load organizations')
    
    const orgData = await orgResponse.json()
    const orgs = orgData.data || []
    
    // Count by type
    const counts = {
      private: 0,
      government: 0,
      overseas: 0,
      mfu: 0
    }
    
    orgs.forEach((org: any) => {
      const type = org.organization_type || 'private company'
      if (type === 'Government') counts.government++
      else if (type === 'Oversea') counts.overseas++
      else if (type === 'MFU') counts.mfu++
      else if (type === 'private company') counts.private++
    })
    
    // Fetch roadshow count
    const roadshowResponse = await fetch(`${BACKEND_URL}/api/roadshows?limit=1&public=false`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    })
    let roadshowCount = 0
    if (roadshowResponse.ok) {
      const roadshowData = await roadshowResponse.json()
      roadshowCount = roadshowData.pagination?.total || 0
    }
    
    // Update stats
    stats.totalEstablishments = orgs.length
    stats.privateCompany = counts.private
    stats.government = counts.government
    stats.overseas = counts.overseas
    stats.mfu = counts.mfu
    stats.roadshows = roadshowCount
    
    console.log('Stats refreshed')
  } catch (error) {
    state.error = 'Failed to refresh statistics'
    console.error(error)
  } finally {
    state.loading = false
  }
}

// Lifecycle hooks
onMounted(async () => {
  console.log('Dashboard mounted')
  if (!authStore.isAdmin) {
    window.location.href = authStore.user?.role === 'user' ? '/home' : '/'
    return
  }
  
  // Initial data load
  await refreshStats()
  await fetchNotifications()
  
  // Setup auto-refresh every 5 minutes
  state.refreshInterval = window.setInterval(() => {
    refreshStats()
    fetchNotifications()
  }, 5 * 60 * 1000)
})

onBeforeUnmount(() => {
  console.log('Dashboard unmounting - cleaning up')
  if (state.refreshInterval) {
    clearInterval(state.refreshInterval)
  }
})

// Sample notification data
const notifications = ref<any[]>([])
const notificationPage = ref(1)
const notificationTotal = ref(0)

// Fetch notifications from backend
const fetchNotifications = async () => {
  try {
    const token = localStorage.getItem('auth_token')
    if (!token) return
    
    const response = await fetch(`${BACKEND_URL}/api/notifications?limit=11&page=` + notificationPage.value, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) throw new Error('Failed to load notifications')
    
    const data = await response.json()
    notifications.value = data.data || []
    notificationTotal.value = data.pagination?.total || 0
  } catch (error) {
    console.error('Failed to load notifications:', error)
  }
}

const deleteNotification = async (id: string) => {
  try {
    const token = localStorage.getItem('auth_token')
    if (!token) return
    
    const response = await fetch(`${BACKEND_URL}/api/notifications/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) throw new Error('Failed to delete notification')
    
    // Refresh notifications after delete
    await fetchNotifications()
  } catch (error) {
    console.error('Delete notification error:', error)
  }
}

const goToPage = (page: number) => {
  notificationPage.value = page
  fetchNotifications()
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600&family=Inter:wght@400;600;700&display=swap');
@import url('https://cdn.jsdelivr.net/npm/primeicons@6.0.1/primeicons.css');

/* Admin Dashboard */
.admin-dashboard {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #F6F7F8;
  overflow-x: hidden;
}

/* Dashboard Title */
.dashboard-title {
  position: absolute;
  width: 204px;
  height: 50px;
  left: 251px;
  top: 44px;
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 600;
  font-size: 40px;
  line-height: 50px;
  color: #000000;
  margin: 0;
}

/* Statistics Card */
.stats-card {
  position: absolute;
  width: 1127px;
  height: 136px;
  left: 248px;
  top: 94px;
  background: #FFFFFF;
  box-shadow: 0px 4px 4px rgba(171, 28, 3, 0.6);
  border-radius: 12px;
  display: flex;
  align-items: center;
}

/* Establishment Section */
.establishment-section {
  position: absolute;
  width: 160.05px;
  height: 112px;
  left: 52px;
  top: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.establishment-label {
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 600;
  font-size: 22px;
  line-height: 28px;
  text-align: center;
  color: #000000;
}

.establishment-count {
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 600;
  font-size: 22px;
  line-height: 28px;
  text-align: center;
  color: #000000;
}

/* Separator Lines */
.separator-line-1 {
  position: absolute;
  width: 100px;
  height: 0px;
  left: 200.85px;
  top: 60px;
  border: 1px solid #AB1C03;
  transform: rotate(90deg);
}

.separator-line-2 {
  position: absolute;
  width: 100px;
  height: 0px;
  left: 824.85px;
  top: 60px;
  border: 1px solid #AB1C03;
  transform: rotate(90deg);
}

/* Categories Frame */
.categories-frame {
  position: absolute;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 30px;
  width: 487.96px;
  height: 81px;
  left: 264.34px;
  top: 27px;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.category-item.private {
  width: 178px;
  height: 81px;
}

.category-item.government {
  width: 132px;
  height: 81px;
}

.category-item.overseas {
  width: 89px;
  height: 81px;
}

.category-item.mfu {
  width: 49px;
  height: 81px;
}

.category-label {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: 22px;
  line-height: 27px;
  text-align: center;
  white-space: nowrap;
}

.category-count {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: 22px;
  line-height: 27px;
  text-align: center;
}

.category-item.private .category-label,
.category-item.private .category-count {
  color: #0A48A6;
}

.category-item.government .category-label,
.category-item.government .category-count {
  color: #CF8200;
}

.category-item.overseas .category-label,
.category-item.overseas .category-count {
  color: #25A554;
}

.category-item.mfu .category-label,
.category-item.mfu .category-count {
  color: #AB1C03;
}

/* Roadshow Section */
.roadshow-section {
  position: absolute;
  width: 111.14px;
  height: 84px;
  left: 916.88px;
  top: 27px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.roadshow-label {
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 600;
  font-size: 22px;
  line-height: 28px;
  text-align: center;
  color: #000000;
}

.roadshow-count {
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 600;
  font-size: 22px;
  line-height: 28px;
  text-align: center;
  color: #000000;
}

/* Notification Title */
.notification-title {
  position: absolute;
  width: 136px;
  height: 29px;
  left: 253px;
  top: 253px;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: 24px;
  line-height: 29px;
  text-align: center;
  color: #000000;
  margin: 0;
}

/* Notification Table */
.notification-table {
  position: absolute;
  width: 1125px;
  height: 554.25px;
  left: 250px;
  top: 308px;
}

.table-header-line {
  box-sizing: border-box;
  position: absolute;
  width: 1125px;
  height: 550px;
  left: 0px;
  top: 0px;
  background: #FFFFFF;
  border: 1px solid #545454;
  border-radius: 12px;
}

/* Column Headers */
.requested-by-header {
  position: absolute;
  left: 36px;
  top: 10px;
  width: 128.18px;
  height: 21.08px;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: 18px;
  line-height: 22px;
  text-align: center;
  color: #000000;
}

.annotation-header {
  position: absolute;
  left: 246px;
  top: 10px;
  width: 116.92px;
  height: 23.83px;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: 18px;
  line-height: 22px;
  text-align: center;
  color: #000000;
}

.establishment-header {
  position: absolute;
  left: 445px;
  top: 14.67px;
  width: 429.71px;
  height: 22px;
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 600;
  font-size: 18px;
  line-height: 23px;
  color: #000000;
}

.date-header {
  position: absolute;
  left: 959.58px;
  top: 15.58px;
  width: 58.89px;
  height: 20.17px;
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 600;
  font-size: 18px;
  line-height: 23px;
  color: #000000;
}

/* Header Separator */
.header-separator-line {
  position: absolute;
  width: 1124.13px;
  height: 0px;
  left: 0.87px;
  top: 45.83px;
  border: 1px solid #AB1C03;
}

/* Table Rows */
.table-rows {
  position: relative;
  width: 100%;
  height: 100%;
}

/* Row Separators */
.row-separator {
  position: absolute;
  width: 1124.13px;
  height: 0px;
  left: 0.87px;
  border: 1px solid #A1A1A1;
}

/* Row Highlights */
.row-highlight {
  position: absolute;
  width: 1124.13px;
  height: 45.83px;
  left: 0px;
  background: rgba(81, 76, 163, 0.1);
}

/* Columns */
.requested-by-column {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0px;
  gap: 23px;
  width: 128.18px;
  height: 524.08px;
  left: 36px;
  top: 55px;
}

.annotation-column {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0px;
  gap: 24px;
  width: 116.92px;
  height: 531.83px;
  left: 246px;
  top: 55px;
}

.establishment-column {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 22px;
  width: 429.71px;
  height: 539.58px;
  left: 445px;
  top: 59.67px;
}

.date-column {
  position: absolute;
  left: 932.74px;
  top: 66.92px;
  width: 97.86px;
}

/* Column Items */
.requested-by-item,
.annotation-item,
.establishment-item {
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 400;
  font-size: 20px;
  line-height: 25px;
  text-align: center;
  color: #000000;
  height: 23px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.annotation-item {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-size: 20px;
  line-height: 24px;
  height: 22px;
}

.establishment-item {
  text-align: left;
  justify-content: flex-start;
  width: 429.71px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.date-item {
  position: absolute;
  width: 97.86px;
  height: 19.25px;
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 400;
  font-size: 15px;
  line-height: 19px;
  color: #000000;
}

.date-item:nth-child(1) { top: 0px; }
.date-item:nth-child(2) { top: 44px; }
.date-item:nth-child(3) { top: 85.25px; }
.date-item:nth-child(4) { top: 132px; }
.date-item:nth-child(5) { top: 178.75px; }
.date-item:nth-child(6) { top: 225.5px; }
.date-item:nth-child(7) { top: 270.42px; }
.date-item:nth-child(8) { top: 316.25px; }
.date-item:nth-child(9) { top: 361.17px; }
.date-item:nth-child(10) { top: 407.92px; }
.date-item:nth-child(11) { top: 451px; }

/* Grayed Items */
.grayed {
  color: #A1A1A1 !important;
}

/* Delete Icons */
.delete-icons {
  position: relative;
}

.delete-icon {
  position: absolute;
  width: 25.98px;
  height: 22px;
  left: 1060px;
  color: #C70000;
  font-size: 18px;
  cursor: pointer;
}

/* Dashboard Pagination Container */
.dashboard-pagination-container {
  position: absolute;
  left: 1182px;
  top: 892px;
  width: 218px;
  height: 28px;
}
</style>