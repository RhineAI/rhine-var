import {YArray, YDoc, YMap, YText} from "@/index"
import Connector from "@/core/connector/connector.abstract";
import RhineVarBase, {RHINE_VAR_PREDEFINED_PROPERTIES} from "@/core/var/rhine-var-base.class";
import {error, log} from "@/utils/logger";
import {RhineVarAny, StoredRhineVar} from "@/core/var/rhine-var.type";
import {Native} from "@/core/native/native.type";
import {isNative, nativeDelete, nativeHas, nativeOwnKeys, nativeSet} from "@/core/utils/native.utils";
import {createConnector} from "@/core/connector/create-connector";
import {createRhineVar} from "@/core/proxy/create-rhine-var";
import {ensureNative, ensureRhineVar} from "@/core/utils/var.utils";
import SupportManager from "@/core/var/support/support-manager";
import RhineVarText from "@/core/var/items/rhine-var-text.class";
import ProxyOptions from "@/core/proxy/proxy-options.interface";

// For create root RhineVar object
export function rhineProxy<T extends object>(
  defaultValue: T | Native,
  connector?: Connector | string | number,
  options: ProxyOptions = {},
): StoredRhineVar<T> {
  if (!connector) {
    return rhineProxyGeneral<T>(defaultValue)
  }

  // Create local temp YDoc and YMap
  let target: Native = ensureNative<T>(defaultValue)
  const tempMap = new YDoc().getMap()
  tempMap.set(Connector.STATE_KEY, target)

  // Create core proxied rhine-var object
  const object = rhineProxyGeneral<T>(target)

  // Create connector by string, number or direct
  if (typeof connector === 'string' || typeof connector === 'number') {
    connector = createConnector(connector)
  }
  connector = connector as Connector;

  const root = object as any
  root._options = options
  root._connector = connector

  // Bind connector
  connector.subscribeSynced((synced: boolean) => {
    if (options.overwrite) {
      connector.setState(object.native.clone())
    }
    if (!connector.hasState()) {
      connector.setState(object.native.clone())
    }
    (object as any)._initialize(connector.getState())
  })

  return object
}


export function rhineProxyGeneral<T extends object>(
  data: T | Native,
  parent: RhineVarBase | null = null
): StoredRhineVar<T> {
  let target = ensureNative<T>(data)

  const object: RhineVarBase = createRhineVar(target, parent) as any

  if (object.native instanceof YText) {
    Reflect.set(object, 'value', object.native.toString())
  } else if (object.native instanceof YMap || object.native instanceof YArray) {
    object.native.forEach((value, keyString) => {
      let key = keyString as keyof T
      if (isNative(value)) {
        Reflect.set(object, key, rhineProxyGeneral<T>(value, object))
      } else {
        Reflect.set(object, key, value)
      }
    })
  }

  const proxyGetOwnPropertyDescriptor = (proxy: RhineVarBase<T>, p: string | symbol) => {
    // log('Proxy.handler.getOwnPropertyDescriptor:', p, '  ', object)
    if (p === Symbol.iterator) {
      return {
        value: function* () {
          if (object.native instanceof YMap) {
            for (const key of object.native.keys()) {
              yield Reflect.get(object, key)
            }
          } else if (object.native instanceof YArray) {
            for (let i = 0; i < object.native.length; i++) {
              yield Reflect.get(object, String(i))
            }
          }
        },
        enumerable: false,
        configurable: true,
      }
    }
    const result = Reflect.getOwnPropertyDescriptor(object, p)
  }

  const handler: ProxyHandler<RhineVarBase<T>> = {
    get(proxy, p, receiver) {
      if (RHINE_VAR_PREDEFINED_PROPERTIES.has(p)) return Reflect.get(object, p, receiver)

      const supportProperty = SupportManager.convertProperty<T>(p, object as RhineVarAny)
      if (supportProperty !== undefined) return supportProperty

      log('Proxy.handler.get:', p, '  ', object, receiver)

      if (p in object) return Reflect.get(object, p, receiver)

      const descriptor = proxyGetOwnPropertyDescriptor(proxy, p)
      if (descriptor !== undefined) return descriptor.value

      return undefined
    },

    set(proxy, p, value, receiver): boolean {
      if (RHINE_VAR_PREDEFINED_PROPERTIES.has(p)) return Reflect.set(object, p, value, receiver)
      log('Proxy.handler.set:', p, 'to', value, '  ', object, receiver)

      if (object.native instanceof YText && object instanceof RhineVarText && p === 'value') {
        if (typeof value !== 'string') {
          error('Value for YText must be a string')
          return false
        }
        const doc = object.native.doc
        if (doc) {
          doc.transact(() => {
            const native = object.native as YText
            native.delete(0, native.length)
            native.insert(0, value)
          })
          return true
        } else {
          error('Document is not available')
          return false
        }
      }

      value = ensureRhineVar(value, object)

      return nativeSet(object.native, p, value)
    },

    deleteProperty(proxy: RhineVarBase<T>, p: string | symbol): boolean {
      if (RHINE_VAR_PREDEFINED_PROPERTIES.has(p)) return false
      log('Proxy.handler.deleteProperty:', p)

      return nativeDelete(object.native, p)
    },

    has(proxy: RhineVarBase<T>, p: string | symbol): boolean {
      if (RHINE_VAR_PREDEFINED_PROPERTIES.has(p)) return false
      return nativeHas(object.native, p)
    },

    ownKeys(proxy: RhineVarBase<T>): string[] {
      return nativeOwnKeys(object.native)
    },

    getOwnPropertyDescriptor: proxyGetOwnPropertyDescriptor,
  }

  return new Proxy(object, handler) as StoredRhineVar<T>
}

