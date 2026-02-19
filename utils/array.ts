
export function pushIf <T extends any> (list: T[], value: T, condition: any = true) {
  if (!condition) return -1

  return list.push(value)
}

export function includes <T> (
  source: T[] | string,
  search: T extends string ? string : T
): boolean {
  return source.includes(search as any)
}
