<template>
  <div class="pagination-wrapper">
    <div class="pagination">
      <!-- Double Left -->
      <button 
        class="page-btn first-btn" 
        @click="changePage(1)" 
        :disabled="currentPage <= 1 || loading"
        :class="{ disabled: currentPage <= 1 }"
        title="First Page"
      >
        <i class="pi pi-angle-double-left"></i>
      </button>
      
      <!-- Back -->
      <button 
        class="page-btn prev-btn" 
        @click="changePage(currentPage - 1)" 
        :disabled="currentPage <= 1 || loading"
        :class="{ disabled: currentPage <= 1 }"
        title="Previous Page"
      >
        <i class="pi pi-angle-left"></i>
      </button>
      
      <!-- Page Numbers -->
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
        <button v-else class="page-btn ellipsis-btn" disabled>
          <i class="pi pi-ellipsis-h"></i>
        </button>
      </template>
      
      <!-- Forward -->
      <button 
        class="page-btn next-btn" 
        @click="changePage(currentPage + 1)" 
        :disabled="currentPage >= totalPages || loading"
        :class="{ disabled: currentPage >= totalPages }"
        title="Next Page"
      >
        <i class="pi pi-angle-right"></i>
      </button>
      
      <!-- Double Right -->
      <button 
        class="page-btn last-btn" 
        @click="changePage(totalPages)" 
        :disabled="currentPage >= totalPages || loading"
        :class="{ disabled: currentPage >= totalPages }"
        title="Last Page"
      >
        <i class="pi pi-angle-double-right"></i>
      </button>
    </div>
    
    <div v-if="showInfo" class="pagination-info">
      Page {{ currentPage }} of {{ totalPages }} ({{ totalItems }} total items)
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

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
@import url('https://cdn.jsdelivr.net/npm/primeicons@6.0.1/primeicons.css');

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
  gap: 6px;
}

.page-btn {
  box-sizing: border-box;
  width: 21px;
  height: 21px;
  background: #FFFFFF;
  border: 1px solid #A1A1A1;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 10px;
  line-height: 13px;
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

.ellipsis-btn {
  cursor: default !important;
  opacity: 1 !important;
  background: #FFFFFF !important;
}

.page-dots {
  color: #666666;
  font-size: 14px;
  padding: 0 4px;
}

.prev-btn, .next-btn {
  font-weight: 600;
  font-size: 12px;
}

.page-btn i {
  font-size: 10px;
}

.pagination-info {
  font-family: 'Inter', sans-serif;
  font-size: 9px;
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