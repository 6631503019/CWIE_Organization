<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal_overlay" @mousedown.self="close">
      <div class="modal_content" role="dialog" aria-modal="true">
        <header class="modal_header">
          <div>
            <p class="modal_kicker">MOU</p>
            <h2>{{ mouId ? 'Edit MOU' : 'Add MOU' }}</h2>
          </div>
          <button type="button" class="close_button" aria-label="Close" @click="close">x</button>
        </header>

        <div class="modal_body">
          <section class="form_section">
            <h3>Organization</h3>
            <div class="form_grid">
              <label class="form_field">
                <span>Organization <b>*</b></span>
                <div ref="organizationDropdownRef" class="organization_dropdown" :class="{ organization_dropdown_open: organizationDropdownOpen }">
                  <button
                    type="button"
                    class="organization_select"
                    :disabled="loading"
                    :aria-expanded="organizationDropdownOpen"
                    @click="toggleOrganizationDropdown"
                  >
                    <span>{{ selectedOrganizationName || text('Select organization', 'เลือกองค์กร') }}</span>
                    <span class="organization_dropdown_arrow" aria-hidden="true"></span>
                  </button>
                  <div v-if="organizationDropdownOpen" class="organization_menu">
                    <div class="organization_search">
                      <input
                        v-model="organizationSearch"
                        type="search"
                        :placeholder="text('Search organization', 'ค้นหาองค์กร')"
                        :aria-label="text('Search organization', 'ค้นหาองค์กร')"
                        @input="scheduleOrganizationSearch"
                        @keydown.esc.stop="closeOrganizationDropdown"
                      >
                    </div>
                    <div class="organization_options" role="listbox">
                      <div v-if="organizationLoading" class="organization_state">Loading organizations...</div>
                      <button
                        v-for="organization in filteredOrganizations"
                        :key="organization._id"
                        type="button"
                        class="organization_option"
                        :class="{ organization_option_selected: form.organizationId === String(organization._id) }"
                        role="option"
                        :aria-selected="form.organizationId === String(organization._id)"
                        @click="selectOrganization(organization)"
                      >
                        {{ getOrganizationName(organization) }}
                      </button>
                      <div v-if="!organizationLoading && organizationLoadError" class="organization_state">
                        {{ organizationLoadError }}
                      </div>
                      <div v-else-if="!organizationLoading && filteredOrganizations.length === 0" class="organization_state">
                        {{ organizationSearch.trim() ? text('No Organization Found', 'ไม่พบองค์กร') : text('No organizations available.', 'ไม่มีองค์กร') }}
                      </div>
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </section>

          <section class="form_section">
            <h3>Document</h3>
            <label class="file_box" for="mou-document">
              <span class="file_icon">PDF</span>
              <span class="file_copy">
                <strong>{{ selectedFileName || 'Choose PDF document' }}</strong>
                <small>PDF only, maximum 10 MB</small>
              </span>
              <input id="mou-document" type="file" accept=".pdf,application/pdf" @change="handleFile">
            </label>
            <a v-if="existingDocumentUrl && !selectedFile" class="existing_file" :href="existingDocumentUrl" target="_blank" rel="noopener">
              View or download current document
            </a>
          </section>

          <section class="form_section">
            <h3>Publication</h3>
            <div class="form_grid">
              <label class="form_field">
                <span>Publication Start</span>
                <input v-model="form.publicationStartAt" type="datetime-local">
              </label>
              <label class="form_field">
                <span>Publication End</span>
                <input v-model="form.publicationEndAt" type="datetime-local">
              </label>
              <label class="form_field">
                <span>Publication Status</span>
                <select v-model="form.isPublished">
                  <option :value="true">Published</option>
                  <option :value="false">Hidden</option>
                </select>
              </label>
            </div>
          </section>

          <p v-if="error" class="error_message">{{ error }}</p>
        </div>

        <footer class="modal_footer">
          <button type="button" class="cancel_button" :disabled="loading" @click="close">Cancel</button>
          <button type="button" class="save_button" :disabled="loading" @click="save">
            {{ loading ? 'Saving...' : mouId ? 'Save Changes' : 'Upload MOU' }}
          </button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { organizationAPI, mouAPI, fetchMouFileBlob } from '../services/api'
