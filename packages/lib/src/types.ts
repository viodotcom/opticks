export type ToggleIdType = string

// TODO (@vlacerda) [2024-06-30]: By this time we should ping @vlacerda to evaluate again if the fix is still needed and remove it if not.
// For more context, look at the other comment in this file in optimizely.ts marked with the same TODO date.
export type VariantType = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'off' | 'on'

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
