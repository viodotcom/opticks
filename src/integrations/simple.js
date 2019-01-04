// @flow

import type { BooleanToggleType, ToggleIdType, VariantType } from '../types'
import { booleanToggle as baseBooleanToggle } from '../core/booleanToggle'
import { multiToggle as baseMultiToggle } from '../core/multiToggle'

// This implementation expects you to populate a list of boolean toggles in
// advance, in the following format:
// { foo: true, bar: false }
export type BooleanToggleListType = { [ToggleIdType]: BooleanToggleType }

// This implementation expects you to populate a list of multi toggle objects in
// advance, in the following format:
// { fooExperiment: {variant: 'a'}, barExperiment: {variant: 'b'} }
export type MultiToggleListType = { [ToggleIdType]: { variant: VariantType } }

let booleanToggleList: BooleanToggleListType = {}
let multiToggleList: MultiToggleListType = {}

export const setBooleanToggles = (toggles: BooleanToggleListType) => {
  booleanToggleList = toggles
}

// FIXME: FlowType
export const setMultiToggles = (toggles: any) => {
  multiToggleList = toggles
}

export const getBooleanToggle = (toggleId: ToggleIdType) => {
  const lowerCaseToggleId = toggleId && toggleId.toLowerCase()
  return booleanToggleList.hasOwnProperty(lowerCaseToggleId)
    ? booleanToggleList[lowerCaseToggleId]
    : false
}

export const booleanToggle = baseBooleanToggle(getBooleanToggle)

export const getMultiToggle = (toggleId: ToggleIdType): VariantType => {
  const toggle = multiToggleList[toggleId && toggleId.toLowerCase()]

  return (toggle && toggle.variant) || 'a'
}

export const multiToggle = baseMultiToggle(getMultiToggle)

export const initialize = ({
  booleanToggles,
  multiToggles
}: {
  booleanToggles?: BooleanToggleListType,
  multiToggles?: MultiToggleListType
}) => {
  booleanToggles && setBooleanToggles(booleanToggles)
  multiToggles && setMultiToggles(multiToggles)
}
