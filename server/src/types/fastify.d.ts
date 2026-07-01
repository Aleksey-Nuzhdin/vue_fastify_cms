import { Db, MongoClient } from 'mongodb'
import { Redis } from 'ioredis'
import { PayloadAccess, PayloadRefresh } from '../modules/auth/auth.types';

interface JwtUserPayload extends PayloadAccess {}

declare module 'fastify' {
  interface FastifyInstance {
    mongo: {
      client: MongoClient
      db: Db
    }
    redis: Redis
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload:JwtUserPayload | PayloadRefresh,
    user: JwtUserPayload 
  }
}