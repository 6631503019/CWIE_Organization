<template>
  <div class="user_organization_detail">
    <UserNavbar />
    <main>
      <section class="content">
        <div class="heading">
          <button class="back" type="button" @click="goBack">← {{ text('Back to List', 'กลับไปยังรายการ') }}</button>
        </div>

        <p v-if="error" class="state error">{{ error }}</p>
        <div v-else-if="loading" class="state">{{ text('Loading organization...', 'กำลังโหลดข้อมูลองค์กร...') }}</div>
        <article v-else-if="organization" class="profile-card">
          <div class="profile-header">
            <div class="logo-wrap">
              <img v-if="logoUrl" :src="logoUrl" :alt="localized(organization.name_en, organization.name_th)" @error="logoUrl = ''" />
              <span v-else class="logo-fallback">◎</span>
            </div>
            <div>
              <h1>{{ localized(organization.name_en, organization.name_th) }}</h1>
              <p>{{ localized(organization.business_type_en, organization.business_type_th) }}</p>
            </div>
          </div>

          <dl class="details">
            <div><dt>{{ text('Organization type', 'ประเภทองค์กร') }}</dt><dd>{{ organization.organization_type || 'N/A' }}</dd></div>
            <div><dt>{{ text('Business category', 'หมวดธุรกิจ') }}</dt><dd>{{ localized(organization.business_category_en, organization.business_category_th) }}</dd></div>
            <div><dt>{{ text('School', 'สำนักวิชา') }}</dt><dd>{{ localized(organization.school_en, organization.school_th) }}</dd></div>
            <div><dt>{{ text('Province', 'จังหวัด') }}</dt><dd>{{ localized(organization.province_en, organization.province_th) }}</dd></div>
            <div><dt>{{ text('Country', 'ประเทศ') }}</dt><dd>{{ localized(organization.country_en, organization.country_th) }}</dd></div>
            <div><dt>{{ text('Email', 'อีเมล') }}</dt><dd>{{ organization.email || 'N/A' }}</dd></div>
            <div><dt>{{ text('Phone', 'โทรศัพท์') }}</dt><dd>{{ organization.phone_number || 'N/A' }}</dd></div>
          </dl>

          <div class="description">
            <h2>{{ text('Description', 'รายละเอียดองค์กร') }}</h2>
            <p>{{ organization.details || text('No description available.', 'ไม่มีรายละเอียด') }}</p>
          </div>

          <button v-if="mouId" type="button" class="mou-link" @click="openMou">
            {{ text('View MOU Document', 'ดูเอกสาร MOU') }}
          </button>
        </article>

        <section v-if="organization" class="reviews-panel">
          <div class="reviews-heading"><h2>{{ text('Senior Reviews', 'รีวิวจากรุ่นพี่') }}</h2></div>
          <div v-if="reviewsLoading" class="state">{{ text('Loading reviews...', 'กำลังโหลดรีวิว...') }}</div>
          <div v-else-if="reviewsError" class="state error">{{ reviewsError }}</div>
          <div v-else-if="reviews.length === 0" class="state">{{ text('No reviews available.', 'ยังไม่มีรีวิว') }}</div>
          <div v-else class="review-list">
            <article v-for="review in reviews" :key="review._id" class="review-card">
              <div class="review-meta">
                <strong>{{ review.job_position || text('Senior review', 'รีวิวจากรุ่นพี่') }}</strong>
                <span>{{ review.academic_year || '—' }} · {{ review.semester || '—' }}</span>
              </div>
              <p>{{ review.review_text || '—' }}</p>
            </article>
          </div>
        </section>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UserNavbar from '../components/UserNavbar.vue'
import { organizationAPI, reviewAPI, mouAPI, getOrganizationLogoUrl, getMouFileUrl } from '../services/api'
import { useLanguage } from '../composables/useLanguage'

const route = useRoute()
const router = useRouter()
const { currentLanguage, text } = useLanguage()
const organization = ref<any>(null)
const reviews = ref<any[]>([])
const loading = ref(false)
const reviewsLoading = ref(false)
const error = ref('')
const reviewsError = ref('')
const logoUrl = ref('')
const mouId = ref('')
const organizationId = computed(() => String(route.params.id || ''))

