# Accessibility Features Documentation

## Overview

The Knowledge RAG Web UI implements comprehensive accessibility features to ensure the application is usable by everyone, including users with disabilities. This document covers all accessibility features, implementation details, and testing strategies.

## Features

### Core Accessibility Features

#### 1. High Contrast Mode

**Purpose**: Enhances visual contrast for users with low vision or color blindness.

**Implementation**:
```typescript
// Context: AccessibilityContext.tsx
const { settings, updateSetting } = useAccessibility()
updateSetting('highContrast', true)
```

**Visual Changes**:
- Background: Pure black (`#000000`)
- Text: Pure white (`#FFFFFF`)
- Primary elements: Bright yellow (`#FFFF00`)
- Borders: High contrast grays
- Links: Bright cyan (`#00FFFF`)

**CSS Classes Applied**:
```css
.high-contrast {
  --background: hsl(0 0% 0%);
  --foreground: hsl(0 0% 100%);
  --primary: hsl(60 100% 50%);
  /* ... additional color overrides */
}
```

#### 2. Reduced Motion

**Purpose**: Minimizes animations for users sensitive to motion or with vestibular disorders.

**Implementation**:
```css
.reduced-motion,
.reduced-motion *,
.reduced-motion *::before,
.reduced-motion *::after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
  scroll-behavior: auto !important;
}
```

**Affected Elements**:
- Loading spinners
- Hover transitions
- Page transitions
- Animated components
- Smooth scrolling

#### 3. Large Text

**Purpose**: Increases text size for users with visual impairments.

**Implementation**:
```css
.large-text {
  font-size: 125%;
}

.large-text h1 { font-size: 3rem; }
.large-text .text-sm { font-size: 1rem; }
/* ... size increases for all text classes */
```

**Scaling**:
- Base text: 125% increase
- Headings: Proportional scaling
- UI elements: Responsive sizing

#### 4. Screen Reader Mode

**Purpose**: Enhanced support for screen reader users.

**Features**:
- Hidden elements become visible
- Enhanced ARIA labels
- Live region announcements
- Improved semantic structure

**Implementation**:
```typescript
const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  // Creates/updates live region for announcements
}
```

#### 5. Keyboard Navigation

**Purpose**: Full keyboard accessibility with visual guidance.

**Features**:
- Tab navigation support
- Keyboard shortcuts helper
- Focus management
- Skip links

**Shortcuts Available**:
- `Tab` - Navigate forward
- `Shift+Tab` - Navigate backward
- `Enter` - Activate buttons/links
- `Escape` - Close dialogs/modals
- `/` - Focus search input

#### 6. Focus Ring Styles

**Purpose**: Customizable focus indicators for different user needs.

**Options**:
- **Default**: Standard 2px outline
- **Enhanced**: 3px outline with shadow
- **High Contrast**: 4px bright yellow outline

**Implementation**:
```css
[data-focus-ring="enhanced"] *:focus-visible {
  outline: 3px solid hsl(var(--ring));
  outline-offset: 3px;
  box-shadow: 0 0 0 1px hsl(var(--background)), 0 0 0 4px hsl(var(--ring));
}
```

## Components

### Accessibility Components

#### SkipToMain
```tsx
<SkipToMain />
```
- Allows keyboard users to skip navigation
- Hidden until focused
- Jumps to `#main-content`

#### FocusTrap
```tsx
<FocusTrap active={true} restoreFocus={true}>
  <Modal>Content</Modal>
</FocusTrap>
```
- Constrains focus within modals/dialogs
- Manages focus restoration
- Handles Tab/Shift+Tab navigation

#### AccessibleButton
```tsx
<AccessibleButton loading={isLoading} loadingText="Saving...">
  Save
</AccessibleButton>
```
- Enhanced button with loading states
- Proper ARIA attributes
- Screen reader announcements

