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

import mongodbPlugin from './plugins/mongodb/mongodb'
import fastifyJwt from './plugins/jwt'
import redis from './plugins/redis'
import seeds from './plugins/seeds'

import { routes } from './routes/index'


export const buildApp = async () => {
  const app = Fastify({
    logger: true
  })

  // Плагины
  app.register(cookie, {
    secret: process.env.COOKIE_SECRET,
  })
  app.register(cors)
  app.register(helmet, {
    contentSecurityPolicy: false,
  })
  app.register(rateLimit)
  app.register(multipart, { 
    // attachFieldsToBody: true,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB
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

  app.register(routes)

  await app.ready()

  return app
}