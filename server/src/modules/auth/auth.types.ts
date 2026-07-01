// common/auth/auth.types.ts
import { UserRole } from '../users/users.types'
import type { AuthUser, UserBase } from '@shared/types'
export type {LoginRequest, LoginResponse, RegistrationDto, AuthUser} from '@shared/types'

export interface ResponseRegister {
  accessToken: string
}

export interface PayloadAccess extends Pick<UserBase, 'name' | 'email' | 'role' | '_id'> {
  type: 'access'
  uuid: string
}

export interface PayloadRefresh extends Pick<UserBase, '_id'> {
  type: 'refresh'
  uuid: string
  remember: boolean
}

export interface BodyLogin { 
  email: string
  password: string
  rememberMe?: boolean 
}

export type { ChangePasswordDto } from '@shared/types/auth.types.shared'