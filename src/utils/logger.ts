/**
 * Centralized logging utility for the Knowledge RAG WebUI
 * Provides structured logging with different levels and environment-aware output
 */

export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
} as const;

export type LogLevel = typeof LogLevel[keyof typeof LogLevel];

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: unknown;
  error?: Error;
}

class Logger {
  private minLevel: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.minLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel;
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp;
    const levelName = Object.keys(LogLevel)[Object.values(LogLevel).indexOf(entry.level)];
    const context = entry.context ? `[${entry.context}]` : '';
    
    return `${timestamp} ${levelName}${context}: ${entry.message}`;
  }

  private log(level: LogLevel, message: string, context?: string, data?: unknown, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data,
      error,
    };

    const formattedMessage = this.formatMessage(entry);

    // In development, use console methods for better debugging
    if (this.isDevelopment) {
      switch (level) {
        case LogLevel.DEBUG:
          // eslint-disable-next-line no-console
          console.debug(formattedMessage, data);
          break;
        case LogLevel.INFO:
          // eslint-disable-next-line no-console
          console.info(formattedMessage, data);
          break;
        case LogLevel.WARN:
          // eslint-disable-next-line no-console
          console.warn(formattedMessage, data);
          break;
        case LogLevel.ERROR:
          // eslint-disable-next-line no-console
          console.error(formattedMessage, error || data);
          break;
      }
    } else {
      // In production, could send to external logging service
      // For now, only log errors and warnings to console
      if (level >= LogLevel.WARN) {
        // eslint-disable-next-line no-console
        console.error(formattedMessage, error || data);
      }
    }

    // In production, you could send logs to external services like:
    // - Sentry for error tracking
    // - LogRocket for session replay
    // - DataDog for observability
    // - Custom analytics endpoint
    if (!this.isDevelopment && level >= LogLevel.ERROR) {
      this.sendToExternalService(entry);
    }
  }

  private sendToExternalService(entry: LogEntry): void {
    // Send errors to external logging services
    try {
      // Check if Sentry is available and initialized
      if (typeof window !== 'undefined' && (window as any).Sentry) {
        const Sentry = (window as any).Sentry;
        
        if (entry.level >= LogLevel.ERROR) {
          // Send errors to Sentry
          if (entry.data instanceof Error) {
            Sentry.captureException(entry.data, {
              level: entry.level === LogLevel.ERROR ? 'error' : 'fatal',
              tags: {
                category: entry.context || 'general',
              },
              extra: {
                message: entry.message,
                timestamp: entry.timestamp,
              },
            });
          } else {
            // Send error message if no Error object
            Sentry.captureMessage(entry.message, {
              level: entry.level === LogLevel.ERROR ? 'error' : 'fatal',
              tags: {
                category: entry.context || 'general',
              },
              extra: entry.data,
            });
          }
        } else if (entry.level === LogLevel.WARN) {
          // Send warnings as breadcrumbs for context
          Sentry.addBreadcrumb({
            message: entry.message,
            category: entry.context || 'general',
            level: 'warning',
            data: entry.data,
            timestamp: new Date(entry.timestamp).getTime() / 1000,
          });
        }
      }
      
      // You can add other logging services here
      // Example: LogRocket, DataDog, etc.
    } catch (error) {
      // Silently fail to avoid infinite loops
      if (this.isDevelopment) {
        console.error('Failed to send log to external service:', error);
      }
    }
  }

  /**
   * Log debug information - only shown in development
   */
  debug(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, context, data);
  }

  /**
   * Log general information
   */
  info(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, context, data);
  }

  /**
   * Log warnings that don't break functionality
   */
  warn(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, context, data);
  }

  /**
   * Log errors that break functionality
   */
  error(message: string, context?: string, error?: Error | unknown): void {
    const errorObj = error instanceof Error ? error : undefined;
    const data = error instanceof Error ? undefined : error;
    this.log(LogLevel.ERROR, message, context, data, errorObj);
  }

  /**
   * Create a context-specific logger
   */
  createContextLogger(context: string) {
    return {
      debug: (message: string, data?: unknown) => this.debug(message, context, data),
      info: (message: string, data?: unknown) => this.info(message, context, data),
      warn: (message: string, data?: unknown) => this.warn(message, context, data),
      error: (message: string, error?: Error | unknown) => this.error(message, context, error),
    };
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience methods
export const createLogger = (context: string) => logger.createContextLogger(context);

// Export for specific common contexts
export const wsLogger = createLogger('WebSocket');
export const apiLogger = createLogger('API');
export const pwLogger = createLogger('PWA');
export const hookLogger = createLogger('Hook');
export const componentLogger = createLogger('Component');