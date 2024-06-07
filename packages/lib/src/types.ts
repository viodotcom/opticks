export type ToggleIdType = string

export type VariantType = 'a' | 'b' | 'c' | 'd' | 'e' | 'f'

// Value Toggle
export type ToggleType = {
  variant: VariantType
}

export type TogglerGetterType = (ToggleIdType) => any

// Return type of `toggle` function
export type ToggleFuncReturnType<ToggleFuncParams extends any[]> = {
  [ParamKey in keyof ToggleFuncParams]: ToggleFuncParams[ParamKey] extends (
    ...args: any[]
  ) => infer ParamFuncReturnType
    ? ParamFuncReturnType
    : ToggleFuncParams[ParamKey]
}[number]
