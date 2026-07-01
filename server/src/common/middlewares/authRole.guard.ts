import { FastifyRequest } from 'fastify'
import { unauthorizedError, forbiddenError } from './../../common/errors'
import { UserRole } from './../../modules/users/users.types'

// roles: массив ролей или undefined
export function authRoleGuard(roles?: UserRole[]) {
  return async function (request: FastifyRequest) {
    try {
      await request.jwtVerify()
    } catch {
      throw unauthorizedError('JWT invalid or missing')
    }

    const user = request.user
    
    // Проверяем что это access токен, а не refresh
    if (user.type !== 'access') throw unauthorizedError('Invalid token')

    // если что-то поменяли в sign()
    if (!user._id || !user.email || !user.role) throw unauthorizedError('Invalid token')

    // Если роли не указаны — просто авторизация
    if (!roles || roles.length === 0) return
    
    // Проверяем роль пользователя
    if (!roles.includes( user.role )) throw forbiddenError('Access denied: insufficient role')
  }
}

export const requireAuth = authRoleGuard()
export const requireAdmin = authRoleGuard(['admin'])
export const requireManager = authRoleGuard(['admin', 'manager'])
export const requireVereficator = authRoleGuard(['admin', 'vereficator'])

export const guardAuth = { preHandler: [requireAuth] }
export const guardAdmin = { preHandler: [requireAdmin] }
export const guardManager = { preHandler: [requireManager] }
export const guardVereficator = { preHandler: [requireVereficator] }