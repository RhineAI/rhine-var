type ReactType = typeof import('react') | null

const supportsDynamicImport = (() => {
  try {
    new Function('return import("data:,")')
    return true
  } catch {
    return false
  }
})()

export default function loadReact(): ReactType {
  // 1. 全局变量检测（UMD）
  const globalReact = (() => {
    if (typeof window !== 'undefined' && (window as any).React) {
      return (window as any).React
    }
    if (typeof global !== 'undefined' && (global as any).React) {
      return (global as any).React
    }
    return null
  })()

  if (globalReact) return globalReact

  // 2. 模块系统检测
  try {
    // 2A. CommonJS
    if (typeof require === 'function') {
      return require('react')
    }
  } catch {}

  // 2B. ESM 动态导入
  if (supportsDynamicImport) {
    // TODO: Promise is not supported
    return import('react').then(m => m.default || m).catch(() => null) as any
  }

  // 3. React Native 特殊处理
  // TODO: React Native is not supported now
  // if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
  //   try {
  //     return require('react-native').require('react')
  //   } catch {}
  // }

  return null
}
