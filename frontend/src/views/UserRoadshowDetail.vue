<template>
  <div class="admin_roadshow_detail">
    <UserNavbar />

    <AdminTopBar />

    <main class="detail_main">
      <section class="detail_content">
        <div v-if="obj_UI_State.bln_Is_Loading" class="loading_message">
          Loading roadshow details...
        </div>

        <div v-else-if="obj_UI_State.str_Error_Message" class="error_message">
          {{ obj_UI_State.str_Error_Message }}
        </div>

        <template v-else-if="obj_Roadshow_Data">
          <div class="detail_toolbar">
            <button class="btn_back" type="button" @click="router.back()">← {{ text('Back to List', 'กลับไปยังรายการ') }}</button>
          </div>
          <section class="detail_header">
            <div>
              <span class="status_pill" :class="Get_Status_Class(obj_Roadshow_Data)">{{ Get_Status(obj_Roadshow_Data) }}</span>
              <h1 class="roadshow_title_detail">{{ Get_Roadshow_Title(obj_Roadshow_Data) }}</h1>
              <p class="organized_by">{{ Get_Organization_Name(obj_Roadshow_Data) }}</p>
            </div>
            <img class="header_poster" :src="posterBlob || Str_Get_Image_URL(null)" :alt="Get_Roadshow_Title(obj_Roadshow_Data)" @click="posterBlob && openImage(posterBlob, Get_Roadshow_Title(obj_Roadshow_Data))" @error="Handle_Image_Error" />
          </section>
          <section class="detail_card">
            <h2>{{ text('Roadshow Information', 'ข้อมูลโรดโชว์') }}</h2>
            <div class="detail_grid">
              <div class="detail_item"><span>{{ text('Organization', 'องค์กร') }}</span><strong>{{ Get_Organization_Name(obj_Roadshow_Data) }}</strong></div>
              <div class="detail_item"><span>{{ text('Location', 'สถานที่') }}</span><strong>{{ obj_Roadshow_Data.location || '—' }}</strong></div>
              <div class="detail_item"><span>{{ text('Event date', 'วันที่จัดงาน') }}</span><strong>{{ Format_Date(obj_Roadshow_Data.event_date || obj_Roadshow_Data.posted_date) }}</strong></div>
              <div class="detail_item"><span>{{ text('Time', 'เวลา') }}</span><strong>{{ formatRoadshowTime(obj_Roadshow_Data.time) || '—' }}</strong></div>
              <div class="detail_item"><span>{{ text('Posted date', 'วันที่ประกาศ') }}</span><strong>{{ Format_Date(obj_Roadshow_Data.posted_date) }}</strong></div>
              <div class="detail_item"><span>{{ text('Deleted date', 'วันที่สิ้นสุดการแสดง') }}</span><strong>{{ Format_Date(obj_Roadshow_Data.deleted_date) }}</strong></div>
            </div>
          </section>
          <section class="detail_card">
            <h2>{{ text('Description', 'รายละเอียด') }}</h2>
            <p class="description_text">{{ obj_Roadshow_Data.details || '—' }}</p>
          </section>
          <section v-if="activityImageCount > 0" class="detail_card">
            <h2>{{ text('Activity images', 'รูปภาพกิจกรรม') }}</h2>
            <div class="activity_images_grid">
              <img v-for="imageIndex in activityImageCount" :key="imageIndex" :src="activityBlobs[imageIndex - 1] || Str_Get_Image_URL(null)" :alt="`Activity photo ${imageIndex}`" @click="activityBlobs[imageIndex - 1] && openImage(activityBlobs[imageIndex - 1], `Activity photo ${imageIndex}`)" @error="Handle_Image_Error" />
            </div>
          </section>
        </template>
      </section>
    </main>
    <div v-if="lightboxUrl" class="image_lightbox" @click.self="closeImage">
      <button type="button" class="lightbox_close" aria-label="Close image" @click="closeImage">×</button>
      <img :src="lightboxUrl" :alt="lightboxAlt" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UserNavbar from '../components/UserNavbar.vue'
import AdminTopBar from '../components/admin/AdminTopBar.vue'
import { formatRoadshowTime } from '../utils/roadshowTime'
import { useLanguage } from '../composables/useLanguage'
import { fetchRoadshowPosterBlob, fetchRoadshowActivityBlob, roadshowAPI } from '../services/api'

