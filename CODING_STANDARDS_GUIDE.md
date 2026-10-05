# Coding Standards & Refactoring Guide

**Project:** CWIE_Organization  
**Last Updated:** April 19, 2026  
**Status:** Refactoring in Progress

---

## 📋 Table of Contents
1. [Naming Conventions](#naming-conventions)
2. [Code Structure](#code-structure)
3. [Files Completed](#files-completed)
4. [Files Remaining](#files-remaining)
5. [Implementation Checklist](#implementation-checklist)

---

## 🎯 Naming Conventions

### Variable Naming (with Type Prefixes)
```typescript
// Strings
str_Variable_Name: string
str_User_Email: string
str_Auth_Token: string

// Numbers
i_Page_Number: number
i_Total_Items: number
f_Discount_Rate: number

// Booleans (must start with "bln_" and be descriptive)
bln_Is_Loading: boolean
bln_Has_Error: boolean
bln_Is_Valid_Token: boolean
bln_Can_Edit: boolean

// Objects/Arrays
obj_User_Data: object
obj_Response: any
arr_Items: array
arr_Roadshows: Roadshow[]

// Vue Refs
ref_Form_Data: Ref<object>
```

### Function Naming

**With Return Value** - Use prefix matching return type:
```typescript
// String return
Str_Get_Image_URL(path: string): string

// Number return
i_Calculate_Total_Price(items: Item[]): number

// Boolean return
Bln_Is_Token_Expired(token: string): boolean

// Array return
Arr_Get_Paginated_Items(items: Item[], page: number): Item[]

// Object return
obj_Get_User_Profile(userId: string): User
```

**Without Return Value** - Use Verb + Object pattern:
```typescript
Load_Roadshow_Details()
Clear_All_Auth_Data()
Handle_Form_Submit()
Update_User_Profile()
Calculate_Discount()
```

### Constants
```typescript
// ALWAYS use ALL_CAPS with underscores
const CONST_API_BASE_URL = 'http://localhost:5000'
const CONST_MAX_FILE_SIZE_MB = 10
const CONST_HTTP_UNAUTHORIZED = 401
const CONST_ERROR_MESSAGE = 'Operation failed'
```

### Boolean Getters in Pinia/Vue
```typescript
// In getters (must start with "bln_" for boolean)
getters: {
  bln_Is_Logged_In: (state) => !!state.user && !!state.token,
  bln_Is_Admin: (state) => state.user?.role === 'admin',
  bln_Has_Error: (state) => state.error !== null
}
```

---

## 📐 Code Structure

### 1. File Organization (Vue/TypeScript)
```typescript
// ============================================================================
// IMPORTS
// ============================================================================
import { ... } from 'vue'

// ============================================================================
// INTERFACES / TYPES
// ============================================================================
interface obj_User { ... }

// ============================================================================
// CONSTANTS
// ============================================================================
const CONST_API_URL = '...'

// ============================================================================
// STATE / REACTIVE VARIABLES
// ============================================================================
const obj_State = reactive({ ... })
const str_Message = ref<string>('')

// ============================================================================
// COMPUTED PROPERTIES
// ============================================================================
const i_Total_Count = computed(() => { ... })

// ============================================================================
// FUNCTIONS
// ============================================================================
// Each function must have a header comment

// ============================================================================
// LIFECYCLE HOOKS / EXPORTS
// ============================================================================
```

### 2. Function Header Comments
```typescript
/**
 * Function: Str_Get_Image_URL
 * Purpose: Generate image URL with fallback to default
 * Input: str_Image_Path (string | null) - path from server
 * Output: string - complete image URL
 * Side Effects: None
 */
function Str_Get_Image_URL(str_Image_Path: string | null): string {
  // Implementation
}

/**
 * Function: Load_User_Data
 * Purpose: Fetch user profile from API
 * Input: str_User_ID (string) - user identifier
 * Output: Promise<User> - user profile object
 * Side Effects: Updates component state, shows toast notification
 */
async function Load_User_Data(str_User_ID: string): Promise<obj_User> {
  // Implementation
}
```

### 3. Try-Catch-Finally Pattern
```typescript
async function Load_Data(): Promise<void> {
  try {
    // Step 1: Validate input
    if (!input) throw new Error('Invalid input')

    // Step 2: Fetch data
    const response = await fetch(url)
    
    // Step 3: Process response
    const data = await response.json()
    
    // Update state
    state.value = data
  } catch (error) {
    console.error('Error loading data:', error)
    str_Error_Message.value = error instanceof Error ? error.message : 'Unknown error'
  } finally {
    bln_Is_Loading.value = false
  }
}
```

### 4. Input Validation
```typescript
function Validate_Input(str_Input: any): boolean {
  // Check for null/undefined
  if (!str_Input) {
    obj_State.str_Error = 'Input is required'
    return false
  }
  
  // Check type
  if (typeof str_Input !== 'string') {
    obj_State.str_Error = 'Input must be string'
    return false
  }
  
  // Check length/content
  if (str_Input.length === 0) {
    obj_State.str_Error = 'Input cannot be empty'
    return false
  }
  
  return true
}
```

---

## ✅ Files Completed

| File | Status | Date |
|------|--------|------|
| `frontend/src/views/AdminRoadshowDetail.vue` | ✅ Complete | 2026-04-19 |
| `frontend/src/services/api.ts` | ✅ Complete | 2026-04-19 |
| `frontend/src/stores/auth.ts` | ✅ Complete | 2026-04-19 |

### Changes Applied:
- ✅ All variables renamed with type prefixes
- ✅ All functions with comprehensive headers
- ✅ Constants extracted and centralized
- ✅ Try-catch-finally blocks added
- ✅ Input validation implemented
- ✅ Step-by-step comments for complex logic

---

## 📝 Files Remaining (Priority Order)

### HIGH PRIORITY (Core Business Logic)
1. `frontend/src/stores/mou.ts` - MOU store state management
2. `frontend/src/stores/organization.ts` - Organization store state
3. `frontend/src/stores/roadshow.ts` - Roadshow store state
4. `frontend/src/stores/review.ts` - Review store state
5. `frontend/src/views/AdminMOU.vue` - Admin MOU management
6. `frontend/src/views/AdminOrganization.vue` - Admin organization management
7. `frontend/src/views/AdminMOU.vue` - Admin MOU list/CRUD

### MEDIUM PRIORITY (Admin Views)
8. `frontend/src/views/AdminMOUDetail.vue`
9. `frontend/src/views/AdminMOUMoreDetail.vue`
10. `frontend/src/views/AdminRoadshow.vue` (partially done)
11. `frontend/src/views/AdminDashboard.vue`

### MEDIUM PRIORITY (User Views)
12. `frontend/src/views/UserMOU.vue`
13. `frontend/src/views/UserOrganization.vue`
14. `frontend/src/views/UserRoadshow.vue`
15. `frontend/src/views/UserMOUDetail.vue`
16. `frontend/src/views/UserMOUMoreDetail.vue`
17. `frontend/src/views/UserRoadshowDetail.vue`
18. `frontend/src/views/UserOrganizationDetail.vue`

### LOW PRIORITY (Components)
19. `frontend/src/components/AdminNavbar.vue`
20. `frontend/src/components/UserNavbar.vue`
21. `frontend/src/components/Pagination.vue`
22. `frontend/src/components/OrganizationModal.vue`
23. `frontend/src/components/OrganizationEditModal.vue`
24. `frontend/src/components/OrganizationList.vue`
25. `frontend/src/components/OrganizationCard.vue`
26. `frontend/src/components/NotificationModal.vue`
27. `frontend/src/views/Login.vue`

### Other Services
28. `frontend/src/services/websocket.ts`

### Router
29. `frontend/src/router/index.ts`

---

## 🔄 Implementation Checklist

### For Each Vue File:
- [ ] Rename all `state` properties with prefixes (obj_, str_, bln_, arr_)
- [ ] Rename all `computed` properties with Getter_Name format
- [ ] Rename all `methods` with Action_Name format (or Verb_Object for mutations)
- [ ] Extract hardcoded strings/numbers to CONST_* at top
- [ ] Add function header comments (Purpose, Input, Output, Side Effects)
- [ ] Add try-catch-finally to async functions
- [ ] Add input validation at function start
- [ ] Add step-by-step comments for complex logic
- [ ] Replace inline callbacks with named functions
- [ ] Update all usages of renamed functions/variables

### For Each Store File (Pinia):
- [ ] Rename state with prefixes
- [ ] Rename getters with bln_ prefix for booleans
- [ ] Rename actions with Action_Name format
- [ ] Extract constants
- [ ] Add comprehensive comments
- [ ] Implement error handling
- [ ] Add step-by-step documentation

### For Each Service File:
- [ ] Extract all URLs/endpoints to constants
- [ ] Rename functions with return-type prefixes
- [ ] Add try-catch error handling
- [ ] Export with old names as aliases for backward compatibility
- [ ] Document all functions

---

## 📚 Examples by File Type

### Vue Component Example
```typescript
<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

// Constants
const CONST_MAX_ITEMS = 10
const CONST_ERROR_LOAD_FAILED = 'Failed to load items'

// State
const obj_State = reactive({
  bln_Is_Loading: false,
  str_Error_Message: null as string | null,
  arr_Items: [] as Item[]
})

// Computed
const i_Total_Items = computed(() => obj_State.arr_Items.length)

// Functions
/**
 * Load_Items
 * Purpose: Fetch items from API
 * Input: None
 * Output: Promise<void>
 * Side Effects: Updates obj_State
 */
async function Load_Items(): Promise<void> {
  try {
    obj_State.bln_Is_Loading = true
    const response = await fetch('/api/items')
    obj_State.arr_Items = await response.json()
  } catch (error) {
    obj_State.str_Error_Message = CONST_ERROR_LOAD_FAILED
  } finally {
    obj_State.bln_Is_Loading = false
  }
}
</script>
```

### Pinia Store Example
```typescript
export const useItemStore = defineStore('items', {
  state: () => ({
    arr_Items: [] as Item[],
    bln_Is_Loading: false
  }),

  getters: {
    i_Total_Items: (state) => state.arr_Items.length,
    bln_Has_Items: (state) => state.arr_Items.length > 0
  },

  actions: {
    /**
     * Load_Items - fetches items from API
     */
    async Load_Items(): Promise<void> {
      try {
        this.bln_Is_Loading = true
        // Implementation
      } finally {
        this.bln_Is_Loading = false
      }
    }
  }
})
```

---

## 🚀 Quick Start for Refactoring

1. **Copy the template** from this guide
2. **Rename all variables** using find-and-replace carefully
3. **Extract constants** to the top
4. **Add function headers** with Purpose/Input/Output
5. **Add try-catch blocks** to async functions
6. **Test thoroughly** before committing

---

## 📞 Notes

- **Backward Compatibility**: Export old function names as aliases
- **Consistency**: Apply same patterns across all files
- **Comments**: Add step-by-step comments for complex logic
- **Testing**: Ensure all functionality works after refactoring
- **Git**: Commit refactoring separately from feature changes

