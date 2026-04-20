<template>
  <div class="organization_list">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading_state">
      <div class="spinner"></div>
      <p>Loading organizations...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error_state">
      <p>{{ error }}</p>
      <button @click="retry" class="btn_retry">Retry</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="organizations.length === 0" class="empty_state">
      <h3>No Organizations Found</h3>
      <p>{{ emptyMessage || 'Start by adding your first organization.' }}</p>
      <button v-if="showAddButton" @click="$emit('add')" class="btn_add">
        Add Organization
      </button>
    </div>

    <!-- Organizations Grid -->
    <div v-else class="organizations_grid">
      <OrganizationCard
        v-for="organization in organizations"
        :key="organization.id"
        :organization="organization"
        :show-actions="showActions"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
        @view="$emit('view', $event)"
      />
    </div>

    <!-- Pagination -->
    <div v-if="showPagination && pagination.totalPages > 1" class="pagination">
      <button
        @click="$emit('page_change', pagination.currentPage - 1)"
        :disabled="pagination.currentPage <= 1"
        class="pagination_btn"
      >
        Previous
      </button>

      <div class="page_numbers">
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="$emit('page_change', page)"
          :class="['page_btn', { active: page === pagination.currentPage }]"
        >
          {{ page }}
        </button>
      </div>

      <button
        @click="$emit('page_change', pagination.currentPage + 1)"
        :disabled="pagination.currentPage >= pagination.totalPages"
        class="pagination_btn"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import OrganizationCard from './OrganizationCard.vue'

interface Organization {
  id: string
  name: string
  description: string
  website: string
  location: string
  category: string
  contactEmail: string
  contactPhone: string
  logoUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface Pagination {
  currentPage: number
  totalPages: number
  totalCount: number
  limit: number
}

interface Props {
  organizations: Organization[]
  isLoading?: boolean
  error?: string | null
  pagination?: Pagination
  showActions?: boolean
  showPagination?: boolean
  showAddButton?: boolean
  emptyMessage?: string
}

interface Emits {
  (e: 'edit', organization: Organization): void
  (e: 'delete', id: string): void
  (e: 'view', id: string): void
  (e: 'add'): void
  (e: 'retry'): void
  (e: 'page_change', page: number): void
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  error: null,
  showActions: false,
  showPagination: false,
  showAddButton: false,
  pagination: () => ({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10
  })
})

const emit = defineEmits<Emits>()

const visiblePages = computed(() => {
  const current = props.pagination.currentPage
  const total = props.pagination.totalPages
  const pages: number[] = []
  
  // Show max 5 pages around current page
  const start = Math.max(1, current - 2)
  const end = Math.min(total, current + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

const retry = () => {
  emit('retry')
}
</script>

<style scoped>
.organization_list {
  width: 100%;
}

.loading_state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error_state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.error-state p {
  color: #dc3545;
  margin-bottom: 16px;
}

.btn_retry {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn_retry:hover {
  background-color: #0056b3;
}

.empty_state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.empty-state h3 {
  color: #6c757d;
  margin-bottom: 8px;
}

.empty-state p {
  color: #6c757d;
  margin-bottom: 20px;
}

.btn_add {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn_add:hover {
  background-color: #218838;
}

.organizations_grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 32px;
}

.pagination_btn {
  padding: 8px 16px;
  border: 1px solid #dee2e6;
  background-color: white;
  color: #495057;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination_btn:hover:not(:disabled) {
  background-color: #e9ecef;
  border-color: #adb5bd;
}

.pagination_btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page_numbers {
  display: flex;
  gap: 4px;
}

.page_btn {
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  background-color: white;
  color: #495057;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 40px;
}

.page_btn:hover {
  background-color: #e9ecef;
  border-color: #adb5bd;
}

.page-btn.active {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
}

.page-btn.active:hover {
  background-color: #0056b3;
  border-color: #0056b3;
}

/* Responsive */
@media (max-width: 768px) {
  .organizations_grid {
    grid-template-columns: 1fr;
  }
  
  .pagination {
    flex-wrap: wrap;
  }
  
  .page_numbers {
    order: -1;
    width: 100%;
    justify-content: center;
    margin-bottom: 8px;
  }
}
</style>
