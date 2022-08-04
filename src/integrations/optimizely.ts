import OptimizelyLib from '@optimizely/optimizely-sdk'
import {ToggleIdType} from '../types'
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

export type OptimizelyDatafileType = any

export const NOTIFICATION_TYPES = {
  DECISION: 'DECISION:type, userId, attributes, decisionInfo',
}

let optimisely = OptimizelyLib // reference to injected Optimizely library
let optimizelyClient // reference to active Optimizely instance
let userId: UserIdType
let audienceSegmentationAttributes: AudienceSegmentationAttributesType = {}

type FeatureEnabledCacheType = {[key in ToggleIdType]?: BooleanToggleValueType}
type ExperimentCacheType = {[key in ToggleIdType]?: ExperimentToggleValueType}
type ForcedTogglesType = {[key in ToggleIdType]?: ToggleValueType}

let featureEnabledCache: FeatureEnabledCacheType = {}
let experimentCache: ExperimentCacheType = {}
const forcedToggles: ForcedTogglesType = {}

export const registerLibrary = (lib) => {
  // TODO: Double-check if this works with server environments
  // Since they load the module in memory, make sure they are not persisted
  // across different requests
  optimisely = lib
}

const clearFeatureEnabledCache = () => (featureEnabledCache = {})
const clearExperimentCache = () => (experimentCache = {})

// Adds / removes Toggles to force from the forcedToggles list
export const forceToggles = (toggleKeyValues: {
  [key in ToggleIdType]?: ToggleValueType | undefined
}) => {
  for (const toggleId of Object.keys(toggleKeyValues)) {
    const value = toggleKeyValues[toggleId]

    if (value === null) {
      delete forcedToggles[toggleId]
    } else {
      forcedToggles[toggleId] = value
    }
  }
}

const invalidateCaches = () => {
  clearFeatureEnabledCache()
  clearExperimentCache()
}

export const setUserId = (id: UserIdType) => {
  invalidateCaches()
  userId = id
}

export const setAudienceSegmentationAttributes = (
  attributes: AudienceSegmentationAttributesType = {},
) => {
  invalidateCaches()
  audienceSegmentationAttributes = {
    ...audienceSegmentationAttributes,
    ...attributes,
  }
}

export const resetAudienceSegmentationAttributes = () => {
  invalidateCaches()
  audienceSegmentationAttributes = {}
}

type ActivateEventHandlerType = () => void
type EventDispatcherType = {dispatchEvent: () => void}

const voidActivateHandler = () => null
const voidEventDispatcher = {
  dispatchEvent: () => null,
}

export const initialize = (
  datafile: OptimizelyDatafileType,
  onExperimentDecision: ActivateEventHandlerType = voidActivateHandler,
  eventDispatcher: EventDispatcherType = voidEventDispatcher,
) => {
  optimizelyClient = optimisely.createInstance({
    datafile,
    eventDispatcher,
  })

  addActivateListener(onExperimentDecision)
  return optimizelyClient
}

export const addActivateListener = (listener) =>
  optimizelyClient.notificationCenter.addNotificationListener(
    NOTIFICATION_TYPES.DECISION,
    listener,
  )

const isForcedOrCached = (toggleId, cache): boolean =>
  forcedToggles.hasOwnProperty(toggleId) || cache.hasOwnProperty(toggleId)

const getForcedOrCached = (toggleId, cache): ToggleValueType => {
  const register = forcedToggles.hasOwnProperty(toggleId)
    ? forcedToggles
    : cache

  return register[toggleId]
}

const validateUserId = (id) => {
  if (!id) throw new Error('Opticks: Fatal error: user id is not set')
}

const getOrSetCachedFeatureEnabled = (toggleId): BooleanToggleValueType => {
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

export const isUserInRolloutAudience = (toggleId) => {
  const config = optimizelyClient.projectConfigManager.getConfig()
  const feature = config.featureKeyMap[toggleId]
  const rollout = config.rolloutIdMap[feature.rolloutId]

  const endIndex = rollout.experiments.length - 1
  let index
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

const isPausedBooleanToggle = (rolloutRule) => {
  // TODO: Support a/b/c MVTs
  const trafficAllocationVariation = rolloutRule.trafficAllocation[0]
  // We consider a toggle paused if traffic is 100% to either side
  return (
    typeof trafficAllocationVariation === 'undefined' ||
    trafficAllocationVariation.endOfRange === 10_000
  )
}

const getBooleanToggle = getOrSetCachedFeatureEnabled

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

const convertBooleanToggleToFeatureVariant = (toggleId) => {
  const isFeatureEnabled = getBooleanToggle(toggleId)
  return isFeatureEnabled ? 'b' : 'a'
}

export const toggle = (...args) => {
  // An A/B/C... test
  if (args.length > 3) {
    // @ts-expect-error
    return baseToggle(getToggle)(...args)
  }

  // @ts-expect-error
  return baseToggle(convertBooleanToggleToFeatureVariant)(...args)
}

/**
 * Get all enabled features for the user
 */
export const getEnabledFeatures = () => {
  validateUserId(userId)

  return optimizelyClient.getEnabledFeatures(
    userId,
    audienceSegmentationAttributes,
  )
}
