import 'vue-router'
import type { UserRole } from '@shared/types'

declare module 'vue-router' {
  interface RouteMeta {
    auth?: boolean
    guest?: boolean
    roles?: UserRole[]
    title?: string
    theme?: 'primary' | 'accent'
  }
}
