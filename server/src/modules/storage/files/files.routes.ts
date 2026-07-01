import { FastifyInstance } from 'fastify'
import { requireAdmin } from '../../../common/middlewares/authRole.guard'
import { createFilesService } from './files.service'
import { createFilesController } from './files.controller'
import { createFilesRepository } from './files.repository'
import { createFoldersRepository } from '../folders/folders.repository'

export async function filesRouter(app: FastifyInstance) {
  const repo = createFilesRepository(app.mongo.db)
  const folderRepo = createFoldersRepository(app.mongo.db)
  const service = createFilesService(repo, folderRepo)
  const controller = createFilesController(service)

  app.register(async (instance) => {
    instance.addHook('preHandler', requireAdmin)

    instance.get('/all', controller.getAll)
    instance.get('/folder/:id', controller.getListByFolderId)
    instance.get('/item/:id', controller.getById)
    instance.post('/create', controller.create)
    instance.patch('/update/:id', controller.update)
    instance.delete('/delete/:id', controller.delete)
  })
  //TD Добавить обновление файла ( с сохранением обсалютного пути )
}