import { pinoHttp } from 'pino-http'
import { logger } from '../lib/logger.js'

export const requestLogger = pinoHttp({
  logger,
  // 5xx responses log as error, 4xx as warn, others as info
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return 'error'
    if (res.statusCode >= 400) return 'warn'
    return 'info'
  },
})
