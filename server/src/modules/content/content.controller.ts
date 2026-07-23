import { FastifyRequest } from 'fastify'
import { ContentService } from './content.service'
import { notFoundError } from '../../common/errors'
import type { Lang } from '@shared/types/form'
import type { PageDataDto } from './content.types'

const DEFAULT_LANG: Lang = 'ru'

type LangQuery = { lang?: string }

function parseLang(raw?: string): Lang {
  if (raw === 'ru' || raw === 'en') return raw
  return DEFAULT_LANG
}

export function createContentController(service: ContentService) {
  return {
    getPageDataList: (request: FastifyRequest<{ Querystring: LangQuery }>) => {
      const lang = parseLang(request.query.lang)
      return service.getPageDataList({ lang })
    },
    getFormConfigList: (request: FastifyRequest<{ Querystring: LangQuery & { page?: string } }>) => {
      const lang = parseLang(request.query.lang)
      const page = request.query.page === 'true' ? true : request.query.page === 'false' ? false : undefined
      
      return service.getFormConfigList(lang, page)
    },
    getFormConfigById: (request: FastifyRequest<{ Params: { id: string }; Querystring: LangQuery & { page?: string } }>) => {
      const lang = parseLang(request.query.lang)
      const page = request.query.page === 'true' ? true : request.query.page === 'false' ? false : undefined
      return service.getFormConfigById(request.params.id, lang, page)
    },
    getPagesDataById: (request: FastifyRequest<{ Params: { id: string }; Querystring: LangQuery }>) => {
      const lang = parseLang(request.query.lang)
      return service.getPageDataById(request.params.id, lang)
    },
    getPageDataByPage: (request: FastifyRequest<{ Params: { page: string }; Querystring: LangQuery }>) => {
      const lang = parseLang(request.query.lang)
      return service.getPageDataByPage(request.params.page, lang)
    },
    updatePageData: async (request: FastifyRequest<{ Params: { id: string }, Body: PageDataDto }>) => {
      const result = await service.updatePageData(request.params.id, request.body)
      if (!result) throw notFoundError('Page', request.params.id)
      return result
    },
  }
}
