import {HocuspocusProvider} from '@hocuspocus/provider'

import RhineVarConfig from '@/config/config'
import { ConnectorStatus } from '@/core/connector/connector-status.enum'
import Connector from '@/core/connector/connector.abstract'
import SyncHandshakeCheck from '@/core/connector/websocket/sync-handshake-check.class'
import { YDoc } from '@/index'
import { error, log } from '@/utils/logger'

export default class HocuspocusConnector extends Connector {
  url = ''
  name = ''
  token: string | undefined = undefined

  provider: HocuspocusProvider | null = null

  async connect(text: string, token?: string): Promise<void> {
    const li = text.lastIndexOf('/')
    if (li == -1 || li == text.length - 1 || !text.startsWith('ws')) {
      error('HocuspocusConnector: UnSupport URL to connect room')
      return
    }

    this.name = text.substring(li + 1)
    this.url = text.substring(0, li)
    this.token = token

    this.yDoc = new YDoc()
    this.yBaseMap = this.yDoc.getMap()

    return new Promise((resolve, reject) => {
      this.provider = new HocuspocusProvider({
        url: this.url,
        name: this.name,
        document: this.yDoc!,
        token: this.token,
        onStatus: ({ status }) => {
          this.status = status.toUpperCase() as ConnectorStatus
          log('HocuspocusProvider.event status:', status)
        },
        onSynced: async () => {
          log('HocuspocusProvider.event synced')
          if (RhineVarConfig.ENABLE_SYNC_HANDSHAKE_CHECK) {
            await SyncHandshakeCheck.wait(this.yBaseMap!)
          }
          log('HocuspocusProvider.event base map:', this.yBaseMap!.toJSON())
          this.synced = true
          this.clientId = this.yDoc!.clientID
          this.emitSynced(true)
          resolve()
        },
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
