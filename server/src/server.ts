import closeWithGrace from 'close-with-grace'
import { buildApp } from './app'

export const startServer = async () => {
  const app = await buildApp()

  try {
    await app.listen({
      port: 3000,
      host: '0.0.0.0'
    })

    // app.log.info(`🚀 Server запущен на http://localhost:${config.port}`)
    // app.log.info(`📚 Swagger UI: http://localhost:${config.port}/documentation`)
  } catch (err) {
    // app.log.error(err)
    process.exit(1)
  }

  // === GRACEFUL SHUTDOWN ===
  // Закрываем соединения с MongoDB, Redis и сам сервер по Ctrl+C / SIGTERM
  closeWithGrace(async ({ signal, err }) => {
    if (err) {
      app.log.error({ err }, `Server stopped with error: ${signal}`)
    } else {
      app.log.info(`${signal} received. Graceful shutdown...`)
    }

    // Даём 10 секунд на завершение текущих запросов
    await app.close()
    app.log.info('👋 Server gracefully stopped')
  })
}