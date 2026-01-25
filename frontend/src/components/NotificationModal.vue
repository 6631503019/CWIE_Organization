<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="notification-modal" @click.stop :class="`type-${type}`">
      <div class="icon-container">
        <div class="icon" :class="`icon-${type}`"></div>
      </div>
      <p class="message">{{ message }}</p>
      <button class="btn-ok" @click="$emit('close')">OK</button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean
  message: string
  type: 'success' | 'error' | 'warning'
}>()

defineEmits<{
  (e: 'close'): void
}>()
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.notification-modal {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 32px 24px 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15);
  text-align: center;
}

.icon-container {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.type-success .icon-container {
  background: #DCFCE7;
}

.type-error .icon-container {
  background: #FEE2E2;
}

.type-warning .icon-container {
  background: #FEF3C7;
}

.icon {
  width: 32px;
  height: 32px;
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
}

.icon-success {
  background: #16A34A;
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z'/%3E%3C/svg%3E");
}

.icon-error {
  background: #DC2626;
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z'/%3E%3C/svg%3E");
}

.icon-warning {
  background: #F59E0B;
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z'/%3E%3C/svg%3E");
}

.message {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  color: #374151;
  margin: 0 0 24px;
  line-height: 1.5;
}

.btn-ok {
  padding: 10px 32px;
  background: #AB1C03;
  border: none;
  border-radius: 20px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #FFFFFF;
  cursor: pointer;
  min-width: 100px;
  transition: background 0.2s ease;
}

.btn-ok:hover {
  background: #8B1600;
}

.type-error .btn-ok {
  background: #DC2626;
}

.type-error .btn-ok:hover {
  background: #B91C1C;
}

.type-warning .btn-ok {
  background: #F59E0B;
}

.type-warning .btn-ok:hover {
  background: #D97706;
}
</style>
