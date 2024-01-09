import {readPackage} from 'read-pkg'

export async function clean(argv) {
  try {
    const packageJson = await readPackage()
    if (
      packageJson.dependencies &&
      Object.keys(packageJson.dependencies).includes('opticks')
    ) {
      console.log('opticks installed')
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
