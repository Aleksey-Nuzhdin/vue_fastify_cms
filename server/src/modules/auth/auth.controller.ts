import { FastifyRequest, FastifyReply } from 'fastify'
import { AuthService } from './auth.service'
import { unauthorizedError } from '../../common/errors'
import authConfig from '../../configs/auth.config'
import type { LoginRequest, RegistrationDto, ResponseRegister, ChangePasswordDto } from './auth.types'

const setCookieRefreshToken = ( reply: FastifyReply, token:string, remember: boolean)=>{
  reply.setCookie('refreshToken', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/api/auth',
    ...(remember && {maxAge: authConfig.refreshTtlSeconds})
  })
}

const removeCookieRefreshToken = ( reply: FastifyReply )=>{  
  reply.setCookie('refreshToken', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: 0
  })
}

export function createAuthController( service: AuthService ) {
  return {
    async forgotPassword(request: FastifyRequest<{ Body: { email: string } }>, reply: FastifyReply) {
      const { email } = request.body
      return await service.forgotPassword(email)
    },
    async resetPasswordWithCode(request: FastifyRequest<{ Body: { email: string; code: string; newPassword: string } }>, reply: FastifyReply) {
      const { email, code, newPassword } = request.body
      return await service.resetPasswordWithCode({email, code, newPassword})
    },
    async changePassword(request: FastifyRequest<{ Body: ChangePasswordDto }>, reply: FastifyReply) {
      const userId = request.user._id
      const { oldPassword, newPassword } = request.body
      const oldRefreshToken = request.cookies.refreshToken

      if (!oldRefreshToken) throw unauthorizedError('No refresh token')

      const {accessToken, refreshToken, remember} = await service.
        changePassword({userId, oldPassword, newPassword, refreshToken:oldRefreshToken})

      setCookieRefreshToken(reply, refreshToken, remember)
      return { accessToken }
    },
    async checkEmail(request: FastifyRequest<{ Params: { email: string } }>, reply: FastifyReply) {
      const { email } = request.params
      return service.checkEmail(email)
    },

    async login(request: FastifyRequest<{ Body: LoginRequest }>, reply: FastifyReply ) {
      const { email, password, remember = false } = request.body
      const { accessToken, refreshToken } = await service.login( email, password, remember )

      setCookieRefreshToken(reply, refreshToken, remember)

      return { accessToken }
    },

    async refresh(request: FastifyRequest, reply: FastifyReply) {    
      const refreshToken = request.cookies.refreshToken    
      
      if (!refreshToken) throw unauthorizedError('No refresh token')

      const tokens = await service.refresh(refreshToken)

      if (!tokens) throw unauthorizedError('Invalid refresh token')

      // Обновляем cookie
      setCookieRefreshToken(reply, tokens.refreshToken, tokens.remember)
 
      reply.send({ accessToken: tokens.accessToken })
    },

    async logout(request: FastifyRequest, reply: FastifyReply) {
      const refreshToken = request.cookies.refreshToken
      
      if (!refreshToken) throw unauthorizedError('No refresh token')

      const accessToken = request.headers.authorization?.split(' ')[1]
      removeCookieRefreshToken(reply)

      await service.logout(refreshToken, accessToken)
    },

    async logoutAll(request: FastifyRequest, reply: FastifyReply) {
      const userId = request.user._id
      if (!userId) throw unauthorizedError('Unauthorized')

      await service.logoutAll(userId)
    },

    async registration(
      request: FastifyRequest<{ Body: RegistrationDto }>, 
      reply: FastifyReply
    ): Promise<ResponseRegister> {
      const { accessToken, refreshToken } = await service.registration(request.body)

      setCookieRefreshToken(reply, refreshToken, false)
      
      return { accessToken }
    },

    // async getMyProfile(request: FastifyRequest, reply: FastifyReply){
    //   const userId = request.user._id

    //   if (!userId) throw unauthorizedError('Unauthorized')

    //   return service.getMyProfile(userId)
    // }
  }
}