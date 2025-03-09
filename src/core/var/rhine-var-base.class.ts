import {Transaction, UndoManager, YArrayEvent, YMapEvent, YTextEvent} from "yjs";
import {Awareness} from "y-protocols/awareness";
import {YArray, YMap, YText} from "@/index"
import {rhineProxyGeneral} from "@/core/proxy/rhine-proxy";
import {error, log} from "@/utils/logger";
import {isObject, isObjectOrArray} from "@/core/utils/data.utils";
import {Native, RvKey, RvPath} from "@/core/native/native.type";
import {ChangeType} from "@/core/event/change-type.enum";
import {Callback, DeepCallback, SyncedCallback} from "@/core/event/callback";
import Connector from "@/core/connector/connector.abstract";
import {getKeyFromParent, isNative, nativeHas} from "@/core/utils/native.utils";
import ProxyOptions from "@/core/proxy/proxy-options.interface";
import RhineVarConfig from "@/config/config";
import {UndoManagerOptions} from "yjs/dist/src/utils/UndoManager";


export default abstract class RhineVarBase<T extends object = any> {

  constructor(
    public native: Native,
    public parent: RhineVarBase | null = null,
    public _origin: RhineVarBase<T> = this as any
  ) {
    this.observe()
  }

  private _options: ProxyOptions = {}
  private _connector: Connector | null = null
  private _undoManager: UndoManager | null = null
  private _awareness: Awareness | null = null
  private _clientId: number = -1

  isRoot(): boolean {
    return Boolean(!this.parent)
  }

  root(): RhineVarBase {
    if (this.isRoot()) {
      return this as any
    } else {
      return this.parent!.root()
    }
  }

  getOptions(): ProxyOptions {
    return this.root()._options
  }

  getConnector(): Connector | null {
    return this.root()._connector
  }

  getUndoManager(): UndoManager | null {
    if (this.getOptions().awareness !== undefined && !this.getOptions().awareness) {
      error('You need to enable awareness to use undoManager')
      return null
    }
    return this.root()._undoManager
  }

  getAwareness(): Awareness | null {
    if (this.getOptions().awareness !== undefined && !this.getOptions().awareness) {
      error('You need to enable awareness to use awareness')
      return null
    }
    return this.root()._awareness
  }

  getClientId(): number {
    if (this.getOptions().awareness !== undefined && !this.getOptions().awareness) {
      error('You need to enable awareness to use clientId')
      return -1
    }
    return this.root()._clientId
  }

  private _initialize(native: Native) {
    // initialize function will call after every synced
    if (RhineVarConfig.ENABLE_ERROR) {
      log('Synced initialize:', this.json(), native.toJSON())
    }

    const recursiveKeys: RvKey[] = []

    if (this.native instanceof YMap || this.native instanceof YArray) {
      this.native.forEach((value: any, key: string | number) => {
        if (nativeHas(native, key)) {
          recursiveKeys.push(key)
        } else {
          Reflect.deleteProperty(this._origin, key)
        }
      })
    }
    this.unobserve()
    this.native = native

    if (this.isRoot()) {
      if (this._options.undoManager === undefined || this._options.undoManager) {
        if (!native) {
          error('Base map is not available for undoManager')
        } else {
          this._undoManager = new UndoManager(native, isObject(this._options.undoManager) ? this._options.undoManager as UndoManagerOptions : undefined)
        }
      }
      if (this._options.awareness === undefined || this._options.awareness) {
        const doc = this._connector?.yDoc
        if (!doc) {
          error('YDoc is not available for awareness')
        } else {
          this._awareness = new Awareness(doc)
          this._clientId = this._awareness.clientID
        }
      }
    }

    this.observe()
    if (this.native instanceof YMap || this.native instanceof YArray) {
      this.native.forEach((value: Native, key: string | number) => {
        if (recursiveKeys.includes(key)) {
          const child = Reflect.get(this, key)
          if (child instanceof RhineVarBase) {
            child._initialize(value)
          } else {
            Reflect.set(this._origin, key, value)
          }
          return
        }
        if (isNative(value)) {
          Reflect.set(this._origin, key, rhineProxyGeneral(value, this as any))
        } else {
          Reflect.set(this._origin, key, value)
        }
      })
    }
  }


