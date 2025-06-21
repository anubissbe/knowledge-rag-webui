# Logging Implementation

## Overview

This document describes the centralized logging system implemented in the Knowledge RAG WebUI to replace all `console.log` statements with structured, environment-aware logging.

## Motivation

The previous codebase contained 17 `console.log` statements throughout various components, hooks, and services. These were replaced with a centralized logging utility that provides:

- **Structured Logging**: Consistent format with timestamps, log levels, and context
- **Environment Awareness**: Different behavior in development vs production
- **External Service Integration**: Ready for integration with monitoring services
- **Performance**: Minimal overhead with level-based filtering
- **Developer Experience**: Better debugging with context-specific loggers

## Logger Implementation

### Core Logger Class

**File**: `src/utils/logger.ts`

```typescript
// Log levels with numeric values for filtering
export const LogLevel = {
  DEBUG: 0,  // Development-only verbose information
  INFO: 1,   // General application flow
  WARN: 2,   // Important but non-breaking issues
  ERROR: 3,  // Errors that break functionality
} as const;

// Main Logger class with environment-aware behavior
class Logger {
  private minLevel: LogLevel;
  private isDevelopment: boolean;
  
  // Methods: debug(), info(), warn(), error()
  // Context-specific loggers via createContextLogger()
}
```

### Environment Behavior

| Environment | DEBUG | INFO | WARN | ERROR | External Service |
|-------------|-------|------|------|-------|------------------|
| Development | ✅ Console | ✅ Console | ✅ Console | ✅ Console | ❌ |
| Production | ❌ | ❌ | ✅ Console | ✅ Console | ✅ |

### Context-Specific Loggers

Pre-configured loggers for common contexts:

```typescript
import { wsLogger, apiLogger, pwLogger, hookLogger, componentLogger } from '../utils/logger';

// Usage examples:
wsLogger.info('WebSocket connected');
apiLogger.error('API request failed', error);
pwLogger.debug('Service Worker registered');
hookLogger.warn('Hook dependency changed');
componentLogger.info('User preferences saved', data);
```

## Migration Summary

### Before → After

| Location | Before | After |
|----------|--------|-------|
| WebSocket Service | `console.log('WebSocket connected')` | `wsLogger.info('WebSocket connected')` |
| PWA Install | `console.log('SW Registered:', r)` | `pwLogger.info('Service Worker registered successfully', r)` |
| Settings | `console.log('Saving preferences:', data)` | `componentLogger.info('Saving user preferences', data)` |
| Hooks | `console.log('Connection restored')` | `hookLogger.info('Internet connection restored')` |
| Mock Services | `console.log('Mock WebSocket server started')` | `logger.debug('Mock WebSocket server started', 'MockWS')` |

### Files Modified

1. **src/services/websocket.ts**
   - WebSocket connection/disconnection events
   - Added `wsLogger` for WebSocket-specific logging

2. **src/components/PWAInstallPrompt.tsx**
   - Service Worker registration events
   - User install prompt interactions
   - Added `pwLogger` for PWA-related logging

3. **src/hooks/useOfflineDetection.ts**
   - Network connectivity state changes
   - Added `hookLogger` for hook-specific logging

4. **src/hooks/useKeyboardShortcuts.ts**
   - Keyboard shortcut triggers (debug level)
   - Added `hookLogger` for hook-specific logging

5. **src/components/settings/NotificationSettings.tsx**
   - User notification preference changes
   - Added `componentLogger` for component logging

6. **src/components/settings/PrivacySettings.tsx**
   - Account deletion attempts (warning level)
   - Added `componentLogger` for component logging

7. **src/components/settings/PreferencesSettings.tsx**
   - User preference updates
   - Added `componentLogger` for component logging

8. **src/services/mockWebSocketServer.ts**
   - Mock service lifecycle events
   - Added general `logger` with context

## Log Format

### Development Format
```
2024-12-21T10:30:45.123Z INFO[WebSocket]: WebSocket connected
2024-12-21T10:30:46.456Z ERROR[API]: Request failed { status: 500, url: '/api/memories' }
```

### Production Format
- Only WARN and ERROR levels to console
- Structured format ready for external services
- Automatic error tracking integration points

