  <template>
    <div class="admin_mou">
      <UserNavbar />
      <AdminTopBar
      />
      
      <!-- Main Content Area -->
      <div class="main_content">
        <!-- Page Title -->
        <div class="mou_page_actions"></div>
        
        <!-- Search and Filter Section -->
        <div class="search_filter_section">
          <div class="search_controls">
            <!-- Text Search -->
            <div class="search_input_wrapper">
              <input 
                type="text" 
                class="search_input" 
                :placeholder="text('Search organization...', 'ค้นหาองค์กร...')"
                v-model="str_Search_Text"
              />
            </div>
            
            <!-- Status Filter -->
            <div class="status_filter">
              <div class="status_dropdown" @click="Toggle_Status_Dropdown">
                <span class="status_label">{{ str_Selected_Status === 'All' ? text('All', 'ทั้งหมด') : (str_Selected_Status || text('Status', 'สถานะ')) }}</span>
                <div class="dropdown_arrow"></div>
              </div>
              <div v-if="bln_Show_Status_Dropdown" class="status_options">
                <div class="dropdown_search">
                  <input 
                    type="text" 
                    v-model="str_Status_Dropdown_Search" 
                    :placeholder="text('Search...', 'ค้นหา...')"
                    @click.stop
                    class="dropdown_search_input"
                  />
                </div>
                <div class="status_option" v-for="status in Arr_Get_Filtered_Status_Options" :key="status" @click="Select_Status(status)">{{ status }}</div>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="action_buttons">
              <button class="reset_btn" @click="Reset_Filters">{{ text('Reset', 'รีเซ็ต') }}</button>
              <button class="search_btn" @click="Apply_Filters">{{ text('Search', 'ค้นหา') }}</button>
            </div>
          </div>
        </div>
        
        <!-- MOU Table -->
<div class="mou_table_container">
  <table class="mou_table">
    <thead>
      <tr>
        <th class="mou_table_org_col">{{ text('Organization', 'องค์กร') }}</th>
        <th class="mou_table_document_col">{{ text('Document Name', 'ชื่อเอกสาร') }}</th>
        <th class="mou_table_uploaded_col">{{ text('Uploaded', 'อัปโหลดเมื่อ') }}</th>
        <th class="mou_table_status_col">{{ text('Status', 'สถานะ') }}</th>
        <th class="mou_table_action_col">{{ text('Actions', 'การดำเนินการ') }}</th>
      </tr>
    </thead>

    <tbody>
      <tr
        v-for="mou in Arr_Get_Paginated_MOUs"
        :key="mou.id"
        class="mou_table_row"
      >
        <!-- Organization -->
        <td class="mou_table_org">
          <span>{{ getLocalizedOrganizationName(mou) }}</span>
        </td>

        <!-- Document Name -->
        <td class="mou_table_document">
  <a
    v-if="mou.documentUrl"
    :href="mou.documentUrl"
    target="_blank"
    rel="noopener noreferrer"
    class="mou_document_link"
    @click.stop
  >
    {{ mou.documentName }}
  </a>

  <span v-else>
    {{ mou.documentName }}
  </span>
</td>
        <!-- Uploaded -->
        <td class="mou_table_uploaded">
          <span>{{ mou.uploaded }}</span>
        </td>

        <!-- Status -->
        <td class="mou_table_status">
          <span
            class="mou_status_badge"
            :class="{
              active: mou.status === 'Active',
              inactive: mou.status === 'Inactive'
            }"
          >
            {{ mou.status }}
          </span>
        </td>

        <!-- Actions -->
        <td class="mou_table_action">
          <div class="mou_actions">

            <!-- View -->
            <button
              type="button"
              class="mou_action_btn view_btn"
              @click.stop="View_MOU_Details(mou)"
              title="View MOU"
            >
              View
            </button>

          </div>
        </td>
      </tr>

      <tr v-if="Arr_Get_Paginated_MOUs.length === 0">
        <td
          colspan="5"
          class="mou_table_empty"
        >
          No MOU found
        </td>
      </tr>
    </tbody>
  </table>
</div>
        
        <!-- Pagination Component -->
        <div class="mou_pagination_container">
          <Pagination 
            :current-page="obj_state.currentPage"
            :total-pages="i_Get_Total_Pages"
            :total-items="Arr_Get_Filtered_MOUs.length"
            :loading="obj_state.loading"
            :show-info="false"
            @page-change="Handle_Page_Change"
          />
        </div>
      </div>

    </div>
  </template>

  <script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import UserNavbar from '../components/UserNavbar.vue'
