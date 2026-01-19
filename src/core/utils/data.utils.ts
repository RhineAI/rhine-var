export function isObject(value: any) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function isArray(value: any) {
  return Array.isArray(value)
}

export function isMap(value: any) {
  return value instanceof Map
}

export function isObjectOrArray(value: any) {
  return value !== null && typeof value === 'object'
}
