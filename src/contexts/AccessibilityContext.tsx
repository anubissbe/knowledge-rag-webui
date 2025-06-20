import React, { createContext, useContext, useState, useEffect } from 'react'

export interface AccessibilitySettings {
  highContrast: boolean
  reducedMotion: boolean
  largeText: boolean
  screenReaderMode: boolean
  keyboardNavigation: boolean
  focusRing: 'default' | 'enhanced' | 'high-contrast'
}

interface AccessibilityContextType {
  settings: AccessibilitySettings
  updateSetting: <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => void
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void
  resetSettings: () => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  highContrast: false,
  reducedMotion: false,
  largeText: false,
  screenReaderMode: false,
  keyboardNavigation: true,
  focusRing: 'default'
}

interface AccessibilityProviderProps {
  children: React.ReactNode
  storageKey?: string
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({
  children,
  storageKey = 'knowledge-rag-accessibility'
}) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem(storageKey)
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...DEFAULT_SETTINGS, ...parsed })
      } catch (error) {
        console.warn('Failed to parse accessibility settings:', error)
      }
    }

    // Detect system preferences
    const mediaQueries = {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      highContrast: window.matchMedia('(prefers-contrast: high)'),
      largeText: window.matchMedia('(prefers-font-size: large)')
    }

    // Apply system preferences if no saved settings
    if (!savedSettings) {
      setSettings(prev => ({
        ...prev,
        reducedMotion: mediaQueries.reducedMotion.matches,
        highContrast: mediaQueries.highContrast.matches,
        largeText: mediaQueries.largeText.matches
      }))
    }

    // Listen for system preference changes
    const handlePrefersReducedMotion = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem(`${storageKey}-reducedMotion-override`)) {
        updateSetting('reducedMotion', e.matches)
      }
    }

    const handlePrefersHighContrast = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem(`${storageKey}-highContrast-override`)) {
        updateSetting('highContrast', e.matches)
      }
    }

    mediaQueries.reducedMotion.addEventListener('change', handlePrefersReducedMotion)
    mediaQueries.highContrast.addEventListener('change', handlePrefersHighContrast)

    return () => {
      mediaQueries.reducedMotion.removeEventListener('change', handlePrefersReducedMotion)
      mediaQueries.highContrast.removeEventListener('change', handlePrefersHighContrast)
    }
  }, [storageKey])

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement

    // High contrast mode
    if (settings.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion')
    } else {
      root.classList.remove('reduced-motion')
    }

    // Large text
    if (settings.largeText) {
      root.classList.add('large-text')
    } else {
      root.classList.remove('large-text')
    }

    // Screen reader mode
    if (settings.screenReaderMode) {
      root.classList.add('screen-reader-mode')
    } else {
      root.classList.remove('screen-reader-mode')
    }

    // Focus ring style
    root.setAttribute('data-focus-ring', settings.focusRing)

    // Keyboard navigation
    if (settings.keyboardNavigation) {
      root.classList.add('keyboard-navigation')
    } else {
      root.classList.remove('keyboard-navigation')
    }
  }, [settings])

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value }
      localStorage.setItem(storageKey, JSON.stringify(newSettings))
      
      // Mark as user override for system preferences
      if (key === 'reducedMotion' || key === 'highContrast') {
        localStorage.setItem(`${storageKey}-${key}-override`, 'true')
      }
      
      return newSettings
    })
  }

  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    // Create or update live region for screen reader announcements
    let liveRegion = document.getElementById('accessibility-live-region')
    
    if (!liveRegion) {
      liveRegion = document.createElement('div')
      liveRegion.id = 'accessibility-live-region'
      liveRegion.setAttribute('aria-live', priority)
      liveRegion.setAttribute('aria-atomic', 'true')
      liveRegion.style.position = 'absolute'
      liveRegion.style.left = '-10000px'
      liveRegion.style.width = '1px'
      liveRegion.style.height = '1px'
      liveRegion.style.overflow = 'hidden'
      document.body.appendChild(liveRegion)
    }

    // Update aria-live priority if different
    if (liveRegion.getAttribute('aria-live') !== priority) {
      liveRegion.setAttribute('aria-live', priority)
    }

    // Clear and set new message
    liveRegion.textContent = ''
    setTimeout(() => {
      liveRegion!.textContent = message
    }, 100)
  }

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS)
    localStorage.removeItem(storageKey)
    
    // Remove override flags
    localStorage.removeItem(`${storageKey}-reducedMotion-override`)
    localStorage.removeItem(`${storageKey}-highContrast-override`)
  }

  const value: AccessibilityContextType = {
    settings,
    updateSetting,
    announceToScreenReader,
    resetSettings
  }

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  )
}