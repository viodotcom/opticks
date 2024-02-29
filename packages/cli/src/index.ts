#!/usr/bin/env node

import yargs from 'yargs'
import {hideBin} from 'yargs/helpers'
import {clean} from './commands/clean'

async function main() {
  const {log} = console

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

        log(success)
        log(message)
      }
    )
    .demandCommand()

  yarg.parse(process.argv.slice(2))
}

main()
