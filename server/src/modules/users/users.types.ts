import { ObjectId } from 'mongodb'
export type { UserRole, CreateUserDto, UpdateUserDto, GetUsersQuery, ReturnUser, ReturnUserList } from '@shared/types'
import type { UserBase, UserRole, CreateUserDto, UpdateUserDto} from '@shared/types'

export interface User extends Omit<UserBase<ObjectId>, '_id'> {}

interface UserWritable extends ExplicitPick<User,
  'role' | 'email' |'name' | 'password' |
  'phone'| 'city' | 'interests' | 'plan' |
  'company' | 'bio',

  'avatar'
> {}
export interface UserDocument extends User {
  createdAt: number
  updatedAt: number
}
export interface CreateUserPayload extends UserWritable {}
export interface CreateUserData extends UserWritable {}


export interface UpdateUserPayload extends Partial<Omit<UserWritable, 'email'|'password'>>{}
export interface UpdateUserData extends Partial<Omit<UserWritable, 'email'|'password'>>{}

