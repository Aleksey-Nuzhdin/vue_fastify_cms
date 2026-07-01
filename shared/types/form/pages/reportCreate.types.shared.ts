import type { JsonGuard } from '../../json.type.shared'
import type { PageData as Page } from '../form.types.shared'


export type ReportCreatePageData = {}

export type PageData = Page<ReportCreatePageData>

export interface InitionalValues {
  title:string,
  description:string,
  authors:[],
  fileAnnotation:string,
  section:string,
}
type _guard = JsonGuard<InitionalValues>