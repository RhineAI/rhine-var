'use client'
import { StoredRhineVar } from '@/core/var/rhine-var.type'

import loadReact from '../load-react'

export default function useRhine<T extends object>(proxy: StoredRhineVar<T>): Readonly<T> {
  const React = loadReact()
  if (!React) {
    throw new Error('RhineVar: useRhine hook requires React')
  }

  const createSnapshot = () => proxy.json() as Readonly<T>
  const [state, setState] = React.useState(createSnapshot)

  React.useEffect(() => {
    const updateState = () => {
      setState(createSnapshot)
    }
    const unsubscribeSynced = proxy.subscribeSynced(updateState)
    const unsubscribeDeep = proxy.subscribeDeep(updateState)
    return () => {
      unsubscribeSynced()
      unsubscribeDeep()
    }
  }, [proxy])

  return state
}
