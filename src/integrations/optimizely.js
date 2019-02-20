// @flow

import type { ToggleIdType } from '../types'
import { booleanToggle as baseBooleanToggle } from '../core/booleanToggle'
import { multiToggle as baseMultiToggle } from '../core/multiToggle'
import { NOTIFICATION_TYPES } from '@optimizely/optimizely-sdk/lib/utils/enums'

import type OptimizelyLibType from '@optimizely/optimizely-sdk'

type UserIdType = string
type AudienceSegmentationAttributeKeyType = string
type AudienceSegmentationAttributeValueType = string | boolean

type AudienceSegmentationAttributesType = {
  [AudienceSegmentationAttributeKeyType]: AudienceSegmentationAttributeValueType
}

type ToggleValueType = string | boolean

export type OptimizelyDatafileType = any // $FlowFixMe

export { NOTIFICATION_TYPES }

let Optimizely: OptimizelyLibType // reference to injected Optimizely library
let optimizelyClient // reference to active Optimizely instance
let userId: UserIdType
let audienceSegmentationAttributes: AudienceSegmentationAttributesType

let featureEnabledCache = {}
let experimentCache = {}
let forcedToggles = {}

export const registerLibrary = (lib: OptimizelyLibType) => {
  // TODO: Double-check if this works with server environments
  // Since they load the module in memory, make sure they are not persisted
  // across different requests
  Optimizely = lib
}

const clearFeatureEnabledCache = () => (featureEnabledCache = {})
const clearExperimentCache = () => (experimentCache = {})

export const setAudienceSegmentationAttributes = (
  id: UserIdType,
  attributes: AudienceSegmentationAttributesType = {}
) => {
  clearFeatureEnabledCache()
  clearExperimentCache()
  userId = id
  audienceSegmentationAttributes = attributes
}

export const setAudienceSegmentationAttribute = (
  key: AudienceSegmentationAttributeKeyType,
  value: AudienceSegmentationAttributeValueType
) => {
  clearFeatureEnabledCache()
  clearExperimentCache()
  audienceSegmentationAttributes[key] = value
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

const isForcedOrCached = (toggleId, cache) =>
  forcedToggles.hasOwnProperty(toggleId) || cache.hasOwnProperty(toggleId)

const getForcedOrCached = (toggleId, cache) => {
  const register = forcedToggles.hasOwnProperty(toggleId)
    ? forcedToggles
    : cache

  return register[toggleId]
}

const getOrSetCachedFeatureEnabled = toggleId => {
  if (isForcedOrCached(toggleId, featureEnabledCache)) {
    return getForcedOrCached(toggleId, featureEnabledCache)
  }

  return (featureEnabledCache[toggleId] = optimizelyClient.isFeatureEnabled(
    toggleId,
    userId,
    audienceSegmentationAttributes
  ))
}

const getBooleanToggle = getOrSetCachedFeatureEnabled

export const booleanToggle = baseBooleanToggle(getBooleanToggle)

const getMultiToggle = (toggleId: ToggleIdType): string => {
  if (isForcedOrCached(toggleId, experimentCache)) {
    return getForcedOrCached(toggleId, experimentCache)
  }

  const isEnabled = getOrSetCachedFeatureEnabled(toggleId)

  // Abusing the feature flags to store variations: 'a', 'b', 'c' etc.
  // TODO: Decide if we want to cache experiment values as well
  return (
    (isEnabled &&
      optimizelyClient.getFeatureVariableString(
        toggleId,
        'variation',
        userId,
        audienceSegmentationAttributes
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
      delete forcedToggles[toggleId]
    } else {
      forcedToggles[toggleId] = value
    }
  })
}
