import {readPackage} from 'read-pkg'
import util from 'util'
import {exec} from 'child_process'
import enquirer from 'enquirer'
import chalk from 'chalk'
import ora from 'ora'

export async function clean({id, winner}) {
  const {prompt} = enquirer
  const {log} = console

  let experimentId: string = id
  let experimentWinner: string = winner

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
    experimentId = response.id
  }

  if (!winner) {
    const response: {
      winner: 'a' | 'b'
    } = await prompt({
      type: 'select',
      name: 'winner',
      message: 'Please enter the winning side of the experiment:',
      choices: ['A', 'B']
    })
    experimentWinner = response.winner.toLowerCase()
  }

  try {
    const packageJson = await readPackage()

    if (
      packageJson.dependencies &&
      Object.keys(packageJson.dependencies).includes('opticks')
    ) {
      const cmd = `./node_modules/.bin/jscodeshift --transform ./node_modules/opticks-cli/dist/transform/toggle.mjs src --parser=tsx --extensions=ts,tsx --toggle=${experimentId} --winner=${experimentWinner}`

      const execute = util.promisify(exec)

      const spinner = ora(`Cleaning up ${id} to the ${winner} side`).start()

      try {
        const {stdout, stderr} = await execute(cmd)

        if (stderr) {
          spinner.stop()
          return {
            success: false,
            message: `Error occurred while executing jscodeshift command: ${stderr}`
          }
        }

        const numCleanedFiles = Number(
          stdout
            .split('\n')
            .find((i) => i.includes('ok'))
            .split(' ')[0]
        )

        spinner.stop()

        return {
          success: numCleanedFiles > 0,
          message: stdout
        }
      } catch (error) {
        spinner.stop()

        return {
          success: false,
          message: `Error occurred while executing jscodeshift command: ${error}`
        }
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
