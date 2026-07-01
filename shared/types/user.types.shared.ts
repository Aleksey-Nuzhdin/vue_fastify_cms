// Тип ролей живёт рядом с рантайм-значением USER_ROLES в shared/constants.
// Здесь — реэкспорт, чтобы UserRole оставался доступен из @shared/types.
import type { UserRole } from '../constants/user.constants.shared'
export type { UserRole }

export interface UserBase<IdType = string> {
  _id: IdType
  email: string
  password: string
  role: UserRole
  avatar:string
  name: string
  // Нейтральный демо-набор полей: показывает разные типы инпутов FormGenerator
  // (tel-маска / select / multi-select / text / textarea). Замени под домен проекта.
  phone: string          // input tel (маска)
  plan: string           // select: basic | pro | enterprise
  interests: string[]    // multi-select: design | development | marketing
  company: string        // input text
  bio: string            // input textarea
  city: string           // input text
}

// Для создания (без служебных полей)
export interface CreateUserDto extends Omit<UserBase, '_id'> {}

// Для обновления (все поля опциональны)
export type UpdateUserDto = Omit<Partial<CreateUserDto>, '_id' | 'email'>

export type GetUsersQuery = Partial<{
  name: string,
  email: string,
  phone: string,
  plan: string,
  skip: number,
  limit: number,
}>

export type ReturnUser<T = string> = Omit<UserBase<T>, 'password'>

export type ReturnUserList<T> = {
  list: ReturnUser<T>[],
  count: number
}
