# Onboarding System Documentation

## Overview

The Knowledge RAG Web UI features a comprehensive onboarding system that guides new users through the main features with an interactive tour, sample data, and progressive disclosure.

## Architecture

### Components

```
src/contexts/OnboardingContext.tsx              - React Context for onboarding state
src/components/onboarding/OnboardingOverlay.tsx - Interactive tour overlay
src/components/onboarding/OnboardingTrigger.tsx - Trigger components and welcome card
src/utils/sampleData.ts                         - Sample memories and collections
```

### Features

- **Interactive Tour**: Step-by-step guided walkthrough
- **Welcome Card**: First-time user greeting with tour invitation
- **Sample Data**: Pre-populated memories and collections for exploration
- **Progressive Disclosure**: Features revealed at appropriate moments
- **Persistent State**: Remembers completion status across sessions

## Implementation Details

### OnboardingContext

The `OnboardingContext` provides centralized onboarding state management:

```typescript
interface OnboardingContextType {
  isOnboarding: boolean           // Current onboarding status
  currentStep: number            // Active step index
  totalSteps: number            // Total number of steps
  currentStepData: OnboardingStep | null  // Current step information
  startOnboarding: () => void    // Initiate onboarding tour
  nextStep: () => void          // Advance to next step
  previousStep: () => void      // Go back to previous step
  skipStep: () => void         // Skip current step
  completeOnboarding: () => void // Finish onboarding
  setCustomSteps: (steps: OnboardingStep[]) => void // Custom step sequences
}
```

### Onboarding Steps

Each step includes:

```typescript
interface OnboardingStep {
  id: string                    // Unique step identifier
  title: string                // Step title
  description: string          // Brief description
  target?: string             // CSS selector for element highlighting
  content: React.ReactNode    // Step content/instructions
  action?: {                  // Optional action button
    label: string
    onClick: () => void
  }
  position?: 'top' | 'bottom' | 'left' | 'right'  // Tooltip position
  allowSkip?: boolean         // Whether step can be skipped
}
```

## Default Onboarding Flow

### Step Sequence

1. **Welcome** - Introduction and overview (2 minutes, skippable)
2. **Create Memory** - How to create and store knowledge
3. **Search Feature** - Powerful hybrid search capabilities  
4. **Collections** - Organizing memories into groups
5. **Knowledge Graph** - Visualizing relationships
6. **Theme Settings** - Customization options
7. **Completion** - Congratulations and next steps

### Step Details

#### 1. Welcome Step
- Overview of the system
- Time estimate (2 minutes)
- Skip option available
- Sets expectations

#### 2. Create Memory Step
- Highlights create button
- Explains markdown support
- Positioned below target element

#### 3. Search Feature Step  
- Highlights search input
- Explains hybrid search types:
  - Vector similarity search
  - Full-text search
  - Entity-based search

#### 4. Collections Step
- Shows collections navigation
- Explains organization benefits
- Provides examples

#### 5. Knowledge Graph Step
- Introduces relationship visualization
- Explains automatic pattern detection

#### 6. Theme Settings Step
- Shows theme toggle
- Mentions additional settings

#### 7. Completion Step
- Congratulations message
- Quick tips for power users
- Action button to create first memory

## Components

### OnboardingOverlay

Interactive overlay that guides users through steps:

```tsx
<OnboardingOverlay />
```

**Features:**
- Element highlighting with CSS animations
- Positioning system for tooltips
- Progress bar and step counter
- Navigation controls (Next, Back, Skip, Close)
- Responsive design
- Keyboard navigation

### OnboardingTrigger

Multiple trigger variants for starting onboarding:

```tsx
// Help button in header
<OnboardingTrigger variant="help" />

// Menu item in user dropdown
<OnboardingTrigger variant="menu-item" />

// Standalone restart button
<OnboardingTrigger variant="button" />
```

### OnboardingWelcomeCard

Welcome card for first-time users:

```tsx
<OnboardingWelcomeCard />
```

**Features:**
- Attractive gradient design
- Clear call-to-action
- Skip option
- Auto-dismissal when completed

## Sample Data System

### Pre-populated Content

The onboarding includes realistic sample data:

- **4 Sample Memories**: Technical topics with markdown content
- **3 Sample Collections**: Organized by theme
- **6 Sample Entities**: Technology and concept entities  
- **Graph Data**: Nodes and relationships for visualization

### Data Categories

1. **Development Notes**
   - React Performance Optimization
   - TypeScript Advanced Types

2. **Learning & Research**
   - Machine Learning Fundamentals

3. **Design & UX**
   - Design System Principles

## State Management

### Persistence

Onboarding status is stored in localStorage:

```typescript
// Storage keys
'knowledge-rag-onboarding': 'completed' | 'skipped'

// Status checking
const hasCompleted = localStorage.getItem('knowledge-rag-onboarding')
```

### Auto-initialization

For first-time users (no localStorage entry):
- Automatically starts onboarding
- Shows welcome card
- Provides sample data for exploration

### Manual Restart

Users can restart onboarding:
- Help button in header
- Menu item in user dropdown
- Clears previous completion status

## Styling and Animation

### Element Highlighting

Target elements receive visual emphasis:

```css
.onboarding-highlight {
  position: relative !important;
  z-index: 55 !important;
  border-radius: 4px;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 
              0 0 0 8px rgba(59, 130, 246, 0.25) !important;
  animation: onboarding-pulse 2s infinite;
}

@keyframes onboarding-pulse {
  0%, 100% {
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 
                0 0 0 8px rgba(59, 130, 246, 0.25);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.7), 
                0 0 0 12px rgba(59, 130, 246, 0.15);
  }
}
```

