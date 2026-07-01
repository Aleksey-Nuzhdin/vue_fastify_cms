import { build } from 'esbuild'

await build({
  entryPoints: ['src/seeds/data/**/*.ts'],
  outdir: 'dist/data',
  outbase: 'src/seeds/data',
  format: 'esm',
})
