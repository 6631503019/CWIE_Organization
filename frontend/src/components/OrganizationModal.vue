<template>
  <div v-if="show" class="modal_overlay" @click="$emit('close')">
    <div class="add_org_modal" :class="`${activeTab}_active`" @click.stop>
      <!-- Right side tabs -->
      <div class="modal_tabs">
        <div 
          class="tab_item"
          :class="{ active: activeTab === 'organization' }"
          @click="switchTab('organization')"
        >
          <span>Organization</span>
        </div>
        <div 
          class="tab_item"
          :class="{ active: activeTab === 'review' }"
          @click="switchTab('review')"
        >
          <span>Review</span>
        </div>
        <div 
          class="tab_item"
          :class="{ active: activeTab === 'mou' }"
          @click="switchTab('mou')"
        >
          <span>MOU</span>
        </div>
      </div>

      <!-- Modal Content -->
      <div class="modal_content">
        <!-- Organization Tab -->
        <div v-if="activeTab === 'organization'" class="organization_tab">
          <h2 class="modal_title">{{ isEditing ? 'Edit' : 'Add' }} Organization</h2>
          <div class="form_divider"></div>
          
          <slot name="organization-form"></slot>
        </div>
        
        <!-- Review Tab -->
        <div v-if="activeTab === 'review'" class="review_tab">
          <h2 class="modal_title">Add Review</h2>
          <div class="form_divider"></div>
          
          <slot name="review-form"></slot>
        </div>
        
        <!-- MOU Tab -->
        <div v-if="activeTab === 'mou'" class="mou_tab">
          <h2 class="modal_title">{{ isEditing ? 'Edit' : 'Add' }} MOU</h2>
          <div class="form_divider"></div>
          
          <slot name="mou-form"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  show: boolean
  isEditing?: boolean
  initialTab?: 'organization' | 'review' | 'mou'
}>()

const emit = defineEmits<{
  close: []
  'tab_change': [tab: 'organization' | 'review' | 'mou']
}>()

const activeTab = ref<'organization' | 'review' | 'mou'>(props.initialTab || 'organization')

watch(() => props.initialTab, (newTab) => {
  if (newTab) {
    activeTab.value = newTab
  }
})

const switchTab = (tab: 'organization' | 'review' | 'mou') => {
  activeTab.value = tab
  emit('tab_change', tab)
}
</script>

<style scoped>
/* Modal Styles */
.modal_overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s;
}

.add_org_modal {
  position: relative;
  width: 1200px;
  height: 720px;
  background: #FFFFFF;
  border-radius: 20px;
  display: flex;
  animation: slideIn 0.3s ease-out;
}

.add-org-modal.organization_active {
  width: 1200px;
  height: 720px;
}

.add-org-modal.review-active,
.add-org-modal.mou_active {
  width: 800px;
  height: 600px;
}

.modal_tabs {
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 200px;
  background: #F6F7F8;
  border-radius: 20px 0 0 20px;
  padding: 40px 0;
}

.tab_item {
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.tab-item span {
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 18px;
  line-height: 23px;
  color: #767676;
  transition: color 0.2s;
}

.tab-item.active {
  background: #FFFFFF;
}

.tab_item:hover:not(.active) {
  background: rgba(255, 255, 255, 0.5);
}

.modal_content {
  flex: 1;
  padding: 40px;
  overflow-y: auto;
  max-height: 720px;
}

.modal_title {
  font-family: 'Outfit', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 24px;
  line-height: 30px;
  color: #000000;
  margin: 0 0 20px 0;
}

.form_divider {
  width: 100%;
  height: 1px;
  background: #E0E0E0;
  margin-bottom: 30px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>


