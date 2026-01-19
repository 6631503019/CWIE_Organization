# Backend Integration Summary

## Overview
All admin pages are now fully integrated with the backend API endpoints.

---

## Connected Pages & Endpoints

### 1. **AdminDashboard.vue**
- **Endpoints Used:**
  - `GET /api/organizations?limit=1000` - Fetch all organizations for statistics
  - `GET /api/roadshows?limit=1` - Get roadshow count
  
- **Functionality:**
  - Displays total establishments count
  - Breaks down by type: Private Company, Government, Overseas, MFU
  - Shows total roadshow count
  - Auto-refreshes every 5 minutes
  
- **Data Flow:**
  - Statistics are calculated from organization types
  - Organizations fetched on mount and periodically refreshed

---

### 2. **AdminOrganization.vue**
- **Endpoints Used:**
  - `GET /api/organizations?limit=100` - Fetch all organizations
  
- **Functionality:**
  - Displays list of all organizations
  - Filter by type, category, province
  - Search by name
  - Pagination support
  - Auto-refresh every 30 seconds
  
- **Data Mapping:**
  - Backend field → Frontend field
  - `_id` → `id`
  - `is_active` → `status` (active/inactive)
  - `name_en` or `name_th` → `name`
  - `type` → `category`
  - `province` → `province`
  - `created_at` → `createdDate`
  - `updated_at` → `editedDate`

---

### 3. **AdminRoadshow.vue** ✅
- **Endpoints Used:**
  - `GET /api/roadshows?limit=100` - Fetch all roadshows
  - `POST /api/roadshows` - Create new roadshow
  - `PUT /api/roadshows/:id` - Update existing roadshow
  
- **Functionality:**
  - Display roadshows in grid layout
  - Create/edit modals with file uploads
  - Topic, Details, Date, Picture Activity, Poster, Public toggle
  - Auto-refresh every 45 seconds
  
- **Data Mapping:**
  - `topic` → Topic field
  - `details` → Details textarea
  - `event_date` → Date field
  - `activity_image_path` → Picture Activity
  - `poster_path` → Poster
  - `is_public` → Public toggle

---

### 4. **AdminMOU.vue**
- **Endpoints Used:**
  - `GET /api/mous?limit=100` - Fetch all MOUs
  
- **Functionality:**
  - Display MOU cards in grid
  - Filter and search
  - View MOU details
  - Auto-refresh every 30 seconds
  
- **Data Mapping:**
  - `_id` → `id`
  - `organization_name` or `name` → `name`
  - `status` → `status`
  - `start_date` + `end_date` → `duration`
  - `logo_path` → `logo`

---

### 5. **AdminMOUDetail.vue**
- **Endpoints Used:**
  - `GET /api/mous?limit=100` - Fetch MOUs for detail view
  
- **Functionality:**
  - Display single MOU detail
  - Show organization info, MOU document
  - Auto-refresh every 60 seconds
  
- **Data Mapping:**
  - Same as AdminMOU.vue

---

## Authentication

All POST/PUT/DELETE requests include Bearer token:
```javascript
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}
```

---

## File Uploads

File uploads use FormData for multipart requests:
- **Picture Activity:** field name `activity_image`
- **Poster:** field name `poster`
- **Organization Logo:** field name `logo`

---

## Error Handling

Each page implements:
- Loading states (`state.loading`)
- Error messages (`state.error`)
- Auto-refresh intervals with error catching
- Proper cleanup in `onBeforeUnmount()`

---

## Auto-Refresh Intervals

| Page | Interval | Seconds |
|------|----------|---------|
| AdminDashboard | 5 minutes | 300000 |
| AdminOrganization | 30 seconds | 30000 |
| AdminRoadshow | 45 seconds | 45000 |
| AdminMOU | 30 seconds | 30000 |
| AdminMOUDetail | 60 seconds | 60000 |

---

## API Base URL

All requests use: `http://localhost:5000`

To change, update the fetch URLs in each component.

---

## Status

✅ All admin pages connected
✅ Data fetching implemented
✅ File uploads working
✅ Error handling in place
✅ Auto-refresh configured
✅ Proper data mapping
