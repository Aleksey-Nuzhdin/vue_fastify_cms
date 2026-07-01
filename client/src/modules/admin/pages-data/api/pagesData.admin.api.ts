import { fetcher } from '@/shared/api'
import type { PageData, FormConfig } from '@/shared/types/form.types'
import type { Lang } from '@shared/types/form'

type PageDataWithId = PageData & { _id: string }
type FormConfigWithId = FormConfig & { _id: string }

export const pagesDataAdminApi = {
  fetchList: (): Promise<PageDataWithId[]> =>
    fetcher.get('/content/data/list'),
  fetchConfigList: (lang: Lang, page?: boolean): Promise<FormConfigWithId[]> =>
    fetcher.get(`/content/config/list?lang=${lang}` + (page !== null ? `&page=${page}` : '')),
  fetchById: (id: string, lang?: Lang): Promise<PageDataWithId> =>
    fetcher.get('/content/data/item/' + id + (lang ? `?lang=${lang}` : '')),
  update: (mongoId: string, data: Partial<PageData>): Promise<PageDataWithId> =>
    fetcher.patch('/content/data/update/' + mongoId, data),
}
