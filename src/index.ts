import {rhineProxy, rhineProxyGeneral} from "@/core/proxy/rhine-proxy";
import { RhineVar, RecursiveCrossRhineVar, StoredRhineVar, RhineVarAny, RecursiveObject, RecursiveArray, RecursiveMap } from "@/core/var/rhine-var.type";
import Connector from "@/core/connector/connector.abstract";
import {Native, RvKey, RvPath} from "@/core/native/native.type";
import {getRhineVarConfig, enableRhineVarLog, enableRhineVarSyncHandshakeCheck} from "@/config/config";
import RhineVarBase from "@/core/var/rhine-var-base.class";
import RhineVarMap from "@/core/var/items/rhine-var-map.class";
import RhineVarArray from "@/core/var/items/rhine-var-array.class";
import RhineVarText from "@/core/var/items/rhine-var-text.class";
import RhineVarXmlText from "@/core/var/items/rhine-var-xml-text.class";
import RhineVarXmlElement from "@/core/var/items/rhine-var-xml-element.class";
import RhineVarXmlFragment from "@/core/var/items/rhine-var-xml-fragment.class";
import SupportManager from "@/core/var/support/support-manager";
import text from "@/core/proxy/items/text";
import map from "./core/proxy/items/map";
import item from "./core/proxy/items/item";
import {
  Doc as YDoc,
  Array as YArray,
  Map as YMap,
  Text as YText,
  XmlFragment as YXmlFragment,
  XmlElement as YXmlElement,
  XmlText as YXmlText
} from "yjs";
import ProxyOptions from "./core/proxy/proxy-options.interface";
import { UndoManagerOptions } from "yjs/dist/src/utils/UndoManager";
import { EventType } from "./core/event/event-type.enum";

export type {
  StoredRhineVar,
  RhineVarAny,
  RecursiveCrossRhineVar,
  RecursiveObject,
  RecursiveArray,
  RecursiveMap,
  Native,
  RvPath,
  RvKey,
  ProxyOptions,
  UndoManagerOptions,
}

export {
  Connector,
  rhineProxy,
  rhineProxyGeneral,
  item,
  text,
  map,
  RhineVarBase,
  RhineVar,
  RhineVarMap,
  RhineVarArray,
  RhineVarText,
  RhineVarXmlText,
  RhineVarXmlElement,
  RhineVarXmlFragment,
  SupportManager,
  enableRhineVarLog,
  enableRhineVarSyncHandshakeCheck,
  getRhineVarConfig,
  YDoc,
  YMap,
  YArray,
  YText,
  YXmlFragment,
  YXmlElement,
  YXmlText,
  EventType,
}
