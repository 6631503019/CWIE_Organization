<template>
  <header class="admin_top_bar">
    <div class="admin_top_bar_actions">
      <div class="language_switcher" aria-label="Language selector">
        <button
          type="button"
          :class="{ selected: currentLanguage === 'EN' }"
          :aria-pressed="currentLanguage === 'EN'"
          @click="setLanguage('EN')"
        >EN</button>
        <button
          type="button"
          :class="{ selected: currentLanguage === 'TH' }"
          :aria-pressed="currentLanguage === 'TH'"
          @click="setLanguage('TH')"
        >TH</button>
      </div>

      <div ref="adminMenuRef" class="admin_menu">
        <button
          type="button"
          class="admin_badge"
          :aria-expanded="isMenuOpen"
          aria-haspopup="menu"
          @click="isMenuOpen = !isMenuOpen"
        >
          <span class="admin_avatar">A</span>
          <span>{{ userName }}</span>
          <span class="admin_menu_arrow" aria-hidden="true">&#9662;</span>
        </button>
        <div v-if="isMenuOpen" class="admin_dropdown" role="menu">
          <div class="admin_dropdown_user">{{ userName }}</div>
          <button type="button" role="menuitem" class="admin_logout" @click="handleLogout">
            {{ text('Logout', 'ออกจากระบบ') }}
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useLanguage } from '../../composables/useLanguage'

withDefaults(defineProps<{
  userName?: string
}>(), {
  userName: 'Admin User'
})

const router = useRouter()
const authStore = useAuthStore()
const { currentLanguage, setLanguage, text } = useLanguage()
const isMenuOpen = ref(false)
const adminMenuRef = ref<HTMLElement | null>(null)

const handleDocumentClick = (event: MouseEvent) => {
  if (adminMenuRef.value && !adminMenuRef.value.contains(event.target as Node)) {
    isMenuOpen.value = false
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') isMenuOpen.value = false
}

const handleLogout = async () => {
  isMenuOpen.value = false
  await authStore.Logout()
  await router.push('/')
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.admin_top_bar {
  position: relative;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 50px;
  padding: 8px 24px;
  box-sizing: border-box;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}

.admin_top_bar_actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 18px;
  flex: 0 0 auto;
}

.language_switcher {
  display: flex;
  gap: 3px;
}

.language_switcher button {
  width: 33px;
  height: 26px;
  border: 1px solid #a1a1a1;
  border-radius: 2px;
  background: #ffffff;
  color: #1f2937;
  cursor: pointer;
  font: 600 12px/15px Inter, sans-serif;
}

.language_switcher button.selected {
  border-color: #8b0000;
  background: #8b0000;
  color: #ffffff;
}

.admin_menu {
  position: relative;
}

.admin_badge {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
  height: 36px;
  padding: 6px 10px;
  border: 0;
  border-radius: 20px;
  background: #f3f4f6;
  color: #1f2937;
  cursor: pointer;
  font: 600 12px/15px Inter, sans-serif;
}

.admin_avatar {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #8b0000;
  color: #ffffff;
}

.admin_menu_arrow {
  margin-left: auto;
  font-size: 10px;
}

.admin_dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 30;
  width: 160px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(0, 0, 0, .14);
}

.admin_dropdown_user {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  color: #1f2937;
  font: 600 12px/16px Inter, sans-serif;
}

.admin_logout {
  width: 100%;
  padding: 11px 12px;
  border: 0;
  background: #ffffff;
  color: #8b0000;
  cursor: pointer;
  text-align: left;
  font: 500 12px/16px Inter, sans-serif;
}

.admin_logout:hover,
.admin_logout:focus-visible {
  background: #fef2f2;
}

@media (max-width: 640px) {
  .admin_top_bar { padding-inline: 12px; }
  .admin_top_bar_actions { gap: 8px; }
  .admin_badge { min-width: 42px; width: 42px; padding: 6px 8px; }
  .admin_badge > span:not(.admin_avatar):not(.admin_menu_arrow) { display: none; }
}
</style>
