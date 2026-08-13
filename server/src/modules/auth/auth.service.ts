import { unauthorizedError, conflictError, cooldownError, notFoundError, validationError, internalError } from '../../common/errors'
import { PayloadAccess, PayloadRefresh, RegistrationDto } from './auth.types'
import { CreateUserData, UserDocument } from '../users/users.types'
import type { ObjectId } from 'mongodb'
import { UsersRepository } from '../users/users.repository'
import { JWT } from '@fastify/jwt' // SignOptions вернуть вместе с signToken, если он понадобится
import { FastifyRedis } from '@fastify/redis'
import bcrypt from 'bcrypt'
import { randomUUID, randomInt } from 'crypto' 
import { mailer } from 'src/services/mailer/mailer'
import type { TemplateData, DataMailer } from 'src/services/mailer/mailer.type'
// import { buildUpdate } from '../../common/utils/buildUpdate'

import authConfig from '../../configs/auth.config'

type AuthUserFromToken = PayloadAccess | PayloadRefresh

type changePassword = {userId:string, oldPassword:string, newPassword:string, refreshToken:string}

const normalizeEmail = (email?:string) => (email ?? '').trim().toLowerCase()

export function createAuthService( jwt:JWT, redis:FastifyRedis, usersRepository:UsersRepository ) {

  return {
    async forgotPassword(email:string){
      email = normalizeEmail(email)

      //Если код есть, значить письмо уже было отправленно
      //лок 5 мин, на повторную отправку

      const code = await redis.get('forgotPassword:'+email);
      if( code ) throw cooldownError()

      const user = await usersRepository.findByEmail(email)
      if( !user ) throw notFoundError('User', email)
      
      const codeStr = randomInt(10 ** 5, 10 ** 6)
      // const codeStr = Math.floor(100000 + Math.random() * 900000)
      await redis.setex('forgotPassword:'+email, 300, codeStr) // 5 минут
      // счётчик попыток   
      await redis.setex('forgotPassword_counter:'+email, 300, 0) // 5 минут      

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
      email = normalizeEmail(email)

      if( !(Number(code) >= 10 ** 5 && Number(code) < 10 ** 6) ) throw validationError('Invalid code')

      const codeStr = await redis.get('forgotPassword:'+email)
      if( !codeStr ) throw validationError('Invalid code')

      //Считаем количество попыток
      const codeCounter = await redis.get('forgotPassword_counter:'+email)
      if( Number(codeCounter) >= 5) throw cooldownError()

      if( codeStr !== code ){
        await redis.incr('forgotPassword_counter:' + email)
        throw validationError('Invalid code')
      }

      const user = await usersRepository.findByEmail(email)
      if( !user ) throw notFoundError('User', email)
      
      const hashPassword = await bcrypt.hash(newPassword, 12)
      const updatedUser = await usersRepository.update(user._id.toString(), {password:hashPassword})
      if( !updatedUser ) throw conflictError('User not updated')

      await redis.del('forgotPassword:'+email, 'forgotPassword_counter:'+email)

      await this.logoutAll( user._id.toString() )

      return true
    },
    async changePassword({userId, oldPassword, newPassword, refreshToken}:changePassword){
      // Разбираем refresh-cookie ДО любых необратимых действий: отказ ниже по методу
      // оставил бы пароль уже сменённым, старые сессии живыми, а клиента без токенов
      let payload: AuthUserFromToken
      try {
        payload = jwt.verify<AuthUserFromToken>(refreshToken)
      } catch {
        throw unauthorizedError('Invalid token')
      }

      // verify проверяет только подпись: access-токен подписан тем же секретом и прошёл бы её.
      // Тип payload сужается до PayloadRefresh этой проверкой, а не аннотацией слева
      if( payload.type !== 'refresh' || !payload._id || !payload.uuid ) throw unauthorizedError('Invalid token type')
      if( payload._id !== userId ) throw unauthorizedError('Invalid token')

      const { remember } = payload

      const user = await usersRepository.findById(userId)
      if( !user ) throw notFoundError('User', userId)

      const isCorrectOldPassword = await bcrypt.compare(oldPassword, user.password)

      if( !isCorrectOldPassword ) throw validationError('Invalid credentials')

      const hashPassword = await bcrypt.hash(newPassword, 12)
      const updatedUser = await usersRepository.update(userId, {password:hashPassword})
      if( !updatedUser ) throw conflictError('User not updated')

      // logoutAll строго ДО getAccessAndRefreshTokens (SEC-11), иначе снесёт свежую пару
      await this.logoutAll(userId)

      return this.getAccessAndRefreshTokens(updatedUser, remember)
      
    },
    // Обёртки не вызываются нигде в проекте (проверено грепом при FIX-5) —
    // закомментированы, удаление в DX-8. Токены выпускает getAccessAndRefreshTokens,
    // проверяют — guard и методы ниже
    // signToken:(user: AuthUserFromToken, options?: Partial<SignOptions>)=> {
    //   return jwt.sign(user, options)
    // },

    // verifyToken:async (token: string) => {
    //   return jwt.verify<AuthUserFromToken>(token) // выбросит ошибку, если недействителен
    // },

    async validateUser(email:string, password:string){
      email = normalizeEmail(email)

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
        ''
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
      let payload: AuthUserFromToken
      try {
        payload = jwt.verify<AuthUserFromToken>(refreshToken)
      } catch {
        throw unauthorizedError('Invalid token')
      }

      // Проверяем что это refresh, а не access (подпись у них общая) —
      // проверка же и сужает payload до PayloadRefresh
      if( payload.type !== 'refresh' ) throw unauthorizedError('Invalid token')
      
      // const tokenFromRedis = await redis.get(`user:${payload._id}:token:refresh:${payload.uuid}`)
        
      // Проверяем что токен есть в Redis (не отозван)
      const exists = await redis.exists(`user:${payload._id}:token:refresh:${payload.uuid}`)

      if ( exists === 0 ) {
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

      await redis.del(`user:${payload._id}:token:refresh:${payload.uuid}`)

      return this.getAccessAndRefreshTokens(user, payload.remember)
    },

    // Best-effort: каждый токен разбирается и удаляется независимо, провал одного
    // не отменяет удаление ключа второго. accessToken опционален — заголовка может не быть
    async logout(refreshToken: string, accessToken?: string) {
      try {
        const payloadRef = jwt.verify<AuthUserFromToken>(refreshToken)
        if( payloadRef.type === 'refresh' ) await redis.del(`user:${payloadRef._id}:token:refresh:${payloadRef.uuid}`)
      } catch {
        // Токен уже невалидный — удалять нечего
      }

      if( !accessToken ) return

      try {
        const payloadAcc = jwt.verify<AuthUserFromToken>(accessToken)
        if( payloadAcc.type === 'access' ) await redis.del(`user:${payloadAcc._id}:token:access:${payloadAcc.uuid}`)
      } catch {
        // Сломанный access-токен guard всё равно не пропустит
      }
    },

    async logoutAll(userId: string) {
      const user = await usersRepository.findById(userId)
      if( !user ) throw notFoundError('User', userId)

      const pattern = `user:${userId}:token:*`
      let cursor = '0'

      do {
        const [next, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100)
        cursor = next
        if (keys.length) await redis.unlink(...keys)
      } while (cursor !== '0')
    },

    async checkEmail(email:string){
      email = normalizeEmail(email)
      if( !email ) throw validationError('Invalid email')

      const existing = await usersRepository.findByEmail(email)
      return { available: !existing }
    },

    async registration(user:RegistrationDto){
      const { password, name, phone, city, interests, company, bio, plan } = user
      const email = normalizeEmail(user.email)

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
        email,
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