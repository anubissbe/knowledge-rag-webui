# Keyboard Shortcuts Guide

## Overview

The Knowledge RAG Web UI includes comprehensive keyboard shortcuts to help you navigate and work more efficiently. These shortcuts are designed to be intuitive and follow common conventions from popular applications.

## Quick Access

- Press `Shift+?` at any time to open the keyboard shortcuts help panel
- Click the floating keyboard icon in the bottom-right corner
- Navigate to Settings → Keyboard Shortcuts

## Global Shortcuts

These shortcuts work from anywhere in the application:

### Navigation
- `h` - Go to Home
- `m` - Go to Memories  
- `g` - Go to Knowledge Graph
- `c` - Go to Collections
- `a` - Go to Analytics
- `s` - Go to Settings

### Actions
- `/` - Focus search bar
- `n` - Create new memory
- `Ctrl+n` - Create new memory (alternative)
- `Esc` - Close modal/Clear search
- `Ctrl+b` - Toggle sidebar
- `Shift+?` - Show keyboard shortcuts help

## Context-Specific Shortcuts

These shortcuts work in specific contexts:

### List Navigation (Memories/Collections)
- `j` - Next item
- `k` - Previous item  
- `Enter` - Open focused item

### Editor Shortcuts
- `Ctrl+s` / `⌘+s` - Save current document
- `Esc` - Exit edit mode

### Search
- `Enter` - Execute search
- `Esc` - Clear search and unfocus

## Implementation Details

### Architecture

The keyboard shortcuts system is implemented using:

1. **Custom Hook** (`useKeyboardShortcuts`)
   - Manages all shortcut definitions
   - Handles keyboard event listeners
   - Respects input focus states
   - Checks authentication status

2. **Provider Component** (`KeyboardShortcutsProvider`)
   - Initializes shortcuts globally
   - Wraps the application

3. **UI Components**
   - `KeyboardShortcutsHelp` - Modal help panel
   - `KeyboardShortcutsButton` - Floating help button
   - `KeyboardShortcutsList` - Formatted shortcuts display

### Key Features

1. **Input Focus Awareness**
   - Shortcuts are disabled when typing in inputs
   - Exceptions for save operations (Ctrl+S)

2. **Authentication Check**
   - Shortcuts only work when authenticated
   - Prevents navigation to protected routes

3. **Platform Support**
   - Supports both Ctrl (Windows/Linux) and ⌘ (Mac)
   - Proper key combination detection

4. **Visual Feedback**
   - Keyboard indicators in UI
   - Tooltips for discoverability
   - Settings integration

## Customization

### Adding New Shortcuts

To add a new keyboard shortcut:

```typescript
// In useKeyboardShortcuts.ts
const shortcuts: KeyboardShortcut[] = [
  // ... existing shortcuts
  {
    key: 'your-key',
    ctrl: true, // Optional modifiers
    description: 'Your action description',
    action: () => {
      // Your action code
    },
    global: true, // Available everywhere?
    whenInputFocused: false // Active when typing?
  }
];
```

### Modifying Shortcuts

1. Edit the shortcuts array in `src/hooks/useKeyboardShortcuts.ts`
2. Update the documentation
3. Add tests for new functionality

## Best Practices

### For Users

1. **Learn Gradually** - Start with navigation shortcuts
2. **Use Help Panel** - Press Shift+? when you forget
3. **Combine with Mouse** - Shortcuts complement, not replace

### For Developers

1. **Consistency** - Follow platform conventions
2. **Discoverability** - Add visual hints in UI
3. **Testing** - Include unit and E2E tests
4. **Documentation** - Keep this guide updated

## Accessibility

The keyboard shortcuts system enhances accessibility by:

- Providing keyboard-only navigation
- Supporting screen readers
- Following ARIA best practices
- Respecting reduced motion preferences

## Troubleshooting

### Shortcuts Not Working

1. **Check Authentication** - Must be logged in
2. **Check Focus** - Click outside inputs
3. **Check Modifiers** - Ensure correct key combinations
4. **Browser Conflicts** - Some shortcuts may conflict with browser

### Common Issues

- **"/" in search** - Click outside search first
- **Ctrl+S saves page** - We override this in edit mode
- **Navigation keys** - Won't work while typing

## Future Enhancements

- Customizable shortcuts
- Shortcut recording
- Conflict detection
- Multi-key sequences (vim-style)
- Command palette (Ctrl+K)

## Related Documentation

- [Accessibility Features](./ACCESSIBILITY_FEATURES.md)
- [User Interface Guide](./UI_GUIDE.md)
- [Development Guide](./DEVELOPMENT.md)