// Коды ошибок (синхронизировано с сервером)
export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'ACTION_COOLDOWN'
  | 'FILE_TOO_LARGE'
  | 'IMAGE_TOO_LARGE'
  | 'INTERNAL_ERROR'

// Тело ответа об ошибке (envelope) — синхронизировано с server/src/common/errors/errors.handler.ts
// statusCode в тело не кладётся: он доступен как HTTP-статус ответа (response.status)
export interface ApiErrorResponse {
  success: false
  error: {
    code: ApiErrorCode
    message: string
  }
}