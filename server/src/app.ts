import Fastify from 'fastify'
import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import multipart from '@fastify/multipart'
import staticModule from '@fastify/static'
import path from 'path'

import { UPLOAD_LIMITS } from '@shared/constants'

import mongodbPlugin from './plugins/mongodb/mongodb'
import fastifyJwt from './plugins/jwt'
import redis from './plugins/redis'
import seeds from './plugins/seeds'

import { routes } from './routes/index'
import { errorHandler } from './common/errors'


export const buildApp = async () => {
  const app = Fastify({
    logger: true
  })

  // Плагины
  app.register(cookie, {
    secret: process.env.COOKIE_SECRET,
  })
  app.register(cors, { origin: false })
  app.register(helmet, {
    contentSecurityPolicy: false,
  })
  app.register(rateLimit, { max: 500, timeWindow: '1 minute' })
  app.register(multipart, {
    // attachFieldsToBody: true,
    // Общий лимит на все роуты. Кому нужно больше (storage, доклады) —
    // поднимает его точечно через request.parts({ limits }) в своём контроллере.
    limits: { fileSize: UPLOAD_LIMITS.defaultFileSize }
  })
  app.register(staticModule, {
    root: path.join(process.cwd(), 'public', 'upload'),
    serve: false,
  })
  app.register(staticModule, {
    root: path.join(process.cwd(), 'public'),
    prefix: '/',
    decorateReply: false,
    // wildcard: false,
  })
  app.register(swagger)
  app.register(swaggerUi)
  app.register(redis)
  app.register(fastifyJwt)
  app.register(mongodbPlugin)
  app.register(seeds)

  app.setErrorHandler(errorHandler)

  app.register(routes)

  await app.ready()

  return app
}