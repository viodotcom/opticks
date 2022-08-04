import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'
import copy from 'rollup-plugin-copy'
import {terser} from 'rollup-plugin-terser'

const OUTPUT_DIR = 'lib'

const bundle = (config, integrationName) => ({
  ...config,
  input: `src/${integrationName}.ts`,
  external: (id) => !/^[./]/.test(id),
})

const generateConfig = () => {
  const libs = ['optimizely', 'simple']
  const config = []
  for (const lib of libs) {
    config.push(
      bundle(
        {
          plugins: [
            esbuild(),
            copy({
              'src/transform': `${OUTPUT_DIR}/transform`,
            }),
            terser(),
          ],
          output: [
            {
              file: `${OUTPUT_DIR}/${lib}.js`,
              format: 'cjs',
              sourcemap: true,
            },
            {
              file: `${OUTPUT_DIR}/${lib}.mjs`,
              format: 'es',
              sourcemap: true,
            },
          ],
        },
        lib,
      ),
      bundle(
        {
          plugins: [dts()],
          output: {
            file: `${OUTPUT_DIR}/${lib}.d.ts`,
            format: 'es',
          },
        },
        lib,
      ),
    )
  }

  return config
}

export default generateConfig()
