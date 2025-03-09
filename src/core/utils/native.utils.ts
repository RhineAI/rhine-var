import { YMap, YArray, YText, YXmlText, YXmlElement, YXmlFragment } from "@/index"
import {Native, RvKey, RvPath} from "@/core/native/native.type";
import {isArray, isMap, isObject} from "@/core/utils/data.utils";
import RhineVarBase from "@/core/var/rhine-var-base.class";
import {error} from "@/utils/logger";
import YObject from "@/core/native/y-object";


export function isNative(value: any): boolean {
  return value instanceof YMap
    || value instanceof YArray
    || value instanceof YText
    || value instanceof YXmlFragment
    || value instanceof YXmlElement
    || value instanceof YXmlText
}

export function nativeSet(target: Native, key: string | symbol, value: any): boolean {
  if (typeof key !== 'string') {
    return false
  }
  if (value instanceof RhineVarBase) {
    value = value.native
  }
  
  try {
    if (target instanceof YMap) {
      target.set(key, value)
      return true
    } else if (target instanceof YArray) {
      const index = parseInt(key)
      if (!isNaN(index)) {
        if (target.length - 1 >= index) {
          target.delete(index, 1)
        }
        target.insert(index, [value])
        return true
      }
    } else {
      error('Unsupported nativeSet for:', target)
    }
  } catch (e) {
    error('nativeSet.error:', e)
  }
  return false
}

export function nativeHas(target: Native, key: string | symbol | number): boolean {
  if (typeof key !== 'string') {
    return false
  }
  
  try {
    if (target instanceof YMap) {
      return target.has(key)
    } else if (target instanceof YArray) {
      const index = parseInt(key, 10)
      if (!isNaN(index)) {
        return index < target.length && index >= 0
      }
    }
  } catch (e) {
    error('nativeHas.error:', e)
  }
  return false
}

export function nativeOwnKeys(target: Native): string[] {
  let keys: string[] = []
  if (target instanceof YMap) {
    target.forEach((value, key) => {
      keys.push(key)
    })
  } else if (target instanceof YArray) {
    for (let i = 0; i < target.length; i++) {
      keys.push(String(i))
    }
  }
  return keys
}

export function nativeDelete(target: Native, key: string | symbol): boolean {
  if (typeof key !== 'string') {
    return false
  }
  
  try {
    if (target instanceof YMap) {
      if (target.has(key)) {
        target.delete(key)
        return true
      }
    }
    if (target instanceof YArray) {
      const pn = parseInt(key)
      if (!isNaN(pn)) {
        if (target.length > pn && pn >= 0) {
          target.delete(pn, 1)
        }
      }
    }
  } catch (e) {
    error('nativeDelete.error:', e)
  }
  return false
}

export function nativeGet(target: Native, key: string | symbol): any | undefined {
  if (typeof key !== 'string') {
    return undefined
  }
  
  try {
    if (target instanceof YMap) {
      return target.get(key)
    } else if (target instanceof YArray) {
      const pn = parseInt(key)
      if (!isNaN(pn)) return target.get(pn)
    }
  } catch (e) {
    error('nativeGet.error:', e)
  }
  return undefined
}

export function jsonToNative(data: any): Native {
  if (isNative(data)) {
    return data
  }
  if (isMap(data)) {
    let map = new YMap<any>()
    data.forEach((value, key) => {
      map.set(key, jsonToNative(value))
    })
    return map
  }
  if (isObject(data)) {
    let map = new YMap<any>()
    Object.entries(data).forEach(([key, value]) => {
      map.set(key, jsonToNative(value))
    })
    map.set('_class', 'RhineVarObject')
    return map
  }
  if (isArray(data)) {
    let array = new YArray<any>()
    data.forEach((value: any, index: number) => {
      array.push([jsonToNative(value)])
    })
    return array
  }
  return data
}

export function getKeyFromParent(target: Native): RvKey | undefined {
  const parent = target.parent
  if (!parent) {
    return undefined
  }
  let result = undefined
  if (parent instanceof YMap) {
    parent.forEach((value, key) => {
      if (value === target) {
        result = key
      }
    })
  } else if (parent instanceof YArray) {
    parent.forEach((value, key) => {
      if (value === target) {
        result = key
      }
    })
  }
  return result
}

export function getPathFromRoot(target: Native): RvPath {
  const path: RvPath = []
  let current = target
  let parent = current.parent
  while (parent) {
    let flag = false
    if (parent instanceof YMap) {
      parent.forEach((value, key) => {
        if (value === current) {
          path.unshift(key)
          flag = true
        }
      })
    } else if (parent instanceof YArray) {
      parent.forEach((value, key) => {
        if (value === current) {
          path.unshift(key)
          flag = true
        }
      })
    }
    if (!flag) {
      error('Failed to get path from root')
      break
    }
    current = parent as Native
    parent = current.parent
  }
  return path
}
