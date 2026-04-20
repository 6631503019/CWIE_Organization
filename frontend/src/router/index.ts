import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

// Simplified routes - only Login and Admin Dashboard
const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'Login',
        component: () => import('../views/Login.vue'),
        meta: { title: 'เข้าสู่ระบบ' }
    },
    {
        path: '/login',
        redirect: '/'
    },
    {
        path: '/admin/dashboard',
        name: 'AdminDashboard',
        component: () => import('../views/AdminDashboard.vue'),
        meta: { title: 'Admin Dashboard', requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/admin/organization',
        name: 'AdminOrganization',
        component: () => import('../views/AdminOrganization.vue'),
        meta: { title: 'Admin - Organization Management', requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/admin/mou',
        name: 'AdminMOU',
        component: () => import('../views/AdminMOU.vue'),
        meta: { title: 'Admin - MOU Management', requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/admin/mou/:id',
        name: 'AdminMOUDetail',
        component: () => import('../views/AdminMOUDetail.vue'),
        meta: { title: 'Admin - MOU Detail', requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/admin/mou/:id/more',
        name: 'AdminMOUMoreDetail',
        component: () => import('../views/AdminMOUMoreDetail.vue'),
        meta: { title: 'Admin - MOU More Detail', requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/admin/roadshow',
        name: 'AdminRoadshow',
        component: () => import('../views/AdminRoadshow.vue'),
        meta: { title: 'Admin - Roadshow Management', requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/admin/roadshow/:id',
        name: 'AdminRoadshowDetail',
        component: () => import('../views/AdminRoadshowDetail.vue'),
        meta: { title: 'Admin - Roadshow Detail', requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/user/organization',
        name: 'UserOrganization',
        component: () => import('../views/UserOrganization.vue'),
        meta: { title: 'Organization', requiresAuth: true, requiresUser: true }
    },
    {
        path: '/user/organization/:id',
        name: 'UserOrganizationDetail',
        component: () => import('../views/UserOrganizationDetail.vue'),
        meta: { title: 'Organization Detail' }
    },
    {
        path: '/user/mou',
        name: 'UserMOU',
        component: () => import('../views/UserMOU.vue'),
        meta: { title: 'MOU', requiresAuth: true, requiresUser: true }
    },
    {
        path: '/user/mou/:id',
        name: 'UserMOUDetail',
        component: () => import('../views/UserMOUDetail.vue'),
        meta: { title: 'MOU Detail', requiresAuth: true, requiresUser: true }
    },
    {
        path: '/user/mou/:id/more',
        name: 'UserMOUMoreDetail',
        component: () => import('../views/UserOrganizationDetail.vue'),
        meta: { title: 'MOU More Detail' }
    },
    {
        path: '/user/roadshow',
        name: 'UserRoadshow',
        component: () => import('../views/UserRoadshow.vue'),
        meta: { title: 'Roadshow', requiresAuth: true, requiresUser: true }
    },
    {
        path: '/user/roadshow/:id',
        name: 'UserRoadshowDetail',
        component: () => import('../views/UserRoadshowDetail.vue'),
        meta: { title: 'Roadshow Detail' }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return { top: 0 }
        }
    }
})

// Navigation guard with authentication check
router.beforeEach(async (to, from, next) => {
    // Set page title
    const title = to.meta.title as string || 'CWIE Organization'
    document.title = title

    // Check if route requires authentication
    if (to.meta.requiresAuth) {
        try {
            const { useAuthStore } = await import('../stores/auth')
            const authStore = useAuthStore()

            // CRITICAL: Initialize auth from localStorage before checking
            authStore.Initialize_Auth()

            // Check if user is logged in
            if (!authStore.bln_Is_Logged_In) {
                next('/')
                return
            }

            // Check if route requires admin role
            if (to.meta.requiresAdmin && !authStore.bln_Is_Admin) {
                next('/')
                return
            }

            // Check if route requires user role (non-admin)
            if (to.meta.requiresUser && !authStore.bln_Is_User) {
                next('/')
                return
            }
        } catch (error) {
            console.error('Navigation guard error:', error)
            next('/')
            return
        }
        // Don't proceed to login redirect check if auth was required
        next()
        return
    }

    // If user is logged in and trying to access login page, redirect to appropriate dashboard
    if (to.path === '/' || to.name === 'Login') {
        try {
            const { useAuthStore } = await import('../stores/auth')
            const authStore = useAuthStore()

            // CRITICAL: Initialize auth from localStorage before checking
            authStore.Initialize_Auth()

            if (authStore.bln_Is_Logged_In) {
                if (authStore.bln_Is_Admin) {
                    next('/admin/dashboard')
                } else {
                    next('/user/organization')
                }
                return
            }
        } catch (error) {
            // Continue to login if there's an error
        }
    }

    next()
})

export default router