export const handleToggleVariant = (
  toggleValue: () => void | any,
): any | undefined | undefined => {
  if (typeof toggleValue === 'function') {
    toggleValue()
  }

  return toggleValue
}
