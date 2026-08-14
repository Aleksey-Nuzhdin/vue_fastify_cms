import { 
  unauthorizedError,
  conflictError,
  notFoundError,
  validationError,
  internalError 
} from '../../common/errors'
import { UsersRepository } from '../users/users.repository'
import type { UpdateProfileDto, ProfileResponse, UpdateProfileResponse} from './profile.types'
import { fsStorageService } from 'src/services/fsStorage.service'
import type { MultipartFile } from '@fastify/multipart'

import { buildUpdate } from '../../common/utils/buildUpdate'
import { assertImageSize, assertIsImage } from '../../common/utils/images.utils'
import { toPublicUser } from '../users/users.service'

export function createProfileService(repository: UsersRepository) {
  const fsStorage = fsStorageService()

  return {
    async getProfile(userId: string):Promise<ProfileResponse> {
      const user = await repository.findById(userId)
      if( !user ) throw notFoundError('User', userId)
      return {
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        phone: user.phone,
        city: user.city,
        interests: user.interests,
        company: user.company,
        bio: user.bio,
        plan: user.plan,
      }
    },

    async updateProfile(userId: string, data: UpdateProfileDto):Promise<UpdateProfileResponse> {
      const user = await repository.findById(userId)
      if( !user ) throw notFoundError('User', userId)

      const { name, avatar, phone, city, interests, company, bio, plan } = data

      const dataUpdate = buildUpdate<UpdateProfileDto>({
        name: name ?? null,
        avatar: avatar ?? null,
        phone:phone ?? null,
        city:city ?? null,
        interests:interests ?? null,
        company:company ?? null,
        bio:bio ?? null,
        plan:plan ?? null,
      })
      const updatedUser = await repository.update(user._id.toString(), dataUpdate)
      if( !updatedUser ) throw conflictError('User not updated')
      
      // TODO: Новый токен?
      return toPublicUser(updatedUser)
    },

    async uploadAvatar(userId: string, file: MultipartFile | undefined) {
      if(!file) throw validationError('File is required')

      const user = await repository.findById(userId)
      if( !user ) throw notFoundError('User', userId)

      assertIsImage(file)
      await assertImageSize(file)

      // Сохранение файла
      const { folderPath } = await fsStorage.saveFileInFs(file, 'users/avatars')

      const deletePath = user.avatar.replace('/upload', '')
      if(deletePath.startsWith('/users/avatars/')){
        const deleteDir = deletePath.replace('/original.webp', '')

        await fsStorage.deleteFolder(deleteDir)
      }

      // Обновление пользователя
      const dataUpdate = { avatar: `${folderPath}/original.webp` }
      
      const updatedUser = await repository.update(user._id.toString(), dataUpdate)
      if (!updatedUser) throw conflictError('User not updated')
      return dataUpdate.avatar
    },
  }
}

export type ProfileService = ReturnType<typeof createProfileService>
