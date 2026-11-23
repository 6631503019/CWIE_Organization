<template>
  <div class="admin_roadshow">
    <UserNavbar />
    <AdminTopBar
    />

    <main class="main_content">
    <!-- Roadshow Header -->
    <section class="roadshow_header_section">
      <div class="roadshow_heading">
        <h1 class="roadshow_page_title">{{ text('Roadshow', 'โรดโชว์') }}</h1>
        <p class="roadshow_page_subtitle">{{ text('Manage and view all roadshow events.', 'จัดการและดูข้อมูลกิจกรรมโรดโชว์ทั้งหมด') }}</p>
      </div>


    </section>

    <!-- Search -->
    <div class="roadshow_search_bar">
      <span class="search_icon" aria-hidden="true"></span>
      <input
        v-model="str_Search_Query"
        type="text"
        :placeholder="text('Search roadshow title or organization...', 'ค้นหาชื่อโรดโชว์หรือองค์กร...')"
        :aria-label="text('Search roadshow title or organization', 'ค้นหาชื่อโรดโชว์หรือองค์กร')"
      />
    </div>

    <!-- Roadshow Table -->
    <section class="roadshow_table_wrapper">
      <div v-if="obj_state.error" class="error_message">{{ obj_state.error }}</div>
      <div v-else-if="obj_state.loading && arr_Roadshows.length === 0" class="loading_message">
        {{ text('Loading roadshows...', 'กำลังโหลดโรดโชว์...') }}
      </div>

      <table v-else class="roadshow_table">
        <thead>
          <tr>
            <th class="col_organization">{{ text('Organization', 'องค์กร') }}</th>
            <th class="col_title">{{ text('Roadshow title', 'ชื่อโรดโชว์') }}</th>
            <th class="col_date">{{ text('Date', 'วันที่') }}</th>
            <th class="col_time">{{ text('Time', 'เวลา') }}</th>
            <th class="col_location">{{ text('Location', 'สถานที่') }}</th>
            <th class="col_status">{{ text('Status', 'สถานะ') }}</th>
            <th class="col_actions">{{ text('Actions', 'การดำเนินการ') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="roadshow in Arr_Get_Paginated_Roadshows" :key="roadshow.id">
            <td class="organization_cell">{{ Get_Roadshow_Organization(roadshow) }}</td>

            <td class="title_cell" :title="Get_Roadshow_Title(roadshow)">
              {{ Get_Roadshow_Title(roadshow) }}
            </td>

            <td class="date_cell">
              {{ Format_Table_Date(roadshow.event_date || roadshow.posted_date) }}
            </td>

            <td class="time_cell">
              {{ formatRoadshowTime(roadshow.time || '') || '—' }}
            </td>

            <td class="location_cell">
              {{ roadshow.location || '—' }}
            </td>

            <td class="status_cell">
              <span
                class="status_pill"
                :class="Get_Date_Status_Class(roadshow)"
              >
                {{ Get_Date_Status(roadshow) }}
              </span>
            </td>

            <td class="actions_cell">
              <div class="table_actions">
                <button type="button" class="table_action view_action" @click.stop="View_Roadshow(roadshow)">{{ text('View', 'ดู') }}</button>
              </div>
            </td>
          </tr>

          <tr v-if="Arr_Get_Paginated_Roadshows.length === 0">
            <td colspan="7" class="empty_table_cell">{{ text('No roadshows found.', 'ไม่พบโรดโชว์') }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Pagination -->
    <div class="roadshow_pagination_container">
      <Pagination
        :current-page="obj_state.currentPage"
        :total-pages="i_Get_Total_Pages"
        :total-items="Arr_Get_Filtered_Roadshows.length"
        :loading="obj_state.loading"
        :show-info="false"
        @page-change="Handle_Page_Change"
      />
    </div>
    </main>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import UserNavbar from '../components/UserNavbar.vue'
import AdminTopBar from '../components/admin/AdminTopBar.vue'
import Pagination from '../components/Pagination.vue'
import { roadshowAPI } from '../services/api'
import { formatRoadshowTime } from '../utils/roadshowTime'
import { useLanguage } from '../composables/useLanguage'

const router = useRouter()
const { currentLanguage, text } = useLanguage()
const obj_state = reactive({ loading: false, error: null as string | null, currentPage: 1, itemsPerPage: 5 })
const arr_Roadshows = ref<any[]>([])
const str_Search_Query = ref('')

const Get_Roadshow_Organization = (roadshow: any) => {
  const manual = currentLanguage.value === 'TH' ? roadshow.organization_th || roadshow.organization_en : roadshow.organization_en || roadshow.organization_th
  if (manual) return manual
  const organization = roadshow.organization_id
  if (organization && typeof organization === 'object') return currentLanguage.value === 'TH' ? organization.organization_name_th || organization.name_th || '?' : organization.organization_name_en || organization.name_en || '?'
  return roadshow.organization || '?'
}
const Get_Roadshow_Title = (roadshow: any) => String((currentLanguage.value === 'TH' ? roadshow.title_th || roadshow.title_en : roadshow.title_en || roadshow.title_th) || roadshow.topic || '?')
const Format_Table_Date = (value: any) => {
  if (!value) return '?'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
const Get_Date_Status = (roadshow: any) => {
  if (roadshow.deleted_date) {
    const deleted = new Date(roadshow.deleted_date)
    if (!Number.isNaN(deleted.getTime()) && deleted < new Date()) return text('Completed', 'เสร็จสิ้น')
  }
  return roadshow.is_public ? text('Active', 'กำลังดำเนินการ') : text('Upcoming', 'กำลังจะมาถึง')
}
const Get_Date_Status_Class = (roadshow: any) => {
  const status = Get_Date_Status(roadshow)
  if (status === text('Completed', 'เสร็จสิ้น')) return 'status_completed'
  if (status === text('Active', 'กำลังดำเนินการ')) return 'status_active'
  return 'status_upcoming'
}
const Arr_Get_Filtered_Roadshows = computed(() => {
  const query = str_Search_Query.value.trim().toLowerCase()
  if (!query) return arr_Roadshows.value
  return arr_Roadshows.value.filter(roadshow => String(Get_Roadshow_Title(roadshow)).toLowerCase().includes(query) || String(Get_Roadshow_Organization(roadshow)).toLowerCase().includes(query) || String(roadshow.location || '').toLowerCase().includes(query))
})
const i_Get_Total_Pages = computed(() => Math.max(1, Math.ceil(Arr_Get_Filtered_Roadshows.value.length / obj_state.itemsPerPage)))
const Arr_Get_Paginated_Roadshows = computed(() => {
  const start = (obj_state.currentPage - 1) * obj_state.itemsPerPage
  return Arr_Get_Filtered_Roadshows.value.slice(start, start + obj_state.itemsPerPage)
})
watch(str_Search_Query, () => { obj_state.currentPage = 1 })
const Handle_Page_Change = (page: number) => { if (page >= 1 && page <= i_Get_Total_Pages.value) obj_state.currentPage = page }
const View_Roadshow = (roadshow: any) => router.push(`/user/roadshow/${roadshow.id}`)
const isPublic = (value: any) => value === true || value === 'true' || value === 1 || value === '1'
const loadRoadshows = async () => {
  obj_state.loading = true
  obj_state.error = null
  try {
    const response = await roadshowAPI.getAll({ limit: 100 })
    arr_Roadshows.value = (response.data?.data || []).filter((roadshow: any) => isPublic(roadshow.is_public)).map((roadshow: any) => ({ ...roadshow, id: roadshow._id }))
  } catch (error: any) {
    obj_state.error = error.response?.data?.message || text('Unable to load roadshows.', '???????????????????????')
  } finally { obj_state.loading = false }
}
onMounted(loadRoadshows)
</script>

<style scoped>
/* =========================================================
   Admin Roadshow - Figma 1326 × 737 / Responsive Laptop + PC
   UI-only styles. API / CRUD / modal logic is unchanged.
   ========================================================= */

.admin_roadshow {
  --sidebar-width: 66px;
  --main-max-width: 1244px;
  --table-width: 1090px;
  --search-width: 1053px;
  width: 100%;
  min-height: 100dvh;
  background: #F3F4F6;
  overflow-x: hidden;
  font-family: 'Inter', sans-serif;
}

/* Main area starts after the existing AdminNavbar/sidebar. */
.admin_roadshow > .main_content {
  width: min(var(--main-max-width), calc(100% - var(--sidebar-width)));
  min-height: calc(100dvh - 67px);
  margin-left: var(--sidebar-width);
  margin-right: 0;
  padding: 0 0 32px;
  box-sizing: border-box;
  background: #F3F4F6;
  overflow-x: hidden;
  overflow-y: visible;
}

/* Figma Content starts immediately below the 67px AdminTopBar. */
.roadshow_header_section {
  position: relative;
  width: 100%;
  height: 67px;
  margin: 0;
  background: #F3F4F6;
}

.roadshow_heading {
  position: absolute;
  left: 59px;
  top: 0;
  width: 349px;
}

.roadshow_page_title {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 24px;
  line-height: 29px;
  font-weight: 700;
  color: #1F2937;
}

.roadshow_page_subtitle {
  margin: 2px 0 0;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  line-height: 16px;
  font-weight: 400;
  color: #73737A;
}

.btn_add_roadshow {
  position: absolute;
  top: 14px;
  right: 20px;
  width: 131px;
  height: 36px;
  padding: 10px 16px;
  box-sizing: border-box;
  border: 0;
  border-radius: 8px;
  background: #8B0000;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
}

.btn_add_roadshow:hover { background: #760000; }

.btn_add_roadshow .plus_icon {
  width: auto;
  height: auto;
  position: static;
  background: transparent;
  font-size: 16px;
  line-height: 16px;
  color: #FFFFFF;
}

.btn_add_roadshow .button_text {
  width: auto;
  height: 16px;
  font-size: 13px;
  line-height: 16px;
  font-weight: 600;
  color: #FFFFFF;
  white-space: nowrap;
}

/* Figma search: 1053 × 40. At smaller widths it shrinks safely. */
.roadshow_search_bar {
  width: min(var(--search-width), calc(100% - 102px));
  height: 40px;
  margin: 45px auto 23px;
  padding: 0 16px;
  box-sizing: border-box;
  border: 0.4px solid #A8A8AC;
  border-radius: 8px;
  background: #FFFFFF;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
}

.roadshow_search_bar input {
  width: 100%;
  min-width: 0;
  height: 100%;
  padding: 0;
  border: 0;
  outline: none;
  background: transparent;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  line-height: 16px;
  color: #1F2937;
}

.roadshow_search_bar input::placeholder { color: #73737A; }

.search_icon {
  width: 14px;
  height: 14px;
  flex: 0 0 14px;
  border: 1.5px solid #73737A;
  border-radius: 50%;
  position: relative;
  box-sizing: border-box;
}

.search_icon::after {
  content: '';
  position: absolute;
  width: 6px;
  height: 1.5px;
  background: #73737A;
  right: -4px;
  bottom: -2px;
  transform: rotate(45deg);
  transform-origin: left center;
}

/* Figma table: 1090 × 277. Eight columns + date-driven status. Scroll belongs to the table wrapper only. */
.roadshow_table_wrapper {
  width: min(var(--table-width), calc(100% - 102px));
  height: auto;
  min-height: 0;
  margin: 0 auto;
  background: #FFFFFF;
  border: 1px solid #D1D1D2;
  border-radius: 12px;
  box-sizing: border-box;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
}

.roadshow_table {
  width: var(--table-width);
  min-width: var(--table-width);
  height: auto;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
  background: #FFFFFF;
  font-family: 'Inter', sans-serif;
}

.roadshow_table thead tr {
  height: 37px;
  background: #8B0000;
}

.roadshow_table th {
  height: 37px;
  padding: 0 10px;
  box-sizing: border-box;
  text-align: left;
  color: #FFFFFF;
  font-size: 11px;
  line-height: 13px;
  font-weight: 600;
  white-space: nowrap;
  border-right: 1px solid rgba(255, 255, 255, 0.45);
}

.roadshow_table th:last-child { border-right: 0; }

.roadshow_table tbody tr {
  height: 48px;
  background: #FFFFFF;
}

.roadshow_table td {
  height: 48px;
  padding: 0 10px;
  box-sizing: border-box;
  color: #1F2937;
  font-size: 12px;
  line-height: 15px;
  font-weight: 400;
  vertical-align: middle;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-top: 1px solid #BCBCBE;
  border-right: 1px solid #D1D1D2;
}

.roadshow_table td:last-child { border-right: 0; }

/* Figma column separators */
.roadshow_table th:nth-child(1),
.roadshow_table th:nth-child(2),
.roadshow_table th:nth-child(3),
.roadshow_table th:nth-child(4),
.roadshow_table th:nth-child(5),
.roadshow_table th:nth-child(6),
.roadshow_table td:nth-child(1),
.roadshow_table td:nth-child(2),
.roadshow_table td:nth-child(3),
.roadshow_table td:nth-child(4),
.roadshow_table td:nth-child(5),
.roadshow_table td:nth-child(6) {
  border-right: 1px solid #BCBCBE;
}

/* Figma table columns:
   Organization | Roadshow title | Date | Time | Location | Status | Actions */
.col_organization { width: 209px; padding-left: 20px !important; }
.col_title { width: 311px; }
.col_date { width: 110px; }
.col_time { width: 110px; }
.col_location { width: 100px; }
.col_status { width: 111px; }
.col_actions { width: 139px; }

.organization_cell {
  padding-left: 20px !important;
  font-weight: 600 !important;
}

.title_cell {
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-left: 9px !important;
}

.date_cell,
.time_cell,
.location_cell {
  white-space: nowrap;
}

.status_cell {
  overflow: visible !important;
  text-overflow: clip !important;
  white-space: nowrap !important;
}

.status_pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 47px;
  height: 18px;
  box-sizing: border-box;
  padding: 3px 8px;
  border-radius: 10px;
  font-family: 'Inter', sans-serif;
  font-size: 10px;
  line-height: 12px;
  font-weight: 600;
  color: #FFFFFF;
}

.status_pill.status_upcoming {
  min-width: 66px;
  background: #0A48A6;
}

.status_pill.status_active {
  min-width: 47px;
  background: #F11408;
}

.status_pill.status_completed {
  min-width: 70px;
  background: #22C55E;
}

.actions_cell {
  overflow: visible !important;
  text-overflow: clip !important;
  white-space: nowrap !important;
  padding-left: 10px !important;
  padding-right: 8px !important;
}

.actions_cell .table_actions {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  width: max-content;
  min-width: 100%;
}

.table_action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  padding: 0;
  margin: 0;
  border: 0;
  background: transparent;
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  line-height: 13px;
  font-weight: 400;
  color: #73737A;
  cursor: pointer;
  white-space: nowrap;
}

.table_action:hover { text-decoration: underline; }
.delete_action:hover { color: #DC2626; }

.empty_table_cell {
  height: 48px;
  text-align: center !important;
  color: #73737A !important;
}

/* Align pagination to the table's right edge. */
.roadshow_pagination_container {
  width: 218px;
  min-height: 28px;
  margin: 18px max(51px, calc((100% - var(--table-width)) / 2)) 0 auto;
}

.error_message,
.loading_message {
  min-height: 275px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  color: #73737A;
  font-size: 13px;
  text-align: center;
}

/* =========================================================
   Laptop: preserve Figma proportions while shrinking safely.
   ========================================================= */
@media (max-width: 1200px) {
  .admin_roadshow > .main_content {
    width: calc(100% - var(--sidebar-width));
  }

  .roadshow_heading {
    left: 32px;
  }

  .btn_add_roadshow {
    right: 20px;
  }

  .roadshow_search_bar,
  .roadshow_table_wrapper {
    width: calc(100% - 64px);
  }

  .roadshow_pagination_container {
    margin-right: 32px;
  }
}

@media (max-width: 900px) {
  .roadshow_header_section {
    height: auto;
    min-height: 112px;
    padding: 20px 24px 14px;
    box-sizing: border-box;
  }

  .roadshow_heading {
    position: static;
    width: calc(100% - 155px);
  }

  .btn_add_roadshow {
    top: 20px;
    right: 24px;
  }

  .roadshow_search_bar {
    width: calc(100% - 48px);
    margin: 20px 24px 23px;
  }

  .roadshow_table_wrapper {
    width: calc(100% - 48px);
    margin-inline: 24px;
  }

  .roadshow_pagination_container {
    margin-right: 24px;
  }
}

@media (max-width: 700px) {
  .admin_roadshow > .main_content {
    width: calc(100% - var(--sidebar-width));
  }

  .roadshow_header_section {
    min-height: 146px;
    padding: 18px 16px 14px;
  }

  .roadshow_heading {
    width: 100%;
  }

  .roadshow_page_title {
    font-size: 22px;
    line-height: 27px;
  }

  .roadshow_page_subtitle {
    font-size: 12px;
    line-height: 15px;
  }

  .btn_add_roadshow {
    position: static;
    margin-top: 14px;
  }

  .roadshow_search_bar {
    width: calc(100% - 32px);
    margin: 16px 16px 20px;
  }

  .roadshow_table_wrapper {
    width: calc(100% - 24px);
    margin-inline: 12px;
  }

  .roadshow_pagination_container {
    width: 218px;
    max-width: calc(100% - 24px);
    margin-right: 12px;
  }
}

/* =========================================================
   Add / Edit Roadshow Modal
   Fixes the form layout shown in the screenshot:
   - clear label/input alignment
   - 2-column desktop form
   - full-width details and upload sections
   - consistent input sizing
   - responsive mobile layout
   ========================================================= */

.modal_overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  background: rgba(15, 23, 42, 0.48);
  backdrop-filter: blur(2px);
  overflow-y: auto;
}

.add_roadshow_modal,
.delete_confirmation_modal {
  position: relative;
  width: min(900px, calc(100vw - 48px));
  max-width: 900px;
  max-height: calc(100dvh - 48px);
  padding: 28px 32px 30px;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  background: #FFFFFF;
  color: #1F2937;
  box-shadow: 0 20px 55px rgba(0, 0, 0, 0.22);
  overflow-y: auto;
  box-sizing: border-box;
}

/* Modal heading */
.modal_title {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 24px;
  line-height: 30px;
  font-weight: 700;
  color: #1F2937;
}

.form_divider {
  width: 100%;
  height: 1px;
  margin: 18px 0 22px;
  background: #E5E7EB;
}

/* Main form grid */
.add_roadshow_modal {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 24px;
  row-gap: 18px;
  align-content: start;
}

/* Heading/divider/action rows span the modal */
.add_roadshow_modal > .modal_title,
.add_roadshow_modal > .form_divider,
.add_roadshow_modal > .modal_actions {
  grid-column: 1 / -1;
}

.form_group {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.form_group.full_width {
  grid-column: 1 / -1;
}

.form_group label,
.upload_section > label,
.public_toggle > label {
  display: block;
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  line-height: 18px;
  font-weight: 600;
  color: #374151;
}

.form_group input[type="text"],
.form_group input[type="time"],
.form_group input[type="date"],
.form_group textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  background: #FFFFFF;
  color: #1F2937;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  line-height: 18px;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.form_group input[type="text"],
.form_group input[type="time"],
.form_group input[type="date"] {
  height: 40px;
  padding: 0 12px;
}

.form_group textarea {
  min-height: 112px;
  padding: 11px 12px;
  resize: vertical;
}

.form_group input::placeholder,
.form_group textarea::placeholder {
  color: #9CA3AF;
}

.form_group input:focus,
.form_group textarea:focus {
  border-color: #8B0000;
  box-shadow: 0 0 0 3px rgba(139, 0, 0, 0.08);
}

.form_hint {
  margin-top: -2px;
  color: #6B7280;
  font-size: 11px;
  line-height: 15px;
}

/* Date controls */
.date_input_wrapper {
  position: relative;
  width: 100%;
}

.date_input_wrapper input {
  padding-right: 42px !important;
}

.calendar_icon {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  pointer-events: none;
  font-size: 15px;
}

/* Upload sections */
.upload_section {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: 9px;
  min-width: 0;
  padding-top: 2px;
}

.upload_btn {
  min-height: 42px;
  width: 100%;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 9px 14px;
  border: 1px dashed #B8B8BD;
  border-radius: 8px;
  background: #FAFAFA;
  color: #4B5563;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.upload_btn:hover {
  border-color: #8B0000;
  background: #FFF9F9;
}

.upload_icon {
  font-size: 15px;
}

.image_preview {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  background: #F9FAFB;
}

.image_preview img {
  width: 72px;
  height: 56px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #E5E7EB;
}

.remove_preview_btn,
.remove_btn,
.delete_image_btn,
.undo_all_btn {
  border: 0;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
}

.remove_preview_btn,
.remove_btn {
  padding: 6px 10px;
  border-radius: 6px;
  background: #F3F4F6;
  color: #6B7280;
  font-size: 11px;
}

.remove_preview_btn:hover,
.remove_btn:hover {
  background: #FEE2E2;
  color: #B91C1C;
}

.file_list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.file_item,
.file_selected {
  min-height: 34px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 9px;
  box-sizing: border-box;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  background: #FAFAFA;
}

.file_name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #4B5563;
  font-size: 11px;
}

.existing_images_section {
  padding: 10px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  background: #FAFAFA;
}

.existing_label {
  margin: 0 0 9px;
  color: #6B7280;
  font-size: 11px;
}

.existing_images_grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 9px;
}

.existing_image_card {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 7px;
  border: 1px solid #E5E7EB;
  background: #FFFFFF;
}

.existing_image_card img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.delete_image_btn {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  font-size: 12px;
}

.deletion_summary {
  margin-top: 9px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 6px;
  background: #FFF7ED;
}

.deletion_summary p {
  margin: 0;
  color: #9A3412;
  font-size: 11px;
}

.undo_all_btn {
  padding: 5px 8px;
  border-radius: 5px;
  background: #FFFFFF;
  color: #9A3412;
  font-size: 10px;
}

/* Public toggle */
.public_toggle {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 42px;
  padding: 10px 0;
  border-top: 1px solid #E5E7EB;
}

.toggle_switch {
  position: relative;
  width: 42px;
  height: 24px;
  flex: 0 0 auto;
  border-radius: 999px;
  background: #D1D5DB;
  cursor: pointer;
  transition: background 0.2s ease;
}

.toggle_switch.active {
  background: #8B0000;
}

.toggle_slider {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #FFFFFF;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}

.toggle_switch.active .toggle_slider {
  transform: translateX(18px);
}

/* Modal buttons */
.modal_actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
  padding-top: 18px;
  border-top: 1px solid #E5E7EB;
}

.btn_cancel,
.btn_save,
.btn_delete {
  min-width: 88px;
  height: 38px;
  padding: 0 18px;
  border-radius: 7px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.btn_cancel {
  border: 1px solid #D1D5DB;
  background: #FFFFFF;
  color: #4B5563;
}

.btn_cancel:hover {
  background: #F9FAFB;
}

.btn_save {
  border: 1px solid #8B0000;
  background: #8B0000;
  color: #FFFFFF;
}

.btn_save:hover {
  background: #760000;
}

.btn_delete {
  border: 1px solid #DC2626;
  background: #DC2626;
  color: #FFFFFF;
}

.btn_delete:hover {
  background: #B91C1C;
}

.delete_confirmation_modal .modal_actions {
  margin-top: 20px;
}

/* Responsive modal */
@media (max-width: 760px) {
  .modal_overlay {
    padding: 12px;
    align-items: flex-start;
  }

  .add_roadshow_modal,
  .delete_confirmation_modal {
    width: 100%;
    max-width: 100%;
    max-height: calc(100dvh - 24px);
    padding: 22px 20px 24px;
    border-radius: 12px;
  }

  .add_roadshow_modal {
    grid-template-columns: 1fr;
    column-gap: 0;
    row-gap: 16px;
  }

  .form_group,
  .form_group.full_width,
  .upload_section,
  .public_toggle,
  .add_roadshow_modal > .modal_title,
  .add_roadshow_modal > .form_divider,
  .add_roadshow_modal > .modal_actions {
    grid-column: 1;
  }

  .modal_title {
    font-size: 21px;
    line-height: 27px;
  }

  .modal_actions {
    justify-content: stretch;
  }

  .btn_cancel,
  .btn_save,
  .btn_delete {
    flex: 1;
  }
}

/* =========================================================
   Table height follows the number of rows.
   Header = 37px, each data row = 48px.
   No artificial empty space below the last row.
   ========================================================= */
.roadshow_table_wrapper {
  height: auto;
  min-height: 0;
  box-sizing: border-box;
  overflow-x: auto;
  overflow-y: hidden;
}

.roadshow_table {
  height: auto !important;
  min-height: 0 !important;
  table-layout: fixed;
}

.roadshow_table tbody {
  height: auto !important;
}

.roadshow_table tbody tr {
  height: 48px !important;
}

.roadshow_table tbody td {
  height: 48px !important;
  min-height: 48px;
  vertical-align: middle;
}

</style>
