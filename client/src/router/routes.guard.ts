import type { Router } from 'vue-router'
import { useAuthStore } from '@/modules/auth'
import { useShowPopup } from '@/shared/components/Popup/useShowPopup'


export function setupGuards(router: Router): void {
  router.beforeEach(async (to, from) => {
    const isGuestPage = to.meta.guest === true

    if(isGuestPage) return true

    const authStore = useAuthStore()

    // Инициализация при первом переходе
    if (!authStore.isAuth || authStore.isLoading) await authStore.init()

    const allowedRoles = to.meta.roles
    // Наличие roles само по себе требует авторизации — auth: true дублировать не обязательно
    const isAuthPage = to.meta.auth === true || allowedRoles !== undefined
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

    // Проверка ролей. user здесь заведомо не null: роут с roles требует авторизации,
    // неавторизованного развернуло блоком выше
    if (allowedRoles && authStore.user) {
      const hasRole = allowedRoles.includes(authStore.user.role)
      if (!hasRole){
        const redirect = to.meta.roleRedirect
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
