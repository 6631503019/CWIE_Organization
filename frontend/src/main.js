import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Mount app
app.mount('#app')

// Initialize auth state from localStorage after app is mounted
setTimeout(async () => {
    const { useAuthStore } = await import('./stores/auth')
    const authStore = useAuthStore()
    authStore.initAuth()
}, 0)
