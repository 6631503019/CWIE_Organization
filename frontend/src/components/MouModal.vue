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
                <select v-model="form.organizationId" :disabled="loading || Boolean(mouId)">
                  <option value="">Select organization</option>
                  <option v-for="organization in organizations" :key="organization._id" :value="organization._id">
                    {{ organization.name_en || organization.organization_name_en || organization.name_th || organization.organization_name_th }}
                  </option>
                </select>
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
import { computed, reactive, ref, watch } from 'vue'
import { organizationAPI, mouAPI, fetchMouFileBlob } from '../services/api'

const props = defineProps<{ modelValue: boolean; mouId?: string | null }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; saved: [] }>()

const loading = ref(false)
const error = ref('')
const organizations = ref<any[]>([])
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
    const organizationResponse = await organizationAPI.getAll({ limit: 10000, public: 'false' })
    organizations.value = organizationResponse.data.data || []

    if (props.mouId) {
      const mouResponse = await mouAPI.getById(props.mouId)
      mouRecord.value = mouResponse.data.data
      const organization = mouRecord.value.organization_id
      form.organizationId = String(typeof organization === 'object' ? organization._id : organization || '')
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
