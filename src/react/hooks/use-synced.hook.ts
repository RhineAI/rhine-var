import Connector from '@/core/connector/connector.abstract'
import RhineVarBase from '@/core/var/rhine-var-base.class'
import { StoredRhineVar } from '@/core/var/rhine-var.type'
import loadReact from '@/react/load-react'

export default function useSynced(target?: Connector | StoredRhineVar) {
  const React = loadReact()
  if (!React) {
    throw new Error('RhineVar: useRhine hook requires React')
  }

  const checkSynced = (): boolean => {
    let connector: Connector | null = null
    if (target instanceof Connector) {
      connector = target
    } else if (target instanceof RhineVarBase) {
      connector = target.getConnector()
    }
    return connector?.synced ?? false
  }

  const [synced, setSynced] = React.useState(checkSynced)

  React.useEffect(() => {
    if (target instanceof Connector) {
      return target.subscribeSynced((value: boolean) => {
        setSynced(value)
      })
    }
    if (target instanceof RhineVarBase) {
      // @ts-ignore
      return target.subscribeSynced((value: boolean) => {
        setSynced(value)
      })
    }
  }, [target])

  return synced
}
