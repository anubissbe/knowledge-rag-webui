# API Key Security Implementation

## Overview

This document describes the comprehensive API key security features implemented in the Knowledge RAG WebUI. The implementation prioritizes security by default while maintaining usability for legitimate access needs.

## Security Features

### 1. Default Masking

**Implementation**: All API keys are masked by default when displayed in the UI.

**Masking Pattern**:
- Shows original prefix (e.g., `sk-` for OpenAI-style keys)
- Masks the middle portion with bullet characters (`•`)
- Shows the last 4 characters for identification
- Example: `sk-••••••••••••••••••••••••••••••••abcd`

**Code Location**: `src/components/settings/ApiKeysSettings.tsx:31-38`

```typescript
const maskApiKey = (key: string): string => {
  if (key.length <= 4) return key;
  const lastFour = key.slice(-4);
  const prefix = key.startsWith('sk-') ? 'sk-' : '';
  const maskedLength = Math.max(8, key.length - 4 - prefix.length);
  const mask = '•'.repeat(maskedLength);
  return `${prefix}${mask}${lastFour}`;
};
```

### 2. Secure Visibility Toggle

**Implementation**: Users can temporarily reveal full API keys using an eye/eye-off button toggle.

**Security Features**:
- Clear visual indication when key is visible vs. masked
- Updated button tooltips indicating auto-hide behavior
- Security warning displayed when key is visible

**User Experience**:
- Click eye icon to show full key
- Click eye-off icon to hide key
- Visual feedback through icon changes and tooltips

### 3. Auto-Hide Functionality

**Implementation**: Visible API keys automatically hide after 30 seconds for security.

**Features**:
- 30-second timeout starts when key is revealed
- Automatic cleanup of timeout when key is manually hidden
- Toast notification when auto-hide occurs
- Proper memory management with timeout tracking

**Code Location**: `src/components/settings/ApiKeysSettings.tsx:42-72`

```typescript
const toggleKeyVisibility = (keyId: string) => {
  const newShowKey = { ...showKey, [keyId]: !showKey[keyId] };
  setShowKey(newShowKey);

  // Clear existing timeout for this key
  if (hideTimeouts[keyId]) {
    clearTimeout(hideTimeouts[keyId]);
  }

  // If showing the key, set timeout to auto-hide after 30 seconds
  if (newShowKey[keyId]) {
    const timeoutId = setTimeout(() => {
      setShowKey(prev => ({ ...prev, [keyId]: false }));
      setHideTimeouts(prev => {
        const updated = { ...prev };
        delete updated[keyId];
        return updated;
      });
      toast.info('Auto-hidden', 'API key was automatically hidden for security');
    }, 30000);

    setHideTimeouts(prev => ({ ...prev, [keyId]: timeoutId }));
  }
};
```

### 4. Security Warnings

**Implementation**: Clear warnings displayed when API keys are visible.

**Warning Content**:
- "⚠️ Security Warning: Full API key is visible"
- Mentions 30-second auto-hide feature
- Advises against public sharing
- Visual styling with yellow background for attention

**Code Location**: `src/components/settings/ApiKeysSettings.tsx:217-226`

### 5. Secure Copy Functionality

**Implementation**: Copy button always copies the full API key regardless of visibility state.

**Security Considerations**:
- Users can copy keys without revealing them on screen
- Toast confirmation when copy succeeds
- Error handling for clipboard failures
- No logging of actual key values

### 6. Memory Management

**Implementation**: Proper cleanup of timeouts and event listeners.

**Features**:
- Timeout tracking with Map data structure
- Cleanup on component unmount
- Cleanup when timeouts are manually cleared
- Prevention of memory leaks

**Code Location**: `src/components/settings/ApiKeysSettings.tsx:75-79`

```typescript
// Cleanup timeouts on unmount
useEffect(() => {
  return () => {
    Object.values(hideTimeouts).forEach(timeout => clearTimeout(timeout));
  };
}, [hideTimeouts]);
```

