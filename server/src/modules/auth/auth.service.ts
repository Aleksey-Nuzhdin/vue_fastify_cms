import { unauthorizedError, conflictError, cooldownError, notFoundError, validationError, internalError } from '../../common/errors'
import { PayloadAccess, PayloadRefresh, RegistrationDto } from './auth.types'
import { User, CreateUserData, UserDocument, ReturnUser } from '../users/users.types'
import type { ObjectId } from 'mongodb'
import { UsersRepository } from '../users/users.repository'
import { JWT, SignOptions } from '@fastify/jwt'
import { FastifyRedis } from '@fastify/redis'
import bcrypt from 'bcrypt'
import { randomUUID } from 'crypto' 
import { mailer } from 'src/services/mailer/mailer'
import type { TemplateData, DataMailer } from 'src/services/mailer/mailer.type'
import { buildUpdate } from '../../common/utils/buildUpdate'


import authConfig from '../../configs/auth.config'

type AuthUserFromToken = PayloadAccess | PayloadRefresh

type changePassword = {userId:string, oldPassword:string, newPassword:string, refreshToken:string}

export function createAuthService( jwt:JWT, redis:FastifyRedis, usersRepository:UsersRepository ) {

  return {
    async getCode(email:string){
      return redis.get('forgotPassword:'+email)
    },
    async forgotPassword(email:string){
      const code = await redis.get('forgotPassword:'+email);
      if( code ) throw cooldownError()

      const user = await usersRepository.findByEmail(email)
      if( !user ) throw notFoundError('User', email)
      
      const codeStr = Math.floor(100000 + Math.random() * 900000)
      await redis.setex('forgotPassword:'+email, 300, codeStr) // 5 минут      

      const dataMailer:DataMailer = {email, subject:'Forgot password', text:`Code: ${codeStr}`}
      const template:TemplateData = {type:'forgotPassword', code:codeStr}

      try{
        await mailer(dataMailer, template)
        return true
      }catch(e:any){
        throw internalError(e?.message+''|| 'Mailer error')
      }
    },
    async resetPasswordWithCode({email, code, newPassword}:{email:string, code:string, newPassword:string}){
      const codeStr = await redis.get('forgotPassword:'+email)
      if( codeStr !== code ) throw validationError('Invalid code')

      const user = await usersRepository.findByEmail(email)
      if( !user ) throw notFoundError('User', email)
      
      const hashPassword = await bcrypt.hash(newPassword, 12)
      const updatedUser = await usersRepository.update(user._id.toString(), {password:hashPassword})
      if( !updatedUser ) throw conflictError('User not updated')

      redis.del('forgotPassword:'+email)

      await this.logoutAll( user._id.toString() )

      return true
    },
    async changePassword({userId, oldPassword, newPassword, refreshToken}:changePassword){
      const user = await usersRepository.findById(userId)
      if( !user ) throw notFoundError('User', userId)

      const isCorrectOldPassword = await bcrypt.compare(oldPassword, user.password)

      if( !isCorrectOldPassword ) throw validationError('Invalid credentials')
      
      const hashPassword = await bcrypt.hash(newPassword, 12)
      const updatedUser = await usersRepository.update(userId, {password:hashPassword})
      if( !updatedUser ) throw conflictError('User not updated')

      // Достаём remember ДО удаления всех токенов
      const payload:PayloadRefresh = jwt.verify(refreshToken)
      const { remember } = payload

      await this.logoutAll(userId)

      return this.getAccessAndRefreshTokens(updatedUser, remember)
      
    },
    signToken:(user: AuthUserFromToken, options?: Partial<SignOptions>)=> {
      return jwt.sign(user, options)
    },

    verifyToken:async (token: string) => {
      return jwt.verify<AuthUserFromToken>(token) // выбросит ошибку, если недействителен
    },

    async validateUser(email:string, password:string){
      const user = await usersRepository.findByEmail(email)  
      if( !user ) return null
      
      const isMatch = await bcrypt.compare(password, user.password)
      if( !isMatch ) return null

      return user
    },

    async getAccessAndRefreshTokens(user: UserDocument & {_id: ObjectId}, remember:boolean){ 
      const accessUuid = randomUUID()
      const refreshUuid = randomUUID()

      const accessUser:AuthUserFromToken = {
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        type: 'access',
        uuid: accessUuid
      }

      const refreshUser:AuthUserFromToken = {
        _id: user._id.toString(), 
        type:"refresh", 
        uuid:refreshUuid,
        remember
      }
      
      const accessToken = jwt.sign(
        accessUser, 
        { expiresIn: authConfig.acceessTtlStr }
      )

      const refreshToken = jwt.sign(
        refreshUser, 
        { expiresIn:authConfig.refreshTtlStr }
      )

      await redis.setex(
        `user:${user._id}:token:access:${accessUuid}`, 
        authConfig.acceessTtlSeconds, 
        ''
      )

      await redis.setex(
        `user:${user._id}:token:refresh:${refreshUuid}`, 
        authConfig.refreshTtlSeconds, 
        refreshToken
      )

      return { accessToken, refreshToken, remember }
    },

    async login(email:string, password:string, remember:boolean){
      const user = await this.validateUser(email, password)
      
      if( user === null ) throw unauthorizedError('Invalid credentials')
      
      return this.getAccessAndRefreshTokens(user, remember)
    },

    async refresh(refreshToken: string) {    
      // Проверяем подпись
      let payload: PayloadRefresh
      try {
        payload = jwt.verify(refreshToken)
      } catch {
        throw unauthorizedError('Invalid token')
      }
      
      // Проверяем что только _id (это refresh, не access)
      if( payload.type !== 'refresh' ) throw unauthorizedError('Invalid token')
      
      // Проверяем что токен есть в Redis (не отозван)
      const tokenFromRedis = await redis.get(`user:${payload._id}:token:refresh:${payload.uuid}`)
      
      // const exists = await redis.exists(`user:${payload._id}:token:refresh:${payload.uuid}`)

      if (!tokenFromRedis){
        //TD
        //Если инспектируется невалидный токен, подозреваем взлом
        //И отзываем все токены юзера
        // await this.logout(refreshToken)
        //требует создания семейства токенов
        throw unauthorizedError('Token revoked')
      }
    
      // Получаем актуального юзера
      const user = await usersRepository.findById(payload._id)
      if (!user) throw unauthorizedError('User not found')

      let payloadOld:PayloadRefresh = jwt.verify(tokenFromRedis)

      await redis.del(`user:${payload._id}:token:refresh:${payload.uuid}`)

      return this.getAccessAndRefreshTokens(user, payloadOld.remember)
    },

    async logout(refreshToken: string, accessToken: string) {
      let payloadRef: PayloadRefresh
      let payloadAcc: PayloadAccess
      try {
        payloadRef = jwt.verify(refreshToken)
        payloadAcc = jwt.verify(accessToken)
      } catch {
        return // Токен уже невалидный, ничего не делаем
      }

      await redis.del(`user:${payloadRef._id}:token:refresh:${payloadRef.uuid}`)
      await redis.del(`user:${payloadAcc._id}:token:access:${payloadAcc.uuid}`)
    },

    async logoutAll(userId: string) {
      const user = await usersRepository.findById(userId)
      if( !user ) throw notFoundError('User', userId)

      const keys = await redis.keys(`user:${userId}:token:*`)
      if (keys.length) await redis.del(...keys)
    },

    async checkEmail(email:string){
      if( !email ) throw validationError('Invalid email')
      email = email.trim().toLowerCase()
      
      const existing = await usersRepository.findByEmail(email)
      return { available: !existing }
    },

    async registration(user:RegistrationDto){
      const { password, email, name, phone, city, interests, company, bio, plan } = user

      if( !password || !email || !name || !phone) throw validationError('Invalid data')

      const existing = await usersRepository.findByEmail(email)
      if (existing) throw conflictError('Email already exists')

      const hashPassword = await bcrypt.hash(password, 12)

      const userCreate:CreateUserData ={
        city: city ?? '',
        interests: interests ?? [],
        company: company ?? '',
        bio: bio ?? '',
        plan: plan ?? '',
        //required
        name,
        phone: phone,
        email: email.trim().toLowerCase(),
        password: hashPassword,
        role:'user',
      }
      const createdUser = await usersRepository.create(userCreate)

      if( !createdUser ) throw conflictError('User not created')

      const dataMailer:DataMailer = { email:userCreate.email, subject:'Registration', text:`Thank you for registration` }
      const template:TemplateData = { type:'registration' }

      try{
        await mailer(dataMailer, template)
      }catch(e:any){
        throw internalError(e?.message+''|| 'Mailer error')
      }
  
      return this.getAccessAndRefreshTokens(createdUser, false)
    },    
  } 
}

export type AuthService = ReturnType<typeof createAuthService>