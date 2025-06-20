# Theme System Documentation

## Overview

The Knowledge RAG Web UI implements a comprehensive dark/light theme system with automatic system preference detection and persistent user preferences.

## Architecture

### Components

```
src/contexts/ThemeContext.tsx    - React Context for theme state
src/stores/themeStore.ts         - Zustand store for persistence  
src/components/ThemeToggle.tsx   - Theme switcher components
src/pages/SettingsPage.tsx      - Theme settings interface
src/index.css                   - CSS custom properties
```

### Theme Modes

- **Light**: Traditional light theme with white backgrounds
- **Dark**: Dark theme with dark backgrounds for reduced eye strain
- **System**: Automatically follows the operating system theme preference

## Implementation Details

### ThemeContext

The `ThemeContext` provides centralized theme management:

```typescript
interface ThemeContextType {
  theme: Theme                    // Current theme setting
  resolvedTheme: 'light' | 'dark' // Actual applied theme
  setTheme: (theme: Theme) => void // Change theme
  toggleTheme: () => void         // Quick toggle
}
```

### Theme Persistence

Theme preferences are automatically saved to `localStorage` and restored on app startup:

```typescript
// Storage key: 'knowledge-rag-theme'
// Values: 'light' | 'dark' | 'system'
```

### CSS Custom Properties

The theme system uses CSS custom properties for consistent theming:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 221.2 83.2% 53.3%;
  /* ... more properties */
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --primary: 217.2 91.2% 59.8%;
  /* ... dark theme overrides */
}
```

## Components

### ThemeToggle Components

Three variants available:

1. **ThemeToggleButton**: Simple toggle button for header
2. **ThemeToggle**: Dropdown selector with icons
3. **ThemeRadioGroup**: Radio button group for settings page

### Usage Examples

```tsx
import { ThemeToggleButton } from '@/components/ThemeToggle'

// Simple toggle button
<ThemeToggleButton />

// Full theme selector in settings
<ThemeRadioGroup />

// Custom theme switching
const { setTheme } = useTheme()
setTheme('dark')
```

## System Integration

### Automatic Detection

The system automatically detects OS theme preferences:

```typescript
window.matchMedia('(prefers-color-scheme: dark)')
```

### Real-time Updates

Theme changes are applied immediately without page refresh:

- DOM classes updated (`light`/`dark`)
- CSS `color-scheme` property set
- Markdown editor theme synchronized

## Testing

### Unit Tests

Theme context is fully tested:

```bash
npm run test src/contexts/__tests__/ThemeContext.test.tsx
```

### E2E Tests

Theme functionality is tested across user workflows:

```bash
npm run test:e2e -- --grep "theme"
```

## Accessibility

### ARIA Support

- Proper ARIA labels on theme controls
- Screen reader announcements for theme changes
- Keyboard navigation support

### High Contrast

Theme system supports high contrast mode via CSS:

```css
@media (prefers-contrast: high) {
  /* High contrast overrides */
}
```

## Performance

### Initialization

Theme is initialized before React renders to prevent flash:

```typescript
// In main.tsx
initializeTheme()
setupSystemThemeListener()
```

### CSS Optimization

- Uses CSS custom properties for instant theme switching
- No JavaScript recalculations needed
- Smooth transitions with `transition-colors`

## Browser Support

- **Modern browsers**: Full support with CSS custom properties
- **Fallback**: Graceful degradation to light theme
- **System detection**: Works in Chrome 76+, Firefox 67+, Safari 12.1+

## Troubleshooting

### Common Issues

1. **Theme not persisting**: Check localStorage permissions
2. **Flash of wrong theme**: Ensure theme initialization runs before render
3. **System detection not working**: Verify `matchMedia` support

### Debugging

Enable theme debugging in development:

```typescript
localStorage.setItem('debug-theme', 'true')
```

## Future Enhancements

### Planned Features

- [ ] Theme scheduling (auto dark mode at night)
- [ ] Custom theme colors
- [ ] Theme marketplace
- [ ] Per-page theme overrides

### Accessibility Improvements

- [ ] Reduced motion support
- [ ] Color blind friendly themes
- [ ] Focus outline customization

## API Reference

### useTheme Hook

```typescript
const {
  theme,        // 'light' | 'dark' | 'system'
  resolvedTheme, // 'light' | 'dark'
  setTheme,     // (theme: Theme) => void
  toggleTheme   // () => void
} = useTheme()
```

### ThemeProvider Props

```typescript
interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme          // Default: 'system'
  storageKey?: string          // Default: 'knowledge-rag-theme'
}
```

## Migration Guide

### From Manual Theme Handling

Replace manual theme switching:

```typescript
// Before
const [isDark, setIsDark] = useState(false)
document.documentElement.classList.toggle('dark', isDark)

// After
const { setTheme } = useTheme()
setTheme('dark')
```

### Component Updates

Ensure components use theme-aware CSS:

```css
/* Use CSS custom properties */
.component {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
}
```

## Best Practices

1. **Always use CSS custom properties** for colors
2. **Test in both themes** during development
3. **Provide theme controls** in accessible locations
4. **Respect user preferences** (don't force themes)
5. **Use semantic color names** (not literal colors)

## Related Files

- `src/contexts/ThemeContext.tsx` - Main theme context
- `src/stores/themeStore.ts` - Persistence store
- `src/components/ThemeToggle.tsx` - UI components
- `src/index.css` - Theme CSS variables
- `tailwind.config.js` - Tailwind theme configuration