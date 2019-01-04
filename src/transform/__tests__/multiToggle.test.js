// @flow

jest.autoMockOff()

const defineInlineTest = require('jscodeshift/dist/testUtils').defineInlineTest
const transform = require('../multiToggle')

const packageName = 'opticks'
const fooWinnerAConfig = {
  toggle: 'foo',
  winner: 'a'
}
const fooWinnerBConfig = {
  toggle: 'foo',
  winner: 'b'
}

describe('Multi Toggle', () => {
  describe('Simple variable replacement a', () => {
    defineInlineTest(
      transform,
      fooWinnerAConfig,
      `
import { multiToggle } from '${packageName}'
const result = multiToggle('foo', 'a', 'b', 'c')
`,
      `
const result = 'a'
  `
    )
  })

  describe('Simple variable replacement b', () => {
    defineInlineTest(
      transform,
      fooWinnerBConfig,
      `
import { multiToggle } from '${packageName}'
const result = multiToggle('foo', 'a', 'b', 'c')
`,
      `
const result = 'b'
  `
    )
  })

  describe('Keeps the import for non-relevant multiToggle calls', () => {
    defineInlineTest(
      transform,
      fooWinnerBConfig,
      `
import { multiToggle } from '${packageName}'
const result = multiToggle('foo', 'a', 'b', 'c')
const nonRelevantResult = multiToggle('bar', 'a', 'b', 'c')
`,
      `
import { multiToggle } from '${packageName}'
const result = 'b'
const nonRelevantResult = multiToggle('bar', 'a', 'b', 'c')
  `
    )
  })

  describe('Inline function body replacement', () => {
    defineInlineTest(
      transform,
      fooWinnerBConfig,
      `
import { multiToggle } from '${packageName}'
const result = multiToggle('foo', 'a', () => foo(), 'c')
`,
      `
const result = foo()
  `
    )
  })

  describe('Inline function body replacement with multiple statements braces', () => {
    defineInlineTest(
      transform,
      fooWinnerBConfig,
      `
import { multiToggle } from '${packageName}'
const result = multiToggle('foo', 'a', () => {foo(); bar()}, 'c')
`,
      `
const result = {foo(); bar()}
  `
    )
  })

  describe('Removing winning null values', () => {
    defineInlineTest(
      transform,
      fooWinnerBConfig,
      `
import { multiToggle } from '${packageName}'
const foo = 'bar'
multiToggle('foo', 'a', null, 'c')
`,
      `
const foo = 'bar'
  `
    )
  })

  describe('Deals with missing options', () => {
    const code = `
import { multiToggle } from '${packageName}'
const result = multiToggle('foo', 'a', () => {foo(); bar()}, 'c')
`

    defineInlineTest(transform, {}, code, code)
  })

  xdescribe('Removes references to unused variables in call expressions upon removal', () => {
    // ... TODO
  })
})
