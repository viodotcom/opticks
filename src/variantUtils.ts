export const handleToggleVariant = (toggleValue: Function | any): any =>
  typeof toggleValue === "function" ? toggleValue() : toggleValue;
