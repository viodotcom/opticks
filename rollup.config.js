import babel from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import {terser} from 'rollup-plugin-terser'
import copy from 'rollup-plugin-copy'
import typescript from '@rollup/plugin-typescript'

const plugins = (outputDir) => [
  // babel({
  //   exclude: 'node_modules/**',
  //   extensions: ['.ts'],
  //   babelHelpers: 'bundled'
  // }),
  // resolve(),
  // typescript({module: 'CommonJS'}),
  typescript(),
  // commonjs({extensions: ['.js', '.ts']}),
  // terser(),
  // TODO: doesn't seem to be working
  copy({
    'src/transform': `${outputDir}/transform`
  })
]

const generateConfig = (integration) => ({
  input: `src/integrations/${integration}.ts`,
  output: {
    dir: 'lib',
    // format: 'cjs',
    format: 'es',
    exports: 'named',
    sourcemap: true
  },
  plugins: plugins('lib'),
  external: [
    '@optimizely/optimizely-sdk',
    '@optimizely/optimizely-sdk/lib/utils/enums'
  ]
})

module.exports = [generateConfig('optimizely'), generateConfig('simple')]