#### AccessibleProgress
```tsx
<AccessibleProgress value={75} max={100} label="Upload Progress" />
```
- ARIA-compliant progress indicator
- Percentage calculations
- Screen reader announcements

#### SROnly
```tsx
<SROnly>This text is only for screen readers</SROnly>
```
- Visually hidden but accessible text
- Important context for screen readers

### UI Integration

#### Settings Page Integration

The accessibility settings are fully integrated into the settings page:

```tsx
// Settings Page - Accessibility Section
<div className="bg-card border rounded-lg p-6 space-y-4">
  <div className="flex items-center gap-3">
    <Eye className="h-5 w-5 text-primary" />
    <h2 className="text-xl font-semibold">Accessibility</h2>
  </div>
  
  {/* Toggle Controls */}
  {/* Focus Ring Options */}
  {/* Reset Button */}
</div>
```

## System Preferences Integration

### Automatic Detection

The system automatically detects and applies user system preferences:

```typescript
// Detect system preferences
const mediaQueries = {
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
  highContrast: window.matchMedia('(prefers-contrast: high)'),
  largeText: window.matchMedia('(prefers-font-size: large)')
}
```

### Override System

Users can override system preferences with manual settings:

```typescript
// Mark as user override
if (key === 'reducedMotion' || key === 'highContrast') {
  localStorage.setItem(`${storageKey}-${key}-override`, 'true')
}
```

## ARIA Implementation

### Semantic HTML

```html
<!-- Proper heading hierarchy -->
<h1>Main Page Title</h1>
  <h2>Section Title</h2>
    <h3>Subsection Title</h3>

<!-- Landmark roles -->
<main id="main-content">
<nav aria-label="Main navigation">
<aside aria-label="Sidebar">
```

### Interactive Elements

```html
<!-- Toggle buttons -->
<button 
  aria-pressed="true"
  aria-label="Toggle high contrast mode"
  onClick={toggleHighContrast}
>

<!-- Progress indicators -->
<div 
  role="progressbar"
  aria-valuenow="50"
  aria-valuemin="0"
  aria-valuemax="100"
  aria-valuetext="50% complete"
>
```

### Live Regions

```html
<!-- Screen reader announcements -->
<div 
  id="accessibility-live-region"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
/>
```

## Testing

### Unit Tests

**Location**: `src/contexts/__tests__/AccessibilityContext.test.tsx`

**Coverage**:
- Context state management
- Setting updates and persistence
- System preference detection
- Screen reader announcements
- Error handling

**Example Test**:
```typescript
it('updates settings correctly', () => {
  const { result } = renderHook(() => useAccessibility(), { wrapper })

  act(() => {
    result.current.updateSetting('highContrast', true)
  })

  expect(result.current.settings.highContrast).toBe(true)
  expect(mockLocalStorage.setItem).toHaveBeenCalled()
})
```

### Component Tests

**Location**: `src/components/accessibility/__tests__/AccessibilityComponents.test.tsx`

**Coverage**:
- Component rendering
- User interactions
- ARIA attributes
- Focus management

### E2E Tests

**Location**: `e2e/tests/accessibility-features.spec.ts`

**Coverage**:
- Settings page integration
- Feature toggles
- Visual changes
- Keyboard navigation
- Persistence across reloads
- Mobile responsiveness

**Example Test**:
```typescript
test('should toggle high contrast mode', async ({ page }) => {
  const toggle = page.locator('button[aria-label="Toggle high contrast mode"]')
  await toggle.click()
  
  await expect(toggle).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('html')).toHaveClass(/high-contrast/)
})
```

## Performance Considerations

### CSS Optimization

- Accessibility styles loaded separately
- Efficient class toggling
- Minimal DOM modifications

### JavaScript Efficiency

- Debounced setting updates
- Optimized media query listeners
- Minimal re-renders

### Bundle Size

- Tree-shakeable components
- Conditional feature loading
- Efficient context implementation

## Browser Support

