import SupportArray from "@/core/var/support/class/support-array.class";
import RhineVarArray from "@/core/var/items/rhine-var-array.class";
import RhineVarMap from "@/core/var/items/rhine-var-map.class";
import RhineVarText from "@/core/var/items/rhine-var-text.class";
import {RhineVarAny} from "@/core/var/rhine-var.type";
import RhineVarObject from "@/core/var/items/rhine-var-object.class";
import SupportMap from "@/core/var/support/class/support-map.class";
import SupportText from "@/core/var/support/class/support-text.class";
import SupportObject from "@/core/var/support/class/support-object.class";

export default class SupportManager {

  static convertProperty<T>(key: string | symbol, object: RhineVarAny) {
    // console.log('SupportManager.convertProperty', key, object)
    if (object instanceof RhineVarArray) {
      return SupportArray.convertProperty<T>(key, object)
    } else if (object instanceof RhineVarMap) {
      return SupportMap.convertProperty<T>(key, object)
    } else if (object instanceof RhineVarObject) {
      return SupportObject.convertProperty<T>(key, object)
    } else if (object instanceof RhineVarText) {
      return SupportText.convertProperty(key, object)
    }

    return null
  }

}
