# External Logging Service Integration

## Overview

This document describes the implementation of external logging service integration for the Knowledge RAG WebUI application, with primary support for Sentry error tracking and performance monitoring.

## Supported Services

### 1. Sentry (Implemented)
- **Purpose**: Error tracking, performance monitoring, and session replay
- **Features**:
  - Automatic error capture and reporting
  - Performance transaction tracking
  - Session replay on errors
  - User context tracking
  - Release tracking
  - Breadcrumb trail for debugging

### 2. LogRocket (Planned)
- **Purpose**: Session recording and user behavior analytics
- **Configuration**: `VITE_LOGROCKET_APP_ID`

### 3. DataDog (Planned)
- **Purpose**: Real User Monitoring (RUM) and APM
- **Configuration**: `VITE_DATADOG_CLIENT_TOKEN`, `VITE_DATADOG_APPLICATION_ID`

## Implementation Details

### Logger Integration

The centralized logger (`src/utils/logger.ts`) automatically sends errors to external services:

```typescript
// Errors are automatically sent to Sentry
logger.error('Payment processing failed', new Error('Invalid card'));

// Warnings are added as breadcrumbs for context
logger.warn('API rate limit approaching', { remaining: 10 });

// All log levels work seamlessly
logger.info('User completed checkout', { orderId: '12345' });
```

### Error Boundary Integration

React Error Boundaries are integrated with Sentry to catch and report component errors:

```typescript
// Errors caught by ErrorBoundary are automatically sent to Sentry
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### Manual Error Reporting

For specific error scenarios, you can use the Sentry service directly:

```typescript
import { logError, logMessage, addBreadcrumb } from './services/sentry';

// Log an error with context
logError(new Error('Custom error'), {
  userId: user.id,
  action: 'checkout',
  metadata: { cart: items }
});

// Log a message
logMessage('Unusual user behavior detected', 'warning');

// Add breadcrumb for debugging context
addBreadcrumb({
  message: 'User clicked checkout',
  category: 'user-action',
  data: { itemCount: 5 }
});
```

## Configuration

### Environment Variables

Add the following to your `.env` file:

```bash
# Sentry Configuration
VITE_SENTRY_DSN=https://your-key@sentry.io/your-project-id
VITE_SENTRY_ENVIRONMENT=development
VITE_SENTRY_ENABLED=true
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1

# App Version (for release tracking)
VITE_APP_VERSION=1.0.0
```

### Sentry Setup

1. **Create a Sentry Account**
   - Sign up at [sentry.io](https://sentry.io)
   - Create a new project (React)
   - Copy your DSN from project settings

2. **Configure Environment**
   ```bash
   # Development
   VITE_SENTRY_ENVIRONMENT=development
   VITE_SENTRY_ENABLED=false  # Usually disabled in dev
   
   # Production
   VITE_SENTRY_ENVIRONMENT=production
   VITE_SENTRY_ENABLED=true
   VITE_SENTRY_TRACES_SAMPLE_RATE=0.1  # 10% sampling
   ```

3. **Test Integration**
   ```typescript
   // Add this temporary code to test
   throw new Error('Test Sentry Integration');
   ```

## Features

### 1. Automatic Error Tracking
- All unhandled errors are automatically captured
- Stack traces with source maps
- Browser and OS information
- User context (when available)

### 2. Performance Monitoring
- Page load performance
- API request timing
- Component render performance
- Custom transactions

### 3. Session Replay
- 10% of sessions are recorded
- 100% of sessions with errors are recorded
- Helps debug user issues visually

### 4. Error Filtering
- Development errors filtered (e.g., "Failed to fetch")
- Noisy breadcrumbs removed
- Custom error filtering logic

### 5. User Context
- Errors linked to specific users
- User ID, email, and username tracking
- Helps identify affected users

## Usage Patterns

### Component Errors
```typescript
// Automatically captured by Error Boundary
function MyComponent() {
  if (someCondition) {
    throw new Error('Component error');
  }
  return <div>Content</div>;
}
```

### API Errors
```typescript
try {
  const data = await api.fetchData();
} catch (error) {
  // Automatically logged to Sentry via logger
  logger.error('API request failed', error);
}
```

### Performance Tracking
```typescript
import { startTransaction } from './services/sentry';

const transaction = startTransaction('checkout-flow');
// ... perform operations
transaction.finish();
```

### Custom Context
```typescript
import { setSentryUser } from './services/sentry';

// On login
setSentryUser({
  id: user.id,
  email: user.email,
  username: user.username
});

// On logout
setSentryUser(null);
```

## Best Practices

### 1. Error Messages
- Use descriptive error messages
- Include relevant context
- Avoid exposing sensitive data

### 2. Breadcrumbs
- Add breadcrumbs for important user actions
- Include relevant data for debugging
- Keep breadcrumb data minimal

### 3. Performance
- Use sampling in production (10% recommended)
- Monitor quota usage
- Filter unnecessary errors

### 4. Privacy
- Never log passwords or tokens
- Sanitize user input
- Follow GDPR guidelines

### 5. Development
- Disable Sentry in local development
- Use console logging for debugging
- Test error scenarios before deployment

## Monitoring Dashboard

### Sentry Dashboard Features
1. **Issues**: List of unique errors with occurrence count
2. **Performance**: Transaction timing and bottlenecks
3. **Releases**: Track errors by version
4. **User Feedback**: Collect user reports
5. **Alerts**: Set up notifications for critical errors

### Key Metrics to Monitor
- Error rate trends
- Performance regressions
- Most affected users
- Error patterns by browser/OS
- API endpoint performance

## Troubleshooting

### Common Issues

1. **Sentry not capturing errors**
   - Check if `VITE_SENTRY_ENABLED=true`
   - Verify DSN is correct
   - Check browser console for Sentry errors

2. **Performance impact**
   - Reduce `tracesSampleRate` if needed
   - Disable session replay in high-traffic apps
   - Use error sampling for high-volume errors

3. **Missing source maps**
   - Ensure source maps are uploaded to Sentry
   - Check release version matches
   - Verify build process includes source maps

## Security Considerations

1. **DSN Exposure**: The Sentry DSN is client-side and safe to expose
2. **Data Sanitization**: Sensitive data is filtered before sending
3. **User Privacy**: PII is only sent with user consent
4. **Rate Limiting**: Sentry has built-in rate limiting

## Future Enhancements

### LogRocket Integration
```typescript
// Future implementation
if (import.meta.env.VITE_LOGROCKET_APP_ID) {
  LogRocket.init(import.meta.env.VITE_LOGROCKET_APP_ID);
  LogRocket.identify(user.id, { email: user.email });
}
```

### DataDog RUM Integration
```typescript
// Future implementation
if (import.meta.env.VITE_DATADOG_CLIENT_TOKEN) {
  datadogRum.init({
    applicationId: import.meta.env.VITE_DATADOG_APPLICATION_ID,
    clientToken: import.meta.env.VITE_DATADOG_CLIENT_TOKEN,
    site: 'datadoghq.com',
    service: 'knowledge-rag-webui'
  });
}
```

## Conclusion

The external logging integration provides comprehensive error tracking and performance monitoring for the Knowledge RAG WebUI application. With Sentry as the primary service, developers can quickly identify and fix issues, monitor application health, and improve user experience through data-driven insights.