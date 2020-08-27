export const handleToggleVariant = (
  toggleValue: Function | any
): any | null | undefined =>
  typeof toggleValue === 'function' ? toggleValue() : toggleValue