import AdminTopBar from '../components/admin/AdminTopBar.vue'
import Pagination from '../components/Pagination.vue'
import { organizationAPI, mouAPI, getMouFileUrl, getOrganizationLogoUrl } from '../services/api'
import { useLanguage } from '../composables/useLanguage'

const router = useRouter()
const { currentLanguage, text } = useLanguage()
const obj_state = reactive({ loading: false, error: null as string | null, currentPage: 1, itemsPerPage: 8 })
const str_Search_Text = ref('')
const str_Selected_Status = ref('All')
const bln_Show_Status_Dropdown = ref(false)
const str_Status_Dropdown_Search = ref('')
const arr_MOUs = ref<any[]>([])
const CONST_STATUS_OPTIONS = ['All', 'Active', 'Inactive']
const getLocalizedValue = (english: unknown, thai: unknown) => String((currentLanguage.value === 'TH' ? thai : english) || (currentLanguage.value === 'TH' ? english : thai) || 'N/A')
const getLocalizedOrganizationName = (mou: any) => getLocalizedValue(mou.name_en, mou.name_th)
const Arr_Get_Filtered_Status_Options = computed(() => CONST_STATUS_OPTIONS.filter(option => !str_Status_Dropdown_Search.value || option.toLowerCase().includes(str_Status_Dropdown_Search.value.toLowerCase())))
const Arr_Get_Filtered_MOUs = computed(() => arr_MOUs.value.filter(mou => {
  const query = str_Search_Text.value.trim().toLowerCase()
  const matchesSearch = !query || getLocalizedOrganizationName(mou).toLowerCase().includes(query) || String(mou.status).toLowerCase().includes(query)
  const matchesStatus = !str_Selected_Status.value || str_Selected_Status.value === 'All' || mou.status === str_Selected_Status.value
  return matchesSearch && matchesStatus
}))
const i_Get_Total_Pages = computed(() => Math.max(1, Math.ceil(Arr_Get_Filtered_MOUs.value.length / obj_state.itemsPerPage)))
const Arr_Get_Paginated_MOUs = computed(() => {
  const start = (obj_state.currentPage - 1) * obj_state.itemsPerPage
  return Arr_Get_Filtered_MOUs.value.slice(start, start + obj_state.itemsPerPage)
})
watch([str_Search_Text, str_Selected_Status], () => { obj_state.currentPage = 1 })
const Toggle_Status_Dropdown = () => { bln_Show_Status_Dropdown.value = !bln_Show_Status_Dropdown.value }
const Select_Status = (status: string) => { str_Selected_Status.value = status; bln_Show_Status_Dropdown.value = false }
const Reset_Filters = () => { str_Search_Text.value = ''; str_Selected_Status.value = 'All'; str_Status_Dropdown_Search.value = ''; obj_state.currentPage = 1 }
const Apply_Filters = () => { obj_state.currentPage = 1 }
const Handle_Page_Change = (page: number) => { if (page >= 1 && page <= i_Get_Total_Pages.value) obj_state.currentPage = page }
const View_MOU_Details = (mou: any) => {
  if (mou.organizationId) {
    router.push(`/user/organization/${mou.organizationId}`)
  }
}

