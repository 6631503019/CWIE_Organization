<template>
  <div class="pagination-wrapper">
    <div class="pagination">
      <button 
        class="page-btn prev-btn" 
        @click="changePage(currentPage - 1)" 
        :disabled="currentPage <= 1 || loading"
        :class="{ disabled: currentPage <= 1 }"
      >
        &lt;
      </button>
      
      <template v-for="page in visiblePages" :key="page">
        <button 
          v-if="page !== '...'"
          class="page-btn" 
          :class="{ 'current-page': page === currentPage }"
          @click="changePage(page)"
          :disabled="loading"
        >
          {{ page }}
        </button>
        <span v-else class="page-dots">...</span>
      </template>
      
      <button 
        class="page-btn next-btn" 
        @click="changePage(currentPage + 1)" 
        :disabled="currentPage >= totalPages || loading"
        :class="{ disabled: currentPage >= totalPages }"
      >
        &gt;
      </button>
    </div>
    
    <div v-if="showInfo" class="pagination-info">
      Page {{ currentPage }} of {{ totalPages }} ({{ totalItems }} total items)
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineEmits, defineProps } from 'vue'

// Props
const props = defineProps<{
  currentPage: number
  totalPages: number
  totalItems?: number
  loading?: boolean
  showInfo?: boolean
}>()

// Emits
const emit = defineEmits<{
  'page-change': [page: number]
}>()

// Computed properties
const visiblePages = computed(() => {
  const pages = []
  const total = props.totalPages
  const current = props.currentPage
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...', total)
    } else if (current >= total - 3) {
      pages.push(1, '...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1, '...', current - 1, current, current + 1, '...', total)
    }
  }
  
  return pages
})

// Methods
const changePage = (page: number) => {
  if (page >= 1 && page <= props.totalPages && !props.loading) {
    emit('page-change', page)
  }
}
</script>

<style scoped>
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-btn {
  width: 28px;
  height: 28px;
  background: #FFFFFF;
  border: 1px solid #A1A1A1;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
  color: #000000;
  transition: all 0.2s ease;
}

.page-btn:hover:not(.disabled) {
  background: #f0f0f0;
}

.page-btn.current-page {
  background: #C70000;
  color: #FFFFFF;
}

.page-btn.current-page:hover {
  background: #C70000;
}

.page-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #F9F9F9;
}

.page-dots {
  color: #666666;
  font-size: 14px;
  padding: 0 4px;
}

.prev-btn, .next-btn {
  font-weight: 600;
  font-size: 16px;
}

.pagination-info {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: #666666;
  white-space: nowrap;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .pagination-wrapper {
    flex-direction: column;
    gap: 10px;
  }
  
  .page-btn {
    width: 24px;
    height: 24px;
    font-size: 12px;
  }
}
</style>