  afterSynced(callback: () => void) {
    const connector = this.root()?._connector
    if (connector) {
      connector.afterSynced(callback)
    }
  }

  async waitSynced() {
    return new Promise((resolve: any) => {
      this.afterSynced(resolve)
    })
  }


  json(): T {
    return this._removeBuiltInProperty(this.native.toJSON())
  }

  private _removeBuiltInProperty(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj
    }
    if (obj instanceof Date || obj instanceof RegExp) {
      return obj
    }

    const builtInProperties = ['_type', '_class']

    if (Array.isArray(obj)) {
      return obj.map(item => this._removeBuiltInProperty(item))
    }

    if (typeof obj === 'object') {
      const result: any = {}
      for (const key in obj) {
        if (builtInProperties.includes(key)) continue;
        if (obj.hasOwnProperty(key)) {
          result[key] = this._removeBuiltInProperty(obj[key])
        }
      }
      return result
    }
    return obj
  }

  frozenJson(): T {
    const origin = this._origin as any
    if (this.native instanceof YMap) {
      const result: { [key: string | number]: any} = {}
      for (let key in origin) {
        if (
          !RHINE_VAR_PREDEFINED_PROPERTIES.has(key) &&
          typeof origin[key] !== 'function' &&
          this.hasOwnProperty(key)
        ) {
          let value = origin[key]
          if (value instanceof RhineVarBase) {
            value = value.frozenJson()
          }
          if (!isNaN(Number(key))) {
            result[Number(key)] = value
          } else {
            result[key] = value
          }
        }
      }
      return result as T
    } else if (this.native instanceof YArray) {
      const result: any[] = []
      for (let i = 0;; i++) {
        if (i in origin) {
          let value = origin[i]
          if (value instanceof RhineVarBase) {
            value = value.frozenJson()
          }
          result.push(value)
        } else {
          break
        }
      }
      return result as T
    }
    return {} as T
  }

  jsonString(indent = 2): string {
    return JSON.stringify(this.json(), null, indent)
  }

  private syncedSubscribers: SyncedCallback[] = []
  subscribeSynced(callback: SyncedCallback) {
    this.syncedSubscribers.push(callback)
    return () => this.unsubscribeSynced(callback)
  }
  unsubscribeSynced(callback: SyncedCallback) {
    this.syncedSubscribers = this.syncedSubscribers.filter(subscriber => subscriber !== callback)
  }
  unsubscribeAllSynced() {
    this.syncedSubscribers = []
  }

  private emitSynced(synced: boolean) {
    this.syncedSubscribers.forEach(subscriber => subscriber(synced))
  }


  private subscribers: Callback<T>[] = []
  subscribe(callback: Callback<T>): () => void {
    this.subscribers.push(callback)
    return () => this.unsubscribe(callback)
  }
  unsubscribe(callback: Callback<T>) {
    this.subscribers = this.subscribers.filter(subscriber => subscriber !== callback)
  }
  unsubscribeAll() {
    this.subscribers = []
  }

  private keySubscribers: Map<keyof T, Callback<T>[]> = new Map()
  subscribeKey(key: keyof T, callback: Callback<T>): () => void {
    if (!this.keySubscribers.has(key)) {
      this.keySubscribers.set(key, [])
    }
    this.keySubscribers.get(key)!.push(callback)
    return () => this.unsubscribeKey(callback)
  }
  unsubscribeKey(callback: Callback<T>) {
    this.keySubscribers.forEach((subscribers, key) => {
      this.keySubscribers.set(key, subscribers.filter(subscriber => subscriber !== callback))
    })
  }
  unsubscribeAllKey() {
    this.keySubscribers = new Map()
  }

  private emit(key: keyof T, value: T[keyof T], oldValue: T[keyof T], type: ChangeType, nativeEvent: YMapEvent<any> | YArrayEvent<any> | YTextEvent, nativeTransaction: Transaction) {
    this.subscribers.forEach(subscriber => subscriber(key, value, oldValue, type, nativeEvent, nativeTransaction))
    if (this.keySubscribers.has(key)) {
      this.keySubscribers.get(key)!.forEach(subscriber => subscriber(key, value, oldValue, type, nativeEvent, nativeTransaction))
    }
  }


  private deepSubscribers: DeepCallback<T>[] = []
  subscribeDeep(callback: DeepCallback<T>): () => void {
    this.deepSubscribers.push(callback)
    return () => this.unsubscribeDeep(callback)
  }
  unsubscribeDeep(callback: DeepCallback<T>) {
    this.deepSubscribers = this.deepSubscribers.filter(subscriber => subscriber !== callback)
  }
  unsubscribeAllDeep() {
    this.deepSubscribers = []
  }

  emitDeep(path: RvPath, value: any, oldValue: any, type: ChangeType, nativeEvent: YMapEvent<any> | YArrayEvent<any> | YTextEvent, nativeTransaction: Transaction) {
    this.deepSubscribers.forEach(subscriber => subscriber(path, value, oldValue, type, nativeEvent, nativeTransaction))

    if (this.parent) {
      const key = getKeyFromParent(this.native)
      if (key !== undefined) {
        this.parent.emitDeep([key, ...path], value, oldValue, type, nativeEvent, nativeTransaction)
      }
    }
  }

  private observer = (event: YMapEvent<any> | YArrayEvent<any> | YTextEvent, transaction: Transaction) => {}
  private syncedObserver: SyncedCallback = (synced: boolean) => {}

  observe() {
    const connector = this.getConnector()
    if (connector) {
      this.syncedObserver = (synced: boolean) => {
        this.emitSynced(synced)
      }
      connector.subscribeSynced(this.syncedObserver)
      this.emitSynced(connector.synced)
    }

    const target = this.native
    if (target instanceof YMap) {
      this.observer = (event, transaction) => {
        event.changes.keys.forEach(({action, oldValue}, key) => {
          const type = action === 'add' ? ChangeType.Add : (action === 'delete' ? ChangeType.Delete : ChangeType.Update)

          if (isObjectOrArray(oldValue)) {
            oldValue = Reflect.get(this, key)
            if (oldValue instanceof RhineVarBase) {
              oldValue = oldValue.frozenJson()
            }
          }

          let value = undefined
          if (type === ChangeType.Add || type === ChangeType.Update) {
            value = target.get(key)
            if (isNative(value)) {
              Reflect.set(this._origin, key, rhineProxyGeneral(value, this as any))
            } else {
              Reflect.set(this._origin, key, value)
            }
          } else if (type === ChangeType.Delete) {
            Reflect.deleteProperty(this._origin, key)
          }

          const newValue = key in this ? Reflect.get(this, key) : value
          log('Proxy.event: Map', action, key + ':', oldValue, '->', newValue)
          this.emit(key as keyof T, newValue, oldValue, type, event, transaction)
          this.emitDeep([key], newValue, oldValue, type, event, transaction)
        })
      }
    } else if (target instanceof YArray){
      this.observer = (event, transaction) => {
        let i = 0
        event.delta.forEach(deltaItem => {
          if (deltaItem.retain !== undefined) {
            i += deltaItem.retain
          } else if (deltaItem.delete !== undefined) {
            for (let j = 0; j < deltaItem.delete; j++) {
              let oldValue = i in this ? Reflect.get(this, i) : target.get(i)
              if (oldValue instanceof RhineVarBase) {
                oldValue = oldValue.frozenJson()
              }

              Reflect.deleteProperty(this._origin, i)
              for (let k = i + 1; k < target.length + deltaItem.delete; k++) {
                const value = Reflect.get(this, k)
                Reflect.set(this._origin, k - 1, value)
                Reflect.deleteProperty(this._origin, k)
              }

              log('Proxy.event: Array delete', i + ':', oldValue, '->', undefined)
              this.emit(i as keyof T, undefined as any, oldValue as any, ChangeType.Delete, event, transaction)
              this.emitDeep([i], undefined, oldValue, ChangeType.Delete, event, transaction)
              i++
            }
          } else if (deltaItem.insert !== undefined && Array.isArray(deltaItem.insert)) {
            deltaItem.insert.forEach((value) => {
              for (let k = target.length - 1; k >= i; k--) {
                const existingValue = Reflect.get(this, k)
                Reflect.set(this._origin, k + 1, existingValue)
              }
              if (isObjectOrArray(value)) {
                Reflect.set(this._origin, i, rhineProxyGeneral(value, this as any))
              } else {
                Reflect.set(this._origin, i, value)
              }

              const newValue = i in this ? Reflect.get(this, i) : target.get(i)
              log('Proxy.event: Array add', i, ':', undefined, '->', newValue)
              this.emit(i as keyof T, newValue as any, undefined as any, ChangeType.Add, event, transaction)
              this.emitDeep([i], newValue, undefined, ChangeType.Add, event, transaction)
              i++
            })
          }
        })
      }
    } else if (target instanceof YText) {
      this.observer = (event, transaction) => {
        let hasDelete = false
        let hasInsert = false
        event.delta.forEach(deltaItem => {
          if (deltaItem.delete !== undefined) {
            hasDelete = true
          } else if (deltaItem.insert !== undefined) {
            hasInsert = true
          }
        })
        const isUpdate = hasDelete && hasInsert
        const oldValue = Reflect.get(this, 'value')
        const newValue = this.native.toString()
        Reflect.set(this._origin, 'value', newValue)

        let i = 0
        if (isUpdate) {
          log('Proxy.event: Text update', ':', oldValue, '->', newValue)
          this.emit(i as keyof T, newValue as any, oldValue as any, ChangeType.Update, event, transaction)
          this.emitDeep([i], newValue, oldValue, ChangeType.Update, event, transaction)
        } else {
          event.delta.forEach(deltaItem => {
            if (deltaItem.retain !== undefined) {
              i += deltaItem.retain
              return
            }
            if (deltaItem.delete !== undefined) {
              log('Proxy.event: Text delete', i, ':', oldValue, '->', newValue)
              this.emit(i as keyof T, newValue as any, oldValue as any, ChangeType.Delete, event, transaction)
              this.emitDeep([i], newValue, oldValue, ChangeType.Delete, event, transaction)
              i += deltaItem.delete
            } else if (deltaItem.insert !== undefined) {
              log('Proxy.event: Text add', i, ':', oldValue, '->', newValue)
              this.emit(i as keyof T, newValue as any, oldValue as any, ChangeType.Add, event, transaction)
              this.emitDeep([i], newValue, oldValue, ChangeType.Add, event, transaction)
              i += newValue.length
            }
          })
        }
      }
    } else {
      this.observer = (event, transaction) => {
        this.emit(undefined as any, undefined as any, undefined as any, ChangeType.Update, event, transaction)
        this.emitDeep(undefined as any, undefined, undefined, ChangeType.Update, event, transaction)
      }
    }

    if (this.observer) {
      target.observe(this.observer as any)
    }
  }

  unobserve() {
    if (this.observer) {
      this.native.unobserve(this.observer as any)
    }
    if (this.syncedObserver) {
      this.getConnector()?.unsubscribeSynced(this.syncedObserver)
    }
  }
}


export const RHINE_VAR_PREDEFINED_PROPERTIES = new Set<string | symbol>([
  '_origin',
  '_class',
  '_type',

  '_initialize',

  'native',
  'json',
  'jsonString',
  'parent',
  'isRoot',
  'root',

  '_options',
  '_connector',
  '_undoManager',
  '_awareness',
  '_clientId',

  'getOptions',
  'getConnector',
  'getUndoManager',
  'getAwareness',
  'getClientId',

  'afterSynced',
  'waitSynced',

  'syncedSubscribers',
  'subscribeSynced',
  'unsubscribeSynced',
  'unsubscribeAllSynced',

  'subscribers',
  'subscribe',
  'unsubscribe',
  'unsubscribeAll',

  'keySubscribers',
  'subscribeKey',
  'unsubscribeKey',
  'unsubscribeAllKey',

  'deepSubscribers',
  'subscribeDeep',
  'unsubscribeDeep',
  'unsubscribeAllDeep',

  'emitSynced',
  'emit',
  'emitDeep',

  'observer',
  'syncedObserver',
  'observe',
  'unobserve',
])