### Modern Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Feature Detection
```typescript
// Graceful degradation
if ('matchMedia' in window) {
  // System preference detection
} else {
  // Fallback to manual settings only
}
```

### Polyfills
- Focus-visible polyfill for older browsers
- IntersectionObserver for scroll management

## Best Practices

### Implementation Guidelines

1. **Always provide alternatives**
   - Visual indicators with text alternatives
   - Audio cues with visual feedback
   - Multiple ways to access features

2. **Follow WCAG 2.1 AA standards**
   - Color contrast ratios ≥ 4.5:1
   - Focus indicators clearly visible
   - Keyboard accessible

3. **Test with real users**
   - Screen reader testing
   - Keyboard-only navigation
   - High contrast validation

4. **Semantic HTML first**
   - Use proper elements
   - ARIA as enhancement, not replacement
   - Logical tab order

### Development Workflow

1. **Design Phase**
   - Consider accessibility from start
   - Include focus states in designs
   - Plan keyboard navigation

2. **Implementation**
   - Use semantic HTML
   - Add ARIA labels
   - Test with keyboard only

3. **Testing**
   - Automated accessibility tests
   - Manual keyboard testing
   - Screen reader validation

4. **Maintenance**
   - Regular accessibility audits
   - User feedback collection
   - Continuous improvement

## Common Patterns

### Modal Dialogs
```tsx
<FocusTrap active={isOpen}>
  <div role="dialog" aria-labelledby="modal-title" aria-modal="true">
    <h2 id="modal-title">Modal Title</h2>
    <p>Modal content</p>
    <button onClick={closeModal}>Close</button>
  </div>
</FocusTrap>
```

### Form Labels
```tsx
<div>
  <label htmlFor="email">Email Address</label>
  <input 
    id="email" 
    type="email" 
    aria-describedby="email-help"
    required 
  />
  <div id="email-help">We'll never share your email</div>
</div>
```

### Status Messages
```tsx
const { announceToScreenReader } = useAccessibility()

const handleSave = async () => {
  try {
    await saveData()
    announceToScreenReader('Data saved successfully', 'polite')
  } catch (error) {
    announceToScreenReader('Error saving data', 'assertive')
  }
}
```

## Troubleshooting

### Common Issues

1. **Focus not visible**
   - Check focus ring setting
   - Verify CSS not overriding
   - Test with different focus styles

2. **Screen reader not announcing**
   - Verify live region exists
   - Check ARIA attributes
   - Test message timing

3. **High contrast not applying**
   - Check class application
   - Verify CSS specificity
   - Test color overrides

4. **Keyboard navigation broken**
   - Check tab order
   - Verify focusable elements
   - Test focus trap implementation

### Debugging Tools

1. **Browser DevTools**
   - Accessibility tree inspection
   - Color contrast checker
   - Lighthouse accessibility audit

2. **Screen Readers**
   - NVDA (Windows)
   - JAWS (Windows)
   - VoiceOver (macOS)
   - Orca (Linux)

3. **Testing Extensions**
   - axe DevTools
   - Wave Web Accessibility Evaluator
   - Accessibility Insights

## Future Enhancements

### Planned Features

- [ ] Voice navigation support
- [ ] Magnification preferences
- [ ] Color customization beyond high contrast
- [ ] Dyslexia-friendly fonts
- [ ] Reading speed adjustments

### Research Areas

- Eye tracking integration
- Voice command interface
- AI-powered accessibility suggestions
- Multi-language accessibility
- Cognitive accessibility features

## Related Documentation

- [Theme System](./THEME_SYSTEM.md) - Dark/light theme integration
- [Testing Guide](./TESTING.md) - General testing strategies
- [API Documentation](./API_DOCUMENTATION.md) - Context API details

## External Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/)
- [Accessibility Developer Guide](https://www.accessibility-developer-guide.com/)

---

**Note**: Accessibility is an ongoing process. This documentation should be updated as new features are added and based on user feedback and testing results.