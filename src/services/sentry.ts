import * as Sentry from '@sentry/react';

export interface SentryConfig {
  dsn?: string;
  environment?: string;
  enabled?: boolean;
  tracesSampleRate?: number;
  debug?: boolean;
}

/**
 * Initialize Sentry error tracking and performance monitoring
 */
export function initializeSentry(config: SentryConfig = {}) {
  const {
    dsn = import.meta.env.VITE_SENTRY_DSN,
    environment = import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE,
    enabled = import.meta.env.VITE_SENTRY_ENABLED === 'true',
    tracesSampleRate = parseFloat(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || '0.1'),
    debug = import.meta.env.DEV,
  } = config;

  // Only initialize in production or if explicitly enabled
  if (!enabled || !dsn) {
    if (import.meta.env.DEV) {
      console.log('Sentry is disabled. Set VITE_SENTRY_ENABLED=true and provide VITE_SENTRY_DSN to enable.');
    }
    return;
  }

  Sentry.init({
    dsn,
    environment,
    debug,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate,
    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% of sessions will be recorded
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors will be recorded
    
    // Release tracking
    release: import.meta.env.VITE_APP_VERSION || '0.0.0',
    
    // User context
    beforeSend(event, hint) {
      // Filter out specific errors if needed
      if (event.exception) {
        const error = hint.originalException;
        
        // Don't send network errors in development
        if (import.meta.env.DEV && error instanceof TypeError && error.message.includes('Failed to fetch')) {
          return null;
        }
        
        // Add user context if available
        const user = getUserContext();
        if (user) {
          event.user = {
            id: user.id,
            email: user.email,
            username: user.username,
          };
        }
      }
      
      return event;
    },
    
    // Breadcrumb filtering
    beforeBreadcrumb(breadcrumb) {
      // Filter out noisy breadcrumbs
      if (breadcrumb.category === 'console' && breadcrumb.level === 'debug') {
        return null;
      }
      
      return breadcrumb;
    },
  });
}

/**
 * Set user context for error tracking
 */
export function setSentryUser(user: { id: string; email?: string; username?: string } | null) {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Log a custom error to Sentry
 */
export function logError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Log a message to Sentry
 */
export function logMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>) {
  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

/**
 * Add breadcrumb for better error context
 */
export function addBreadcrumb(breadcrumb: {
  message: string;
  category?: string;
  level?: Sentry.SeverityLevel;
  data?: Record<string, any>;
}) {
  Sentry.addBreadcrumb({
    message: breadcrumb.message,
    category: breadcrumb.category || 'custom',
    level: breadcrumb.level || 'info',
    data: breadcrumb.data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Create a span for performance monitoring
 */
export function startSpan(name: string, op: string = 'navigation') {
  // In Sentry v8+, use startSpan
  return Sentry.startSpan({ name, op }, (span) => {
    return span;
  });
}

/**
 * Helper to get current user context (implement based on your auth system)
 */
function getUserContext(): { id: string; email?: string; username?: string } | null {
  // This should be implemented based on your authentication system
  // For now, returning null
  // Example implementation:
  // const user = localStorage.getItem('user');
  // return user ? JSON.parse(user) : null;
  return null;
}

