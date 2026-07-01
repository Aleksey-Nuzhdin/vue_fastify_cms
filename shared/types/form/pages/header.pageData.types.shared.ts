import type { JsonGuard } from '../../json.type.shared'
import type { PageData as Page } from '../form.types.shared'

type SectionItem = {
  title: string,
  link: string,
}
export type HeaderData = {
  sections:SectionItem[]
}
export type PageData = Page<HeaderData>

export type InitionalValues = {
  sections:SectionItem[]
}
type _guard = JsonGuard<InitionalValues>