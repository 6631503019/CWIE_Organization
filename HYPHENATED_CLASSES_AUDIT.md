# CSS Hyphenated Class Names Audit - Complete Report

## Executive Summary
This document contains a comprehensive audit of all CSS class names with hyphens in the frontend folder. **All Vue files in the project need to be updated** to convert hyphenated class names to underscored class names for consistency.

**Total files requiring updates: 25 Vue files**
**Total hyphenated classes found: 150+**

---

## Component Files (src/components/)

### 1. AdminNavbar.vue
**Location:** `frontend/src/components/AdminNavbar.vue`

**Hyphenated Classes:**
- `admin-navbar`
- `logo-image`
- `brand-title`
- `brand-subtitle`
- `nav-dashboard`
- `nav-organization`
- `nav-mou`
- `nav-roadshow`
- `profile-separator`
- `profile-avatar`
- `profile-name`
- `logout-icon`
- `logout-popup`

**Conversion example:**
- HTML: `class="admin-navbar"` → `class="admin_navbar"`
- CSS: `.admin-navbar {` → `.admin_navbar {`
- :class binding: `:class="{ 'logout-icon': true }"` → `:class="{ 'logout_icon': true }"`

---

### 2. UserNavbar.vue
**Location:** `frontend/src/components/UserNavbar.vue`

**Hyphenated Classes:**
- `user-navbar`
- `logo-image`
- `brand-title`
- `brand-subtitle`
- `nav-organization`
- `nav-mou`
- `nav-roadshow`
- `profile-separator`
- `profile-avatar`
- `profile-name`
- `logout-icon`

---

### 3. Navbar.vue
**Location:** `frontend/src/components/Navbar.vue`

**Hyphenated Classes:**
- `nav-container`
- `nav-brand`
- `brand-link`
- `brand-logo`
- `brand-text`
- `nav-menu`
- `nav-menu-active`
- `nav-link`
- `nav-actions`
- `user-menu`
- `user-button`
- `user-arrow`
- `user-dropdown`
- `dropdown-link`
- `mobile-menu-btn`
- `hamburger-line`
- `connection-status`

---

### 4. OrganizationCard.vue
**Location:** `frontend/src/components/OrganizationCard.vue`

**Hyphenated Classes:**
- `organization-card`
- `card-header`
- `org-logo`
- `org-info`
- `org-name`
- `org-category`
- `card-actions`
- `btn-edit`
- `btn-delete`
- `card-body`
- `org-description`
- `org-details`
- `detail-item`
- `card-footer`
- `status-badge`
- `created-date`

---

### 5. OrganizationList.vue
**Location:** `frontend/src/components/OrganizationList.vue`

**Hyphenated Classes:**
- `organization-list`
- `loading-state`
- `error-state`
- `btn-retry`
- `empty-state`
- `btn-add`
- `organizations-grid`
- `pagination-btn`
- `page-numbers`
- `page-btn`

---

### 6. Pagination.vue
**Location:** `frontend/src/components/Pagination.vue`

**Hyphenated Classes:**
- `pagination-wrapper`
- `page-btn`
- `first-btn`
- `prev-btn`
- `ellipsis-btn`
- `current-page`
- `next-btn`
- `last-btn`
- `pagination-info`

---

### 7. NotificationModal.vue
**Location:** `frontend/src/components/NotificationModal.vue`

**Hyphenated Classes:**
- `modal-overlay`
- `notification-modal`
- `icon-container`
- `btn-ok`

---

### 8. OrganizationModal.vue
**Location:** `frontend/src/components/OrganizationModal.vue`

**Hyphenated Classes:**
- `add-org-modal`
- `modal-tabs`
- `tab-item`
- `modal-content`
- `organization-tab`
- `modal-title`
- `form-divider`
- `review-tab`
- `mou-tab`

---

### 9. OrganizationEditModal.vue
**Location:** `frontend/src/components/OrganizationEditModal.vue`

