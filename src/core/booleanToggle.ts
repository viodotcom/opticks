import type {ToggleIdType, TogglerGetterType} from '../types'
import {handleToggleVariant} from '../variantUtils'

export const booleanToggle =
  (getToggle: TogglerGetterType) =>
  (toggleId: ToggleIdType, ...variants: Array<any>): any | boolean => {
    switch (variants.length) {
      // supplied both 'off' and 'on' variants
      case 2: {
        const [toggleOff, toggleOn] = variants
        return handleToggleVariant(getToggle(toggleId) ? toggleOn : toggleOff)
      }
      // supplied only 'on' variant
      case 1: {
        const [toggleOn] = variants
        return getToggle(toggleId) ? handleToggleVariant(toggleOn) : false
      }
      default:
        // no (or incorrect) variants supplied, just return the value of the
        // toggle itself
        return getToggle(toggleId)
    }
  }
