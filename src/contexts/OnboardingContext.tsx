import React, { createContext, useContext, useState, useEffect } from 'react'

export interface OnboardingStep {
  id: string
  title: string
  description: string
  target?: string // CSS selector for highlighted element
  content: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  position?: 'top' | 'bottom' | 'left' | 'right'
  allowSkip?: boolean
}

interface OnboardingContextType {
  isOnboarding: boolean
  currentStep: number
  totalSteps: number
  currentStepData: OnboardingStep | null
  startOnboarding: () => void
  nextStep: () => void
  previousStep: () => void
  skipStep: () => void
  completeOnboarding: () => void
  setCustomSteps: (steps: OnboardingStep[]) => void
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export const useOnboarding = () => {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}

interface OnboardingProviderProps {
  children: React.ReactNode
  storageKey?: string
}

const DEFAULT_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Knowledge RAG!',
    description: 'Let\'s take a quick tour to get you started',
    content: (
      <div className="space-y-4">
        <p>Welcome! This tour will show you the main features of your knowledge management system.</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>⏱️</span>
          <span>Takes about 2 minutes</span>
        </div>
      </div>
    ),
    allowSkip: true
  },
  {
    id: 'create-memory',
    title: 'Create Your First Memory',
    description: 'Learn how to store and organize your knowledge',
    target: '[data-testid="create-memory-button"]',
    content: (
      <div className="space-y-3">
        <p>Click this button to create a new memory. Memories are the core of your knowledge base.</p>
        <div className="bg-muted/50 p-3 rounded-lg">
          <p className="text-sm">💡 <strong>Tip:</strong> You can use markdown formatting in your memories!</p>
        </div>
      </div>
    ),
    position: 'bottom'
  },
  {
    id: 'search-feature',
    title: 'Powerful Search',
    description: 'Find anything instantly with hybrid search',
    target: 'header input[placeholder*="Search"]',
    content: (
      <div className="space-y-3">
        <p>Use this search bar to find memories instantly. We use hybrid search combining:</p>
        <ul className="text-sm space-y-1 ml-4">
          <li>• Vector similarity search</li>
          <li>• Full-text search</li>
          <li>• Entity-based search</li>
        </ul>
        <p className="text-sm text-muted-foreground">Try searching for concepts, not just exact words!</p>
      </div>
    ),
    position: 'bottom'
  },
  {
    id: 'collections',
    title: 'Organize with Collections',
    description: 'Group related memories together',
    target: '[data-testid="collections-nav-link"]',
    content: (
      <div className="space-y-3">
        <p>Collections help you organize memories by topic, project, or any category you choose.</p>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            📚 Examples: "Work Projects", "Learning Notes", "Ideas"
          </p>
        </div>
      </div>
    ),
    position: 'right'
  },
  {
    id: 'knowledge-graph',
    title: 'Visualize Connections',
    description: 'See how your knowledge is interconnected',
    target: '[data-testid="graph-nav-link"]',
    content: (
      <div className="space-y-3">
        <p>The knowledge graph shows relationships between your memories and entities.</p>
        <p className="text-sm text-muted-foreground">
          As you add more memories, you'll see patterns and connections emerge automatically.
        </p>
      </div>
    ),
    position: 'right'
  },
  {
    id: 'theme-settings',
    title: 'Customize Your Experience',
    description: 'Personalize the interface to your liking',
    target: 'header button[aria-label*="theme"]',
    content: (
      <div className="space-y-3">
        <p>Toggle between light and dark themes, or let the system choose automatically.</p>
        <p className="text-sm text-muted-foreground">
          Find more customization options in Settings.
        </p>
      </div>
    ),
    position: 'bottom'
  },
  {
    id: 'completion',
    title: 'You\'re All Set!',
    description: 'Start building your knowledge base',
    content: (
      <div className="space-y-4">
        <p>🎉 Congratulations! You're ready to start using Knowledge RAG.</p>
        <div className="space-y-2 text-sm">
          <p><strong>Quick tips:</strong></p>
          <ul className="space-y-1 ml-4 text-muted-foreground">
            <li>• Use Cmd/Ctrl + K for quick search</li>
            <li>• Drag and drop files to create memories</li>
            <li>• Tag memories for better organization</li>
          </ul>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
          <p className="text-sm text-green-700 dark:text-green-300">
            🚀 Ready to capture your first thoughts?
          </p>
        </div>
      </div>
    ),
    action: {
      label: 'Create First Memory',
      onClick: () => {
        window.location.href = '/memories/new'
      }
    }
  }
]

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({
  children,
  storageKey = 'knowledge-rag-onboarding'
}) => {
  const [isOnboarding, setIsOnboarding] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState<OnboardingStep[]>(DEFAULT_ONBOARDING_STEPS)

  // Check if user has completed onboarding
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem(storageKey)
    if (!hasCompletedOnboarding && !isOnboarding) {
      // Auto-start onboarding for first-time users
      setIsOnboarding(true)
    }
  }, [storageKey, isOnboarding])

  const startOnboarding = () => {
    setIsOnboarding(true)
    setCurrentStep(0)
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      completeOnboarding()
    }
  }

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const skipStep = () => {
    nextStep()
  }

  const completeOnboarding = () => {
    setIsOnboarding(false)
    setCurrentStep(0)
    localStorage.setItem(storageKey, 'completed')
  }

  const setCustomSteps = (newSteps: OnboardingStep[]) => {
    setSteps(newSteps)
    setCurrentStep(0)
  }

  const currentStepData = isOnboarding ? steps[currentStep] || null : null

  const value: OnboardingContextType = {
    isOnboarding,
    currentStep,
    totalSteps: steps.length,
    currentStepData,
    startOnboarding,
    nextStep,
    previousStep,
    skipStep,
    completeOnboarding,
    setCustomSteps
  }

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  )
}