import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'

const generateConfig = (integrationName) => {
  const bundle = (config) => ({
    ...config,
    input: `src/${integrationName}.ts`,
    external: (id) => !/^[./]/.test(id),
  })

  return (
    bundle({
      plugins: [esbuild()],
      output: [
        {
          file: `${integrationName}.js`,
          format: 'cjs',
          sourcemap: true,
        },
        {
          file: `${integrationName}.mjs`,
          format: 'es',
          sourcemap: true,
        },
      ],
    }),
    bundle({
      plugins: [dts()],
      output: {
        file: `${integrationName}.d.ts`,
        format: 'es',
      },
    })
  )
}

const config = [generateConfig('optimizely'), generateConfig('simple')]

export default config
