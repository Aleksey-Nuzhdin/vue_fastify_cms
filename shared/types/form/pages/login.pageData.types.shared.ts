import type { JsonGuard } from '../../json.type.shared'
import type { PageData as Page } from '../form.types.shared'

export type LoginPageData = {
  title: string
  button: string
}

export type PageData = Page<LoginPageData>

export interface InitionalValues {
  email: string
  password: string
  remember: boolean
}
type _guard = JsonGuard<InitionalValues>