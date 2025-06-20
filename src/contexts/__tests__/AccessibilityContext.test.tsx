import { renderHook, act } from '@testing-library/react'
import { AccessibilityProvider, useAccessibility } from '../AccessibilityContext'

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

// Mock matchMedia
const mockMatchMedia = jest.fn()
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
})

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AccessibilityProvider>{children}</AccessibilityProvider>
)

describe('AccessibilityContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup default matchMedia mock
    mockMatchMedia.mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }))

    // Mock document methods
    Object.defineProperty(document, 'documentElement', {
      value: {
        classList: {
          add: jest.fn(),
          remove: jest.fn(),
        },
        setAttribute: jest.fn(),
      },
      writable: true,
    })
  })

  it('provides accessibility context values', () => {
    const { result } = renderHook(() => useAccessibility(), { wrapper })

    expect(result.current.settings).toBeDefined()
    expect(result.current.updateSetting).toBeDefined()
    expect(result.current.announceToScreenReader).toBeDefined()
    expect(result.current.resetSettings).toBeDefined()
  })

  it('initializes with correct default values', () => {
    mockLocalStorage.getItem.mockReturnValue(null)
    
    const { result } = renderHook(() => useAccessibility(), { wrapper })

    expect(result.current.settings).toEqual({
      highContrast: false,
      reducedMotion: false,
      largeText: false,
      screenReaderMode: false,
      keyboardNavigation: true,
      focusRing: 'default'
    })
  })

  it('loads settings from localStorage', () => {
    const savedSettings = {
      highContrast: true,
      reducedMotion: true,
      largeText: false,
      screenReaderMode: true,
      keyboardNavigation: true,
      focusRing: 'enhanced'
    }
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedSettings))
    
    const { result } = renderHook(() => useAccessibility(), { wrapper })

    expect(result.current.settings.highContrast).toBe(true)
    expect(result.current.settings.reducedMotion).toBe(true)
    expect(result.current.settings.screenReaderMode).toBe(true)
    expect(result.current.settings.focusRing).toBe('enhanced')
  })

  it('handles invalid localStorage data gracefully', () => {
    mockLocalStorage.getItem.mockReturnValue('invalid json')
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
    
    const { result } = renderHook(() => useAccessibility(), { wrapper })

    expect(result.current.settings.highContrast).toBe(false)
    expect(consoleSpy).toHaveBeenCalledWith('Failed to parse accessibility settings:', expect.any(Error))
    
    consoleSpy.mockRestore()
  })

  it('detects system preferences when no saved settings', () => {
    mockLocalStorage.getItem.mockReturnValue(null)
    
    // Mock system preferences
    mockMatchMedia.mockImplementation(query => {
      if (query === '(prefers-reduced-motion: reduce)') {
        return {
          matches: true,
          media: query,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
        }
      }
      if (query === '(prefers-contrast: high)') {
        return {
          matches: true,
          media: query,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
        }
      }
      return {
        matches: false,
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }
    })
    
    const { result } = renderHook(() => useAccessibility(), { wrapper })

    // Note: Due to async nature, we need to wait for useEffect
    expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
    expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-contrast: high)')
  })

  it('updates settings correctly', () => {
    const { result } = renderHook(() => useAccessibility(), { wrapper })

    act(() => {
      result.current.updateSetting('highContrast', true)
    })

    expect(result.current.settings.highContrast).toBe(true)
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'knowledge-rag-accessibility',
      JSON.stringify(expect.objectContaining({ highContrast: true }))
    )
  })

  it('marks user overrides for system preferences', () => {
    const { result } = renderHook(() => useAccessibility(), { wrapper })

    act(() => {
      result.current.updateSetting('reducedMotion', true)
    })

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'knowledge-rag-accessibility-reducedMotion-override',
      'true'
    )
  })

  it('updates focus ring setting', () => {
    const { result } = renderHook(() => useAccessibility(), { wrapper })

    act(() => {
      result.current.updateSetting('focusRing', 'high-contrast')
    })

    expect(result.current.settings.focusRing).toBe('high-contrast')
  })

  it('resets settings correctly', () => {
    const { result } = renderHook(() => useAccessibility(), { wrapper })

    // First set some values
    act(() => {
      result.current.updateSetting('highContrast', true)
      result.current.updateSetting('largeText', true)
    })

    expect(result.current.settings.highContrast).toBe(true)
    expect(result.current.settings.largeText).toBe(true)

    // Then reset
    act(() => {
      result.current.resetSettings()
    })

    expect(result.current.settings.highContrast).toBe(false)
    expect(result.current.settings.largeText).toBe(false)
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('knowledge-rag-accessibility')
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('knowledge-rag-accessibility-reducedMotion-override')
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('knowledge-rag-accessibility-highContrast-override')
  })

  it('announces to screen reader', () => {
    const { result } = renderHook(() => useAccessibility(), { wrapper })

    // Mock getElementById and createElement
    const mockLiveRegion = {
      id: 'accessibility-live-region',
      getAttribute: jest.fn().mockReturnValue('polite'),
      setAttribute: jest.fn(),
      textContent: '',
      style: {},
    }

    const mockDocument = {
      getElementById: jest.fn().mockReturnValue(null),
      createElement: jest.fn().mockReturnValue(mockLiveRegion),
      body: {
        appendChild: jest.fn(),
      },
    }

    Object.defineProperty(global, 'document', {
      value: mockDocument,
      writable: true,
    })

    act(() => {
      result.current.announceToScreenReader('Test message', 'assertive')
    })

    expect(mockDocument.createElement).toHaveBeenCalledWith('div')
    expect(mockLiveRegion.setAttribute).toHaveBeenCalledWith('aria-live', 'assertive')
    expect(mockDocument.body.appendChild).toHaveBeenCalledWith(mockLiveRegion)
  })

  it('updates existing live region', () => {
    const { result } = renderHook(() => useAccessibility(), { wrapper })

    const mockLiveRegion = {
      id: 'accessibility-live-region',
      getAttribute: jest.fn().mockReturnValue('polite'),
      setAttribute: jest.fn(),
      textContent: '',
    }

    const mockDocument = {
      getElementById: jest.fn().mockReturnValue(mockLiveRegion),
    }

    Object.defineProperty(global, 'document', {
      value: mockDocument,
      writable: true,
    })

    act(() => {
      result.current.announceToScreenReader('Test message', 'assertive')
    })

    expect(mockDocument.getElementById).toHaveBeenCalledWith('accessibility-live-region')
    expect(mockLiveRegion.setAttribute).toHaveBeenCalledWith('aria-live', 'assertive')
  })

  it('uses custom storage key', () => {
    const customWrapper = ({ children }: { children: React.ReactNode }) => (
      <AccessibilityProvider storageKey="custom-accessibility-key">{children}</AccessibilityProvider>
    )

    const { result } = renderHook(() => useAccessibility(), { wrapper: customWrapper })

    act(() => {
      result.current.updateSetting('highContrast', true)
    })

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'custom-accessibility-key',
      expect.any(String)
    )
  })

  it('applies CSS classes to document', () => {
    const mockDocumentElement = {
      classList: {
        add: jest.fn(),
        remove: jest.fn(),
      },
      setAttribute: jest.fn(),
    }

    Object.defineProperty(document, 'documentElement', {
      value: mockDocumentElement,
      writable: true,
    })

    const { result } = renderHook(() => useAccessibility(), { wrapper })

    act(() => {
      result.current.updateSetting('highContrast', true)
    })

    expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('high-contrast')

    act(() => {
      result.current.updateSetting('highContrast', false)
    })

    expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith('high-contrast')
  })

  it('sets focus ring attribute', () => {
    const mockDocumentElement = {
      classList: {
        add: jest.fn(),
        remove: jest.fn(),
      },
      setAttribute: jest.fn(),
    }

    Object.defineProperty(document, 'documentElement', {
      value: mockDocumentElement,
      writable: true,
    })

    const { result } = renderHook(() => useAccessibility(), { wrapper })

    act(() => {
      result.current.updateSetting('focusRing', 'enhanced')
    })

    expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith('data-focus-ring', 'enhanced')
  })

  it('throws error when used outside provider', () => {
    const originalError = console.error
    console.error = jest.fn()

    expect(() => {
      renderHook(() => useAccessibility())
    }).toThrow('useAccessibility must be used within an AccessibilityProvider')

    console.error = originalError
  })

  it('handles all settings types correctly', () => {
    const { result } = renderHook(() => useAccessibility(), { wrapper })

    // Test boolean settings
    act(() => {
      result.current.updateSetting('reducedMotion', true)
    })
    expect(result.current.settings.reducedMotion).toBe(true)

    act(() => {
      result.current.updateSetting('largeText', true)
    })
    expect(result.current.settings.largeText).toBe(true)

    act(() => {
      result.current.updateSetting('screenReaderMode', true)
    })
    expect(result.current.settings.screenReaderMode).toBe(true)

    act(() => {
      result.current.updateSetting('keyboardNavigation', false)
    })
    expect(result.current.settings.keyboardNavigation).toBe(false)

    // Test enum setting
    act(() => {
      result.current.updateSetting('focusRing', 'high-contrast')
    })
    expect(result.current.settings.focusRing).toBe('high-contrast')
  })

  it('merges saved settings with defaults correctly', () => {
    const partialSettings = {
      highContrast: true,
      focusRing: 'enhanced'
    }
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(partialSettings))
    
    const { result } = renderHook(() => useAccessibility(), { wrapper })

    expect(result.current.settings).toEqual({
      highContrast: true,
      reducedMotion: false,
      largeText: false,
      screenReaderMode: false,
      keyboardNavigation: true,
      focusRing: 'enhanced'
    })
  })
})