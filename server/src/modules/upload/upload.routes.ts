import type { FastifyInstance } from 'fastify'
import { createUploadController } from './upload.controller'
import { createUploadService } from './upload.service'

export async function uploadRoutes(app: FastifyInstance) {
  const service = createUploadService()
  const controller = createUploadController(service)

  app.get('/images/*', controller.getImage)
  app.get('/users/avatars/*', controller.getImage)
  app.get('/*', controller.getFile)
}