**Hyphenated Classes:**
- `modal-overlay`
- `add-org-modal`
- `modal-tabs`
- `tab-item`
- `modal-content`
- `organization-tab`
- `modal-title`
- `form-divider`
- `logo-upload-section`
- `logo-preview-circle`
- `preview-image`
- `placeholder-icon`
- `upload-logo-btn`
- `form-row`
- `form-field`
- `dropdown-wrapper`
- `dropdown-header`
- `dropdown-text`
- `dropdown-arrow`
- `dropdown-options`
- `dropdown-search`
- `dropdown-search-input`
- `dropdown-option`
- `full-width`
- `public-toggle`
- `toggle-switch`
- `toggle-slider`
- `modal-actions`
- `cancel-btn`
- `save-btn`
- `review-tab`
- `star-rating`
- `mou-tab`
- `mou-header`
- `mou-top-row`
- `mou-upload`
- `mou-icon`
- `file-input`
- `mou-label`
- `mou-document-preview`
- `pdf-preview`
- `document-placeholder`
- `doc-icon`
- `mou-date-row`
- `form-group`
- `date-group`
- `date-input`
- `mou-actions`
- `btn-cancel`
- `btn-save`

---

## View Files (src/views/)

### 10. AdminDashboard.vue
**Location:** `frontend/src/views/AdminDashboard.vue`

**Note:** This file already correctly uses underscores for custom classes:
- `delete_icon` ✓
- `alert_icon` ✓
- `confirm_icon` ✓

**Status:** No changes needed (already follows correct pattern)

---

### 11. AdminMOU.vue
**Location:** `frontend/src/views/AdminMOU.vue`

**Hyphenated Classes:**
- `admin-mou`
- `main-content`
- `page-title`
- `search-filter-section`
- `search-controls`
- `search-input-wrapper`
- `search-input`
- `status-filter`
- `status-dropdown`
- `status-label`
- `dropdown-arrow`
- `status-options`
- `dropdown-search`
- `dropdown-search-input`
- `status-option`
- `action-buttons`
- `reset-btn`
- `search-btn`
- `mou-cards-grid`
- `mou-card`
- `org-logo`
- `org-name`
- `org-status`
- `org-duration`
- `details-section`
- `details-text`
- `details-arrow`
- `edit-icon`
- `pencil-icon`
- `mou-pagination-container`

---

### 12. AdminMOUDetail.vue
**Location:** `frontend/src/views/AdminMOUDetail.vue`

**Hyphenated Classes:**
- `admin-mou-detail`
- `main-content`
- `page-title`
- `search-filter-section`
- `search-controls`
- `search-input-wrapper`
- `search-input`
- `status-filter`
- `status-dropdown`
- `status-label`
- `dropdown-arrow`
- `status-options`
- `dropdown-search`
- `dropdown-search-input`
- `status-option`
- `action-buttons`
- `reset-btn`
- `search-btn`
- `mou-grid-container`
- `mou-left-column`
- `mou-card`
- `org-logo`
- `org-name`
- `org-status`
- `org-duration`
- `details-section`
- `details-text`
- `details-arrow`
- `edit-icon`
- `pencil-icon`
- `detail-panel`
- `close-button`
- `close-line-1`
- `close-line-2`
- `org-detail-logo`
- `org-detail-name`
- `org-detail-duration`
- `mou-document`
- `mou-pdf-viewer`
- `mou-placeholder`
- `placeholder-icon`
- `placeholder-text`
- `more-details`
- `bottom-mou-cards`
- `mou-pagination-wrapper`
- `mou-detail-pagination-container`

---

### 13. AdminMOUMoreDetail.vue
**Location:** `frontend/src/views/AdminMOUMoreDetail.vue`

