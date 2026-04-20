<template>
  <div class="user_navbar">
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

    <!-- Organization Link -->
    <a href="/user/organization" 
       class="nav_organization"
       :class="{ active: currentRoute === 'organization' }"
       @click.prevent="navigateTo('/user/organization')">
      Organization
    </a>

    <!-- MOU Link -->
    <a href="/user/mou" 
       class="nav_mou"
       :class="{ active: currentRoute === 'mou' }"
       @click.prevent="navigateTo('/user/mou')">
      MOU
    </a>

    <!-- Roadshow Link -->
    <a href="/user/roadshow" 
       class="nav_roadshow"
       :class="{ active: currentRoute === 'roadshow' }"
       @click.prevent="navigateTo('/user/roadshow')">
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
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
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
.user_navbar {
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

/* Organization Navigation */
.nav_organization {
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

/* MOU Navigation */
.nav_mou {
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
  color: #000000;
  text-decoration: none;
}

/* Roadshow Navigation */
.nav_roadshow {
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

.profile-avatar .pi {
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

/* Active Navigation State */
.nav-organization.active,
.nav-mou.active,
.nav-roadshow.active {
  color: #C70000 !important;
}

/* Hover States */
.nav_organization:hover,
.nav_mou:hover,
.nav_roadshow:hover {
  color: #C70000;
}
</style>


