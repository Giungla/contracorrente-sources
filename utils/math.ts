
export function clamp (min: number, max: number, value: number): number {
  return Math.max(min, Math.min(max, value))
}

export function decimalRound (value: number, decimalCount = 0): number {
  const factor = Math.pow(10, decimalCount)

  return Math.round(value * factor) / factor
}
