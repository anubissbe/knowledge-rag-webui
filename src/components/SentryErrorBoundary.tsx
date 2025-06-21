import * as Sentry from '@sentry/react';
import { ErrorBoundary } from './ErrorBoundary';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  showDialog?: boolean;
}

/**
 * Sentry-integrated error boundary that combines Sentry's error tracking
 * with our custom error UI
 */
export function SentryErrorBoundary({ children, fallback, showDialog = false }: Props) {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <ErrorBoundaryFallback
          error={error as Error}
          resetError={resetError}
          fallback={fallback}
        />
      )}
      showDialog={showDialog}
      onError={(error, errorInfo) => {
        // Additional error handling if needed
        console.error('Sentry captured error:', error, errorInfo);
      }}
    >
      <ErrorBoundary fallback={fallback}>
        {children}
      </ErrorBoundary>
    </Sentry.ErrorBoundary>
  );
}

function ErrorBoundaryFallback({ 
  error, 
  resetError, 
  fallback 
}: { 
  error: Error; 
  resetError: () => void;
  fallback?: ReactNode;
}) {
  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h1 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-2">
            Oops! Something went wrong
          </h1>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
            We're sorry, but something unexpected happened. The error has been reported and we'll look into it.
          </p>

          {import.meta.env.DEV && error && (
            <details className="mb-6">
              <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                Error Details (Development Only)
              </summary>
              <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono overflow-auto">
                <p className="text-red-600 dark:text-red-400 mb-2">{error.message}</p>
                <pre className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {error.stack}
                </pre>
              </div>
            </details>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={resetError}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 
                       text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 
                       hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 
                       focus:ring-blue-500 transition-colors"
            >
              Try Again
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent 
                       text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reload Page
            </button>
          </div>

          <button
            onClick={() => window.location.href = '/'}
            className="w-full mt-3 inline-flex items-center justify-center px-4 py-2 text-sm 
                     text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go to Homepage
          </button>
        </div>
      </div>
    </div>
  );
}