/** @deprecated */
import type {ToggleIdType, VariantType} from '../types'
import {toggle as baseToggle} from '../core/toggle'

// This implementation expects you to populate a list of multi toggle objects in
// advance, in the following format:
// { fooExperiment: {variant: 'a'}, barExperiment: {variant: 'b'} }
export type toggleListType = {
  [key in ToggleIdType]?: {variant: VariantType}
}

let toggleList: toggleListType = {}

// FIXME: FlowType
export const setToggles = (toggles: any) => {
  toggleList = toggles
}

export const getToggle = (toggleId: ToggleIdType): VariantType => {
  const toggle = toggleList[toggleId && toggleId.toLowerCase()]

  return (toggle && toggle.variant) || 'a'
}

export const toggle = baseToggle(getToggle)

export const initialize = ({toggles}: {toggles?: toggleListType}) => {
  toggles && setToggles(toggles)
}
