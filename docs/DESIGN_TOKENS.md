# Design Tokens

## 🎨 Color System

### Primary Colors
| Token | Light Value | Dark Value | Usage |
|-------|-------------|------------|-------|
| `--primary` | `#020617` | `#f8fafc` | Primary actions, focus states |
| `--primary-foreground` | `#f8fafc` | `#020617` | Text on primary backgrounds |

### Background Colors
| Token | Light Value | Dark Value | Usage |
|-------|-------------|------------|-------|
| `--background` | `#ffffff` | `#020617` | Main background |
| `--foreground` | `#020617` | `#f8fafc` | Main text color |
| `--muted` | `#f1f5f9` | `#334155` | Subtle backgrounds |
| `--muted-foreground` | `#64748b` | `#94a3b8` | Secondary text |

### UI Colors
| Token | Light Value | Dark Value | Usage |
|-------|-------------|------------|-------|
| `--card` | `#ffffff` | `#020617` | Card backgrounds |
| `--border` | `#e2e8f0` | `#334155` | Borders, dividers |
| `--input` | `#e2e8f0` | `#334155` | Input borders |

### Semantic Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--destructive` | `#dc2626` | Error states, delete actions |
| `--success` | `#16a34a` | Success states, confirmations |
| `--warning` | `#f59e0b` | Warning states, cautions |
| `--info` | `#3b82f6` | Informational content |

## 📝 Typography

### Font Families
| Token | Value | Usage |
|-------|-------|-------|
| `--font-sans` | `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` | Body text, UI |
| `--font-mono` | `ui-monospace, SFMono-Regular, "SF Mono", Consolas, monospace` | Code, technical content |

### Font Sizes
| Token | Value | rem | px | Usage |
|-------|-------|-----|----|----|
| `--text-xs` | `0.75rem` | 0.75 | 12 | Captions, labels |
| `--text-sm` | `0.875rem` | 0.875 | 14 | Small text, metadata |
| `--text-base` | `1rem` | 1 | 16 | Body text |
| `--text-lg` | `1.125rem` | 1.125 | 18 | Large body text |
| `--text-xl` | `1.25rem` | 1.25 | 20 | Small headings |
| `--text-2xl` | `1.5rem` | 1.5 | 24 | Medium headings |
| `--text-3xl` | `1.875rem` | 1.875 | 30 | Large headings |
| `--text-4xl` | `2.25rem` | 2.25 | 36 | Extra large headings |

### Font Weights
| Token | Value | Usage |
|-------|-------|-------|
| `--font-light` | `300` | Light emphasis |
| `--font-normal` | `400` | Regular text |
| `--font-medium` | `500` | Medium emphasis |
| `--font-semibold` | `600` | Strong emphasis |
| `--font-bold` | `700` | Headings, important text |

### Line Heights
| Token | Value | Usage |
|-------|-------|-------|
| `--leading-tight` | `1.25` | Headings, compact text |
| `--leading-normal` | `1.5` | Body text |
| `--leading-relaxed` | `1.625` | Reading content |

## 📏 Spacing

### Base Scale (4px grid)
| Token | Value | rem | px | Usage |
|-------|-------|-----|----|----|
| `--space-0` | `0` | 0 | 0 | No spacing |
| `--space-px` | `1px` | - | 1 | Hairline borders |
| `--space-0.5` | `0.125rem` | 0.125 | 2 | Tiny spacing |
| `--space-1` | `0.25rem` | 0.25 | 4 | Extra small spacing |
| `--space-1.5` | `0.375rem` | 0.375 | 6 | - |
| `--space-2` | `0.5rem` | 0.5 | 8 | Small spacing |
| `--space-2.5` | `0.625rem` | 0.625 | 10 | - |
| `--space-3` | `0.75rem` | 0.75 | 12 | Medium small spacing |
| `--space-3.5` | `0.875rem` | 0.875 | 14 | - |
| `--space-4` | `1rem` | 1 | 16 | Medium spacing |
| `--space-5` | `1.25rem` | 1.25 | 20 | Medium large spacing |
| `--space-6` | `1.5rem` | 1.5 | 24 | Large spacing |
| `--space-7` | `1.75rem` | 1.75 | 28 | - |
| `--space-8` | `2rem` | 2 | 32 | Extra large spacing |
| `--space-9` | `2.25rem` | 2.25 | 36 | - |
| `--space-10` | `2.5rem` | 2.5 | 40 | XXL spacing |
| `--space-11` | `2.75rem` | 2.75 | 44 | - |
| `--space-12` | `3rem` | 3 | 48 | Section spacing |
| `--space-14` | `3.5rem` | 3.5 | 56 | - |
| `--space-16` | `4rem` | 4 | 64 | Large section spacing |
| `--space-20` | `5rem` | 5 | 80 | Page section spacing |
| `--space-24` | `6rem` | 6 | 96 | Large page spacing |
| `--space-28` | `7rem` | 7 | 112 | - |
| `--space-32` | `8rem` | 8 | 128 | Extra large page spacing |

