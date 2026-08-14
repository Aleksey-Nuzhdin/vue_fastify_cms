import fp from 'fastify-plugin'
import { MongoClient, ObjectId, Db } from 'mongodb'
import { FastifyInstance } from 'fastify'

import { mongodbInit } from './mongodb.init'

async function mongodbPlugin(app: FastifyInstance) {  
  const url = process.env.MONGO_DB_CONNECT
  const dbName = process.env.MONGO_DB_NAME
  
  // Дублирует initEnv() (fail-fast на старте) — страховка от рассинхрона
  // с REQUIRED_SECRETS; заодно сужает тип до string для MongoClient.
  if (!url) throw new Error('MONGO_DB_CONNECT is required')

  if (!dbName) throw new Error('MONGO_DB_NAME is required')

  const client = new MongoClient(url)
  await client.connect()

  const db = client.db(dbName)

  await mongodbInit(db)

  app.decorate('mongo', { client, db })

  app.addHook('onClose', async () => {
    await client.close()
  })

  app.log.info(`MongoDB connected to ${dbName}`)
}

export default fp(mongodbPlugin, { name: 'mongodb' })