## Integration Points

### External Service Integration

The logger includes placeholder integration for:

```typescript
// Sentry for error tracking
Sentry.captureException(entry.error || new Error(entry.message));

// Google Analytics events
window.gtag?.('event', 'exception', { description: entry.message });

// DataDog logs
DD_LOGS.logger.error(entry.message, entry.data);
```

### Custom Context Loggers

```typescript
// Create component-specific logger
const myComponentLogger = createLogger('MyComponent');

// Use with automatic context
myComponentLogger.info('Component mounted');
// Output: 2024-12-21T10:30:45.123Z INFO[MyComponent]: Component mounted
```

## Performance Considerations

### Level-Based Filtering
```typescript
// Early return if log level doesn't meet threshold
private shouldLog(level: LogLevel): boolean {
  return level >= this.minLevel;
}
```

### Production Optimizations
- DEBUG and INFO logs completely disabled in production
- Only ERROR logs sent to external services
- Minimal runtime overhead with early filtering

### Memory Management
- No log storage in memory
- Immediate output to console or external service
- Automatic cleanup of temporary data

## Usage Guidelines

### When to Use Each Level

**DEBUG** (Development only):
```typescript
logger.debug('Parsing configuration', { config });
logger.debug('Cache hit', { key, value });
```

**INFO** (General flow):
```typescript
logger.info('User logged in', { userId });
logger.info('Data sync completed', { recordCount });
```

**WARN** (Important but non-breaking):
```typescript
logger.warn('Deprecated API used', { endpoint });
logger.warn('Fallback triggered', { reason });
```

**ERROR** (Breaking functionality):
```typescript
logger.error('API request failed', error);
logger.error('Database connection lost', { connectionString });
```

### Context Best Practices

1. **Use Pre-defined Loggers**: Prefer `wsLogger`, `apiLogger`, etc.
2. **Consistent Context Names**: Use PascalCase for component contexts
3. **Include Relevant Data**: Add context data for debugging
4. **Avoid Sensitive Data**: Never log passwords, tokens, or PII

## Testing

### Test Exclusions

Test files retain `console.log` for debugging:
- `tests/e2e/error-boundary.spec.ts`
- Build scripts: `scripts/generate-pwa-icons.js`

These are appropriate as they're not part of the production application.

### Validation

```bash
# Check for remaining console.log in source files
rg -n "console\.log" --type ts --type js --glob "*.tsx" --glob "*.jsx" src/

# Should return no results after migration
```

## Future Enhancements

### Planned Features

1. **Log Aggregation**: Send logs to external services (Sentry, DataDog)
2. **Performance Metrics**: Track component render times and API latency
3. **User Behavior**: Log user interactions (with privacy compliance)
4. **Error Boundaries**: Automatic error logging with stack traces
5. **Configuration**: Runtime log level configuration

### External Service Setup

```typescript
// Example Sentry integration
import * as Sentry from '@sentry/browser';

// In sendToExternalService method:
if (level >= LogLevel.ERROR) {
  Sentry.captureException(entry.error || new Error(entry.message), {
    contexts: {
      logger: {
        level: Object.keys(LogLevel)[Object.values(LogLevel).indexOf(level)],
        context: entry.context,
        timestamp: entry.timestamp,
      },
    },
    extra: entry.data,
  });
}
```

## Migration Impact

### Bundle Size
- **Added**: ~2KB for logger utility
- **Removed**: Inline console.log statements
- **Net Impact**: Minimal increase with better functionality

### Runtime Performance
- **Development**: Slightly more overhead for formatting
- **Production**: Better performance with level filtering
- **Memory**: No impact, immediate output

### Developer Experience
- **Better Debugging**: Structured logs with context
- **Consistency**: Unified logging approach
- **Maintainability**: Centralized configuration

## Related Documentation

- [Error Boundaries](./ERROR_BOUNDARIES.md) - Error handling and logging
- [API Integration](./API_INTEGRATION.md) - API error logging
- [WebSocket Memory Management](./WEBSOCKET_MEMORY_LEAK_FIXES.md) - Connection logging
- [Toast Notifications](./TOAST_NOTIFICATIONS.md) - User-facing error messaging