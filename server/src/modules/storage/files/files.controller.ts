import { Readable } from 'stream'
import { FastifyRequest, FastifyReply } from 'fastify'

import type { FilesService } from './files.service'
import type { MultipartFile } from '@fastify/multipart'
import type {CreateFilePayload, UpdateFilePayload } from './files.types'
import { buildUpdate } from 'src/common/utils/buildUpdate'

export function createFilesController( service: FilesService ) {
  return {
    getAll: () => service.getAll(),
    getById(request: FastifyRequest<{ Params: { id: string } }>) {
      return service.getById(request.params.id)
    },
    getListByFolderId(request: FastifyRequest<{ Params: { id: string } }>) { 
      return service.getListByFolderId(request.params.id)
    },
    async create(request: FastifyRequest, reply: FastifyReply) {
      const parts = request.parts()

      let file: MultipartFile | undefined
      const body: Record<string, string> = {}

      for await (const part of parts) {
        if (part.type === 'file') {
          const buffer = await part.toBuffer()
          file = part
          file.file = Readable.from(buffer) as typeof file.file
        } else {
          body[part.fieldname] = part.value as string
        }
      }

      const payloadData:CreateFilePayload = {
        folderId: body.folderId,
        name: body.name,
        info: body.info || '',
      }

      const result = await service.create(file, payloadData)
      return reply.code(201).send(result)
    },
    async update(request: FastifyRequest<{ Params: { id: string }; Body: UpdateFilePayload }>, reply: FastifyReply) {
      const id = request.params.id
      const parts = request.parts()

      let file: MultipartFile | undefined
      const body: Record<string, string> = {}

      for await (const part of parts) {
        if (part.type === 'file') {
          const buffer = await part.toBuffer()
          file = part
          file.file = Readable.from(buffer) as typeof file.file
        } else {
          body[part.fieldname] = part.value as string
        }
      }

      const payloadData = buildUpdate<UpdateFilePayload>({
        folderId: body.folderId ?? null,
        name: body.name ?? null,
        info: body.info ?? null,
      })


      const result = await service.update(id, payloadData, file)
      return reply.code(200).send(result)
    },
    delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
      return service.delete(request.params.id)
    }
  }

}

