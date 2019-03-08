// @flow

import {
  NOTIFICATION_TYPES,
  initialize,
  registerLibrary,
  setAudienceSegmentationAttribute,
  setAudienceSegmentationAttributes,
  booleanToggle,
  toggle,
  forceToggles
} from './optimizely'

// During the tests:
// for booleanToggle 'foo' yields true and 'bar' yields false, unless forced
// for toggle 'foo' yields 'b' and 'bar' yields 'a', unless forced
import datafile from './__fixtures__/dataFile.js'

import Optimizely, {
  addNotificationListenerMock,
  createInstanceMock,
  isFeatureEnabledMock,
  activateMock
} from '@optimizely/optimizely-sdk'

// Re-used between toggle test suites
const testAudienceSegmentationCacheBusting = (toggle, fn) => {
  it('Caches results until setAudienceSegmentationAttributes is called', () => {
    fn.mockClear()
    toggle('foo') // call activate for the first time
    toggle('foo') // cached, don't call activate
    toggle('bax') // call activate for the second time
    expect(fn).toHaveBeenCalledTimes(2)

    // Reset user attributes, clearing cache
    fn.mockClear()
    setAudienceSegmentationAttributes('barUserB', { foo: 'baz' })

    toggle('foo') // call 1
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('foo', 'barUserB', {
      foo: 'baz'
    })
    toggle('foo') // cached
    toggle('bar') // call 2
    toggle('bar') // cached
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenCalledWith('bar', 'barUserB', {
      foo: 'baz'
    })
  })

  it('Caches results until setAudienceSegmentationAttribute is called', () => {
    fn.mockClear()
    toggle('foo') // call activate for the first time
    toggle('foo') // cached, don't call activate
    toggle('bax') // call activate for the second time
    expect(fn).toHaveBeenCalledTimes(2)

    // Reset user attributes, clearing cache
    fn.mockClear()
    setAudienceSegmentationAttribute('bax', 'buzz')

    toggle('foo') // call 1
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('foo', 'fooBSide', {
      deviceType: 'mobile',
      bax: 'buzz'
    })
    toggle('foo') // cached
    toggle('bar') // call 2
    toggle('bar') // cached
    expect(fn).toHaveBeenCalledWith('bar', 'fooBSide', {
      deviceType: 'mobile',
      bax: 'buzz'
    })
    expect(fn).toHaveBeenCalledTimes(2)
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
          eventDispatcher: { dispatchEvent: expect.any(Function) }
        })
      })

      it('Subscribes to the Activate event', () => {
        expect(addNotificationListenerMock).toHaveBeenCalledWith(
          NOTIFICATION_TYPES.ACTIVATE,
          activateHandler
        )
      })
    })

    describe('with custom eventDispatcher', () => {
      beforeEach(() => {
        createInstanceMock.mockClear()
        activateHandler = jest.fn()
        eventDispatcher = { dispatchEvent: jest.fn() }

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

    describe('Boolean Toggles', () => {
      describe('Setting Audience Segmentation Attributes in bulk', () => {
        beforeEach(() => {
          setAudienceSegmentationAttributes('fooBSide', {
            deviceType: 'mobile'
          })
        })

        it('Forwards toggle reading and audienceSegmentationAttributes to Optimizely', () => {
          booleanToggle('foo')
          expect(isFeatureEnabledMock).toHaveBeenCalledWith('foo', 'fooBSide', {
            deviceType: 'mobile'
          })
        })

        testAudienceSegmentationCacheBusting(
          booleanToggle,
          isFeatureEnabledMock
        )

        describe('Setting Audience Segmentation Attributes individually', () => {
          beforeEach(() => {
            setAudienceSegmentationAttribute('bazz', 'bax')
            setAudienceSegmentationAttribute('foo', 'bar')
          })

          it('Forwards toggle reading and audienceSegmentationAttributes to Optimizely', () => {
            booleanToggle('foo')
            expect(isFeatureEnabledMock).toHaveBeenCalledWith(
              'foo',
              'fooBSide',
              {
                bazz: 'bax',
                foo: 'bar',
                deviceType: 'mobile'
              }
            )
          })
        })
      })

      it('Returns the value as supplied by Optimizely', () => {
        expect(booleanToggle('foo')).toBeTruthy()
        expect(booleanToggle('bar')).toBeFalsy()
      })
    })

    describe('Toggles', () => {
      beforeEach(() => {
        setAudienceSegmentationAttributes('fooBSide', { deviceType: 'mobile' })
      })

      it('Forwards toggle reading and audienceSegmentationAttributes to Optimizely', () => {
        toggle('foo')
        expect(activateMock).toHaveBeenCalledWith('foo', 'fooBSide', {
          deviceType: 'mobile'
        })
      })

      testAudienceSegmentationCacheBusting(toggle, activateMock)

      describe('Setting Audience Segmentation Attributes individually', () => {
        beforeEach(() => {
          setAudienceSegmentationAttribute('bazz', 'bax')
          setAudienceSegmentationAttribute('foo', 'bar')
        })

        it('Forwards toggle reading and audienceSegmentationAttributes to Optimizely', () => {
          booleanToggle('foo')
          expect(isFeatureEnabledMock).toHaveBeenCalledWith('foo', 'fooBSide', {
            bazz: 'bax',
            foo: 'bar',
            deviceType: 'mobile'
          })
        })
      })

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
        setAudienceSegmentationAttributes('fooBSide', {
          deviceType: 'mobile'
        })
        forceToggles({ foo: 'a', bar: false })
        // calling forceToggles multiple times should retain previously
        // forced toggles
        forceToggles({ bax: 'c', baz: true })
      })

      it('respects the overridden values', () => {
        expect(toggle('foo')).toEqual('a')
        expect(toggle('bax')).toEqual('c')
        expect(booleanToggle('bar')).toEqual(false)
        expect(booleanToggle('baz')).toEqual(true)
      })

      it('allows you to invent non-existing experiments', () => {
        expect(toggle('bax')).toEqual('c')
        expect(booleanToggle('baz')).toEqual(true)
      })

      it('persist after setAudienceSegmentationAttributes is called', () => {
        expect(toggle('bax')).toEqual('c')
        setAudienceSegmentationAttributes('newUserId', { foo: 'bar' })
        expect(toggle('foo')).toEqual('a')
        expect(toggle('bax')).toEqual('c')
        expect(booleanToggle('bar')).toEqual(false)
        expect(booleanToggle('baz')).toEqual(true)
      })

      it('persist after setAudienceSegmentationAttribute is called', () => {
        setAudienceSegmentationAttribute('foo', 'bar')
        expect(toggle('foo')).toEqual('a')
        expect(toggle('bax')).toEqual('c')
        expect(booleanToggle('bar')).toEqual(false)
        expect(booleanToggle('baz')).toEqual(true)
      })

      it('makes sure Toggles return defaults if forced values are of wrong type', () => {
        expect(toggle('baz')).toEqual('a')
        expect(booleanToggle('bax')).toEqual(false)
      })

      describe('Clearing forced toggles', () => {
        beforeEach(() => {
          forceToggles({ foo: null, bar: null })
        })

        it('should yield real values for cleared toggles', () => {
          expect(toggle('foo')).toEqual('b')
          expect(toggle('bar')).toEqual('a')
          expect(booleanToggle('foo')).toEqual(true)
          expect(booleanToggle('bar')).toEqual(false)
        })

        it('should keep the non-cleared forced toggles and other defaults', () => {
          expect(toggle('bax')).toEqual('c')
          expect(booleanToggle('baz')).toEqual(true)
          expect(toggle('nonexistent')).toEqual('a')
          expect(booleanToggle('nonexistent')).toEqual(false)
        })
      })
    })
  })
})
