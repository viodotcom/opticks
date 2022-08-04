import type {BooleanToggleType, ToggleIdType, VariantType} from '../types'
import {booleanToggle as baseBooleanToggle} from '../core/booleanToggle'
import {toggle as baseToggle} from '../core/toggle'

// This implementation expects you to populate a list of boolean toggles in
// advance, in the following format:
// { foo: true, bar: false }
export type BooleanToggleListType = {[key in ToggleIdType]?: BooleanToggleType}

// This implementation expects you to populate a list of multi toggle objects in
// advance, in the following format:
// { fooExperiment: {variant: 'a'}, barExperiment: {variant: 'b'} }
export type toggleListType = {[key in ToggleIdType]?: {variant: VariantType}}

let booleanToggleList: BooleanToggleListType = {}
let toggleList: toggleListType = {}

export const setBooleanToggles = (toggles: BooleanToggleListType) => {
  booleanToggleList = toggles
}

// FIXME: FlowType
export const setToggles = (toggles: any) => {
  toggleList = toggles
}

export const getBooleanToggle = (toggleId: ToggleIdType) => {
  const lowerCaseToggleId = toggleId && toggleId.toLowerCase()
  return booleanToggleList.hasOwnProperty(lowerCaseToggleId)
    ? booleanToggleList[lowerCaseToggleId]
    : false
}

export const booleanToggle = baseBooleanToggle(getBooleanToggle)

export const getToggle = (toggleId: ToggleIdType): VariantType => {
  const toggle = toggleList[toggleId && toggleId.toLowerCase()]

  return (toggle && toggle.variant) || 'a'
}

export const toggle = baseToggle(getToggle)

export const initialize = ({
  booleanToggles,
  toggles,
}: {
  booleanToggles?: BooleanToggleListType
  toggles?: toggleListType
}) => {
  booleanToggles && setBooleanToggles(booleanToggles)
  toggles && setToggles(toggles)
}
