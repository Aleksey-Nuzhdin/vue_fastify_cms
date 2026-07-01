import type { FastifyInstance } from 'fastify';
import { createAuthController } from './auth.controller';
import { createAuthService } from './auth.service';
import { createUsersRepository } from '../users/users.repository';
import { guardAuth, guardAdmin } from 'src/common/middlewares/authRole.guard';
import type { ChangePasswordDto } from './auth.types';


export async function authRoutes(app: FastifyInstance) {
  const usersRepo = createUsersRepository(app.mongo.db)
  const service = createAuthService(app.jwt, app.redis, usersRepo)
  const controller = createAuthController(service)

  app.get('/check-email/:email', controller.checkEmail)

  app.post('/login', controller.login)
  app.post('/registration', controller.registration)
  app.post('/refresh', controller.refresh)
  app.post('/forgot-password', controller.forgotPassword)
  app.post('/reset-password-code', controller.resetPasswordWithCode)
  
  app.post('/logoutAll', guardAuth, controller.logoutAll)
  app.post('/logout', guardAuth, controller.logout)
  app.get<{ Params: { email: string } }>('/get-code/:email', guardAdmin, controller.getCode)
  app.patch<{ Body: ChangePasswordDto }>('/change-password', guardAuth, controller.changePassword)
}