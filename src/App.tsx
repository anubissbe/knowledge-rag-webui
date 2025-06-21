import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import Settings from './pages/Settings';
import Memories from './pages/Memories';
import MemoryDetail from './pages/MemoryDetail';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <main id="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/memories" element={<Memories />} />
              <Route path="/memories/:id" element={<MemoryDetail />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

// Temporary home page
function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Knowledge RAG WebUI
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        A modern web interface for your Knowledge RAG System inspired by Mem0
      </p>
      <div className="flex gap-4">
        <Link
          to="/memories"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg
                   hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                   transition-colors duration-200"
        >
          View Memories
        </Link>
        <Link
          to="/settings"
          className="inline-block px-6 py-3 bg-gray-600 text-white font-medium rounded-lg
                   hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
                   transition-colors duration-200"
        >
          Settings
        </Link>
      </div>
    </div>
  );
}

export default App;