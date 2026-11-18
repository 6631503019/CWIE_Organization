import { ref, type Ref } from 'vue'

export type AdminLanguage = 'EN' | 'TH'

const STORAGE_KEY = 'admin_language'
const LANGUAGE_EVENT = 'admin-language-change'

const getStoredLanguage = (): AdminLanguage => {
  if (typeof window === 'undefined') return 'EN'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored === 'TH' ? 'TH' : 'EN'
}

// One shared reactive language state for every component importing this module.
const currentLanguage: Ref<AdminLanguage> = ref(getStoredLanguage())

// Also synchronize components if the composable is accidentally bundled more than once.
if (typeof window !== 'undefined') {
  window.addEventListener(LANGUAGE_EVENT, (event: Event) => {
    const language = (event as CustomEvent<AdminLanguage>).detail
    if (language === 'EN' || language === 'TH') {
      currentLanguage.value = language
    }
  })

  // Keep the active tab in sync if another browser tab changes the language.
  window.addEventListener('storage', (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      currentLanguage.value = event.newValue === 'TH' ? 'TH' : 'EN'
    }
  })
}

export const useLanguage = () => {
  const setLanguage = (language: AdminLanguage) => {
    if (language !== 'EN' && language !== 'TH') return

    currentLanguage.value = language

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, language)
      window.dispatchEvent(
        new CustomEvent<AdminLanguage>(LANGUAGE_EVENT, { detail: language })
      )
    }
  }

  const text = (english: string, thai: string): string =>
    currentLanguage.value === 'TH' ? thai : english

  return { currentLanguage, setLanguage, text }
}