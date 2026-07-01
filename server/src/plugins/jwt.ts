import fp from 'fastify-plugin'
import fastifyJwt from '@fastify/jwt'

export default fp(async (app) => {
  // Гарантированно задан: проверяется в initEnv() (fail-fast на старте).
  app.register(fastifyJwt, { secret: process.env.JWT_SECRET! })
})