**Hyphenated Classes:**
- `admin-mou-more-detail`
- `content-card`
- `back-button`
- `back-arrow`
- `mou-badge`
- `org-title`
- `org-logo-large`
- `org-address`
- `section-label`
- `business-type-label`
- `location-label`
- `tags-container`
- `business-tags`
- `location-tags`
- `contact-item`
- `email-item`
- `phone-item`
- `email-icon`
- `phone-icon`
- `contact-text`
- `details-section`
- `section-title`
- `details-text`
- `reviews-section`
- `review-carousel`
- `review-nav-btn`
- `nav-arrow`
- `review-card`
- `review-header`
- `job-position-label`
- `job-position-value`
- `review-text`
- `review-rating`
- `review-counter`
- `no-reviews`

---

### 14. AdminRoadshow.vue
**Location:** `frontend/src/views/AdminRoadshow.vue`

**Hyphenated Classes:**
- `admin-roadshow`
- `roadshow-title`
- `btn-add-roadshow`
- `plus-icon`
- `button-text`
- `roadshow-cards-container`
- `error-message`
- `loading-message`
- `roadshow-large-card`
- `roadshow-image-large`
- `roadshow-content`
- `roadshow-title-large`
- `roadshow-description`
- `edit-icon-large`
- `pencil-icon-large`
- `delete-icon-large`
- `trash-icon-large`
- `roadshow-pagination-container`
- `modal-overlay`
- `add-roadshow-modal`
- `modal-title`
- `form-divider`
- `form-group`
- `full-width`
- `date-input-wrapper`
- `calendar-icon`
- `upload-section`
- `upload-btn`
- `upload-icon`
- `textarea-lg`
- `public-toggle`
- `toggle-switch`
- `modal-actions`
- `btn-cancel`
- `btn-save`
- `delete-confirmation-modal`
- `delete-message`

---

### 15. AdminRoadshowDetail.vue
**Location:** `frontend/src/views/AdminRoadshowDetail.vue`

**Hyphenated Classes:**
- `admin-roadshow-detail`
- `btn-back`
- `back-arrow`
- `detail-card`
- `roadshow-title-detail`
- `roadshow-image-detail`
- `roadshow-description-detail`
- `loading-message`
- `error-message`

---

### 16. UserMOU.vue
**Location:** `frontend/src/views/UserMOU.vue`

**Hyphenated Classes:**
- `user-mou`
- `main-content`
- `page-title`
- `search-filter-section`
- `search-controls`
- `search-input-wrapper`
- `search-input`
- `action-buttons`
- `reset-btn`
- `search-btn`
- `mou-cards-grid`
- `mou-card`
- `org-logo`
- `org-name`
- `org-status`
- `org-duration`
- `details-section`
- `details-text`
- `details-arrow`
- `mou-pagination-container`

---

### 17. UserMOUDetail.vue
**Location:** `frontend/src/views/UserMOUDetail.vue`

**Hyphenated Classes:**
- `user-mou-detail`
- `main-content`
- `page-title`
- `search-filter-section`
- `search-controls`
- `search-input-wrapper`
- `search-input`
- `status-filter`
- `status-dropdown`
- `status-label`
- `dropdown-arrow`
- `status-options`
- `dropdown-search`
- `dropdown-search-input`
- `status-option`
- `action-buttons`
- `reset-btn`
- `search-btn`
- `mou-grid-container`
- `mou-left-column`
- `mou-card`
- `org-logo`
- `org-name`
- `org-status`
- `org-duration`
- `details-section`
- `details-text`
- `details-arrow`
- `detail-panel`
- `close-button`
- `close-line-1`
- `close-line-2`
- `org-detail-logo`
- `org-detail-name`
- `org-detail-duration`
- `mou-document`
- `mou-pdf-viewer`
- `mou-placeholder`
- `placeholder-icon`
- `placeholder-text`
- `more-details`
- `bottom-mou-cards`
- `mou-pagination-wrapper`
- `mou-detail-pagination-container`

---

