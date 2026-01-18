import {EventType} from "@/core/subscriber/event-type.enum";
import {Transaction, YArrayEvent, YMapEvent, YTextEvent} from "yjs";
import {RvPath} from "@/core/native/native.type";
import {StoredRhineVar} from "@/core/var/rhine-var.type";

export type Subscriber<T> = (
  type: EventType,
  key: keyof T,
  value: T[keyof T] extends object ? T[keyof T] | StoredRhineVar<T[keyof T]> : T[keyof T],
  oldValue: T[keyof T],
  nativeEvent: YMapEvent<any> | YArrayEvent<any> | YTextEvent,
  nativeTransaction: Transaction
) => void

export type KeySubscriber<T> = (
  type: EventType,
  value: T[keyof T] extends object ? T[keyof T] | StoredRhineVar<T[keyof T]> : T[keyof T],
  oldValue: T[keyof T],
  nativeEvent: YMapEvent<any> | YArrayEvent<any> | YTextEvent,
  nativeTransaction: Transaction
) => void

export type DeepSubscriber<T> = (
  type: EventType,
  path: RvPath,
  value: any | StoredRhineVar<any>,
  oldValue: any,
  nativeEvent: YMapEvent<any> | YArrayEvent<any> | YTextEvent,
  nativeTransaction: Transaction
) => void

export type SyncedSubscriber = (synced: boolean) => void
