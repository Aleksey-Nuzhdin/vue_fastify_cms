import { useI18n } from 'vue-i18n'
import { isFetcherError } from '@/shared/api'

/**
 * Превращает ошибку запроса в человекочитаемое сообщение.
 *
 * Приоритет лукапа:
 *   errors.<scope>.<code>  →  errors.<code>  →  error.message (с сервера)  →  errors.UNKNOWN_ERROR
 *
 * scope — контекст формы/фичи, где один код значит разное
 * (напр. на логине UNAUTHORIZED = «неверный email или пароль»).
 */
export function useErrorMessage() {
  const { t, te } = useI18n({ useScope: 'global' })

  return (error: unknown, scope?: string): string => {
    if (!isFetcherError(error)) return t('errors.UNKNOWN_ERROR')

    const scopedKey = scope ? `errors.${scope}.${error.code}` : null
    if (scopedKey && te(scopedKey)) return t(scopedKey)

    const codeKey = `errors.${error.code}`
    if (te(codeKey)) return t(codeKey)

    return error.message || t('errors.UNKNOWN_ERROR')
  }
}
