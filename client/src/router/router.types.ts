import 'vue-router'
import type { RouteLocationRaw } from 'vue-router'
import type { UserRole } from '@shared/types'

declare module 'vue-router' {
  interface RouteMeta {
    auth?: boolean
    guest?: boolean
    // Ключ отсутствует — роль не важна, достаточно авторизации.
    // Пустой массив — не пускать никого (в отличие от серверного authRoleGuard,
    // где [] равносилен отсутствию аргумента).
    roles?: UserRole[]
    // Куда уводить того, кто не прошёл по roles. Наследуется из родительской meta,
    // если у роута нет своего. Без ключа — popup и возврат на предыдущую страницу.
    roleRedirect?: RouteLocationRaw
    title?: string
    theme?: 'primary' | 'accent'
  }
}
