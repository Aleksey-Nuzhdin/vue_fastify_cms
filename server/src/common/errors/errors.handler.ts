import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { isAppError, payloadTooLargeError } from './errors.factory'

// Ошибки @fastify/multipart про превышение лимитов загрузки. У них есть
// code/statusCode, поэтому isAppError принял бы их за нашу ошибку и отдал
// наружу внутренний код плагина — разбираем их раньше и переводим в свой код.
const MULTIPART_TOO_LARGE_CODES: string[] = ['FST_REQ_FILE_TOO_LARGE', 'FST_FILES_LIMIT']

export function errorHandler(
  error: FastifyError | unknown,
  request: FastifyRequest,
  reply: FastifyReply
) {
  request.log.error(error)

  // Multipart: файл больше лимита или файлов больше разрешённого
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    MULTIPART_TOO_LARGE_CODES.includes((error as FastifyError).code)
  ) {
    const tooLarge = payloadTooLargeError()
    return reply.status(tooLarge.statusCode).send({
      success: false,
      error: {
        code: tooLarge.code,
        message: tooLarge.message,
      },
    })
  }

  // Наша ошибка
  if (isAppError(error)) {
    return reply.status(error.statusCode).send({
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
    })
  }

  // Fastify validation error
  if (
    typeof error === 'object' &&
    error !== null &&
    'validation' in error
  ) {
    const fastifyError = error as FastifyError
    return reply.status(400).send({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: fastifyError.message,
      },
    })
  }

  // Неизвестная ошибка
  return reply.status(500).send({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    },
  })
}