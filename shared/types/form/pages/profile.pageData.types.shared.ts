import type { JsonGuard } from '../../json.type.shared'
import type { PageData as Page } from '../form.types.shared'
import type { UserRole } from '../../user.types.shared'

export type ProfilePageData = {
  infoMessage:"Какое-то сообщение для юзера"
}

export type PageData = Page<ProfilePageData>

export interface InitionalValues {
  _id: string
  role: UserRole
  name: string
  email: string
  phone: string
  plan: string
  interests: string[]
  company: string
  bio: string
  city: string
}
type _guard = JsonGuard<InitionalValues>