<template>
  <div class="admin-detail">
    <UserNavbar />
    <main>
      <AdminTopBar />
      <section class="content">
        <div class="heading">
          <button class="back" type="button" @click="goBack">← {{ text('Back to List', 'กลับไปยังรายการ') }}</button>
        </div>

        <p v-if="organizationError" class="state error">{{ organizationError }}</p>
        <div v-else-if="loadingOrganization && !organization" class="state">{{ text('Loading organization...', 'กำลังโหลดข้อมูลองค์กร...') }}</div>
        <article v-else-if="organization" class="profile-card">
          <div class="profile-header">
            <div v-if="logoUrl" class="logo-wrap">
              <img :src="logoUrl" :alt="localized(organization.name_en, organization.name_th)" @error="clearLogo" />
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
            <div><dt>{{ text('Province', 'จังหวัด') }}</dt><dd>{{ localized(organization.province_en, organization.province_th, organization.province_id) }}</dd></div>
            <div><dt>{{ text('Country', 'ประเทศ') }}</dt><dd>{{ localized(organization.country_en, organization.country_th, organization.country_id) }}</dd></div>
            <div><dt>{{ text('Email', 'อีเมล') }}</dt><dd>{{ organization.email || 'N/A' }}</dd></div>
            <div><dt>{{ text('Phone', 'โทรศัพท์') }}</dt><dd>{{ organization.phone_number || 'N/A' }}</dd></div>
          </dl>
          <div class="description">
            <h2>{{ text('Description', 'รายละเอียดองค์กร') }}</h2>
            <p>{{ organization.details || text('No description available.', 'ไม่มีรายละเอียด') }}</p>
          </div>
          <button v-if="mouId" type="button" class="mou-link" :disabled="mouLoading" @click="openMou">
            {{ mouLoading ? text('Opening PDF...', 'กำลังเปิด PDF...') : text('View MOU PDF', 'ดูเอกสาร MOU PDF') }}
          </button>
        </article>

        <OrganizationReviewCarousel
          v-if="organization"
          :reviews="reviews"
          :loading="reviewsLoading"
          :error="reviewsError"
          :admin="false"
        />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UserNavbar from '../components/UserNavbar.vue'
import AdminTopBar from '../components/admin/AdminTopBar.vue'
import { organizationAPI, reviewAPI, mouAPI, getOrganizationLogoUrl, getMouFileUrl } from '../services/api'
import { useLanguage } from '../composables/useLanguage'
import OrganizationReviewCarousel from '../components/OrganizationReviewCarousel.vue'

const route = useRoute()
const router = useRouter()
const { currentLanguage, text } = useLanguage()
const organization = ref<any>(null)
const reviews = ref<any[]>([])
const loadingOrganization = ref(false)
const reviewsLoading = ref(false)
const organizationError = ref('')
const reviewsError = ref('')
const logoUrl = ref('')
const mouId = ref('')
const mouLoading = ref(false)
let logoObjectUrl = ''
const organizationId = computed(() => String(route.params.id || ''))
const localized = (english: any, thai: any, fallback = '') => String((currentLanguage.value === 'TH' ? thai : english) || (currentLanguage.value === 'TH' ? english : thai) || fallback || 'N/A')
const isPublished = (value: any) => value === true || value === 'true' || value === 1 || value === '1'

const clearLogo = () => {
  if (logoObjectUrl) URL.revokeObjectURL(logoObjectUrl)
  logoObjectUrl = ''
  logoUrl.value = ''
}

const loadVerifiedLogo = async (organizationData: any) => {
  clearLogo()
  const candidate = getOrganizationLogoUrl(organizationData)
  if (!candidate || !organizationData) return
  const separator = candidate.includes('?') ? '&' : '?'
  const cacheVersion = String(organizationData.logo_gridfs_id || organizationData.updatedAt || '')
  const url = `${candidate}${cacheVersion ? `${separator}v=${encodeURIComponent(cacheVersion)}` : ''}`
  try {
    const response = await fetch(url, { cache: 'no-store' })
    if (!response.ok) return
    const blob = await response.blob()
    if (!blob.type.startsWith('image/') || blob.size === 0) return
    logoObjectUrl = URL.createObjectURL(blob)
    logoUrl.value = logoObjectUrl
  } catch {
    clearLogo()
  }
}

