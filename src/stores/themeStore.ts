import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  getResolvedTheme: () => 'light' | 'dark'
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      
      setTheme: (theme: Theme) => {
        set({ theme })
        
        // Apply theme immediately
        const resolvedTheme = get().getResolvedTheme()
        const root = document.documentElement
        
        root.classList.remove('light', 'dark')
        root.classList.add(resolvedTheme)
        root.style.colorScheme = resolvedTheme
        
        // Update markdown editor theme
        root.setAttribute('data-color-mode', resolvedTheme)
      },
      
      getResolvedTheme: (): 'light' | 'dark' => {
        const { theme } = get()
        
        if (theme === 'system') {
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        }
        
        return theme
      }
    }),
    {
      name: 'knowledge-rag-theme',
      partialize: (state) => ({ theme: state.theme })
    }
  )
)

// Initialize theme on load
export const initializeTheme = () => {
  const store = useThemeStore.getState()
  const resolvedTheme = store.getResolvedTheme()
  
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(resolvedTheme)
  root.style.colorScheme = resolvedTheme
  root.setAttribute('data-color-mode', resolvedTheme)
}

// Listen for system theme changes
export const setupSystemThemeListener = () => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  
  const handleChange = () => {
    const store = useThemeStore.getState()
    
    if (store.theme === 'system') {
      const resolvedTheme = store.getResolvedTheme()
      const root = document.documentElement
      
      root.classList.remove('light', 'dark')
      root.classList.add(resolvedTheme)
      root.style.colorScheme = resolvedTheme
      root.setAttribute('data-color-mode', resolvedTheme)
    }
  }
  
  mediaQuery.addEventListener('change', handleChange)
  
  return () => mediaQuery.removeEventListener('change', handleChange)
}