## 🎭 Shadows

### Elevation Scale
| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Subtle elevation |
| `--shadow` | `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)` | Default elevation |
| `--shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` | Medium elevation |
| `--shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` | High elevation |
| `--shadow-xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)` | Very high elevation |
| `--shadow-2xl` | `0 25px 50px -12px rgb(0 0 0 / 0.25)` | Maximum elevation |

## 🌐 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-none` | `0` | No rounding |
| `--radius-sm` | `0.125rem` | Subtle rounding |
| `--radius` | `0.25rem` | Default rounding |
| `--radius-md` | `0.375rem` | Medium rounding |
| `--radius-lg` | `0.5rem` | Large rounding |
| `--radius-xl` | `0.75rem` | Extra large rounding |
| `--radius-2xl` | `1rem` | Maximum rounding |
| `--radius-full` | `9999px` | Fully rounded |

## 📐 Breakpoints

| Token | Value | Usage |
|-------|-------|-------|
| `--screen-sm` | `640px` | Small devices (landscape phones) |
| `--screen-md` | `768px` | Medium devices (tablets) |
| `--screen-lg` | `1024px` | Large devices (desktops) |
| `--screen-xl` | `1280px` | Extra large devices |
| `--screen-2xl` | `1536px` | 2X large devices |

## ⏱️ Animation

### Timing Functions
| Token | Value | Usage |
|-------|-------|-------|
| `--ease-linear` | `cubic-bezier(0, 0, 1, 1)` | Linear animation |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Ease in |
| `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Ease out |
| `--ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Ease in out |

### Duration
| Token | Value | Usage |
|-------|-------|-------|
| `--duration-75` | `75ms` | Very fast |
| `--duration-100` | `100ms` | Fast |
| `--duration-150` | `150ms` | Default |
| `--duration-200` | `200ms` | Slower |
| `--duration-300` | `300ms` | Slow |
| `--duration-500` | `500ms` | Very slow |
| `--duration-700` | `700ms` | Extra slow |
| `--duration-1000` | `1000ms` | Maximum |

## 🎯 Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--z-0` | `0` | Default stacking |
| `--z-10` | `10` | Dropdowns, tooltips |
| `--z-20` | `20` | Sticky elements |
| `--z-30` | `30` | Fixed elements |
| `--z-40` | `40` | Modals backdrop |
| `--z-50` | `50` | Modals content |

## 🔧 Usage Examples

### CSS Custom Properties
```css
:root {
  /* Colors */
  --primary: 222.2 84% 4.9%;
  --primary-foreground: 210 40% 98%;
  
  /* Typography */
  --font-sans: system-ui, -apple-system, sans-serif;
  --text-base: 1rem;
  --leading-normal: 1.5;
  
  /* Spacing */
  --space-4: 1rem;
  --space-8: 2rem;
  
  /* Shadows */
  --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}
```

### Tailwind Configuration
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'hsl(var(--primary))',
        'primary-foreground': 'hsl(var(--primary-foreground))',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      fontSize: {
        'xs': 'var(--text-xs)',
        'sm': 'var(--text-sm)',
        'base': 'var(--text-base)',
      },
      spacing: {
        '1': 'var(--space-1)',
        '2': 'var(--space-2)',
        '4': 'var(--space-4)',
      },
    },
  },
}
```

### Component Usage
```tsx
// Using design tokens in components
const Button = ({ variant = 'default', size = 'default', ...props }) => {
  return (
    <button
      className={cn(
        // Base styles using tokens
        'font-medium rounded-md transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        
        // Variant styles
        variant === 'default' && 'bg-primary text-primary-foreground hover:bg-primary/90',
        variant === 'destructive' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        
        // Size styles
        size === 'default' && 'h-10 px-4 py-2 text-sm',
        size === 'sm' && 'h-9 px-3 py-1 text-xs',
        size === 'lg' && 'h-11 px-8 py-2 text-base',
      )}
      {...props}
    />
  )
}
```

This design token system provides a consistent foundation for all UI components and ensures maintainable, scalable styling across the application.