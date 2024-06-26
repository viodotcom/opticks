import OptimizelyLib, {
  EventDispatcher,
  Client,
  OptimizelyUserContext,
  NotificationListener,
  ListenerPayload
} from '@optimizely/optimizely-sdk'
import {ToggleFuncReturnType, ToggleIdType, VariantType} from '../types'
import {toggle as baseToggle} from '../core/toggle'

type UserIdType = string
type AudienceSegmentationAttributeKeyType = string
type AudienceSegmentationAttributeValueType = string | boolean

type AudienceSegmentationAttributesType = {
  [key in AudienceSegmentationAttributeKeyType]?: AudienceSegmentationAttributeValueType
}

type ExperimentToggleValueType = string | boolean
type ToggleValueType = ExperimentToggleValueType

export type OptimizelyDatafileType = object

export const NOTIFICATION_TYPES = OptimizelyLib.enums.NOTIFICATION_TYPES

let optimizely = OptimizelyLib // reference to injected Optimizely library
let optimizelyClient: Client | null // reference to active Optimizely instance
let userId: UserIdType
let audienceSegmentationAttributes: AudienceSegmentationAttributesType = {}
let userContext: OptimizelyUserContext

type FeatureEnabledCacheType = {
  [key in ToggleIdType]: ExperimentToggleValueType
}
type ExperimentCacheType = {[key in ToggleIdType]: ExperimentToggleValueType}
type CacheType = FeatureEnabledCacheType | ExperimentCacheType
type ForcedTogglesType = {[Tkey in ToggleIdType]: ToggleValueType}

let experimentCache: ExperimentCacheType = {}
const forcedToggles: ForcedTogglesType = {}

/**
 * Registers an externally passed in OptimizelySDK library to use.
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

const clearExperimentCache = () => {
  experimentCache = {}
}

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

    /**
     * Keeping the old behaviour of using boolean values for toggles to represent `a` and `b` versions
     */
    const isBoolean = typeof value === 'boolean'
    if (isBoolean) {
      forcedToggles[toggleId] = value ? 'b' : 'a'
      return
    }

    if (value === null) {
      delete forcedToggles[toggleId]
    } else {
      forcedToggles[toggleId] = value
    }
  })
}

const invalidateCaches = () => {
  clearExperimentCache()
}

/**
 * Sets the userId and invalidates caches so each toggle will
 * be re-evaluated in the next call.
 *
 * @param id
 */
export const setUserId = (id: UserIdType) => {
  if (userId !== id) invalidateCaches()
  userId = id
}

/**
 * Sets audience segmentation attributes and invalidates caches
 * so each toggle will be re-evaluated in the next call.
 *
 * @param attributes
 */
export const setAudienceSegmentationAttributes = (
  attributes: AudienceSegmentationAttributesType = {}
) => {
  const newSegmentationAttributes = {
    ...audienceSegmentationAttributes,
    ...attributes
  }

  const shouldInvalidateCache =
    JSON.stringify(newSegmentationAttributes) !==
    JSON.stringify(audienceSegmentationAttributes || {})

  if (shouldInvalidateCache) {
    invalidateCaches()
  }

  audienceSegmentationAttributes = newSegmentationAttributes
}

/**
 * Clears all audience segmentation attributes and invalidates caches
 * so each toggle will be re-evaluated in the next call.
 */
export const resetAudienceSegmentationAttributes = () => {
  invalidateCaches()
  audienceSegmentationAttributes = {}
}

const voidActivateHandler = () => null
const voidEventDispatcher = {
  dispatchEvent: () => null
}

export enum ExperimentType {
  flag = 'flag',
  mvt = 'feature-test'
}

/**
 * REVIEW: This decisionInfo payload cannot be found anywhere in the types in the SDK.
 * However the information typed here is sent, the payload changes based on whether it is a feature flag or MVT, so typing it here.
 * https://github.com/optimizely/javascript-sdk/blob/625cb7c3835e31e25b16fa34b5f25a2bda42ed57/packages/optimizely-sdk/lib/optimizely/index.ts#L1577
 *
 * It would be best if Opticks abstracts this difference from the client in future versions.
 */
