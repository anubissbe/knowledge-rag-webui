import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from './components/layout/Layout'
import { ProtectedRoute } from './components/auth'
import { HomePage } from './pages/HomePage'
import { MemoriesPage } from './pages/MemoriesPage'
import { MemoryEditorPage } from './pages/MemoryEditorPage'
import { MemoryDetailPage } from './pages/MemoryDetailPage'
import { SearchPage } from './pages/SearchPage'
import { AuthPage } from './pages/AuthPage'
import { CollectionsPage } from './pages/CollectionsPage'
import { GraphPage } from './pages/GraphPage'
import { TestMCPPage } from './pages/TestMCP'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
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
                  <MemoriesPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/search" 
            element={
              <ProtectedRoute>
                <Layout>
                  <SearchPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/collections" 
            element={
              <ProtectedRoute>
                <Layout>
                  <CollectionsPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/graph" 
            element={
              <ProtectedRoute>
                <Layout>
                  <GraphPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <Layout>
                  <div>Analytics Page (Coming Soon)</div>
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Layout>
                  <div>Settings Page (Coming Soon)</div>
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/memories/new" 
            element={
              <ProtectedRoute>
                <Layout>
                  <MemoryEditorPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/memories/:id" 
            element={
              <ProtectedRoute>
                <Layout>
                  <MemoryDetailPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/memories/:id/edit" 
            element={
              <ProtectedRoute>
                <Layout>
                  <MemoryEditorPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/test-mcp" 
            element={
              <ProtectedRoute>
                <TestMCPPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App