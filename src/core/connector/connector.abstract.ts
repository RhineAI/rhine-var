import { ConnectorStatus } from '@/core/connector/connector-status.enum'
import { Native } from '@/core/native/native.type'
import { SyncedSubscriber } from '@/core/subscriber/subscriber'
import { YMap, YDoc } from '@/index'

export default abstract class Connector {
  static STATE_KEY = 'state'

  yDoc: YDoc | null = null
  yBaseMap: YMap<any> | null = null

  clientId = -1
  synced = false

  status: ConnectorStatus = ConnectorStatus.DISCONNECTED

  protected syncedSubscribers: SyncedSubscriber[] = []
  subscribeSynced(callback: SyncedSubscriber) {
    this.syncedSubscribers.push(callback)
    return () => {
      this.unsubscribeSynced(callback)
    }
  }
  unsubscribeSynced(callback: SyncedSubscriber) {
    this.syncedSubscribers = this.syncedSubscribers.filter((subscriber) => subscriber !== callback)
  }
  unsubscribeAllSynced() {
    this.syncedSubscribers = []
  }
  protected emitSynced(synced: boolean) {
    this.syncedSubscribers.forEach((subscriber) => {
      subscriber(synced)
    })
  }

  afterSynced(callback: () => void) {
    if (this.synced) {
      callback()
    } else {
      const subscriber = (synced: boolean) => {
        if (synced) {
          this.unsubscribeSynced(subscriber)
          callback()
        }
      }
      this.subscribeSynced(subscriber)
    }
  }
  waitSynced(): Promise<void> {
    return new Promise((resolve) => {
      this.afterSynced(resolve)
    })
  }

  constructor(text = '') {}

  hasState(): boolean {
    return this.yBaseMap?.has(Connector.STATE_KEY) ?? false
  }

  getState(): Native {
    return this.yBaseMap?.get(Connector.STATE_KEY)
  }

  setState(state: Native) {
    this.yBaseMap?.set(Connector.STATE_KEY, state)
  }

  abstract connect(text: string): Promise<void>

  abstract disconnect(): Promise<void>
}

export function websocketRhineConnect(url: string) {}
