<template>
  <nav class="navbar">
    <div class="nav_container">
      <!-- Logo and Brand -->
      <div class="nav_brand">
        <a href="/home" class="brand_link">
          <div class="brand_logo">🎓</div>
          <span class="brand_text">CWIE Organization</span>
        </a>
      </div>

      <!-- Navigation Menu -->
      <div :class="['nav_menu', { 'nav_menu_active': isMenuOpen }]">
        <a href="/home" class="nav_link" @click="closeMenu">Home</a>
        <a href="/organizations" class="nav_link" @click="closeMenu">Organizations</a>
        <a href="/roadshows" class="nav_link" @click="closeMenu">Roadshows</a>
        <a href="/mou" class="nav_link" @click="closeMenu">MOU</a>
        
        <!-- Admin Links -->
        <template v-if="isAuthenticated && userRole === 'admin'">
          <a href="/admin/dashboard" class="nav_link" @click="closeMenu">Dashboard</a>
        </template>
      </div>

      <!-- Auth Actions -->
      <div class="nav_actions">
        <template v-if="isAuthenticated">
          <div class="user_menu">
            <button @click="toggleUserMenu" class="user_button">
              <span>{{ userName }}</span>
              <span class="user_arrow">▼</span>
            </button>
            
            <div v-if="isUserMenuOpen" class="user_dropdown">
              <a href="/profile" class="dropdown_link" @click="closeUserMenu">
                Profile
              </a>
              <button @click="handleLogout" class="dropdown_link">
                Logout
              </button>
            </div>
          </div>
        </template>
        
        <template v-else>
          <a href="/login" class="btn btn_primary">Login</a>
          <a href="/register" class="btn btn_secondary">Register</a>
        </template>
      </div>

      <!-- Mobile Menu Toggle -->
      <button @click="toggleMenu" class="mobile_menu_btn">
        <span class="hamburger_line" :class="{ active: isMenuOpen }"></span>
        <span class="hamburger_line" :class="{ active: isMenuOpen }"></span>
        <span class="hamburger_line" :class="{ active: isMenuOpen }"></span>
      </button>
    </div>

    <!-- WebSocket Connection Status -->
    <div v-if="showConnectionStatus" :class="['connection_status', connectionStatusClass]">
      {{ connectionStatusText }}
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const isMenuOpen = ref(false)
const isUserMenuOpen = ref(false)
const showConnectionStatus = ref(false)
const isAuthenticated = ref(false)
const userRole = ref<string | null>(null)
const userName = ref<string>('User')

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

const closeUserMenu = () => {
  isUserMenuOpen.value = false
}

const handleLogout = async () => {
  // Will implement auth later
  closeUserMenu()
  window.location.href = '/'
}

// WebSocket connection status
const connectionStatusClass = computed(() => {
  return 'disconnected' // Will implement WebSocket later
})

const connectionStatusText = computed(() => {
  return 'Ready' // Will implement WebSocket later
})

// Show connection status temporarily when it changes
let statusTimeout: NodeJS.Timeout | null = null

const showConnectionStatusTemporarily = () => {
  showConnectionStatus.value = true
  
  if (statusTimeout) {
    clearTimeout(statusTimeout)
  }
  
  statusTimeout = setTimeout(() => {
    showConnectionStatus.value = false
  }, 3000)
}

// Close menus when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  if (!target.closest('.user-menu')) {
    isUserMenuOpen.value = false
  }
  if (!target.closest('.nav-menu') && !target.closest('.mobile-menu-btn')) {
    isMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  
  // Show ready status
  showConnectionStatusTemporarily()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (statusTimeout) {
    clearTimeout(statusTimeout)
  }
})
</script>

<style scoped>
.navbar {
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav_container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 70px;
}

/* Brand */
.nav_brand {
  flex-shrink: 0;
}

.brand_link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #333;
  font-weight: 600;
  font-size: 1.2rem;
}

.brand_logo {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  border-radius: 8px;
  margin-right: 12px;
  color: white;
}

.brand_text {
  color: #007bff;
}

/* Navigation Menu */
.nav_menu {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin: 0 2rem;
}

.nav_link {
  text-decoration: none;
  color: #555;
  font-weight: 500;
  transition: color 0.2s;
  position: relative;
}

.nav_link:hover,
.nav-link.router_link_active {
  color: #007bff;
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #007bff;
}

/* Auth Actions */
.nav_actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

/* User Menu */
.user_menu {
  position: relative;
}

.user_button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: none;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.user_button:hover {
  border-color: #007bff;
}

.user_arrow {
  font-size: 12px;
  transition: transform 0.2s;
}

.user_button:hover .user_arrow {
  transform: rotate(180deg);
}

.user_dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 150px;
  overflow: hidden;
}

.dropdown_link {
  display: block;
  width: 100%;
  padding: 12px 16px;
  text-decoration: none;
  color: #333;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dropdown_link:hover {
  background-color: #f8f9fa;
}

/* Mobile Menu Button */
.mobile_menu_btn {
  display: none;
  flex-direction: column;
  width: 30px;
  height: 30px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  justify-content: center;
  align-items: center;
}

.hamburger_line {
  width: 20px;
  height: 2px;
  background-color: #333;
  transition: all 0.3s ease;
  margin: 2px 0;
}

.hamburger-line.active:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.hamburger-line.active:nth-child(2) {
  opacity: 0;
}

.hamburger-line.active:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -6px);
}

/* Connection Status */
.connection_status {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 16px;
  border-radius: 0 0 6px 6px;
  font-size: 12px;
  font-weight: 500;
  animation: slideDown 0.3s ease-out;
}

.connection-status.connected {
  background-color: #28a745;
  color: white;
}

.connection-status.disconnected {
  background-color: #dc3545;
  color: white;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .nav_container {
    padding: 0 16px;
  }

  .mobile_menu_btn {
    display: flex;
  }

  .nav_menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    flex-direction: column;
    padding: 20px;
    margin: 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    gap: 1rem;
  }

  .nav_menu_active {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }

  .nav_link {
    padding: 12px 0;
    border-bottom: 1px solid #eee;
  }

  .nav_link:last-child {
    border-bottom: none;
  }

  .nav_actions {
    gap: 8px;
  }

  .btn {
    padding: 8px 16px;
    font-size: 12px;
  }

  .brand_text {
    display: none;
  }
}

@media (max-width: 480px) {
  .user-button span:first-child {
    max-width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>

