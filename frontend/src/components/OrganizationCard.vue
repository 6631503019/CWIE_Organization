<template>
  <div class="organization-card">
    <div class="card-header">
      <img 
        v-if="organization.logoUrl" 
        :src="organization.logoUrl" 
        :alt="`${organization.name} logo`"
        class="org-logo"
      />
      <div class="org-info">
        <h3 class="org-name">{{ organization.name }}</h3>
        <p class="org-category">{{ organization.category }}</p>
      </div>
      <div class="card-actions">
        <button 
          v-if="showActions"
          @click="$emit('edit', organization)"
          class="btn-edit"
          :disabled="isLoading"
        >
          Edit
        </button>
        <button 
          v-if="showActions"
          @click="handleDelete"
          class="btn-delete"
          :disabled="isLoading"
        >
          Delete
        </button>
      </div>
    </div>

    <div class="card-body">
      <p class="org-description">{{ organization.description }}</p>
      
      <div class="org-details">
        <div class="detail-item">
          <strong>Location:</strong> {{ organization.location }}
        </div>
        <div class="detail-item" v-if="organization.website">
          <strong>Website:</strong> 
          <a :href="organization.website" target="_blank" rel="noopener">
            {{ organization.website }}
          </a>
        </div>
        <div class="detail-item">
          <strong>Contact:</strong> {{ organization.contactEmail }}
        </div>
      </div>

      <div class="card-footer">
        <span :class="['status-badge', organization.isActive ? 'active' : 'inactive']">
          {{ organization.isActive ? 'Active' : 'Inactive' }}
        </span>
        <span class="created-date">
          Created: {{ formatDate(organization.createdAt) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

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

interface Props {
  organization: Organization
  showActions?: boolean
}

interface Emits {
  (e: 'edit', organization: Organization): void
  (e: 'delete', id: string): void
  (e: 'view', id: string): void
}

const props = withDefaults(defineProps<Props>(), {
  showActions: false
})

const emit = defineEmits<Emits>()

const isLoading = ref(false)

const handleDelete = () => {
  if (confirm(`Are you sure you want to delete ${props.organization.name}?`)) {
    emit('delete', props.organization.id)
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style scoped>
.organization-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  overflow: hidden;
}

.organization-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.org-logo {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  margin-right: 16px;
}

.org-info {
  flex: 1;
}

.org-name {
  margin: 0 0 4px 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

.org-category {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.btn-edit,
.btn-delete {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-edit {
  background-color: #007bff;
  color: white;
}

.btn-edit:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-delete {
  background-color: #dc3545;
  color: white;
}

.btn-delete:hover:not(:disabled) {
  background-color: #c82333;
}

.btn-edit:disabled,
.btn-delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.card-body {
  padding: 20px;
}

.org-description {
  margin: 0 0 16px 0;
  color: #555;
  line-height: 1.5;
}

.org-details {
  margin-bottom: 16px;
}

.detail-item {
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.detail-item strong {
  color: #333;
}

.detail-item a {
  color: #007bff;
  text-decoration: none;
}

.detail-item a:hover {
  text-decoration: underline;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.status-badge.active {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.inactive {
  background-color: #f8d7da;
  color: #721c24;
}

.created-date {
  color: #666;
}
</style>