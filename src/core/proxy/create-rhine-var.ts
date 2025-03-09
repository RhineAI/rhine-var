import {RhineVarAny} from "@/core/var/rhine-var.type";
import {Native} from "@/core/native/native.type";
import { YMap, YArray, YText, YXmlText, YXmlElement, YXmlFragment } from "@/index"
import YObject from "@/core/native/y-object";
import RhineVarMap from "@/core/var/items/rhine-var-map.class";
import RhineVarArray from "@/core/var/items/rhine-var-array.class";
import RhineVarText from "@/core/var/items/rhine-var-text.class";
import RhineVarXmlFragment from "@/core/var/items/rhine-var-xml-fragment.class";
import RhineVarXmlElement from "@/core/var/items/rhine-var-xml-element.class";
import RhineVarXmlText from "@/core/var/items/rhine-var-xml-text.class";
import RhineVarBase from "@/core/var/rhine-var-base.class";
import RhineVarObject from "@/core/var/items/rhine-var-object.class";

export function createRhineVar<T extends object = any>(target: Native, parent: RhineVarBase | null): RhineVarAny<T>
export function createRhineVar<T extends object = any>(target: YObject<any>, parent: RhineVarBase | null): RhineVarObject<T>
export function createRhineVar<T extends object = any>(target: YMap<any>, parent: RhineVarBase | null): RhineVarMap<T>
export function createRhineVar<T extends object = any>(target: YArray<any>, parent: RhineVarBase | null): RhineVarArray<T>
export function createRhineVar<T extends object = any>(target: YXmlText, parent: RhineVarBase | null): RhineVarXmlText
export function createRhineVar<T extends object = any>(target: YXmlElement<any>, parent: RhineVarBase | null): RhineVarXmlElement<T>
export function createRhineVar<T extends object = any>(target: YXmlFragment, parent: RhineVarBase | null): RhineVarXmlFragment
export function createRhineVar<T extends object = any>(target: YText, parent: RhineVarBase | null): RhineVarText
export function createRhineVar<T extends object = any>(target: Native, parent: RhineVarBase | null): RhineVarAny<T> {
  if (target instanceof YObject) {
    return new RhineVarObject<T>(target, parent)
  } else if (target instanceof YMap) {
    if (target.get('_class') === 'RhineVarObject') {
      return new RhineVarObject<T>(target, parent)
    }
    return new RhineVarMap<T>(target, parent)
  } else if (target instanceof YArray) {
    return new RhineVarArray<T>(target, parent)
  } else if (target instanceof YXmlText) {
    return new RhineVarXmlText(target, parent)
  } else if (target instanceof YXmlElement) {
    return new RhineVarXmlElement<T>(target, parent)
  } else if (target instanceof YXmlFragment) {
    return new RhineVarXmlFragment(target, parent)
  } else if (target instanceof YText) {
    return new RhineVarText(target, parent)
  } else {
    throw new Error('Unsupported target type to createRhineVar')
  }
}
