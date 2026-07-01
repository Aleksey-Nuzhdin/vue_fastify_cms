import { createI18n } from 'vue-i18n'
import type { Lang } from '@shared/types/form'
import ru from '@/locales/ru.json'
import en from '@/locales/en.json'

const DEFAULT_LANG: Lang = 'ru'
const LOCALE_KEY = 'app_locale'

const savedLang = localStorage.getItem(LOCALE_KEY) as Lang | null

const i18n = createI18n({
  legacy: false,
  locale: savedLang ?? DEFAULT_LANG,
  fallbackLocale: 'ru',
  messages: { ru, en },
})

export default i18n
