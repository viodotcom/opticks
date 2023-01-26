export type ToggleIdType = string

export type VariantType = 'a' | 'b' | 'c' | 'd' | 'e' | 'f'

// Value Toggle
export type ToggleType = {
  variant: VariantType
}

// Boolean Toggle
export type BooleanToggleType = boolean

export type TogglerGetterType = (ToggleIdType) => any
