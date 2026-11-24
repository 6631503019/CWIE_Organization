<template>
  <section class="reviews-panel">
    <div class="reviews-heading">
      <h2>{{ text('Senior Reviews', 'รีวิวจากรุ่นพี่') }}</h2>
      <button v-if="admin" type="button" class="add" @click="$emit('add')">{{ text('Add Review', 'เพิ่มรีวิว') }}</button>
    </div>

    <div v-if="loading" class="state">{{ text('Loading reviews...', 'กำลังโหลดรีวิว...') }}</div>
    <div v-else-if="error" class="state error">{{ error }}</div>
    <div v-else-if="reviews.length === 0" class="state">{{ text('No Reviews Available', 'ไม่มีรีวิว') }}</div>

    <div
      v-else
      class="carousel"
      :class="{ 'single-review': reviews.length === 1 }"
      @touchstart.passive="handleTouchStart"
      @touchend.passive="handleTouchEnd"
    >
      <button
        v-if="reviews.length > 1"
        type="button"
        class="carousel-arrow previous"
        :disabled="currentIndex === 0"
        :aria-label="text('Previous review', 'รีวิวก่อนหน้า')"
        @click="previous"
      >
        ‹
      </button>

      <article :key="activeReviewKey" class="review-card">
        <dl class="review-content">
          <div class="review-row">
            <dt>{{ text('Job Position', 'ตำแหน่งงาน') }}</dt>
            <dd>{{ displayReviewValue(activeReview.job_position) }}</dd>
          </div>
          <div class="review-row">
            <dt>{{ text('Academic Year', 'ปีการศึกษา') }}</dt>
            <dd>{{ displayReviewValue(activeReview.academic_year) }}</dd>
          </div>
          <div class="review-row">
            <dt>{{ text('Semester', 'ภาคการศึกษา') }}</dt>
            <dd>{{ displayReviewValue(activeReview.semester) }}</dd>
          </div>
          <div class="review-row review-row-text">
            <dt>{{ text('Review', 'รีวิว') }}</dt>
            <dd>{{ displayReviewValue(activeReview.review_text) }}</dd>
          </div>
        </dl>

        <div v-if="admin" class="review-actions">
          <button type="button" @click="$emit('edit', activeReview)">{{ text('Edit', 'แก้ไข') }}</button>
          <button type="button" class="danger" @click="$emit('delete', activeReview)">{{ text('Delete', 'ลบ') }}</button>
        </div>
      </article>

      <button
        v-if="reviews.length > 1"
        type="button"
        class="carousel-arrow next"
        :disabled="currentIndex === reviews.length - 1"
        :aria-label="text('Next review', 'รีวิวถัดไป')"
        @click="next"
      >
        ›
      </button>
    </div>

    <div v-if="reviews.length > 1" class="carousel-position">{{ currentIndex + 1 }} / {{ reviews.length }}</div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useLanguage } from '../composables/useLanguage'

const props = defineProps<{
  reviews: any[]
  loading?: boolean
  error?: string
  admin?: boolean
}>()

defineEmits<{
  add: []
  edit: [review: any]
  delete: [review: any]
}>()

const { currentLanguage, text } = useLanguage()
const currentIndex = ref(0)
const reviewImageUrl = ref('')
let reviewImageObjectUrl = ''
let touchStartX = 0

const activeReview = computed(() => props.reviews[currentIndex.value] || {})
const activeReviewKey = computed(() => String(activeReview.value._id || activeReview.value.source_row || currentIndex.value))
const displayReviewValue = (value: unknown): string => {
  const normalized = String(value ?? '').trim()
  return normalized || 'N/A'
}

const reviewerName = (review: any): string => {
  const organizationName = typeof review.organization_id === 'object'
    ? (currentLanguage.value === 'TH'
      ? review.organization_id.organization_name_th
      : review.organization_id.organization_name_en)
    : ''
  return String(review.student_name || organizationName || review.organization_name || review.job_position || text('Senior review', 'รีวิวจากรุ่นพี่'))
}

const reviewDate = (review: any): string => {
  const value = review.createdAt || review.updatedAt || review.review_date
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(currentLanguage.value === 'TH' ? 'th-TH' : 'en-US')
}

const clearReviewImage = () => {
  if (reviewImageObjectUrl) URL.revokeObjectURL(reviewImageObjectUrl)
  reviewImageObjectUrl = ''
  reviewImageUrl.value = ''
}

const resolveReviewImageUrl = (review: any): string => {
  const nested = review.review_data || {}
  const candidates = [
    review.imageUrl,
    review.image_url,
    review.review_image_url,
    review.reviewImageUrl,
    review.photo,
    review.image,
    nested.imageUrl,
    nested.image_url,
    nested.image,
    nested.photo
  ]
  return candidates.find(value => typeof value === 'string' && value.trim()) || ''
}

