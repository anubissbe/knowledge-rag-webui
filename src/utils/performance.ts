// Performance monitoring utilities
import React from 'react'

export interface PerformanceMetrics {
  name: string
  duration: number
  timestamp: number
  type: 'render' | 'api' | 'navigation' | 'user-interaction'
  metadata?: Record<string, any>
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private observers: PerformanceObserver[] = []
  private marks = new Map<string, number>()

  constructor() {
    this.initializeObservers()
  }

  private initializeObservers() {
    // Long tasks observer
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            console.warn(`Long task detected: ${entry.duration}ms`, entry)
            this.recordMetric({
              name: 'long-task',
              duration: entry.duration,
              timestamp: entry.startTime,
              type: 'render',
              metadata: { entry }
            })
          }
        })
        longTaskObserver.observe({ entryTypes: ['longtask'] })
        this.observers.push(longTaskObserver)
      } catch (e) {
        // Ignore if not supported
      }

      // Navigation timing observer
      try {
        const navigationObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric({
              name: 'navigation',
              duration: entry.duration,
              timestamp: entry.startTime,
              type: 'navigation',
              metadata: { entry }
            })
          }
        })
        navigationObserver.observe({ entryTypes: ['navigation'] })
        this.observers.push(navigationObserver)
      } catch (e) {
        // Ignore if not supported
      }

      // Largest contentful paint observer
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric({
              name: 'largest-contentful-paint',
              duration: entry.startTime,
              timestamp: Date.now(),
              type: 'render',
              metadata: { entry }
            })
          }
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        this.observers.push(lcpObserver)
      } catch (e) {
        // Ignore if not supported
      }
    }
  }

  mark(name: string) {
    const timestamp = performance.now()
    this.marks.set(name, timestamp)
    performance.mark(name)
  }

  measure(name: string, startMark?: string, endMark?: string) {
    const start = startMark ? this.marks.get(startMark) : undefined
    const end = endMark ? this.marks.get(endMark) : performance.now()
    
    if (start !== undefined && end !== undefined) {
      const duration = end - start
      performance.measure(name, startMark, endMark)
      
      this.recordMetric({
        name,
        duration,
        timestamp: Date.now(),
        type: 'user-interaction'
      })
      
      return duration
    }
    
    return 0
  }

  recordMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric)
    
    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100)
    }
  }

  getMetrics(type?: PerformanceMetrics['type']): PerformanceMetrics[] {
    return type ? this.metrics.filter(m => m.type === type) : this.metrics
  }

  getAverageMetric(name: string): number {
    const filtered = this.metrics.filter(m => m.name === name)
    if (filtered.length === 0) return 0
    return filtered.reduce((sum, m) => sum + m.duration, 0) / filtered.length
  }

  clear() {
    this.metrics = []
    this.marks.clear()
    performance.clearMarks()
    performance.clearMeasures()
  }

  destroy() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    this.clear()
  }

  // Report to analytics service
  report() {
    const report = {
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      metrics: this.metrics,
      webVitals: this.getWebVitals()
    }
    
    // Send to analytics service
    console.log('Performance Report:', report)
    return report
  }

  private getWebVitals() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const paint = performance.getEntriesByType('paint')
    
    return {
      // Core Web Vitals
      fcp: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      lcp: this.getAverageMetric('largest-contentful-paint'),
      cls: 0, // Would need layout shift observer
      fid: 0, // Would need first input delay observer
      
      // Navigation timing
      ttfb: navigation?.responseStart - navigation?.requestStart || 0,
      domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.navigationStart || 0,
      loadComplete: navigation?.loadEventEnd - navigation?.navigationStart || 0
    }
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

// React performance utilities
export function withPerformanceTracking<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  componentName: string
) {
  return function PerformanceTrackedComponent(props: T) {
    React.useEffect(() => {
      performanceMonitor.mark(`${componentName}-mount-start`)
      
      return () => {
        performanceMonitor.mark(`${componentName}-unmount`)
        performanceMonitor.measure(
          `${componentName}-lifecycle`,
          `${componentName}-mount-start`,
          `${componentName}-unmount`
        )
      }
    }, [])

    React.useEffect(() => {
      performanceMonitor.mark(`${componentName}-render`)
    })

    return React.createElement(Component, props)
  }
}

// Hook for measuring async operations
export function useAsyncPerformance(operationName: string) {
  const startOperation = React.useCallback(() => {
    performanceMonitor.mark(`${operationName}-start`)
  }, [operationName])

  const endOperation = React.useCallback(() => {
    performanceMonitor.mark(`${operationName}-end`)
    return performanceMonitor.measure(
      operationName,
      `${operationName}-start`,
      `${operationName}-end`
    )
  }, [operationName])

  return { startOperation, endOperation }
}

// Memory usage tracking
export function trackMemoryUsage() {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
    }
  }
  return null
}

// Bundle size tracking
export function getBundleInfo() {
  const scripts = Array.from(document.querySelectorAll('script[src]'))
  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
  
  return {
    scripts: scripts.map(script => ({
      src: (script as HTMLScriptElement).src,
      async: (script as HTMLScriptElement).async,
      defer: (script as HTMLScriptElement).defer
    })),
    styles: styles.map(style => ({
      href: (style as HTMLLinkElement).href
    }))
  }
}

// Performance budget checker
export function checkPerformanceBudget() {
  const budgets = {
    fcp: 1800, // First Contentful Paint
    lcp: 2500, // Largest Contentful Paint
    fid: 100,  // First Input Delay
    cls: 0.1,  // Cumulative Layout Shift
    ttfb: 600  // Time to First Byte
  }

  const vitals = performanceMonitor['getWebVitals']()
  const violations = []

  Object.entries(budgets).forEach(([metric, budget]) => {
    const value = vitals[metric as keyof typeof vitals]
    if (value > budget) {
      violations.push({
        metric,
        value,
        budget,
        severity: value > budget * 1.5 ? 'high' : 'medium'
      })
    }
  })

  return {
    passed: violations.length === 0,
    violations,
    score: Math.max(0, 100 - violations.length * 10)
  }
}