<template>
  <div class="organization_card">
    <div class="card_header">
      <img 
        v-if="organization.logoUrl" 
        :src="organization.logoUrl" 
        :alt="`${organization.name} logo`"
        class="org_logo"
      />
      <div class="org_info">
        <h3 class="org_name">{{ organization.name }}</h3>
        <p class="org_category">{{ organization.category }}</p>
      </div>
      <div class="card_actions">
        <button 
          v-if="showActions"
          @click="$emit('edit', organization)"
          class="btn_edit"
          :disabled="isLoading"
        >
          Edit
        </button>
        <button 
          v-if="showActions"
          @click="handleDelete"
          class="btn_delete"
          :disabled="isLoading"
        >
          Delete
        </button>
      </div>
    </div>

    <div class="card_body">
      <p class="org_description">{{ organization.description }}</p>
      
      <div class="org_details">
        <div class="detail_item">
          <strong>Location:</strong> {{ organization.location }}
        </div>
        <div class="detail_item" v-if="organization.website">
          <strong>Website:</strong> 
          <a :href="organization.website" target="_blank" rel="noopener">
            {{ organization.website }}
          </a>
        </div>
        <div class="detail_item">
          <strong>Contact:</strong> {{ organization.contactEmail }}
        </div>
      </div>

      <div class="card_footer">
        <span :class="['status_badge', organization.isActive ? 'active' : 'inactive']">
          {{ organization.isActive ? 'Active' : 'Inactive' }}
        </span>
        <span class="created_date">
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
.organization_card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  overflow: hidden;
}

.organization_card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.card_header {
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.org_logo {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  margin-right: 16px;
}

.org_info {
  flex: 1;
}

.org_name {
  margin: 0 0 4px 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

.org_category {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.card_actions {
  display: flex;
  gap: 8px;
}

.btn-edit,
.btn_delete {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn_edit {
  background-color: #007bff;
  color: white;
}

.btn_edit:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn_delete {
  background-color: #dc3545;
  color: white;
}

.btn_delete:hover:not(:disabled) {
  background-color: #c82333;
}

.btn_edit:disabled,
.btn_delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.card_body {
  padding: 20px;
}

.org_description {
  margin: 0 0 16px 0;
  color: #555;
  line-height: 1.5;
}

.org_details {
  margin-bottom: 16px;
}

.detail_item {
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

.card_footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
}

.status_badge {
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

.created_date {
  color: #666;
}
</style>
