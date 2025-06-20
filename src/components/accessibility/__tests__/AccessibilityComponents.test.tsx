import { render, screen, fireEvent, act } from '@testing-library/react'
import { AccessibilityProvider, useAccessibility } from '@/contexts/AccessibilityContext'
import {
  SkipToMain,
  FocusTrap,
  HighContrastToggle,
  AccessibilityStatus,
  KeyboardNavHelper,
  SROnly,
  AccessibleHeading,
  AccessibleButton,
  AccessibleProgress
} from '../AccessibilityComponents'

// Mock the useAccessibility hook for controlled testing
const mockUpdateSetting = jest.fn()
const mockAnnounceToScreenReader = jest.fn()

const defaultSettings = {
  highContrast: false,
  reducedMotion: false,
  largeText: false,
  screenReaderMode: false,
  keyboardNavigation: true,
  focusRing: 'default' as const
}

jest.mock('@/contexts/AccessibilityContext', () => ({
  ...jest.requireActual('@/contexts/AccessibilityContext'),
  useAccessibility: jest.fn(),
}))

const mockUseAccessibility = useAccessibility as jest.MockedFunction<typeof useAccessibility>

describe('Accessibility Components', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAccessibility.mockReturnValue({
      settings: defaultSettings,
      updateSetting: mockUpdateSetting,
      announceToScreenReader: mockAnnounceToScreenReader,
      resetSettings: jest.fn(),
    })
  })

  describe('SkipToMain', () => {
    it('renders skip to main content link', () => {
      render(<SkipToMain />)
      
      const skipLink = screen.getByRole('link', { name: /skip to main content/i })
      expect(skipLink).toBeInTheDocument()
      expect(skipLink).toHaveAttribute('href', '#main-content')
    })

    it('has correct accessibility classes', () => {
      render(<SkipToMain />)
      
      const skipLink = screen.getByRole('link', { name: /skip to main content/i })
      expect(skipLink).toHaveClass('sr-only', 'focus:not-sr-only')
    })
  })

  describe('FocusTrap', () => {
    it('renders children when active', () => {
      render(
        <FocusTrap active={true}>
          <button>Test Button</button>
        </FocusTrap>
      )
      
      expect(screen.getByRole('button', { name: /test button/i })).toBeInTheDocument()
    })

    it('renders children without trap when inactive', () => {
      render(
        <FocusTrap active={false}>
          <button>Test Button</button>
        </FocusTrap>
      )
      
      expect(screen.getByRole('button', { name: /test button/i })).toBeInTheDocument()
    })
  })

  describe('HighContrastToggle', () => {
    it('renders toggle button', () => {
      render(<HighContrastToggle />)
      
      const button = screen.getByRole('button', { name: /high contrast/i })
      expect(button).toBeInTheDocument()
    })

    it('shows correct state when high contrast is enabled', () => {
      mockUseAccessibility.mockReturnValue({
        settings: { ...defaultSettings, highContrast: true },
        updateSetting: mockUpdateSetting,
        announceToScreenReader: mockAnnounceToScreenReader,
        resetSettings: jest.fn(),
      })

      render(<HighContrastToggle />)
      
      const button = screen.getByRole('button', { name: /high contrast/i })
      expect(button).toHaveAttribute('aria-pressed', 'true')
    })

    it('toggles high contrast when clicked', () => {
      render(<HighContrastToggle />)
      
      const button = screen.getByRole('button', { name: /high contrast/i })
      fireEvent.click(button)
      
      expect(mockUpdateSetting).toHaveBeenCalledWith('highContrast', true)
    })
  })

  describe('AccessibilityStatus', () => {
    it('shows count of active features', () => {
      mockUseAccessibility.mockReturnValue({
        settings: {
          ...defaultSettings,
          highContrast: true,
          reducedMotion: true,
          focusRing: 'enhanced'
        },
        updateSetting: mockUpdateSetting,
        announceToScreenReader: mockAnnounceToScreenReader,
        resetSettings: jest.fn(),
      })

      render(<AccessibilityStatus />)
      
      expect(screen.getByText('3 accessibility features active')).toBeInTheDocument()
    })

    it('shows count when no features are active', () => {
      mockUseAccessibility.mockReturnValue({
        settings: { ...defaultSettings, keyboardNavigation: false },
        updateSetting: mockUpdateSetting,
        announceToScreenReader: mockAnnounceToScreenReader,
        resetSettings: jest.fn(),
      })

      render(<AccessibilityStatus />)
      
      expect(screen.getByText('0 accessibility features active')).toBeInTheDocument()
    })
  })

  describe('KeyboardNavHelper', () => {
    it('renders when keyboard navigation is enabled', () => {
      render(<KeyboardNavHelper />)
      
      expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument()
      expect(screen.getByText('Navigate forward')).toBeInTheDocument()
    })

    it('does not render when keyboard navigation is disabled', () => {
      mockUseAccessibility.mockReturnValue({
        settings: { ...defaultSettings, keyboardNavigation: false },
        updateSetting: mockUpdateSetting,
        announceToScreenReader: mockAnnounceToScreenReader,
        resetSettings: jest.fn(),
      })

      render(<KeyboardNavHelper />)
      
      expect(screen.queryByText('Keyboard Shortcuts')).not.toBeInTheDocument()
    })
  })

  describe('SROnly', () => {
    it('renders with screen reader only class', () => {
      render(<SROnly>Screen reader text</SROnly>)
      
      const element = screen.getByText('Screen reader text')
      expect(element).toHaveClass('sr-only')
    })
  })

  describe('AccessibleHeading', () => {
    it('renders correct heading level', () => {
      render(<AccessibleHeading level={2}>Test Heading</AccessibleHeading>)
      
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent('Test Heading')
    })

    it('applies custom className', () => {
      render(
        <AccessibleHeading level={1} className="custom-class">
          Test
        </AccessibleHeading>
      )
      
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveClass('custom-class')
    })

    it('applies id attribute', () => {
      render(
        <AccessibleHeading level={3} id="test-heading">
          Test
        </AccessibleHeading>
      )
      
      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toHaveAttribute('id', 'test-heading')
    })
  })

  describe('AccessibleButton', () => {
    it('renders button with children', () => {
      render(<AccessibleButton>Click me</AccessibleButton>)
      
      const button = screen.getByRole('button', { name: /click me/i })
      expect(button).toBeInTheDocument()
    })

    it('shows loading state', () => {
      render(
        <AccessibleButton loading={true} loadingText="Saving..." id="test-btn">
          Save
        </AccessibleButton>
      )
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveAttribute('aria-disabled', 'true')
      expect(button).toHaveAttribute('aria-describedby', 'test-btn-loading')
      expect(screen.getByText('Saving...')).toBeInTheDocument()
      expect(screen.getByText('Loading, please wait')).toBeInTheDocument()
    })

    it('handles disabled state', () => {
      render(<AccessibleButton disabled>Disabled</AccessibleButton>)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveAttribute('aria-disabled', 'true')
    })

    it('passes through other props', () => {
      const handleClick = jest.fn()
      render(
        <AccessibleButton onClick={handleClick} className="custom">
          Click
        </AccessibleButton>
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom')
      
      fireEvent.click(button)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('AccessibleProgress', () => {
    it('renders progress bar with correct attributes', () => {
      render(<AccessibleProgress value={50} max={100} label="Loading progress" />)
      
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveAttribute('aria-valuenow', '50')
      expect(progressbar).toHaveAttribute('aria-valuemin', '0')
      expect(progressbar).toHaveAttribute('aria-valuemax', '100')
      expect(progressbar).toHaveAttribute('aria-valuetext', '50% complete')
      expect(progressbar).toHaveAttribute('aria-labelledby', 'progress-label')
      
      expect(screen.getByText('Loading progress')).toBeInTheDocument()
      expect(screen.getByText('50% complete')).toBeInTheDocument()
    })

    it('calculates percentage correctly', () => {
      render(<AccessibleProgress value={25} max={50} />)
      
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveAttribute('aria-valuetext', '50% complete')
      expect(screen.getByText('50% complete')).toBeInTheDocument()
    })

    it('works without label', () => {
      render(<AccessibleProgress value={75} />)
      
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).not.toHaveAttribute('aria-labelledby')
      expect(screen.getByText('75% complete')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<AccessibleProgress value={30} className="custom-progress" />)
      
      // The className is applied to the wrapper div
      const wrapper = screen.getByRole('progressbar').closest('.custom-progress')
      expect(wrapper).toBeInTheDocument()
    })
  })

  describe('Integration with AccessibilityProvider', () => {
    it('works with real accessibility context', () => {
      render(
        <AccessibilityProvider>
          <HighContrastToggle />
          <AccessibilityStatus />
        </AccessibilityProvider>
      )
      
      expect(screen.getByRole('button', { name: /high contrast/i })).toBeInTheDocument()
      expect(screen.getByText(/accessibility features active/)).toBeInTheDocument()
    })
  })
})