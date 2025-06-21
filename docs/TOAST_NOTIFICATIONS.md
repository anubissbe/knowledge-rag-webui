# Toast Notifications

Knowledge RAG WebUI uses a custom toast notification system for providing real-time feedback to users.

## 🎯 Overview

The toast notification system provides:
- Success, error, warning, and info messages
- Auto-dismiss with customizable duration
- Manual dismiss option
- Action buttons for interactive notifications
- Promise-based notifications for async operations
- Accessible design with ARIA labels

## 📦 Components

### 1. Notification Store (`/src/stores/notificationStore.ts`)
- Zustand-based global state management
- Automatic cleanup of expired notifications
- Unique ID generation for each notification
- Default 5-second duration (configurable)

### 2. Toast Component (`/src/components/ToastNotification.tsx`)
- Renders notification stack in top-right corner
- Icon and color coding by notification type
- Smooth enter/exit animations
- Click-to-dismiss functionality

### 3. useToast Hook (`/src/hooks/useToast.ts`)
- Convenient API for showing notifications
- Promise wrapper for async operations
- Type-safe notification methods

## 🚀 Usage

### Basic Usage

```typescript
import { useToast } from '../hooks/useToast';

function MyComponent() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success('Success!', 'Operation completed successfully');
  };

  const handleError = () => {
    toast.error('Error', 'Something went wrong');
  };

  const handleWarning = () => {
    toast.warning('Warning', 'Please check your input');
  };

  const handleInfo = () => {
    toast.info('Info', 'New update available');
  };
}
```

### Direct Import Usage

```typescript
import { toast } from '../stores/notificationStore';

// Use anywhere without a hook
toast.success('File saved');
toast.error('Network error', 'Check your connection');
```

### Promise-based Notifications

```typescript
const { promise } = useToast();

await promise(
  fetchData(),
  {
    loading: 'Loading data...',
    success: 'Data loaded successfully',
    error: (err) => `Failed to load: ${err.message}`
  }
);
```

### Custom Duration

```typescript
toast.success('Quick message', undefined, { duration: 2000 }); // 2 seconds
toast.info('Persistent message', undefined, { duration: 0 }); // Won't auto-dismiss
```

### With Action Button

```typescript
toast.error('Connection lost', 'Unable to reach server', {
  action: {
    label: 'Retry',
    onClick: () => reconnect()
  }
});
```

## 🎨 Notification Types

### Success
- **Color**: Green
- **Icon**: CheckCircle
- **Use for**: Successful operations, confirmations
- **Default duration**: 5 seconds

### Error
- **Color**: Red
- **Icon**: AlertCircle
- **Use for**: Failures, critical issues
- **Default duration**: Persistent (0)

### Warning
- **Color**: Yellow
- **Icon**: AlertTriangle
- **Use for**: Cautions, important notices
- **Default duration**: 5 seconds

### Info
- **Color**: Blue
- **Icon**: Info
- **Use for**: General information, tips
- **Default duration**: 5 seconds

## 🧩 Integration Points

The toast system is currently integrated in:

1. **Profile Settings** - Save success/error
2. **API Keys Settings** - Create, copy, delete feedback
3. **Memory Detail** - Copy, delete operations
4. **Bulk Operations** - Bulk delete, export feedback
5. **Error Boundaries** - Error recovery options

## 🔧 Configuration

### Global Settings

```typescript
// Change default duration
const DEFAULT_DURATION = 5000; // in notificationStore.ts

// Maximum notifications shown
// Currently unlimited, could add limit in store
```

### Styling

Toast notifications use Tailwind CSS classes and respect dark mode:
- Light mode: Colored backgrounds with borders
- Dark mode: Subtle colored backgrounds with opacity
- Responsive design works on all screen sizes

## 📝 Best Practices

### Do's
- ✅ Use appropriate notification type for the message
- ✅ Keep messages concise and actionable
- ✅ Provide context in the description when needed
- ✅ Use error notifications for critical issues
- ✅ Include retry actions for recoverable errors

### Don'ts
- ❌ Don't spam users with too many notifications
- ❌ Don't use success for warnings or vice versa
- ❌ Don't include sensitive information
- ❌ Don't use overly technical language
- ❌ Don't create notifications that block UI

## 🧪 Testing

### Manual Testing
1. Trigger various operations that show toasts
2. Verify auto-dismiss timing
3. Test manual dismiss functionality
4. Check dark mode appearance
5. Verify accessibility with screen readers

### Unit Testing
```typescript
// Example test
import { renderHook, act } from '@testing-library/react-hooks';
import { useToast } from '../hooks/useToast';

test('shows success toast', () => {
  const { result } = renderHook(() => useToast());
  
  act(() => {
    result.current.success('Test', 'Success message');
  });
  
  // Verify notification in store
  expect(useNotificationStore.getState().notifications).toHaveLength(1);
});
```

## 🚨 Troubleshooting

### Notifications not showing
1. Ensure `<ToastNotification />` is in App.tsx
2. Check z-index conflicts (currently z-50)
3. Verify no CSS overrides hiding the component

### Notifications not dismissing
1. Check if duration is set to 0 (persistent)
2. Verify no JavaScript errors preventing cleanup
3. Check browser console for timer issues

### Styling issues
1. Ensure Tailwind CSS is properly configured
2. Check for conflicting global styles
3. Verify dark mode classes are applied

## 🔮 Future Enhancements

Consider adding:
- Sound notifications (optional)
- Position configuration (top-left, bottom-right, etc.)
- Notification queue limits
- Swipe-to-dismiss on mobile
- Notification history
- Undo actions for certain operations
- Progress bars for long operations
- Stacking animations
- Notification categories/filtering