import { Native } from '@/core/native/native.type'
import { rhineProxyGeneral } from '@/core/proxy/rhine-proxy'
import { isObjectOrArray } from '@/core/utils/data.utils'
import { isNative, jsonToNative } from '@/core/utils/native.utils'
import RhineVarArray from '@/core/var/items/rhine-var-array.class'
import RhineVarMap from '@/core/var/items/rhine-var-map.class'
import RhineVarObject from '@/core/var/items/rhine-var-object.class'
import RhineVarText from '@/core/var/items/rhine-var-text.class'
import RhineVarXmlElement from '@/core/var/items/rhine-var-xml-element.class'
import RhineVarXmlFragment from '@/core/var/items/rhine-var-xml-fragment.class'
import RhineVarXmlText from '@/core/var/items/rhine-var-xml-text.class'
import RhineVarBase from '@/core/var/rhine-var-base.class'
import { RhineVarAny, StoredRhineVar } from '@/core/var/rhine-var.type'

export function isRhineVar(value: any) {
  return (
    value instanceof RhineVarObject ||
    value instanceof RhineVarMap ||
    value instanceof RhineVarArray ||
    value instanceof RhineVarText ||
    value instanceof RhineVarXmlFragment ||
    value instanceof RhineVarXmlElement ||
    value instanceof RhineVarXmlText
  )
}

export function ensureRhineVar<T extends object = any>(
  value: T | Native,
  parent: RhineVarBase,
): StoredRhineVar<T> | any {
  if (isNative(value)) {
    return rhineProxyGeneral(value as Native, parent)
  }
  if (isObjectOrArray(value)) {
    if (!isRhineVar(value)) {
      return rhineProxyGeneral(ensureNative(value), parent)
    }
  }
  return value
}

export function ensureNative<T extends object = any>(value: T | RhineVarBase<T> | Native): Native {
  if (isNative(value)) {
    return value as Native
  }
  if (isRhineVar(value)) {
    return (value as RhineVarBase).getNative()
  }
  if (isObjectOrArray(value)) {
    return jsonToNative(value)
  }
  return value as Native
}

export type Basic = string | number | boolean | null | undefined

export function ensureNativeOrBasic<T = any>(value: T): Native | Basic {
  if (isBasic(value)) {
    return value
  }
  if (isNative(value)) {
    return value as Native
  }
  if (isRhineVar(value)) {
    return (value as RhineVarBase).getNative()
  }
  if (isObjectOrArray(value)) {
    return jsonToNative(value)
  }
  return null
}

export function isBasic(value: any): value is Basic {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    value === null ||
    value === undefined
  )
}

export function ensureJsonOrBasic<T = any>(value: T | Native | RhineVarAny): Basic | object {
  if (isBasic(value)) {
    return value
  }
  if (isNative(value)) {
    return (value as Native).toJSON()
  }
  if (isRhineVar(value)) {
    return (value as RhineVarBase).json()
  }
  return value as Basic | object
}
