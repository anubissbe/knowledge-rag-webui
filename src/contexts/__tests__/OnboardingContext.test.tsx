import { renderHook, act } from '@testing-library/react'
import { OnboardingProvider, useOnboarding } from '../OnboardingContext'

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <OnboardingProvider>{children}</OnboardingProvider>
)

describe('OnboardingContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('provides onboarding context values', () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper })

    expect(result.current.isOnboarding).toBeDefined()
    expect(result.current.currentStep).toBeDefined()
    expect(result.current.totalSteps).toBeDefined()
    expect(result.current.currentStepData).toBeDefined()
    expect(result.current.startOnboarding).toBeDefined()
    expect(result.current.nextStep).toBeDefined()
    expect(result.current.previousStep).toBeDefined()
    expect(result.current.skipStep).toBeDefined()
    expect(result.current.completeOnboarding).toBeDefined()
    expect(result.current.setCustomSteps).toBeDefined()
  })

  it('initializes with correct default values', () => {
    mockLocalStorage.getItem.mockReturnValue(null)
    
    const { result } = renderHook(() => useOnboarding(), { wrapper })

    expect(result.current.isOnboarding).toBe(true) // Auto-starts for new users
    expect(result.current.currentStep).toBe(0)
    expect(result.current.totalSteps).toBe(7) // Default steps count
    expect(result.current.currentStepData).toBeTruthy()
    expect(result.current.currentStepData?.id).toBe('welcome')
  })

  it('does not auto-start if onboarding was completed', () => {
    mockLocalStorage.getItem.mockReturnValue('completed')
    
    const { result } = renderHook(() => useOnboarding(), { wrapper })

    expect(result.current.isOnboarding).toBe(false)
  })

  it('starts onboarding manually', () => {
    mockLocalStorage.getItem.mockReturnValue('completed')
    
    const { result } = renderHook(() => useOnboarding(), { wrapper })

    expect(result.current.isOnboarding).toBe(false)

    act(() => {
      result.current.startOnboarding()
    })

    expect(result.current.isOnboarding).toBe(true)
    expect(result.current.currentStep).toBe(0)
  })

  it('navigates to next step correctly', () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper })

    act(() => {
      result.current.startOnboarding()
    })

    expect(result.current.currentStep).toBe(0)

    act(() => {
      result.current.nextStep()
    })

    expect(result.current.currentStep).toBe(1)
    expect(result.current.currentStepData?.id).toBe('create-memory')
  })

  it('navigates to previous step correctly', () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper })

    act(() => {
      result.current.startOnboarding()
    })

    // Go to step 2
    act(() => {
      result.current.nextStep()
    })

    expect(result.current.currentStep).toBe(1)

    // Go back to step 1
    act(() => {
      result.current.previousStep()
    })

    expect(result.current.currentStep).toBe(0)
  })

  it('does not go to previous step from first step', () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper })

    act(() => {
      result.current.startOnboarding()
    })

    expect(result.current.currentStep).toBe(0)

    act(() => {
      result.current.previousStep()
    })

    expect(result.current.currentStep).toBe(0) // Should stay at 0
  })

  it('skips step correctly', () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper })

    act(() => {
      result.current.startOnboarding()
    })

    expect(result.current.currentStep).toBe(0)

    act(() => {
      result.current.skipStep()
    })

    expect(result.current.currentStep).toBe(1)
  })

  it('completes onboarding from last step', () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper })

    act(() => {
      result.current.startOnboarding()
    })

    // Navigate to last step
    for (let i = 0; i < 6; i++) {
      act(() => {
        result.current.nextStep()
      })
    }

    expect(result.current.currentStep).toBe(6)
    expect(result.current.isOnboarding).toBe(true)

    // Next from last step should complete onboarding
    act(() => {
      result.current.nextStep()
    })

    expect(result.current.isOnboarding).toBe(false)
    expect(result.current.currentStep).toBe(0) // Reset
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('knowledge-rag-onboarding', 'completed')
  })

  it('completes onboarding manually', () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper })

    act(() => {
      result.current.startOnboarding()
    })

    expect(result.current.isOnboarding).toBe(true)

    act(() => {
      result.current.completeOnboarding()
    })

    expect(result.current.isOnboarding).toBe(false)
    expect(result.current.currentStep).toBe(0)
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('knowledge-rag-onboarding', 'completed')
  })

  it('sets custom steps correctly', () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper })

    const customSteps = [
      {
        id: 'custom-1',
        title: 'Custom Step 1',
        description: 'Custom description',
        content: <div>Custom content</div>
      },
      {
        id: 'custom-2',
        title: 'Custom Step 2',
        description: 'Another custom description',
        content: <div>More custom content</div>
      }
    ]

    act(() => {
      result.current.setCustomSteps(customSteps)
    })

    expect(result.current.totalSteps).toBe(2)
    expect(result.current.currentStep).toBe(0) // Reset to first step
    expect(result.current.currentStepData?.id).toBe('custom-1')
  })

  it('returns null currentStepData when not onboarding', () => {
    mockLocalStorage.getItem.mockReturnValue('completed')
    
    const { result } = renderHook(() => useOnboarding(), { wrapper })

    expect(result.current.isOnboarding).toBe(false)
    expect(result.current.currentStepData).toBeNull()
  })

  it('uses custom storage key', () => {
    const customWrapper = ({ children }: { children: React.ReactNode }) => (
      <OnboardingProvider storageKey="custom-onboarding-key">{children}</OnboardingProvider>
    )

    const { result } = renderHook(() => useOnboarding(), { wrapper: customWrapper })

    act(() => {
      result.current.completeOnboarding()
    })

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('custom-onboarding-key', 'completed')
  })

  it('handles step data with action correctly', () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper })

    act(() => {
      result.current.startOnboarding()
    })

    // Navigate to completion step (last step has action)
    for (let i = 0; i < 6; i++) {
      act(() => {
        result.current.nextStep()
      })
    }

    const lastStepData = result.current.currentStepData
    expect(lastStepData?.action).toBeDefined()
    expect(lastStepData?.action?.label).toBe('Create First Memory')
    expect(typeof lastStepData?.action?.onClick).toBe('function')
  })

  it('throws error when used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error
    console.error = jest.fn()

    expect(() => {
      renderHook(() => useOnboarding())
    }).toThrow('useOnboarding must be used within an OnboardingProvider')

    console.error = originalError
  })

  it('handles allowSkip property correctly', () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper })

    act(() => {
      result.current.startOnboarding()
    })

    // First step should allow skip
    expect(result.current.currentStepData?.allowSkip).toBe(true)

    // Move to second step
    act(() => {
      result.current.nextStep()
    })

    // Second step should not allow skip
    expect(result.current.currentStepData?.allowSkip).toBeUndefined()
  })

  it('handles step positioning correctly', () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper })

    act(() => {
      result.current.startOnboarding()
    })

    // Move to step with specific positioning
    act(() => {
      result.current.nextStep() // create-memory step
    })

    expect(result.current.currentStepData?.position).toBe('bottom')

    act(() => {
      result.current.nextStep() // search step
    })

    expect(result.current.currentStepData?.position).toBe('bottom')
  })

  it('resets correctly after completion', () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper })

    act(() => {
      result.current.startOnboarding()
    })

    // Navigate to middle step
    act(() => {
      result.current.nextStep()
      result.current.nextStep()
    })

    expect(result.current.currentStep).toBe(2)

    // Complete onboarding
    act(() => {
      result.current.completeOnboarding()
    })

    expect(result.current.currentStep).toBe(0)
    expect(result.current.isOnboarding).toBe(false)

    // Start again should begin from first step
    act(() => {
      result.current.startOnboarding()
    })

    expect(result.current.currentStep).toBe(0)
    expect(result.current.currentStepData?.id).toBe('welcome')
  })
})