import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import fastifyRedis from '@fastify/redis'

async function redisPlugin(app: FastifyInstance) {
  const url = process.env.REDIS_URL //in dockier compose
  
  if (!url) {
    throw new Error('REDIS_URL is required')
  }

  await app.register(fastifyRedis, { url })

  app.log.info('Redis connected')
}

export default fp(redisPlugin, { name: 'redis' })