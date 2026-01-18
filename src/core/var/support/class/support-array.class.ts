import {Native, RhineVarAny, YArray} from "@/index";
import SupportBase from "@/core/var/support/support-base";
import {ensureJsonOrBasic, ensureNativeOrBasic, isRhineVar} from "@/core/utils/var.utils";
import RhineVarArray from "@/core/var/items/rhine-var-array.class";
import {isNative} from "@/core/utils/native.utils";
import {RecursiveArray} from "@/core/var/rhine-var.type";


export default class SupportArray extends SupportBase {

  static TARGET_TAG = 'RhineVarArray'

  static convertProperty<T>(key: string | symbol, object: RhineVarAny): any {
    if (!(object.native instanceof YArray) || !(object instanceof RhineVarArray)) {
      console.error('Unsupported convertProperty:', object, object.native)
      return
    }
    const array = object
    const native = object.native as YArray<any>

    const get = (i: number): T => {
      if (i in array) {
        return Reflect.get(array, i) as T
      } else {
        return native.get(i) as T
      }
    }

    const getJson = (i: number) => {
      let item = get(i)
      if (isNative(item)) {
        return (item as Native).toJSON() as T
      }
      if (isRhineVar(item)) {
        return item.json()
      }
      return item as T
    }


    switch (key) {
      case 'insert':
        return (index: number, ...items: any[]): number => {
          native.insert(index, items.map(ensureNativeOrBasic))
          return native.length
        }
      case 'delete':
        return (index: number, length: number) => {
          native.delete(index, length)
          return native.length
        }
      case 'clear':
        return () => {
          native.delete(0, native.length)
        }
      case 'length':
        return native.length
      case 'push':
        return (...items: any[]): number => {
          native.push(items.map(ensureNativeOrBasic))
          return native.length
        }
      case 'unshift':
        return (...items: any[]): number => {
          native.unshift(items.map(ensureNativeOrBasic))
          return native.length
        }
      case 'pop':
        return (): T | undefined => {
          if (native.length === 0) return undefined
          let key = native.length - 1
          let item = get(key)
          native.delete(key)
          return item
        }
      case 'shift':
        return (): T | undefined => {
          if (native.length === 0) return undefined
          let key = 0
          let item = get(key)
          native.delete(key)
          return item
        }
      case 'slice':
        return (start: number, end?: number): T[] => {
          if (end === undefined) end = native.length
          if (start < 0) start = native.length + start
          if (end < 0) end = native.length + end
          if (start < 0) start = 0
          if (end > native.length) end = native.length
          let result = []
          for (let i = start; i < end; i++) {
            result.push(get(i))
          }
          return result
        }
      case 'splice':
        return (start: number, deleteCount: number, ...items: any[]): T[] => {
          const removed = []
          for (let i = start; i < start + deleteCount; i++) {
            let item = getJson(i)
            removed.push(item)
          }
          native.delete(start, deleteCount)
          if (items.length > 0) {
            let nativeItems: any[] = []
            for (let i = 0; i < items.length; i++) {
              nativeItems.push(ensureNativeOrBasic(items[i]))
            }
            native.insert(start, nativeItems)
          }
          return removed
        }
      case 'forEach':
        return (callback: (value: T, index: number, arr: RecursiveArray<T>) => void) => {
          return native.forEach((yValue, yIndex, yArray) => {
            callback(get(yIndex), yIndex, array)
          })
        }
      case 'map':
        return <R>(callback: (value: T, index: number, arr: RecursiveArray<T>) => R) => {
          const result: R[] = []
          for (let i = 0; i < native.length; i++) {
            result.push(callback(get(i), i, array))
          }
          return result
        }
      case 'filter':
        return (callback: (value: T, index: number, arr: RecursiveArray<T>) => boolean): T[] => {
          let result: T[] = []
          for (let i = 0; i < native.length; i++) {
            let item = get(i)
            if (callback(item, i, array)) result.push(item)
          }
          return result
        }
      case 'indexOf':
          return (searchElement: any, fromIndex: number = 0) => {
          // fromIndex Optional
          // Zero-based index at which to start searching, converted to an integer.
          //
          // Negative index counts back from the end of the array — if -array.length <= fromIndex < 0, fromIndex + array.length is used. Note, the array is still searched from front to back in this case.
          // If fromIndex < -array.length or fromIndex is omitted, 0 is used, causing the entire array to be searched.
          // If fromIndex >= array.length, the array is not searched and -1 is returned.
          if (fromIndex < 0) fromIndex = native.length + fromIndex
          if (fromIndex < 0) fromIndex = 0
          if (fromIndex >= native.length || native.length === 0) return -1
          const element = ensureJsonOrBasic(searchElement)
          for (let i = fromIndex; i < native.length; i++) {
            if (getJson(i) === element) return i
          }
          return -1
        }
      case 'lastIndexOf':
        return (searchElement: any, fromIndex: number = native.length - 1) => {
          // fromIndex Optional
          // Zero-based index at which to start searching backwards, converted to an integer.
          //
          // Negative index counts back from the end of the array — if -array.length <= fromIndex < 0, fromIndex + array.length is used.
          // If fromIndex < -array.length, the array is not searched and -1 is returned. You can think of it conceptually as starting at a nonexistent position before the beginning of the array and going backwards from there. There are no array elements on the way, so searchElement is never found.
          // If fromIndex >= array.length or fromIndex is omitted, array.length - 1 is used, causing the entire array to be searched. You can think of it conceptually as starting at a nonexistent position beyond the end of the array and going backwards from there. It eventually reaches the real end position of the array, at which point it starts searching backwards through the actual array elements.
          if (fromIndex < 0) fromIndex = native.length + fromIndex
          if (fromIndex < 0) return -1
          if (fromIndex >= native.length) fromIndex = native.length - 1
          const element = ensureJsonOrBasic(searchElement)
          for (let i = fromIndex; i >= 0; i--) {
            if (getJson(i) === element) return i
          }
          return -1
        }
      case 'includes':
        return (searchElement: any, fromIndex?: number) => {
          // fromIndex Optional
          // Zero-based index at which to start searching, converted to an integer.
          //
          // Negative index counts back from the end of the array — if -array.length <= fromIndex < 0, fromIndex + array.length is used. However, the array is still searched from front to back in this case.
          // If fromIndex < -array.length or fromIndex is omitted, 0 is used, causing the entire array to be searched.
          // If fromIndex >= array.length, the array is not searched and false is returned.
          if (fromIndex === undefined) fromIndex = 0
          if (fromIndex < 0) fromIndex = native.length + fromIndex
          if (fromIndex < 0) fromIndex = 0
          if (fromIndex >= native.length) return false
          const element = ensureJsonOrBasic(searchElement)
          for (let i = fromIndex; i < native.length; i++) {
            if (getJson(i) === element) return true
          }
          return false
        }
      case 'at':
        return (i: number): T | undefined => {
          if (i < 0) i = native.length + i
          if (i < 0 || i >= native.length) return undefined
          return get(i)
        }
      case 'with':
        return (i: number, value: any): T[] => {
          if (i < 0) i = native.length + i
          if (i < 0 || i >= native.length) throw 'RangeError: Unexpect index ' + i + ' in RhineVarArray(' + native.length + ')'
          const arr = array.json() as T[]
          arr[i] = ensureJsonOrBasic(value) as T
          return arr
        }
      case 'join':
        return (str: string = ','): string => {
          let result = ''
          for (let i = 0; i < native.length; i++) {
            if (i > 0) result += str
            let item = getJson(i)
            result += item
          }
          return result
        }
      case 'some':
        return (callback: (value: T, index: number, arr: RecursiveArray<T>) => boolean, thisArg?: any): boolean => {
          for (let i = 0; i < native.length; i++) {
            if (callback(get(i), i, array)) return true
          }
          return false
        }
      case 'every':
        return (callback: (value: T, index: number, arr: RecursiveArray<T>) => boolean, thisArg?: any): boolean => {
          for (let i = 0; i < native.length; i++) {
            if (!callback(get(i), i, array)) return false
          }
          return true
        }
      case 'find':
        return (callback: (value: T, index: number, arr: RecursiveArray<T>) => boolean, thisArg?: any): T | undefined => {
          for (let i = 0; i < native.length; i++) {
            let item = get(i)
            if (callback(item, i, array)) return item
          }
          return undefined
        }
      case 'findLast':
        return (callback: (value: T, index: number, arr: RecursiveArray<T>) => boolean, thisArg?: any): T | undefined => {
          for (let i = native.length - 1; i >= 0; i--) {
            let item = get(i)
            if (callback(item, i, array)) return item
          }
          return undefined
        }
      case 'findIndex':
        return (callback: (value: T, index: number, arr: RecursiveArray<T>) => boolean, thisArg?: any): number => {
          for (let i = 0; i < native.length; i++) {
            if (callback(get(i), i, array)) return i
          }
          return -1
        }
      case 'findLastIndex':
        return (callback: (value: T, index: number, arr: RecursiveArray<T>) => boolean, thisArg?: any): number => {
          for (let i = native.length - 1; i >= 0; i--) {
            if (callback(get(i), i, array)) return i
          }
          return -1
        }
      case 'entries':
        return (): IterableIterator<[number, T]> => {
          let i = 0;
          return {
            next() {
              if (i < native.length) {
                return {value: [i, get(i++)], done: false}
              } else {
                return {value: undefined, done: true}
              }
            },
            [Symbol.iterator]() {
              return this
            }
          }
        }
      case 'keys':
        return (): IterableIterator<number> => {
          let i = 0
          return {
            next() {
              if (i < native.length) {
                return { value: i++, done: false }
              } else {
                return { value: undefined, done: true }
              }
            },
            [Symbol.iterator]() {
              return this;
            },
          }
        }
      case 'values':
        return (): IterableIterator<T> => {
          let i = 0
          return {
            next() {
              if (i < native.length) {
                return {value: get(i++), done: false}
              } else {
                return {value: undefined, done: true}
              }
            },
            [Symbol.iterator]() {
              return this
            },
          }
        }
      case 'reverse':
        return (): RecursiveArray<T> => {
          const items = object.json().reverse().map(ensureNativeOrBasic) as T[]
          native.delete(0, native.length)
          native.insert(0, items)
          return array
        }
      case 'sort':
        return (compareFn?: (a: T, b: T) => number): RecursiveArray<T> => {
          const items = object.json()
          items.sort(compareFn)
          native.delete(0, native.length)
          native.insert(0, items.map(ensureNativeOrBasic) as T[])
          return array
        }
      case 'fill':
        return (value: any, start: number = 0, end: number = native.length): RecursiveArray<T> => {
          if (start < 0) start = native.length + start
          if (end < 0) end = native.length + end
          if (start < 0) start = 0
          if (end > native.length) end = native.length
          if (start >= end) return array
          native.delete(start, end - start)
          let items: any[] = []
          for (let i = start; i < end; i++) {
            items.push(ensureNativeOrBasic(value))
          }
          native.insert(start, items)
          return array
        }
      case 'concat':
        return (...items: any[]): T[] => {
          let result = array.json() as any[]
          return result.concat(...items.map(ensureNativeOrBasic))
        }
      case 'toReversed':
        return (): T[] => {
          return array.json().reverse()
        }
      case 'toSorted':
        return (compareFn?: (a: T, b: T) => number): T[] => {
          return array.json().sort(compareFn)
        }
      case 'toSpliced':
        return (start: number, deleteCount: number = native.length - start, ...items: T[]): T[] => {
          return array.json().splice(start, deleteCount, ...items)
        }
      case 'copyWithin':
        return (target: number, start: number = 0, end: number = native.length): RecursiveArray<T> => {
          if (target < 0) target = native.length + target
          if (start < 0) start = native.length + start
          if (end < 0) end = native.length + end
          if (target < 0) target = 0
          if (target > native.length) target = native.length
          if (start < 0) start = 0
          if (end > native.length) end = native.length
          if (start >= end) return array
          const length = end - start
          const items = []
          for (let i = start; i < end; i++) {
            items.push(getJson(i))
          }
          native.delete(target, length)
          native.insert(target, items)
          return array
        }
      case 'toString':
        return (): string => {
          return array.json().toString()
        }
      case 'toLocaleString':
        return (): string => {
          return array.json().toLocaleString()
        }
      case 'flat':
        return <U = any>(depth: number = 1): U[] => {
          return array.json().flat(depth) as U[]
        }
      case 'flatMap':
        return <U>(callback: (item: T, index: number, arr: T[]) => U, thisArg?: any) => {
          return array.json().flatMap(callback, thisArg)
        }
      case 'reduce':
        return <U>(callback: (previousValue: U, currentValue: T, currentIndex: number, arr: T[]) => U, initialValue: U) => {
          return array.json().reduce(callback, initialValue)
        }
      case 'reduceRight':
        return <U>(callback: (previousValue: U, currentValue: T, currentIndex: number, arr: T[]) => U, initialValue: U) => {
          return array.json().reduceRight(callback, initialValue)
        }
      case Symbol.iterator:
        return (): IterableIterator<T> => {
          let i = 0
          return {
            next() {
              if (i < native.length) {
                return {value: get(i++), done: false}
              } else {
                return {value: undefined, done: true}
              }
            },
            [Symbol.iterator]() {
              return this
            },
          }
        }
      case Symbol.unscopables:
        return {
          copyWithin: true,
          entries: true,
          fill: true,
          find: true,
          findIndex: true,
          flat: true,
          flatMap: true,
          includes: true,
          keys: true,
          values: true,
          join: true,
          map: true,
          reverse: true,
          slice: true,
          some: true,
          splice: true,
          toLocaleString: true,
          toString: true,
        }
      default:
        return undefined
    }
  }

  static SUPPORTED_PROPERTIES = new Set<string | symbol>([
    Symbol.iterator,
    Symbol.unscopables,
    'length',
    'push',
    'pop',
    'unshift',
    'shift',
    'slice',
    'splice',
    'forEach',
    'map',
    'indexOf',
    'lastIndexOf',
    'includes',
    'at',
    'with',
    'join',
    'filter',
    'some',
    'every',
    'find',
    'findIndex',
    'findLast',
    'findLastIndex',
    'entries',
    'keys',
    'values',
    'toString',
    'toLocaleString',
    'fill',
    'concat',
    'copyWithin',
    'reverse',
    'sort',
    'toReversed',
    'toSorted',
    'toSpliced',
    'flat',
    'flatMap',
    'reduce',
    'reduceRight',
  ])

  static UNSUPPORTED_PROPERTIES = new Set<string | symbol>([
  ])
}
