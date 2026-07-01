// Источник правды по ролям: массив-значение + выведенный из него тип.
// Менять роли только здесь — тип UserRole подстроится автоматически,
// рассинхрон значения и типа невозможен.
export const USER_ROLES = ['user', 'admin', 'manager', 'vereficator'] as const

export type UserRole = (typeof USER_ROLES)[number]
