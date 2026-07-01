import type { AppError } from './errors.type'

export function createAppError(
  message: string,
  statusCode: number,
  code: string
): AppError {
  return { message, statusCode, code }
}

export function validationError(message: string): AppError {
  return createAppError(message, 400, 'VALIDATION_ERROR')
}

export function unauthorizedError(message = 'Unauthorized'): AppError {
  return createAppError(message, 401, 'UNAUTHORIZED')
}

export function forbiddenError(message = 'Access denied'): AppError {
  return createAppError(message, 403, 'FORBIDDEN') //Нет прав
}

export function notFoundError(resource: string, id?: string): AppError {
  const message = id
    ? `${resource} with id "${id}" not found`
    : `${resource} not found`

  return createAppError(message, 404, 'NOT_FOUND')
}

export function conflictError(message: string): AppError {
  return createAppError(message, 409, 'CONFLICT')
}

export function cooldownError(message = 'Action on cooldown'): AppError {
  return createAppError(message, 429, 'ACTION_COOLDOWN')
}

export function internalError(message = 'Internal server error'): AppError {
  return createAppError(message, 500, 'INTERNAL_ERROR')
}

// Type guard — проверка "это наша ошибка?"
export function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'statusCode' in error &&
    'code' in error
  )
}