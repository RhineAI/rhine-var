import Connector from "@/core/connector/connector.abstract";
import {useEffect, useState} from "react";
import {ProxiedRhineVar} from "@/core/proxy/proxied-rhine-var.type";
import RhineVarBase from "@/core/var/rhine-var-base.class";

export default function useSynced(target?: Connector | ProxiedRhineVar<any>) {
  
  const checkSynced = (): boolean => {
    let connector: Connector | null = null
    if (target instanceof Connector) {
      connector = target
    } else if (target instanceof RhineVarBase) {
      connector = target.getConnector()
    }
    return connector?.synced ?? false
  }
  
  const [synced, setSynced] = useState(checkSynced)
  
  useEffect(() => {
    if (target instanceof Connector) {
      return target.subscribeSynced((value: boolean) => setSynced(value))
    }
    if (target instanceof RhineVarBase) {
      return target.subscribeSynced((value: boolean) => setSynced(value))
    }
  }, [target])
  
  return synced
}
