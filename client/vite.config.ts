import { fileURLToPath, URL } from 'node:url'
import autoprefixer from 'autoprefixer'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import fs from 'fs'
import Components from 'unplugin-vue-components/vite'

const srcPath = fileURLToPath(new URL('./src', import.meta.url))
const sharedPath = fileURLToPath(new URL('../shared', import.meta.url))
const rootDir = fileURLToPath(new URL('..', import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, '')
  const serverPort = Number(env.SERVER_PORT) || 4100

  return {
    plugins: [
      vue(),
      vueDevTools(),
      Components({
        dirs: ['src/shared/ui'],
        // Расширения файлов
        extensions: ['vue'],
        // Рекурсивный поиск в подпапках
        deep: true,
        // Куда генерировать файл с типами
        dts: 'src/types/components.d.ts',
        // Включать компоненты из node_modules или нет
        include: [/\.vue$/, /\.vue\?vue/],
      }),
    ],
    server: {
      https: process.env.NODE_ENV !== 'production' ? {
        key: fs.readFileSync('./.cert.dev/localhost+2-key.pem'),
        cert: fs.readFileSync('./.cert.dev/localhost+2.pem'),
      } : undefined,
      host: '0.0.0.0',  // добавь это
      port: 5173,
      watch: {
        usePolling: true,  // для Docker
        interval: 1000,    // проверять каждую секунду
      },
      proxy: {
        '/api': {
          target: `http://host.docker.internal:${serverPort}`, // порт backend
          changeOrigin: true,
          // rewrite: (path) => path.replace(/^\/api/, ''), // если нужно убрать /api
        },
        '/upload': {
          target: `http://host.docker.internal:${serverPort}`, // порт backend
          changeOrigin: true,
          // rewrite: (path) => path.replace(/^\/api/, ''), // если нужно убрать /api
        },
      },
    },
    resolve: {
      alias: {
        '@': srcPath,
        '@shared': sharedPath,
      },
    },
    css: {
      postcss: {
        plugins: [autoprefixer()],
      },
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "${srcPath}/shared/styles/variables" as *;
            @use "${srcPath}/shared/styles/mixins" as *;
          `,
        },
      },
    },
  }
})
