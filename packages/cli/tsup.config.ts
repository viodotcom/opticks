import {defineConfig} from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/transform/*'],
  outDir: 'dist',
  format: ['esm'],
  dts: false,
  sourcemap: true,
  clean: true,
  minify: true
})
