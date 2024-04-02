/**
 * @fileoverview Opticks
 * @author Gerrit Burger
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
    opticks: {experiments: {foo: 'a', bar: null, baz: 'b'}},
    // Mock the import of the toggle function from the opticks package
    isToggleImportedFromOpticks: true
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
          messageId: 'ExperimentConcluded',
          type: 'CallExpression'
        }
      ],
      output: null
    },
    {
      code: "toggle('baz', 'a', 'b')",
      errors: [
        {
          messageId: 'ExperimentConcluded',
          type: 'CallExpression'
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
