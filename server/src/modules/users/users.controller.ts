import { FastifyRequest, FastifyReply } from 'fastify'
import { UsersService } from './users.service'
import { CreateUserDto, UpdateUserData, GetUsersQuery } from './users.types'

interface IdParam {
  id: string
}

export function createUsersController(service: UsersService) {
  return {
    getAll: async () => {
      return service.getAll()
    },

    getById: async (request: FastifyRequest<{ Params: IdParam }>) => {
      return service.getById(request.params.id)
    },

    getList: async (request: FastifyRequest<{ Querystring: GetUsersQuery }>) => {
      return service.findList(request.query, request.user)
    },

    create: async (request: FastifyRequest<{ Body: CreateUserDto }>, reply: FastifyReply) => {
      const user = await service.create(request.body, request.user)
      return reply.status(201).send(user)
    },

    update: async (request: FastifyRequest<{ Params: IdParam; Body: UpdateUserData }>) => {
      return service.update(request.params.id, request.body, request.user)
    },

    delete: async (request: FastifyRequest<{ Params: IdParam }>, reply: FastifyReply) => {
      await service.delete(request.params.id)
      return reply.status(204).send()
    },
  }
}

export type UsersController = ReturnType<typeof createUsersController>