import React, { useEffect, useRef } from 'react'
import { useAccessibility } from '../../contexts/AccessibilityContext'

// Skip to Main Content Link
export const SkipToMain: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[9999] bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium"
    >
      Skip to main content
    </a>
  )
}

// Focus Trap Component
interface FocusTrapProps {
  children: React.ReactNode
  active?: boolean
  restoreFocus?: boolean
}

export const FocusTrap: React.FC<FocusTrapProps> = ({ 
  children, 
  active = true, 
  restoreFocus = true 
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!active) return

    const container = containerRef.current
    if (!container) return

    // Store the previously active element
    previousActiveElement.current = document.activeElement as HTMLElement

    // Get all focusable elements
    const getFocusableElements = () => {
      return container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const focusableElements = getFocusableElements()
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    // Focus the first element
    const focusableElements = getFocusableElements()
    focusableElements[0]?.focus()

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      
      // Restore focus to the previously active element
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus()
      }
    }
  }, [active, restoreFocus])

  if (!active) {
    return <>{children}</>
  }

  return (
    <div ref={containerRef}>
      {children}
    </div>
  )
}

// Live Region for Screen Reader Announcements
export const LiveRegion: React.FC = () => {
  return (
    <div
      id="accessibility-live-region"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
  )
}

// High Contrast Toggle
export const HighContrastToggle: React.FC = () => {
  const { settings, updateSetting } = useAccessibility()

  return (
    <button
      onClick={() => updateSetting('highContrast', !settings.highContrast)}
      className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors"
      aria-pressed={settings.highContrast}
      aria-label={`${settings.highContrast ? 'Disable' : 'Enable'} high contrast mode`}
    >
      <div className="w-4 h-4 border-2 border-current rounded" />
      <span>High Contrast</span>
    </button>
  )
}

// Focus Ring Indicator
export const FocusRingIndicator: React.FC = () => {
  const { settings } = useAccessibility()

  return (
    <div className="text-sm text-muted-foreground">
      Focus ring style: <span className="font-medium">{settings.focusRing}</span>
    </div>
  )
}

// Accessibility Status Indicator
export const AccessibilityStatus: React.FC = () => {
  const { settings } = useAccessibility()

  const activeFeatures = Object.entries(settings).filter(([key, value]) => {
    if (key === 'focusRing') return value !== 'default'
    return value === true
  }).length

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="w-2 h-2 rounded-full bg-green-500" />
      <span>{activeFeatures} accessibility features active</span>
    </div>
  )
}

// Keyboard Navigation Helper
export const KeyboardNavHelper: React.FC = () => {
  const { settings } = useAccessibility()

  if (!settings.keyboardNavigation) return null

  return (
    <div className="fixed bottom-4 right-4 bg-background border rounded-lg p-3 shadow-lg z-50 text-xs max-w-xs">
      <div className="font-medium mb-2">Keyboard Shortcuts</div>
      <ul className="space-y-1 text-muted-foreground">
        <li><kbd className="bg-muted px-1 rounded">Tab</kbd> Navigate forward</li>
        <li><kbd className="bg-muted px-1 rounded">Shift+Tab</kbd> Navigate backward</li>
        <li><kbd className="bg-muted px-1 rounded">Enter</kbd> Activate button</li>
        <li><kbd className="bg-muted px-1 rounded">Esc</kbd> Close dialogs</li>
        <li><kbd className="bg-muted px-1 rounded">/</kbd> Focus search</li>
      </ul>
    </div>
  )
}

// Screen Reader Only Text
interface SROnlyProps {
  children: React.ReactNode
}

export const SROnly: React.FC<SROnlyProps> = ({ children }) => {
  return (
    <span className="sr-only">
      {children}
    </span>
  )
}

// Accessible Heading
interface AccessibleHeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6
  children: React.ReactNode
  className?: string
  id?: string
}

export const AccessibleHeading: React.FC<AccessibleHeadingProps> = ({ 
  level, 
  children, 
  className = '', 
  id 
}) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements
  
  return (
    <Tag className={className} id={id}>
      {children}
    </Tag>
  )
}

// Accessible Button with Loading State
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  loadingText?: string
  children: React.ReactNode
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  loading = false,
  loadingText = 'Loading...',
  children,
  disabled,
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-describedby={loading ? `${props.id}-loading` : undefined}
    >
      {loading ? (
        <>
          <span aria-hidden="true">{loadingText}</span>
          <span id={`${props.id}-loading`} className="sr-only">
            Loading, please wait
          </span>
        </>
      ) : (
        children
      )}
    </button>
  )
}

// Progress Bar with Accessibility
interface AccessibleProgressProps {
  value: number
  max?: number
  label?: string
  className?: string
}

export const AccessibleProgress: React.FC<AccessibleProgressProps> = ({
  value,
  max = 100,
  label,
  className = ''
}) => {
  const percentage = Math.round((value / max) * 100)
  
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <div className="text-sm font-medium" id="progress-label">
          {label}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-labelledby={label ? "progress-label" : undefined}
        aria-valuetext={`${percentage}% complete`}
        className="w-full bg-secondary rounded-full h-2"
      >
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-muted-foreground">
        {percentage}% complete
      </div>
    </div>
  )
}