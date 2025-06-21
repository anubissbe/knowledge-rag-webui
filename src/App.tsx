import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Memories from './pages/Memories';
import MemoryDetail from './pages/MemoryDetail';
import Search from './pages/Search';

function App() {
  return (
    <ThemeProvider>
      <Router>
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
      </Router>
    </ThemeProvider>
  );
}


export default App;