export interface ActivateNotificationPayload extends ListenerPayload {
  type: ExperimentType
  decisionInfo: {
    flagKey: ToggleIdType
    variationKey: VariantType
  }
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
  onExperimentDecision: NotificationListener<ActivateNotificationPayload> = voidActivateHandler,
  eventDispatcher: EventDispatcher = voidEventDispatcher
): Client => {
  optimizelyClient = optimizely.createInstance({
    datafile,
    eventDispatcher: eventDispatcher
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
export const addActivateListener = (
  listener: NotificationListener<ActivateNotificationPayload>
) => {
  const decisionListener = (payload: ActivateNotificationPayload) => {
    const {variationKey} = payload.decisionInfo
    const decision =
      variationKey === 'on' ? 'b' : variationKey === 'off' ? 'a' : variationKey

    const updatedPayload = {
      ...payload,
      decisionInfo: {...payload.decisionInfo, variationKey: decision}
    }

    return listener(updatedPayload)
  }

  /**
   * This is a temporary support for the initial convention defined during the migration that "on" === "b" and "off" === "a"
   * With the latest SDK version, A/B tests and target deliveries return a string key for the variation
   * We will migrate the current experiments to the new convention and remove this temporary support.
   * In the new convention we will always use the variation key as the decision.
   */
  // TODO (@vlacerda) [2024-06-30]: By this time we should ping @vlacerda to evaluate again if the fix is still needed and remove it if not.
  return optimizelyClient.notificationCenter.addNotificationListener(
    NOTIFICATION_TYPES.DECISION,
    decisionListener
  )
}

const isForcedOrCached = (toggleId: ToggleIdType, cache: CacheType): boolean =>
  forcedToggles.hasOwnProperty(toggleId) || cache.hasOwnProperty(toggleId)

const getForcedOrCached = (
  toggleId: ToggleIdType,
  cache: CacheType
): ToggleValueType => {
  const register = forcedToggles.hasOwnProperty(toggleId)
    ? forcedToggles
    : cache

  return register[toggleId]
}

const validateUserId = (id) => {
  if (!id) throw new Error('Opticks: Fatal error: user id is not set')
}

/**
 * Determines whether a user satisfies the audience requirements for a toggle.

 * Since it uses an internal method of the SDK this unfortunately ties Opticks to
 * the specific Optimizely SDK version.
 *
 * @param toggleId
 */
export const isUserInRolloutAudience = (toggleId: ToggleIdType) => {
  // @ts-expect-error we're being naughty here and using internals
  const config = optimizelyClient.projectConfigManager.getConfig()
  // feature in the config object represents an a/b test
  const feature = config.featureKeyMap[toggleId]
  // rollout is a targeted delivery
  const rollout = config.rolloutIdMap[feature.rolloutId]
  // both a/b tests and targeted deliveries can have audiences
  const allRules = [...rollout.experiments]

  /**
   * The feature object supplies ids through experimentIds.
   * We find the rules for each experiment and add them to the allRules array.
   */
  if (feature.experimentIds.length > 0) {
    const {experimentIds} = feature
    const experimentRules = experimentIds.map(
      (experimentId) => config.experimentIdMap[experimentId]
    )
    allRules.push(...experimentRules)
  }

  const isInAnyAudience = allRules.reduce((acc, rule) => {
    // Reference: https://github.com/optimizely/javascript-sdk/blob/851b06622fa6a0239500b3b65e2d3937334960de/lib/core/decision_service/index.ts#L403
    const decisionIfUserIsInAudience =
      // @ts-expect-error we're being naughty here and using internals
      optimizelyClient.decisionService.checkIfUserIsInAudience(
        config,
        rule,
        'rule',
        userContext,
        audienceSegmentationAttributes,
        ''
      )

    if (decisionIfUserIsInAudience.result && !isPausedBooleanToggle(rule))
      return true

    return acc
  }, false)

  return isInAnyAudience
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
  const trafficAllocationVariation = rolloutRule.trafficAllocation[0]
  // We consider a toggle paused if traffic is 100% to either side
  return (
    typeof trafficAllocationVariation === 'undefined' ||
    trafficAllocationVariation.endOfRange === 10000
  )
}

const getToggle = (toggleId: ToggleIdType): ExperimentToggleValueType => {
  validateUserId(userId)

  const DEFAULT = 'a'

  if (isForcedOrCached(toggleId, experimentCache)) {
    const value = getForcedOrCached(toggleId, experimentCache)
    return typeof value === 'string' ? value : DEFAULT
  }

  userContext = optimizelyClient.createUserContext(
    userId,
    audienceSegmentationAttributes
  )

  const variationKey = userContext.decide(toggleId).variationKey

  /**
   * This is a temporary support for the initial convention defined during the migration that "on" === "b" and "off" === "a"
   * With the latest SDK version, A/B tests and target deliveries return a string key for the variation
   * We will migrate the current experiments to the new convention and remove this temporary support.
   * In the new convention we will always use the variation key as the decision.
   */
  // TODO (@vlacerda) [2024-06-30]: By this time we should ping @vlacerda to evaluate again if the fix is still needed and remove it if not.
  const decision =
    variationKey === 'on' ? 'b' : variationKey === 'off' ? 'a' : variationKey

  // Assuming the variation keys follow a, b, c, etc. convention
  // TODO: Enforce ^ ?
  experimentCache[toggleId] = decision || DEFAULT
  return decision || DEFAULT
}

/**
 * Returns the active value, or executes the active function if an arrow function is passed.
 *
 * Variants can be either values, in which case they both should be of the same type,
 * or arrow functions which will be executed for the winning side, the return type is unknown
 * on purpose since it's expected the return value will likely be implicit.
 *
 * When mixing values and function variants, the return type is unknown and needs to be cast.
 *
 * @param toggleId
 * @param variants
 */

export function toggle<A extends any[]>(
  toggleId: ToggleIdType,
  ...variants: A
): ToggleFuncReturnType<A>
export function toggle(toggleId: ToggleIdType, ...variants) {
  return baseToggle(getToggle)(toggleId, ...variants)
}

/**
 * Export imported types
 */
export {ToggleIdType, VariantType}
