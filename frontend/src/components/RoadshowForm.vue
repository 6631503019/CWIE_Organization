<template>
  <div v-if="modelValue" class="modal_overlay" @click.self="cancel">
    <form class="roadshow_form" @submit.prevent="save">
      <div class="form_header">
        <div>
          <h2 class="modal_title">{{ mode === 'create' ? text('Add Roadshow', 'เพิ่มโรดโชว์') : text('Edit Roadshow', 'แก้ไขโรดโชว์') }}</h2>
          <p class="form_subtitle">{{ text('Complete the roadshow information below.', 'กรอกข้อมูลโรดโชว์ให้ครบถ้วน') }}</p>
        </div>
        <button type="button" class="close_button" @click="cancel" aria-label="Close">×</button>
      </div>

      <section class="form_section">
        <h3>{{ text('Roadshow Information', 'ข้อมูลโรดโชว์') }}</h3>
        <div class="form_grid">
          <label>{{ text('Roadshow title (EN)', 'ชื่อโรดโชว์ (EN)') }}*
            <input v-model.trim="form.title_en" type="text" required />
          </label>
          <label>{{ text('Roadshow title (TH)', 'ชื่อโรดโชว์ (TH)') }}
            <input v-model.trim="form.title_th" type="text" />
          </label>
          <label>{{ text('Organization (EN)', 'องค์กร (EN)') }}
            <input v-model.trim="form.organization_en" type="text" />
          </label>
          <label>{{ text('Organization (TH)', 'องค์กร (TH)') }}
            <input v-model.trim="form.organization_th" type="text" />
          </label>
          <label>{{ text('Organization reference ID', 'รหัสอ้างอิงองค์กร') }}
            <input v-model.trim="form.organization_id" type="text" placeholder="Optional" />
          </label>
          <label class="wide">{{ text('Location', 'สถานที่') }}
            <input v-model.trim="form.location" type="text" />
          </label>
          <label class="wide">{{ text('Description', 'รายละเอียด') }}*
            <textarea v-model.trim="form.details" rows="5" required></textarea>
          </label>
        </div>
      </section>

      <section class="form_section">
        <h3>{{ text('Date and Time', 'วันที่และเวลา') }}</h3>
        <div class="form_grid">
          <label>{{ text('Event date', 'วันที่จัดงาน') }}*
            <input v-model="form.event_date" type="date" required />
          </label>
          <label>{{ text('Posted date', 'วันที่ประกาศ') }}*
            <input v-model="form.posted_date" type="date" required />
          </label>
          <label>{{ text('Start time', 'เวลาเริ่มต้น') }}*
            <input v-model="form.start_time" type="time" required />
          </label>
          <label>{{ text('End time', 'เวลาสิ้นสุด') }}*
            <input v-model="form.end_time" type="time" required />
          </label>
          <label>{{ text('Deleted date', 'วันที่สิ้นสุดการแสดง') }}
            <input v-model="form.deleted_date" type="date" />
          </label>
        </div>
      </section>

      <section class="form_section">
        <h3>{{ text('Poster and Images', 'โปสเตอร์และรูปภาพ') }}</h3>
        <div class="upload_grid">
          <label class="upload_control">
            <span>{{ text('Poster image', 'โปสเตอร์') }}</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" @change="selectPoster" />
          </label>
          <img v-if="posterPreview" class="poster_preview" :src="posterPreview" alt="Roadshow poster preview" @click="openImage(posterPreview, 'Roadshow poster')" />
        </div>
        <label class="upload_control">
          <span>{{ text('Activity images', 'รูปภาพกิจกรรม') }}</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple @change="selectActivities" />
        </label>
        <div v-if="activityPreviewUrls.length" class="activity_preview_grid">
          <div v-for="(url, index) in activityPreviewUrls" :key="`${url}-${index}`" class="activity_preview">
            <img :src="url" :alt="`Activity ${index + 1}`" @click="openImage(url, `Activity ${index + 1}`)" />
            <button type="button" @click="removeActivity(index)">×</button>
          </div>
        </div>
      </section>
      <div v-if="lightboxUrl" class="image_lightbox" @click.self="closeImage">
        <button type="button" class="lightbox_close" @click="closeImage">×</button>
        <img :src="lightboxUrl" :alt="lightboxAlt" />
      </div>

      <section class="form_section form_footer_section">
        <label class="public_control">
          <input v-model="form.is_public" type="checkbox" />
          <span>{{ text('Public roadshow', 'เผยแพร่โรดโชว์') }}</span>
        </label>
        <p v-if="errorMessage" class="form_error">{{ errorMessage }}</p>
        <div class="form_actions">
          <button type="button" class="btn_cancel" @click="cancel">{{ text('Cancel', 'ยกเลิก') }}</button>
          <button type="submit" class="btn_save" :disabled="saving">{{ saving ? text('Saving...', 'กำลังบันทึก...') : text('Save', 'บันทึก') }}</button>
        </div>
      </section>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch, onBeforeUnmount } from 'vue'
