import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Memories from './pages/Memories';
import MemoryDetail from './pages/MemoryDetail';
import Search from './pages/Search';
import { useGlobalKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import { useKeyboardShortcutsModal } from './hooks/useKeyboardShortcutsModal';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import OfflineIndicator from './components/OfflineIndicator';
import RealtimeNotification from './components/RealtimeNotification';
import ToastNotification from './components/ToastNotification';

function AppContent() {
  const globalShortcuts = useGlobalKeyboardShortcuts();
  const { isOpen, close } = useKeyboardShortcutsModal();

  return (
    <>
      <Layout>
        <main id="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/memories" element={<Memories />} />
            <Route path="/memories/:id" element={<MemoryDetail />} />
            <Route path="/search" element={<Search />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </Layout>
      <KeyboardShortcutsModal
        isOpen={isOpen}
        onClose={close}
        shortcuts={{ global: globalShortcuts }}
      />
      <PWAInstallPrompt />
      <OfflineIndicator />
      <RealtimeNotification />
      <ToastNotification />
    </>
  );
}

function App() {
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