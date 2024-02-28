import {readPackage} from 'read-pkg'
import util from 'util'
import {exec} from 'child_process'

export async function clean(argv) {
  const {id, winner} = argv

  try {
    const packageJson = await readPackage()
    if (
      packageJson.dependencies &&
      Object.keys(packageJson.dependencies).includes('opticks')
    ) {
      const cmd = `./node_modules/.bin/jscodeshift --transform ./node_modules/opticks-cli/dist/transform/toggle.mjs src --parser=tsx --extensions=ts,tsx --toggle=${id} --winner=${winner}`

      const execute = util.promisify(exec)

      const {stdout, stderr} = await execute(cmd)

      if (stderr) {
        console.error(`Error executing jscodeshift command: ${stderr}`)
      }

      const numCleanedFiles = Number(
        stdout
          .split('\n')
          .find((i) => i.includes('ok'))
          .split(' ')[0]
      )

      return {
        success: numCleanedFiles > 0,
        message: stdout
      }
    } else {
      return {
        success: false,
        message: `Could not find a dependency named 'opticks' installed in your project. Please install opticks and try again.`
      }
    }
  } catch (e) {
    return {
      success: false,
      message: `Could not find a package.json file at path '${e.path}'. Please ensure that you are in the correct directory.`
    }
  }
}
