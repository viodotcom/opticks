import {defineConfig} from 'tsup'

export default defineConfig({
  entry: [
    'src/simple.ts',
    'src/optimizely.ts',
    'src/transform/toggle.ts',
    'src/transform/booleanToggle.ts',
  ],
  outDir: 'lib',
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: true,
})
