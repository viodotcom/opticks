import copy from 'rollup-plugin-copy'
import typescript from '@rollup/plugin-typescript'

const generateConfig = (integration) => ({
  input: `src/integrations/${integration}.ts`,
  output: {
    dir: 'lib',
    format: 'es',
    exports: 'named',
    sourcemap: true
  },
  plugins: [
    typescript(),
    copy({
      'src/transform': `lib/transform`
    })
  ],
  external: [
    '@optimizely/optimizely-sdk',
    '@optimizely/optimizely-sdk/lib/utils/enums'
  ]
})

module.exports = [generateConfig('optimizely'), generateConfig('simple')]
