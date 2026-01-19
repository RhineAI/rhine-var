import { Native } from '@/core/native/native.type'
import YObject from '@/core/native/y-object'
import RhineVarArray from '@/core/var/items/rhine-var-array.class'
import RhineVarMap from '@/core/var/items/rhine-var-map.class'
import RhineVarObject from '@/core/var/items/rhine-var-object.class'
import RhineVarText from '@/core/var/items/rhine-var-text.class'
import RhineVarXmlElement from '@/core/var/items/rhine-var-xml-element.class'
import RhineVarXmlFragment from '@/core/var/items/rhine-var-xml-fragment.class'
import RhineVarXmlText from '@/core/var/items/rhine-var-xml-text.class'
import { YMap, YArray, YText, YXmlText, YXmlElement, YXmlFragment } from '@/index'

export type RhineVarAny<T extends object = any> =
  | RhineVarObject<T>
  | RhineVarMap<T>
  | RhineVarArray<T>
  | RhineVarText
  | RhineVarXmlText
  | RhineVarXmlElement<T>
  | RhineVarXmlFragment

export type RhineVar<T extends object = any> = T extends YXmlText | RhineVarXmlText
  ? RhineVarXmlText
  : T extends YXmlElement | RhineVarXmlElement
    ? RhineVarXmlElement<T>
    : T extends YXmlFragment | RhineVarXmlFragment
      ? RhineVarXmlFragment
      : T extends YText | RhineVarText
        ? RhineVarText
        : T extends YArray<infer U> | RhineVarArray<infer U> | (infer U)[]
          ? RhineVarArray<U>
          : T extends YObject<any> | RhineVarObject
            ? RhineVarObject<T>
            : T extends YMap<infer U> | RhineVarMap<infer U>
              ? RhineVarMap<U>
              : RhineVarObject<T>

export type RecursiveObject<T extends object> = {
  [K in keyof T]: T[K] extends object ? RecursiveCrossRhineVar<T[K]> : T[K]
} & RhineVarObject<T>
export type RecursiveArray<T> = RhineVarArray<T extends object ? RecursiveCrossRhineVar<T> : T, T>
export type RecursiveMap<T> = RhineVarMap<T extends object ? RecursiveCrossRhineVar<T> : T, T>

export type RecursiveCrossRhineVar<T extends object> = T extends YXmlText | YText | YXmlFragment
  ? RhineVar<T>
  : T extends (infer U)[] | YArray<infer U> | RhineVarArray<infer U>
    ? RecursiveArray<U>
    : T extends YObject<any> | RhineVarObject
      ? RecursiveObject<T>
      : T extends YMap<infer U> | RhineVarMap<infer U>
        ? RecursiveMap<U>
        : RecursiveObject<T>

export type StoredRhineVar<T extends object = any> = RecursiveCrossRhineVar<T>

export type InputItem<T> = T extends object ? T | Native | StoredRhineVar<T> : T
export type OutputItem<T> = T extends object ? StoredRhineVar<T> : T
