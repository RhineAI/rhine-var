import { HocuspocusProvider } from '@hocuspocus/provider'

import RhineVarConfig from '@/config/config'
import { ConnectorStatus } from '@/core/connector/connector-status.enum'
import Connector from '@/core/connector/connector.abstract'
import SyncHandshakeCheck from '@/core/connector/websocket/sync-handshake-check.class'
import { YDoc } from '@/index'
import { error, log } from '@/utils/logger'

export default class HocuspocusConnector extends Connector {
  url = ''
  name = ''

  provider: HocuspocusProvider | null = null

  async connect(text: string): Promise<void> {
    const li = text.lastIndexOf('/')
    if (li == -1 || li == text.length - 1 || !text.startsWith('ws')) {
      error('HocuspocusConnector: UnSupport URL to connect room')
      return
    }

    this.name = text.substring(li + 1)
    this.url = text.substring(0, li)

    this.yDoc = new YDoc()
    this.yBaseMap = this.yDoc.getMap()

    return new Promise((resolve, reject) => {
      this.provider = new HocuspocusProvider({
        url: this.url,
        name: this.name,
        document: this.yDoc!,
      })

      this.provider.on('status', (event: any) => {
        this.status = event.status
        log('HocuspocusProvider.event status:', event.status)
      })

      this.provider.on('sync', async (synced: boolean) => {
        log('HocuspocusProvider.event sync:', synced)
        if (synced) {
          if (RhineVarConfig.ENABLE_SYNC_HANDSHAKE_CHECK) {
            await SyncHandshakeCheck.wait(this.yBaseMap!)
          }
          log('HocuspocusProvider.event base map:', this.yBaseMap!.toJSON())
          this.synced = true
          this.clientId = this.yDoc!.clientID
          this.emitSynced(synced)
          resolve()
        } else {
          log('HocuspocusProvider.event sync:', false)
        }
      })

      this.provider.on('connection-close', (e: any) => {
        this.status = ConnectorStatus.DISCONNECTED
        log('HocuspocusProvider.event connection-close:', e)
      })

      this.provider.on('connection-error', (error: any) => {
        this.status = ConnectorStatus.DISCONNECTED
        log('HocuspocusProvider.event connection-error:', error)
      })
    })
  }

  async disconnect() {
    throw new Error('Disconnecting and switching connections are not supported at the moment.')
    /*
    if (this.provider) {
      this.provider.disconnect()
    }
    this.provider = null
    this.synced = false
    this.websocketStatus = ConnectorStatus.DISCONNECTED
    */
  }
}
