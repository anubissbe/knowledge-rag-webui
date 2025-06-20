import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { Notification } from '../types'

interface UIState {
  // Layout
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  headerHeight: number
  
  // View states
  currentView: 'grid' | 'list'
  viewMode: 'comfortable' | 'compact' | 'cozy'
  
  // Loading states
  globalLoading: boolean
  loadingStates: { [key: string]: boolean }
  
  // Modals and dialogs
  modals: { [key: string]: boolean }
  dialogs: { [key: string]: any }
  
  // Notifications
  notifications: Notification[]
  
  // Search UI
  searchFocused: boolean
  searchExpanded: boolean
  
  // Memory editor
  editorMode: 'edit' | 'preview' | 'split'
  editorFullscreen: boolean
  
  // Selection
  selectionMode: boolean
  
  // Keyboard shortcuts
  shortcutsEnabled: boolean
  
  // Actions - Layout
  setSidebarOpen: (open: boolean) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  setHeaderHeight: (height: number) => void
  
  // Actions - View
  setCurrentView: (view: 'grid' | 'list') => void
  setViewMode: (mode: 'comfortable' | 'compact' | 'cozy') => void
  
  // Actions - Loading
  setGlobalLoading: (loading: boolean) => void
  setLoadingState: (key: string, loading: boolean) => void
  clearLoadingState: (key: string) => void
  
  // Actions - Modals
  openModal: (key: string) => void
  closeModal: (key: string) => void
  toggleModal: (key: string) => void
  setDialog: (key: string, data: any) => void
  closeDialog: (key: string) => void
  
  // Actions - Notifications
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  
  // Actions - Search
  setSearchFocused: (focused: boolean) => void
  setSearchExpanded: (expanded: boolean) => void
  
  // Actions - Editor
  setEditorMode: (mode: 'edit' | 'preview' | 'split') => void
  setEditorFullscreen: (fullscreen: boolean) => void
  
  // Actions - Selection
  setSelectionMode: (enabled: boolean) => void
  
  // Actions - Shortcuts
  setShortcutsEnabled: (enabled: boolean) => void
  
  // Utility actions
  reset: () => void
}

const initialState = {
  sidebarOpen: true,
  sidebarCollapsed: false,
  headerHeight: 64,
  currentView: 'grid' as const,
  viewMode: 'comfortable' as const,
  globalLoading: false,
  loadingStates: {},
  modals: {},
  dialogs: {},
  notifications: [],
  searchFocused: false,
  searchExpanded: false,
  editorMode: 'edit' as const,
  editorFullscreen: false,
  selectionMode: false,
  shortcutsEnabled: true,
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Layout actions
        setSidebarOpen: (open: boolean) => {
          set({ sidebarOpen: open })
        },

        setSidebarCollapsed: (collapsed: boolean) => {
          set({ sidebarCollapsed: collapsed })
        },

        toggleSidebar: () => {
          set(state => ({ sidebarOpen: !state.sidebarOpen }))
        },

        setHeaderHeight: (height: number) => {
          set({ headerHeight: height })
        },

        // View actions
        setCurrentView: (view: 'grid' | 'list') => {
          set({ currentView: view })
        },

        setViewMode: (mode: 'comfortable' | 'compact' | 'cozy') => {
          set({ viewMode: mode })
        },

        // Loading actions
        setGlobalLoading: (loading: boolean) => {
          set({ globalLoading: loading })
        },

        setLoadingState: (key: string, loading: boolean) => {
          set(state => ({
            loadingStates: {
              ...state.loadingStates,
              [key]: loading,
            }
          }))
        },

        clearLoadingState: (key: string) => {
          set(state => {
            const { [key]: _, ...rest } = state.loadingStates
            return { loadingStates: rest }
          })
        },

        // Modal actions
        openModal: (key: string) => {
          set(state => ({
            modals: { ...state.modals, [key]: true }
          }))
        },

        closeModal: (key: string) => {
          set(state => ({
            modals: { ...state.modals, [key]: false }
          }))
        },

        toggleModal: (key: string) => {
          set(state => ({
            modals: { ...state.modals, [key]: !state.modals[key] }
          }))
        },

        setDialog: (key: string, data: any) => {
          set(state => ({
            dialogs: { ...state.dialogs, [key]: data }
          }))
        },

        closeDialog: (key: string) => {
          set(state => {
            const { [key]: _, ...rest } = state.dialogs
            return { dialogs: rest }
          })
        },

        // Notification actions
        addNotification: (notification: Omit<Notification, 'id'>) => {
          const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
          const newNotification: Notification = {
            ...notification,
            id,
            duration: notification.duration || 5000,
          }

          set(state => ({
            notifications: [...state.notifications, newNotification]
          }))

          // Auto-remove notification after duration
          if (newNotification.duration && newNotification.duration > 0) {
            setTimeout(() => {
              get().removeNotification(id)
            }, newNotification.duration)
          }
        },

        removeNotification: (id: string) => {
          set(state => ({
            notifications: state.notifications.filter(n => n.id !== id)
          }))
        },

        clearNotifications: () => {
          set({ notifications: [] })
        },

        // Search actions
        setSearchFocused: (focused: boolean) => {
          set({ searchFocused: focused })
        },

        setSearchExpanded: (expanded: boolean) => {
          set({ searchExpanded: expanded })
        },

        // Editor actions
        setEditorMode: (mode: 'edit' | 'preview' | 'split') => {
          set({ editorMode: mode })
        },

        setEditorFullscreen: (fullscreen: boolean) => {
          set({ editorFullscreen: fullscreen })
        },

        // Selection actions
        setSelectionMode: (enabled: boolean) => {
          set({ selectionMode: enabled })
        },

        // Shortcuts actions
        setShortcutsEnabled: (enabled: boolean) => {
          set({ shortcutsEnabled: enabled })
        },

        // Utility
        reset: () => {
          set(initialState)
        },
      }),
      {
        name: 'ui-store',
        partialize: (state) => ({
          sidebarOpen: state.sidebarOpen,
          sidebarCollapsed: state.sidebarCollapsed,
          currentView: state.currentView,
          viewMode: state.viewMode,
          editorMode: state.editorMode,
          shortcutsEnabled: state.shortcutsEnabled,
        }),
      }
    ),
    { name: 'UIStore' }
  )
)