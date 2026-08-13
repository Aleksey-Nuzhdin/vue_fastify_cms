import type { UserRole, UserBase } from './user.types.shared'

//порпавить на нормальный payload
export interface AuthUser extends Omit<UserBase, 'password'>{}

export interface LoginRequest {
  email: string
  password: string
  remember?: boolean
}

export interface LoginResponse {
  accessToken: string
}
export interface RegistrationResponse {
  accessToken: string
  // false — юзер создан и токены выданы, но приветственное письмо не ушло
  emailSent: boolean
}

export interface RefreshResponse {
  accessToken: string
}

export interface RegistrationDto {
  email: string
  password: string
  name: string
  phone: string
  plan: string
  interests: string[]
  company: string
  bio: string
  city: string
}

export interface ChangePasswordDto {
  oldPassword: string
  newPassword: string
}

export interface ResponseChangePassword {
  accessToken: string
}

export interface RequestForgotPassword {
  email: string
}
export interface RequestSetPasswordWithCode {
  email: string
  code: string
  newPassword: string
}

