<template>
  <div class="admin-navbar">
    <!-- Logo Image -->
    <img 
      src="https://archives.mfu.ac.th/wp-content/uploads/2019/06/Mae-Fah-Luang-University-2.png" 
      alt="MFU Logo"
      class="logo-image"
    />
    
    <!-- MFU CWIE Title -->
    <span class="brand-title">MFU CWIE</span>
    
    <!-- Organization Database Subtitle -->
    <span class="brand-subtitle">Organization Database</span>

    <!-- Dashboard Link -->
    <a href="/admin/dashboard" 
       class="nav-dashboard" 
       :class="{ active: currentRoute === 'dashboard' }"
       @click.prevent="navigateTo('/admin/dashboard')">
      Dashboard
    </a>

    <!-- Organization Link -->
    <a href="/admin/organization" 
       class="nav-organization"
       :class="{ active: currentRoute === 'organization' }"
       @click.prevent="navigateTo('/admin/organization')">
      Organization
    </a>

    <!-- MOU Link -->
    <a href="/admin/mou" 
       class="nav-mou"
       :class="{ active: currentRoute === 'mou' }"
       @click.prevent="navigateTo('/admin/mou')">
      MOU
    </a>

    <!-- Roadshow Link -->
    <a href="/admin/roadshow" 
       class="nav-roadshow"
       :class="{ active: currentRoute === 'roadshow' }"
       @click.prevent="navigateTo('/admin/roadshow')">
      Roadshow
    </a>

    <!-- Profile Separator Line -->
    <div class="profile-separator"></div>

    <!-- Profile Avatar -->
    <div class="profile-avatar" @click="toggleProfileMenu">
      <i class="pi pi-user"></i>
    </div>

    <!-- Profile Name -->
    <span class="profile-name" @click="toggleProfileMenu">{{ authStore.user?.name || 'Thiwakorn Boayair...' }}</span>
    
    <!-- Logout Popup -->
    <div v-if="showProfileMenu" class="logout-popup">
      <div class="logout-option" @click="handleLogout">
        <i class="pi pi-sign-out"></i>
        <span>Logout</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

// Force reactivity with ref
const forceUpdate = ref(0)

// Profile menu state
const showProfileMenu = ref(false)

// Current route detection using Vue Router
const currentRoute = computed(() => {
  // Access forceUpdate to ensure reactivity
  forceUpdate.value
  
  const path = route.path
  console.log('Current path:', path) // Debug log
  
  if (path === '/admin/organization' || path.startsWith('/admin/organization/')) {
    console.log('Setting route to: organization')
    return 'organization'
  } else if (path === '/admin/mou' || path.startsWith('/admin/mou/')) {
    console.log('Setting route to: mou')
    return 'mou'
  } else if (path === '/admin/roadshow' || path.startsWith('/admin/roadshow/')) {
    console.log('Setting route to: roadshow')
    return 'roadshow'
  } else if (path === '/admin/dashboard' || path.startsWith('/admin/dashboard/')) {
    console.log('Setting route to: dashboard')
    return 'dashboard'
  }
  
  // Default fallback
  console.log('Setting route to: dashboard (default)')
  return 'dashboard'
})

// Watch route changes and force update
watch(
  () => route.path,
  async (newPath) => {
    console.log('Route changed to:', newPath)
    forceUpdate.value++
    await nextTick()
  },
  { immediate: true }
)

const navigateTo = (path: string) => {
  console.log('Navigating to:', path)
  // Use Vue Router for navigation
  router.push(path)
}

const toggleProfileMenu = () => {
  showProfileMenu.value = !showProfileMenu.value
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@600&family=Inter:wght@400;700&display=swap');
@import url('https://cdn.jsdelivr.net/npm/primeicons@6.0.1/primeicons.css');

/* Main Navbar Container */
.admin-navbar {
  position: fixed;
  width: 232px;
  height: 100vh;
  left: 0px;
  top: 0px;
  background: #FFFFFF;
  box-shadow: 0px 4px 4px #C97667;
  z-index: 1000;
}

/* Logo Image */
.logo-image {
  position: absolute;
  height: 62px;
  left: 35px;
  right: 150px;
  top: 25px;
  object-fit: contain;
}

/* Brand Title - MFU CWIE */
.brand-title {
  position: absolute;
  left: 82px;
  right: 35px;
  top: 30px;
  bottom: 917px;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 700;
  font-size: 18px;
  line-height: 22px;
  color: #F11408;
}

/* Brand Subtitle - Organization Database */
.brand-subtitle {
  position: absolute;
  left: 87px;
  right: 45px;
  top: 56px;
  bottom: 883px;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 700;
  font-size: 12px;
  line-height: 15px;
  color: #545454;
}

/* Dashboard Navigation */
.nav-dashboard {
  position: absolute;
  left: 35px;
  right: 35px;
  top: 111px;
  bottom: 830px;
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 600;
  font-size: 22px;
  line-height: 28px;
  color: #000000;
  text-decoration: none;
}

/* Organization Navigation */
.nav-organization {
  position: absolute;
  left: 35px;
  right: 35px;
  top: 165px;
  bottom: 776px;
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 600;
  font-size: 22px;
  line-height: 28px;
  color: #0F0F0F;
  text-decoration: none;
}

/* MOU Navigation */
.nav-mou {
  position: absolute;
  left: 35px;
  right: 35px;
  top: 219px;
  bottom: 722px;
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 600;
  font-size: 22px;
  line-height: 28px;
  color: #000000;
  text-decoration: none;
}

/* Roadshow Navigation */
.nav-roadshow {
  position: absolute;
  left: 35px;
  right: 35px;
  top: 273px;
  bottom: 668px;
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 600;
  font-size: 22px;
  line-height: 28px;
  color: #000000;
  text-decoration: none;
}

/* Profile Separator Line */
.profile-separator {
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 56px;
  height: 0px;
  border-top: 1px solid #A1A1A1;
}

/* Profile Avatar */
.profile-avatar {
  position: absolute;
  left: 13px;
  bottom: 10px;
  width: 40px;
  height: 40px;
  background: #F6F7F8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.profile-avatar .pi {
  font-size: 18px;
  color: #545454;
}

/* Profile Name */
.profile-name {
  position: absolute;
  left: 60px;
  right: 10px;
  bottom: 20px;
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 18px;
  color: #000000;
  cursor: pointer;
}

/* Logout Popup */
.logout-popup {
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 60px;
  background: #FFFFFF;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1001;
}

.logout-option {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: background 0.2s;
}

.logout-option:hover {
  background: #F6F7F8;
}

.logout-option i {
  font-size: 16px;
  color: #C70000;
}

.logout-option span {
  font-family: 'Outfit';
  font-size: 14px;
  font-weight: 600;
  color: #000000;
}

/* Active Navigation State */
.nav-dashboard.active,
.nav-organization.active,
.nav-mou.active,
.nav-roadshow.active {
  color: #C70000 !important;
}

/* Hover States */
.nav-dashboard:hover,
.nav-organization:hover,
.nav-mou:hover,
.nav-roadshow:hover {
  color: #C70000;
}
</style>