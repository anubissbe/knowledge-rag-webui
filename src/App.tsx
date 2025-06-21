import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import Layout from './components/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useGlobalKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useKeyboardShortcutsModal } from './hooks/useKeyboardShortcutsModal';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import OfflineIndicator from './components/OfflineIndicator';
import RealtimeNotification from './components/RealtimeNotification';
import ToastNotification from './components/ToastNotification';
import LoadingSpinner from './components/LoadingSpinner';
import { initializeSentry } from './services/sentry';

// Lazy load page components for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));
const Memories = lazy(() => import('./pages/Memories'));
const MemoryDetail = lazy(() => import('./pages/MemoryDetail'));
const MemoryCreate = lazy(() => import('./pages/MemoryCreate'));
const Search = lazy(() => import('./pages/Search'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

// Lazy load modal components that are conditionally rendered
const KeyboardShortcutsModal = lazy(() => import('./components/KeyboardShortcutsModal'));

function AppContent() {
  const globalShortcuts = useGlobalKeyboardShortcuts();
  const { isOpen, close } = useKeyboardShortcutsModal();

  return (
    <>
      <Layout>
        <main id="main-content">
          <Suspense fallback={<LoadingSpinner size="lg" message="Loading page..." />}>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes */}
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/memories" element={<ProtectedRoute><Memories /></ProtectedRoute>} />
              <Route path="/memories/new" element={<ProtectedRoute><MemoryCreate /></ProtectedRoute>} />
              <Route path="/memories/:id" element={<ProtectedRoute><MemoryDetail /></ProtectedRoute>} />
              <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            </Routes>
          </Suspense>
        </main>
      </Layout>
      {isOpen && (
        <Suspense fallback={<div />}>
          <KeyboardShortcutsModal
            isOpen={isOpen}
            onClose={close}
            shortcuts={{ global: globalShortcuts }}
          />
        </Suspense>
      )}
      <PWAInstallPrompt />
      <OfflineIndicator />
      <RealtimeNotification />
      <ToastNotification />
    </>
  );
}

function App() {
  // Initialize Sentry on app start
  useEffect(() => {
    initializeSentry();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <WebSocketProvider>
            <Router>
              <ErrorBoundary>
                <AppContent />
              </ErrorBoundary>
            </Router>
          </WebSocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}


export default App;