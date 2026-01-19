import { NativeType } from '@/core/native/native-type.enum'
import RhineVarBase from '@/core/var/rhine-var-base.class'
import { InputItem } from '@/core/var/rhine-var.type'

export default class RhineVarArray<T = any, N = any> extends RhineVarBase<T[]> implements Iterable<T> {
  _type: NativeType.Array = NativeType.Array;

  [key: number]: T

  length = 0

  insert(index: number, ...items: InputItem<N>[]) {
    return -1
  }

  delete(index: number, length: number) {
    return -1
  }

  clear() {}

  push(...items: InputItem<N>[]): number {
    return -1
  }

  unshift(...items: InputItem<N>[]): number {
    return -1
  }

  pop(): N | undefined {
    return undefined
  }

  shift(): N | undefined {
    return undefined
  }

  slice(start?: number, end?: number): T[] {
    return []
  }

  splice(start: number, deleteCount?: number, ...items: InputItem<N>[]): N[] {
    return []
  }

  forEach(callback: (value: T, index: number, array: this) => void, thisArg?: any): void {}

  map<U>(callback: (value: T, index: number, array: this) => U, thisArg?: any): U[] {
    return [] as U[]
  }

  filter(callback: (value: T, index: number, array: this) => boolean, thisArg?: any): T[] {
    return [] as T[]
  }

  indexOf(searchElement: InputItem<N>, fromIndex?: number): number {
    return -1
  }

  lastIndexOf(searchElement: InputItem<N>, fromIndex?: number): number {
    return -1
  }

  includes(searchElement: InputItem<N>, fromIndex?: number): boolean {
    return false
  }

  at(index: number): T | undefined {
    return undefined
  }

  with(index: number, value: InputItem<N>): N[] {
    return []
  }

  join(separator?: string): string {
    return ''
  }

  some(callback: (value: T, index: number, array: this) => boolean, thisArg?: any): boolean {
    return false
  }

  every(callback: (value: T, index: number, array: this) => boolean, thisArg?: any): boolean {
    return false
  }

  find(callback: (value: T, index: number, obj: this) => boolean, thisArg?: any): T | undefined {
    return {} as T | undefined
  }

  findLast(callback: (value: T, index: number, obj: this) => boolean, thisArg?: any): T | undefined {
    return {} as T | undefined
  }

  findIndex(callback: (value: T, index: number, obj: this) => boolean, thisArg?: any): number {
    return -1
  }

  findLastIndex(callback: (value: T, index: number, obj: this) => boolean, thisArg?: any): number {
    return -1
  }

  entries(): IterableIterator<[number, T]> {
    return {} as IterableIterator<[number, T]>
  }

  keys(): IterableIterator<number> {
    return {} as IterableIterator<number>
  }

  values(): IterableIterator<T> {
    return {} as IterableIterator<T>
  }

  reverse(): this {
    return this
  }

  sort(compareFn?: (a: T, b: T) => number): this {
    return this
  }

  fill(value: InputItem<N>, start?: number, end?: number): this {
    return this
  }

  concat(...items: InputItem<N>[]): N[] {
    return []
  }

  toReversed(): N[] {
    return []
  }

  toSorted(compareFn?: (a: T, b: T) => number): N[] {
    return []
  }

  toSpliced(start: number, deleteCount?: number, ...items: InputItem<N>[]): N[] {
    return []
  }

  copyWithin(target: number, start: number, end?: number): this {
    return this
  }

  toString(): string {
    return ''
  }

  toLocaleString(): string {
    return ''
  }

  flat<U>(depth?: number): U[] {
    return []
  }

  flatMap<U>(callback: (value: T, index: number, array: this) => U, thisArg?: any): U[] {
    return []
  }

  reduce<U>(callback: (previousValue: U, currentValue: T, currentIndex: number, array: this) => U, initialValue: U): U {
    return {} as U
  }

  reduceRight<U>(
    callback: (previousValue: U, currentValue: T, currentIndex: number, array: this) => U,
    initialValue: U,
  ): U {
    return {} as U
  }

  [Symbol.iterator](): Iterator<T> {
    return {} as Iterator<T>
  }

  [Symbol.unscopables] = {
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
}
