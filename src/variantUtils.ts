export const handleToggleVariant = (
  toggleValue: unknown | (() => unknown)
): unknown => (typeof toggleValue === 'function' ? toggleValue() : toggleValue)