import { roadshowAPI } from '../services/api'
import { useLanguage } from '../composables/useLanguage'
import { normalizeRoadshowTime, splitRoadshowTime } from '../utils/roadshowTime'

type FormMode = 'create' | 'edit'

const props = withDefaults(defineProps<{
  modelValue: boolean
  mode: FormMode
  roadshow?: any | null
  posterUrl?: string
  activityUrls?: string[]
}>(), {
  roadshow: null,
  posterUrl: '',
  activityUrls: () => []
})

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
  (event: 'saved', value: any): void
}>()

const { text } = useLanguage()
const saving = ref(false)
const errorMessage = ref('')
const lightboxUrl = ref('')
const lightboxAlt = ref('')
const posterFile = ref<File | null>(null)
const activityFiles = ref<File[]>([])
const posterPreview = ref('')
const activityPreviewUrls = ref<string[]>([])
const activityOriginalIndexes = ref<Array<number | null>>([])
const removedActivityIndices = ref<number[]>([])
const form = reactive({
  topic: '',
  title_en: '',
  title_th: '',
  details: '',
  organization_en: '',
  organization_th: '',
  organization_id: '',
  location: '',
  event_date: '',
  posted_date: '',
  deleted_date: '',
  start_time: '',
  end_time: '',
  is_public: true
})

const dateOnly = (value: unknown) => String(value || '').split('T')[0]
const revokeBlobUrls = () => {
  if (posterFile.value && posterPreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(posterPreview.value)
  }
  activityPreviewUrls.value.forEach((url, index) => {
    if (url.startsWith('blob:') && activityOriginalIndexes.value[index] === null) {
      URL.revokeObjectURL(url)
    }
  })
}
const loadInitialValues = () => {
  revokeBlobUrls()
  const item = props.roadshow || {}
  const times = splitRoadshowTime(item.time)
  const organizationId = typeof item.organization_id === 'object'
    ? item.organization_id?._id
    : item.organization_id
  Object.assign(form, {
    topic: item.topic || item.title_en || item.title_th || '',
    title_en: item.title_en || item.topic || '',
    title_th: item.title_th || '',
    details: item.details || '',
    organization_en: item.organization_en || item.organization || '',
    organization_th: item.organization_th || '',
    organization_id: organizationId ? String(organizationId) : '',
    location: item.location || '',
    event_date: dateOnly(item.event_date || item.posted_date),
    posted_date: dateOnly(item.posted_date) || dateOnly(new Date().toISOString()),
    deleted_date: dateOnly(item.deleted_date),
    start_time: times.start,
    end_time: times.end,
    is_public: item.is_public !== false
  })
  posterFile.value = null
  activityFiles.value = []
  removedActivityIndices.value = []
  posterPreview.value = props.posterUrl || ''
  activityPreviewUrls.value = [...(props.activityUrls || [])]
  activityOriginalIndexes.value = (props.activityUrls || []).map((_, index) => index)
  errorMessage.value = ''
}

