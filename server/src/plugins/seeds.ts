import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import { createSeedsService } from '../seeds/seeds.service'

async function seedsPlugin(app: FastifyInstance) {
  const db = app.mongo.db
  
  const updatePages = process.env.UPDATE_PAGES_DATA === 'true'

  const seedsService = createSeedsService(db, { updatePages })
  
  await seedsService.runAll()
  
  app.log.info('Seeds completed')
}

export default fp(seedsPlugin, {
  name: 'seeds',
  dependencies: ['mongodb'] // ждём пока mongodb подключится
})