const isPublished = (value: any) => value === true || value === 'true' || value === 1 || value === '1'
const loadPublishedMOUs = async () => {
  obj_state.loading = true
  obj_state.error = null
  try {
    const [organizationResponse, mouResponse] = await Promise.all([organizationAPI.getAll({ limit: 100 }), mouAPI.getAll({ limit: 100 })])
    const organizations = organizationResponse.data?.data || []
    const organizationMap = new Map(organizations.map((organization: any) => [String(organization._id), organization]))
    const records = mouResponse.data?.data || mouResponse.data || []
    arr_MOUs.value = records.filter((record: any) => isPublished(record.is_published)).map((record: any) => {
      const reference = record.organization_id
      const organizationId = typeof reference === 'object' ? reference?._id : reference
      const organization = typeof reference === 'object' ? reference : organizationMap.get(String(organizationId)) || {}
      const path = record.mou_file_path || record.mou_path || ''
      return {
        id: record._id,
        organizationId: organizationId ? String(organizationId) : '',
        name_en: organization.name_en || organization.organization_name_en || '',
        name_th: organization.name_th || organization.organization_name_th || '',
        documentName: String(path).replace(/\\/g, '/').split('/').pop() || 'MOU Document',
        documentUrl: record._id ? getMouFileUrl(record._id) : '',
        uploaded: record.createdAt ? new Date(record.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
        status: isPublished(record.is_published) ? 'Active' : 'Inactive',
        logo: getOrganizationLogoUrl(organization)
      }
    })
  } catch (error: any) {
    obj_state.error = error.response?.data?.message || text('Unable to load MOUs.', '????????????? MOU ???')
  } finally {
    obj_state.loading = false
  }
}

onMounted(loadPublishedMOUs)
let interval: number | null = null
onMounted(() => { interval = window.setInterval(loadPublishedMOUs, 30000) })
onBeforeUnmount(() => { if (interval) window.clearInterval(interval) })
</script>

  <style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');

  .admin_mou {
    position: relative;
    width: 100%;
    min-width: 0;
    min-height: 100dvh;
    height: 100dvh;
    background: #F6F7F8;
    box-sizing: border-box;
  }

  .main_content {
  width: calc(100% - var(--admin-navbar-width, 66px));

  min-width: 0;

  min-height: calc(100dvh - 50px);

  height: auto;

  margin-left: var(--admin-navbar-width, 66px);

  padding: 24px clamp(16px, 3vw, 50px);

  box-sizing: border-box;

  overflow-y: auto;

  display: flex;

  flex-direction: column;

  gap: 20px;

  transition:
    width 0.2s ease,
    margin-left 0.2s ease;
}

  .page_title {
    margin: 0 0 20px 0;
    
    font-family: 'Outfit', sans-serif;
    font-style: normal;
    font-weight: 600;
    font-size: 40px;
    line-height: 50px;
    color: #000000;
  }

  .search_filter_section {
    width: 100%;
    max-width: 1135px;
    background: #FFFFFF;
    box-shadow: 0px 4px 4px rgba(118, 118, 118, 0.5);
    border-radius: 8px;
    margin-bottom: 20px;
  }

  .search_controls {
    display: flex;
    align-items: center;
    gap: 53px;
    padding: 24px 35px;
  }

  .search_input_wrapper {
    flex: 1;
    max-width: 510px;
  }

  .search_input {
    box-sizing: border-box;
    width: 100%;
    height: 34px;
    
    background: #FFFFFF;
    border: 1px solid #B1B1B1;
    border-radius: 8px;
    padding: 8px 11px;
    
    font-family: 'Inter', sans-serif;
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 17px;
    color: #000000;
  }

  .search_input::placeholder {
    color: #B1B1B1;
  }

  .status_filter {
    position: relative;
    width: 276px;
  }

  .status_dropdown {
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 6px 8px;
    gap: 174px;
    
    width: 276px;
    height: 34px;
    
    background: #FFFFFF;
    border: 1px solid #B1B1B1;
    border-radius: 8px;
    cursor: pointer;
  }

  .status_label {
    font-family: 'Inter', sans-serif;
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 17px;
    color: #545454;
  }

  .dropdown_arrow {
    width: 5.83px;
    height: 4.38px;
    background: #000000;
    clip-path: polygon(0 0, 100% 0, 50% 100%);
  }

  .status_options {
    position: absolute;
    top: 38px;
    left: 0;
    width: 276px;
    max-height: 250px;
    overflow-y: auto;
    background: #FFFFFF;
    border: 1px solid #B1B1B1;
    border-radius: 8px;
    z-index: 10;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  }

  .dropdown_search {
    position: sticky;
    top: 0;
    background: #FFFFFF;
    padding: 8px;
    border-bottom: 1px solid #E0E0E0;
    z-index: 11;
  }

  .dropdown_search_input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #D0D0D0;
    border-radius: 4px;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    color: #333333;
  }

  .dropdown_search_input:focus {
    outline: none;
    border-color: #AB1C03;
  }

  .dropdown_search_input::placeholder {
    color: #999999;
  }

  .status_option {
    padding: 10px;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 14px;
    color: #000000;
    cursor: pointer;
  }

  .status_option:hover {
    background: #F0F0F0;
  }

  .action_buttons {
    display: flex;
    gap: 20px;
  }

  .reset_btn {
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 8px 29px;
    gap: 10px;
    
    width: 78.21px;
    height: 24px;
    
    background: #FFFFFF;
    border: 1px solid #B1B1B1;
    border-radius: 20px;
    cursor: pointer;
    
    font-family: 'Inter', sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 17px;
    color: #000000;
  }

  .search_btn {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 7px 15px;
    gap: 10px;
    
    width: 78.21px;
    height: 24px;
    
    background: #AB1C03;
    border-radius: 20px;
    border: none;
    cursor: pointer;
    
    font-family: 'Inter', sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 17px;
    color: #FFFFFF;
  }

  .mou_table_container {
  width: min(1090px, 100%);
  height: 277px;
  margin-left: 0;
  overflow-x: auto;
  overflow-y: hidden;
  background: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.12);
}