watch(
  () => [
    props.modelValue,
    props.mode,
    props.roadshow?._id || props.roadshow?.id || ''
  ],
  loadInitialValues,
  { immediate: true }
)

const validateImage = (file: File) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type) || file.size > 10 * 1024 * 1024) {
    throw new Error(text('Images must be JPG, PNG, or WebP and no larger than 10 MB.', 'รูปต้องเป็น JPG, PNG หรือ WebP และมีขนาดไม่เกิน 10 MB'))
  }
}
const selectPoster = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  try {
    validateImage(file)
    if (posterFile.value && posterPreview.value.startsWith('blob:')) {
      URL.revokeObjectURL(posterPreview.value)
    }
    posterFile.value = file
    posterPreview.value = URL.createObjectURL(file)
    errorMessage.value = ''
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : String(error)
  }
}
const selectActivities = (event: Event) => {
  const files = Array.from((event.target as HTMLInputElement).files || [])
  try {
    files.forEach(validateImage)
    activityFiles.value.push(...files)
    activityPreviewUrls.value.push(...files.map(file => URL.createObjectURL(file)))
    activityOriginalIndexes.value.push(...files.map(() => null))
    errorMessage.value = ''
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : String(error)
  }
}
const removeActivity = (index: number) => {
  const originalIndex = activityOriginalIndexes.value[index]
  if (originalIndex !== null && originalIndex !== undefined) {
    if (!removedActivityIndices.value.includes(originalIndex)) {
      removedActivityIndices.value.push(originalIndex)
    }
  } else {
    const newIndex = activityOriginalIndexes.value
      .slice(0, index)
      .filter(value => value === null).length
    const [file] = activityFiles.value.splice(newIndex, 1)
    if (file && activityPreviewUrls.value[index]?.startsWith('blob:')) URL.revokeObjectURL(activityPreviewUrls.value[index])
  }
  activityPreviewUrls.value.splice(index, 1)
  activityOriginalIndexes.value.splice(index, 1)
}
const cancel = () => {
  revokeBlobUrls()
  emit('update:modelValue', false)
}
const openImage = (url: string, alt: string) => {
  lightboxUrl.value = url
  lightboxAlt.value = alt
}
const closeImage = () => {
  lightboxUrl.value = ''
  lightboxAlt.value = ''
}
const save = async () => {
  if (saving.value) return
  const roadshowId = props.roadshow?._id || props.roadshow?.id
  if (props.mode === 'edit' && !roadshowId) {
    errorMessage.value = text('Roadshow ID is missing.', 'ไม่พบรหัสโรดโชว์')
    return
  }
  if (!form.title_en && !form.title_th) {
    errorMessage.value = text('At least one title is required.', 'ต้องระบุชื่อโรดโชว์อย่างน้อยหนึ่งภาษา')
    return
  }
  saving.value = true
  errorMessage.value = ''
  try {
    const payload = new FormData()
    payload.append('topic', form.title_en || form.title_th || form.topic)
    payload.append('title_en', form.title_en)
    payload.append('title_th', form.title_th)
    payload.append('details', form.details)
    payload.append('organization_en', form.organization_en)
    payload.append('organization_th', form.organization_th)
    if (form.organization_id) payload.append('organization_id', form.organization_id)
    payload.append('location', form.location)
    const normalizedTime = normalizeRoadshowTime(`${form.start_time} - ${form.end_time}`)
    if (!normalizedTime) {
      errorMessage.value = text('Time must use HH:mm format.', 'เวลาต้องอยู่ในรูปแบบ HH:mm')
      saving.value = false
      return
    }
    payload.append('time', normalizedTime)
    payload.append('event_date', form.event_date)
    payload.append('posted_date', form.posted_date)
    payload.append('is_public', String(form.is_public))
    if (form.deleted_date) payload.append('deleted_date', form.deleted_date)
    if (posterFile.value) payload.append('poster', posterFile.value)
    activityFiles.value.forEach(file => payload.append('activity_image', file))
    if (removedActivityIndices.value.length) {
      payload.append('delete_activity_image_indices', JSON.stringify(removedActivityIndices.value))
    }

    const response = props.mode === 'create'
      ? await roadshowAPI.create(payload)
      : await roadshowAPI.update(String(roadshowId), payload)
    emit('saved', response.data?.data || response.data)
    emit('update:modelValue', false)
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || text('Unable to save roadshow.', 'ไม่สามารถบันทึกโรดโชว์ได้')
  } finally {
    saving.value = false
  }
}

