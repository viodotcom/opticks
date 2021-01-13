// Formatting of inline tests is poor due to whitespace in the template literals
// But I find the understandability better than the file approach because it is
// easier to compare before/after the transformation at one glance

jest.autoMockOff()

const defineInlineTest = require('jscodeshift/dist/testUtils').defineInlineTest
const transform = require('../booleanToggle.flowtype')

const packageName = 'opticks'
const fooWinnerOptions = {
  toggle: 'foo',
  winner: true
}
const fooLoserOptions = {
  toggle: 'foo',
  winner: false
}

describe('Boolean Toggle', () => {
  describe('Simple boolean value', () => {
    describe('Replaces winning toggle call with true', () => {
      defineInlineTest(
        transform,
        fooWinnerOptions,
        `
import { booleanToggle } from '${packageName}'
const result = booleanToggle('foo')
`,
        `
const result = true
  `
      )
    })

    describe('Replaces losing toggle call with false', () => {
      defineInlineTest(
        transform,
        fooLoserOptions,
        `
import { booleanToggle } from '${packageName}'
const result = booleanToggle('foo')
`,
        `
const result = false
  `
      )
    })
  })

  describe("For 'on' config only when winning, keep value", () => {
    defineInlineTest(
      transform,
      fooWinnerOptions,
      `
import { booleanToggle } from '${packageName}'
const result = booleanToggle('foo', 'toggleIsOn')
const resultOfFunction = booleanToggle('foo', () => 'toggleIsOn')
booleanToggle('foo', () => foo())
`,
      `
const result = 'toggleIsOn'
const resultOfFunction = 'toggleIsOn'
foo()
  `
    )
  })

  describe("For 'on' config only when losing, remove the call altogether", () => {
    defineInlineTest(
      transform,
      fooLoserOptions,
      `
import { booleanToggle } from '${packageName}'
const foo = 'bar'
booleanToggle('foo', () => bar())
`,
      `
const foo = 'bar'
  `
    )
  })

  describe("For 'on' and 'off' config when winning", () => {
    defineInlineTest(
      transform,
      fooWinnerOptions,
      `
import { booleanToggle } from '${packageName}'
const result = booleanToggle('foo', 'toggleIsOff', 'toggleIsOn')
const resultOfFunction = booleanToggle('foo', () => 'toggleIsOff', () => 'toggleIsOn')
booleanToggle('foo', null, () => 'toggleIsOn')
`,
      `
const result = 'toggleIsOn'
const resultOfFunction = 'toggleIsOn'
'toggleIsOn'
  `
    )
  })

  describe("For 'on' and 'off' config when losing, keep 'off' value", () => {
    defineInlineTest(
      transform,
      fooLoserOptions,
      `
import { booleanToggle } from '${packageName}'
const result = booleanToggle('foo', 'toggleIsOff', 'toggleIsOn')
const resultOfFunction = booleanToggle('foo', () => 'toggleIsOff', () => 'toggleIsOn')
booleanToggle('foo', null, () => 'toggleIsOn')
`,
      `
const result = 'toggleIsOff'
const resultOfFunction = 'toggleIsOff'
  `
    )
  })

  describe('Keeps the import if there are leftover toggle calls', () => {
    defineInlineTest(
      transform,
      fooWinnerOptions,
      `
import { booleanToggle } from '${packageName}'
const result = booleanToggle('foo')
const nonRelevantResult = booleanToggle('bar', 'a', 'b')
`,
      `
import { booleanToggle } from '${packageName}'
const result = true
const nonRelevantResult = booleanToggle('bar', 'a', 'b')
  `
    )
  })

  describe('Keeps Opticks imports other than booleanToggle', () => {
    defineInlineTest(
      transform,
      fooWinnerOptions,
      `
import { booleanToggle, foo } from '${packageName}'
const result = booleanToggle('foo')
`,
      `
import { foo } from '${packageName}';
const result = true
  `
    )
  })

  describe('Inline function body replacement', () => {
    defineInlineTest(
      transform,
      fooWinnerOptions,
      `
import { booleanToggle } from '${packageName}'
const result = booleanToggle('foo', () => foo())
`,
      `
const result = foo()
  `
    )
  })

  describe('Inline function body replacement with multiple statements', () => {
    defineInlineTest(
      transform,
      fooWinnerOptions,
      `
import { booleanToggle } from '${packageName}'
const result = booleanToggle('foo', 'a', () => {foo(); bar()})
`,
      `
const result = {foo(); bar()}
  `
    )
  })

  describe('Removes JSX call expressions upon removal', () => {
    defineInlineTest(
      transform,
      fooLoserOptions,
      `
import { booleanToggle } from '${packageName}'
const result = <div>Foo{booleanToggle('foo', 'bar')}</div>
`,
      `
const result = <div>Foo</div>
  `
    )

    defineInlineTest(
      transform,
      fooWinnerOptions,
      `
import { booleanToggle } from '${packageName}'
const result = <div>Foo{booleanToggle('foo', null)}</div>
`,
      `
const result = <div>Foo</div>
  `
    )
  })

  describe('Removes references to unused variables in call expressions upon removal', () => {
    defineInlineTest(
      transform,
      fooLoserOptions,
      `
import { booleanToggle } from '${packageName}'
import { Foo } from 'foo'
const result = <div>Foo{booleanToggle('foo', () => <Foo/>)}</div>
`,
      `
const result = <div>Foo</div>
  `
    )

    defineInlineTest(
      transform,
      fooLoserOptions,
      `
import { booleanToggle } from '${packageName}'
const Foo = () => void
const result = <div>Foo{booleanToggle('foo', () => Foo())}</div>
`,
      `
const result = <div>Foo</div>
  `
    )

    defineInlineTest(
      transform,
      fooLoserOptions,
      `
import { booleanToggle } from '${packageName}'
import { isBar } from 'foo'
import { Baz } from 'baz'
const result = <div>Foo{booleanToggle('foo', () => isBar && <Baz/>)}</div>
`,
      `
const result = <div>Foo</div>
  `
    )

    defineInlineTest(
      transform,
      fooLoserOptions,
      `
import { booleanToggle } from '${packageName}'
import isBar from 'foo'
import Baz from 'baz'
const result = <div>Foo{booleanToggle('foo', () => isBar && <Baz/>)}</div>
`,
      `
const result = <div>Foo</div>
  `
    )

    defineInlineTest(
      transform,
      fooLoserOptions,
      `
import { booleanToggle } from '${packageName}'
import isFoo from 'foo'
import { isBar } from 'bar'
import Bax from 'bax'

const stillUsed = true
console.log(Bax)
const result = <div>Foo{booleanToggle('foo', () => stillUsed && isFoo && isBar && <Bax/>)}</div>
if(stillUsed) doSomething()
`,
      `
import Bax from 'bax'

const stillUsed = true
console.log(Bax)
const result = <div>Foo</div>
if(stillUsed) doSomething()
  `
    )
  })
  describe('Deals with missing options', () => {
    const code = `
import { booleanConfig } from '${packageName}'
const result = booleanConfig('foo', 'a', () => {foo(); bar()})
`

    defineInlineTest(transform, {}, code, code)
  })
})
