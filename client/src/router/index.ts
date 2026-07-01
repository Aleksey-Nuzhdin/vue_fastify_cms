import { createRouter, createWebHistory } from 'vue-router'
import { watch } from 'vue'
import { routes } from './routes'
import { setupGuards } from './routes.guard'
import i18n from '@/i18n'

const SITE_NAME = import.meta.env.VITE_SITE_NAME || 'VFC'

const router = createRouter({
  history: createWebHistory(),
  routes,
})

setupGuards(router)

function applyTitle(titleKey?: string) {
  document.title = titleKey ? `${SITE_NAME} - ${i18n.global.t(titleKey)}` : SITE_NAME
}

router.afterEach((to) => {
  applyTitle(to.meta.title)
})

// Заголовок должен реагировать на смену языка без навигации
watch(i18n.global.locale, () => {
  applyTitle(router.currentRoute.value.meta.title)
})

export default router