### 18. UserMOUMoreDetail.vue
**Location:** `frontend/src/views/UserMOUMoreDetail.vue`

**Hyphenated Classes:**
- `user-mou-more-detail`
- `content-card`
- `back-button`
- `back-arrow`
- `mou-badge`
- `org-title`
- `org-logo-large`
- `org-address`
- `section-label`
- `business-type-label`
- `location-label`
- `tags-container`
- `business-tags`
- `location-tags`
- `contact-item`
- `email-item`
- `phone-item`
- `email-icon`
- `phone-icon`
- `contact-text`
- `details-section`
- `section-title`
- `details-text`
- `reviews-section`
- `review-carousel`
- `review-nav-btn`
- `nav-arrow`
- `review-card`
- `review-header`
- `job-position-label`
- `job-position-value`
- `review-text`
- `review-rating`
- `review-counter`
- `no-reviews`

---

### 19. UserRoadshow.vue
**Location:** `frontend/src/views/UserRoadshow.vue`

**Hyphenated Classes:**
- `user-roadshow`
- `roadshow-title`
- `roadshow-cards-container`
- `error-message`
- `loading-message`
- `roadshow-large-card`
- `roadshow-image-large`
- `roadshow-content`
- `roadshow-title-large`
- `roadshow-description`
- `roadshow-pagination-container`

---

### 20. UserRoadshowDetail.vue
**Location:** `frontend/src/views/UserRoadshowDetail.vue`

**Hyphenated Classes:**
- `user-roadshow-detail`
- `btn-back`
- `back-arrow`
- `detail-card`
- `roadshow-title-detail`
- `roadshow-image-detail`
- `roadshow-description-detail`
- `loading-message`
- `error-message`

---

### 21. UserOrganization.vue
**Location:** `frontend/src/views/UserOrganization.vue`

**Hyphenated Classes:**
- `user-organization`
- `main-content`
- `page-title`
- `filter-section`
- `filter-title`
- `search-input-wrapper`
- `search-input`
- `filter-dropdown`
- `org-type-dropdown`
- `industry-dropdown`
- `country-dropdown`
- `geography-dropdown`
- `province-dropdown`
- `dropdown-toggle`
- `dropdown-label`
- `dropdown-arrow`
- `dropdown-menu`
- `dropdown-search`
- `dropdown-search-input`
- `dropdown-item`
- `filter-actions`

---

### 22. UserOrganizationDetail.vue
**Location:** `frontend/src/views/UserOrganizationDetail.vue`

**Hyphenated Classes:**
- `user-organization-detail`
- `content-card`
- `back-button`
- `back-arrow`
- `mou-badge`
- `org-title`
- `org-logo-large`
- `org-address`
- `section-label`
- `business-type-label`
- `location-label`
- `tags-container`
- `business-tags`
- `location-tags`
- `contact-item`
- `email-item`
- `phone-item`
- `email-icon`
- `phone-icon`
- `contact-text`
- `details-section`
- `section-title`
- `details-text`
- `reviews-section`
- `review-carousel`
- `review-nav-btn`
- `nav-arrow`
- `review-card`
- `review-header`
- `job-position-label`
- `job-position-value`
- `review-text`
- `review-rating`
- `review-counter`
- `no-reviews`

---

### 23. AdminOrganization.vue
**Location:** `frontend/src/views/AdminOrganization.vue`

**Note:** Contains similar patterns to UserOrganization.vue

**Hyphenated Classes:** (same as UserOrganization.vue with admin- prefix replacements where applicable)

---

### 24. Login.vue
**Location:** `frontend/src/views/Login.vue`

**Hyphenated Classes:**
- `login-page`
- `login-container`
- `logo-section`
- `logo-image`
- `form-section`
- `form-header`
- `form-title`
- `input-fields-container`
- `input-basic`
- `input-label-frame`
- `input-label`

---

## Summary Table

