
export function pushIf <T extends any> (condition: any, list: T[], value: T) {
  if (!condition) return -1

  return list.push(value)
}