const loadOrganization = async (id: string) => {
  loadingOrganization.value = true
  organizationError.value = ''
  try {
    const response = await organizationAPI.getById(id)
    organization.value = response.data?.data || null
    await loadVerifiedLogo(organization.value)
    const mouResponse = await mouAPI.getAll({ limit: 100 })
    const records = mouResponse.data?.data || mouResponse.data || []
    const match = records.find((record: any) => {
      if (!isPublished(record.is_published)) return false
      const reference = record.organization_id
      return String(typeof reference === 'object' ? reference?._id : reference) === id
    })
    mouId.value = match?._id ? String(match._id) : ''
  } catch (error: any) {
    organizationError.value = error.response?.data?.message || text('Unable to load organization.', '????????????????????????????')
  } finally { loadingOrganization.value = false }
}
const loadReviews = async (id: string) => {
  reviewsLoading.value = true
  reviewsError.value = ''
  try {
    const response = await reviewAPI.getByOrganization(id)
    reviews.value = response.data?.data || []
  } catch (error: any) {
    reviewsError.value = error.response?.data?.message || text('Unable to load reviews.', '?????????????????????')
  } finally { reviewsLoading.value = false }
}
const openMou = () => { if (mouId.value) window.open(getMouFileUrl(mouId.value), '_blank', 'noopener,noreferrer') }
const goBack = () => router.push('/user/organization')
const loadPage = (id: string) => { if (id) { loadOrganization(id); loadReviews(id) } }

onMounted(() => loadPage(organizationId.value))
watch(organizationId, (id, previous) => { if (id && id !== previous) loadPage(id) })
onBeforeUnmount(clearLogo)
</script>

<style scoped>
.admin-detail { min-height: 100vh; background: #f6f7f8; }
main { margin-left: 66px; }
.content { max-width: 1100px; margin: 0 auto; padding: 28px 24px 60px; }
.heading, .reviews-heading { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
.heading { margin-bottom: 20px; }
button { cursor: pointer; border: 0; border-radius: 6px; padding: 10px 16px; font: 600 14px Inter, sans-serif; }
.back { padding-left: 0; background: transparent; color: #8b0000; }
.edit, .add { background: #8b0000; color: #fff; }
.profile-card, .reviews-panel { background: #fff; border-radius: 12px; padding: 28px; box-shadow: 0 2px 8px rgba(0,0,0,.06); }
.profile-header { display: flex; align-items: center; gap: 22px; border-bottom: 1px solid #eee; padding-bottom: 22px; }
.profile-header h1 { margin: 0 0 6px; font: 700 28px Outfit, sans-serif; overflow-wrap: anywhere; }
.profile-header p { margin: 0; color: #666; }
.logo-wrap { width: 110px; height: 110px; flex: 0 0 110px; overflow: hidden; border-radius: 50%; background: #eee; display: grid; place-items: center; }
.logo-wrap img { width: 100%; height: 100%; object-fit: cover; }
.logo-fallback { font-size: 46px; color: #aaa; }
.details { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px 28px; margin: 24px 0; }
.details div { min-width: 0; } dt { color: #777; font-size: 13px; } dd { margin: 4px 0 0; overflow-wrap: anywhere; }
.description { border-top: 1px solid #eee; padding-top: 18px; } .description h2, .reviews-heading h2 { margin: 0; font: 700 20px Outfit, sans-serif; } .description p { white-space: pre-line; overflow-wrap: anywhere; }
.reviews-panel { margin-top: 24px; } .review-list { display: grid; gap: 12px; margin-top: 18px; }
.review-card { display: flex; justify-content: space-between; gap: 18px; padding: 16px; border: 1px solid #e5e5e5; border-radius: 8px; min-width: 0; }
.review-content { min-width: 0; flex: 1; }
.review-actions { display: flex; align-items: flex-start; gap: 8px; flex-shrink: 0; } .review-actions button { padding: 7px 10px; background: #f1f1f1; } .review-actions .danger { color: #b91c1c; }
.state { padding: 24px 0; color: #666; } .error { color: #b91c1c; }
@media (max-width: 700px) {
  main { margin-left: 0; }
  .content { padding: 18px 12px 40px; }
  .details { grid-template-columns: 1fr; }
  .profile-header { align-items: flex-start; }
  .profile-header h1 { font-size: 22px; }
  .review-card { flex-direction: column; }
  .review-actions { justify-content: flex-start; }
}
</style>
