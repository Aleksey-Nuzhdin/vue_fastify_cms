import '@/shared/styles/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'

import App from './App.vue'
import router from './router'
import i18n from './i18n'
import VueDOMPurifyHTML from 'vue-dompurify-html';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 минута
      retry: 1,
      refetchOnWindowFocus: false, // отключаем для начала
    },
  },
})


const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(VueDOMPurifyHTML, { default: { ADD_ATTR: ['target'] } });
app.use(VueQueryPlugin, { queryClient })

app.mount('#app')
