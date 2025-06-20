import { renderHook, act } from '@testing-library/react'
import {
  useDebounce,
  useThrottle,
  useStableCallback,
  usePerformanceMonitor,
  useMemoryMonitor,
  useBatchedUpdates,
  usePreloadResource,
  useDynamicImport
} from '../usePerformance'

// Mock performance API
const mockPerformance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn()
}
Object.defineProperty(global, 'performance', {
  value: mockPerformance,
  writable: true
})

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('debounces value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    expect(result.current).toBe('initial')

    // Change value
    rerender({ value: 'updated', delay: 500 })
    expect(result.current).toBe('initial') // Still old value

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(result.current).toBe('updated')
  })

  it('cancels previous timeout on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    rerender({ value: 'change1', delay: 500 })
    act(() => {
      jest.advanceTimersByTime(250)
    })

    rerender({ value: 'change2', delay: 500 })
    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(result.current).toBe('change2')
  })
})

describe('useThrottle', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('throttles function calls', () => {
    const mockFn = jest.fn()
    const { result } = renderHook(() => useThrottle(mockFn, 100))

    // Call multiple times rapidly
    act(() => {
      result.current('call1')
      result.current('call2')
      result.current('call3')
    })

    // Only first call should execute immediately
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenCalledWith('call1')

    // Advance time
    act(() => {
      jest.advanceTimersByTime(100)
    })

    // Last call should execute after throttle period
    expect(mockFn).toHaveBeenCalledTimes(2)
    expect(mockFn).toHaveBeenLastCalledWith('call3')
  })
})

describe('useStableCallback', () => {
  it('memoizes callback with dependencies', () => {
    let callbacks: any[] = []

    const { rerender } = renderHook(
      ({ value }) => {
        const cb = useStableCallback(() => value, [value])
        callbacks.push(cb)
        return cb
      },
      { initialProps: { value: 'test' } }
    )

    rerender({ value: 'test' }) // Same dependency
    expect(callbacks[0]).toBe(callbacks[1]) // Should be same reference

    rerender({ value: 'changed' }) // Different dependency
    expect(callbacks[1]).not.toBe(callbacks[2]) // Should be different reference
  })
})

describe('usePerformanceMonitor', () => {
  it('provides performance monitoring functions', () => {
    const { result } = renderHook(() => usePerformanceMonitor('test-operation'))

    expect(result.current.start).toBeInstanceOf(Function)
    expect(result.current.end).toBeInstanceOf(Function)
    expect(result.current.measure).toBeInstanceOf(Function)
  })

  it('measures performance correctly', () => {
    const { result } = renderHook(() => usePerformanceMonitor('test-operation'))

    act(() => {
      result.current.start()
    })

    expect(mockPerformance.now).toHaveBeenCalled()

    act(() => {
      const duration = result.current.end()
      expect(typeof duration).toBe('number')
    })
  })
})

describe('useMemoryMonitor', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('returns null when memory API not available', () => {
    const { result } = renderHook(() => useMemoryMonitor())
    expect(result.current).toBeNull()
  })

  it('monitors memory when API is available', () => {
    // Mock memory API
    const mockMemory = {
      usedJSHeapSize: 1000000,
      totalJSHeapSize: 2000000,
      jsHeapSizeLimit: 4000000
    }
    Object.defineProperty(performance, 'memory', {
      value: mockMemory,
      writable: true
    })

    const { result } = renderHook(() => useMemoryMonitor())

    act(() => {
      jest.advanceTimersByTime(5000) // Trigger interval
    })

    expect(result.current).toEqual(mockMemory)
  })
})

describe('useBatchedUpdates', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('batches state updates', () => {
    const { result } = renderHook(() => useBatchedUpdates(0, 16))

    act(() => {
      result.current[1](1)
      result.current[1](2)
      result.current[1](3)
    })

    // Should still be initial value before batch timeout
    expect(result.current[0]).toBe(0)

    act(() => {
      jest.advanceTimersByTime(16)
    })

    // Should have final value after batch
    expect(result.current[0]).toBe(3)
  })
})

describe('usePreloadResource', () => {
  let mockLink: any
  let originalAppendChild: any
  let originalRemoveChild: any
  let originalContains: any
  let originalCreateElement: any

  beforeEach(() => {
    mockLink = {
      rel: '',
      href: '',
      as: ''
    }
    
    originalCreateElement = document.createElement
    originalAppendChild = document.head.appendChild
    originalRemoveChild = document.head.removeChild
    originalContains = document.head.contains
    
    document.createElement = jest.fn().mockReturnValue(mockLink)
    document.head.appendChild = jest.fn()
    document.head.removeChild = jest.fn()
    document.head.contains = jest.fn().mockReturnValue(true)
  })

  afterEach(() => {
    document.createElement = originalCreateElement
    document.head.appendChild = originalAppendChild
    document.head.removeChild = originalRemoveChild
    document.head.contains = originalContains
  })

  it.skip('preloads image resource', () => {
    renderHook(() => usePreloadResource('image.jpg', 'image'))

    expect(document.createElement).toHaveBeenCalledWith('link')
    expect(mockLink.rel).toBe('preload')
    expect(mockLink.href).toBe('image.jpg')
    expect(mockLink.as).toBe('image')
    expect(document.head.appendChild).toHaveBeenCalledWith(mockLink)
  })

  it.skip('cleans up on unmount', () => {
    const { unmount } = renderHook(() => usePreloadResource('script.js', 'script'))

    unmount()

    expect(document.head.removeChild).toHaveBeenCalledWith(mockLink)
  })
})

describe('useDynamicImport', () => {
  it('loads module dynamically', async () => {
    const mockModule = { default: 'test-module' }
    const importFn = jest.fn().mockResolvedValue(mockModule)

    const { result } = renderHook(() => useDynamicImport(importFn))

    expect(result.current.module).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()

    await act(async () => {
      await result.current.loadModule()
    })

    expect(result.current.module).toBe(mockModule)
    expect(result.current.loading).toBe(false)
    expect(importFn).toHaveBeenCalledTimes(1)
  })

  it('handles import errors', async () => {
    const error = new Error('Import failed')
    const importFn = jest.fn().mockRejectedValue(error)

    const { result } = renderHook(() => useDynamicImport(importFn))

    await act(async () => {
      try {
        await result.current.loadModule()
      } catch (e) {
        // Expected to throw
      }
    })

    expect(result.current.error).toBe(error)
    expect(result.current.loading).toBe(false)
  })

  it('returns cached module on subsequent calls', async () => {
    const mockModule = { default: 'test-module' }
    const importFn = jest.fn().mockResolvedValue(mockModule)

    const { result } = renderHook(() => useDynamicImport(importFn))

    await act(async () => {
      await result.current.loadModule()
    })

    await act(async () => {
      await result.current.loadModule()
    })

    expect(importFn).toHaveBeenCalledTimes(1) // Should be cached
  })
})