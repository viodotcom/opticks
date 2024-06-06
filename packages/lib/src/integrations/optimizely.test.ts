import {
  NOTIFICATION_TYPES,
  initialize,
  registerLibrary,
  setUserId,
  setAudienceSegmentationAttributes,
  resetAudienceSegmentationAttributes,
  toggle,
  forceToggles,
  getEnabledFeatures
} from './optimizely'

// During the tests:
// for toggle 'foo' yields 'b' and 'bar' yields 'a', unless forced
import datafile from './__fixtures__/dataFile'

import Optimizely, {
  // @ts-expect-error
  addNotificationListenerMock,
  // @ts-expect-error
  createInstanceMock,
  // @ts-expect-error
  isFeatureEnabledMock,
  // @ts-expect-error
  getEnabledFeaturesMock,
  // @ts-expect-error
  activateMock,
  // @ts-expect-error
  decideMock,
  // @ts-expect-error
  optimizelyUserContextMock
} from '@optimizely/optimizely-sdk'

// Re-used between toggle test suites
const testAudienceSegmentationCacheBusting = (toggleFn, fn) => {
  it('Caches results until setAudienceSegmentationAttributes is called', () => {
    resetAudienceSegmentationAttributes()
    fn.mockClear()
    toggleFn('foo', 'a', 'b', 'c') // call activate for the first time
    toggleFn('foo', 'a', 'b', 'c') // cached, don't call activate
    toggleFn('bax', 'a', 'b', 'c') // call activate for the second time
    expect(fn).toHaveBeenCalledTimes(2)

    // Reset user attributes, clearing cache
    fn.mockClear()
    setAudienceSegmentationAttributes({foo: 'baz'})

    toggleFn('foo', 'a', 'b', 'c') // call 1
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('foo', 'fooBSide', {
      foo: 'baz'
    })
    toggleFn('foo', 'a', 'b', 'c') // cached
    toggleFn('bar', 'a', 'b', 'c') // call 2
    toggleFn('bar', 'a', 'b', 'c') // cached
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenCalledWith('bar', 'fooBSide', {
      foo: 'baz'
    })
  })
}

