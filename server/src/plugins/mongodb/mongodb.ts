import fp from 'fastify-plugin'
import { MongoClient, ObjectId, Db } from 'mongodb'
import { FastifyInstance } from 'fastify'

import { mongodbInit } from './mongodb.init'

async function mongodbPlugin(app: FastifyInstance) {  
  const url = process.env.MONGO_DB_CONNECT
  const dbName = process.env.MONGO_DB_NAME
  
  if (!url || !dbName) {
    throw new Error('MONGODB_URL is required, MONGODB_NAME is required')
  }

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