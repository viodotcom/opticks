#!/usr/bin/env node

import yargs from 'yargs'

yargs
  .scriptName('opticks')
  .usage('$0 <cmd> [args]')
  .command(
    'clean [experiment_id]',
    'Clean up an experiment',
    (yargs) => {
      yargs.positional('experiment-id', {
        type: 'string',
        describe: 'The experiment to clean up'
      })
    },

    function (argv) {
      console.log('Cleaning up', argv.experiment_id, '...')
    }
  )
  .help().argv
