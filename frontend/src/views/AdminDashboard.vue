<template>
  <div class="admin_dashboard">
    <AdminNavbar />
    
    <!-- Dashboard Title -->
    <h1 class="dashboard_title">Dashboard</h1>
    
    <!-- Statistics Card -->
    <div class="stats_card">
      <!-- Establishment Section -->
      <div class="establishment_section">
        <span class="establishment_label">Establishment</span>
        <span class="establishment_count">{{ stats.totalEstablishments }}</span>
      </div>
      
      <!-- First Separator Line -->
      <div class="separator_line_1"></div>
      
      <!-- Categories Frame -->
      <div class="categories_frame">
        <div class="category_item private">
          <span class="category_label">private company</span>
          <span class="category_count">{{ stats.privateCompany }}</span>
        </div>
        <div class="category_item government">
          <span class="category_label">Government</span>
          <span class="category_count">{{ stats.government }}</span>
        </div>
        <div class="category_item overseas">
          <span class="category_label">Oversea</span>
          <span class="category_count">{{ stats.overseas }}</span>
        </div>
        <div class="category_item mfu">
          <span class="category_label">MFU</span>
          <span class="category_count">{{ stats.mfu }}</span>
        </div>
      </div>
      
      <!-- Second Separator Line -->
      <div class="separator_line_2"></div>
      
      <!-- Roadshow Section -->
      <div class="roadshow_section">
        <span class="roadshow_label">Roadshow</span>
        <span class="roadshow_count">{{ stats.roadshows }}</span>
      </div>
    </div>
    
    <!-- Notification Title -->
    <h2 class="notification_title">Notification</h2>
    
    <!-- Notification Table -->
    <div class="notification_table">
      <!-- Table Header Line -->
      <div class="table_header_line"></div>
      
      <!-- Column Headers -->
      <div class="requested_by_header">Requested By</div>
      <div class="annotation_header">Annotation</div>
      <div class="establishment_header">Establishment</div>
      <div class="date_header">Date</div>
      
      <!-- Header Separator -->
      <div class="header_separator_line"></div>
      
      <!-- Table Rows -->
      <div class="table_rows">
        <!-- Row separators -->
        <div class="row_separator" style="top: 45.83px;"></div>
        <div class="row_separator" style="top: 91.67px;"></div>
        <div class="row_separator" style="top: 137.5px;"></div>
        <div class="row_separator" style="top: 183.33px;"></div>
        <div class="row_separator" style="top: 229.17px;"></div>
        <div class="row_separator" style="top: 275px;"></div>
        <div class="row_separator" style="top: 320.83px;"></div>
        <div class="row_separator" style="top: 366.67px;"></div>
        <div class="row_separator" style="top: 412.5px;"></div>
        <div class="row_separator" style="top: 458.33px;"></div>
        
        <!-- Highlighted rows -->
        <div class="row_highlight" style="top: 91.67px;"></div>
        <div class="row_highlight" style="top: 137.5px;"></div>
        <div class="row_highlight" style="top: 365.75px;"></div>
        <div class="row_highlight" style="top: 320.83px;"></div>
        <div class="row_highlight" style="top: 458.33px;"></div>
        
        <!-- Requested By Column -->
        <div class="requested_by_column">
          <div v-for="(notif, index) in notifications" :key="notif._id" class="requested_by_item" :class="{ grayed: notif.is_read }">
            {{ notif.requested_by_name?.substring(0, 10) || 'Unknown' }}{{ notif.requested_by_name?.length > 10 ? '...' : '' }}
          </div>
        </div>
        
        <!-- Annotation Column -->
        <div class="annotation_column">
          <div v-for="(notif, index) in notifications" :key="notif._id" class="annotation_item" :class="{ grayed: notif.is_read }">
            {{ notif.action }}
          </div>
        </div>
        
        <!-- Establishment Column -->
        <div class="establishment_column">
          <div v-for="(notif, index) in notifications" :key="notif._id" class="establishment_item" :class="{ grayed: notif.is_read }">
            {{ notif.establishment_name }}
          </div>
        </div>
        
        <!-- Date Column -->
        <div class="date_column">
          <div v-for="(notif, index) in notifications" :key="notif._id" class="date_item" :class="{ grayed: notif.is_read }" :style="{ top: (index * 45.83) + 'px' }">
            {{ new Date(notif.date).toISOString().split('T')[0] }}
          </div>
        </div>
        
        <!-- Delete Icons -->
        <div class="delete_icons">
          <button v-if="notifications.length > 0" class="clear_all_button" @click="deleteAllNotifications" title="Clear all notifications">Clear</button>
          <i v-for="(notif, index) in notifications" :key="notif._id" class="pi pi-trash delete_icon" :style="{ top: (66.92 + index * 45.83) + 'px' }" @click="deleteNotification(notif._id)"></i>
        </div>
      </div>
    </div>
    
    <!-- Pagination Component -->
    <div class="dashboard_pagination_container">
      <Pagination 
        :currentPage="notificationPage"
        :totalPages="Math.ceil(notificationTotal / 11)"
        :totalItems="notificationTotal"
        :showInfo="false"
        @page-change="goToPage"
      />
    </div>
  </div>

  <!-- Alert Popup (Outside Dashboard to escape stacking context) -->
  <div v-if="state.showAlert" class="alert_popup" :class="`alert_${state.alertType}`">
    <i :class="state.alertType === 'success' ? 'pi pi-check-circle' : 'pi pi-exclamation-circle'" class="alert_icon"></i>
    <span class="alert_message">{{ state.alertMessage }}</span>
    <button class="alert_close" @click="state.showAlert = false">&times;</button>
  </div>

  <!-- Confirmation Dialog (Custom instead of browser confirm) -->
  <div v-if="state.showConfirmDialog" class="confirm_overlay">
    <div class="confirm_dialog">
      <div class="confirm_header">
        <i class="pi pi-exclamation-circle confirm_icon"></i>
        <span>Confirm Delete</span>
      </div>
      <div class="confirm_message">
        Are you sure you want to delete all notifications? This action cannot be undone.
      </div>
      <div class="confirm_buttons">
        <button class="confirm_btn cancel" @click="cancelDeleteAllNotifications">Cancel</button>
        <button class="confirm_btn ok" @click="confirmDeleteAllNotifications">Delete All</button>
      </div>
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
  refreshInterval: null as number | null,
  alertMessage: '',
  alertType: 'info' as 'success' | 'error' | 'info',
  showAlert: false,
  showConfirmDialog: false
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
watch(() => authStore.bln_Is_Admin, (bln_Is_Admin) => {
  if (!bln_Is_Admin) {
    window.location.href = authStore.obj_Current_User?.role === 'user' ? '/home' : '/'
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
  if (!authStore.bln_Is_Admin) {
    window.location.href = authStore.obj_Current_User?.role === 'user' ? '/home' : '/'
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

const deleteAllNotifications = async () => {
  console.log('=== CLEAR BUTTON CLICKED ===')
  console.log('Notifications count:', notifications.value.length)
  
  // Show custom confirmation dialog instead of browser confirm()
  state.showConfirmDialog = true
}

const confirmDeleteAllNotifications = async () => {
  console.log('User confirmed deletion')
  state.showConfirmDialog = false
  
  try {
    const token = localStorage.getItem('auth_token')
    console.log('Token exists:', !!token)
    
    if (!token) {
      state.alertMessage = 'Error: No authentication token found'
      state.alertType = 'error'
      state.showAlert = true
      return
    }
    
    state.loading = true
    
    // Fetch ALL notifications (not just current page)
    console.log('Fetching ALL notifications to delete...')
    const response = await fetch(`${BACKEND_URL}/api/notifications?limit=10000`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) throw new Error('Failed to fetch notifications')
    
    const data = await response.json()
    const allNotifications = data.data || []
    
    console.log('Total notifications to delete:', allNotifications.length)
    
    if (allNotifications.length === 0) {
      state.alertMessage = 'No notifications to delete'
      state.alertType = 'info'
      state.showAlert = true
      state.loading = false
      return
    }
    
    let successCount = 0
    let failureCount = 0
    
    // Delete all notifications
    console.log('Starting deletion loop...')
    for (const notif of allNotifications) {
      try {
        const deleteResponse = await fetch(`${BACKEND_URL}/api/notifications/${notif._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (deleteResponse.ok) {
          successCount++
          console.log(`Deleted ${successCount}/${allNotifications.length}`)
        } else {
          failureCount++
        }
      } catch (err) {
        console.error('Delete error:', err)
        failureCount++
      }
    }
    
    state.loading = false
    console.log('Deletion complete - Success:', successCount, 'Failed:', failureCount)
    
    // Show result message
    let alertMsg = ''
    if (failureCount === 0 && successCount > 0) {
      alertMsg = `Successfully deleted all ${successCount} notification(s)`
      state.alertType = 'success'
    } else if (failureCount > 0) {
      alertMsg = `Deleted ${successCount} notification(s), but ${failureCount} failed`
      state.alertType = failureCount > successCount ? 'error' : 'success'
    } else {
      alertMsg = `Failed to delete notifications`
      state.alertType = 'error'
    }
    
    state.alertMessage = alertMsg
    state.showAlert = true
    
    console.log('Alert displayed:', alertMsg)
    
    // Auto-hide alert after 3 seconds
    setTimeout(() => {
      state.showAlert = false
    }, 3000)
    
    // Refresh notifications after deleting all
    await fetchNotifications()
    notificationPage.value = 1 // Reset to first page
    
    console.log('=== DELETE ALL NOTIFICATIONS COMPLETED ===')
  } catch (error) {
    console.error('Delete all error:', error)
    state.loading = false
    state.alertMessage = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    state.alertType = 'error'
    state.showAlert = true
  }
}

const cancelDeleteAllNotifications = () => {
  console.log('User cancelled deletion')
  state.showConfirmDialog = false
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
.admin_dashboard {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #F6F7F8;
  overflow-x: hidden;
}

/* Dashboard Title */
.dashboard_title {
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
.stats_card {
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
.establishment_section {
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

.establishment_label {
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 600;
  font-size: 22px;
  line-height: 28px;
  text-align: center;
  color: #000000;
}

.establishment_count {
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 600;
  font-size: 22px;
  line-height: 28px;
  text-align: center;
  color: #000000;
}

/* Separator Lines */
.separator_line_1 {
  position: absolute;
  width: 100px;
  height: 0px;
  left: 200.85px;
  top: 60px;
  border: 1px solid #AB1C03;
  transform: rotate(90deg);
}

.separator_line_2 {
  position: absolute;
  width: 100px;
  height: 0px;
  left: 824.85px;
  top: 60px;
  border: 1px solid #AB1C03;
  transform: rotate(90deg);
}

/* Categories Frame */
.categories_frame {
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

.category_item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.category_item.private {
  width: 178px;
  height: 81px;
}

.category_item.government {
  width: 132px;
  height: 81px;
}

.category_item.overseas {
  width: 89px;
  height: 81px;
}

.category_item.mfu {
  width: 49px;
  height: 81px;
}

.category_label {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: 22px;
  line-height: 27px;
  text-align: center;
  white-space: nowrap;
}

.category_count {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: 22px;
  line-height: 27px;
  text-align: center;
}

.category_item.private .category_label,
.category_item.private .category_count {
  color: #0A48A6;
}

.category_item.government .category_label,
.category_item.government .category_count {
  color: #CF8200;
}

.category_item.overseas .category_label,
.category_item.overseas .category_count {
  color: #25A554;
}

.category_item.mfu .category_label,
.category_item.mfu .category_count {
  color: #AB1C03;
}

/* Roadshow Section */
.roadshow_section {
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

.roadshow_label {
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 600;
  font-size: 22px;
  line-height: 28px;
  text-align: center;
  color: #000000;
}

.roadshow_count {
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 600;
  font-size: 22px;
  line-height: 28px;
  text-align: center;
  color: #000000;
}

/* Notification Title */
.notification_title {
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
.notification_table {
  position: absolute;
  width: 1125px;
  height: 554.25px;
  left: 250px;
  top: 308px;
}

.table_header_line {
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
.requested_by_header {
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

.annotation_header {
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

.establishment_header {
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

.date_header {
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

/* Clear All Button */
.clear_all_button {
  position: absolute;
  top: 10px;
  right: 20px;
  background: #AB1C03;
  color: #FFFFFF;
  border: none;
  border-radius: 6px;
  padding: 8px 14px;
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 100;
  pointer-events: auto;
}

.clear_all_button:hover {
  background: #8B160A;
}

.clear_all_button:active {
  transform: scale(0.95);
}

/* Header Separator */
.header_separator_line {
  position: absolute;
  width: 1124.13px;
  height: 0px;
  left: 0.87px;
  top: 45.83px;
  border: 1px solid #AB1C03;
}

/* Table Rows */
.table_rows {
  position: relative;
  width: 100%;
  height: 100%;
}

/* Row Separators */
.row_separator {
  position: absolute;
  width: 1124.13px;
  height: 0px;
  left: 0.87px;
  border: 1px solid #A1A1A1;
}

/* Row Highlights */
.row_highlight {
  position: absolute;
  width: 1124.13px;
  height: 45.83px;
  left: 0px;
  background: rgba(81, 76, 163, 0.1);
}

/* Columns */
.requested_by_column {
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

.annotation_column {
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

.establishment_column {
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

.date_column {
  position: absolute;
  left: 932.74px;
  top: 66.92px;
  width: 97.86px;
}

/* Column Items */
.requested_by_item,
.annotation_item,
.establishment_item {
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

.annotation_item {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-size: 20px;
  line-height: 24px;
  height: 22px;
}

.establishment_item {
  text-align: left;
  justify-content: flex-start;
  width: 429.71px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.date_item {
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

.date_item:nth-child(1) { top: 0px; }
.date_item:nth-child(2) { top: 44px; }
.date_item:nth-child(3) { top: 85.25px; }
.date_item:nth-child(4) { top: 132px; }
.date_item:nth-child(5) { top: 178.75px; }
.date_item:nth-child(6) { top: 225.5px; }
.date_item:nth-child(7) { top: 270.42px; }
.date_item:nth-child(8) { top: 316.25px; }
.date_item:nth-child(9) { top: 361.17px; }
.date_item:nth-child(10) { top: 407.92px; }
.date_item:nth-child(11) { top: 451px; }

/* Grayed Items */
.grayed {
  color: #A1A1A1 !important;
}

/* Delete Icons */
.delete_icons {
  position: relative;
}

.delete_icon {
  position: absolute;
  width: 25.98px;
  height: 22px;
  left: 1060px;
  color: #C70000;
  font-size: 18px;
  cursor: pointer;
}

/* Dashboard Pagination Container */
.dashboard_pagination_container {
  position: absolute;
  left: 1182px;
  top: 892px;
  width: 218px;
  height: 28px;
}

/* Alert Popup Styles */
.alert_popup {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  max-width: 500px;
  padding: 16px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 2000;
  display: flex;
  align-items: center;
  gap: 12px;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.alert_popup.alert_success {
  border-left: 4px solid #4CAF50;
  background: #f1f8f4;
}

.alert_popup.alert_success .alert_icon {
  color: #4CAF50;
}

.alert_popup.alert_error {
  border-left: 4px solid #AB1C03;
  background: #fae8e5;
}

.alert_popup.alert_error .alert_icon {
  color: #AB1C03;
}

.alert_popup.alert_info {
  border-left: 4px solid #2196F3;
  background: #e3f2fd;
}

.alert_popup.alert_info .alert_icon {
  color: #2196F3;
}

.alert_icon {
  font-size: 20px;
  min-width: 20px;
  display: flex;
  align-items: center;
}

.alert_message {
  font-family: 'Outfit';
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  color: #333;
  flex: 1;
}

.alert_close {
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 0;
  margin: 0;
  margin-left: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.alert_close:hover {
  color: #333;
}

/* Confirmation Dialog Styles */
.confirm_overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.confirm_dialog {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  min-width: 350px;
  max-width: 450px;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.confirm_header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 20px 16px;
  border-bottom: 1px solid #e0e0e0;
  font-family: 'Outfit';
  font-weight: 600;
  font-size: 18px;
  color: #333;
}

.confirm_icon {
  font-size: 24px;
  color: #AB1C03;
}

.confirm_message {
  padding: 20px;
  font-family: 'Outfit';
  font-size: 14px;
  line-height: 20px;
  color: #666;
  text-align: center;
}

.confirm_buttons {
  display: flex;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid #e0e0e0;
  justify-content: flex-end;
}

.confirm_btn {
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  font-family: 'Outfit';
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.confirm_btn.cancel {
  background: #f0f0f0;
  color: #333;
}

.confirm_btn.cancel:hover {
  background: #e0e0e0;
}

.confirm_btn.ok {
  background: #AB1C03;
  color: white;
}

.confirm_btn.ok:hover {
  background: #8B160A;
}

.confirm_btn.ok:active {
  transform: scale(0.95);
}
</style>

