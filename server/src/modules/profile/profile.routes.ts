import { FastifyInstance } from 'fastify'
import { guardAuth } from '../../common/middlewares/authRole.guard'
import { createUsersRepository } from '../users/users.repository'
import { createProfileService } from './profile.service'
import { createProfileController } from './profile.controller'
import type { UpdateProfileDto, ChangePasswordDto } from './profile.types'

export async function profileRoutes(app: FastifyInstance) {
  const usersRepo = createUsersRepository(app.mongo.db)
  const service = createProfileService(usersRepo)
  const controller = createProfileController(service)

  app.get('/me', guardAuth, controller.getProfile)
  app.patch<{ Body: UpdateProfileDto }>('/update', guardAuth, controller.updateProfile)
  app.patch<{ Body: UpdateProfileDto }>('/upload/avatar', guardAuth, controller.uploadAvatar)
}
