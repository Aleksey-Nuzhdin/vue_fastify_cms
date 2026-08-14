import { FastifyRequest, FastifyReply } from 'fastify'
import { ProfileService } from './profile.service'
import { Readable } from 'stream'
import { unauthorizedError } from '../../common/errors'
import type { UpdateProfileDto, ChangePasswordDto } from './profile.types'
import type { MultipartFile } from '@fastify/multipart'

export function createProfileController(service: ProfileService) {
  return {
    async getProfile(request: FastifyRequest) {
      const userId = request.user._id
      return service.getProfile(userId)
    },

    async updateProfile(request: FastifyRequest<{ Body: UpdateProfileDto }>) {
      const userId = request.user._id
      return service.updateProfile(userId, request.body)
    },

    async uploadAvatar(request: FastifyRequest, reply: FastifyReply):Promise<string> {
      const userId = request.user._id
      // Размер файла ограничен общим лимитом (app.ts), здесь добавлен только
      // files: 1 — в форме аватара второму файлу взяться неоткуда.
      const parts = request.parts({ limits: { files: 1 } })

      let file: MultipartFile | undefined

      for await (const part of parts) {
        if (part.type === 'file') {
          const buffer = await part.toBuffer()
          file = part
          file.file = Readable.from(buffer) as typeof file.file
          break
        }
      }

      return service.uploadAvatar(userId, file)
    },
  }
}

export type ProfileController = ReturnType<typeof createProfileController>