import { useLanguage } from '../composables/useLanguage'

const props = defineProps<{ modelValue: boolean; mouId?: string | null }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; saved: [] }>()
const { currentLanguage, text } = useLanguage()

const loading = ref(false)
const error = ref('')
const organizations = ref<any[]>([])
const organizationSearch = ref('')
const organizationLoading = ref(false)
const organizationLoadError = ref('')
const organizationDropdownOpen = ref(false)
const organizationDropdownRef = ref<HTMLElement | null>(null)
const selectedOrganizationRecord = ref<any>(null)
let organizationSearchTimer: ReturnType<typeof setTimeout> | null = null
let organizationSearchRequest = 0
const selectedFile = ref<File | null>(null)
const existingDocumentUrl = ref('')
const mouRecord = ref<any>(null)

const form = reactive({
  organizationId: '',
  publicationStartAt: '',
  publicationEndAt: '',
  isPublished: true
})

const selectedFileName = computed(() => selectedFile.value?.name || '')
const filteredOrganizations = computed(() => organizations.value)
const getOrganizationName = (organization: any): string => {
  if (!organization) return ''
  if (currentLanguage.value === 'TH') {
    return String(
      organization.name_th ||
      organization.organization_name_th ||
      organization.name_en ||
      organization.organization_name_en ||
      ''
    )
  }
  return String(
    organization.name_en ||
    organization.organization_name_en ||
    organization.name_th ||
    organization.organization_name_th ||
    ''
  )
}
const selectedOrganizationName = computed(() => {
  const selected = organizations.value.find(
    organization => String(organization._id) === form.organizationId
  )
  return getOrganizationName(selected || selectedOrganizationRecord.value)
})

const closeOrganizationDropdown = () => {
  organizationDropdownOpen.value = false
}

const toggleOrganizationDropdown = async () => {
  organizationDropdownOpen.value = !organizationDropdownOpen.value
  if (organizationDropdownOpen.value) {
    organizationSearch.value = ''
    await searchOrganizations('')
  }
}

const selectOrganization = (organization: any) => {
  form.organizationId = String(organization._id)
  selectedOrganizationRecord.value = organization
  closeOrganizationDropdown()
}

const searchOrganizations = async (searchText: string) => {
  const requestId = ++organizationSearchRequest
  organizationLoading.value = true
  organizationLoadError.value = ''
  try {
    const params: any = { limit: 100, page: 1, public: 'false' }
    if (searchText.trim()) params.search = searchText.trim()
    const response = await organizationAPI.getAll(params)
    if (requestId !== organizationSearchRequest) return
    organizations.value = response.data.data || []
  } catch (searchError: any) {
    if (requestId === organizationSearchRequest) {
      organizations.value = []
      organizationLoadError.value = searchError?.response?.data?.message || 'Failed to load organizations.'
    }
  } finally {
    if (requestId === organizationSearchRequest) organizationLoading.value = false
  }
}

const scheduleOrganizationSearch = () => {
  if (organizationSearchTimer) clearTimeout(organizationSearchTimer)
  organizationSearchTimer = setTimeout(() => {
    searchOrganizations(organizationSearch.value)
  }, 250)
}

const handleDocumentClick = (event: MouseEvent) => {
  if (
    organizationDropdownOpen.value &&
    organizationDropdownRef.value &&
    !organizationDropdownRef.value.contains(event.target as Node)
  ) {
    closeOrganizationDropdown()
  }
}

const toDateTimeLocal = (value: unknown) => {
  if (!value) return ''
  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) return ''
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16)
}

const close = () => {
  if (!loading.value) emit('update:modelValue', false)
}

