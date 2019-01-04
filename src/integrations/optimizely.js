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

export type OptimizelyDatafileType = any // $FlowFixMe

export { NOTIFICATION_TYPES }

let Optimizely: OptimizelyLibType // reference to injected Optimizely
let optimizelyClient // reference to active Optimizely instance
let userId: UserIdType
let userAttributes: UserAttributesType
let featureEnabledCache = {}

export const registerLibrary = (lib: OptimizelyLibType) => {
  // TODO: Double-check if this works with server environments
  // Since they load the module in memory, make sure they are not persisted
  // across different requests
  Optimizely = lib
}

const clearFeatureEnabledCache = () => (featureEnabledCache = {})

export const setUserAttributes = (
  id: UserIdType,
  attributes: UserAttributesType
) => {
  clearFeatureEnabledCache()
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

  optimizelyClient.notificationCenter.addNotificationListener(
    NOTIFICATION_TYPES.ACTIVATE,
    onExperimentDecision
  )
}

const getFeatureEnabled = toggleId => {
  if (featureEnabledCache.hasOwnProperty(toggleId)) {
    return featureEnabledCache[toggleId]
  }

  return (featureEnabledCache[toggleId] = optimizelyClient.isFeatureEnabled(
    toggleId,
    userId,
    userAttributes
  ))
}

const getBooleanToggle = getFeatureEnabled

export const booleanToggle = baseBooleanToggle(getBooleanToggle)

const getMultiToggle = (toggleId: ToggleIdType) => {
  const isEnabled = getFeatureEnabled(toggleId)

  // Abusing the feature flags to store variations: 'a,' 'b,' 'c etc'.
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
