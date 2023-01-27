import OptimizelyLib, {EventDispatcher} from '@optimizely/optimizely-sdk'
import type {ToggleIdType} from '../types'
import {booleanToggle as baseBooleanToggle} from '../core/booleanToggle'
import {toggle as baseToggle} from '../core/toggle'

type UserIdType = string
type AudienceSegmentationAttributeKeyType = string
type AudienceSegmentationAttributeValueType = string | boolean

type AudienceSegmentationAttributesType = {
  [key in AudienceSegmentationAttributeKeyType]?: AudienceSegmentationAttributeValueType
}

type BooleanToggleValueType = boolean
type ExperimentToggleValueType = string
type ToggleValueType = ExperimentToggleValueType | BooleanToggleValueType

export type OptimizelyDatafileType = object

export const NOTIFICATION_TYPES = {
  DECISION: 'DECISION:type, userId, attributes, decisionInfo',
}

let optimizely = OptimizelyLib // reference to injected Optimizely library
let optimizelyClient // reference to active Optimizely instance
let userId: UserIdType
let audienceSegmentationAttributes: AudienceSegmentationAttributesType = {}

type FeatureEnabledCacheType = {
  [key in ToggleIdType]: BooleanToggleValueType
}
type ExperimentCacheType = {[key in ToggleIdType]: ExperimentToggleValueType}
type CacheType = FeatureEnabledCacheType | ExperimentCacheType
type ForcedTogglesType = {[Tkey in ToggleIdType]: ToggleValueType}

let featureEnabledCache: FeatureEnabledCacheType = {}
let experimentCache: ExperimentCacheType = {}
const forcedToggles: ForcedTogglesType = {}

/**
 * Registers an externally passed in OptimizelySDK instance to use.
 * This is meant to give flexibility in which SDK to use, but since Opticks
 * now relies on a specific version this will be bundled in future versions.
 *
 * @param lib OptimizelySDK
 */
export const registerLibrary = (lib) => {
  // TODO: Double-check if this works with server environments
  // Since they load the module in memory, make sure they are not persisted
  // across different requests
  optimizely = lib
}

const clearFeatureEnabledCache = () => (featureEnabledCache = {})
const clearExperimentCache = () => (experimentCache = {})

/**
 * Adds / removes Toggles to force from the forcedToggles list
 *
 * @param toggleKeyValues
 */
export const forceToggles = (toggleKeyValues: {
  [key in ToggleIdType]: ToggleValueType | null
}) => {
  Object.keys(toggleKeyValues).forEach((toggleId) => {
    const value = toggleKeyValues[toggleId]

    if (value === null) {
      delete forcedToggles[toggleId]
    } else {
      forcedToggles[toggleId] = value
    }
  })
}

const invalidateCaches = () => {
  clearFeatureEnabledCache()
  clearExperimentCache()
}

/**
 * Sets the userId and invalidates caches so each toggle will
 * be re-evaluated in the next call.
 *
 * @param id
 */
export const setUserId = (id: UserIdType) => {
  invalidateCaches()
  userId = id
}

/**
 * Sets audience segmentation attributes and invalidates caches
 * so each toggle will be re-evaluated in the next call.
 *
 * @param attributes
 */
export const setAudienceSegmentationAttributes = (
  attributes: AudienceSegmentationAttributesType = {},
) => {
  invalidateCaches()
  audienceSegmentationAttributes = {
    ...audienceSegmentationAttributes,
    ...attributes,
  }
}

/**
 * Clears all audience segmentation attributes and invalidates caches
 * so each toggle will be re-evaluated in the next call.
 */
export const resetAudienceSegmentationAttributes = () => {
  invalidateCaches()
  audienceSegmentationAttributes = {}
}

type ActivateEventHandlerType = Function

const voidActivateHandler = () => null
const voidEventDispatcher = {
  dispatchEvent: () => null,
}

/**
 * Initializes Opticks with the supplied Optimizely datafile,
 * and allows for registering experimentDecision handlers and custom
 * event dispatcher.
 *
 * @param datafile Optimizely Rollouts JSON datafile
 * @param onExperimentDecision Experiment decision listener
 * @param eventDispatcher Custom event dispatcher
 * @returns Optimizely Instance
 */
export const initialize = (
  datafile: OptimizelyDatafileType,
  onExperimentDecision: ActivateEventHandlerType = voidActivateHandler,
  eventDispatcher: EventDispatcher = voidEventDispatcher,
): OptimizelyLib.Client => {
  optimizelyClient = optimizely.createInstance({
    datafile,
    eventDispatcher: eventDispatcher,
  })

  addActivateListener(onExperimentDecision)
  return optimizelyClient
}

/**
 * Registers custom decision listener
 *
 * @param listener
 * @returns void
 */
export const addActivateListener = (listener) =>
  optimizelyClient.notificationCenter.addNotificationListener(
    NOTIFICATION_TYPES.DECISION,
    listener,
  )

const isForcedOrCached = (toggleId: ToggleIdType, cache: CacheType): boolean =>
  forcedToggles.hasOwnProperty(toggleId) || cache.hasOwnProperty(toggleId)

