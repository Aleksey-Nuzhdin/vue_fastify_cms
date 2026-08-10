import { Db, Collection } from 'mongodb'

import type { Lang } from '@shared/types/form'
import type { PageDataDto, PageDataMongoDB, FormConfigMongoDB } from './content.types'
import { toObjectId } from '../../common/utils/toObjectId'



export function createContentRepository(db: Db) {
  const collectionPages: Collection<PageDataMongoDB> = db.collection('content')
  const collectionConfigs: Collection<FormConfigMongoDB> = db.collection('formConfigs')

  return {
    getPageDataList: (query: { lang: Lang }) => {
      const filter: any = { lang: query.lang }
      filter.hide = { $ne: true } // showHidden убран как admin-only параметр (SEC-9) — при необходимости вернуть см. историю
      return collectionPages.find(filter).toArray()
    },
    getPageDataById: (id: string, lang: Lang) => collectionPages.findOne({ id, lang }),
    // type:'list' — справочники, не рендерящийся контент: не отдаём в рендер секций страницы
    getPageDataByPage: (page: string, lang: Lang) =>
      collectionPages.find({ page, lang, type: { $ne: 'list' } }).toArray(),
    getConfigList: (lang: Lang, page?: boolean) => {
      const filter: any = { lang }
      if (page != null) filter.page = page
      return collectionConfigs.find(filter).toArray()
    },
    getConfigById: (id: string, lang: Lang, page?: boolean) => {
      const filter: any = { id, lang }
      if (page != null) filter.page = page
      return collectionConfigs.findOne(filter)
    },
    updatePageData: async (id: string, data: PageDataDto) => {      
      const updatedPage = {
        ...data,
        updatedAt: +new Date
      }
      return collectionPages.findOneAndUpdate(
        { _id: toObjectId(id, 'Page id') },
        { $set: updatedPage },
        { returnDocument: 'after' }
      )
    }
  }
}

export type ContentRepository = ReturnType<typeof createContentRepository>
