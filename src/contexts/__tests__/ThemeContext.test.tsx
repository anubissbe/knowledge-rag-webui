import { renderHook, act } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../ThemeContext'

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
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: query === '(prefers-color-scheme: dark)',
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
)

describe('ThemeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    document.documentElement.className = ''
    document.documentElement.style.colorScheme = ''
  })

  it('provides theme context values', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.theme).toBeDefined()
    expect(result.current.resolvedTheme).toBeDefined()
    expect(result.current.setTheme).toBeDefined()
    expect(result.current.toggleTheme).toBeDefined()
  })

  it('initializes with system theme by default', () => {
    mockLocalStorage.getItem.mockReturnValue(null)
    
    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.theme).toBe('dark') // Based on our matchMedia mock
    expect(result.current.resolvedTheme).toBe('dark')
  })

  it('loads theme from localStorage if available', () => {
    mockLocalStorage.getItem.mockReturnValue('light')
    
    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.theme).toBe('light')
    expect(result.current.resolvedTheme).toBe('light')
  })

  it('sets theme and persists to localStorage', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })

    act(() => {
      result.current.setTheme('dark')
    })

    expect(result.current.theme).toBe('dark')
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('knowledge-rag-theme', 'dark')
  })

  it('toggles between light and dark themes', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })

    // Start with light theme
    act(() => {
      result.current.setTheme('light')
    })

    expect(result.current.theme).toBe('light')

    // Toggle to dark
    act(() => {
      result.current.toggleTheme()
    })

    expect(result.current.theme).toBe('dark')

    // Toggle back to light
    act(() => {
      result.current.toggleTheme()
    })

    expect(result.current.theme).toBe('light')
  })

  it('handles system theme toggle correctly', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })

    // Start with system theme
    act(() => {
      result.current.setTheme('system')
    })

    expect(result.current.theme).toBe('system')

    // Toggle should switch to light
    act(() => {
      result.current.toggleTheme()
    })

    expect(result.current.theme).toBe('light')
  })

  it('applies CSS classes to document element', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })

    act(() => {
      result.current.setTheme('dark')
    })

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.style.colorScheme).toBe('dark')

    act(() => {
      result.current.setTheme('light')
    })

    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(document.documentElement.style.colorScheme).toBe('light')
  })

  it('resolves system theme correctly', () => {
    // Mock system prefers dark
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }))

    const { result } = renderHook(() => useTheme(), { wrapper })

    act(() => {
      result.current.setTheme('system')
    })

    expect(result.current.theme).toBe('system')
    expect(result.current.resolvedTheme).toBe('dark')

    // Mock system prefers light
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query !== '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }))

    // Re-render to trigger system theme check
    act(() => {
      result.current.setTheme('system')
    })

    expect(result.current.resolvedTheme).toBe('light')
  })

  it('throws error when used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error
    console.error = jest.fn()

    expect(() => {
      renderHook(() => useTheme())
    }).toThrow('useTheme must be used within a ThemeProvider')

    console.error = originalError
  })

  it('uses custom storage key', () => {
    const customWrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider storageKey="custom-theme-key">{children}</ThemeProvider>
    )

    const { result } = renderHook(() => useTheme(), { wrapper: customWrapper })

    act(() => {
      result.current.setTheme('dark')
    })

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('custom-theme-key', 'dark')
  })

  it('uses custom default theme', () => {
    mockLocalStorage.getItem.mockReturnValue(null)

    const customWrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider defaultTheme="dark">{children}</ThemeProvider>
    )

    const { result } = renderHook(() => useTheme(), { wrapper: customWrapper })

    expect(result.current.theme).toBe('dark')
  })
})