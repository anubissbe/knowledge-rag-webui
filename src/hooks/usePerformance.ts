import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react'

// Debounce hook for performance optimization
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Throttle hook for scroll events and other high-frequency events
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCall = useRef<number>(0)
  const lastCallTimer = useRef<NodeJS.Timeout | null>(null)

  return useCallback(
    ((...args: any[]) => {
      const now = Date.now()
      
      if (now - lastCall.current >= delay) {
        lastCall.current = now
        return callback(...args)
      } else {
        clearTimeout(lastCallTimer.current)
        lastCallTimer.current = setTimeout(() => {
          lastCall.current = Date.now()
          callback(...args)
        }, delay - (now - lastCall.current))
      }
    }) as T,
    [callback, delay]
  )
}

// Memoized callback with dependency array
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps)
}

// Memoized value with deep comparison
export function useDeepMemo<T>(factory: () => T, deps: React.DependencyList): T {
  const ref = useRef<{ deps: React.DependencyList; value: T } | null>(null)
  
  if (!ref.current || !areArraysEqual(ref.current.deps, deps)) {
    ref.current = { deps, value: factory() }
  }
  
  return ref.current.value
}

// Performance measurement hook
export function usePerformanceMonitor(name: string) {
  const startTime = useRef<number | undefined>(undefined)
  
  const start = useCallback(() => {
    startTime.current = performance.now()
  }, [])
  
  const end = useCallback(() => {
    if (startTime.current) {
      const duration = performance.now() - startTime.current
      console.log(`Performance [${name}]: ${duration.toFixed(2)}ms`)
      return duration
    }
    return 0
  }, [name])
  
  const measure = useCallback((fn: () => void) => {
    start()
    fn()
    return end()
  }, [start, end])
  
  return { start, end, measure }
}

// Memory usage monitoring
export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState<any>(null)
  
  useEffect(() => {
    const checkMemory = () => {
      if ('memory' in performance) {
        setMemoryInfo((performance as any).memory)
      }
    }
    
    checkMemory()
    const interval = setInterval(checkMemory, 5000) // Check every 5 seconds
    
    return () => clearInterval(interval)
  }, [])
  
  return memoryInfo
}

// Batch state updates
export function useBatchedUpdates<T>(
  initialState: T,
  batchDelay: number = 16 // One frame at 60fps
) {
  const [state, setState] = useState(initialState)
  const pendingUpdates = useRef<((prev: T) => T)[]>([])
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const batchedSetState = useCallback((update: T | ((prev: T) => T)) => {
    const updateFn = typeof update === 'function' ? update as (prev: T) => T : () => update
    pendingUpdates.current.push(updateFn)
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      setState(prevState => {
        let newState = prevState
        pendingUpdates.current.forEach(updateFn => {
          newState = updateFn(newState)
        })
        pendingUpdates.current = []
        return newState
      })
    }, batchDelay)
  }, [batchDelay])
  
  return [state, batchedSetState] as const
}

// Resource preloading
export function usePreloadResource(src: string, type: 'image' | 'script' | 'style') {
  useEffect(() => {
    if (!src) return
    
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = src
    
    switch (type) {
      case 'image':
        link.as = 'image'
        break
      case 'script':
        link.as = 'script'
        break
      case 'style':
        link.as = 'style'
        break
    }
    
    document.head.appendChild(link)
    
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link)
      }
    }
  }, [src, type])
}

// Bundle size optimization - dynamic imports
export function useDynamicImport<T>(importFn: () => Promise<T>) {
  const [module, setModule] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const loadModule = useCallback(async () => {
    if (module) return module
    
    setLoading(true)
    setError(null)
    
    try {
      const loadedModule = await importFn()
      setModule(loadedModule)
      return loadedModule
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [importFn, module])
  
  return { module, loading, error, loadModule }
}

// Utility functions
function areArraysEqual(a: readonly any[], b: readonly any[]): boolean {
  if (a.length !== b.length) return false
  return a.every((val, i) => val === b[i])
}

