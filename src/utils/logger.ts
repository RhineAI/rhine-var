import RhineVarConfig from '@/config/config'

export function log(...items: any[]) {
  if (RhineVarConfig.ENABLE_LOG) {
    nativeLog(...items)
  }
}

export function nativeLog(...items: any[]) {
  console.log('%cRhineVar', 'color: #b6ff00', ...items)
}

export function warn(...items: any[]) {
  if (RhineVarConfig.ENABLE_ERROR) {
    nativeError(...items)
  }
}

export function nativeWarn(...items: any[]) {
  console.warn('%cRhineVar', 'color: #b6ff00', ...items)
}

export function error(...items: any[]) {
  if (RhineVarConfig.ENABLE_ERROR) {
    nativeError(...items)
  }
}

export function nativeError(...items: any[]) {
  console.error('%cRhineVar', 'color: #b6ff00', ...items)
}
