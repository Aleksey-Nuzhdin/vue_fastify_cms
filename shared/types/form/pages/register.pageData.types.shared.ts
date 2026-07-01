import type { JsonGuard } from '../../json.type.shared'
import type { PageData as Page } from '../form.types.shared'

export type RegisterPageData = {
  title: string
  submitButton: string
  consentLink: string
  isShow: boolean
}
export type PageData = Page<RegisterPageData>

export interface InitionalValues {
  email: string
  password: string
  name: string
  phone: string
  plan: string
  interests: string[]
  company: string
  bio: string
  city: string
}
type _guard = JsonGuard<InitionalValues>