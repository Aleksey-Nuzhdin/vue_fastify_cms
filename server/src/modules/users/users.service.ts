
import { UsersRepository } from './users.repository'
import { notFoundError, conflictError, validationError } from '../../common/errors'
import { buildUpdate } from '../../common/utils/buildUpdate'
import type { ObjectId } from 'mongodb'

import bcrypt from 'bcrypt'

import type { 
  CreateUserPayload,
  CreateUserData,
  UpdateUserPayload, 
  UpdateUserData, 
  ReturnUser, 
  GetUsersQuery 
} from './users.types'
import type { PayloadAccess } from '../auth/auth.types'


export function toPublicUser(u: ReturnUser<ObjectId | string>): ReturnUser<string> {
  return {
    _id: u._id.toString(),
    email: u.email,
    role: u.role,
    avatar: u.avatar,
    name: u.name,
    phone: u.phone,
    plan: u.plan,
    interests: u.interests,
    company: u.company,
    bio: u.bio,
    city: u.city,
  }
}


export function createUsersService(repo: UsersRepository) {
  return {
    getAll: async () =>{

      const list = await repo.findAll()

      return list.map( el => toPublicUser(el) )

    },

    getById: async (id: string) => {
      const user = await repo.findById(id)
      if( !user ) throw notFoundError('User', id)

      return toPublicUser(user)
    },

    findList: async (params: GetUsersQuery)=>{
      const {list, count} = (await repo.findList(params))[0]
      return { 
        count,
        list: list.map( el => toPublicUser(el) ),
      }
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

      const createdUser = await repo.create(createUser)

      if( !createdUser ) throw conflictError('User not created')
    
      return toPublicUser(createdUser)
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

      const userUpdated = await repo.update(id, res)

      if( !userUpdated ) throw conflictError('User not updated')
      
      return toPublicUser(userUpdated)
    },

    delete: async (id: string) => {
      const user = await repo.findById(id)
      if( !user ) throw notFoundError('User', id)

      return repo.delete(id)
    },
  }
}

export type UsersService = ReturnType<typeof createUsersService>