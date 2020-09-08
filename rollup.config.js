import babel from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import {terser} from 'rollup-plugin-terser'
import copy from 'rollup-plugin-copy'
import typescript from '@rollup/plugin-typescript'

const plugins = (outputDir) => [
  babel({
    exclude: 'node_modules/**',
    babelHelpers: 'bundled'
  }),
  commonjs({extensions: ['.js', '.ts']}),
  resolve(),
  terser(),
  typescript(),
  copy({
    'src/transform': `${outputDir}/transform`
  })
]

const generateConfig = (integration) => ({
  input: `src/integrations/${integration}.ts`,
  output: {
    file: `lib/${integration}.js`,
    format: 'cjs',
    exports: 'named'
  },
  plugins: plugins('lib'),
  external: [
    '@optimizely/optimizely-sdk',
    '@optimizely/optimizely-sdk/lib/utils/enums'
  ]
})

module.exports = [generateConfig('optimizely'), generateConfig('simple')]
