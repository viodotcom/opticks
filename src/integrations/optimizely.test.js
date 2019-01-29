// @flow

import {
  NOTIFICATION_TYPES,
  initialize,
  registerLibrary,
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
      beforeEach(() => {
        setAudienceSegmentationAttributes('fooUser', { deviceType: 'mobile' })
        booleanToggle('foo')
      })

      it('Forwards toggle reading and audienceSegmentationAttributes to Optimizely', () => {
        expect(isFeatureEnabledMock).toHaveBeenCalledWith('foo', 'fooUser', {
          deviceType: 'mobile'
        })
      })

      it('Returns the value as supplied by Optimizely', () => {
        expect(booleanToggle('foo')).toBeTruthy()
        expect(booleanToggle('bar')).toBeFalsy()
      })

      it('Caches isFeatureEnabled results until setAudienceSegmentationAttributes is called', () => {
        booleanToggle('foo')
        booleanToggle('foo')
        booleanToggle('bax')
        expect(isFeatureEnabledMock).toHaveBeenCalledTimes(2)

        // Reset user attributes, clearing cache
        isFeatureEnabledMock.mockClear()
        setAudienceSegmentationAttributes('barUser', { foo: 'baz' })

        booleanToggle('foo')
        expect(isFeatureEnabledMock).toHaveBeenCalledTimes(1)
        expect(isFeatureEnabledMock).toHaveBeenCalledWith('foo', 'barUser', {
          foo: 'baz'
        })
        booleanToggle('foo')
        booleanToggle('bar')
        booleanToggle('bar')
        expect(isFeatureEnabledMock).toHaveBeenCalledWith('bar', 'barUser', {
          foo: 'baz'
        })
        expect(isFeatureEnabledMock).toHaveBeenCalledTimes(2)
      })
    })

    describe('Multi Toggles', () => {
      beforeEach(() => {
        setAudienceSegmentationAttributes('barUser', { deviceType: 'desktop' })
        multiToggle('foo')
      })

      it('Calls isFeatureEnabled to force experiment activation', () => {
        expect(isFeatureEnabledMock).toHaveBeenCalledWith('foo', 'barUser', {
          deviceType: 'desktop'
        })
      })

      it('Forwards toggle reading and audienceSegmentationAttributes to Optimizely', () => {
        expect(getFeatureVariableStringMock).toHaveBeenCalledWith(
          'foo',
          'variation',
          'barUser',
          {
            deviceType: 'desktop'
          }
        )
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

      // TODO: DRY
      it('Caches isFeatureEnabled results until setAudienceSegmentationAttributes is called', () => {
        multiToggle('foo')
        multiToggle('foo')
        multiToggle('bax')
        expect(isFeatureEnabledMock).toHaveBeenCalledTimes(2)

        // Reset user attributes, clearing cache
        isFeatureEnabledMock.mockClear()
        setAudienceSegmentationAttributes('barUser', { foo: 'baz' })

        multiToggle('foo')
        expect(isFeatureEnabledMock).toHaveBeenCalledTimes(1)
        expect(isFeatureEnabledMock).toHaveBeenCalledWith('foo', 'barUser', {
          foo: 'baz'
        })
        multiToggle('foo')
        multiToggle('bar')
        multiToggle('bar')
        expect(isFeatureEnabledMock).toHaveBeenCalledWith('bar', 'barUser', {
          foo: 'baz'
        })
        expect(isFeatureEnabledMock).toHaveBeenCalledTimes(2)
      })
    })

    describe('Forcing toggles', () => {
      beforeEach(() => {
        forceToggles({ foo: 'a', bar: false, bax: 'c', baz: true })
      })

      it('Respects the overridden values', () => {
        expect(multiToggle('foo')).toEqual('a')
        expect(booleanToggle('bar')).toEqual(false)
      })

      it('Allows you to invent non-existing experiments', () => {
        expect(multiToggle('bax')).toEqual('c')
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
