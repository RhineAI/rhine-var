import YObject from '@/core/native/y-object'
import { YMap, YArray, YText, YXmlText, YXmlElement, YXmlFragment } from '@/index'

export type Native<T extends object = any> =
  | YObject<T>
  | YMap<T>
  | YArray<T>
  | YText
  | YXmlText
  | YXmlElement<any>
  | YXmlFragment

export type RvKey = string | number

export type RvPath = RvKey[]
