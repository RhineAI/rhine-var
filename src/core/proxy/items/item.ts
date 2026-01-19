import { StoredRhineVar } from '@/core/var/rhine-var.type'

export default function item<T extends object = any>(value: T): StoredRhineVar<T> {
  return value as StoredRhineVar<T>
}
