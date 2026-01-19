declare global {
  interface ReactUMD {
    useState: typeof import('react').useState
    useEffect: typeof import('react').useEffect
    useRef: typeof import('react').useRef
  }

  const React: typeof import('react') | undefined
}

declare module 'react' {
  export = globalThis.React
}
