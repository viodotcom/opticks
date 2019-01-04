// @flow

import { multiToggle as baseMultiToggle } from './multiToggle'

describe('Multi Toggle', () => {
  let multiToggle

  beforeEach(() => {
    const dummyGetToggle = jest.fn(
      // only 'foo' is considered true for the tests
      toggleId => (toggleId === 'foo' ? 'b' : 'a')
    )

    multiToggle = baseMultiToggle(dummyGetToggle)
  })

  xdescribe('Getting active variant', () => {
    it('is case insensitive', () => {
      expect(getActiveVariant('fOO')).toEqual('b')
    })

    it("defaults to 'a' when experiment cannot be found", () => {
      expect(getActiveVariant('nonexistentId')).toEqual('a')
    })
  })

  describe('Experiment Variant', () => {
    it('returns the correct variant based on argument index', () => {
      expect(multiToggle('foo', 'a', 'b', 'c')).toEqual('b')
    })

    it('executes variant and forwards return value if it is a function', () => {
      const spy = jest.fn().mockImplementation(() => 'bar')
      const result = multiToggle('foo', 'a', spy, 'c')

      expect(spy).toBeCalled()
      expect(result).toEqual('bar')
    })

    it("defaults to 'a' when experiment cannot be found", () => {
      expect(multiToggle('nonexistentId', 'a', 'b', 'c')).toEqual('a')
    })
  })
})
