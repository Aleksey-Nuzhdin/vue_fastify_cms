import path from 'path'
import { FastifyPluginAsync } from 'fastify'
import { usersRoutes } from '../modules/users/users.routes'
import { authRoutes } from '../modules/auth/auth.routes'
import { storageRouter } from '../modules/storage/storage.routes'
import { contentRoutes } from '../modules/content/content.routes'
import { profileRoutes } from '../modules/profile/profile.routes'
import { uploadRoutes } from '../modules/upload/upload.routes'
import { reportsRoutes } from '../modules/reports/reports.routes'

export const routes: FastifyPluginAsync = async (app) => {
  app.register(async () => {
    app.register(usersRoutes, { prefix: '/users' })
    app.register(authRoutes, { prefix: '/auth' })
    app.register(storageRouter, { prefix: '/storage' }) //files | folder
    app.register(contentRoutes, { prefix: '/content' }) //data | config
    app.register(profileRoutes, { prefix: '/profile' })
    app.register(reportsRoutes, { prefix: '/reports' })
  }, { prefix: '/api' })
  
  app.register(uploadRoutes, { prefix: '/upload' })

  app.get('/health', async () => ({ status: 'ok' }))

  app.setNotFoundHandler((request, reply) => {
    if (request.method === 'GET' && !request.url.startsWith('/api/') && !request.url.startsWith('/upload/')) {
      return reply.sendFile('index.html', path.join(process.cwd(), 'public'))
    }
    return reply.code(404).send({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Not found' },
    })
  })
}