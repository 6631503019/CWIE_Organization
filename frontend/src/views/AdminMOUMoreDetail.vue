<template>
  <div class="admin_mou_more_detail">
    <AdminNavbar />

    <!-- Figma: TopBar -->
    <header class="detail_topbar">
      <div class="breadcrumb">
        <span>{{ text('Organization', 'องค์กร') }}</span>
        <span class="breadcrumb_separator">›</span>
        <span class="breadcrumb_current">
        {{ organizationName }}
        </span>
      </div>

      <div class="topbar_actions">
        <button type="button" class="edit_button" @click="editOrganization">
          {{ text('Edit', 'แก้ไข') }}
        </button>

        <button type="button" class="back_list_button" @click="goBack">
          {{ text('Back to List', 'กลับไปยังรายการ') }}
        </button>
      </div>
    </header>

    <!-- Figma: Content -->
    <main class="detail_content">
      <!-- Profile Card -->
      <section class="profile_card">
        <div class="profile_header">
          <div class="org_logo">
            <img
              :src="logoUrl"
              :alt="organizationName !== 'N/A' ? organizationName : 'Organization logo'"
            />
          </div>

          <div class="profile_title_col">
            <div class="profile_title_row">
              <h1 class="org_name">
                {{ organizationName !== 'N/A' ? organizationName : 'No Name' }}
              </h1>

              <span
                class="status_pill"
                :class="{ inactive: !isOrganizationActive }"
              >
                {{ isOrganizationActive ? text('Active', 'ใช้งาน') : text('Inactive', 'ไม่ใช้งาน') }}
              </span>
            </div>

            <div class="org_type">
              {{ organizationTypeLabel }}
            </div>
          </div>
        </div>

        <p class="org_description">
          {{ organizationDescription }}
        </p>

        <div class="profile_divider"></div>
      </section>

      <!-- Right-side organization information -->
      <section class="organization_info">
        <div class="info_row">
          <div class="info_label">{{ text('Business Type', 'ประเภทองค์กร') }}</div>
          <div class="info_value">{{ businessTypeLabel }}</div>
        </div>

        <div class="info_row">
          <div class="info_label">{{ text('Business Category', 'ประเภทธุรกิจ') }}</div>
          <div class="info_value">{{ businessCategoryLabel }}</div>
        </div>

        <div class="info_row info_row_school">
          <div class="info_label">{{ text('School', 'สำนักวิชา') }}</div>
          <div class="info_value">{{ schoolLabel }}</div>
        </div>

        <div class="info_row">
          <div class="info_label">{{ text('Province', 'จังหวัด') }}</div>
          <div class="info_value">{{ provinceLabel }}</div>
        </div>

        <div class="info_row">
          <div class="info_label">{{ text('Country', 'ประเทศ') }}</div>
          <div class="info_value">{{ countryLabel }}</div>
        </div>

        <div class="info_row">
          <div class="info_label">{{ text('Telephone', 'โทรศัพท์') }}</div>
          <div class="info_value">{{ telephoneLabel }}</div>
        </div>

        <div class="info_row">
          <div class="info_label">{{ text('Email', 'อีเมล') }}</div>
          <div class="info_value">{{ emailLabel }}</div>
        </div>
      </section>

      <!-- Figma: ReviewsPanel -->
      <section class="reviews_panel">
        <h2 class="reviews_title">
          {{ text('Senior Reviews', 'รีวิวจากนักศึกษา') }}
        </h2>

        <div v-if="reviews.length > 0" class="reviews_list">
          <article
            v-for="(review, index) in reviews"
            :key="review._id || index"
            class="review_row"
          >
            <div class="review_meta">
              <span class="meta_label">{{ text('Academic Year', 'ปีการศึกษา') }}</span>
              <span class="meta_value">{{ getAcademicYear(review) }}</span>

              <span class="meta_label">{{ text('Semester', 'ภาคการศึกษา') }}</span>
              <span class="meta_value">{{ getSemester(review) }}</span>
            </div>

            <p class="review_text">
              {{ review.review_text || review.review || 'N/A' }}
            </p>
          </article>
        </div>

        <div v-else-if="reviewsError" class="no_reviews">
          {{ text('Unable to load reviews.', 'ไม่สามารถโหลดรีวิวได้') }}
        </div>

        <div v-else class="no_reviews">
          {{ text('No reviews available yet.', 'ยังไม่มีรีวิว') }}
        </div>
      </section>

    </main>

    <NotificationModal
      :show="showNotificationModal"
      :message="notificationMessage"
      :type="notificationType"
      @close="showNotificationModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminNavbar from '../components/AdminNavbar.vue'
import NotificationModal from '../components/NotificationModal.vue'
import { organizationAPI, reviewAPI, mouAPI, BACKEND_URL } from '../services/api'
import { useLanguage } from '../composables/useLanguage'

const route = useRoute()
const router = useRouter()

const organization = ref<any>(null)
const mou = ref<any>(null)
const reviews = ref<any[]>([])
const reviewsError = ref(false)
const showNotificationModal = ref(false)
const notificationMessage = ref('')
const notificationType = ref<'success' | 'error' | 'warning'>('warning')
const loading = ref(false)
const error = ref<string | null>(null)

const { currentLanguage, text } = useLanguage()

const getValue = (...values: any[]): string => {
  const value = values.find(
    item =>
      item !== null &&
      item !== undefined &&
      String(item).trim() !== ''
  )

  return value !== undefined && value !== null ? String(value) : 'N/A'
}

const getLocalizedValue = (english: any, thai: any, ...fallbacks: any[]): string => {
  const localizedValue = currentLanguage.value === 'TH' ? thai : english
  return getValue(localizedValue, ...fallbacks)
}

const organizationName = computed(() => getLocalizedValue(
  organization.value?.organization_name_en,
  organization.value?.organization_name_th,
  organization.value?.name_en,
  organization.value?.name_th
))

const getNestedValue = (obj: any, keys: string[]): any => {
  let value = obj

  for (const key of keys) {
    if (value === null || value === undefined) return undefined
    value = value[key]
  }

  return value
}

const logoUrl = computed(() => {
  if (organization.value?.logo_path) {
    let logoPath = String(organization.value.logo_path).replace(/\\/g, '/')

    if (!logoPath.startsWith('/')) {
      logoPath = '/' + logoPath
    }

    return `${BACKEND_URL}${logoPath}`
  }

  return '/api/placeholder/56/56'
})

const isOrganizationActive = computed(() => {
  const value = organization.value?.is_public

  return (
    value === true ||
    value === 'true' ||
    value === 1 ||
    value === '1'
  )
})

const organizationTypeLabel = computed(() => {
  return getLocalizedValue(
    organization.value?.organization_type_en,
    organization.value?.organization_type_th,
    organization.value?.organization_type?.name_en,
    organization.value?.organization_type?.name_th,
    organization.value?.organization_type,
    organization.value?.type
  )
})

const businessTypeLabel = computed(() => {
  const englishValue = organization.value?.business_type_en
  const thaiValue = organization.value?.business_type_th
  const value = organization.value?.business_type ?? organization.value?.businessType

  if (englishValue || thaiValue) {
    return getLocalizedValue(englishValue, thaiValue)
  }

  if (Array.isArray(value)) {
    return value
      .map(item => {
        if (typeof item === 'object') {
          return getValue(item?.name_en, item?.name_th, item?.name)
        }

        return String(item)
      })
      .filter(Boolean)
      .join(', ') || 'N/A'
  }

  if (typeof value === 'object' && value !== null) {
    return getValue(value?.name_en, value?.name_th, value?.name)
  }

  return getValue(value)
})

const businessCategoryLabel = computed(() => {
  const englishValue = organization.value?.business_category_en
  const thaiValue = organization.value?.business_category_th
  const value =
    organization.value?.business_category ??
    organization.value?.business_category_id ??
    organization.value?.industry_category

  if (englishValue || thaiValue) {
    return getLocalizedValue(englishValue, thaiValue)
  }

  if (Array.isArray(value)) {
    return value
      .map(item => {
        if (typeof item === 'object') {
          return getValue(item?.name_en, item?.name_th, item?.name)
        }

        return String(item)
      })
      .filter(Boolean)
      .join(', ') || 'N/A'
  }

  if (typeof value === 'object' && value !== null) {
    return getValue(value?.name_en, value?.name_th, value?.name)
  }

  return getValue(value)
})

const schoolLabel = computed(() => {
  const school = organization.value?.school

  return getLocalizedValue(
    organization.value?.school_en,
    organization.value?.school_th,
    typeof school === 'object' && school !== null
      ? (currentLanguage.value === 'TH' ? school.name_th : school.name_en)
      : school,
    typeof school === 'object' && school !== null ? school.name : undefined,
    organization.value?.school_name_en,
    organization.value?.school_name_th
  )
})

