import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const initializeAuth = async () => {
    const { useAuthStore } = await import('./stores/auth')
    const authStore = useAuthStore()
    authStore.initAuth()
    window.addEventListener('auth:expired', () => {
        authStore.Clear_All_Auth_Data()
        if (window.location.pathname !== '/') {
            router.replace('/')
        }
    })
}

// Mount app
app.mount('#app')

// Initialize auth state from localStorage after app is mounted
setTimeout(initializeAuth, 0)
