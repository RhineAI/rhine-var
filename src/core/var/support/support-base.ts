import { RhineVarAny } from '@/core/var/rhine-var.type'

export default class SupportBase {
  static TARGET_TAG = 'RhineVar'

  static hasProperty<T>(key: string | symbol): boolean {
    if (this.SUPPORTED_PROPERTIES.has(key)) {
      return true
    }
    if (this.UNSUPPORTED_PROPERTIES.has(key)) {
      console.warn('Unsupported property for ' + this.TARGET_TAG + ':', key)
      return true
    }
    return false
  }

  static convertProperty<T>(key: string | symbol, object: RhineVarAny): any {
    return null
  }

  static SUPPORTED_PROPERTIES = new Set<string | symbol>([])

  static UNSUPPORTED_PROPERTIES = new Set<string | symbol>([])
}