const loadReviewImage = async () => {
  clearReviewImage()
  const candidate = resolveReviewImageUrl(activeReview.value)
  if (!candidate) return

  const url = /^https?:\/\//i.test(candidate)
    ? candidate
    : `${window.location.origin}${candidate.startsWith('/') ? '' : '/'}${candidate}`

  try {
    const response = await fetch(url, { cache: 'no-store' })
    if (!response.ok) return
    const blob = await response.blob()
    if (!blob.type.startsWith('image/') || blob.size === 0) return
    reviewImageObjectUrl = URL.createObjectURL(blob)
    reviewImageUrl.value = reviewImageObjectUrl
  } catch {
    clearReviewImage()
  }
}

const previous = () => {
  if (currentIndex.value > 0) currentIndex.value--
}

const next = () => {
  if (currentIndex.value < props.reviews.length - 1) currentIndex.value++
}

const handleTouchStart = (event: TouchEvent) => {
  touchStartX = event.changedTouches[0]?.clientX || 0
}

const handleTouchEnd = (event: TouchEvent) => {
  const endX = event.changedTouches[0]?.clientX || 0
  const distance = endX - touchStartX
  if (Math.abs(distance) < 40) return
  if (distance > 0) previous()
  else next()
}

watch(
  () => [props.reviews, currentIndex.value],
  () => {
    if (currentIndex.value >= props.reviews.length) currentIndex.value = Math.max(0, props.reviews.length - 1)
    void loadReviewImage()
  },
  { deep: true }
)

watch(() => activeReviewKey.value, () => {
  void loadReviewImage()
})

onBeforeUnmount(clearReviewImage)
</script>

<style scoped>
.reviews-panel {
  margin-top: 24px;
  background: #fff;
  border-radius: 12px;
  padding: 28px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.reviews-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
}
.reviews-heading h2 { margin: 0; font: 700 20px Outfit, sans-serif; }
.add {
  cursor: pointer;
  border: 0;
  border-radius: 6px;
  padding: 10px 16px;
  background: #8b0000;
  color: #fff;
  font: 600 14px Inter, sans-serif;
}
.state { padding: 24px 0; color: #666; }
.error { color: #b91c1c; }
.carousel {
  position: relative;
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) 44px;
  align-items: center;
  gap: 12px;
}
.carousel.single-review {
  display: block;
  width: 100%;
}
.carousel.single-review .review-card {
  width: 100%;
  max-width: none;
  min-height: 0;
  box-sizing: border-box;
  padding: 24px;
}
.review-card {
  min-width: 0;
  min-height: 180px;
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding: 20px;
  border: 1px solid #e5e5e5;
  border-radius: 10px;
  background: #fff;
  animation: slide-in 180ms ease-out;
}
.review-content {
  min-width: 0;
  flex: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 10px;
  margin: 0;
  padding: 0;
  text-align: left;
}
.review-row {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr);
  column-gap: 12px;
  align-items: start;
  min-width: 0;
  text-align: left;
}
.review-row dt,
.review-row dd {
  min-width: 0;
  margin: 0;
  padding: 0;
  text-align: left;
  overflow-wrap: anywhere;
}
.review-row dt { font-weight: 700; }
.review-row-text dd {
  white-space: pre-line;
  line-height: 1.6;
}
.review-date { color: #777; font-size: 13px; }
.review-rating { margin-top: 10px; color: #d1d5db; letter-spacing: 2px; }
.review-rating .filled { color: #d97706; }
.review-image { display: block; max-width: 220px; max-height: 160px; margin-top: 14px; object-fit: cover; border-radius: 8px; }
.carousel-arrow {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 1px solid #ddd;
  border-radius: 50%;
  background: #fff;
  color: #8b0000;
  font-size: 34px;
  line-height: 34px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.carousel-arrow:disabled { opacity: 0.35; cursor: default; }
.review-actions { display: flex; align-items: flex-start; gap: 8px; flex-shrink: 0; }
.review-actions button {
  padding: 7px 10px;
  border: 0;
  border-radius: 6px;
  background: #f1f1f1;
  cursor: pointer;
  font: 600 13px Inter, sans-serif;
}
.review-actions .danger { color: #b91c1c; }
.carousel-position { margin-top: 12px; text-align: center; color: #777; font-size: 13px; }
@keyframes slide-in {
  from { opacity: 0.25; transform: translateX(8px); }
  to { opacity: 1; transform: translateX(0); }
}
@media (max-width: 700px) {
  .reviews-panel { padding: 20px 12px; }
  .carousel { grid-template-columns: 36px minmax(0, 1fr) 36px; gap: 6px; }
  .carousel.single-review {
    display: block;
  }
  .carousel.single-review .review-card {
    width: 100%;
    padding: 16px;
  }
  .carousel-arrow { width: 36px; height: 36px; font-size: 28px; }
  .review-card { flex-direction: column; min-height: 160px; padding: 16px; }
  .review-actions { justify-content: flex-start; }
  .review-row { grid-template-columns: 118px minmax(0, 1fr); column-gap: 8px; }
  .review-image { max-width: 100%; }
}
</style>