.mou_table {
  width: 1090px;
  min-width: 1090px;
  height: auto;
  table-layout: fixed;
  border-collapse: collapse;
  background: #FFFFFF;
}

/* Header */

.mou_table thead {
  height: 48px;
  background: #F3F4F6;
}

.mou_table th {
  padding: 0 14px;
  border-bottom: 1px solid #D9D9D9;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  line-height: 16px;
  color: #333333;
  text-align: left;
}

/* Column widths */

.mou_table_logo_col {
  width: 80px;
}

.mou_table_org_col {
  width: 300px;
}

.mou_table_status_col {
  width: 150px;
}

.mou_table_duration_col {
  width: 270px;
}

.mou_table_details_col {
  width: 190px;
}

.mou_table_action_col {
  width: 100px;
}

/* Rows */

.mou_table_row {
  height: 76px;
  border-bottom: 1px solid #E5E5E5;
  cursor: pointer;
  transition: background 0.15s ease;
}

.mou_table_row:hover {
  background: #FAFAFA;
}

.mou_table td {
  padding: 8px 14px;
  border-bottom: 1px solid #E5E5E5;
  vertical-align: middle;
}

/* Logo */

.mou_table_logo {
  text-align: center;
}

.mou_table_logo img {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  background: #E0E0E0;
}

/* Organization */

.mou_table_org {
  overflow: hidden;
}

.mou_table_org span {
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: #000000;
}

/* Status */

.mou_table_status {
  text-align: left;
}

.mou_status_badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 72px;
  height: 25px;
  padding: 0 12px;
  box-sizing: border-box;
  border-radius: 20px;

  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 500;
}

.mou_status_badge.active {
  background: #E8F8ED;
  color: #16803A;
}

.mou_status_badge.inactive {
  background: #FDECEC;
  color: #D00000;
}

/* Duration */

.mou_table_duration {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: #666666;
}

/* Details */

.mou_table_details {
  text-align: left;
}

.mou_details_btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;

  padding: 0;
  border: none;
  background: transparent;

  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #000000;

  cursor: pointer;
}

.mou_document_link {
  color: #2563eb;
  text-decoration: none;
  cursor: pointer;
  font-weight: 500;
}

.mou_document_link:hover {
  text-decoration: underline;
}

.mou_details_btn:hover {
  text-decoration: underline;
}

.mou_details_arrow {
  font-size: 20px;
  line-height: 14px;
}

/* Edit */

.mou_table_action {
  text-align: center;
}

.mou_edit_btn {
  width: 30px;
  height: 30px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: 0;
  border: none;
  background: transparent;
  border-radius: 5px;

  cursor: pointer;
}

.mou_edit_btn:hover {
  background: #F0F0F0;
}

.mou_edit_btn .pencil_icon {
  width: 18px;
  height: 18px;
  background: #666;

  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39 0-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z'/%3E%3C/svg%3E")
    no-repeat center;
  mask-size: contain;
}

/* Empty */

