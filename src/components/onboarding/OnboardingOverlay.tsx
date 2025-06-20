import React, { useEffect, useState, useRef } from 'react'
import { X, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

interface OnboardingOverlayProps {
  className?: string
}

export const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({ className }) => {
  const {
    isOnboarding,
    currentStep,
    totalSteps,
    currentStepData,
    nextStep,
    previousStep,
    skipStep,
    completeOnboarding
  } = useOnboarding()

  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const tooltipRef = useRef<HTMLDivElement>(null)

  // Find and highlight target element
  useEffect(() => {
    if (!isOnboarding || !currentStepData?.target) {
      setTargetElement(null)
      return
    }

    const element = document.querySelector(currentStepData.target) as HTMLElement
    if (element) {
      setTargetElement(element)
      
      // Calculate tooltip position
      const rect = element.getBoundingClientRect()
      const tooltipRect = tooltipRef.current?.getBoundingClientRect()
      
      let top = rect.bottom + 10
      let left = rect.left

      // Adjust position based on specified position
      switch (currentStepData.position) {
        case 'top':
          top = rect.top - (tooltipRect?.height || 200) - 10
          break
        case 'left':
          top = rect.top
          left = rect.left - (tooltipRect?.width || 320) - 10
          break
        case 'right':
          top = rect.top
          left = rect.right + 10
          break
        case 'bottom':
        default:
          top = rect.bottom + 10
          break
      }

      // Keep tooltip within viewport
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      }

      if (left + (tooltipRect?.width || 320) > viewport.width) {
        left = viewport.width - (tooltipRect?.width || 320) - 10
      }
      if (left < 10) left = 10

      if (top + (tooltipRect?.height || 200) > viewport.height) {
        top = viewport.height - (tooltipRect?.height || 200) - 10
      }
      if (top < 10) top = 10

      setTooltipPosition({ top, left })
    }
  }, [isOnboarding, currentStepData, currentStep])

  // Add highlight class to target element
  useEffect(() => {
    if (targetElement) {
      targetElement.classList.add('onboarding-highlight')
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      
      return () => {
        targetElement.classList.remove('onboarding-highlight')
      }
    }
  }, [targetElement])

  if (!isOnboarding || !currentStepData) {
    return null
  }

  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === totalSteps - 1

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
        {/* Step Counter */}
        <div className="absolute top-4 right-4 z-60">
          <div className="bg-background/95 backdrop-blur-sm border rounded-lg px-3 py-2 text-sm">
            <span className="text-muted-foreground">Step</span>{' '}
            <span className="font-medium">{currentStep + 1}</span>
            <span className="text-muted-foreground"> of {totalSteps}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-muted z-60">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>

        {/* Tooltip */}
        <div
          ref={tooltipRef}
          className="absolute z-60 w-80 max-w-sm transition-all duration-300"
          style={{
            top: currentStepData.target ? tooltipPosition.top : '50%',
            left: currentStepData.target ? tooltipPosition.left : '50%',
            transform: currentStepData.target ? 'none' : 'translate(-50%, -50%)'
          }}
        >
          <Card className="shadow-lg border-2">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {currentStepData.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {currentStepData.description}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={completeOnboarding}
                  className="ml-2 h-6 w-6"
                  aria-label="Close onboarding"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="mb-6 text-sm text-foreground">
                {currentStepData.content}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {!isFirstStep && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={previousStep}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {currentStepData.allowSkip && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={skipStep}
                      className="flex items-center gap-1 text-muted-foreground"
                    >
                      <SkipForward className="h-4 w-4" />
                      Skip
                    </Button>
                  )}
                  
                  {currentStepData.action ? (
                    <Button
                      onClick={() => {
                        currentStepData.action!.onClick()
                        completeOnboarding()
                      }}
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      {currentStepData.action.label}
                    </Button>
                  ) : (
                    <Button
                      onClick={isLastStep ? completeOnboarding : nextStep}
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      {isLastStep ? 'Finish' : 'Next'}
                      {!isLastStep && <ChevronRight className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pointer Arrow */}
          {currentStepData.target && (
            <div
              className={`absolute w-0 h-0 border-solid ${
                currentStepData.position === 'top'
                  ? 'border-t-8 border-t-border border-x-8 border-x-transparent -bottom-2 left-8'
                  : currentStepData.position === 'left'
                  ? 'border-l-8 border-l-border border-y-8 border-y-transparent -right-2 top-8'
                  : currentStepData.position === 'right'
                  ? 'border-r-8 border-r-border border-y-8 border-y-transparent -left-2 top-8'
                  : 'border-b-8 border-b-border border-x-8 border-x-transparent -top-2 left-8'
              }`}
            />
          )}
        </div>
      </div>

      {/* CSS for highlighting */}
      <style jsx global>{`
        .onboarding-highlight {
          position: relative !important;
          z-index: 55 !important;
          border-radius: 4px;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 8px rgba(59, 130, 246, 0.25) !important;
          animation: onboarding-pulse 2s infinite;
        }

        @keyframes onboarding-pulse {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 8px rgba(59, 130, 246, 0.25);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.7), 0 0 0 12px rgba(59, 130, 246, 0.15);
          }
        }
      `}</style>
    </>
  )
}