describe('Optimizely Integration', () => {
  let activateHandler = null
  let eventDispatcher = null

  describe('Initialization', () => {
    describe('with default eventDispatcher', () => {
      beforeEach(() => {
        createInstanceMock.mockClear()
        activateHandler = jest.fn()

        registerLibrary(Optimizely)
        initialize(datafile, activateHandler)
      })

      it('Initializes with the dataFile for Optimizely and default eventDispatcher', () => {
        expect(createInstanceMock).toHaveBeenCalledWith({
          datafile,
          eventDispatcher: {dispatchEvent: expect.any(Function)}
        })
      })

      it('Subscribes to the Activate event', () => {
        expect(addNotificationListenerMock).toHaveBeenCalledWith(
          NOTIFICATION_TYPES.DECISION,
          // 'DECISION:type, userId, attributes, decisionInfo',
          activateHandler
        )
      })
    })

    describe('with custom eventDispatcher', () => {
      beforeEach(() => {
        createInstanceMock.mockClear()
        activateHandler = jest.fn()
        eventDispatcher = {dispatchEvent: jest.fn()}

        registerLibrary(Optimizely)
        initialize(datafile, activateHandler, eventDispatcher)
      })

      it('attaches supplied eventDispatcher', () => {
        expect(createInstanceMock).toHaveBeenCalledWith({
          datafile,
          eventDispatcher
        })
      })
    })
  })

  describe('Toggles', () => {
    beforeEach(() => {
      createInstanceMock.mockClear()
      isFeatureEnabledMock.mockClear()
      activateHandler = jest.fn()

      registerLibrary(Optimizely)
      initialize(datafile, activateHandler)
    })

    describe('Toggles', () => {
      describe('Calls without userId are invalid', () => {
        it('Throws an error when userId is not set', () => {
          expect(() => toggle('foo')).toThrow(
            'Opticks: Fatal error: user id is not set'
          )
        })
      })

      describe('Setting user id', () => {
        beforeEach(() => {
          setUserId('fooBSide')
        })

        /*
        it('Switches between boolean and multi toggle depending on the amount of arguments', () => {
          expect(toggle('foo', 'a', 'b', 'c')).toEqual('b')
          expect(toggle('bax', 'a', 'b', 'c')).toEqual('c')
          expect(toggle('foo')).toEqual('b')
          expect(toggle('bar')).toEqual('a')
        })
        */

        it('Forwards toggle reading and audienceSegmentationAttributes to Optimizely', () => {
          toggle('foo', 'a', 'b', 'c')
          expect(activateMock).toHaveBeenCalledWith('foo', 'fooBSide', {})
          toggle('foo')
          expect(decideMock).toHaveBeenCalledWith(
            'foo'
          )
          expect(optimizelyUserContextMock).toHaveBeenCalledWith(
            'fooBSide', {}
          )
        })
      })

      describe('Setting Audience Segmentation Attributes', () => {
        beforeEach(() => {
          // setAudienceSegmentationAttributes doesn't overwrite already existing attributes
          setAudienceSegmentationAttributes({
            thisWillNotBeOverwritten: 'foo'
          })
          setAudienceSegmentationAttributes({
            deviceType: 'mobile',
            isLoggedIn: false
          })
        })

        it('Forwards toggle reading and audienceSegmentationAttributes to Optimizely', () => {
          toggle('foo', 'a', 'b', 'c')
          expect(activateMock).toHaveBeenCalledWith('foo', 'fooBSide', {
            thisWillNotBeOverwritten: 'foo',
            deviceType: 'mobile',
            isLoggedIn: false
          })
        })

        it('Forwards toggle reading and audienceSegmentationAttributes to Optimizely', () => {
          toggle('foo')
          expect(optimizelyUserContextMock).toHaveBeenCalledWith('fooBSide', {
            thisWillNotBeOverwritten: 'foo',
            deviceType: 'mobile',
            isLoggedIn: false
          })
        })
      })

      describe('Resetting Audience Segmentation Attributes', () => {
        beforeEach(() => {
          setAudienceSegmentationAttributes({thisWillBeReset: false})
          resetAudienceSegmentationAttributes()
          setAudienceSegmentationAttributes({valueAfterReset: true})
        })

        it('Forwards correct audience segmentation attributes', () => {
          toggle('foo', 'a', 'b', 'c')
          expect(activateMock).toHaveBeenCalledWith('foo', 'fooBSide', {
            valueAfterReset: true
          })

          toggle('foo', 'a', 'b')
          expect(optimizelyUserContextMock).toHaveBeenCalledWith('fooBSide', {
            valueAfterReset: true
          })

          toggle('foo')
          expect(optimizelyUserContextMock).toHaveBeenCalledWith('fooBSide', {
            valueAfterReset: true
          })
        })
      })

      testAudienceSegmentationCacheBusting(toggle, activateMock)

      it("Returns Optimizely's value when no arguments supplied", () => {
        // maps to a, b, c
        expect(toggle('foo')).toEqual('b')
        expect(toggle('bar')).toEqual('a')
      })

      it('Maps Optimizely value to a, b, c indexed arguments', () => {
        expect(toggle('foo', 'first', 'second', 'third')).toEqual('second')
        expect(toggle('bar', 'first', 'second')).toEqual('first')
      })
    })

    describe('Forcing toggles', () => {
      beforeEach(() => {
        setAudienceSegmentationAttributes({
          deviceType: 'mobile'
        })
        forceToggles({foo: 'a', bar: false})
        // calling forceToggles multiple times should retain previously
        // forced toggles
        forceToggles({bax: 'c', baz: true})
      })

      it('respects the overridden values', () => {
        expect(toggle('foo', 'a', 'b', 'c')).toEqual('a')
        expect(toggle('bax', 'a', 'b', 'c')).toEqual('c')
        expect(toggle('bar')).toEqual('a')
        expect(toggle('baz')).toEqual('b')
      })

      it('allows you to invent non-existing experiments', () => {
        expect(toggle('bax', 'a', 'b', 'c')).toEqual('c')
      })

      it('persist after setAudienceSegmentationAttributes is called', () => {
        expect(toggle('bax', 'a', 'b', 'c')).toEqual('c')
        setAudienceSegmentationAttributes({foo: 'bar'})
        expect(toggle('foo', 'a', 'b', 'c')).toEqual('a')
        expect(toggle('bax', 'a', 'b', 'c')).toEqual('c')
      })

      it('makes sure Toggles return defaults if forced values are of wrong type', () => {
        expect(toggle('baz', 'a', 'b', 'c')).toEqual('a')
      })

      describe('Clearing forced toggles', () => {
        beforeEach(() => {
          forceToggles({foo: null, bar: null})
        })

        it('should yield real values for cleared toggles', () => {
          expect(toggle('foo', 'a', 'b', 'c')).toEqual('b')
          expect(toggle('bar', 'a', 'b', 'c')).toEqual('a')
        })

        it('should keep the non-cleared forced toggles and other defaults', () => {
          expect(toggle('bax', 'a', 'b', 'c')).toEqual('c')
          expect(toggle('nonexistent', 'a', 'b', 'c')).toEqual('a')
        })
      })
    })
  })

  describe('getEnabledFeatures', () => {
    beforeEach(() => {
      setUserId('chewbacca')
      setAudienceSegmentationAttributes({
        deviceType: 'desktop'
      })
    })

    it('should return enabled features for R2-D2 user', () => {
      setUserId('R2-D2')
      expect(getEnabledFeatures()).toEqual([
        'R2-D2-desktop-test-1',
        'R2-D2-desktop-test-2'
      ])
    })

    it('should return enabled features for C-3PO user', () => {
      setUserId('C-3PO')
      expect(getEnabledFeatures()).toEqual([
        'C-3PO-desktop-test-1',
        'C-3PO-desktop-test-2'
      ])
    })

    it('should return enabled features for C-3PO user for mobile', () => {
      setUserId('C-3PO')
      setAudienceSegmentationAttributes({
        deviceType: 'mobile'
      })
      expect(getEnabledFeatures()).toEqual([
        'C-3PO-mobile-test-1',
        'C-3PO-mobile-test-2'
      ])
    })
  })
})