.mou_table_empty {
  height: 180px;
  text-align: center;
  vertical-align: middle !important;

  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #777777;
}

  /* MOU Pagination Container */
  .mou_pagination_container {
    display: flex;
    justify-content: center;
    margin-top: 40px;
    margin-bottom: 50px;
  }

  .admin_mou { width: 100%; min-width: 0; min-height: 100dvh; height: 100dvh; background: #F6F7F8; }
  .admin_mou > .main_content { width: calc(100% - var(--admin-navbar-width, 66px)); min-width: 0; min-height: calc(100dvh - 50px); height: auto; margin-left: var(--admin-navbar-width, 66px); padding: 24px clamp(16px, 3vw, 50px); box-sizing: border-box; overflow-y: auto; }
  .admin_mou .search_filter_section { width: min(1135px, 100%); max-width: none; }
  .admin_mou .search_controls { display: grid; grid-template-columns: minmax(220px, 1fr) minmax(190px, 276px) auto; align-items: center; gap: clamp(16px, 3vw, 53px); }
  .admin_mou .search_input_wrapper, .admin_mou .status_filter, .admin_mou .status_dropdown, .admin_mou .status_options { width: 100%; max-width: none; }
  .admin_mou .mou_table_container {
  width: min(1090px, 100%);
  max-width: 1090px;
}
@media (max-width: 900px) {
  .admin_mou .mou_table_container {
    width: 100%;
    overflow-x: auto;
  }
}

  .admin_mou .mou_page_actions {
    display: flex;
    justify-content: flex-end;
    width: min(1135px, 100%);
    margin-bottom: -8px;
  }

  .admin_mou .add_mou_btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-width: 105px;
    height: 36px;
    padding: 8px 16px;
    border: 0;
    border-radius: 8px;
    background: #8B0000;
    color: #FFFFFF;
    cursor: pointer;
    font: 600 13px/16px Inter, sans-serif;
  }

  .admin_mou .add_mou_btn:hover { background: #700000; }
  .admin_mou .mou_plus_icon { font-size: 20px; line-height: 16px; }

  @media (max-width: 900px) {
    .admin_mou .search_controls { grid-template-columns: minmax(0, 1fr) minmax(170px, 276px); }
    .admin_mou .action_buttons { grid-column: 1 / -1; justify-content: flex-end; }
  }

  @media (max-width: 640px) {
    .admin_mou > .main_content { width: calc(100% - 66px); padding-inline: 12px; }
    .admin_mou .search_controls { grid-template-columns: 1fr; gap: 12px; padding: 16px; }
    .admin_mou .action_buttons { justify-content: flex-end; }
  }

  /* =========================================
    ADD MOU MODAL
    Figma Group 259
    ========================================= */

  .add_mou_overlay {
    position: fixed;
    inset: 0;

    display: flex;
    align-items: flex-start;
    justify-content: center;

    padding-top: 51px;

    background: rgba(0, 0, 0, 0.35);

    z-index: 9999;

    box-sizing: border-box;
  }

  .add_mou_modal {
    position: relative;

    width: 520px;
    min-height: 360px;
    max-width: calc(100vw - 32px);

    box-sizing: border-box;

    padding: 24px 32px 22px;

    background: #ffffff;

    border-radius: 12px;

    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.18);

    font-family: 'Inter', sans-serif;
  }

  .add_mou_close {
    position: absolute;
    top: 14px;
    right: 18px;

    width: 30px;
    height: 30px;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 0;

    border: none;
    background: transparent;

    color: #555555;

    font-size: 26px;
    line-height: 1;

    cursor: pointer;
  }

  .add_mou_close:hover {
    color: #000000;
  }

  .add_mou_title {
    margin: 0;

    font-family: 'Outfit', sans-serif;
    font-size: 24px;
    font-weight: 600;
    line-height: 30px;

    color: #000000;
  }

  .add_mou_divider {
    width: 100%;
    height: 1px;

    margin: 12px 0 18px;

    background: #d9d9d9;
  }

  .add_mou_field {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .add_mou_label {
    margin-bottom: 6px;

    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 600;
    line-height: 16px;

    color: #333333;
  }

  .add_mou_label span {
    color: #ab1c03;
    margin-left: 2px;
  }

  .add_mou_input {
    width: 100%;
    height: 36px;

    box-sizing: border-box;

    padding: 7px 10px;

    border: 1px solid #b1b1b1;
    border-radius: 6px;

    background: #ffffff;

    font-family: 'Inter', sans-serif;
    font-size: 13px;

    color: #333333;

    outline: none;
  }

  .add_mou_input:focus {
    border-color: #ab1c03;
  }

  .add_mou_input:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
  .add_mou_organization_picker {
    position: relative;
    width: 100%;
  }

  .add_mou_organization_dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    max-height: 180px;
    overflow-y: auto;
    background: #ffffff;
    border: 1px solid #b1b1b1;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    z-index: 10001;
  }

  .add_mou_organization_option {
    display: block;
    width: 100%;
    padding: 9px 10px;
    border: none;
    background: #ffffff;
    text-align: left;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    color: #333333;
    cursor: pointer;
  }

  .add_mou_organization_option:hover {
    background: #f5f5f5;
  }

  .add_mou_organization_empty {
    padding: 10px;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    color: #777777;
  }

  .add_mou_organization_picker {
    position: relative;
    width: 100%;
  }

  .add_mou_organization_dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    max-height: 180px;
    overflow-y: auto;
    background: #ffffff;
    border: 1px solid #b1b1b1;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    z-index: 10001;
  }

  .add_mou_organization_option {
    display: block;
    width: 100%;
    padding: 9px 10px;
    border: none;
    background: #ffffff;
    text-align: left;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    color: #333333;
    cursor: pointer;
  }

  .add_mou_organization_option:hover {
    background: #f5f5f5;
  }

  .add_mou_organization_empty {
    padding: 10px;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    color: #777777;
  }

  .add_mou_file_box {
    width: 100%;
    height: 36px;

    box-sizing: border-box;

    display: flex;
    align-items: center;

    padding: 0 10px;

    border: 1px dashed #b1b1b1;
    border-radius: 6px;

    background: #fafafa;

    cursor: pointer;
  }

  .add_mou_file_box:hover {
    border-color: #ab1c03;
    background: #fffafa;
  }

  .add_mou_file_box input[type='file'] {
    display: none;
  }

  .add_mou_file_text {
    overflow: hidden;

    white-space: nowrap;
    text-overflow: ellipsis;

    font-family: 'Inter', sans-serif;
    font-size: 12px;

    color: #666666;
  }

  .add_mou_dates {
    display: grid;

    grid-template-columns: 1fr 1fr;

    gap: 16px;

    margin-top: 12px;
  }

  .add_mou_error {
    margin: 8px 0 0;

    font-family: 'Inter', sans-serif;
    font-size: 11px;
    line-height: 14px;

    color: #d00000;
  }

  .add_mou_actions {
    display: flex;

    justify-content: flex-end;
    align-items: center;

    gap: 10px;

    margin-top: 16px;
  }

  .add_mou_cancel,
  .add_mou_submit {
    height: 32px;

    padding: 0 18px;

    border-radius: 6px;

    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 500;

    cursor: pointer;
  }

  .add_mou_cancel {
    border: 1px solid #b1b1b1;

    background: #ffffff;

    color: #333333;
  }

  .add_mou_cancel:hover {
    background: #f5f5f5;
  }

  .add_mou_submit {
    border: 1px solid #8b0000;

    background: #8b0000;

    color: #ffffff;
  }

  .add_mou_submit:hover {
    background: #700000;
  }

  .add_mou_submit:disabled,
  .add_mou_cancel:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }


  /* =========================================
    ADD MOU RESPONSIVE
    ========================================= */

  @media (max-width: 600px) {
    .add_mou_overlay {
      padding: 20px 16px;
      align-items: flex-start;
    }

    .add_mou_modal {
      width: 100%;
      max-width: 520px;

      padding: 22px 20px;
    }

    .add_mou_dates {
      grid-template-columns: 1fr;
      gap: 10px;
    }
  }

  .admin_mou .mou_table_container {
  width: 1090px;
  max-width: 1090px;
  height: 277px;

  margin-left: 0;
  padding: 0;

  overflow: hidden;

  background: #FFFFFF;
  border: 1px solid #E1E1E1;
  border-radius: 8px;

  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.10);

  box-sizing: border-box;
}

