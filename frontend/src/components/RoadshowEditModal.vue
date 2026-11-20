<template>
  <div v-if="modelValue" class="modal_backdrop" @click.self="cancel">
    <form class="modal" @submit.prevent="save">
      <h2>{{ text('Edit Roadshow', 'แก้ไขโรดโชว์') }}</h2>
      <input v-model="form.title_en" placeholder="Title (EN)" required />
      <input v-model="form.title_th" placeholder="Title (TH)" />
      <input v-model="form.organization_en" placeholder="Organization (EN)" />
      <input v-model="form.organization_th" placeholder="Organization (TH)" />
      <input v-model="form.location" placeholder="Location" />
      <input v-model="form.event_date" type="date" required />
      <input v-model="form.start_time" type="time" required />
      <input v-model="form.end_time" type="time" required />
      <textarea v-model="form.details" rows="5" placeholder="Details" required />
      <input type="file" accept="image/jpeg,image/png,image/webp" @change="selectPoster" />
      <img v-if="previewUrl" class="preview" :src="previewUrl" alt="Poster preview" />
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <div class="actions">
        <button type="button" @click="cancel">{{ text('Cancel', 'ยกเลิก') }}</button>
        <button type="submit" :disabled="saving">{{ saving ? text('Saving...', 'กำลังบันทึก...') : text('Save', 'บันทึก') }}</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch, onBeforeUnmount } from 'vue'
import { roadshowAPI } from '../services/api'
import { useLanguage } from '../composables/useLanguage'
import { formatRoadshowTime } from '../utils/roadshowTime'

const props = defineProps<{ modelValue: boolean; roadshow: any; posterUrl?: string }>()
const emit = defineEmits<{ (event: 'update:modelValue', value: boolean): void; (event: 'saved'): void }>()
const { text } = useLanguage()
const saving = ref(false)
const errorMessage = ref('')
const poster = ref<File | null>(null)
const previewUrl = ref('')
const form = reactive({ title_en: '', title_th: '', organization_en: '', organization_th: '', location: '', event_date: '', start_time: '', end_time: '', details: '' })

const splitTime = (value: string) => {
  const parts = formatRoadshowTime(value || '').split('-').map(part => part.trim())
  return { start: parts[0] || '', end: parts[1] || '' }
}
const loadForm = () => {
  const item = props.roadshow || {}
  const time = splitTime(item.time)
  Object.assign(form, {
    title_en: item.title_en || item.topic || '',
    title_th: item.title_th || '',
    organization_en: item.organization_en || item.organization || '',
    organization_th: item.organization_th || '',
    location: item.location || '',
    event_date: String(item.event_date || item.posted_date || '').slice(0, 10),
    start_time: time.start,
    end_time: time.end,
    details: item.details || ''
  })
  poster.value = null
  previewUrl.value = props.posterUrl || ''
  errorMessage.value = ''
}
watch(() => [props.modelValue, props.roadshow], loadForm, { immediate: true })
const selectPoster = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) {
    errorMessage.value = text('Choose a JPG, PNG, or WebP image up to 10 MB.', 'เลือกไฟล์ JPG, PNG หรือ WebP ขนาดไม่เกิน 10 MB')
    return
  }
  poster.value = file
  if (previewUrl.value.startsWith('blob:')) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = URL.createObjectURL(file)
}
const cancel = () => emit('update:modelValue', false)
const save = async () => {
  if (!props.roadshow?._id || !form.start_time || !form.end_time) return
  saving.value = true
  errorMessage.value = ''
  try {
    const data = new FormData()
    data.append('topic', form.title_en || form.title_th)
    data.append('title_en', form.title_en)
    data.append('title_th', form.title_th)
    data.append('details', form.details)
    data.append('organization_en', form.organization_en)
    data.append('organization_th', form.organization_th)
    data.append('location', form.location)
    data.append('time', `${form.start_time}-${form.end_time}`)
    data.append('event_date', form.event_date)
    if (props.roadshow.posted_date) data.append('posted_date', String(props.roadshow.posted_date).slice(0, 10))
    if (poster.value) data.append('poster', poster.value)
    await roadshowAPI.update(String(props.roadshow._id), data)
    emit('update:modelValue', false)
    emit('saved')
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || text('Unable to save roadshow.', 'ไม่สามารถบันทึกโรดโชว์ได้')
  } finally {
    saving.value = false
  }
}
onBeforeUnmount(() => { if (previewUrl.value.startsWith('blob:')) URL.revokeObjectURL(previewUrl.value) })
</script>

<style scoped>
.modal_backdrop { position: fixed; inset: 0; z-index: 20; display: grid; place-items: center; padding: 20px; background: rgba(0,0,0,.45); }
.modal { width: min(620px, 100%); max-height: 90vh; overflow: auto; display: grid; gap: 12px; padding: 24px; background: white; border-radius: 12px; }
.modal input, .modal textarea { padding: 10px; border: 1px solid #d5d9de; border-radius: 6px; font: inherit; }
.preview { max-width: 240px; max-height: 180px; object-fit: contain; }
.actions { display: flex; justify-content: flex-end; gap: 10px; }
.error { color: #b42318; }
</style>
