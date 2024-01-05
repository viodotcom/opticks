#!/usr/bin/env node
import meow from 'meow';

const cli = meow(`
	Usage
	  $ unicorn-fun [input]

	Options
	  --postfix  Lorem ipsum  [Default: rainbows]

	Examples
	  $ cli-name
	  unicorns & rainbows
	  $ cli-name ponies
	  ponies & rainbows
`, {
	flags: {
		postfix: {
			type: 'string',
			default: 'rainbows'
		}
	}
});

console.log(moduleName(cli.input[0] || 'unicorns', cli.flags));