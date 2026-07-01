import type { Router } from 'vue-router'
import type { UserRole } from '@/shared/types/user.types'
import { useAuthStore } from '@/modules/auth'
import { useShowPopup } from '@/shared/components/Popup/useShowPopup'
import type { RouteLocationRaw } from 'vue-router'


export function setupGuards(router: Router): void {
  router.beforeEach(async (to, from) => {
    const isGuestPage = to.meta.guest === true

    if(isGuestPage) return true

    const authStore = useAuthStore()

    // Инициализация при первом переходе
    if (!authStore.isAuth || authStore.isLoading) {
      await authStore.init()
    }

    const isAuthPage = to.meta.auth === true
    const allowedRoles = to.meta.roles as UserRole[] | undefined
    const fromPage = (from.name && from) || { name: 'home' }
    const loginPage = { name: 'login', query: { redirect: to.fullPath } }
    const {addPopup} = useShowPopup()


    // Требуется авторизация
    if (isAuthPage && !authStore.isAuth) {
      addPopup({
        title: 'Доступ запрещен',
        text: 'Для доступа требуется авторизация',
        type: 'error'
      })

      //Если это преход внутри, то показываем popup
      if( from.name ) return fromPage
      //инче отправляем на страницу авторизации
      return loginPage
    }

    // Проверка ролей
    if (allowedRoles && authStore.user) {
      const hasRole = allowedRoles.includes(authStore.user.role)
      if (!hasRole){
        const redirect = to.meta.roleRedirect as RouteLocationRaw | undefined
        if( redirect ) return redirect

        addPopup({
          title: 'Доступ запрещен',
          text: 'Недостаточно прав для доступа',
          type: 'error'
        })
        return fromPage
      }
    }

    // Всё ок
    return true
  })
}
