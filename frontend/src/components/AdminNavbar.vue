<template>
  <div class="admin-navbar" @mouseenter="handleNavbarEnter"@mouseleave="handleNavbarLeave">
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

    <!-- Organization Link -->
    <a href="/admin/organization" 
       class="nav-organization"
       :class="{ active: currentRoute === 'organization' }"
       @click.prevent="navigateTo('/admin/organization')">
      <i class="pi pi-building nav-icon" aria-hidden="true"></i>
      Organization
    </a>

    <!-- MOU Link -->
    <a href="/admin/mou" 
       class="nav-mou"
       :class="{ active: currentRoute === 'mou' }"
       @click.prevent="navigateTo('/admin/mou')">
      <i class="pi pi-file nav-icon" aria-hidden="true"></i>
      MOU
    </a>

    <!-- Roadshow Link -->
    <a href="/admin/roadshow" 
       class="nav-roadshow"
       :class="{ active: currentRoute === 'roadshow' }"
       @click.prevent="navigateTo('/admin/roadshow')">
      <i class="pi pi-share-alt nav-icon" aria-hidden="true"></i>
      Roadshow
    </a>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'

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
  }

  // Default fallback
  console.log('Setting route to: organization (default)')
  return 'organization'
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
const handleNavbarEnter = () => {
  document.documentElement.style.setProperty(
    '--admin-navbar-width',
    '227px'
  )
}

const handleNavbarLeave = () => {
  document.documentElement.style.setProperty(
    '--admin-navbar-width',
    '66px'
  )
}

const navigateTo = (path: string) => {
  console.log('Navigating to:', path)
  // Use Vue Router for navigation
  router.push(path)
}

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@600&family=Inter:wght@400;700&display=swap');
@import url('https://cdn.jsdelivr.net/npm/primeicons@6.0.1/primeicons.css');

/* Main Navbar Container */
.admin-navbar {
  position: fixed;
  left: 0;
  right: auto;
  top: 0;
  bottom: 0;

  width: 66px;

  background: #8B0000;
  box-shadow: none;
  overflow: hidden;
  z-index: 1000;

  transition: width 0.2s ease;

  transform: translateX(0);
  flex: none;
}

.admin-navbar:hover {
  width: 227px;
}

/* Logo Image */
.logo-image {
  position: absolute;
  width: 43px;
  height: 56px;
  left: 15px;
  top: 10px;
  display: block;
  visibility: visible;
  object-fit: contain;
  z-index: 2;
}

/* Brand Title - MFU CWIE */
.brand-title {
  position: absolute;
  left: 76px;
  top: 19px;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 700;
  font-size: 15px;
  line-height: 18px;
  color: #FFFFFF;
  white-space: nowrap;
}

/* Brand Subtitle - Organization Database */
.brand-subtitle {
  position: absolute;
  left: 76px;
  top: 42px;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 700;
  font-size: 13px;
  line-height: 16px;
  color: #FFFFFF;
  white-space: nowrap;
}

/* Organization Navigation */
.nav-organization {
  position: absolute;
  left: 14px;
  top: 113px;
  width: 37px;
  height: 35px;
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 600;
  font-size: 22px;
  line-height: 28px;
  color: transparent;
  font-size: 0;
  text-decoration: none;
}

/* MOU Navigation */
.nav-mou {
  position: absolute;
  left: 14px;
  top: 168px;
  width: 37px;
  height: 35px;
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 600;
  font-size: 22px;
  line-height: 28px;
  color: transparent;
  font-size: 0;
  text-decoration: none;
}

/* Roadshow Navigation */
.nav-roadshow {
  position: absolute;
  left: 14px;
  top: 223px;
  width: 37px;
  height: 35px;
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 600;
  font-size: 22px;
  line-height: 28px;
  color: transparent;
  font-size: 0;
  text-decoration: none;
}

.nav-icon {
  position: absolute;
  left: 10px;
  top: 9px;
  width: 18px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  font-size: 18px;
  line-height: 20px;
}

/* Logout Popup */
.logout-popup {
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
.nav-organization.active,
.nav-mou.active,
.nav-roadshow.active {
  color: #C70000 !important;
}

/* Hover States */
.nav-organization:hover,
.nav-mou:hover,
.nav-roadshow:hover {
  color: #C70000;
}

.admin-navbar:hover .logo-image {
  left: 23px;
  top: 10px;
  width: 43px;
  height: 56px;
}
.admin-navbar:hover .brand-title,
.admin-navbar:hover .brand-subtitle { display: block; }
.admin-navbar:hover .nav-organization,
.admin-navbar:hover .nav-mou,
.admin-navbar:hover .nav-roadshow {
  left: 26px;
  width: 170px;
  color: #FFFFFF;
  font-size: 20px;
  line-height: 24px;
  text-decoration: none;
  padding-left: 54px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}
.admin-navbar:hover .nav-icon {
  left: 11px;
  top: 7px;
  color: #FFFFFF;
  font-size: 18px;
}
.admin-navbar:hover .nav-organization { top: 113px; }
.admin-navbar:hover .nav-mou { top: 168px; }
.admin-navbar:hover .nav-roadshow { top: 223px; }
.admin-navbar:hover .nav-organization.active { background: #600606; border-radius: 2px; }
</style>