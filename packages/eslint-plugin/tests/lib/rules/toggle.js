/**
 * @fileoverview Opticks
 * @author Jop
 */
'use strict'

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require('../../../lib/rules/toggle'),
  RuleTester = require('eslint').RuleTester

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

RuleTester.setDefaultConfig({
  settings: {
    opticks: {experiments: {foo: 'a', bar: undefined, baz: 'b'}}
  }
})
const ruleTester = new RuleTester()

ruleTester.run('toggle', rule, {
  valid: [
    {code: "toggle('bar', 'a', 'b')"},
    {code: "toggle('nonexistent', 'a', 'b')"}
  ],
  invalid: [
    {
      code: "toggle('foo', 'a', 'b')",
      errors: [
        {
          message:
            'Looks like this experiment concluded, and can be cleaned. The winning variant is a.',
          type: 'CallExpression'
        }
      ],
      output: "'a'"
    },
    {
      code: "toggle('baz', 'a', 'b')",
      errors: [
        {
          messageId: 'ExperimentConcluded',
          type: 'CallExpression'
        }
      ],
      output: "'b'"
    },
    {
      // TODO: make tests work with const too
      code: "var intermediateVariable = toggle('bar', 'a', 'b')",
      errors: [
        {
          messageId: 'VariableAssignment',
          type: 'CallExpression'
        }
      ],
      output: null
    },
    {
      code: "toggle('bar', 'a')",
      errors: [
        {
          messageId: 'InvalidNrOfVariants',
          type: 'CallExpression',
          suggestions: [
            {
              messageId: 'AddNullBVariant',
              output: "toggle('bar', 'a', null)"
            }
          ]
        }
      ],
      output: null
    },
    {
      code: `var Foo = styled('div')\`
          display: flex;
          \${toggle("foo", "a", "b")}
        \`
      `,
      errors: [
        'This toggle is not called from a function, this might not be what you want to do because it might execute before Opticks received the user id. Is this intended?'
      ],
      output: null
    }
  ]
})
