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
  // NOTIFICATION_TYPES.ACTIVATE,
  'DECISION:type, userId, attributes, decisionInfo',
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
const barUserIdFalse = 'w=zkhkjz' // control
const barUserIdTrue = '2987010978kjhkjhd82' // variation

const fooCorrectSegmentationAttributes = {
  trafficSource: 'foo',
  deviceType: 'desktop',
  hasDefaultDates: true
}

const fooIncorrectSegmentationAttributes = {
  trafficSource: 'foo',
  deviceType: 'desktop',
  hasDefaultDates: false
}

it('returns the correct result with experiment / variables combination', () => {
  expect(
    optimizelyClientInstance.isFeatureEnabled(
      'foo',
      fooUserIdTrue,
      fooCorrectSegmentationAttributes
    )
  ).toEqual(true)

  expect(
    optimizelyClientInstance.isFeatureEnabled(
      'foo',
      fooUserIdFalse,
      fooCorrectSegmentationAttributes
    )
  ).toEqual(false)

  expect(
    optimizelyClientInstance.activate(
      'foo',
      fooUserIdTrue,
      fooCorrectSegmentationAttributes
    )
  ).toEqual('b')

  expect(
    optimizelyClientInstance.activate(
      'foo',
      fooUserIdFalse,
      fooCorrectSegmentationAttributes
    )
  ).toEqual('a')

  expect(
    optimizelyClientInstance.activate(
      'nonexistent',
      fooUserIdFalse,
      fooCorrectSegmentationAttributes
    )
  ).toEqual(null)

  mockEventListener.mockClear()

  expect(
    optimizelyClientInstance.activate(
      'foo',
      fooUserIdTrue,
      fooCorrectSegmentationAttributes
    )
  ).toEqual('b')

  expect(
    optimizelyClientInstance.activate(
      'foo',
      fooUserIdFalse,
      fooCorrectSegmentationAttributes
    )
  ).toEqual('a')

  expect(mockEventListener).toHaveBeenCalledTimes(2)
})

it('returns the correct result experiments / activate', () => {
  // Feature flags
  mockEventListener.mockClear()
  expect(
    optimizelyClientInstance.isFeatureEnabled('bar', barUserIdFalse)
  ).toBeFalsy()
  expect(mockEventListener).toHaveBeenCalledTimes(1)

  expect(
    optimizelyClientInstance.isFeatureEnabled('bar', barUserIdTrue)
  ).toBeTruthy()
  // console.log(mockEventListener.mock.calls[1])

  expect(mockEventListener).toHaveBeenCalledTimes(2)

  mockEventListener.mockClear()
  expect(optimizelyClientInstance.activate('bar', barUserIdFalse)).toEqual('a')
  expect(mockEventListener).toHaveBeenCalledTimes(1)

  expect(optimizelyClientInstance.activate('bar', barUserIdTrue)).toEqual('b')
  expect(mockEventListener).toHaveBeenCalledTimes(2)
})

it("doesn't call activate for experiments which your not eligble for based on audiences", () => {
  mockEventListener.mockClear()
  expect(optimizelyClientInstance.activate('foo', fooUserIdTrue)).toEqual(null)
  expect(optimizelyClientInstance.activate('foo', fooUserIdFalse)).toEqual(null)
  expect(mockEventListener).toHaveBeenCalledTimes(0)

  mockEventListener.mockClear()
  expect(
    optimizelyClientInstance.activate(
      'foo',
      fooUserIdTrue,
      fooIncorrectSegmentationAttributes
    )
  ).toEqual(null)

  expect(
    optimizelyClientInstance.activate(
      'foo',
      fooUserIdFalse,
      fooIncorrectSegmentationAttributes
    )
  ).toEqual(null)
  expect(mockEventListener).toHaveBeenCalledTimes(0)
})
