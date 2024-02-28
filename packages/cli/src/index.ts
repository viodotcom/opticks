#!/usr/bin/env node

import yargs from 'yargs'
import {hideBin} from 'yargs/helpers'
import enquirer from 'enquirer'
import {clean} from './commands/clean'

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

        const {success, message} = await clean(argv)

        console.log(success)
        console.log(message)
      }
    )

  yarg.parse(process.argv.slice(2))
}

main()
