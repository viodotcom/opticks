import {defineConfig} from 'tsup'

export default defineConfig({
  entry: ['index.ts'],
  outDir: 'dist',
  format: ['cjs', 'esm'],
  dts: false,
  sourcemap: false,
  clean: true,
  minify: true
})
