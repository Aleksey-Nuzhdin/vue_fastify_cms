import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { tokenStorage } from '@/shared/lib'
import { authApi } from './auth.api'
import type { AuthUser, LoginRequest, RegistrationDto, UserRole } from './auth.types'
import { USER_ROLES } from '@shared/constants'

const normalizeEmail = (email?:string) => (email ?? '').trim().toLowerCase()

// Ключи, у которых значение — РОВНО string (литеральные union вроде role
// исключаются: у них string не assignable обратно).
type StringKey<T> = {
  [K in keyof T]: T[K] extends string ? (string extends T[K] ? K : never) : never
}[keyof T]

// Дефолты полного пользователя — единственный источник правды по набору полей.
const EMPTY_USER: AuthUser = {
  _id: '',
  email: '',
  name: '',
  role: 'user',
  avatar: '',
  phone: '',
  city: '',
  interests: [],
  company: '',
  bio: '',
  plan: '',
} satisfies AuthUser

// Перечисляем только string-поля. TS не даст вписать сюда не-string ключ
// или опечатку — это и есть защита набора полей, без дженерик-гимнастики.
const STRING_FIELDS: readonly StringKey<AuthUser>[] = [
  '_id', 'email', 'name', 'avatar', 'phone',
  'city', 'company', 'bio', 'plan',
]

// Берёт из сырых данных только валидные поля (для частичного мерджа в user).
function pickUserFields(data: Partial<AuthUser>): Partial<AuthUser> {
  const res: Partial<AuthUser> = {}

  for (const key of STRING_FIELDS) {
    const value = data[key]
    if (typeof value === 'string') res[key] = value
  }

  // Спец-поля с отдельной валидацией
  if (data.role && USER_ROLES.includes(data.role)) res.role = data.role
  if (Array.isArray(data.interests)) res.interests = data.interests

  return res
}

// Полный объект для user.value: дефолты + валидные поля. Все ключи гарантированы.
function toFullUser(data: Partial<AuthUser>): AuthUser {
  return { ...EMPTY_USER, ...pickUserFields(data) }
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<AuthUser | null>(null)
  const isLoading = ref(false)

  // Getters
  const isAuth = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isManager = computed(() =>
    user.value?.role === 'admin' || user.value?.role === 'manager'
  )
  const isNoRoleUser = computed(() => user.value?.role &&user.value?.role !== 'user')

  // Actions

  async function updateUser(data:Partial<AuthUser> ) {
    if( user.value === null){
      user.value = toFullUser(data)
      return
    }
    user.value = {...user.value, ...pickUserFields(data)}
  }

  async function login(credentials: LoginRequest): Promise<boolean> {
    const loginData:LoginRequest = {...credentials, email: normalizeEmail(credentials.email)}

    isLoading.value = true

    try {
      const {accessToken} = await authApi.login(loginData)

      tokenStorage.set( accessToken )

      const profileData = await authApi.getProfile()
      user.value = toFullUser(profileData)

      return true
    } catch (error) {
      tokenStorage.clear()
      user.value = null
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function logout(): Promise<void> {
    try {
      await authApi.logout()
    } finally {
      tokenStorage.clear()
      user.value = null
    }
  }

  async function refresh(): Promise<boolean> {
    isLoading.value = true

    try {
      const data = await authApi.getProfile()

      user.value = toFullUser(data)

      return true
    } catch {
      tokenStorage.clear()
      user.value = null
      return false
    } finally {
      isLoading.value = false
    }
  }

  let initAttempted = false
  let initPromise: Promise<boolean> | null = null

  async function init(): Promise<boolean> {
    // Уже авторизован
    if (user.value) return true

    // Уже пробовали — не вышло
    if (initAttempted) return false

    // Запрос уже в полёте — ждём тот же промис
    if (initPromise) return initPromise

    // Новый запрос
    initPromise = refresh()
      .finally(() => {
        initAttempted = true
        initPromise = null
      })

    return initPromise
  }

  async function register(userData:RegistrationDto):Promise<{status:boolean, error?:unknown, emailSent?:boolean}> {
    const {name, phone, email, password, city, interests, company, bio, plan} = userData
    const registerData:RegistrationDto = {
      phone: phone.replace(/\D/g, ''),
      email: normalizeEmail(email),
      password: password.trim(),
      name,
      city,
      interests,
      company,
      bio,
      plan
    }
    try {
      const { accessToken, emailSent } =await authApi.register(registerData)

      tokenStorage.set( accessToken )

      const profileData = await authApi.getProfile()
      user.value = toFullUser(profileData)

      return { status: true, emailSent }
    } catch (error) {
      return { status: false, error }
    }
  }

  function checkRole(checkRoles:UserRole[]){
    return checkRoles.includes(user.value?.role || 'user')
  }

  return {
    // State
    user,
    isLoading,

    // Getters
    isAuth,
    isAdmin,
    isManager,
    isNoRoleUser,

    // Actions
    updateUser,
    login,
    register,
    logout,
    refresh,
    init,
    checkRole,
  }
})
