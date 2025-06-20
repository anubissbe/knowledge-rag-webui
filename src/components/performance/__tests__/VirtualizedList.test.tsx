import { render, screen, fireEvent } from '@testing-library/react'
import { VirtualizedList, LazyImage, useIntersectionObserver } from '../VirtualizedList'

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn()
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
})
window.IntersectionObserver = mockIntersectionObserver

describe('VirtualizedList', () => {
  const mockItems = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    name: `Item ${i}`
  }))

  const renderItem = (item: typeof mockItems[0], index: number) => (
    <div key={item.id} data-testid={`item-${index}`}>
      {item.name}
    </div>
  )

  it('renders visible items only', () => {
    render(
      <VirtualizedList
        items={mockItems}
        itemHeight={50}
        containerHeight={200}
        renderItem={renderItem}
      />
    )

    // Should render only items visible in 200px container with 50px item height
    // Plus overscan items (default 5 on each side)
    const visibleItems = screen.getAllByTestId(/item-/)
    expect(visibleItems.length).toBeLessThan(mockItems.length)
    expect(visibleItems.length).toBeGreaterThan(4) // At least 4 items visible
  })

  it('updates visible items on scroll', () => {
    const { container } = render(
      <VirtualizedList
        items={mockItems}
        itemHeight={50}
        containerHeight={200}
        renderItem={renderItem}
      />
    )

    const scrollContainer = container.firstChild as HTMLElement

    // Scroll down
    fireEvent.scroll(scrollContainer, { target: { scrollTop: 100 } })

    // Should render different items after scroll
    expect(screen.getByTestId('item-2')).toBeInTheDocument()
  })

  it('calls onScroll callback when scrolling', () => {
    const onScroll = jest.fn()
    const { container } = render(
      <VirtualizedList
        items={mockItems}
        itemHeight={50}
        containerHeight={200}
        renderItem={renderItem}
        onScroll={onScroll}
      />
    )

    const scrollContainer = container.firstChild as HTMLElement
    fireEvent.scroll(scrollContainer, { target: { scrollTop: 50 } })

    expect(onScroll).toHaveBeenCalledWith(50)
  })

  it('applies custom className', () => {
    const { container } = render(
      <VirtualizedList
        items={mockItems}
        itemHeight={50}
        containerHeight={200}
        renderItem={renderItem}
        className="custom-list"
      />
    )

    expect(container.firstChild).toHaveClass('custom-list')
  })

  it('handles empty items array', () => {
    render(
      <VirtualizedList
        items={[]}
        itemHeight={50}
        containerHeight={200}
        renderItem={renderItem}
      />
    )

    expect(screen.queryByTestId(/item-/)).not.toBeInTheDocument()
  })
})

describe('LazyImage', () => {
  let mockObserver: any

  beforeEach(() => {
    mockObserver = {
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn()
    }
    mockIntersectionObserver.mockImplementation((callback) => {
      mockObserver.callback = callback
      return mockObserver
    })
  })

  it('renders placeholder when not in view', () => {
    render(
      <LazyImage
        src="https://example.com/image.jpg"
        alt="Test image"
        data-testid="lazy-image"
      />
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('renders image when in view', () => {
    render(
      <LazyImage
        src="https://example.com/image.jpg"
        alt="Test image"
        data-testid="lazy-image"
      />
    )

    // Simulate intersection
    mockObserver.callback([{ isIntersecting: true }])

    expect(screen.getByRole('img')).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/image.jpg')
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Test image')
  })

  it('renders custom placeholder when provided', () => {
    const customPlaceholder = <div>Custom placeholder</div>

    render(
      <LazyImage
        src="https://example.com/image.jpg"
        alt="Test image"
        placeholder={customPlaceholder}
      />
    )

    expect(screen.getByText('Custom placeholder')).toBeInTheDocument()
  })

  it('shows error state when image fails to load', () => {
    render(
      <LazyImage
        src="https://example.com/image.jpg"
        alt="Test image"
      />
    )

    // Simulate intersection
    mockObserver.callback([{ isIntersecting: true }])

    const img = screen.getByRole('img')
    fireEvent.error(img)

    expect(screen.getByText('Failed to load')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <LazyImage
        src="https://example.com/image.jpg"
        alt="Test image"
        className="custom-image"
      />
    )

    expect(container.firstChild).toHaveClass('custom-image')
  })
})

describe('useIntersectionObserver', () => {
  it('returns intersection observer state', () => {
    const TestComponent = () => {
      const { elementRef, isVisible } = useIntersectionObserver()
      return (
        <div ref={elementRef} data-testid="observed-element">
          {isVisible ? 'Visible' : 'Not visible'}
        </div>
      )
    }

    render(<TestComponent />)

    expect(screen.getByText('Not visible')).toBeInTheDocument()
    expect(mockObserver.observe).toHaveBeenCalled()
  })
})