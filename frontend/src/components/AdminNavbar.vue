<template>
  <div class="admin_navbar">
    <!-- Logo Image -->
    <img 
      src="https://archives.mfu.ac.th/wp-content/uploads/2019/06/Mae-Fah-Luang-University-2.png" 
      alt="MFU Logo"
      class="logo_image"
    />
    
    <!-- MFU CWIE Title -->
    <span class="brand_title">MFU CWIE</span>
    
    <!-- Organization Database Subtitle -->
    <span class="brand_subtitle">Organization Database</span>

    <!-- Dashboard Link -->
    <a href="/admin/dashboard" 
       class="nav_dashboard" 
       :class="{ active: currentRoute === 'dashboard' }"
       @click.prevent="navigateTo('/admin/dashboard')">
      Dashboard
    </a>

    <!-- Organization Link -->
    <a href="/admin/organization" 
       class="nav_organization"
       :class="{ active: currentRoute === 'organization' }"
       @click.prevent="navigateTo('/admin/organization')">
      Organization
    </a>

    <!-- MOU Link -->
    <a href="/admin/mou" 
       class="nav_mou"
       :class="{ active: currentRoute === 'mou' }"
       @click.prevent="navigateTo('/admin/mou')">
      MOU
    </a>

    <!-- Roadshow Link -->
    <a href="/admin/roadshow" 
       class="nav_roadshow"
       :class="{ active: currentRoute === 'roadshow' }"
       @click.prevent="navigateTo('/admin/roadshow')">
      Roadshow
    </a>

    <!-- Profile Separator Line -->
    <div class="profile_separator"></div>

    <!-- Profile Avatar -->
    <div class="profile_avatar">
      <i class="pi pi-user"></i>
    </div>

    <!-- Profile Name -->
    <span class="profile_name">{{ authStore.obj_Current_User?.name || 'Thiwakorn Boayair...' }}</span>

    <!-- Logout Icon -->
    <i class="pi pi-sign-out logout_icon" @click="handleLogout" title="Logout"></i>
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
.admin_navbar {
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
.logo_image {
  position: absolute;
  height: 62px;
  left: 35px;
  right: 150px;
  top: 25px;
  object-fit: contain;
}

/* Brand Title - MFU CWIE */
.brand_title {
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
.brand_subtitle {
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
.nav_dashboard {
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
.nav_organization {
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
.nav_mou {
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
.nav_roadshow {
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
.profile_separator {
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 56px;
  height: 0px;
  border-top: 1px solid #A1A1A1;
}

/* Profile Avatar */
.profile_avatar {
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

.profile_avatar .pi {
  font-size: 18px;
  color: #545454;
}

/* Profile Name */
.profile_name {
  position: absolute;
  left: 60px;
  right: 40px;
  bottom: 20px;
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 18px;
  color: #000000;
}

/* Logout Icon */
.logout_icon {
  position: absolute;
  right: 13px;
  bottom: 18px;
  font-size: 18px;
  color: #C70000;
  cursor: pointer;
  transition: transform 0.2s;
}

.logout_icon:hover {
  transform: scale(1.2);
}

/* Logout Popup */
.logout_popup {
  position: absolute;
  right: 10px;
  bottom: 60px;
  background: #FFFFFF;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  min-width: 120px;
}

/* Active Navigation State */
.nav_dashboard.active,
.nav_organization.active,
.nav_mou.active,
.nav_roadshow.active {
  color: #C70000 !important;
}

/* Hover States */
.nav_dashboard:hover,
.nav_organization:hover,
.nav_mou:hover,
.nav_roadshow:hover {
  color: #C70000;
}
</style>

