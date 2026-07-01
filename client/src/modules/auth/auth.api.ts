import { fetcher } from '@/shared/api'
import type { LoginRequest, LoginResponse, ProfileResponse, RegistrationDto, RegistrationResponse, RequestForgotPassword, RequestSetPasswordWithCode } from './auth.types'


export const authApi = {
  setPasswordWithCode: (data: RequestSetPasswordWithCode) =>
    fetcher.post<LoginResponse>('/auth/reset-password-code', data),

  forgotPassword: (data: RequestForgotPassword) =>
    fetcher.post<LoginResponse>('/auth/forgot-password', data),

  login: (data: LoginRequest) =>
    fetcher.post<LoginResponse>('/auth/login', data),

  checkEmail: (email: string) =>
    fetcher.get<{ available: boolean }>(`/auth/check-email/${email}`),

  register: (data: RegistrationDto) =>
    fetcher.post<RegistrationResponse>('/auth/registration', data),

  logout: () =>
    fetcher.post('/auth/logout'),

  getProfile: () =>
    fetcher.get<ProfileResponse>('/profile/me'),

  getLoginForm: () =>
    fetcher.get('/content/login'),
}
