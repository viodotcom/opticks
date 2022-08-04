// Just a playground to test the datafile with the real Optimizely integration

import datafile from './__fixtures__/dataFile.js'
import {NOTIFICATION_TYPES} from './optimizely'

const Optimizely = jest.requireActual('@optimizely/optimizely-sdk')
const defaultLogger = require('@optimizely/optimizely-sdk/lib/plugins/logger')
const LOG_LEVEL =
  require('@optimizely/optimizely-sdk/lib/utils/enums').LOG_LEVEL

jest.unmock('@optimizely/optimizely-sdk')

const mockActivateListener = jest.fn()
const mockIsFeatureEnabledListener = jest.fn()

const optimizelyClientInstance = Optimizely.createInstance({
  datafile,
  logger: defaultLogger.createLogger({
    logLevel: LOG_LEVEL.INFO,
  }),
})

optimizelyClientInstance.notificationCenter.addNotificationListener(
  NOTIFICATION_TYPES.ACTIVATE,
  mockActivateListener,
)

optimizelyClientInstance.notificationCenter.addNotificationListener(
  NOTIFICATION_TYPES.DECISION,
  mockIsFeatureEnabledListener,
)

const fooUserIdFalse = 'zhhhh' // control
const fooUserIdTrue = 'barbazhhhaaah' // variation
const barUserIdFalse = 'w=zkhkjz' // control
const barUserIdTrue = '2987010978kjhkjhd82' // variation

const fooCorrectSegmentationAttributes = {
  trafficSource: 'foo',
  deviceType: 'desktop',
  hasDefaultDates: true,
}

const fooIncorrectSegmentationAttributes = {
  trafficSource: 'foo',
  deviceType: 'desktop',
  hasDefaultDates: false,
}

it('returns the correct result with experiment / variables combination', () => {
  expect(
    optimizelyClientInstance.isFeatureEnabled(
      'foo',
      fooUserIdTrue,
      fooCorrectSegmentationAttributes,
    ),
  ).toEqual(true)

  expect(
    optimizelyClientInstance.isFeatureEnabled(
      'foo',
      fooUserIdFalse,
      fooCorrectSegmentationAttributes,
    ),
  ).toEqual(false)

  expect(
    optimizelyClientInstance.activate(
      'foo',
      fooUserIdTrue,
      fooCorrectSegmentationAttributes,
    ),
  ).toEqual('b')

  expect(
    optimizelyClientInstance.activate(
      'foo',
      fooUserIdFalse,
      fooCorrectSegmentationAttributes,
    ),
  ).toEqual('a')

  expect(
    optimizelyClientInstance.activate(
      'nonexistent',
      fooUserIdFalse,
      fooCorrectSegmentationAttributes,
    ),
  ).toEqual(null)

  mockActivateListener.mockClear()
  mockIsFeatureEnabledListener.mockClear()

  expect(
    optimizelyClientInstance.activate(
      'foo',
      fooUserIdTrue,
      fooCorrectSegmentationAttributes,
    ),
  ).toEqual('b')

  expect(
    optimizelyClientInstance.activate(
      'foo',
      fooUserIdFalse,
      fooCorrectSegmentationAttributes,
    ),
  ).toEqual('a')

  expect(
    optimizelyClientInstance.isFeatureEnabled(
      'foo',
      fooUserIdTrue,
      fooCorrectSegmentationAttributes,
    ),
  ).toEqual(true)

  expect(
    optimizelyClientInstance.isFeatureEnabled(
      'foo',
      fooUserIdFalse,
      fooCorrectSegmentationAttributes,
    ),
  ).toEqual(false)

  expect(mockActivateListener).toHaveBeenCalledTimes(2)
  expect(mockIsFeatureEnabledListener).toHaveBeenCalledTimes(4)
})

it('returns the correct result experiments / activate', () => {
  // Feature flags
  mockActivateListener.mockClear()
  expect(
    optimizelyClientInstance.isFeatureEnabled('bar', barUserIdFalse),
  ).toBeFalsy()
  expect(mockActivateListener).toHaveBeenCalledTimes(1)

  expect(
    optimizelyClientInstance.isFeatureEnabled('bar', barUserIdTrue),
  ).toBeTruthy()

  expect(mockActivateListener).toHaveBeenCalledTimes(2)

  mockActivateListener.mockClear()
  expect(optimizelyClientInstance.activate('bar', barUserIdFalse)).toEqual('a')
  expect(mockActivateListener).toHaveBeenCalledTimes(1)

  expect(optimizelyClientInstance.activate('bar', barUserIdTrue)).toEqual('b')
  expect(mockActivateListener).toHaveBeenCalledTimes(2)
})

it("doesn't call activate for experiments which your not eligble for based on audiences", () => {
  mockActivateListener.mockClear()
  expect(optimizelyClientInstance.activate('foo', fooUserIdTrue)).toEqual(null)
  expect(optimizelyClientInstance.activate('foo', fooUserIdFalse)).toEqual(null)
  expect(mockActivateListener).toHaveBeenCalledTimes(0)

  mockActivateListener.mockClear()
  expect(
    optimizelyClientInstance.activate(
      'foo',
      fooUserIdTrue,
      fooIncorrectSegmentationAttributes,
    ),
  ).toEqual(null)

  expect(
    optimizelyClientInstance.activate(
      'foo',
      fooUserIdFalse,
      fooIncorrectSegmentationAttributes,
    ),
  ).toEqual(null)
  expect(mockActivateListener).toHaveBeenCalledTimes(0)
})
