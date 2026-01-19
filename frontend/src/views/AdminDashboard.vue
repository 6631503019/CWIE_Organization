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
          <div class="requested-by-item">Tew Hon...</div>
          <div class="requested-by-item">Tew Hon...</div>
          <div class="requested-by-item grayed">Nacha C...</div>
          <div class="requested-by-item grayed">Vittaya...</div>
          <div class="requested-by-item">Nacha Ch...</div>
          <div class="requested-by-item">Tew Hon...</div>
          <div class="requested-by-item">Vittaya...</div>
          <div class="requested-by-item grayed">Tew Hon...</div>
          <div class="requested-by-item grayed">Nacha C...</div>
          <div class="requested-by-item">Nacha C...</div>
          <div class="requested-by-item grayed">Nacha Ch...</div>
        </div>
        
        <!-- Annotation Column -->
        <div class="annotation-column">
          <div class="annotation-item">Add</div>
          <div class="annotation-item">Add</div>
          <div class="annotation-item grayed">Add</div>
          <div class="annotation-item grayed">Blacklist</div>
          <div class="annotation-item">Add</div>
          <div class="annotation-item">Add</div>
          <div class="annotation-item">Add</div>
          <div class="annotation-item grayed">Add</div>
          <div class="annotation-item grayed">Blacklist</div>
          <div class="annotation-item">Add</div>
          <div class="annotation-item grayed">Add</div>
        </div>
        
        <!-- Establishment Column -->
        <div class="establishment-column">
          <div class="establishment-item">Prezon technology company limited</div>
          <div class="establishment-item">MFU</div>
          <div class="establishment-item grayed">Back End Developer (Node.js + Express)</div>
          <div class="establishment-item grayed">บริษัท ทีวีดี โฮลดิ้งส์ จำกัด(มหาชน)</div>
          <div class="establishment-item">Prezon technology company limited</div>
          <div class="establishment-item">SUNSU</div>
          <div class="establishment-item">MFU</div>
          <div class="establishment-item grayed">Back End Developer (Node.js + Express)</div>
          <div class="establishment-item">TVD Holdings Public Company</div>
          <div class="establishment-item">Prezon technology company limited</div>
          <div class="establishment-item grayed">SUNSU</div>
        </div>
        
        <!-- Date Column -->
        <div class="date-column">
          <div class="date-item">2025-10-23</div>
          <div class="date-item">2025-10-23</div>
          <div class="date-item grayed">2025-10-23</div>
          <div class="date-item grayed">2025-10-23</div>
          <div class="date-item">2025-10-23</div>
          <div class="date-item">2025-10-23</div>
          <div class="date-item">2025-10-23</div>
          <div class="date-item grayed">2025-10-23</div>
          <div class="date-item grayed">2025-10-23</div>
          <div class="date-item">2025-10-23</div>
          <div class="date-item grayed">2025-10-23</div>
        </div>
        
        <!-- Delete Icons -->
        <div class="delete-icons">
          <i class="pi pi-trash delete-icon" style="top: 62.33px;"></i>
          <i class="pi pi-trash delete-icon" style="top: 106.33px;"></i>
          <i class="pi pi-trash delete-icon" style="top: 149.42px;"></i>
          <i class="pi pi-trash delete-icon" style="top: 196.17px;"></i>
          <i class="pi pi-trash delete-icon" style="top: 245.67px;"></i>
          <i class="pi pi-trash delete-icon" style="top: 290.58px;"></i>
          <i class="pi pi-trash delete-icon" style="top: 334.58px;"></i>
          <i class="pi pi-trash delete-icon" style="top: 379.5px;"></i>
          <i class="pi pi-trash delete-icon" style="top: 429px;"></i>
          <i class="pi pi-trash delete-icon" style="top: 472.08px;"></i>
        </div>
      </div>
    </div>
    
    <!-- Pagination Component -->
    <div class="dashboard-pagination-container">
      <Pagination 
        :currentPage="1"
        :totalPages="2"
        :totalItems="11"
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

const authStore = useAuthStore()

// Reactive state management
const state = reactive({
  loading: false,
  error: null as string | null,
  refreshInterval: null as number | null
})

// Dashboard statistics
const stats = reactive({
  totalEstablishments: 123,
  privateCompany: 70,
  government: 40,
  overseas: 3,
  mfu: 10,
  roadshows: 10
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
    // Simulate API call for fresh stats
    await new Promise(resolve => setTimeout(resolve, 500))
    // In real app, fetch from API
    console.log('Stats refreshed')
  } catch (error) {
    state.error = 'Failed to refresh statistics'
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
  
  // Setup auto-refresh every 5 minutes
  state.refreshInterval = window.setInterval(refreshStats, 5 * 60 * 1000)
})

onBeforeUnmount(() => {
  console.log('Dashboard unmounting - cleaning up')
  if (state.refreshInterval) {
    clearInterval(state.refreshInterval)
  }
})

// Sample notification data
const notifications = ref([
  {
    requestedBy: "Tew Hon...",
    annotation: "Add",
    establishment: "Prezon technology company limited",
    date: "2025-10-23",
    highlighted: false
  },
  {
    requestedBy: "Tew Hon...",
    annotation: "Add",
    establishment: "MFU",
    date: "2025-10-23",
    highlighted: false
  },
  {
    requestedBy: "Nacha C...",
    annotation: "Add",
    establishment: "Back End Developer (Node.js + Express)",
    date: "2025-10-23",
    highlighted: true
  },
  {
    requestedBy: "Vittaya...",
    annotation: "Blacklist",
    establishment: "บริษัท ทีวีดี โฮลดิ้งส์ จำกัด(มหาชน)",
    date: "2025-10-23",
    highlighted: true
  },
  {
    requestedBy: "Nacha Ch...",
    annotation: "Add",
    establishment: "Prezon technology company limited",
    date: "2025-10-23",
    highlighted: false
  },
  {
    requestedBy: "Tew Hon...",
    annotation: "Add",
    establishment: "SUNSU",
    date: "2025-10-23",
    highlighted: false
  },
  {
    requestedBy: "Vittaya...",
    annotation: "Add",
    establishment: "MFU",
    date: "2025-10-23",
    highlighted: false
  },
  {
    requestedBy: "Tew Hon...",
    annotation: "Add",
    establishment: "Back End Developer (Node.js + Express)",
    date: "2025-10-23",
    highlighted: true
  },
  {
    requestedBy: "Nacha C...",
    annotation: "Blacklist",
    establishment: "TVD Holdings Public Company",
    date: "2025-10-23",
    highlighted: true
  },
  {
    requestedBy: "Nacha C...",
    annotation: "Add",
    establishment: "Prezon technology company limited",
    date: "2025-10-23",
    highlighted: false
  }
])

const deleteNotification = (index: number) => {
  notifications.value.splice(index, 1)
}

const goToPage = (page: number) => {
  // Implement pagination logic
  console.log('Navigate to page:', page)
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
  left: 1064.38px;
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