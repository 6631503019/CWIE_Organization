<template>
  <div class="user-navbar">
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

    <div class="language-switcher" aria-label="Language selector">
      <button type="button" :class="{ selected: currentLanguage === 'EN' }" @click="setLanguage('EN')">EN</button>
      <button type="button" :class="{ selected: currentLanguage === 'TH' }" @click="setLanguage('TH')">TH</button>
    </div>

    <!-- Organization Link -->
    <a href="/user/organization" 
       class="nav-organization"
       :class="{ active: currentRoute === 'organization' }"
       @click.prevent="navigateTo('/user/organization')">
      <i class="pi pi-building nav-icon" aria-hidden="true"></i>{{ text('Organization', 'องค์กร') }}
    </a>

    <!-- MOU Link -->
    <a href="/user/mou" 
       class="nav-mou"
       :class="{ active: currentRoute === 'mou' }"
       @click.prevent="navigateTo('/user/mou')">
      <i class="pi pi-file nav-icon" aria-hidden="true"></i>{{ text('MOU', 'บันทึกความร่วมมือ') }}
    </a>

    <!-- Roadshow Link -->
    <a href="/user/roadshow" 
       class="nav-roadshow"
       :class="{ active: currentRoute === 'roadshow' }"
       @click.prevent="navigateTo('/user/roadshow')">
      <i class="pi pi-share-alt nav-icon" aria-hidden="true"></i>{{ text('Roadshow', 'โรดโชว์') }}
    </a>

    <!-- Profile Separator Line -->
    <div class="profile-separator"></div>

    <!-- Profile Avatar -->
    <div class="profile-avatar">
      <i class="pi pi-user"></i>
    </div>

    <!-- Profile Name -->
    <span class="profile-name">{{ authStore.user?.email || authStore.user?.name || 'Student User' }}</span>

    <!-- Logout Icon -->
    <i class="pi pi-sign-out logout-icon" @click="handleLogout" title="Logout"></i>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useLanguage } from '../composables/useLanguage'

const authStore = useAuthStore()
const { currentLanguage, setLanguage, text } = useLanguage()
const router = useRouter()
const route = useRoute()

const forceUpdate = ref(0)

const currentRoute = computed(() => {
  forceUpdate.value
  const path = route.path
  console.log('Current path:', path)
  
  if (path === '/user/organization' || path.startsWith('/user/organization/')) {
    console.log('Setting route to: organization')
    return 'organization'
  } else if (path === '/user/mou' || path.startsWith('/user/mou/')) {
    console.log('Setting route to: mou')
    return 'mou'
  } else if (path === '/user/roadshow' || path.startsWith('/user/roadshow/')) {
    console.log('Setting route to: roadshow')
    return 'roadshow'
  }
  
  console.log('Setting route to: organization (default)')
  return 'organization'
})

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
  router.push(path)
}

const handleLogout = async () => {
  try {
    await authStore.Logout()
    router.push('/')
  } catch (error) {
    console.error('Logout error:', error)
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@600&family=Inter:wght@400;700&display=swap');
@import url('https://cdn.jsdelivr.net/npm/primeicons@6.0.1/primeicons.css');

/* Main Navbar Container */
.user-navbar {
  position: fixed;
  width: 66px;
  height: 100vh;
  left: 0px;
  top: 0px;
  background: #8B0000;
  box-shadow: none;
  z-index: 1000;
  overflow: hidden;
  transition: width 0.2s ease;
}

.user-navbar:hover {
  width: 227px;
}

/* Logo Image */
.logo-image {
  position: absolute;
  width: 43px;
  height: 56px;
  left: 15px;
  top: 10px;
  object-fit: contain;
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
  line-height: 22px;
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
  font-size: 12px;
  line-height: 15px;
  color: #FFFFFF;
  white-space: nowrap;
}

.language-switcher {
  position: absolute;
  top: 82px;
  left: 76px;
  display: flex;
  gap: 3px;
}

.language-switcher button {
  border: 1px solid rgba(255, 255, 255, 0.7);
  background: transparent;
  color: #FFFFFF;
  font-size: 10px;
  cursor: pointer;
}

.language-switcher button.selected {
  background: #FFFFFF;
  color: #8B0000;
}

/* Organization Navigation */
.nav-organization {
  position: absolute;
  left: 76px;
  right: 16px;
  top: 111px;
  bottom: 830px;
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 24px;
  color: #FFFFFF;
  text-decoration: none;
}

.nav-icon {
  width: 22px;
  margin-right: 8px;
}

/* MOU Navigation */
.nav-mou {
  position: absolute;
  left: 35px;
  right: 35px;
  top: 153px;
  bottom: auto;
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 24px;
  color: #FFFFFF;
  text-decoration: none;
}

/* Roadshow Navigation */
.nav-roadshow {
  position: absolute;
  left: 35px;
  right: 35px;
  top: 201px;
  bottom: auto;
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 24px;
  color: #FFFFFF;
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
  right: 40px;
  bottom: 20px;
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 18px;
  color: #FFFFFF;
}

/* Logout Icon */
.logout-icon {
  position: absolute;
  right: 13px;
  bottom: 18px;
  font-size: 18px;
  color: #FFFFFF;
  cursor: pointer;
  transition: transform 0.2s;
}

.logout-icon:hover {
  transform: scale(1.2);
}

/* Active Navigation State */
.nav-organization.active,
.nav-mou.active,
.nav-roadshow.active {
  color: #FFFFFF !important;
  background: rgba(255, 255, 255, 0.16);
}

/* Hover States */
.nav-organization:hover,
.nav-mou:hover,
.nav-roadshow:hover {
  color: #FFFFFF;
}
</style>