.admin_mou .mou_table {
  width: 1090px;
  min-width: 1090px;
  height: auto;

  table-layout: fixed;
  border-collapse: collapse;

  background: #FFFFFF;

  font-family: 'Inter', sans-serif;
}


.admin_mou .mou_table th {
  height: 48px;

  padding: 0 18px;

  box-sizing: border-box;

  background: #8B0000;

  border-bottom: 1px solid #FFFFFF;
  border-right: 1px solid #BCBCBE;

  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  line-height: 16px;

  color: #FFFFFF;

  text-align: left;
  vertical-align: middle;
}
.admin_mou .mou_table td {
  height: 76px;
  padding: 0 18px;
  box-sizing: border-box;

  border-bottom: 1px solid #000000;
  border-right: 1px solid #BCBCBE;

  vertical-align: middle;
}

.admin_mou .mou_table th:last-child {
  border-right: none;
}

/* =========================================================
   COLUMN WIDTHS
   Total = 1090px
   ========================================================= */

.admin_mou .mou_table_org_col {
  width: 300px;
}

.admin_mou .mou_table_document_col {
  width: 270px;
}

.admin_mou .mou_table_uploaded_col {
  width: 160px;
}

.admin_mou .mou_table_status_col {
  width: 140px;
}

.admin_mou .mou_table_action_col {
  width: 220px;
}