onBeforeUnmount(revokeBlobUrls)
</script>

<style scoped>
.modal_overlay { position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center; padding: 20px; overflow-y: auto; background: rgba(0, 0, 0, .45); }
.roadshow_form { width: min(860px, 100%); max-height: calc(100vh - 40px); overflow-y: auto; box-sizing: border-box; padding: 28px; border-radius: 12px; background: #fff; color: #333; font-family: Inter, sans-serif; }
.form_header, .form_actions, .upload_grid { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.modal_title { margin: 0; font-size: 24px; font-weight: 700; }
.form_subtitle { margin: 6px 0 0; color: #777; font-size: 13px; }
.close_button { border: 0; background: transparent; color: #777; font-size: 26px; cursor: pointer; }
.form_section { margin-top: 24px; padding-top: 20px; border-top: 1px solid #e8e8e8; }
.form_section h3 { margin: 0 0 16px; font-size: 16px; font-weight: 700; }
.form_grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.form_grid label, .upload_control { display: grid; gap: 7px; color: #555; font-size: 13px; font-weight: 600; }
.form_grid .wide { grid-column: 1 / -1; }
.form_grid input, .form_grid textarea, .upload_control input { box-sizing: border-box; width: 100%; min-height: 42px; padding: 10px 12px; border: 1px solid #d5d9de; border-radius: 6px; background: #fff; color: #333; font: inherit; }
.form_grid textarea { resize: vertical; }
.upload_control { margin-bottom: 14px; }
.upload_control input { padding: 8px; }
.poster_preview { width: 120px; height: 120px; object-fit: contain; border-radius: 6px; background: #f3f3f3; }
.poster_preview, .activity_preview img { cursor: zoom-in; }
.activity_preview_grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 10px; }
.activity_preview { position: relative; aspect-ratio: 1; overflow: hidden; border-radius: 6px; background: #f3f3f3; }
.activity_preview img { width: 100%; height: 100%; object-fit: cover; }
.activity_preview button { position: absolute; top: 4px; right: 4px; width: 25px; height: 25px; border: 0; border-radius: 50%; background: rgba(0,0,0,.65); color: #fff; cursor: pointer; }
.public_control { display: flex; align-items: center; gap: 8px; color: #555; font-size: 13px; font-weight: 600; }
.form_error { margin: 12px 0 0; color: #b42318; font-size: 13px; }
.form_actions { justify-content: flex-end; margin-top: 20px; }
.btn_cancel, .btn_save { min-height: 40px; padding: 0 20px; border: 0; border-radius: 6px; font: 600 14px Inter, sans-serif; cursor: pointer; }
.btn_cancel { background: #f1f1f1; color: #555; }
.btn_save { background: #8b0000; color: #fff; }
.btn_save:disabled { opacity: .6; cursor: wait; }
.image_lightbox { position: fixed; inset: 0; z-index: 1200; display: grid; place-items: center; padding: 28px; background: rgba(0,0,0,.82); }
.image_lightbox img { max-width: min(1100px, 94vw); max-height: 90vh; object-fit: contain; }
.lightbox_close { position: fixed; top: 18px; right: 24px; width: 42px; height: 42px; border: 0; border-radius: 50%; background: #fff; color: #333; font-size: 28px; cursor: pointer; }
@media (max-width: 640px) { .roadshow_form { padding: 20px 16px; } .form_grid { grid-template-columns: 1fr; } .form_grid .wide { grid-column: auto; } .upload_grid { align-items: flex-start; flex-direction: column; } }
</style>
