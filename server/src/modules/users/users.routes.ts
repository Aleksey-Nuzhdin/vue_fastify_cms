import { FastifyInstance } from 'fastify'
import { requireAdmin, requireVereficator } from './../../common/middlewares/authRole.guard'
import { createUsersService } from './users.service'
import { createUsersController } from './users.controller'
import { createUsersRepository } from './users.repository'
import { CreateUserDto, GetUsersQuery } from './users.types'

export async function usersRoutes(app: FastifyInstance) {
  const repo = createUsersRepository(app.mongo.db)
  const service = createUsersService(repo)
  const controller = createUsersController(service)

  app.register(async (adminApp) => {
    adminApp.addHook('preHandler', requireAdmin)

    adminApp.get('/all', controller.getAll)
    adminApp.post('/create', controller.create)
    adminApp.delete('/delete/:id', controller.delete)
    adminApp.patch('/update/:id', controller.update)


    
    // adminApp.get('/item/:id', controller.getById)
    // adminApp.get('/list', controller.getList)
  })

  app.register(async (vereficatorApp) => {
    vereficatorApp.addHook('preHandler', requireVereficator)

    vereficatorApp.get('/item/:id', controller.getById)
    vereficatorApp.get('/list', controller.getList)
    // vereficatorApp.patch('/update/:id', controller.update)
  })
} 