const handleFile = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] || null
  error.value = ''
  if (!file) {
    selectedFile.value = null
    return
  }
  if (file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf')) {
    selectedFile.value = null
    input.value = ''
    error.value = 'Only PDF files are allowed.'
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    selectedFile.value = null
    input.value = ''
    error.value = 'The PDF must be 10 MB or smaller.'
    return
  }
  selectedFile.value = file
}

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    await searchOrganizations('')

    if (props.mouId) {
      const mouResponse = await mouAPI.getById(props.mouId)
      mouRecord.value = mouResponse.data.data
      const organization = mouRecord.value.organization_id
      form.organizationId = String(typeof organization === 'object' ? organization._id : organization || '')
      selectedOrganizationRecord.value = typeof organization === 'object' ? organization : null
      if (organization && typeof organization === 'object') {
        const organizationId = String(organization._id || '')
        if (organizationId && !organizations.value.some(item => String(item._id) === organizationId)) {
          organizations.value = [organization, ...organizations.value]
        }
      }
      form.publicationStartAt = toDateTimeLocal(mouRecord.value.publication_start_at)
      form.publicationEndAt = toDateTimeLocal(mouRecord.value.publication_end_at)
      form.isPublished = mouRecord.value.is_published !== false
      try {
        existingDocumentUrl.value = await fetchMouFileBlob(props.mouId)
      } catch {
        existingDocumentUrl.value = ''
        error.value = 'The existing MOU file is unavailable.'
      }
    } else {
      mouRecord.value = null
      form.organizationId = ''
      selectedOrganizationRecord.value = null
      form.publicationStartAt = ''
      form.publicationEndAt = ''
      form.isPublished = true
      existingDocumentUrl.value = ''
    }
  } catch (loadError: any) {
    error.value = loadError?.response?.data?.message || 'Failed to load MOU data.'
  } finally {
    selectedFile.value = null
    loading.value = false
  }
}

const save = async () => {
  if (!form.organizationId) {
    error.value = 'Please select an organization.'
    return
  }
  if (!props.mouId && !selectedFile.value) {
    error.value = 'Please select a PDF document.'
    return
  }
  if (form.publicationStartAt && form.publicationEndAt &&
      new Date(form.publicationEndAt) <= new Date(form.publicationStartAt)) {
    error.value = 'Publication end must be later than publication start.'
    return
  }

  loading.value = true
  error.value = ''
  try {
    const formData = new FormData()
    formData.append('organization_id', form.organizationId)
    formData.append('publication_start_at', form.publicationStartAt)
    formData.append('publication_end_at', form.publicationEndAt)
    formData.append('is_published', String(form.isPublished))
    if (selectedFile.value) formData.append('mou', selectedFile.value)

    if (props.mouId) await mouAPI.update(props.mouId, formData)
    else await mouAPI.create(formData)

    emit('saved')
    emit('update:modelValue', false)
  } catch (saveError: any) {
    error.value = saveError?.response?.data?.message || 'Failed to save MOU.'
  } finally {
    loading.value = false
  }
}

watch(() => props.modelValue, value => {
  if (value) load()
})

onMounted(() => document.addEventListener('mousedown', handleDocumentClick))
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleDocumentClick)
  if (organizationSearchTimer) clearTimeout(organizationSearchTimer)
})
</script>

