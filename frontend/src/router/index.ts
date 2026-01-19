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
        path: '/admin/roadshow',
        name: 'AdminRoadshow',
        component: () => import('../views/AdminRoadshow.vue'),
        meta: { title: 'Admin - Roadshow Management', requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('../views/NotFound.vue'),
        meta: { title: 'Page Not Found' }
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

            // Check if user is logged in
            if (!authStore.isLoggedIn) {
                next('/')
                return
            }

            // Check if route requires admin role
            if (to.meta.requiresAdmin && !authStore.isAdmin) {
                next('/')
                return
            }
        } catch (error) {
            console.error('Navigation guard error:', error)
            next('/')
            return
        }
    }

    // If user is logged in and trying to access login page, redirect to appropriate dashboard
    if (to.path === '/' || to.name === 'Login') {
        try {
            const { useAuthStore } = await import('../stores/auth')
            const authStore = useAuthStore()

            if (authStore.isLoggedIn && authStore.isAdmin) {
                next('/admin/dashboard')
                return
            }
        } catch (error) {
            // Continue to login if there's an error
        }
    }

    next()
})

export default router