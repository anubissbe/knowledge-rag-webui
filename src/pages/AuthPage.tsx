import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Brain, ArrowLeft } from 'lucide-react'
import { LoginForm, RegisterForm } from '../components/auth'

type AuthMode = 'login' | 'register'

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login')
  const navigate = useNavigate()
  const location = useLocation()

  // Get the page user was trying to access before being redirected to login
  const returnTo = location.state?.from || '/'

  const handleAuthSuccess = () => {
    // Redirect to the page they were trying to access, or home
    navigate(returnTo, { replace: true })
  }

  const handleBackToHome = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Knowledge RAG
          </span>
        </div>
        
        <button
          onClick={handleBackToHome}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mode Toggle */}
          <div className="mb-8">
            <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setMode('login')}
                className={`
                  flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all
                  ${mode === 'login'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }
                `}
              >
                Sign In
              </button>
              <button
                onClick={() => setMode('register')}
                className={`
                  flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all
                  ${mode === 'register'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }
                `}
              >
                Create Account
              </button>
            </div>
          </div>

          {/* Auth Forms */}
          {mode === 'login' ? (
            <LoginForm
              onSuccess={handleAuthSuccess}
              onSwitchToRegister={() => setMode('register')}
            />
          ) : (
            <RegisterForm
              onSuccess={handleAuthSuccess}
              onSwitchToLogin={() => setMode('login')}
            />
          )}

          {/* Demo Account Notice */}
          <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              Demo Environment
            </h4>
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              This is a demonstration version. In production, you would integrate with your preferred authentication provider (Auth0, Firebase, etc.).
            </p>
            <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
              <strong>Demo credentials:</strong><br />
              Email: demo@knowledgerag.com<br />
              Password: demo123
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Knowledge RAG &copy; 2025. Secure memory management for the AI age.
        </p>
      </div>
    </div>
  )
}