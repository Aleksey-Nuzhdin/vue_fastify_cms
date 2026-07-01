import { FastifyInstance } from 'fastify'
import { requireManager } from '../../common/middlewares/authRole.guard'
import { filesRouter } from './files/files.routes'
import { folderRouter } from './folders/folders.routes'
import { createFilesRepository } from './files/files.repository'
import { createFoldersRepository } from './folders/folders.repository'
import { createStorageService } from './storage.service'
import { createStorageController } from './storage.contraller'


export async function storageRouter(app: FastifyInstance) {
  const repoFile = createFilesRepository(app.mongo.db)
  const repoFolder = createFoldersRepository(app.mongo.db)
  const service = createStorageService(repoFolder, repoFile)
  const contraller = createStorageController(service)

  app.addHook('preHandler', requireManager)

  app.get('/folderData/:id', contraller.getFolderData)
  app.register(filesRouter, { prefix: '/files' })
  app.register(folderRouter, { prefix: '/folders' })

  
  // const repo = createUsersRepository(app.mongo.db)
  // const service = createUsersService(repo)
  // const controller = createUsersController(service)
  

} 