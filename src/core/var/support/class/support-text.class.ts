import {RhineVarAny, YText} from "@/index";
import SupportBase from "@/core/var/support/support-base";
import RhineVarText from "@/core/var/items/rhine-var-text.class";


export default class SupportText extends SupportBase {

  static TARGET_TAG = 'RhineVarText'

  static convertProperty<T>(key: string | symbol, object: RhineVarAny): any {
    console.log('SupportText.convertProperty', key, object)
    if (!(object.native instanceof YText) || !(object instanceof RhineVarText)) {
      console.error('Unsupported convertProperty:', object, object.native)
      return
    }
    const native = object.native as any as YText

    switch (key) {
      case 'insert':
        return (index: number, value: string) => {
          native.insert(index, value)
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
      case 'at':
        return (index: number) => {
          return native.toString().charAt(index)
        }
      case 'charAt':
        return (index: number) => {
          return native.toString().charAt(index)
        }
      case 'charCodeAt':
        return (index: number) => {
          return native.toString().charCodeAt(index)
        }
      case 'codePointAt':
        return (index: number) => {
          return native.toString().codePointAt(index)
        }
      case 'concat':
        return (...strings: string[]) => {
          return native.toString().concat(...strings)
        }
      case 'endsWith':
        return (searchString: string, endPosition?: number) => {
          return native.toString().endsWith(searchString, endPosition)
        }
      case 'includes':
        return (searchString: string, position?: number) => {
          return native.toString().includes(searchString, position)
        }
      case 'indexOf':
        return (searchValue: string, fromIndex?: number) => {
          return native.toString().indexOf(searchValue, fromIndex)
        }
      case 'isWellFormed':
        return () => {
          return native.toString().isWellFormed()
        }
      case 'lastIndexOf':
        return (searchValue: string, fromIndex?: number) => {
          return native.toString().lastIndexOf(searchValue, fromIndex)
        }
      case 'localeCompare':
        return (compareString: string, locales?: string | string[], options?: Intl.CollatorOptions) => {
          return native.toString().localeCompare(compareString, locales, options)
        }
      case 'match':
        return (regexp: RegExp) => {
          return native.toString().match(regexp)
        }
      case 'matchAll':
        return (regexp: RegExp) => {
          return native.toString().matchAll(regexp)
        }
      case 'normalize':
        return (form: 'NFC' | 'NFD' | 'NFKC' | 'NFKD') => {
          return native.toString().normalize(form)
        }
      case 'padEnd':
        return (targetLength: number, padString?: string) => {
          return native.toString().padEnd(targetLength, padString)
        }
      case 'padStart':
        return (targetLength: number, padString?: string) => {
          return native.toString().padStart(targetLength, padString)
        }
      case 'repeat':
        return (count: number) => {
          return native.toString().repeat(count)
        }
      case 'replace':
        return (searchValue: string | RegExp, replaceValue: string) => {
          return native.toString().replace(searchValue, replaceValue)
        }
      case 'replaceAll':
        return (searchValue: string | RegExp, replaceValue: string) => {
          return native.toString().replaceAll(searchValue, replaceValue)
        }
      case 'search':
        return (regexp: RegExp) => {
          return native.toString().search(regexp)
        }
      case 'slice':
        return (start?: number, end?: number) => {
          return native.toString().slice(start, end)
        }
      case 'split':
        return (separator: string | RegExp, limit?: number) => {
          return native.toString().split(separator, limit)
        }
      case 'startsWith':
        return (searchString: string, position?: number) => {
          return native.toString().startsWith(searchString, position)
        }
      case 'substring':
        return (start: number, end?: number) => {
          return native.toString().substring(start, end)
        }
      case 'toLocaleLowerCase':
        return () => {
          return native.toString().toLocaleLowerCase()
        }
      case 'toLocaleUpperCase':
        return () => {
          return native.toString().toLocaleUpperCase()
        }
      case 'toLowerCase':
        return () => {
          return native.toString().toLowerCase()
        }
      case 'toString':
        return () => {
          return native.toString().toString()
        }
      case 'toUpperCase':
        return () => {
          return native.toString().toUpperCase()
        }
      case 'toWellFormed':
        return () => {
          return native.toString().toWellFormed()
        }
      case 'trim':
        return () => {
          return native.toString().trim()
        }
      case 'trimEnd':
        return () => {
          return native.toString().trimEnd()
        }
      case 'trimStart':
        return () => {
          return native.toString().trimStart()
        }
      case 'valueOf':
        return () => {
          return native.toString().valueOf()
        }
      case Symbol.iterator:
        return native.toString()[Symbol.iterator]
      default:
        return undefined
    }
  }

  static SUPPORTED_PROPERTIES = new Set<string | symbol>([
    Symbol.iterator,
    Symbol.unscopables,
    'length',
    'insert',
    'delete',
    'clear',
    'at',
    'charAt',
    'charCodeAt',
    'codePointAt',
    'concat',
    'endsWith',
    'includes',
    'indexOf',
    'isWellFormed',
    'lastIndexOf',
    'localeCompare',
    'match',
    'matchAll',
    'normalize',
    'padEnd',
    'padStart',
    'repeat',
    'replace',
    'replaceAll',
    'search',
    'slice',
    'split',
    'startsWith',
    'substring',
    'toLocaleLowerCase',
    'toLocaleUpperCase',
    'toLowerCase',
    'toString',
    'toUpperCase',
    'toWellFormed',
    'trim',
    'trimEnd',
    'trimStart',
    'valueOf',
  ])

  static UNSUPPORTED_PROPERTIES = new Set<string | symbol>([
  ])
}
