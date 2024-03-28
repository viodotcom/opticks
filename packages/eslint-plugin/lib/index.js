/**
 * @fileoverview Opticks
 * @author Jop
 */
'use strict'

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const requireIndex = require('requireindex')

//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------

// import all rules in lib/rules
module.exports = {
  meta: {
    name: 'eslint-plugin-opticks',
    version: '0.0.1'
  },
  rules: requireIndex(__dirname + '/rules')
}
