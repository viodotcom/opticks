import {readPackage} from 'read-pkg'
import {exec} from 'child_process'

export async function clean(argv) {
  const {id, winner} = argv

  try {
    const packageJson = await readPackage()
    if (
      packageJson.dependencies &&
      Object.keys(packageJson.dependencies).includes('opticks')
    ) {
      const isWinner = winner === 'a' ? false : true

      const cmd = `./node_modules/.bin/jscodeshift --transform ./node_modules/opticks-cli/dist/transform/toggle.mjs --parser=tsx --extensions=ts,tsx src --toggle=${id} --winner='${isWinner}'`

      console.log(cmd)

      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing jscodeshift command: ${error}`)
          return
        }
        console.log(stdout)
        console.error(stderr)
      })
    } else {
      console.log(
        `Could not find a dependency named 'opticks' installed in your project. Please install opticks and try again.`
      )
    }
  } catch (e) {
    console.log(
      `Could not find a package.json file at path '${e.path}'. Please ensure that you are in the correct directory.`
    )
  }
}
