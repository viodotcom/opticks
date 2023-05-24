import type {ToggleFuncReturnType, ToggleIdType, TogglerGetterType} from '../types'
import {handleToggleVariant} from '../variantUtils'

export const toggle =
  (getToggle: TogglerGetterType) =>
  <T extends any[]>(toggleId: ToggleIdType, ...variants: T): ToggleFuncReturnType<T> | undefined => {
    const baseCharCode = 'a'.charCodeAt(0)
    const activeVariant = getToggle(toggleId)
    // TOOD: Write stand alone unit test for this case
    if (variants.length === 0) return activeVariant
    const argumentIndex = activeVariant.charCodeAt(0) - baseCharCode // a, b, c etc...

    const variant = variants[argumentIndex]
    return handleToggleVariant(variant)
  }
