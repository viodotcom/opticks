#!/usr/bin/env node

import yargs from 'yargs'
import {hideBin} from 'yargs/helpers'
import {clean} from './commands/clean'

function main() {
  const yarg = yargs(hideBin(process.argv))
    .scriptName('opticks')
    .command(
      'clean',
      'Cleans up an experiment',
      {
        id: {
          type: 'string',
          demandOption: true,
          describe: 'Experiment ID to clean up'
        },
        winner: {
          type: 'string',
          demandOption: true,
          describe: 'Winning side of the experiment to clean up'
        }
      },
      clean
    )

  yarg.parse(process.argv.slice(2))
}

main()
