<template>
  <div v-if="modelValue" class="review-modal-overlay" @click.self="close">
    <form class="review-modal" @submit.prevent="save">
      <h2>{{ reviewId ? text('Edit Review', 'แก้ไขรีวิว') : text('Add Review', 'เพิ่มรีวิว') }}</h2>
      <label>{{ text('Job position', 'ตำแหน่งงาน') }} *
        <input v-model.trim="form.job_position" required maxlength="200" />
      </label>
      <label>{{ text('Academic year', 'ปีการศึกษา') }}
        <input v-model.trim="form.academic_year" maxlength="50" />
      </label>
      <label>{{ text('Semester', 'ภาคการศึกษา') }}
        <input v-model.trim="form.semester" maxlength="50" />
      </label>
      <label>{{ text('Review', 'รีวิว') }} *
        <textarea v-model.trim="form.review_text" required maxlength="2000" rows="7"></textarea>
      </label>
      <div class="actions">
        <button type="button" @click="close">{{ text('Cancel', 'ยกเลิก') }}</button>
        <button type="submit" :disabled="saving">{{ saving ? text('Saving...', 'กำลังบันทึก...') : text('Save', 'บันทึก') }}</button>
      </div>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { reviewAPI } from '../services/api'
import { useLanguage } from '../composables/useLanguage'

const props = defineProps<{
  modelValue: boolean
  organizationId: string
  review?: any | null
}>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()
const { text } = useLanguage()
const saving = ref(false)
const error = ref('')
const form = reactive({ job_position: '', academic_year: '', semester: '', review_text: '' })
const reviewId = ref('')

watch(() => [props.modelValue, props.review], () => {
  if (!props.modelValue) return
  const review = props.review || {}
  reviewId.value = String(review._id || '')
  form.job_position = review.job_position || ''
  form.academic_year = review.academic_year || ''
  form.semester = review.semester || ''
  form.review_text = review.review_text || ''
  error.value = ''
}, { immediate: true })

const close = () => emit('update:modelValue', false)
const save = async () => {
  saving.value = true
  error.value = ''
  try {
    const payload = { organization_id: props.organizationId, ...form }
    if (reviewId.value) await reviewAPI.update(reviewId.value, payload)
    else await reviewAPI.create(payload)
    emit('saved')
    close()
  } catch (err: any) {
    error.value = err.response?.data?.message || text('Unable to save review.', 'ไม่สามารถบันทึกรีวิวได้')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.review-modal-overlay { position: fixed; inset: 0; z-index: 10001; display: grid; place-items: center; padding: 16px; background: rgba(0,0,0,.45); }
.review-modal { width: min(520px, 100%); box-sizing: border-box; padding: 28px; border-radius: 12px; background: #fff; box-shadow: 0 8px 30px rgba(0,0,0,.2); font-family: Inter, sans-serif; }
.review-modal h2 { margin: 0 0 20px; font-family: Outfit, sans-serif; }
.review-modal label { display: block; margin: 12px 0; font-weight: 600; }
.review-modal input, .review-modal textarea { display: block; width: 100%; box-sizing: border-box; margin-top: 6px; padding: 10px; border: 1px solid #bbb; border-radius: 6px; font: inherit; }
.actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
.actions button { padding: 9px 18px; border: 0; border-radius: 6px; cursor: pointer; }
.actions button:last-child { background: #8b0000; color: #fff; }
.actions button:disabled { opacity: .6; cursor: wait; }
.error { color: #b91c1c; }
</style>
