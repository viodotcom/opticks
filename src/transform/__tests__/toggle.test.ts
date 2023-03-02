jest.autoMockOff()

import {defineInlineTest} from 'jscodeshift/dist/testUtils'
import transform from '../toggle'
// @ts-expect-error: default to TSX parser
transform.parser = 'tsx'

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

const X = () => <div>{toggle('foo', 'a', null)}</div>
`,
      `
const foo = 'bar'

const X = () => <div>{}</div>
  `
    )
  })

  describe('Removing unused variables in losing variations', () => {
    defineInlineTest(
      transform,
      fooWinnerBConfig,
      `
import { toggle } from '${packageName}'
const A = 'removeme'
const B = 'keepme'
const C = 'removeme'
const result = toggle('foo', () => A(), () => B(), () => C())
`,
      `
const B = 'keepme'
const result = B()
  `
    )
  })

  describe('Removing unused variables in losing variations, only if not used in other variations', () => {
    defineInlineTest(
      transform,
      fooWinnerBConfig,
      `
import { toggle } from '${packageName}'
const B = 'keepme'
const C = 'removeme'
const result = toggle('foo', () => B(), () => B(), () => C())
`,
      `
const B = 'keepme'
const result = B()
  `
    )
  })
  
  describe('Removing unused variables in losing variations, only if not used elsewhere', () => {
    defineInlineTest(
      transform,
      fooWinnerBConfig,
      `
import { toggle } from '${packageName}'
import {B} from 'somewhere'

const A = 'removeme'
const C = 'keepme'

const result = toggle('foo', () => B(), () => B(), () => C())
const result2 = toggle('foo', () => A(), () => B(), () => C())

C()
`,
      `
import {B} from 'somewhere'

const C = 'keepme'

const result = B()
const result2 = B()

C()
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
})
