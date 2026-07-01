type AnyObject = Record<string, any>

function isObject(value: unknown): value is AnyObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function deepClone<T>(value: T): T {
  if (Array.isArray(value)) return value.map(deepClone) as T
  if (isObject(value)) {
    const result: AnyObject = {}
    for (const key of Object.keys(value)) result[key] = deepClone((value as AnyObject)[key])
    return result as T
  }
  return value
}

function mergeArrays(a: unknown[], b: unknown[]): unknown[] {
  const len = Math.max(a.length, b.length)
  const result: unknown[] = []
  for (let i = 0; i < len; i++) {
    const ai = a[i]
    const bi = b[i]
    if (i < a.length && i < b.length) {
      if (isObject(ai) && isObject(bi)) {
        result.push(deepMerge(ai, bi))
      } else if (Array.isArray(ai) && Array.isArray(bi)) {
        result.push(mergeArrays(ai, bi))
      } else {
        result.push(deepClone(bi))
      }
    } else if (i < b.length) {
      result.push(deepClone(bi))
    } else {
      result.push(deepClone(ai))
    }
  }
  return result
}

/** Возвращает новый объект или массив — результат глубокого слияния */
export function deepMerge<T extends AnyObject>(target: T, ...sources: AnyObject[]): T
export function deepMerge<T extends unknown[]>(target: T, ...sources: unknown[][]): T
export function deepMerge(target: AnyObject | unknown[], ...sources: (AnyObject | unknown[])[]): AnyObject | unknown[] {
  if (Array.isArray(target)) {
    return sources.reduce<unknown[]>(
      (acc, source) => (Array.isArray(source) ? mergeArrays(acc, source) : acc),
      deepClone(target),
    )
  }

  const result = { ...target }

  for (const source of sources) {
    if (Array.isArray(source)) continue
    for (const key of Object.keys(source)) {
      const targetVal = result[key]
      const sourceVal = source[key]

      if (isObject(targetVal) && isObject(sourceVal)) {
        (result as AnyObject)[key] = deepMerge(targetVal, sourceVal)
      } else if (Array.isArray(targetVal) && Array.isArray(sourceVal)) {
        (result as AnyObject)[key] = mergeArrays(targetVal, sourceVal)
      } else {
        (result as AnyObject)[key] = deepClone(sourceVal)
      }
    }
  }

  return result
}

/** Мутирует target, записывая в него значения из sources */
export function deepMergeInPlace<T extends AnyObject>(target: T, ...sources: AnyObject[]): T
export function deepMergeInPlace<T extends unknown[]>(target: T, ...sources: unknown[][]): T
export function deepMergeInPlace(target: AnyObject | unknown[], ...sources: (AnyObject | unknown[])[]): AnyObject | unknown[] {
  if (Array.isArray(target)) {
    const merged = sources.reduce<unknown[]>(
      (acc, source) => (Array.isArray(source) ? mergeArrays(acc, source) : acc),
      target,
    )
    target.length = 0
    target.push(...merged)
    return target
  }

  for (const source of sources) {
    if (Array.isArray(source)) continue
    for (const key of Object.keys(source)) {
      const targetVal = target[key]
      const sourceVal = source[key]

      if (isObject(targetVal) && isObject(sourceVal)) {
        deepMergeInPlace(targetVal, sourceVal)
      } else if (Array.isArray(targetVal) && Array.isArray(sourceVal)) {
        ;(target as AnyObject)[key] = mergeArrays(targetVal, sourceVal)
      } else {
        ;(target as AnyObject)[key] = deepClone(sourceVal)
      }
    }
  }

  return target
}

export function useDeepMerge() {
  return { deepMerge, deepMergeInPlace }
}
