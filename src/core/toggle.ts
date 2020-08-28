import {ToggleIdType, TogglerGetterType} from '../types'
import {handleToggleVariant} from '../variantUtils'

type VariantType = unknown | (() => unknown)
export const toggle = (getToggle: TogglerGetterType) => (
  toggleId: ToggleIdType,
  ...variants: VariantType[]
): unknown => {
  const baseCharCode = 'a'.charCodeAt(0)

  const activeVariant = getToggle(toggleId)

  // TOOD: Write stand alone unit test for this case
  if (!variants.length) return activeVariant

  const argumentIndex = activeVariant.charCodeAt(0) - baseCharCode // a, b, c etc...
  const variant = variants[argumentIndex]

  return handleToggleVariant(variant)
}
