// Performance monitoring utilities

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number[]> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Measure component render time
  measureRender(componentName: string, callback: () => void): void {
    const start = performance.now()
    callback()
    const end = performance.now()
    this.recordMetric(`render_${componentName}`, end - start)
  }

  // Measure API call duration
  async measureAsync<T>(
    name: string,
    asyncFn: () => Promise<T>
  ): Promise<T> {
    const start = performance.now()
    try {
      const result = await asyncFn()
      const end = performance.now()
      this.recordMetric(name, end - start)
      return result
    } catch (error) {
      const end = performance.now()
      this.recordMetric(`${name}_error`, end - start)
      throw error
    }
  }

  // Record a metric
  private recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    this.metrics.get(name)!.push(value)

    // Keep only last 100 measurements
    const metrics = this.metrics.get(name)!
    if (metrics.length > 100) {
      metrics.shift()
    }
  }

  // Get metrics summary
  getMetrics(name: string): {
    avg: number
    min: number
    max: number
    count: number
  } | null {
    const metrics = this.metrics.get(name)
    if (!metrics || metrics.length === 0) return null

    return {
      avg: metrics.reduce((a, b) => a + b, 0) / metrics.length,
      min: Math.min(...metrics),
      max: Math.max(...metrics),
      count: metrics.length
    }
  }

  // Get all metrics
  getAllMetrics(): Record<string, any> {
    const result: Record<string, any> = {}
    this.metrics.forEach((_, name) => {
      result[name] = this.getMetrics(name)
    })
    return result
  }

  // Clear metrics
  clearMetrics(): void {
    this.metrics.clear()
  }
}

// Web Vitals monitoring
export function initWebVitals(): void {
  if ('PerformanceObserver' in window) {
    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log('LCP:', entry.startTime)
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true })

    // First Input Delay
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fid = (entry as any).processingStart - entry.startTime
        console.log('FID:', fid)
      }
    }).observe({ type: 'first-input', buffered: true })

    // Cumulative Layout Shift
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log('CLS:', (entry as any).value)
      }
    }).observe({ type: 'layout-shift', buffered: true })
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance()