import { NativeType } from '@/core/native/native-type.enum'
import RhineVarBase from '@/core/var/rhine-var-base.class'

export default class RhineVarXmlElement<T extends object = any> extends RhineVarBase<T> {
  _type: NativeType.XmlElement = NativeType.XmlElement
}
