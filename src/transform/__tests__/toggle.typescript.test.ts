jest.autoMockOff()

const defineInlineTest = require('jscodeshift/dist/testUtils').defineInlineTest
const transform = require('../toggle.typescript')

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
import { toggle } from '${packageName}'
type Foo = string;
const result: Foo = toggle('foo', 'a', 'b', 'c')
`,
      `
type Foo = string;
const result: Foo = 'a'
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
import { foo } from '${packageName}';
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

  describe('Deals with missing options', () => {
    const code = `
import { toggle } from '${packageName}'
const result = toggle('foo', 'a', () => {foo(); bar()}, 'c')
`

    defineInlineTest(transform, {}, code, code)
  })

  describe.skip('Removes references to unused variables in call expressions upon removal', () => {
    // ... TODO
  })
})
