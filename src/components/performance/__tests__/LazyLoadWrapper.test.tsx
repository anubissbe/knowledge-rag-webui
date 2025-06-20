import { render, screen, waitFor } from '@testing-library/react'
import { Suspense } from 'react'
import { LazyLoadWrapper, LazyLoadErrorBoundary } from '../LazyLoadWrapper'

// Mock lazy component
const MockLazyComponent = () => <div>Lazy Component Loaded</div>
const MockFailingComponent = () => {
  throw new Error('Test error')
}

describe('LazyLoadWrapper', () => {
  it('renders loading fallback initially', () => {
    render(
      <LazyLoadWrapper>
        <MockLazyComponent />
      </LazyLoadWrapper>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom Loading...</div>
    
    render(
      <LazyLoadWrapper fallback={customFallback}>
        <MockLazyComponent />
      </LazyLoadWrapper>
    )

    expect(screen.getByText('Custom Loading...')).toBeInTheDocument()
  })

  it('renders children after loading', async () => {
    render(
      <LazyLoadWrapper>
        <MockLazyComponent />
      </LazyLoadWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Lazy Component Loaded')).toBeInTheDocument()
    })
  })

  it('applies custom className', () => {
    const { container } = render(
      <LazyLoadWrapper className="custom-class">
        <MockLazyComponent />
      </LazyLoadWrapper>
    )

    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })
})

describe('LazyLoadErrorBoundary', () => {
  // Suppress console.error for error boundary tests
  const originalError = console.error
  beforeAll(() => {
    console.error = jest.fn()
  })
  afterAll(() => {
    console.error = originalError
  })

  it('renders children when no error occurs', () => {
    render(
      <LazyLoadErrorBoundary>
        <MockLazyComponent />
      </LazyLoadErrorBoundary>
    )

    expect(screen.getByText('Lazy Component Loaded')).toBeInTheDocument()
  })

  it('renders error fallback when error occurs', () => {
    render(
      <LazyLoadErrorBoundary>
        <MockFailingComponent />
      </LazyLoadErrorBoundary>
    )

    expect(screen.getByText('Failed to load component')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('renders custom error fallback when provided', () => {
    const customFallback = <div>Custom Error Message</div>
    
    render(
      <LazyLoadErrorBoundary fallback={customFallback}>
        <MockFailingComponent />
      </LazyLoadErrorBoundary>
    )

    expect(screen.getByText('Custom Error Message')).toBeInTheDocument()
  })

  it('resets error state when try again is clicked', () => {
    const { rerender } = render(
      <LazyLoadErrorBoundary>
        <MockFailingComponent />
      </LazyLoadErrorBoundary>
    )

    const tryAgainButton = screen.getByRole('button', { name: /try again/i })
    tryAgainButton.click()

    // Component should attempt to render again
    rerender(
      <LazyLoadErrorBoundary>
        <MockLazyComponent />
      </LazyLoadErrorBoundary>
    )

    expect(screen.getByText('Lazy Component Loaded')).toBeInTheDocument()
  })
})