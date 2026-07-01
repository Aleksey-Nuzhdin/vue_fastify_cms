import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { isAppError } from './errors.factory'

export function errorHandler(
  error: FastifyError | unknown,
  request: FastifyRequest,
  reply: FastifyReply
) {
  request.log.error(error)

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