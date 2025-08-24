export function valueToKey(object: any, value: any) {
  for (const key of Object.keys(object)) {
    if (object[key] === value) return key 
  }
  return null
}