<style scoped>
.modal_overlay { position: fixed; inset: 0; z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 24px; overflow-y: auto; background: rgba(84,84,84,.5); }
.modal_content { width: min(760px, 100%); max-height: calc(100vh - 48px); display: flex; flex-direction: column; overflow: hidden; border-radius: 12px; background: #fff; box-shadow: 0 18px 50px rgba(0,0,0,.22); }
.modal_header, .modal_footer { flex: 0 0 auto; display: flex; align-items: center; justify-content: space-between; box-sizing: border-box; }
.modal_header { min-height: 78px; padding: 18px 24px 14px; border-bottom: 1px solid #e6e6e6; }
.modal_header h2 { margin: 2px 0 0; font-size: 22px; color: #202124; }
.modal_kicker { margin: 0; color: #8b0000; font-size: 12px; font-weight: 700; letter-spacing: .08em; }
.close_button { width: 36px; height: 36px; border: 0; border-radius: 50%; background: #f2f2f2; color: #333; cursor: pointer; font-size: 18px; }
.modal_body { flex: 1 1 auto; min-height: 0; overflow-x: hidden; overflow-y: auto; padding: 20px 24px 24px; }
.form_section + .form_section { margin-top: 20px; padding-top: 18px; border-top: 1px solid #ececec; }
.form_section h3 { margin: 0 0 12px; color: #343434; font-size: 15px; }
.form_grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.form_grid .form_field:first-child:nth-last-child(1) { grid-column: 1 / -1; }
.form_field { min-width: 0; display: flex; flex-direction: column; gap: 7px; color: #3f3f3f; font-size: 13px; font-weight: 600; }
.form_field b { color: #9d0000; }
.form_field input, .form_field select { width: 100%; height: 42px; box-sizing: border-box; border: 1px solid #bfc3c8; border-radius: 6px; background: #fff; padding: 0 11px; color: #222; font: inherit; }
.organization_dropdown { position: relative; z-index: 2; min-width: 0; }
.organization_dropdown_open { z-index: 10020; }
.organization_select { width: 100%; height: 42px; box-sizing: border-box; display: flex; align-items: center; justify-content: space-between; gap: 10px; border: 1px solid #bfc3c8; border-radius: 6px; background: #fff; padding: 0 11px; color: #222; font: inherit; text-align: left; cursor: pointer; }
.organization_select span:first-child { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.organization_dropdown_arrow { width: 8px; height: 8px; flex: 0 0 auto; border-right: 2px solid #666; border-bottom: 2px solid #666; transform: rotate(45deg) translateY(-2px); }
.organization_menu { position: absolute; top: calc(100% + 5px); left: 0; z-index: 10030; width: 100%; box-sizing: border-box; border: 1px solid #bfc3c8; border-radius: 6px; background: #fff; box-shadow: 0 10px 28px rgba(0,0,0,.18); overflow: hidden; }
.organization_search { padding: 8px; border-bottom: 1px solid #ececec; }
.organization_search input { width: 100%; height: 38px; box-sizing: border-box; border: 1px solid #d1d5db; border-radius: 5px; background: #fff; padding: 0 10px; font: inherit; }
.organization_options { max-height: 220px; overflow-y: auto; }
.organization_option { width: 100%; min-height: 40px; box-sizing: border-box; border: 0; border-bottom: 1px solid #f1f1f1; background: #fff; padding: 9px 11px; color: #222; font: 500 13px/18px inherit; text-align: left; cursor: pointer; }
.organization_option:hover, .organization_option_selected { background: #f6eeee; color: #780000; }
.organization_state { min-height: 52px; display: grid; place-items: center; padding: 10px; color: #777; font-size: 13px; text-align: center; }
.file_box { min-height: 82px; display: flex; align-items: center; gap: 12px; box-sizing: border-box; border: 1px dashed #9da3aa; border-radius: 8px; padding: 12px; background: #fafafa; cursor: pointer; }
.file_box input { position: absolute; width: 1px; height: 1px; opacity: 0; }
.file_icon { width: 48px; height: 48px; flex: 0 0 auto; display: grid; place-items: center; border-radius: 6px; background: #8b0000; color: #fff; font-size: 12px; font-weight: 700; }
.file_copy { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.file_copy strong { max-width: 520px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.file_copy small { color: #777; }
.existing_file { display: inline-block; margin-top: 10px; color: #780000; font-size: 13px; font-weight: 600; }
.error_message { margin: 16px 0 0; border-radius: 6px; padding: 10px 12px; background: #fff1f1; color: #9b0000; font-size: 13px; }
.modal_footer { min-height: 68px; gap: 10px; justify-content: flex-end; padding: 12px 24px; border-top: 1px solid #e6e6e6; background: #fff; }
.cancel_button, .save_button { min-width: 110px; height: 40px; border-radius: 6px; padding: 0 16px; font-weight: 700; cursor: pointer; }
.cancel_button { border: 1px solid #bfc3c8; background: #fff; color: #333; }
.save_button { border: 1px solid #8b0000; background: #8b0000; color: #fff; }
button:disabled { opacity: .65; cursor: not-allowed; }
@media (max-width: 640px) {
  .modal_overlay { align-items: flex-start; padding: 12px; }
  .modal_content { max-height: calc(100vh - 24px); }
  .modal_header { min-height: 68px; padding: 12px 16px; }
  .modal_body { padding: 16px; }
  .form_grid { grid-template-columns: 1fr; }
  .modal_footer { padding: 10px 16px; }
  .cancel_button, .save_button { flex: 1; min-width: 0; }
}
</style>
