import { FastifyRequest, FastifyReply } from 'fastify'
import { validationError } from '../../common/errors'
import { StorageService } from './storage.service'


export function createStorageController( service: StorageService) {
  return {
    getFolderData(request: FastifyRequest<{ Params: { id: string } }>) {
      return service.getFolderData(request.params.id)
    },
  }

}

export type FoldersController = ReturnType<typeof createStorageController>