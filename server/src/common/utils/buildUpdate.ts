export function buildUpdate<T extends Record<string, unknown>>(
  obj: { [K in keyof Required<T>]: T[K] | null }
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== null)
  ) as Partial<T>
}
