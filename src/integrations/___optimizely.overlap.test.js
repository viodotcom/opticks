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

  mockEventListener.mockClear()
})

it('returns the correct result experiments / activate', () => {
  const barUserIdTrue = '2987010978kjhkjhd82'
  const barUserIdFalse = 'w=zkhkjz'

  /*
  mockEventListener.mockClear()

  expect(
    optimizelyClientInstance.isFeatureEnabled('bar', barUserIdFalse)
  ).toBeFalsy()

  expect(
    optimizelyClientInstance.isFeatureEnabled('bar', barUserIdTrue)
  ).toBeTruthy()
  expect(mockEventListener).toHaveBeenCalledTimes(2)
  */

  mockEventListener.mockClear()
  expect(optimizelyClientInstance.activate('bar', barUserIdFalse)).toEqual('a')
  expect(optimizelyClientInstance.activate('bar', barUserIdTrue)).toEqual('b')
  expect(mockEventListener).toHaveBeenCalledTimes(2)
})
