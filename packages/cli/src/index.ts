#!/usr/bin/env node

import yargs from 'yargs'
import {hideBin} from 'yargs/helpers'
import enquirer from 'enquirer'
import {clean} from './commands/clean'
import ora from 'ora'

async function main() {
  const {prompt} = enquirer

  const yarg = yargs(hideBin(process.argv))
    .scriptName('opticks')
    .command(
      'clean',
      'Cleans up an experiment',
      {
        id: {
          type: 'string',
          describe: 'Experiment ID to clean up'
        },
        winner: {
          type: 'string',
          describe: 'Winning side of the experiment to clean up'
        }
      },
      async (argv) => {
        if (!argv.id) {
          const response = await prompt({
            type: 'input',
            name: 'id',
            message:
              'Please enter the experiment ID you would like to clean up:'
          })
          argv.id = response.id
        }

        if (!argv.winner) {
          const response = await prompt({
            type: 'select',
            name: 'winner',
            message: 'Please enter the winning side of the experiment:',
            choices: ['A', 'B']
          })
          argv.winner = response.winner.toLowerCase()
        }

        clean(argv)

        // const spinner = ora(
        //   `Cleaning up the A side of experiment ${argv.id}`
        // ).start()
        // setTimeout(() => {
        //   spinner.stop()
        //   console.log('✅ Experiment cleaned successfully')
        //   console.log('Results:')
        //   console.log('0 errors')
        //   console.log('1 file changed')
        // }, 3000)
      }
    )

  yarg.parse(process.argv.slice(2))
}

main()
