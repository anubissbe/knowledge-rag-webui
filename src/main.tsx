import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializeTheme, setupSystemThemeListener } from './stores/themeStore'

// Initialize theme before rendering
initializeTheme()
setupSystemThemeListener()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
