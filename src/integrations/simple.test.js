// @flow

import { initialize, getBooleanToggle, getMultiToggle } from './simple'

describe('Simple Integration', () => {
  describe('Boolean Toggles', () => {
    beforeEach(() => {
      initialize({
        booleanToggles: {
          foo: true,
          bar: false
        }
      })
    })

    it('Gets boolean toggles by id', () => {
      expect(getBooleanToggle('foo')).toBeTruthy()
      expect(getBooleanToggle('bar')).toBeFalsy()
    })

    it('defaults to false when toggle cannot be found', () => {
      expect(getBooleanToggle('baz')).toEqual(false)
      // $FlowFixMe: invalid API call for testing purpose
      expect(getBooleanToggle()).toEqual(false)
    })
  })

  describe('Multi Toggles', () => {
    beforeEach(() => {
      initialize({
        multiToggles: {
          foo: { variant: 'b' },
          bar: { variant: 'a' }
        }
      })
    })

    it('Gets multi toggles by id', () => {
      expect(getMultiToggle('foo')).toEqual('b')
      expect(getMultiToggle('bar')).toEqual('a')
    })

    it('defaults to "a" when toggle cannot be found', () => {
      expect(getMultiToggle('baz')).toEqual('a')
      // $FlowFixMe: invalid API call for testing purpose
      expect(getMultiToggle()).toEqual('a')
    })
  })
})