const obj_UI_State = reactive({ bln_Is_Loading: false, str_Error_Message: null as string | null })
const obj_Roadshow_Data = ref<any>(null)
const posterBlob = ref('')
const activityBlobs = ref<string[]>([])
const lightboxUrl = ref('')
const lightboxAlt = ref('')
const route = useRoute()
const router = useRouter()
const { currentLanguage, text } = useLanguage()
const CONST_DEFAULT_NO_IMAGE_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='493' height='495'%3E%3Crect fill='%23ddd' width='493' height='495'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20'%3ENo Image%3C/text%3E%3C/svg%3E"
const activityImageCount = computed(() => {
  const ids = obj_Roadshow_Data.value?.activity_gridfs_ids
  if (Array.isArray(ids) && ids.length) return ids.length
  const paths = obj_Roadshow_Data.value?.activity_image_paths
  return Array.isArray(paths) ? paths.length : 0
})
const Get_Roadshow_Title = (roadshow: any) => String((currentLanguage.value === 'TH' ? roadshow?.title_th || roadshow?.title_en : roadshow?.title_en || roadshow?.title_th) || roadshow?.topic || '?')
const Get_Organization_Name = (roadshow: any) => {
  const manual = currentLanguage.value === 'TH' ? roadshow?.organization_th || roadshow?.organization_en : roadshow?.organization_en || roadshow?.organization_th
  if (manual) return manual
  const organization = roadshow?.organization_id
  if (organization && typeof organization === 'object') return currentLanguage.value === 'TH' ? organization.organization_name_th || organization.name_th || '?' : organization.organization_name_en || organization.name_en || '?'
  return roadshow?.organization || roadshow?.organization_name || '?'
}
const Str_Get_Image_URL = (_path: string | null) => CONST_DEFAULT_NO_IMAGE_SVG
const Handle_Image_Error = (event: Event) => { const image = event.target as HTMLImageElement; if (image.src !== CONST_DEFAULT_NO_IMAGE_SVG) image.src = CONST_DEFAULT_NO_IMAGE_SVG }
const Get_Status = (roadshow: any) => {
  if (roadshow.deleted_date) {
    const deleted = new Date(roadshow.deleted_date)
    if (!Number.isNaN(deleted.getTime())) {
      const today = new Date(); today.setHours(0, 0, 0, 0)
      if (deleted.getTime() < today.getTime()) return text('Completed', 'เสร็จสิ้น')
    }
  }
  return roadshow.is_public ? text('Active', 'กำลังดำเนินการ') : text('Upcoming', 'กำลังจะมาถึง')
}
const Get_Status_Class = (roadshow: any) => {
  const status = Get_Status(roadshow)
  if (status === text('Completed', 'เสร็จสิ้น')) return 'status_completed'
  if (status === text('Active', 'กำลังดำเนินการ')) return 'status_active'
  return 'status_upcoming'
}
const Format_Date = (value: any) => {
  if (!value) return '?'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
const openImage = (url: string, alt: string) => { lightboxUrl.value = url; lightboxAlt.value = alt }
const closeImage = () => { lightboxUrl.value = ''; lightboxAlt.value = '' }
const revokeUrls = () => {
  if (posterBlob.value.startsWith('blob:')) URL.revokeObjectURL(posterBlob.value)
  activityBlobs.value.forEach(url => { if (url.startsWith('blob:')) URL.revokeObjectURL(url) })
  posterBlob.value = ''; activityBlobs.value = []
}
let requestVersion = 0
const loadRoadshow = async (id: string) => {
  const request = ++requestVersion
  obj_UI_State.bln_Is_Loading = true
  obj_UI_State.str_Error_Message = null
  try {
    const response = await roadshowAPI.getById(id)
    const nextRoadshow = response.data?.data || response.data
    let nextPoster = ''
    try { nextPoster = await fetchRoadshowPosterBlob(id) } catch {}
    const count = nextRoadshow.activity_gridfs_ids?.length || nextRoadshow.activity_image_paths?.length || 0
    const nextActivities = await Promise.all(Array.from({ length: count }, async (_, index) => { try { return await fetchRoadshowActivityBlob(id, index) } catch { return '' } }))
    if (request !== requestVersion) return
    revokeUrls()
    obj_Roadshow_Data.value = nextRoadshow
    posterBlob.value = nextPoster
    activityBlobs.value = nextActivities
  } catch (error: any) {
    obj_UI_State.str_Error_Message = error.response?.data?.message || text('Failed to load roadshow details', '?????????????????????????????????')
  } finally { if (request === requestVersion) obj_UI_State.bln_Is_Loading = false }
}

onMounted(() => loadRoadshow(String(route.params.id || '')))
watch(() => route.params.id, (id, previous) => { if (id && id !== previous) loadRoadshow(String(id)) })
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

/* =========================================================
   Roadshow Detail — Figma 1326 × 737
   Sidebar = 66px | Main content starts at x = 80px
   The 1244px design frame is preserved on PC/Laptop.
   Smaller screens can scroll horizontally instead of breaking
   the Figma layout.
   ========================================================= */
.admin_roadshow_detail {
  position: relative;
  width: 100%;
  min-width: 1100px;
  min-height: 100vh;
  background: #FFFFFF;
  overflow-x: auto;
  overflow-y: auto;
  font-family: 'Inter', sans-serif;
  color: #1F2937;
}

/* Layout shell: sidebar = 66px; Figma content starts at x=80px */
.detail_main {
  position: relative;
  width: calc(100% - 66px);
  min-width: 1244px;
  min-height: 670px;
  margin-left: 66px;
  margin-top: 0;
  padding-left: 14px;
  box-sizing: border-box;
  background: #F3F4F6;
  overflow-x: visible;
}

/* Figma detail frame = 1244px wide. It starts immediately
   below the 67px TopBar supplied by AdminTopBar. */
.detail_content {
  position: relative;
  width: 1244px;
  min-width: 1244px;
  height: 654px;
  margin: 0;
  background: #FFFFFF;
  overflow: visible;
}

/* ---------------------------------------------------------
   Header: x=61, y=0 relative to content
   --------------------------------------------------------- */
.detail_header {
  position: absolute;
  left: 61px;
  top: 0;
  width: 603px;
  height: 88px;
}

.status_pill {
  position: absolute;
  left: 0;
  top: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 18px;
  padding: 3px 8px;
  box-sizing: border-box;
  border-radius: 10px;
  color: #FFFFFF;
  font-size: 10px;
  line-height: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.status_upcoming { width: 66px; background: #0A48A6; }
.status_active { width: 55px; background: #F11408; }
.status_completed { width: 70px; background: #22C55E; }

.roadshow_title_detail {
  position: absolute;
  left: 0;
  top: 24px;
  width: 540px;
  height: 29px;
  margin: 0;
  color: #1F2937;
  font-size: 24px;
  line-height: 29px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.organized_by {
  position: absolute;
  left: 0;
  top: 59px;
  width: 540px;
  height: 17px;
  margin: 0;
  color: #73737A;
  font-size: 14px;
  line-height: 17px;
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail_layout {
  position: absolute;
  inset: 0;
}

/* Figma image: x=60, y=88, 603×531 */
.roadshow_image_detail {
  position: absolute;
  left: 60px;
  top: 88px;
  width: 603px;
  height: 531px;
  overflow: hidden;
  background: #F3F4F6;
}

.roadshow_image_detail img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ---------------------------------------------------------
   Event information: exact Figma positions
   Organization x=751 y=24
   Date x=751 y=78
   Time x=950 y=78
   Location x=1086 y=78
   --------------------------------------------------------- */
.event_info_grid {
  position: absolute;
  left: 751px;
  top: 24px;
  width: 378px;
  height: 83px;
}

.info_item {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: #FFFFFF;
  min-width: 0;
}

.info_item span {
  color: #73737A;
  font-size: 10px;
  line-height: 12px;
  font-weight: 400;
}

.info_item strong {
  color: #1F2937;
  font-size: 12px;
  line-height: 15px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info_item:nth-child(1) { left: 0; top: 54px; width: 141px; }
.info_item:nth-child(2) { left: 199px; top: 54px; width: 78px; }
.info_item:nth-child(3) { left: 0; top: 0; width: 150px; }
.info_item:nth-child(4) { left: 335px; top: 54px; width: 43px; }

/* Figma description: x=831, y=217, width=417 */
.description_section {
  position: absolute;
  left: 831px;
  top: 217px;
  width: 417px;
  min-height: 68px;
  color: #000000;
  font-size: 14px;
  line-height: 17px;
  font-weight: 400;
  overflow-wrap: anywhere;
}
.additional_row {
  display: flex;
  gap: 12px;
  width: 100%;
  min-height: 15px;
  margin-bottom: 7px;
}

.additional_row span {
  width: 90px;
  flex: 0 0 90px;
  color: #73737A;
  font-size: 11px;
  line-height: 13px;
  font-weight: 600;
}

.additional_row strong {
  min-width: 0;
  color: #1F2937;
  font-size: 12px;
  line-height: 15px;
  font-weight: 400;
  overflow-wrap: anywhere;
}

/* Figma Back: x=997, y=590, 96×31 */
.btn_back {
  position: absolute;
  left: 997px;
  top: 590px;
  width: 96px;
  height: 31px;
  box-sizing: border-box;
  padding: 8px 14px;
  border: 1px solid #D9D9DB;
  border-radius: 8px;
  background: #FFFFFF;
  color: #000000;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  line-height: 15px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

/* Figma Edit: keep the button inside the detail frame */
.btn_edit {
  position: absolute;
  left: 1184px;
  top: 590px;
  width: 57px;
  height: 32px;
  padding: 8px 16px;
  box-sizing: border-box;
  border: 0;
  border-radius: 8px;
  background: #8B0000;
  color: #FFFFFF;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  line-height: 16px;
  font-weight: 600;
  cursor: pointer;
}

.btn_back:hover { background: #F3F4F6; }
.btn_edit:hover { background: #600606; }

.activity_images_grid {
  position: absolute;
  left: 60px;
  top: 635px;
  width: 603px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.activity_image_card {
  height: 120px;
  overflow: hidden;
  border-radius: 8px;
  background: #F3F4F6;
}

.activity_image_card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.loading_message {
  padding: 40px;
  color: #73737A;
  font-size: 14px;
  text-align: center;
}

.error_message {
  margin: 20px;
  padding: 16px;
  border: 1px solid #FECACA;
  border-radius: 8px;
  background: #FEE2E2;
  color: #DC2626;
  font-size: 14px;
}

/* =========================================================
   Laptop / PC behavior
   1326px and above: exact Figma coordinates.
   Below 1326px: preserve the design frame and allow horizontal
   scrolling; do not squeeze individual Figma elements.
   ========================================================= */
@media (max-width: 1325px) {
  .admin_roadshow_detail {
    min-width: 1326px;
  }

  .detail_main {
    width: calc(100% - 66px);
    min-width: 1260px;
    margin-left: 66px;
  }
}

@media (min-width: 1326px) {
  .detail_main {
    width: calc(100% - 66px);
  }
}

/* Final fix: Edit button must stay inside the white detail card */
.detail_content > .btn_edit {
  position: absolute;
  left: 1184px;
  top: 590px;
  z-index: 20;
}

/* Responsive layout overrides the legacy fixed Figma frame above. */
.admin_roadshow_detail { min-width: 0; overflow-x: hidden; background: #f3f4f6; }
.detail_main { width: 100%; min-width: 0; margin-left: 0; padding: 24px; background: #f3f4f6; }
.detail_content { width: min(1120px, 100%); min-width: 0; height: auto; margin: 0 auto; padding: 24px; box-sizing: border-box; border-radius: 12px; overflow: visible; }
.detail_toolbar { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 20px; }
.detail_header { position: static; display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; width: auto; height: auto; padding-bottom: 22px; border-bottom: 1px solid #e8e8e8; }
.detail_header > div { min-width: 0; }
.status_pill { position: static; width: auto; height: auto; padding: 5px 10px; font-size: 11px; }
.roadshow_title_detail { position: static; width: auto; height: auto; margin: 14px 0 8px; font-size: clamp(22px, 3vw, 32px); line-height: 1.2; white-space: normal; overflow-wrap: anywhere; }
.organized_by { position: static; width: auto; height: auto; white-space: normal; overflow-wrap: anywhere; }
.header_poster { width: 180px; height: 130px; flex: 0 0 180px; object-fit: contain; border-radius: 8px; background: #f3f4f6; }
.header_poster, .activity_images_grid img { cursor: zoom-in; }
.detail_card { margin-top: 20px; padding: 22px; border: 1px solid #e5e7eb; border-radius: 10px; background: #fff; }
.detail_card h2 { margin: 0 0 16px; font-size: 18px; }
.detail_grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
.detail_item { min-width: 0; }
.detail_item span { display: block; margin-bottom: 5px; color: #73737a; font-size: 12px; }
.detail_item strong { display: block; overflow-wrap: anywhere; font-size: 14px; }
.description_text { margin: 0; white-space: pre-line; overflow-wrap: anywhere; line-height: 1.6; }
.activity_images_grid { position: static; width: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }
.activity_images_grid img { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; border-radius: 8px; background: #f3f4f6; }
.btn_back, .btn_edit { position: static; width: auto; height: auto; }
.btn_back { padding: 10px 16px; }
.btn_edit { padding: 10px 18px; }
@media (max-width: 700px) {
  .detail_main { padding: 12px; }
  .detail_content { padding: 16px; }
  .detail_header { display: block; }
  .header_poster { width: 100%; height: 180px; margin-top: 18px; }
  .detail_grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
}
@media (max-width: 420px) {
  .detail_toolbar { align-items: stretch; flex-direction: column; }
  .detail_toolbar button { width: 100%; }
  .detail_grid { grid-template-columns: 1fr; }
}
.image_lightbox { position: fixed; inset: 0; z-index: 1200; display: grid; place-items: center; padding: 28px; background: rgba(0,0,0,.82); }
.image_lightbox img { max-width: min(1100px, 94vw); max-height: 90vh; object-fit: contain; }
.lightbox_close { position: fixed; top: 18px; right: 24px; width: 42px; height: 42px; border: 0; border-radius: 50%; background: #fff; color: #333; font-size: 28px; line-height: 1; cursor: pointer; }

</style>
