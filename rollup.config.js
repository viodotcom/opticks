import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import copy from 'rollup-plugin-copy'

const plugins = outputDir => [
  babel({
    exclude: 'node_modules/**'
  }),
  resolve(),
  commonjs(),
  terser(),
  copy({
    'src/transform': `${outputDir}/transform`
  })
]

const generateConfig = integration => ({
  input: `src/${integration}.js`,
  output: {
    file: `lib/${integration}.js`,
    format: 'esm'
  },
  plugins: plugins('lib')
})

module.exports = [generateConfig('optimizely'), generateConfig('simple')]
