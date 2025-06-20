import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { User, LoginCredentials, RegisterData } from '../types'
import { authApi, userApi } from '../services/api/client'

interface AuthState {
  // State
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  
  // Login/Register
  login: (credentials: LoginCredentials) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => Promise<void>
  
  // Token management
  refreshToken: () => Promise<void>
  verifyToken: () => Promise<boolean>
  
  // User profile
  updateProfile: (profile: Partial<User>) => Promise<void>
  updatePreferences: (preferences: any) => Promise<void>
  
  // State management
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
  
  // Auto-login check
  initialize: () => Promise<void>
}

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        login: async (credentials: LoginCredentials) => {
          set({ loading: true, error: null })
          try {
            const response = await authApi.login(credentials)
            const { token, user } = response
            
            // Store token in localStorage
            localStorage.setItem('auth-token', token)
            
            set({
              user,
              token,
              isAuthenticated: true,
              loading: false,
              error: null,
            })
          } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Login failed'
            set({
              error: errorMessage,
              loading: false,
              isAuthenticated: false,
            })
            throw new Error(errorMessage)
          }
        },

        register: async (userData: RegisterData) => {
          set({ loading: true, error: null })
          try {
            const response = await authApi.register(userData)
            const { token, user } = response
            
            // Store token in localStorage
            localStorage.setItem('auth-token', token)
            
            set({
              user,
              token,
              isAuthenticated: true,
              loading: false,
              error: null,
            })
          } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Registration failed'
            set({
              error: errorMessage,
              loading: false,
              isAuthenticated: false,
            })
            throw new Error(errorMessage)
          }
        },

        logout: async () => {
          set({ loading: true })
          try {
            await authApi.logout()
          } catch (error) {
            // Continue with logout even if API call fails
            console.warn('Logout API call failed:', error)
          } finally {
            // Always clear local state
            localStorage.removeItem('auth-token')
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              loading: false,
              error: null,
            })
          }
        },

        refreshToken: async () => {
          try {
            const response = await authApi.refreshToken()
            const { token } = response
            
            localStorage.setItem('auth-token', token)
            set({ token })
          } catch (error: any) {
            // If refresh fails, logout the user
            await get().logout()
            throw error
          }
        },

        verifyToken: async (): Promise<boolean> => {
          const { token } = get()
          if (!token) return false

          try {
            const response = await authApi.verifyToken()
            if (response.valid && response.user) {
              set({
                user: response.user,
                isAuthenticated: true,
              })
              return true
            } else {
              await get().logout()
              return false
            }
          } catch (error) {
            await get().logout()
            return false
          }
        },

        updateProfile: async (profileData: Partial<User>) => {
          set({ loading: true, error: null })
          try {
            const updatedUser = await userApi.updateProfile(profileData)
            set({
              user: updatedUser,
              loading: false,
            })
          } catch (error: any) {
            set({
              error: error.response?.data?.message || error.message || 'Failed to update profile',
              loading: false,
            })
            throw error
          }
        },

        updatePreferences: async (preferences: any) => {
          set({ loading: true, error: null })
          try {
            const updatedPreferences = await userApi.updatePreferences(preferences)
            set(state => ({
              user: state.user ? {
                ...state.user,
                preferences: updatedPreferences
              } : null,
              loading: false,
            }))
          } catch (error: any) {
            set({
              error: error.response?.data?.message || error.message || 'Failed to update preferences',
              loading: false,
            })
            throw error
          }
        },

        setUser: (user: User | null) => {
          set({
            user,
            isAuthenticated: !!user,
          })
        },

        setToken: (token: string | null) => {
          set({ token })
          if (token) {
            localStorage.setItem('auth-token', token)
          } else {
            localStorage.removeItem('auth-token')
          }
        },

        setLoading: (loading: boolean) => set({ loading }),

        setError: (error: string | null) => set({ error }),

        reset: () => {
          localStorage.removeItem('auth-token')
          set(initialState)
        },

        initialize: async () => {
          const token = localStorage.getItem('auth-token')
          if (token) {
            set({ token })
            try {
              await get().verifyToken()
            } catch (error) {
              // Token is invalid, clear it
              await get().logout()
            }
          }
        },
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({
          token: state.token,
          user: state.user,
        }),
      }
    ),
    { name: 'AuthStore' }
  )
)