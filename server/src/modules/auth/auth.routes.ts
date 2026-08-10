import type { FastifyInstance } from 'fastify';
import { createAuthController } from './auth.controller';
import { createAuthService } from './auth.service';
import { createUsersRepository } from '../users/users.repository';
import { guardAuth } from 'src/common/middlewares/authRole.guard';
import type { ChangePasswordDto } from './auth.types';

const configRL = (count:number) => ({ config: { rateLimit: { max: count, timeWindow: '1 minute' }}})

export async function authRoutes(app: FastifyInstance) {
  const usersRepo = createUsersRepository(app.mongo.db)
  const service = createAuthService(app.jwt, app.redis, usersRepo)
  const controller = createAuthController(service)

  app.get('/check-email/:email', configRL(30), controller.checkEmail)

  app.post('/login', configRL(20), controller.login)
  app.post('/registration', configRL(5), controller.registration)
  app.post('/refresh', controller.refresh)

  app.post('/forgot-password', configRL(10), controller.forgotPassword)
  app.post('/reset-password-code', configRL(5), controller.resetPasswordWithCode)
  
  app.post('/logoutAll', guardAuth, controller.logoutAll)
  app.post('/logout', guardAuth, controller.logout)
  app.patch<{ Body: ChangePasswordDto }>('/change-password', guardAuth, controller.changePassword)
}