### Overlay Design

- Semi-transparent backdrop (`bg-black/50`)
- Blur effect (`backdrop-blur-sm`)
- High z-index (50-60) for proper layering
- Responsive tooltip positioning

## Testing

### Unit Tests

Comprehensive testing for onboarding context:

```bash
npm run test src/contexts/__tests__/OnboardingContext.test.tsx
```

**Coverage:**
- State management
- Step navigation
- Completion handling
- Custom steps
- Error conditions

### E2E Tests

End-to-end testing for user workflows:

```bash
npm run test:e2e -- --grep "onboarding"
```

**Scenarios:**
- Welcome card display
- Tour initiation and navigation
- Element highlighting
- Tooltip positioning
- Completion flow
- Restart functionality
- Mobile responsiveness

## Accessibility

### ARIA Support

- Proper ARIA labels on controls
- Screen reader announcements
- Keyboard navigation support
- Focus management during tour

### Keyboard Navigation

- **Tab**: Navigate between controls
- **Enter**: Activate buttons  
- **Escape**: Close onboarding
- **Arrow Keys**: Alternative navigation

### Screen Reader

- Step announcements
- Progress indication
- Button descriptions
- Content reading

## Customization

### Custom Steps

Create custom onboarding sequences:

```typescript
const customSteps = [
  {
    id: 'custom-intro',
    title: 'Custom Introduction',
    description: 'Welcome to our custom feature',
    content: <div>Custom content here</div>,
    target: '[data-custom-element]',
    position: 'bottom'
  }
]

// Apply custom steps
const { setCustomSteps } = useOnboarding()
setCustomSteps(customSteps)
```

### Step Content

Rich content support:

```typescript
content: (
  <div className="space-y-4">
    <p>Instructions with <strong>formatting</strong></p>
    <div className="bg-blue-50 p-3 rounded">
      <p>💡 <strong>Tip:</strong> Additional context</p>
    </div>
    <ul className="text-sm space-y-1">
      <li>• Bullet point 1</li>
      <li>• Bullet point 2</li>
    </ul>
  </div>
)
```

### Action Buttons

Custom actions for steps:

```typescript
action: {
  label: 'Take Action',
  onClick: () => {
    // Custom action logic
    navigate('/specific-page')
    completeOnboarding()
  }
}
```

## Performance

### Lazy Loading

Onboarding components are included in main bundle but:
- Overlay only renders when active
- Sample data loaded on demand
- Minimal performance impact when inactive

### Memory Management

- Proper cleanup of event listeners
- Component unmounting handled correctly
- No memory leaks from animations

## Browser Support

- **Modern browsers**: Full support
- **Fallback**: Graceful degradation without tour
- **Mobile**: Responsive design with touch support

## Best Practices

### Content Guidelines

1. **Keep steps concise** - 2-3 sentences maximum
2. **Use action-oriented language** - "Click", "Try", "Explore"
3. **Provide context** - Explain why features matter
4. **Include tips** - Power user shortcuts and tricks
5. **Visual hierarchy** - Use formatting for emphasis

### UX Principles

1. **Progressive disclosure** - Reveal complexity gradually
2. **Allow control** - Skip, back, close options
3. **Show progress** - Step counter and progress bar
4. **Highlight targets** - Clear visual emphasis
5. **Provide value** - Meaningful sample data

### Implementation Tips

1. **Test thoroughly** - All devices and screen sizes
2. **Monitor analytics** - Track completion rates
3. **Gather feedback** - User testing and surveys
4. **Iterate content** - Improve based on data
5. **Keep updated** - Sync with feature changes

## Analytics Integration

Track onboarding effectiveness:

```typescript
// Example analytics calls
analytics.track('onboarding_started')
analytics.track('onboarding_step_completed', { step: currentStep })
analytics.track('onboarding_completed', { duration: timeElapsed })
analytics.track('onboarding_skipped', { step: currentStep })
```

## Future Enhancements

### Planned Features

- [ ] Video tutorials embedded in steps
- [ ] Interactive product tours with hotspots
- [ ] Role-based onboarding paths
- [ ] A/B testing for onboarding content
- [ ] Analytics dashboard for completion metrics

### Accessibility Improvements  

- [ ] High contrast mode support
- [ ] Voice navigation integration
- [ ] Reduced motion preferences
- [ ] Multiple language support

## API Reference

### useOnboarding Hook

```typescript
const {
  isOnboarding,        // boolean
  currentStep,         // number  
  totalSteps,         // number
  currentStepData,    // OnboardingStep | null
  startOnboarding,    // () => void
  nextStep,          // () => void
  previousStep,      // () => void
  skipStep,         // () => void
  completeOnboarding, // () => void
  setCustomSteps    // (steps: OnboardingStep[]) => void
} = useOnboarding()
```

### useOnboardingStatus Hook

```typescript
const {
  hasCompletedOnboarding,  // boolean
  shouldShowWelcome,       // boolean  
  hasSkippedOnboarding    // boolean
} = useOnboardingStatus()
```

## Related Files

- `src/contexts/OnboardingContext.tsx` - Main context implementation
- `src/components/onboarding/OnboardingOverlay.tsx` - Tour overlay component
- `src/components/onboarding/OnboardingTrigger.tsx` - Trigger components
- `src/utils/sampleData.ts` - Sample data for onboarding
- `e2e/tests/onboarding-flow.spec.ts` - E2E tests