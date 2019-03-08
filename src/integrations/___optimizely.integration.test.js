// @flow

// Just a playground to test the datafile with the real Optimizely integration

import datafile from './__fixtures__/dataFile.js'
import { NOTIFICATION_TYPES } from '@optimizely/optimizely-sdk/lib/utils/enums'
const Optimizely = jest.requireActual('@optimizely/optimizely-sdk')
const defaultLogger = require('@optimizely/optimizely-sdk/lib/plugins/logger')
const LOG_LEVEL = require('@optimizely/optimizely-sdk/lib/utils/enums')
  .LOG_LEVEL

jest.unmock('@optimizely/optimizely-sdk')

const mockEventListener = jest.fn()

const optimizelyClientInstance = Optimizely.createInstance({
  datafile,
  logger: defaultLogger.createLogger({
    logLevel: LOG_LEVEL.INFO
  })
})

optimizelyClientInstance.notificationCenter.addNotificationListener(
  NOTIFICATION_TYPES.ACTIVATE,
  mockEventListener
)

/*
optimizelyClientInstance.notificationCenter.addNotificationListener(
  NOTIFICATION_TYPES.ACTIVATE,
  experiment => console.log(experiment)
)
*/

const fooUserIdFalse = 'zhhhh' // control
const fooUserIdTrue = 'barbazhhhaaah' // variation

const attributes = {
  trafficSource: 'foo',
  deviceType: 'desktop',
  hasDefaultDates: true
}

it('returns the correct result with experiment / variables combination', () => {
  expect(
    optimizelyClientInstance.isFeatureEnabled('foo', fooUserIdTrue, attributes)
  ).toEqual(true)
  expect(
    optimizelyClientInstance.isFeatureEnabled('foo', fooUserIdFalse, attributes)
  ).toEqual(false)

  expect(
    optimizelyClientInstance.activate('foo', fooUserIdTrue, attributes)
  ).toEqual('b')

  expect(
    optimizelyClientInstance.activate('foo', fooUserIdFalse, attributes)
  ).toEqual('a')

  /*
  expect(
    optimizelyClientInstance.activate(
      'nonexistent',
      'variation',
      fooUserIdFalse,
      attributes
    )
  ).toEqual(null)
  */

  /*
  expect(
    optimizelyClientInstance.activate(
      'foo',
      'variation',
      fooUserIdFalse,
      attributes
    )
  ).toEqual(null)
  */

  mockEventListener.mockClear()

  expect(
    optimizelyClientInstance.activate('foo', fooUserIdTrue, attributes)
  ).toEqual('b')

  expect(
    optimizelyClientInstance.activate('foo', fooUserIdFalse, attributes)
  ).toEqual('a')

  expect(mockEventListener).toHaveBeenCalledTimes(2)
})

it('returns the correct result experiments / activate', () => {
  // Feature flags
  mockEventListener.mockClear()
  expect(
    optimizelyClientInstance.isFeatureEnabled('bar', 'w=zkhkjz')
  ).toBeFalsy()
  // console.log(mockEventListener.mock.calls[0])
  expect(mockEventListener).toHaveBeenCalledTimes(1)

  expect(
    optimizelyClientInstance.isFeatureEnabled('bar', '2987010978kjhkjhd82')
  ).toBeTruthy()
  // console.log(mockEventListener.mock.calls[1])

  expect(mockEventListener).toHaveBeenCalledTimes(2)

  mockEventListener.mockClear()
  expect(optimizelyClientInstance.activate('bar', 'w=zkhkjz')).toEqual('a')
  expect(mockEventListener).toHaveBeenCalledTimes(1)

  expect(
    optimizelyClientInstance.activate('bar', '2987010978kjhkjhd82')
  ).toEqual('b')
  expect(mockEventListener).toHaveBeenCalledTimes(2)

  /*
  expect(
    optimizelyClientInstance.activate('bar', fooUserIdTrue, attributes)
  ).toEqual('b')

  expect(
    optimizelyClientInstance.activate('bar', fooUserIdTrue, attributes)
  ).toEqual('a')
  */
})
