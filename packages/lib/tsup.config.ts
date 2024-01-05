import {defineConfig} from 'tsup'

export default defineConfig({
  entry: ['src/simple.ts', 'src/optimizely.ts'],
  outDir: 'dist',
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: true
})
