import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/services/imageResize.worker.ts'],
  format: 'esm',
  target: 'node22',
  outDir: 'dist',
  clean: true,
  noExternal: [/^@shared/],
  tsconfig: 'tsconfig.json',
})
