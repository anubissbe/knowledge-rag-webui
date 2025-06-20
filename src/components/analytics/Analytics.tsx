import { useEffect } from 'react'

export function Analytics() {
  useEffect(() => {
    // Simple page view tracking
    if (import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
      const trackPageView = () => {
        // In production, this would send to your analytics service
        console.log('Page view:', {
          path: window.location.pathname,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        })
      }

      trackPageView()
      
      // Track route changes
      window.addEventListener('popstate', trackPageView)
      
      return () => {
        window.removeEventListener('popstate', trackPageView)
      }
    }
  }, [])

  return null
}

// Usage analytics hook
export function useAnalytics() {
  const track = (event: string, properties?: Record<string, any>) => {
    if (import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
      console.log('Analytics event:', {
        event,
        properties,
        timestamp: new Date().toISOString()
      })
    }
  }

  return { track }
}