const provinceLabel = computed(() => {
  return getLocalizedValue(
    organization.value?.province_en,
    organization.value?.province_th,
    organization.value?.province?.name_en,
    organization.value?.province?.name_th,
    organization.value?.province?.name,
    organization.value?.province,
    organization.value?.address?.province
  )
})

const countryLabel = computed(() => {
  return getLocalizedValue(
    organization.value?.country_en,
    organization.value?.country_th,
    organization.value?.country?.name_en,
    organization.value?.country?.name_th,
    organization.value?.country?.name,
    organization.value?.country,
    organization.value?.address?.country
  )
})

const telephoneLabel = computed(() => {
  return getValue(
    organization.value?.telephone,
    organization.value?.tel,
    organization.value?.telephone,
    organization.value?.phone,
    organization.value?.phone_number
  )
})

const emailLabel = computed(() => {
  return getValue(
    organization.value?.organization_email,
    organization.value?.email
  )
})

const formatDate = (value: unknown): string => {
  if (!value) return 'N/A'
  const date = new Date(String(value))
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const documentPath = computed(() => {
  const value = mou.value?.mou_path || mou.value?.mou_file_path
  if (!value) return ''
  const path = String(value).replace(/\\/g, '/')
  return path.startsWith('/') ? path : `/${path}`
})

const documentUrl = computed(() => documentPath.value ? `${BACKEND_URL}${documentPath.value}` : '')
const documentName = computed(() => documentPath.value.split('/').pop() || 'MOU Document')

const organizationDescription = computed(() => {
  return getValue(
    organization.value?.details_en,
    organization.value?.details_th,
    organization.value?.details,
    organization.value?.description_en,
    organization.value?.description_th,
    organization.value?.description
  )
})

const getAcademicYear = (review: any): string => {
  return getValue(
    review?.academic_year,
    review?.academicYear,
    review?.year
  )
}

const getSemester = (review: any): string => {
  return getValue(
    review?.semester,
    review?.term
  )
}

const fetchMOU = async () => {
  try {
    loading.value = true
    error.value = null
    organization.value = null
    mou.value = null
    reviews.value = []
    reviewsError.value = false

    const routeId = String(route.params.id || '')

    if (!routeId) {
      throw new Error('Organization ID is required')
    }

    // AdminOrganization navigates with the Organization _id. Keep the
    // existing MOU lookup as a fallback for legacy links to this route.
    try {
      const organizationResponse = await organizationAPI.getById(routeId)
      organization.value = organizationResponse.data.data
    } catch (organizationError: any) {
      if (organizationError.response?.status !== 404) {
        throw organizationError
      }

      const mouResponse = await mouAPI.getById(routeId)
      mou.value = mouResponse.data.data

      const organizationData = mou.value?.organization || mou.value?.organization_id
      const organizationId = typeof organizationData === 'object'
        ? organizationData?._id
        : organizationData

      if (organizationId) {
        const organizationResponse = await organizationAPI.getById(String(organizationId))
        organization.value = organizationResponse.data.data
      } else if (typeof organizationData === 'object') {
        organization.value = organizationData
      }
    }

    if (!organization.value) {
      throw new Error('Organization data is missing')
    }
  } catch (err: any) {
    error.value =
      err.response?.data?.message || err.message || 'Failed to load organization details'

    console.error('Error loading organization:', err)
  } finally {
    loading.value = false
  }
}

const fetchReviews = async () => {
  try {
    reviewsError.value = false
    reviews.value = []

    const orgId = organization.value?._id ||
      (typeof mou.value?.organization_id === 'object'
        ? mou.value.organization_id?._id
        : mou.value?.organization_id)

    if (!orgId) return

    const response = await reviewAPI.getByOrganization(orgId)
    reviews.value = response.data.data || []
  } catch (err: any) {
    console.error('Error loading reviews:', err)
    reviews.value = []
    reviewsError.value = true
  }
}


const editOrganization = async () => {
  const orgId = organization.value?._id ||
    (typeof mou.value?.organization_id === 'object'
      ? mou.value.organization_id?._id
      : mou.value?.organization_id)

  if (!orgId) {
    notificationMessage.value = text(
      'Cannot edit this organization because its ID is missing.',
      'ไม่สามารถแก้ไของค์กรนี้ได้ เนื่องจากไม่พบรหัสองค์กร'
    )
    notificationType.value = 'error'
    showNotificationModal.value = true
    return
  }

  const routeRecords = router.getRoutes()
  const editCandidates = routeRecords.filter(record => {
    const routeDescription = `${String(record.name ?? '')} ${record.path}`.toLowerCase()
    return routeDescription.includes('organization') && /edit|update/.test(routeDescription)
  })

  // Prefer an explicit organization edit URL, then a named edit route.
  const editRoute =
    editCandidates.find(record => /\/(edit|update)(\/|$)/i.test(record.path)) ||
    editCandidates.find(record => /edit|update/i.test(String(record.name ?? '')))

  if (editRoute?.name) {
    const params: Record<string, string> = {}
    const parameterNames = editRoute.path.match(/:([A-Za-z0-9_]+)/g) || []

    parameterNames.forEach(parameter => {
      params[parameter.slice(1)] = String(orgId)
    })

    await router.push({
      name: editRoute.name,
      params
    })
    return
  }

  // Keep the application's existing expected path as a fallback.
  await router.push({
    path: `/admin/organization/${encodeURIComponent(String(orgId))}/edit`
  })
}

const goBack = () => {
  router.back()
}

watch(() => route.params.id, async () => {
  await fetchMOU()
  await fetchReviews()
}, { immediate: true })
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* Figma frame: Organization_Detail (1319 x 737) */
.admin_mou_more_detail {
  position: relative;
  width: 100%;
  min-width: 1100px;
  min-height: 737px;
  min-height: 100vh;
  background: #ffffff;
  color: #1f2937;
  overflow-x: auto;
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
}

/* Figma TopBar: left 67px, right 17px, top 10px, height 71px */
.detail_topbar {
  position: relative;
  height: 71px;
  margin-left: 67px;
  margin-right: 17px;
  top: 10px;
  padding: 0 15px 0 32px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  max-width: calc(100% - 190px);
  color: #73737a;
  font-size: 12px;
  line-height: 15px;
  font-weight: 400;
}

.breadcrumb_separator {
  color: #a1a1a8;
  flex: 0 0 auto;
}

.breadcrumb_current {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* The Edit and Back buttons match the 157 x 31 Figma group. */
.topbar_actions {
  position: absolute;
  top: 13px;
  right: 15px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 10px;
  width: 157px;
  height: 31px;
  flex-shrink: 0;
}

.edit_button,
.back_list_button {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 31px;
  padding: 8px 14px;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  line-height: 15px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}

.edit_button {
  width: 51px;
  flex: 0 0 51px;
  background: #ffffff;
  border: 1px solid #e6e6e8;
  color: #1f2937;
}

.edit_button:hover {
  background: #f8f8f9;
  border-color: #d1d5db;
}

.edit_button:focus-visible,
.back_list_button:focus-visible {
  outline: 2px solid #8b0000;
  outline-offset: 2px;
}

.back_list_button {
  width: 96px;
  flex: 0 0 96px;
  background: #8b0000;
  border: 1px solid #8b0000;
  color: #ffffff;
}

.back_list_button:hover {
  background: #720000;
  border-color: #720000;
}

/* Figma Content: left 60px, right -9px, top 83px, height 570px.
   The 12px top margin accounts for the TopBar's normal-flow position. */
.detail_content {
  position: relative;
  height: 570px;
  margin-left: 60px;
  margin-right: -9px;
  margin-top: 12px;
  background: #ffffff;
  box-sizing: border-box;
}

/* Figma ProfileCard: 356 x 191px, left 84px, top 24px */
.profile_card {
  position: absolute;
  width: 356px;
  height: 191px;
  left: 84px;
  top: 24px;
  background: #ffffff;
  border-radius: 12px;
  box-sizing: border-box;
}

/* Figma HeaderRow: 340 x 56px, left 24px, top 24px */
.profile_header {
  position: absolute;
  left: 24px;
  top: 24px;
  width: 340px;
  height: 56px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-sizing: border-box;
}

.org_logo {
  width: 56px;
  height: 56px;
  flex: 0 0 56px;
  border-radius: 50%;
  overflow: hidden;
  background: #f3f4f6;
}

.org_logo img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.profile_title_col {
  min-width: 0;
  width: 258px;
  flex: 0 1 258px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.profile_title_row {
  width: 100%;
  min-height: 19px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.org_name {
  min-width: 0;
  flex: 0 1 auto;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 16px;
  line-height: 19px;
  font-weight: 700;
  color: #1f2937;
}

.status_pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  min-width: 47px;
  height: 18px;
  padding: 3px 8px;
  box-sizing: border-box;
  background: #22c55e;
  border-radius: 10px;
  color: #ffffff;
  font-size: 10px;
  line-height: 12px;
  font-weight: 600;
}

.status_pill.inactive {
  background: #73737a;
}

.org_type {
  width: 100%;
  color: #73737a;
  font-size: 11px;
  line-height: 13px;
  font-weight: 400;
}

/* Figma organization description */
.org_description {
  position: absolute;
  left: 24px;
  right: 24px;
  top: 96px;
  height: 60px;
  margin: 0;
  overflow: hidden;
  color: #73737a;
  font-size: 12px;
  line-height: 15px;
  font-weight: 400;
  white-space: pre-line;
}

.profile_divider {
  position: absolute;
  width: 292px;
  height: 1px;
  left: 24px;
  top: 172px;
  background: #e6e6e8;
}

/* Organization details: Figma first row starts at left 108px, top 212px */
.organization_info {
  position: absolute;
  left: 108px;
  top: 212px;
  width: 322px;
  box-sizing: border-box;
}

.info_row {
  width: 322px;
  min-height: 15px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 0 0 16px;
}

.info_row_school {
  min-height: 30px;
  margin-bottom: 16px;
}

.info_label {
  width: 90px;
  flex: 0 0 90px;
  color: #73737a;
  font-size: 11px;
  line-height: 13px;
  font-weight: 600;
}

.info_value {
  width: 220px;
  flex: 0 0 220px;
  color: #1f2937;
  font-size: 12px;
  line-height: 15px;
  font-weight: 400;
  overflow-wrap: anywhere;
}

/* Figma does not specify an extra vertical divider in this section. */
.organization_info::before {
  content: none;
}

/* Figma ReviewsPanel: left 560px, right 106px, top 37px, height 368px */
.reviews_panel {
  position: absolute;
  left: 560px;
  right: 106px;
  top: 37px;
  min-width: 0;
  height: 368px;
  background: #ffffff;
  border-radius: 12px;
  box-sizing: border-box;
  overflow: hidden;
}

.reviews_title {
  position: absolute;
  left: 20px;
  top: 20px;
  margin: 0;
  color: #1f2937;
  font-size: 15px;
  line-height: 18px;
  font-weight: 700;
}

.reviews_list {
  position: absolute;
  left: 20px;
  right: 20px;
  top: 54px;
  overflow: hidden;
}

.review_row {
  min-height: 30px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin: 0 0 16px;
  background: #ffffff;
}

/* Year and semester labels/values fit into the Figma 110px metadata column. */
.review_meta {
  width: 110px;
  min-width: 110px;
  display: grid;
  grid-template-columns: 71px 1fr;
  grid-template-rows: 15px 15px;
  column-gap: 0;
  row-gap: 2px;
  align-items: start;
}

.meta_label {
  color: #73737a;
  font-size: 10px;
  line-height: 12px;
  font-weight: 400;
  white-space: nowrap;
}

.meta_value {
  color: #1f2937;
  font-size: 12px;
  line-height: 15px;
  font-weight: 600;
  white-space: nowrap;
}

.review_text {
  width: 360px;
  max-width: calc(100% - 126px);
  height: 30px;
  flex: 0 1 360px;
  margin: 0;
  overflow: hidden;
  color: #1f2937;
  font-size: 12px;
  line-height: 15px;
  font-weight: 400;
}

.no_reviews {
  position: absolute;
  left: 20px;
  right: 20px;
  top: 54px;
  color: #73737a;
  font-size: 12px;
  line-height: 15px;
}

/* Preserve the Figma desktop composition on smaller laptop viewports. */
@media (max-width: 1200px) {
  .admin_mou_more_detail {
    min-width: 1100px;
  }

  .reviews_panel {
    right: 32px;
  }
}

@media (max-width: 900px) {
  .admin_mou_more_detail {
    min-width: 1100px;
  }

  .detail_topbar {
    padding-left: 20px;
  }

  .detail_content {
    overflow: visible;
  }
}
</style>
