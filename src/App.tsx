import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { lazy } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import { AccessibilityProvider } from './contexts/AccessibilityContext'
import { OnboardingProvider } from './contexts/OnboardingContext'
import { OnboardingOverlay } from './components/onboarding/OnboardingOverlay'
import { SkipToMain, KeyboardNavHelper } from './components/accessibility/AccessibilityComponents'
import { LazyLoadWrapper, LazyLoadErrorBoundary } from './components/performance/LazyLoadWrapper'
import { Layout } from './components/layout/Layout'
import { ProtectedRoute } from './components/auth'
import { HomePage } from './pages/HomePage'
import { AuthPage } from './pages/AuthPage'
import { WebSocketProvider } from './components/providers/WebSocketProvider'

// Lazy loaded components for code splitting
const MemoriesPage = lazy(() => import('./pages/MemoriesPage').then(module => ({ default: module.MemoriesPage })))
const MemoryEditorPage = lazy(() => import('./pages/MemoryEditorPage').then(module => ({ default: module.MemoryEditorPage })))
const MemoryDetailPage = lazy(() => import('./pages/MemoryDetailPage').then(module => ({ default: module.MemoryDetailPage })))
const SearchPage = lazy(() => import('./pages/SearchPage').then(module => ({ default: module.SearchPage })))
const CollectionsPage = lazy(() => import('./pages/CollectionsPage').then(module => ({ default: module.CollectionsPage })))
const GraphPage = lazy(() => import('./pages/GraphPage').then(module => ({ default: module.GraphPage })))
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(module => ({ default: module.SettingsPage })))
const ImportExportPage = lazy(() => import('./pages/ImportExportPage').then(module => ({ default: module.default })))
const TestMCPPage = lazy(() => import('./pages/TestMCP').then(module => ({ default: module.TestMCPPage })))
const TestWebSocketPage = lazy(() => import('./pages/TestWebSocket').then(module => ({ default: module.TestWebSocketPage })))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then(module => ({ default: module.AnalyticsPage })))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (was cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
    },
    mutations: {
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AccessibilityProvider>
          <OnboardingProvider>
            <WebSocketProvider>
              <BrowserRouter>
                <SkipToMain />
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/auth/login" 
            element={
              <ProtectedRoute requireAuth={false}>
                <AuthPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/memories" 
            element={
              <ProtectedRoute>
                <Layout>
                  <LazyLoadErrorBoundary>
                    <LazyLoadWrapper>
                      <MemoriesPage />
                    </LazyLoadWrapper>
                  </LazyLoadErrorBoundary>
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/search" 
            element={
              <ProtectedRoute>
                <Layout>
                  <LazyLoadErrorBoundary>
                    <LazyLoadWrapper>
                      <SearchPage />
                    </LazyLoadWrapper>
                  </LazyLoadErrorBoundary>
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/collections" 
            element={
              <ProtectedRoute>
                <Layout>
                  <LazyLoadErrorBoundary>
                    <LazyLoadWrapper>
                      <CollectionsPage />
                    </LazyLoadWrapper>
                  </LazyLoadErrorBoundary>
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/graph" 
            element={
              <ProtectedRoute>
                <Layout>
                  <LazyLoadErrorBoundary>
                    <LazyLoadWrapper>
                      <GraphPage />
                    </LazyLoadWrapper>
                  </LazyLoadErrorBoundary>
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <Layout>
                  <LazyLoadErrorBoundary>
                    <LazyLoadWrapper>
                      <AnalyticsPage />
                    </LazyLoadWrapper>
                  </LazyLoadErrorBoundary>
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/import-export" 
            element={
              <ProtectedRoute>
                <Layout>
                  <LazyLoadErrorBoundary>
                    <LazyLoadWrapper>
                      <ImportExportPage />
                    </LazyLoadWrapper>
                  </LazyLoadErrorBoundary>
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Layout>
                  <LazyLoadErrorBoundary>
                    <LazyLoadWrapper>
                      <SettingsPage />
                    </LazyLoadWrapper>
                  </LazyLoadErrorBoundary>
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/memories/new" 
            element={
              <ProtectedRoute>
                <Layout>
                  <LazyLoadErrorBoundary>
                    <LazyLoadWrapper>
                      <MemoryEditorPage />
                    </LazyLoadWrapper>
                  </LazyLoadErrorBoundary>
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/memories/:id" 
            element={
              <ProtectedRoute>
                <Layout>
                  <LazyLoadErrorBoundary>
                    <LazyLoadWrapper>
                      <MemoryDetailPage />
                    </LazyLoadWrapper>
                  </LazyLoadErrorBoundary>
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/memories/:id/edit" 
            element={
              <ProtectedRoute>
                <Layout>
                  <LazyLoadErrorBoundary>
                    <LazyLoadWrapper>
                      <MemoryEditorPage />
                    </LazyLoadWrapper>
                  </LazyLoadErrorBoundary>
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/test-mcp" 
            element={
              <ProtectedRoute>
                <LazyLoadErrorBoundary>
                  <LazyLoadWrapper>
                    <TestMCPPage />
                  </LazyLoadWrapper>
                </LazyLoadErrorBoundary>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/test-websocket" 
            element={
              <ProtectedRoute>
                <Layout>
                  <LazyLoadErrorBoundary>
                    <LazyLoadWrapper>
                      <TestWebSocketPage />
                    </LazyLoadWrapper>
                  </LazyLoadErrorBoundary>
                </Layout>
              </ProtectedRoute>
            } 
          />
        </Routes>
                <OnboardingOverlay />
                <KeyboardNavHelper />
              </BrowserRouter>
            </WebSocketProvider>
          </OnboardingProvider>
        </AccessibilityProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App