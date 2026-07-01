import { FastifyInstance } from 'fastify'
import { usersRoutes } from './users/users.routes'

export async function registerModules(app: FastifyInstance) {
  app.register(usersRoutes, { prefix: '/api/users' })
}