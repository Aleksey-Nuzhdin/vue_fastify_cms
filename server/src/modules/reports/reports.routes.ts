import { FastifyInstance } from 'fastify'
import { requireAuth, requireAdmin } from '../../common/middlewares/authRole.guard'

import { createReportsService } from './reports.service'
import { createReportsController } from './reports.controller'
import { createReportsRepository } from './reports.repository'

export async function reportsRoutes(app: FastifyInstance) {
  const repo = createReportsRepository(app.mongo.db)
  const service = createReportsService(repo)
  const controller = createReportsController(service)

  app.addHook('preHandler', requireAuth)

  
  app.get('/list', controller.findList)
  app.get('/item/:id', controller.findById)
  app.post('/create', controller.create)
  app.patch('/update/:id', controller.update)
  app.delete('/delete/:id', controller.delete)

  app.register(async (adminApp) => {
    adminApp.addHook('preHandler', requireAdmin)
    adminApp.get('/all', controller.findAll)
  })
}
