import { FastifyInstance } from 'fastify'
import { guardAdmin } from '../../../common/middlewares/authRole.guard'
import { createFoldersService } from './folders.service'
import { createFoldersController } from './folders.controller'
import { createFoldersRepository } from '../folders/folders.repository'
import { createFilesRepository } from '../files/files.repository'

// import type { CreateFileBody } from './files.types'


export async function folderRouter(app: FastifyInstance) {
  const repo = createFoldersRepository(app.mongo.db)
  const filesRepo = createFilesRepository(app.mongo.db)
  const service = createFoldersService(repo, filesRepo)
  const controller = createFoldersController(service)

  app.get('/all', guardAdmin, controller.getAll)
  app.get('/item/:id', controller.getFolderView)
  app.get('/parent/:id', controller.getListByParentId)
  app.post('/create', controller.create)
  app.delete('/delete/:id', controller.delete)
  app.patch('/update/:id', controller.update)
  //TD Добавить обновление файла ( с сохранением обсалютного пути )
}