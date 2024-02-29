import {readPackage} from 'read-pkg'
import util from 'util'
import {exec} from 'child_process'
import enquirer from 'enquirer'
import chalk from 'chalk'

export async function clean(argv) {
  console.log('ARGV', argv)
  const {id, winner} = argv
  const {prompt} = enquirer
  const {log} = console

  if (!id) {
    const response: {
      id: string
    } = await prompt({
      type: 'input',
      name: 'id',
      message: 'Please enter the experiment ID you would like to clean up:',
      validate: (i) => {
        if (!i) {
          log(chalk.red('Please enter a valid experiment ID'))
          return false
        }
        return true
      }
    })
    console.log(response)
    argv.id = response.id
  }

  if (!argv.winner) {
    const response: {
      winner: 'a' | 'b'
    } = await prompt({
      type: 'select',
      name: 'winner',
      message: 'Please enter the winning side of the experiment:',
      choices: ['A', 'B']
    })
    argv.winner = response.winner.toLowerCase()
  }

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
        log(chalk.red(`Error executing jscodeshift command: ${stderr}`))
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
