import { screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryCard } from '../memory/MemoryCard'
import { renderWithProviders, mockMemory } from '@/utils/test-helpers'

describe('MemoryCard', () => {
  const mockOnEdit = jest.fn()
  const mockOnDelete = jest.fn()
  const testMemory = mockMemory({
    title: 'Test Memory Title',
    content: 'This is test content for the memory card',
    tags: ['test', 'example', 'memory']
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders memory information correctly', () => {
    renderWithProviders(
      <MemoryCard 
        memory={testMemory} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    )

    expect(screen.getByText('Test Memory Title')).toBeInTheDocument()
    expect(screen.getByText(/This is test content/)).toBeInTheDocument()
    expect(screen.getByText('test')).toBeInTheDocument()
    expect(screen.getByText('example')).toBeInTheDocument()
    expect(screen.getByText('memory')).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', async () => {
    renderWithProviders(
      <MemoryCard 
        memory={testMemory} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    )

    const editButton = screen.getByRole('button', { name: /edit/i })
    fireEvent.click(editButton)

    await waitFor(() => {
      expect(mockOnEdit).toHaveBeenCalledWith(testMemory.id)
    })
  })

  it('calls onDelete when delete button is clicked', async () => {
    renderWithProviders(
      <MemoryCard 
        memory={testMemory} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    )

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith(testMemory.id)
    })
  })

  it('shows creation date in readable format', () => {
    const memoryWithDate = mockMemory({
      created_at: '2024-12-20T10:30:00Z'
    })

    renderWithProviders(
      <MemoryCard 
        memory={memoryWithDate} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    )

    // Should show formatted date
    expect(screen.getByText(/Dec 20, 2024/)).toBeInTheDocument()
  })

  it('truncates long content appropriately', () => {
    const longContent = 'A'.repeat(500)
    const memoryWithLongContent = mockMemory({
      content: longContent
    })

    renderWithProviders(
      <MemoryCard 
        memory={memoryWithLongContent} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    )

    const contentElement = screen.getByTestId('memory-content')
    expect(contentElement.textContent!.length).toBeLessThan(longContent.length)
    expect(screen.getByText(/\.\.\./)).toBeInTheDocument()
  })

  it('handles empty tags gracefully', () => {
    const memoryWithoutTags = mockMemory({ tags: [] })

    renderWithProviders(
      <MemoryCard 
        memory={memoryWithoutTags} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    )

    expect(screen.queryByTestId('memory-tags')).not.toBeInTheDocument()
  })

  it('supports keyboard navigation', async () => {
    renderWithProviders(
      <MemoryCard 
        memory={testMemory} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    )

    const editButton = screen.getByRole('button', { name: /edit/i })
    
    // Focus the edit button
    editButton.focus()
    expect(editButton).toHaveFocus()

    // Press Enter
    fireEvent.keyDown(editButton, { key: 'Enter', code: 'Enter' })

    await waitFor(() => {
      expect(mockOnEdit).toHaveBeenCalledWith(testMemory.id)
    })
  })

  it('applies correct CSS classes', () => {
    const { container } = renderWithProviders(
      <MemoryCard 
        memory={testMemory} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    )

    const cardElement = container.firstChild as HTMLElement
    expect(cardElement).toHaveClass('memory-card')
    expect(cardElement).toHaveClass('bg-white')
    expect(cardElement).toHaveClass('shadow-md')
  })

  it('handles missing optional properties', () => {
    const minimalMemory = {
      id: 'minimal-1',
      title: 'Minimal Memory',
      content: 'Minimal content',
      tags: [],
      created_at: '2024-12-20T10:00:00Z',
      updated_at: '2024-12-20T10:00:00Z',
      metadata: {}
    }

    expect(() => {
      renderWithProviders(
        <MemoryCard 
          memory={minimalMemory} 
          onEdit={mockOnEdit} 
          onDelete={mockOnDelete} 
        />
      )
    }).not.toThrow()

    expect(screen.getByText('Minimal Memory')).toBeInTheDocument()
  })
})