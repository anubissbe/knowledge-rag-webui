import React from 'react'
import { HelpCircle, PlayCircle, RotateCcw, X } from 'lucide-react'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { Button } from '@/components/ui/Button'

interface OnboardingTriggerProps {
  variant?: 'button' | 'help' | 'menu-item'
  className?: string
}

export const OnboardingTrigger: React.FC<OnboardingTriggerProps> = ({
  variant = 'button',
  className
}) => {
  const { startOnboarding } = useOnboarding()

  if (variant === 'help') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={startOnboarding}
        className={className}
        aria-label="Start tutorial"
        title="Take a tour of the features"
      >
        <HelpCircle className="h-5 w-5" />
      </Button>
    )
  }

  if (variant === 'menu-item') {
    return (
      <button
        onClick={startOnboarding}
        className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted transition-colors ${className}`}
      >
        <PlayCircle className="h-4 w-4" />
        <span>Take Tutorial</span>
      </button>
    )
  }

  return (
    <Button
      onClick={startOnboarding}
      variant="outline"
      className={`flex items-center gap-2 ${className}`}
    >
      <RotateCcw className="h-4 w-4" />
      Restart Tutorial
    </Button>
  )
}

export const OnboardingWelcomeCard: React.FC = () => {
  const { startOnboarding } = useOnboarding()

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
          <PlayCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Welcome to Knowledge RAG! 🎉
          </h3>
          <p className="text-blue-700 dark:text-blue-300 mb-4 text-sm">
            Get started with a quick tour of the main features. It only takes 2 minutes and will help you make the most of your knowledge management system.
          </p>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={startOnboarding}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              Start Tour
            </Button>
            
            <button
              onClick={() => {
                localStorage.setItem('knowledge-rag-onboarding', 'skipped')
                const card = document.querySelector('[data-onboarding-welcome]')
                card?.remove()
              }}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Skip for now
            </button>
          </div>
        </div>
        
        <button
          onClick={() => {
            localStorage.setItem('knowledge-rag-onboarding', 'skipped')
            const card = document.querySelector('[data-onboarding-welcome]')
            card?.remove()
          }}
          className="text-blue-400 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-300"
          aria-label="Dismiss welcome card"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

// Hook to check if user should see onboarding
export const useOnboardingStatus = () => {
  const hasCompletedOnboarding = localStorage.getItem('knowledge-rag-onboarding')
  const shouldShowWelcome = !hasCompletedOnboarding
  
  return {
    hasCompletedOnboarding: !!hasCompletedOnboarding,
    shouldShowWelcome,
    hasSkippedOnboarding: hasCompletedOnboarding === 'skipped'
  }
}