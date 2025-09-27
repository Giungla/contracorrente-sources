
export const SECONDS_IN_A_DAY = 86400

export function timestampDays (days: number): number {
  return SECONDS_IN_A_DAY * 1000 * days
}
