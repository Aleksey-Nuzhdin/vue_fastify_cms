import { FastifyRequest, FastifyReply } from 'fastify'
import { validationError } from '../../../common/errors'

import type { FolderService } from './folders.service'
import type { CreateFolderDto, UpdateFolderDto } from './folders.types'

export function createFoldersController( service: FolderService ) {
  return {
    getAll: () => service.getAll(),
    getFolderView(request: FastifyRequest<{ Params: { id: string } }>) {
      return service.getFolderView(request.params.id)
    },
    getListByParentId(request: FastifyRequest<{ Params: { id: string } }>) {
      return service.getListByParentId(request.params.id)
    },
    async create(request: FastifyRequest<{ Body: CreateFolderDto }>, reply: FastifyReply) {
      const result = await service.create(request.body)
      return reply.code(201).send(result)
    },
    async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
      await service.delete(request.params.id)
      return reply.status(204).send()
    },
    update(request: FastifyRequest<{ Params: { id: string }; Body: UpdateFolderDto }>) {
      return service.update(request.params.id, request.body)
    }
  }

}

export type FoldersController = ReturnType<typeof createFoldersController>