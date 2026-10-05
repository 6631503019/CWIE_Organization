import { ref } from 'vue'

export type AdminLanguage = 'EN' | 'TH'

const STORAGE_KEY = 'admin_language'
const currentLanguage = ref<AdminLanguage>(
    (localStorage.getItem(STORAGE_KEY) as AdminLanguage) || 'EN'
)

export const useLanguage = () => {
    const setLanguage = (language: AdminLanguage) => {
        currentLanguage.value = language
        localStorage.setItem(STORAGE_KEY, language)
    }

    const text = (english: string, thai: string) =>
        currentLanguage.value === 'TH' ? thai : english

    return { currentLanguage, setLanguage, text }
}
