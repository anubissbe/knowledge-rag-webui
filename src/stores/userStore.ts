import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { UserPreferences } from '../types'
import { userApi } from '../services/api/client'

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
  permissions: string[];
}

interface UserState {
  // User preferences
  preferences: UserPreferences
  
  // API Keys
  apiKeys: ApiKey[]
  createApiKey: (apiKey: ApiKey) => void
  deleteApiKey: (keyId: string) => void
  
  // Actions
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>
  
  // Theme
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  
  // UI preferences
  defaultView: 'grid' | 'list'
  setDefaultView: (view: 'grid' | 'list') => void
  
  compactMode: boolean
  setCompactMode: (compact: boolean) => void
  
  showPreview: boolean
  setShowPreview: (show: boolean) => void
  
  keyboardShortcuts: boolean
  setKeyboardShortcuts: (enabled: boolean) => void
  
  autoSave: boolean
  setAutoSave: (enabled: boolean) => void
  
  resultsPerPage: number
  setResultsPerPage: (count: number) => void
  
  defaultSearchType: 'hybrid' | 'vector' | 'fulltext'
  setDefaultSearchType: (type: 'hybrid' | 'vector' | 'fulltext') => void
  
  // State management
  loading: boolean
  error: string | null
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Sync with server
  syncPreferences: () => Promise<void>
  loadPreferences: () => Promise<void>
  
  // Reset
  reset: () => void
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  defaultSearchType: 'hybrid',
  keyboardShortcuts: true,
  autoSave: true,
  resultsPerPage: 20,
  defaultView: 'grid',
  showPreview: true,
  compactMode: false,
}

const initialState = {
  preferences: defaultPreferences,
  apiKeys: [] as ApiKey[],
  theme: 'system' as const,
  defaultSearchType: 'hybrid' as const,
  keyboardShortcuts: true,
  autoSave: true,
  resultsPerPage: 20,
  defaultView: 'grid' as const,
  showPreview: true,
  compactMode: false,
  loading: false,
  error: null,
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        createApiKey: (apiKey: ApiKey) => {
          set(state => ({
            apiKeys: [...state.apiKeys, apiKey]
          }))
        },

        deleteApiKey: (keyId: string) => {
          set(state => ({
            apiKeys: state.apiKeys.filter(key => key.id !== keyId)
          }))
        },

        updatePreferences: async (newPreferences: Partial<UserPreferences>) => {
          set({ loading: true, error: null })
          try {
            const updatedPreferences = { ...get().preferences, ...newPreferences }
            
            // Update server
            await userApi.updatePreferences(updatedPreferences)
            
            // Update local state
            set({
              preferences: updatedPreferences,
              ...updatedPreferences, // Spread individual properties for easy access
              loading: false,
            })
          } catch (error: any) {
            set({
              error: error.response?.data?.message || error.message || 'Failed to update preferences',
              loading: false,
            })
            throw error
          }
        },

        setTheme: (theme: 'light' | 'dark' | 'system') => {
          set(state => ({
            theme,
            preferences: { ...state.preferences, theme },
          }))
          // Sync with server in background
          get().syncPreferences().catch(console.error)
        },

        setDefaultView: (view: 'grid' | 'list') => {
          set(state => ({
            defaultView: view,
            preferences: { ...state.preferences, defaultView: view },
          }))
          get().syncPreferences().catch(console.error)
        },

        setCompactMode: (compact: boolean) => {
          set(state => ({
            compactMode: compact,
            preferences: { ...state.preferences, compactMode: compact },
          }))
          get().syncPreferences().catch(console.error)
        },

        setShowPreview: (show: boolean) => {
          set(state => ({
            showPreview: show,
            preferences: { ...state.preferences, showPreview: show },
          }))
          get().syncPreferences().catch(console.error)
        },

        setKeyboardShortcuts: (enabled: boolean) => {
          set(state => ({
            keyboardShortcuts: enabled,
            preferences: { ...state.preferences, keyboardShortcuts: enabled },
          }))
          get().syncPreferences().catch(console.error)
        },

        setAutoSave: (enabled: boolean) => {
          set(state => ({
            autoSave: enabled,
            preferences: { ...state.preferences, autoSave: enabled },
          }))
          get().syncPreferences().catch(console.error)
        },

        setResultsPerPage: (count: number) => {
          set(state => ({
            resultsPerPage: count,
            preferences: { ...state.preferences, resultsPerPage: count },
          }))
          get().syncPreferences().catch(console.error)
        },

        setDefaultSearchType: (type: 'hybrid' | 'vector' | 'fulltext') => {
          set(state => ({
            defaultSearchType: type,
            preferences: { ...state.preferences, defaultSearchType: type },
          }))
          get().syncPreferences().catch(console.error)
        },

        syncPreferences: async () => {
          try {
            const { preferences } = get()
            await userApi.updatePreferences(preferences)
          } catch (error) {
            // Silently fail for background sync
            console.error('Failed to sync preferences:', error)
          }
        },

        loadPreferences: async () => {
          set({ loading: true, error: null })
          try {
            const serverPreferences = await userApi.getPreferences()
            const mergedPreferences = { ...defaultPreferences, ...serverPreferences }
            
            set({
              preferences: mergedPreferences,
              ...mergedPreferences, // Spread for easy access
              loading: false,
            })
          } catch (error: any) {
            // If loading fails, use local preferences
            set({
              error: error.response?.data?.message || error.message || 'Failed to load preferences',
              loading: false,
            })
          }
        },

        setLoading: (loading: boolean) => set({ loading }),

        setError: (error: string | null) => set({ error }),

        reset: () => {
          set(initialState)
        },
      }),
      {
        name: 'user-store',
        partialize: (state) => ({
          preferences: state.preferences,
          theme: state.theme,
          defaultSearchType: state.defaultSearchType,
          keyboardShortcuts: state.keyboardShortcuts,
          autoSave: state.autoSave,
          resultsPerPage: state.resultsPerPage,
          defaultView: state.defaultView,
          showPreview: state.showPreview,
          compactMode: state.compactMode,
        }),
      }
    ),
    { name: 'UserStore' }
  )
)