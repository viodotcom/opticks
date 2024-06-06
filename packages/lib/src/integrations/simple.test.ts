import {initialize, getToggle} from './simple'

describe('Simple Integration', () => {
  describe('Toggles', () => {
    beforeEach(() => {
      initialize({
        toggles: {
          foo: {variant: 'b'},
          bar: {variant: 'a'}
        }
      })
    })

    it('Gets multi toggles by id', () => {
      expect(getToggle('foo')).toEqual('b')
      expect(getToggle('bar')).toEqual('a')
    })

    it('defaults to "a" when toggle cannot be found', () => {
      expect(getToggle('baz')).toEqual('a')
      // @ts-expect-error invalid API call for testing purpose
      expect(getToggle()).toEqual('a')
    })
  })
})
