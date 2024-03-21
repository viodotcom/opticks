#!/usr/bin/env node

import yargs from 'yargs'
import {hideBin} from 'yargs/helpers'
import {clean} from './commands/clean'
import {log} from './utils/log'

async function main() {
  const yarg = yargs(hideBin(process.argv))
    .scriptName('opticks-cli')
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
        const {success, message} = await clean(argv)

        log(message, success ? 'green' : 'red')
      }
    )
    .demandCommand()

  yarg.parse(process.argv.slice(2))
}

main()
