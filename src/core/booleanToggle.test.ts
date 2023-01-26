// @flow

import { booleanToggle as baseBooleanToggle } from './booleanToggle'

describe('Boolean Toggles', () => {
  let booleanToggle

  beforeEach(() => {
    const dummyGetToggle = jest.fn(
      // only 'foo' is considered true for the tests
      toggleId => (toggleId && toggleId.toLowerCase() === 'foo') || false
    )

    booleanToggle = baseBooleanToggle(dummyGetToggle)
  })

  describe('Simple boolean return', () => {
    it('is case insensitive', () => {
      expect(booleanToggle('fOO')).toEqual(true)
      expect(booleanToggle('bAR')).toEqual(false)
    })
  })

  describe('On Toggle Execution', () => {
    it('Executes if toggle value is a function', () => {
      expect(booleanToggle('foo', () => 'returnForOn')).toEqual('returnForOn')
    })

    it('Always returns false for toggles that are off', () => {
      expect(booleanToggle('bar', () => 'foo')).toEqual(false)
      expect(booleanToggle('bar', true)).toEqual(false)
      expect(booleanToggle('bar', false)).toEqual(false)
    })

    it('Returns false for non-existent toggles', () => {
      expect(booleanToggle('baz', 'foo')).toEqual(false)
    })
  })

  describe('When both Off and On toggles are specified', () => {
    it('Returns value for active side of the toggle', () => {
      expect(booleanToggle('foo', 'toggleIsOff', 'toggleIsOn')).toEqual(
        'toggleIsOn'
      )
      expect(booleanToggle('bar', 'toggleIsOff', 'toggleIsOn')).toEqual(
        'toggleIsOff'
      )
    })
    it('Executes value for active side of the toggle if it is a function', () => {
      expect(
        booleanToggle('foo', () => 'toggleIsOff', () => 'toggleIsOn')
      ).toEqual('toggleIsOn')
      expect(booleanToggle('bar', null, () => 'toggleIsOn')).toEqual(null)
    })
  })
})
