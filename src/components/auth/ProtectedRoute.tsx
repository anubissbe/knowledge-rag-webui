import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '../../stores'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  redirectTo = '/auth/login',
}) => {
  const { isAuthenticated, verifyToken, initialize } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Initialize auth store (check for stored token)
        await initialize()
        
        // If we have a token, verify it's still valid
        const token = localStorage.getItem('auth-token')
        if (token) {
          await verifyToken()
        }
      } catch (error) {
        console.error('Auth verification failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [initialize, verifyToken])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Verifying authentication...
          </p>
        </div>
      </div>
    )
  }

  // If route requires authentication but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Temporarily disable auth check for development
    if (import.meta.env.DEV) {
      console.warn('Auth check bypassed in development mode')
      return <>{children}</>
    }
    
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }}
        replace 
      />
    )
  }

  // If route is for unauthenticated users but user is authenticated
  if (!requireAuth && isAuthenticated) {
    const returnTo = location.state?.from || '/'
    return <Navigate to={returnTo} replace />
  }

  // User is authenticated or route doesn't require auth
  return <>{children}</>
}

// Higher-order component for easier usage
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  options?: { requireAuth?: boolean; redirectTo?: string }
) => {
  const WrappedComponent = (props: P) => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  )
  
  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name})`
  return WrappedComponent
}