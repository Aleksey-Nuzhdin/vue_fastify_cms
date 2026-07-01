import { FastifyInstance } from 'fastify'

import { createContentRepository } from './content.repository'
import { createContentService } from './content.service'
import { createContentController } from './content.controller'
import { guardAdmin } from '../../common/middlewares/authRole.guard'

import type { PageDataDto } from './content.types'


export async function contentRoutes(app: FastifyInstance) {
    const repo = createContentRepository(app.mongo.db)
    const service = createContentService(repo)
    const controller = createContentController(service)

    app.get('/data/list', controller.getPageDataList)
    app.get('/data/page/:page', controller.getPageDataByPage)
    app.get('/data/item/:id', controller.getPagesDataById)
    app.get('/config/list', controller.getFormConfigList)
    app.get('/config/item/:id', controller.getFormConfigById)
    app.patch<{ Params: { id: string }, Body: PageDataDto }>('/data/update/:id', guardAdmin, controller.updatePageData)
} 