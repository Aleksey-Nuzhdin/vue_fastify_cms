
import { UsersRepository } from './users.repository'
import { notFoundError, conflictError, validationError } from '../../common/errors'
import { buildUpdate } from '../../common/utils/buildUpdate'

import bcrypt from 'bcrypt'

import type { CreateUserPayload,CreateUserData, UpdateUserPayload, UpdateUserData, ReturnUser, GetUsersQuery } from './users.types'
import type { PayloadAccess } from '../auth/auth.types'

export function createUsersService(repo: UsersRepository) {
  return {
    getAll: () => repo.findAll(),

    getById: async (id: string) => {
      const user = await repo.findById(id)
      if( !user ) throw notFoundError('User', id)

      return user
    },

    findList: async (params: GetUsersQuery, performedBy: PayloadAccess)=>{
      return (await repo.findList(params))[0]
    },

    create: async (data: CreateUserPayload, performedBy: PayloadAccess ) => {
      const existing = await repo.findByEmail(data.email)
      
      if( existing ) throw conflictError('Email already exists')
      if( !data.password ) throw validationError('Password is required')

      const hashPassword = await bcrypt.hash(data.password, 12)

      const role = (performedBy.role === 'admin' && data.role) || 'user'

      const createUser:CreateUserData = {
        ...data,
        role,
        password: hashPassword,
      }
    
      return repo.create(createUser)
    },

    update: async (id: string, data: UpdateUserPayload, performedBy: PayloadAccess) => {
      const user = await repo.findById(id)
      if( !user ) throw notFoundError('User', id)

      //Проверяем, достаточно ли прав для редактирования
      const role = (performedBy.role === 'admin' && data.role) || null

      // if( data.password ){
      //   const newPassword = bcrypt.hash(data.password, 12)
      //   data.password = (performedBy.role === 'admin' && ) : null
      // }
      

      //Если админ или редактирует сам себя, то можно поменять
      if( !(performedBy.role === 'admin' || performedBy._id === id) ){
        throw conflictError('Access denied')
      }

      const res = buildUpdate<UpdateUserData>({
        name: data.name ?? null,
        role: role ?? null,
        phone: data.phone ?? null,
        plan: data.plan ?? null,
        interests: data.interests ?? null,
        company: data.company ?? null,
        bio: data.bio ?? null,
        city: data.city ?? null,
      })
      
      
      return repo.update(id, res)
    },

    delete: async (id: string) => {
      const user = await repo.findById(id)
      if( !user ) throw notFoundError('User', id)

      return repo.delete(id)
    },
  }
}

export type UsersService = ReturnType<typeof createUsersService>