/* =========================================================
   ROW
   ========================================================= */

.admin_mou .mou_table_row {
  height: 76px;

  border-bottom: 1px solid #E1E1E1;

  background: #FFFFFF;

  cursor: default;

  transition: background 0.15s ease;
}

.admin_mou .mou_table_row:hover {
  background: #FAFAFA;
}

/* =========================================================
   CELL
   ========================================================= */

.admin_mou .mou_table td {
  height: 76px;

  padding: 0 18px;

  box-sizing: border-box;

  border-bottom: 1px solid #E1E1E1;

  vertical-align: middle;
}

/* =========================================================
   ORGANIZATION
   ========================================================= */

.admin_mou .mou_table_org {
  width: 300px;

  overflow: hidden;

  text-align: left;
}

.admin_mou .mou_table_org span {
  display: block;

  width: 100%;

  overflow: hidden;

  white-space: nowrap;

  text-overflow: ellipsis;

  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 18px;

  color: #111111;
}

/* =========================================================
   DOCUMENT NAME
   ========================================================= */

.admin_mou .mou_table_document {
  width: 270px;

  overflow: hidden;

  text-align: left;
}

.admin_mou .mou_document_link {
  display: block;

  max-width: 100%;

  overflow: hidden;

  white-space: nowrap;

  text-overflow: ellipsis;

  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 18px;

  color: #2563EB;

  text-decoration: none;

  cursor: pointer;
}

.admin_mou .mou_document_link:hover {
  color: #1D4ED8;
  text-decoration: underline;
}

/* =========================================================
   UPLOADED
   ========================================================= */

.admin_mou .mou_table_uploaded {
  width: 160px;

  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 18px;

  color: #333333;

  text-align: left;
}

/* =========================================================
   STATUS
   ========================================================= */

.admin_mou .mou_table_status {
  width: 140px;

  text-align: left;
}

.admin_mou .mou_status_badge {
  display: inline-flex;

  align-items: center;
  justify-content: center;

  min-width: 82px;
  height: 30px;

  padding: 0 16px;

  box-sizing: border-box;

  border-radius: 20px;

  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  line-height: 16px;
}

.admin_mou .mou_status_badge.active {
  background: #E8F8ED;
  color: #16803A;
}

.admin_mou .mou_status_badge.inactive {
  background: #FDECEC;
  color: #D00000;
}

/* =========================================================
   ACTIONS
   ========================================================= */

.admin_mou .mou_table_action {
  width: 220px;

  padding-left: 18px !important;
  padding-right: 18px !important;

  text-align: left;
}

.admin_mou .mou_actions {
  display: flex;

  flex-direction: row;

  align-items: center;

  justify-content: flex-start;

  gap: 8px;

  width: 100%;

  white-space: nowrap;
}

/* ทุกปุ่ม Action ขนาดเท่ากัน */
.admin_mou .mou_action_btn {
  display: inline-flex;

  align-items: center;
  justify-content: center;

  flex: 0 0 auto;

  width: 58px;
  height: 30px;

  padding: 0;

  box-sizing: border-box;

  border: 1px solid #BDBDBD;
  border-radius: 4px;

  background: #FFFFFF;

  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 16px;

  color: #222222;

  cursor: pointer;
}

.admin_mou .mou_action_btn:hover {
  background: #F5F5F5;
}

/* View */
.admin_mou .mou_action_btn.view_btn {
  color: #333333;
}

/* Edit */
.admin_mou .mou_action_btn.edit_btn {
  color: #333333;
}

/* Delete */
.admin_mou .mou_action_btn.delete_btn {
  color: #B00000;
  border-color: #C8C8C8;
}

.admin_mou .mou_action_btn.delete_btn:hover {
  background: #FFF3F3;
}

/* =========================================================
   EMPTY STATE
   ========================================================= */

.admin_mou .mou_table_empty {
  height: 180px;

  padding: 0 !important;

  text-align: center;

  vertical-align: middle !important;

  font-family: 'Inter', sans-serif;
  font-size: 14px;

  color: #777777;

  border-bottom: none !important;
}
  </style>
