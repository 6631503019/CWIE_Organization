<template>
  <div class="user_mou_detail">
    <UserNavbar />
    <main class="detail_main">
      <button type="button" class="back_button" @click="router.back()">← {{ text('Back', 'กลับ') }}</button>

      <section v-if="loading" class="state_card">{{ text('Loading MOU...', 'กำลังโหลด MOU...') }}</section>
      <section v-else-if="error" class="state_card error">{{ error }}</section>
      <section v-else-if="mou" class="detail_card">
        <div class="detail_header">
          <div>
            <span class="read_only">{{ text('Read only', 'ดูข้อมูลเท่านั้น') }}</span>
            <h1>{{ organizationName }}</h1>
            <p>{{ mou.mou_original_name || text('MOU document', 'เอกสาร MOU') }}</p>
          </div>
          <img v-if="logoUrl" :src="logoUrl" :alt="organizationName" class="organization_logo" @error="hideBrokenImage" />
        </div>

        <div class="info_grid">
          <div><span>{{ text('Start date', 'วันที่เริ่มต้น') }}</span><strong>{{ formatDate(mou.start_date) }}</strong></div>
          <div><span>{{ text('End date', 'วันที่สิ้นสุด') }}</span><strong>{{ formatDate(mou.end_date) }}</strong></div>
          <div><span>{{ text('Status', 'สถานะ') }}</span><strong>{{ text('Published', 'เผยแพร่') }}</strong></div>
          <div><span>{{ text('File size', 'ขนาดไฟล์') }}</span><strong>{{ formatFileSize(mou.mou_file_size) }}</strong></div>
        </div>

        <button v-if="pdfUrl" type="button" class="pdf_button" @click="openPdf">
          {{ text('Open MOU PDF', 'เปิดเอกสาร PDF') }}
        </button>
        <p v-else class="missing_pdf">{{ text('MOU PDF is unavailable.', 'เอกสาร PDF ไม่พร้อมใช้งาน') }}</p>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UserNavbar from '../components/UserNavbar.vue'
import { mouAPI, fetchMouFileBlob, getOrganizationLogoUrl } from '../services/api'
import { useLanguage } from '../composables/useLanguage'

const route = useRoute()
const router = useRouter()
const { text } = useLanguage()
const mou = ref<any>(null)
const loading = ref(true)
const error = ref('')
const pdfUrl = ref('')

const organizationName = ref('')
const logoUrl = ref('')

const formatDate = (value: unknown) => {
  if (!value) return '—'
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-GB')
}

const formatFileSize = (value: unknown) => {
  const bytes = Number(value)
  if (!bytes) return '—'
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const hideBrokenImage = (event: Event) => {
  (event.target as HTMLImageElement).style.display = 'none'
}

const openPdf = () => {
  if (pdfUrl.value) window.open(pdfUrl.value, '_blank', 'noopener,noreferrer')
}

onMounted(async () => {
  try {
    const id = String(route.params.id || '')
    if (!id) throw new Error('MOU ID is required')

    const response = await mouAPI.getById(id)
    mou.value = response.data?.data || response.data
    const organization = mou.value.organization_id
    organizationName.value = typeof organization === 'object'
      ? organization.organization_name_en || organization.organization_name_th || 'Organization'
      : 'Organization'
    logoUrl.value = typeof organization === 'object' ? getOrganizationLogoUrl(organization) : ''

    try {
      pdfUrl.value = await fetchMouFileBlob(id)
    } catch {
      pdfUrl.value = ''
    }
  } catch (loadError: any) {
    error.value = loadError.response?.data?.message || loadError.message || 'Failed to load MOU'
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  if (pdfUrl.value.startsWith('blob:')) URL.revokeObjectURL(pdfUrl.value)
})
</script>

<style scoped>
.user_mou_detail { min-height: 100vh; background: #f6f7f8; font-family: Inter, sans-serif; }
.detail_main { margin-left: 66px; padding: 48px 32px; }
.back_button { margin-bottom: 20px; border: 1px solid #d1d5db; border-radius: 8px; background: #fff; min-height: 40px; padding: 0 16px; cursor: pointer; }
.detail_card { max-width: 960px; margin: 0 auto; padding: 28px; border-radius: 12px; background: #fff; box-shadow: 0 4px 16px rgba(0,0,0,.06); }
.detail_header { display: flex; justify-content: space-between; align-items: center; gap: 20px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
.detail_header h1 { margin: 8px 0 4px; font-size: 28px; }
.detail_header p { margin: 0; color: #666; }
.read_only { display: inline-block; border-radius: 999px; background: #eef2ff; color: #374151; padding: 5px 10px; font-size: 12px; font-weight: 700; }
.organization_logo { width: 120px; height: 120px; object-fit: contain; }
.info_grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 16px; margin: 24px 0; }
.info_grid div { display: grid; gap: 6px; padding: 16px; border-radius: 8px; background: #f8f8f8; }
.info_grid span { color: #777; font-size: 13px; }
.pdf_button { min-height: 44px; border: 0; border-radius: 8px; background: #8b0000; color: #fff; padding: 0 18px; font-weight: 700; cursor: pointer; }
.missing_pdf, .state_card { color: #777; }
.state_card { max-width: 960px; margin: 0 auto; padding: 24px; border-radius: 10px; background: #fff; }
.state_card.error { color: #b42318; }
@media (max-width: 700px) {
  .detail_main { margin-left: 66px; padding: 24px 16px; }
  .detail_header { align-items: flex-start; }
  .organization_logo { width: 72px; height: 72px; }
  .info_grid { grid-template-columns: 1fr; }
}
</style>
