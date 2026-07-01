import type { Lang } from '@shared/types/form'
import { ContentRepository } from "./content.repository"
import type { PageDataDto } from "./content.types"

export function createContentService(repo: ContentRepository) {
  return {
    getPageDataList: (query: { showHidden?: boolean; lang: Lang }) => repo.getPageDataList(query),
    getPageDataById: (id: string, lang: Lang) => repo.getPageDataById(id, lang),
    getPageDataByPage: (page: string, lang: Lang) => repo.getPageDataByPage(page, lang),
    getFormConfigList: (lang: Lang, page?: boolean) => repo.getConfigList(lang, page),
    getFormConfigById: (id: string, lang: Lang, page?: boolean) => repo.getConfigById(id, lang, page),
    updatePageData: (id: string, data: PageDataDto) => repo.updatePageData(id, data),
  }
}

export type ContentService = ReturnType<typeof createContentService>