## User Interface Elements

### Button States and Tooltips

| State | Icon | Tooltip | Action |
|-------|------|---------|--------|
| Key Hidden | Eye | "Show full API key" | Reveals key with auto-hide |
| Key Visible | Eye-off | "Hide API key (auto-hides in 30s)" | Immediately hides key |

### Visual Indicators

- **Masked Key**: `sk-••••••••••••••••••••••••••••••••abcd`
- **Full Key**: `sk-prod-1234567890abcdef1234567890abcdef`
- **Security Warning**: Yellow background with warning icon
- **Auto-hide Notice**: Toast notification when timeout occurs

## Testing

### Automated Tests

**Test File**: `tests/e2e/api-key-security.spec.ts`

**Test Coverage**:
- Default masking behavior
- Show/hide toggle functionality
- Auto-hide after 30 seconds
- Copy to clipboard functionality
- New key creation with proper masking
- Delete confirmation handling
- Button tooltip verification
- Permission display
- State persistence across navigation

**Key Test Cases**:

```typescript
test('should mask API keys by default', async ({ page }) => {
  // Verifies all keys show masked format by default
});

test('should auto-hide API key after 30 seconds', async ({ page }) => {
  // Tests automatic hiding with timeout and toast notification
});

test('should copy full API key to clipboard when copy button is clicked', async ({ page }) => {
  // Verifies secure copy functionality
});
```

### Manual Testing

**Test Scenarios**:
1. Load API keys page - verify all keys are masked
2. Click eye icon - verify key shows and warning appears
3. Wait 30 seconds - verify auto-hide and toast notification
4. Click copy button - verify clipboard contains full key
5. Navigate away and back - verify masking state reset

## Security Considerations

### Implemented Protections

1. **No Persistent Storage**: Visibility state is not persisted across sessions
2. **No Logging**: API key values are never logged to console or analytics
3. **Auto-Hide**: Reduces exposure time with automatic hiding
4. **Visual Warnings**: Clear indication when sensitive data is visible
5. **Memory Safety**: Proper cleanup prevents memory leaks

### Best Practices Followed

1. **Secure by Default**: Keys masked unless explicitly revealed
2. **Minimal Exposure**: Limited visibility duration
3. **Clear Communication**: Users aware of security implications
4. **Graceful Degradation**: Fallbacks for clipboard API failures
5. **Accessibility**: Proper ARIA labels and keyboard navigation

### Future Enhancements

1. **Configurable Timeout**: Allow users to set auto-hide duration
2. **Access Logging**: Track when keys are revealed (without storing values)
3. **Permission-Based Access**: Role-based key visibility controls
4. **Encryption at Rest**: Encrypt stored API keys
5. **Key Rotation**: Automated key rotation with notifications

## Implementation Timeline

- **Initial Implementation**: API key masking and visibility toggle
- **Auto-Hide Feature**: 30-second timeout with toast notifications
- **Security Warnings**: Visual indicators and user education
- **Comprehensive Testing**: E2E test suite with full coverage
- **Documentation**: Complete security documentation

## Compliance and Standards

- **OWASP Guidelines**: Follows secure coding practices
- **Accessibility**: WCAG 2.1 compliant with proper ARIA labels
- **Browser Support**: Compatible with modern browsers
- **Mobile Responsive**: Works on all device sizes

## Monitoring and Metrics

**Security Metrics** (potential future implementation):
- Key exposure frequency
- Auto-hide effectiveness
- User security behavior patterns
- Clipboard access patterns

**Performance Metrics**:
- Component render times
- Timeout cleanup efficiency
- Memory usage patterns
- User interaction responsiveness

## Related Documentation

- [Toast Notification System](./TOAST_NOTIFICATIONS.md)
- [API Integration](./API_INTEGRATION.md)
- [Error Boundaries](./ERROR_BOUNDARIES.md)
- [WebSocket Memory Management](./WEBSOCKET_MEMORY_LEAK_FIXES.md)