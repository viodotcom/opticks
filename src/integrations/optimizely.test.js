// @flow

import {
  NOTIFICATION_TYPES,
  initialize,
  registerLibrary,
  setAudienceSegmentationAttribute,
  setAudienceSegmentationAttributes,
  booleanToggle,
  multiToggle,
  forceToggles
} from './optimizely'

// During the tests:
// for booleanToggle 'foo' yields true and 'bar' yields false, unless forced
// for multiToggle 'foo' yields 'b' and 'bar' yields 'a', unless forced
import datafile from './__fixtures__/dataFile.js'

import Optimizely, {
  addNotificationListenerMock,
  createInstanceMock,
  isFeatureEnabledMock,
  getFeatureVariableStringMock
} from '@optimizely/optimizely-sdk'

// Re-used between toggle test suites
const testAudienceSegmentationCacheBusting = toggle => {
  it('Caches isFeatureEnabled results until setAudienceSegmentationAttributes is called', () => {
    toggle('foo') // call isFeatureEnabled for the first time
    toggle('foo') // cached, don't call isFeatureEnabled
    toggle('bax') // call isFeatureEnabled for the second time
    expect(isFeatureEnabledMock).toHaveBeenCalledTimes(2)

    // Reset user attributes, clearing cache
    isFeatureEnabledMock.mockClear()
    setAudienceSegmentationAttributes('barUser', { foo: 'baz' })

    toggle('foo') // call 1
    expect(isFeatureEnabledMock).toHaveBeenCalledTimes(1)
    expect(isFeatureEnabledMock).toHaveBeenCalledWith('foo', 'barUser', {
      foo: 'baz'
    })
    toggle('foo') // cached
    toggle('bar') // call 2
    toggle('bar') // cached
    expect(isFeatureEnabledMock).toHaveBeenCalledTimes(2)
    expect(isFeatureEnabledMock).toHaveBeenCalledWith('bar', 'barUser', {
      foo: 'baz'
    })
  })

  it('Caches isFeatureEnabled results until setAudienceSegmentationAttribute is called', () => {
    toggle('foo') // call isFeatureEnabled for the first time
    toggle('foo') // cached, don't call isFeatureEnabled
    toggle('bax') // call isFeatureEnabled for the second time
    expect(isFeatureEnabledMock).toHaveBeenCalledTimes(2)

    // Reset user attributes, clearing cache
    isFeatureEnabledMock.mockClear()
    setAudienceSegmentationAttribute('bax', 'buzz')

    toggle('foo') // call 1
    expect(isFeatureEnabledMock).toHaveBeenCalledTimes(1)
    expect(isFeatureEnabledMock).toHaveBeenCalledWith('foo', 'fooUser', {
      deviceType: 'mobile',
      bax: 'buzz'
    })
    toggle('foo') // cached
    toggle('bar') // call 2
    toggle('bar') // cached
    expect(isFeatureEnabledMock).toHaveBeenCalledWith('bar', 'fooUser', {
      deviceType: 'mobile',
      bax: 'buzz'
    })
    expect(isFeatureEnabledMock).toHaveBeenCalledTimes(2)
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
          setAudienceSegmentationAttributes('fooUser', { deviceType: 'mobile' })
          booleanToggle('foo')
        })

        it('Forwards toggle reading and audienceSegmentationAttributes to Optimizely', () => {
          expect(isFeatureEnabledMock).toHaveBeenCalledWith('foo', 'fooUser', {
            deviceType: 'mobile'
          })
        })

        testAudienceSegmentationCacheBusting(booleanToggle)

        describe('Setting Audience Segmentation Attributes individually', () => {
          beforeEach(() => {
            setAudienceSegmentationAttribute('bazz', 'bax')
            setAudienceSegmentationAttribute('foo', 'bar')
            booleanToggle('foo')
          })

          it('Forwards toggle reading and audienceSegmentationAttributes to Optimizely', () => {
            expect(isFeatureEnabledMock).toHaveBeenCalledWith(
              'foo',
              'fooUser',
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

    describe('Multi Toggles', () => {
      beforeEach(() => {
        setAudienceSegmentationAttributes('fooUser', { deviceType: 'mobile' })
        multiToggle('foo')
      })

      it('Calls isFeatureEnabled to force experiment activation', () => {
        expect(isFeatureEnabledMock).toHaveBeenCalledWith('foo', 'fooUser', {
          deviceType: 'mobile'
        })
      })

      it('Forwards toggle reading and audienceSegmentationAttributes to Optimizely', () => {
        expect(getFeatureVariableStringMock).toHaveBeenCalledWith(
          'foo',
          'variation',
          'fooUser',
          {
            deviceType: 'mobile'
          }
        )
      })

      testAudienceSegmentationCacheBusting(multiToggle)

      describe('Setting Audience Segmentation Attributes individually', () => {
        beforeEach(() => {
          setAudienceSegmentationAttribute('bazz', 'bax')
          setAudienceSegmentationAttribute('foo', 'bar')
          booleanToggle('foo')
        })

        it('Forwards toggle reading and audienceSegmentationAttributes to Optimizely', () => {
          expect(isFeatureEnabledMock).toHaveBeenCalledWith('foo', 'fooUser', {
            bazz: 'bax',
            foo: 'bar',
            deviceType: 'mobile'
          })
        })
      })

      it("Returns Optimizely's value when no arguments supplied", () => {
        // maps to a, b, c
        expect(multiToggle('foo')).toEqual('b')
        expect(multiToggle('bar')).toEqual('a')
      })

      it('Maps Optimizely value to a, b, c indexed arguments', () => {
        expect(multiToggle('foo', 'first', 'second', 'third')).toEqual('second')
        expect(multiToggle('bar', 'first', 'second')).toEqual('first')
      })
    })

    describe('Forcing toggles', () => {
      beforeEach(() => {
        forceToggles({ foo: 'a', bar: false, bax: 'c', baz: true })
      })

      it('respects the overridden values', () => {
        expect(multiToggle('foo')).toEqual('a')
        expect(booleanToggle('bar')).toEqual(false)
      })

      it('allows you to invent non-existing experiments', () => {
        expect(multiToggle('bax')).toEqual('c')
        expect(booleanToggle('baz')).toEqual(true)
      })

      it('persists after setAudienceSegmentationAttributes is called', () => {
        expect(multiToggle('bax')).toEqual('c')
        setAudienceSegmentationAttributes('newUserId', { foo: 'bar' })
        expect(multiToggle('foo')).toEqual('a')
        expect(multiToggle('bax')).toEqual('c')
        expect(booleanToggle('bar')).toEqual(false)
        expect(booleanToggle('baz')).toEqual(true)
      })

      it('persists after setAudienceSegmentationAttribute is called', () => {
        setAudienceSegmentationAttribute('foo', 'bar')
        expect(multiToggle('foo')).toEqual('a')
        expect(multiToggle('bax')).toEqual('c')
        expect(booleanToggle('bar')).toEqual(false)
        expect(booleanToggle('baz')).toEqual(true)
      })

      describe('Clearing forced toggles', () => {
        beforeEach(() => {
          forceToggles({ foo: null, bar: null })
        })

        it('should yield real values for cleared toggles', () => {
          expect(multiToggle('foo')).toEqual('b')
          expect(multiToggle('bar')).toEqual('a')
          expect(booleanToggle('foo')).toEqual(true)
          expect(booleanToggle('bar')).toEqual(false)
        })
        it('should keep the non-cleared forced toggles and other defaults', () => {
          expect(multiToggle('bax')).toEqual('c')
          expect(booleanToggle('baz')).toEqual(true)
          expect(multiToggle('nonexistent')).toEqual('a')
          expect(booleanToggle('nonexistent')).toEqual(false)
        })
      })
    })
  })
})