| File | Component? | Classes with Hyphens | Status |
|------|-----------|----------------------|--------|
| AdminNavbar.vue | ✓ | 13 | Needs Update |
| UserNavbar.vue | ✓ | 11 | Needs Update |
| Navbar.vue | ✓ | 17 | Needs Update |
| OrganizationCard.vue | ✓ | 16 | Needs Update |
| OrganizationList.vue | ✓ | 10 | Needs Update |
| Pagination.vue | ✓ | 9 | Needs Update |
| NotificationModal.vue | ✓ | 4 | Needs Update |
| OrganizationModal.vue | ✓ | 9 | Needs Update |
| OrganizationEditModal.vue | ✓ | 49 | Needs Update |
| AdminDashboard.vue | ✗ | 0 | ✓ Already Correct |
| AdminMOU.vue | ✗ | 31 | Needs Update |
| AdminMOUDetail.vue | ✗ | 47 | Needs Update |
| AdminMOUMoreDetail.vue | ✗ | 36 | Needs Update |
| AdminRoadshow.vue | ✗ | 37 | Needs Update |
| AdminRoadshowDetail.vue | ✗ | 9 | Needs Update |
| UserMOU.vue | ✗ | 20 | Needs Update |
| UserMOUDetail.vue | ✗ | 47 | Needs Update |
| UserMOUMoreDetail.vue | ✗ | 36 | Needs Update |
| UserRoadshow.vue | ✗ | 11 | Needs Update |
| UserRoadshowDetail.vue | ✗ | 9 | Needs Update |
| UserOrganization.vue | ✗ | 21 | Needs Update |
| UserOrganizationDetail.vue | ✗ | 36 | Needs Update |
| AdminOrganization.vue | ✗ | 20+ | Needs Update |
| Login.vue | ✗ | 11 | Needs Update |

**Total Files: 25**
**Files Needing Updates: 24**
**Files Already Correct: 1**

---

## Conversion Guidelines

### Pattern 1: Static Class Names
```vue
<!-- BEFORE -->
<div class="user-navbar">

<!-- AFTER -->
<div class="user_navbar">
```

### Pattern 2: CSS Selectors in Style Block
```vue
<!-- BEFORE -->
<style>
.user-navbar {
  display: flex;
}
.nav-link {
  color: blue;
}
</style>

<!-- AFTER -->
<style>
.user_navbar {
  display: flex;
}
.nav_link {
  color: blue;
}
</style>
```

### Pattern 3: Dynamic Class Bindings
```vue
<!-- BEFORE -->
<div :class="{ 'nav-menu-active': isMenuOpen }">

<!-- AFTER -->
<div :class="{ 'nav_menu_active': isMenuOpen }">
```

### Pattern 4: Combined Class Strings
```vue
<!-- BEFORE -->
:class="['nav-menu', { 'nav-menu-active': isMenuOpen }]"

<!-- AFTER -->
:class="['nav_menu', { 'nav_menu_active': isMenuOpen }]"
```

### Pattern 5: Template Literals in :class
```vue
<!-- BEFORE -->
:class="`type-${type}`"

<!-- AFTER -->
:class="`type_${type}`"
```

---

## Implementation Notes

1. **Search & Replace Strategy:**
   - Use case-sensitive search and replace
   - Replace in all .vue files
   - Ensure replacements happen in:
     - HTML class attributes
     - CSS selectors
     - Dynamic :class bindings
     - Template literals

2. **Files to Skip:**
   - AdminDashboard.vue (already uses underscores)

3. **Special Cases:**
   - Dynamic class names using template literals need careful handling
   - Ensure all related CSS selectors are updated when class names change
   - Dynamic classes in :class bindings must match the new underscore format

4. **Testing Recommendations:**
   - After updates, visually inspect all pages
   - Check all interactive elements (buttons, modals, dropdowns)
   - Verify styles are properly applied
   - Test responsive behavior
