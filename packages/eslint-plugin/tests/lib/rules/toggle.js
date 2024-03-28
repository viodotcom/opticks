/**
 * @fileoverview Opticks
 * @author Gerrit
 * @warning These test do not work with the isToggleImportedFromOpticks logic in the rules.
 * To run the test, set isToggleImportedFromOpticks to "true" in the rule.
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
    opticks: {experiments: {foo: 'a', bar: null, baz: 'b'}}
  }
})
const ruleTester = new RuleTester()

ruleTester.run('toggle', rule, {
  valid: [{code: "toggle('bar', 'a', 'b')"}],
  invalid: [
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
      code: "toggle('nonexistent', 'a', 'b')",
      errors: [
        {
          messageId: 'ExperimentNotConfigured',
          type: 'CallExpression'
        }
      ],
      output: null
    },
    {
      code: "toggle('foo', 'a', 'b')",
      errors: [
        {
          message:
            'Looks like this experiment concluded, and can be cleaned up. The winning variant is a.',
          type: 'CallExpression',
          suggestions: [
            {
              messageId: 'AddWinningVariant',
              output: "'a'"
            }
          ]
        }
      ],
      output: null
    },
    {
      code: "toggle('baz', 'a', 'b')",
      errors: [
        {
          messageId: 'ExperimentConcluded',
          type: 'CallExpression',
          suggestions: [
            {
              messageId: 'AddWinningVariant',
              output: "'b'"
            }
          ]
        }
      ],
      output: null
    },
    {
      code: "var intermediateVariable = toggle('bar', 'a', 'b')",
      errors: [
        {
          messageId: 'VariableAssignment',
          type: 'CallExpression'
        }
      ],
      output: null
    }
  ]
})