const localized = (english: any, thai: any, fallback = '') =>
  String((currentLanguage.value === 'TH' ? thai : english) || (currentLanguage.value === 'TH' ? english : thai) || fallback || 'N/A')

const isPublished = (value: any) => value === true || value === 'true' || value === 1 || value === '1'

const loadOrganization = async (id: string) => {
  loading.value = true
  error.value = ''
  try {
    const response = await organizationAPI.getById(id)
    organization.value = response.data?.data || null
    logoUrl.value = getOrganizationLogoUrl(organization.value)

    const mouResponse = await mouAPI.getAll({ limit: 100 })
    const records = mouResponse.data?.data || mouResponse.data || []
    const match = records.find((record: any) => {
      if (!isPublished(record.is_published)) return false
      const reference = record.organization_id
      return String(typeof reference === 'object' ? reference?._id : reference) === id
    })
    mouId.value = match?._id ? String(match._id) : ''
  } catch (requestError: any) {
    error.value = requestError.response?.data?.message || text('Unable to load organization.', 'ไม่สามารถโหลดข้อมูลองค์กรได้')
  } finally {
    loading.value = false
  }
}

const loadReviews = async (id: string) => {
  reviewsLoading.value = true
  reviewsError.value = ''
  try {
    const response = await reviewAPI.getByOrganization(id)
    reviews.value = response.data?.data || []
  } catch (requestError: any) {
    reviewsError.value = requestError.response?.data?.message || text('Unable to load reviews.', 'ไม่สามารถโหลดรีวิวได้')
  } finally {
    reviewsLoading.value = false
  }
}

const openMou = () => {
  if (mouId.value) window.open(getMouFileUrl(mouId.value), '_blank', 'noopener,noreferrer')
}
const goBack = () => router.push('/user/organization')

onMounted(() => {
  if (organizationId.value) {
    loadOrganization(organizationId.value)
    loadReviews(organizationId.value)
  }
})
watch(organizationId, (id) => {
  if (id) {
    loadOrganization(id)
    loadReviews(id)
  }
})
onBeforeUnmount(() => {})
</script>

<style scoped>
.user_organization_detail { min-height: 100vh; background: #f6f7f8; }
main { margin-left: 66px; }
.content { max-width: 1100px; margin: 0 auto; padding: 28px 24px 60px; }
.heading { display: flex; justify-content: flex-start; margin-bottom: 16px; }
.back { height: 40px; border: 1px solid #d1d5db; border-radius: 8px; background: #fff; padding: 0 14px; cursor: pointer; }
.profile-card, .reviews-panel { background: #fff; border-radius: 12px; padding: 24px; margin-bottom: 20px; }
.profile-header { display: flex; align-items: center; gap: 18px; }
.logo-wrap { width: 120px; height: 120px; border: 1px solid #e5e7eb; border-radius: 12px; display: grid; place-items: center; overflow: hidden; }
.logo-wrap img { width: 100%; height: 100%; object-fit: cover; }
.logo-fallback { font-size: 48px; color: #9ca3af; }
.profile-header h1 { margin: 0; }
.profile-header p { margin: 6px 0 0; color: #6b7280; }
.details { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 24px 0; }
.details div { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
.details dt { color: #6b7280; font-size: 12px; }
.details dd { margin: 6px 0 0; font-weight: 600; }
.description p { white-space: pre-wrap; }
.mou-link { height: 40px; border: 0; border-radius: 8px; background: #111827; color: #fff; padding: 0 14px; cursor: pointer; }
.reviews-heading h2 { margin-top: 0; }
.review-list { display: grid; gap: 10px; }
.review-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; }
.review-meta { display: flex; justify-content: space-between; gap: 12px; }
.review-card p { white-space: pre-wrap; }
.state { padding: 20px; text-align: center; color: #6b7280; }
.state.error { color: #dc2626; }
@media (max-width: 700px) { .details { grid-template-columns: 1fr; } .review-meta { flex-direction: column; } }
</style>
