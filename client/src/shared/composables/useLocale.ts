import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Lang } from '@shared/types/form'

const LOCALE_KEY = 'app_locale'

export function useLocale() {
  const { locale } = useI18n({ useScope: 'global' })

  const lang = computed<Lang>(() => locale.value as Lang)

  const setLang = (newLang: Lang) => {
    locale.value = newLang
    localStorage.setItem(LOCALE_KEY, newLang)
  }

  return { lang, setLang }
}
