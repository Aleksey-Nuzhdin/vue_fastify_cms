// client/src/shared/api/fetcher.error.ts

import type { ApiErrorCode } from '@shared/types'

export interface FetcherError {
  statusCode: number
  code: ApiErrorCode | 'NETWORK_ERROR' | 'UNKNOWN_ERROR'
  message: string
}

export function createFetcherError(
  statusCode: number,
  code: FetcherError['code'],
  message: string
): FetcherError {
  return { statusCode, code, message }
}

// Type guard
export function isFetcherError(error: unknown): error is FetcherError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    'code' in error &&
    'message' in error
  )
}

// Проверки
export const isUnauthorized = (e: FetcherError) => e.code === 'UNAUTHORIZED'
export const isForbidden = (e: FetcherError) => e.code === 'FORBIDDEN'
export const isValidation = (e: FetcherError) => e.code === 'VALIDATION_ERROR'
export const isNotFound = (e: FetcherError) => e.code === 'NOT_FOUND'
export const isConflict = (e: FetcherError) => e.code === 'CONFLICT'
export const isNetworkError = (e: FetcherError) => e.code === 'NETWORK_ERROR'

export const unknownError = createFetcherError(500, 'UNKNOWN_ERROR', 'Unknown error')
