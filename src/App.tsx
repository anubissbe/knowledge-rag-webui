import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import Layout from './components/Layout';
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
              <Route path="/" element={<Dashboard />} />
              <Route path="/memories" element={<Memories />} />
              <Route path="/memories/new" element={<MemoryCreate />} />
              <Route path="/memories/:id" element={<MemoryDetail />} />
              <Route path="/search" element={<Search />} />
              <Route path="/settings" element={<Settings />} />
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
        <WebSocketProvider>
          <Router>
            <ErrorBoundary>
              <AppContent />
            </ErrorBoundary>
          </Router>
        </WebSocketProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}


export default App;