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

const userIdFalse = 'zhhhh' // control
const userIdTrue = 'barbazhhhaaah' // variation

const attributes = {
  trafficSource: 'foo',
  deviceType: 'desktop',
  hasDefaultDates: true
}

it('returns the correct result', () => {
  expect(
    optimizelyClientInstance.isFeatureEnabled('foo', userIdTrue, attributes)
  ).toEqual(true)
  expect(
    optimizelyClientInstance.isFeatureEnabled('foo', userIdFalse, attributes)
  ).toEqual(false)

  expect(
    optimizelyClientInstance.getFeatureVariableString(
      'foo',
      'variation',
      userIdTrue,
      attributes
    )
  ).toEqual('b')

  expect(
    optimizelyClientInstance.getFeatureVariableString(
      'foo',
      'variation',
      userIdFalse,
      attributes
    )
  ).toEqual('a')

  expect(
    optimizelyClientInstance.getFeatureVariableString(
      'nonexistent',
      'variation',
      userIdFalse,
      attributes
    )
  ).toEqual(null)

  expect(
    optimizelyClientInstance.activate(
      'foo',
      'variation',
      userIdFalse,
      attributes
    )
  ).toEqual(null)

  mockEventListener.mockClear()

  // Broken on purpose, treatment vs a or b
  expect(
    optimizelyClientInstance.activate('foo', userIdTrue, attributes)
  ).toEqual('treatment')

  expect(
    optimizelyClientInstance.activate('foo', userIdTrue, attributes)
  ).toEqual('treatment')

  expect(mockEventListener).toHaveBeenCalledTimes(2)

  /*
  expect(
    optimizelyClientInstance.activate('bar', userIdTrue, attributes)
  ).toEqual('b')

  expect(
    optimizelyClientInstance.activate('bar', userIdTrue, attributes)
  ).toEqual('a')
  */
})
