// @flow

import type { ToggleIdType } from '../types'
import { booleanToggle as baseBooleanToggle } from '../core/booleanToggle'
import { multiToggle as baseMultiToggle } from '../core/multiToggle'
import { NOTIFICATION_TYPES } from '@optimizely/optimizely-sdk/lib/utils/enums'

import type OptimizelyLibType from '@optimizely/optimizely-sdk'

type UserIdType = string
type UserAttributesType = {
  [string]: string
}

type ToggleValueType = string | boolean

export type OptimizelyDatafileType = any // $FlowFixMe

export { NOTIFICATION_TYPES }

let Optimizely: OptimizelyLibType // reference to injected Optimizely library
let optimizelyClient // reference to active Optimizely instance
let userId: UserIdType
let userAttributes: UserAttributesType
let featureEnabledCache = {}
let experimentCache = {}

export const registerLibrary = (lib: OptimizelyLibType) => {
  // TODO: Double-check if this works with server environments
  // Since they load the module in memory, make sure they are not persisted
  // across different requests
  Optimizely = lib
}

const clearFeatureEnabledCache = () => (featureEnabledCache = {})
const clearExperimentCache = () => (experimentCache = {})

export const setUserAttributes = (
  id: UserIdType,
  attributes: UserAttributesType = {}
) => {
  clearFeatureEnabledCache()
  clearExperimentCache()
  userId = id
  userAttributes = attributes
}

type ActivateEventHandlerType = Function
type EventDispatcherType = { dispatchEvent: Function }

const voidActivateHandler = () => null
const voidEventDispatcher = {
  dispatchEvent: () => null
}

export const initialize = (
  datafile: OptimizelyDatafileType,
  onExperimentDecision: ActivateEventHandlerType = voidActivateHandler,
  eventDispatcher: EventDispatcherType = voidEventDispatcher
) => {
  optimizelyClient = Optimizely.createInstance({
    datafile,
    eventDispatcher: eventDispatcher
  })

  addActivateListener(onExperimentDecision)
}

export const addActivateListener = listener =>
  optimizelyClient.notificationCenter.addNotificationListener(
    NOTIFICATION_TYPES.ACTIVATE,
    listener
  )

const isCached = (toggleId, cache) => cache.hasOwnProperty(toggleId)

const getOrSetCachedFeatureEnabled = toggleId => {
  if (isCached(toggleId, featureEnabledCache)) {
    return featureEnabledCache[toggleId]
  }

  return (featureEnabledCache[toggleId] = optimizelyClient.isFeatureEnabled(
    toggleId,
    userId,
    userAttributes
  ))
}

const getBooleanToggle = getOrSetCachedFeatureEnabled

export const booleanToggle = baseBooleanToggle(getBooleanToggle)

const getMultiToggle = (toggleId: ToggleIdType): string => {
  if (isCached(toggleId, experimentCache)) return experimentCache[toggleId]

  const isEnabled = getOrSetCachedFeatureEnabled(toggleId)

  // Abusing the feature flags to store variations: 'a,' 'b,' 'c etc'.
  // TODO: Decide if we want to cache experiment values as well
  return (
    (isEnabled &&
      optimizelyClient.getFeatureVariableString(
        toggleId,
        'variation',
        userId,
        userAttributes
      )) ||
    'a'
  )
}

export const multiToggle = baseMultiToggle(getMultiToggle)

export const forceToggles = (toggleKeyValues: {
  [ToggleIdType]: ?ToggleValueType
}) => {
  Object.keys(toggleKeyValues).forEach(toggleId => {
    const value = toggleKeyValues[toggleId]

    if (value === null) {
      delete featureEnabledCache[toggleId]
      delete experimentCache[toggleId]
    } else {
      const cache =
        typeof value === 'boolean' ? featureEnabledCache : experimentCache
      cache[toggleId] = value
    }
  })
}
