import RhineVarBase from '@/core/var/rhine-var-base.class';
import { NativeType } from '@/core/native/native-type.enum';

export default class RhineVarText extends RhineVarBase implements Iterable<string> {

  _type: NativeType.Text = NativeType.Text

  value: string = ''

  length: number = -1

  json(): string {
    return super.json()
  }

  insert(index: number, value: string): number {
    return -1
  }

  delete(index: number, length: number): number {
    return -1
  }

  clear() {

  }

  at(index: number): string {
    return ''
  }

  charAt(index: number): string {
    return ''
  }

  charCodeAt(index: number): number {
    return -1
  }

  codePointAt(index: number): number | undefined {
    return -1
  }

  concat(...strings: string[]): string {
    return ''
  }

  endsWith(searchString: string, endPosition?: number): boolean {
    return false
  }

  includes(searchString: string, position?: number): boolean {
    return false
  }

  indexOf(searchValue: string, fromIndex?: number): number {
    return -1
  }

  isWellFormed(): boolean {
    return false
  }

  lastIndexOf(searchValue: string, fromIndex?: number): number {
    return -1
  }

  localeCompare(compareString: string, locales?: string | string[], options?: any): number {
    return -1
  }

  match(regexp: RegExp): RegExpMatchArray | null {
    return null
  }

  matchAll(regexp: RegExp): IterableIterator<RegExpMatchArray> {
    return {} as IterableIterator<RegExpMatchArray>
  }

  normalize(form?: 'NFC' | 'NFD' | 'NFKC' | 'NFKD'): string {
    return ''
  }

  padEnd(targetLength: number, padString?: string): string {
    return ''
  }

  padStart(targetLength: number, padString?: string): string {
    return ''
  }

  repeat(count: number): string {
    return ''
  }

  replace(searchValue: string | RegExp, replaceValue: string): string {
    return ''
  }

  replaceAll(searchValue: string | RegExp, replaceValue: string): string {
    return ''
  }

  search(regexp: RegExp): number {
    return -1
  }

  slice(start: number, end?: number): string {
    return ''
  }

  split(separator: string | RegExp, limit?: number): string[] {
    return []
  }

  startsWith(searchString: string, position?: number): boolean {
    return false
  }

  substring(start: number, end?: number): string {
    return ''
  }

  toLocaleLowerCase(): string {
    return ''
  }

  toLocaleUpperCase(): string {
    return ''
  }

  toLowerCase(): string {
    return ''
  }

  toString(): string {
    return ''
  }

  toUpperCase(): string {
    return ''
  }

  toWellFormed(): string {
    return ''
  }

  trim(): string {
    return ''
  }

  trimEnd(): string {
    return ''
  }

  trimStart(): string {
    return ''
  }

  valueOf(): string {
    return ''
  }

  [Symbol.iterator](): IterableIterator<string> {
    return {} as IterableIterator<string>
  }

}
