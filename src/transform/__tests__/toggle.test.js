// @flow

jest.autoMockOff()

const TestUtils = require('jscodeshift/dist/testUtils')
const defineInlineTest = TestUtils.defineInlineTest
const defineTest = TestUtils.defineTest
const transform = require('../toggle')

const packageName = 'opticks'
const fooWinnerAConfig = {
  toggle: 'foo',
  winner: 'a',
  experimentalCSSinJSCleanup: true
}
const fooWinnerBConfig = {
  toggle: 'foo',
  winner: 'b',
  experimentalCSSinJSCleanup: true
}

describe('Multi Toggle', () => {
  describe('Simple variable replacement a', () => {
    defineInlineTest(
      transform,
      fooWinnerAConfig,
      `
import { toggle } from '${packageName}'
const result = toggle('foo', 'a', 'b', 'c')
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
import { toggle } from '${packageName}'
const result = toggle('foo', 'a', 'b', 'c')
`,
      `
const result = 'b'
  `
    )
  })

  describe('Test Name with dashes', () => {
    defineInlineTest(
      transform,
      {
        toggle: 'foo-bar-baz-dash-boom',
        winner: 'a'
      },
      `
import { toggle } from '${packageName}'
const result = toggle('foo-bar-baz-dash-boom', 'a', 'b', 'c')
`,
      `
const result = 'a'
  `
    )
  })

  describe('Keeps the import for non-relevant toggle calls', () => {
    defineInlineTest(
      transform,
      fooWinnerBConfig,
      `
import { toggle } from '${packageName}'
const result = toggle('foo', 'a', 'b', 'c')
const nonRelevantResult = toggle('bar', 'a', 'b', 'c')
`,
      `
import { toggle } from '${packageName}'
const result = 'b'
const nonRelevantResult = toggle('bar', 'a', 'b', 'c')
  `
    )
  })

  describe('Keeps Opticks imports other than toggle', () => {
    defineInlineTest(
      transform,
      fooWinnerBConfig,
      `
import { toggle, foo } from '${packageName}'
const result = toggle('foo', 'a', 'b', 'c')
`,
      `
import { foo } from '${packageName}'
const result = 'b'
  `
    )
  })

  describe('Inline function body replacement', () => {
    defineInlineTest(
      transform,
      fooWinnerBConfig,
      `
import { toggle } from '${packageName}'
const result = toggle('foo', 'a', () => foo(), 'c')
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
import { toggle } from '${packageName}'
const result = toggle('foo', 'a', () => {foo(); bar()}, 'c')
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
import { toggle } from '${packageName}'
const foo = 'bar'
toggle('foo', 'a', null, 'c')
`,
      `
const foo = 'bar'
  `
    )
  })

  describe('Removing unused variables in losing variations', () => {
    defineInlineTest(
      transform,
      fooWinnerBConfig,
      `
import { toggle } from '${packageName}'
const A = 'A'
const B = 'B'
const C = 'C'
const result = toggle('foo', () => A(), () => B(), () => C())
`,
      `
const B = 'B'
const result = B()
  `
    )
  })

  describe('CSS-in-JS toggle cleanup', () => {
    defineTest(__dirname, 'toggle', fooWinnerBConfig, 'CSSinJS')
  })

  describe('CSS-in-JS toggles cleanup - currently broken patterns', () => {
    // This test descibes patterns that are not clean up well yet
    defineTest(__dirname, 'toggle', fooWinnerBConfig, 'CSSinJS-broken-pattern')
  })

  describe('CSS-in-JS toggles without custom clean up', () => {
    // This test describes what happens when we don't apply the template clean
    // up It's quite hacky and we should find a better way to clean these
    // patterns without relying on custom markers. You can opt-out via the
    // experimentalCSSinJSCleanup flag
    defineTest(
      __dirname,
      'toggle',
      { ...fooWinnerBConfig, experimentalCSSinJSCleanup: false },
      'CSSinJS-without-template-cleanup'
    )
  })

  describe('Deals with missing options', () => {
    const code = `
import { toggle } from '${packageName}'
const result = toggle('foo', 'a', () => {foo(); bar()}, 'c')
`

    defineInlineTest(transform, {}, code, code)
  })

  xdescribe('Removes references to unused variables in call expressions upon removal', () => {
    // ... TODO
  })

  describe('Allows to skip formatting via options', () => {
    defineInlineTest(
      transform,
      { ...fooWinnerBConfig, skipCodeFormatting: true },
      `
        import { toggle } from '${packageName}'
            toggle('foo', 'a', 'b')
          const foo =       "bar"
      `,
      `
      'b'
        const foo =       "bar"
      `
    )
  })

  describe('Skips formatting when there are no toggles to clean', () => {
    defineInlineTest(
      transform,
      fooWinnerBConfig,
      `
          const foo =       "bar"
      `,
      `
          const foo =       "bar"
      `
    )
  })

  xdescribe('Removes references to unused variables in call expressions upon removal', () => {
    // ... TODO
  })
})
