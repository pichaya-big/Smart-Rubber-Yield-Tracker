import express from 'express'
import { apiRouter } from './routes/index.js'
import { errorHandler, notFound } from './middlewares/error.middleware.js'
import { requestLogger } from './middlewares/request-logger.js'

export function createApp() {
  const app = express()

  app.use(requestLogger)
  app.use(express.json())
  app.use('/api', apiRouter)
  app.use(notFound)
  app.use(errorHandler)

  return app
}