const getForcedOrCached = (
  toggleId: ToggleIdType,
  cache: CacheType,
): ToggleValueType => {
  const register = forcedToggles.hasOwnProperty(toggleId)
    ? forcedToggles
    : cache

  return register[toggleId]
}

const validateUserId = (id) => {
  if (!id) throw new Error('Opticks: Fatal error: user id is not set')
}

const getOrSetCachedFeatureEnabled = (
  toggleId: ToggleIdType,
): BooleanToggleValueType => {
  validateUserId(userId)

  const DEFAULT = false

  if (isForcedOrCached(toggleId, featureEnabledCache)) {
    const value = getForcedOrCached(toggleId, featureEnabledCache)
    return typeof value === 'boolean' ? value : DEFAULT
  }

  return (featureEnabledCache[toggleId] = optimizelyClient.isFeatureEnabled(
    toggleId,
    userId,
    audienceSegmentationAttributes,
  ))
}

/**
 * Determines whether a user satisfies the audience requirements for a toggle.

 * Since it uses an internal method of the SDK this unfortunately ties Opticks to
 * the specific Optimizely SDK version.
 *
 * @param toggleId
 */
export const isUserInRolloutAudience = (toggleId: ToggleIdType) => {
  const config = optimizelyClient.projectConfigManager.getConfig()
  const feature = config.featureKeyMap[toggleId]
  const rollout = config.rolloutIdMap[feature.rolloutId]

  const endIndex = rollout.experiments.length - 1
  let index: number
  let isInAnyAudience = false

  for (index = 0; index < endIndex; index++) {
    const rolloutRule = config.experimentKeyMap[rollout.experiments[index].key]
    const decisionIfUserIsInAudience =
      optimizelyClient.decisionService.__checkIfUserIsInAudience(
        config,
        rolloutRule.key,
        'rule',
        userId,
        audienceSegmentationAttributes,
        '',
      )

    // This will be decisionIfUserIsInAudience.result for Optimizely 4.3.3 and up
    if (decisionIfUserIsInAudience && !isPausedBooleanToggle(rolloutRule))
      isInAnyAudience = true
  }

  const isEveryoneElseRulePaused = isPausedBooleanToggle(
    config.experimentKeyMap[rollout.experiments[endIndex].key],
  )

  return isInAnyAudience || !isEveryoneElseRulePaused
}

/**
 * Determines whether a boolean toggle (feature flag) is fully to one side,
 * which for tracking purposes can be considered to be "paused" and therefor shouldn't
 * be tracked as an active experiment.
 *
 * @param rolloutRule Optimizely Rollout Rule
 * @returns
 */
const isPausedBooleanToggle = (rolloutRule: {
  trafficAllocation: [{endOfRange: number}]
}) => {
  // TODO: Support a/b/c MVTs
  const trafficAllocationVariation = rolloutRule.trafficAllocation[0]
  // We consider a toggle paused if traffic is 100% to either side
  return (
    typeof trafficAllocationVariation === 'undefined' ||
    trafficAllocationVariation.endOfRange === 10000
  )
}

const getBooleanToggle = getOrSetCachedFeatureEnabled

/**
 * @deprecated Since the `toggle` function supports both flags and MVT experiments
 */
export const booleanToggle = baseBooleanToggle(getBooleanToggle)

const getToggle = (toggleId: ToggleIdType): ExperimentToggleValueType => {
  validateUserId(userId)

  const DEFAULT = 'a'

  if (isForcedOrCached(toggleId, experimentCache)) {
    const value = getForcedOrCached(toggleId, experimentCache)
    return typeof value === 'string' ? value : DEFAULT
  }

  // Assuming the variation keys follow a, b, c, etc. convention
  // TODO: Enforce ^ ?
  return (experimentCache[toggleId] =
    optimizelyClient.activate(
      toggleId,
      userId,
      audienceSegmentationAttributes,
    ) || DEFAULT)
}

const convertBooleanToggleToFeatureVariant = (toggleId: ToggleIdType) => {
  const isFeatureEnabled = getBooleanToggle(toggleId)
  return isFeatureEnabled ? 'b' : 'a'
}

/**
 * Returns the active value, or executes the active function if an arrow function is passed.
 *
 * Variants can be either values, in which case they both should be of the same type,
 * or arrow functions which will be executed for the winning side, the return type is unknown
 * on purpose since it's expected the return value will likely be implicit.
 *
 * @param toggleId
 * @param variants
 */
export function toggle<A = unknown>(toggleId: string, ...variants: A[]): A
export function toggle<T = unknown>(
  toggleId: string,
  ...variants: (() => T)[]
): T
export function toggle(toggleId: ToggleIdType, ...variants) {
  // An A/B/C... test
  if (variants.length > 2) {
    return baseToggle(getToggle)(toggleId, ...variants)
  } else {
    return baseToggle(convertBooleanToggleToFeatureVariant)(
      toggleId,
      ...variants,
    )
  }
}

/**
 * Get all enabled features for the user
 *
 * @deprecated
 */
export const getEnabledFeatures = () => {
  validateUserId(userId)

  return optimizelyClient.getEnabledFeatures(
    userId,
    audienceSegmentationAttributes,
  )
}
