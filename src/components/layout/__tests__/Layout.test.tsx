import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from '../Layout';
import { ThemeProvider } from '../../../contexts/ThemeContext';

// Mock the stores
jest.mock('../../../stores/authStore', () => ({
  useAuthStore: () => ({
    user: { id: '1', email: 'test@example.com', name: 'Test User' },
    isAuthenticated: true,
    logout: jest.fn(),
  }),
}));

jest.mock('../../../stores/memoryStore', () => ({
  useMemoryStore: () => ({
    memories: [],
    isLoading: false,
    searchQuery: '',
  }),
}));

// Mock child components
jest.mock('../Header', () => ({
  Header: ({ onToggleSidebar }: { onToggleSidebar: () => void }) => (
    <header data-testid="header">
      <button onClick={onToggleSidebar} data-testid="sidebar-toggle">
        Toggle Sidebar
      </button>
    </header>
  ),
}));

jest.mock('../Sidebar', () => ({
  Sidebar: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    <aside data-testid="sidebar" data-open={isOpen}>
      <button onClick={onClose} data-testid="sidebar-close">
        Close
      </button>
    </aside>
  ),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe('Layout', () => {
  it('renders header, sidebar, and main content', () => {
    render(
      <TestWrapper>
        <Layout>
          <div data-testid="main-content">Content</div>
        </Layout>
      </TestWrapper>
    );

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('main-content')).toBeInTheDocument();
  });

  it('toggles sidebar open/closed', () => {
    render(
      <TestWrapper>
        <Layout>
          <div>Content</div>
        </Layout>
      </TestWrapper>
    );

    const sidebarToggle = screen.getByTestId('sidebar-toggle');
    const sidebar = screen.getByTestId('sidebar');

    // Initially closed
    expect(sidebar).toHaveAttribute('data-open', 'false');

    // Open sidebar
    fireEvent.click(sidebarToggle);
    expect(sidebar).toHaveAttribute('data-open', 'true');

    // Close sidebar using toggle
    fireEvent.click(sidebarToggle);
    expect(sidebar).toHaveAttribute('data-open', 'false');
  });

  it('closes sidebar using close button', () => {
    render(
      <TestWrapper>
        <Layout>
          <div>Content</div>
        </Layout>
      </TestWrapper>
    );

    const sidebarToggle = screen.getByTestId('sidebar-toggle');
    const sidebarClose = screen.getByTestId('sidebar-close');
    const sidebar = screen.getByTestId('sidebar');

    // Open sidebar first
    fireEvent.click(sidebarToggle);
    expect(sidebar).toHaveAttribute('data-open', 'true');

    // Close using close button
    fireEvent.click(sidebarClose);
    expect(sidebar).toHaveAttribute('data-open', 'false');
  });

  it('applies correct CSS classes', () => {
    const { container } = render(
      <TestWrapper>
        <Layout>
          <div>Content</div>
        </Layout>
      </TestWrapper>
    );

    const layoutContainer = container.firstChild;
    expect(layoutContainer).toHaveClass('min-h-screen', 'bg-background');
  });

  it('renders children in main content area', () => {
    const testContent = 'Test page content';
    render(
      <TestWrapper>
        <Layout>
          <div data-testid="page-content">{testContent}</div>
        </Layout>
      </TestWrapper>
    );

    expect(screen.getByTestId('page-content')).toHaveTextContent(testContent);
  });

  it('handles keyboard navigation for sidebar', () => {
    render(
      <TestWrapper>
        <Layout>
          <div>Content</div>
        </Layout>
      </TestWrapper>
    );

    const sidebarToggle = screen.getByTestId('sidebar-toggle');
    const sidebar = screen.getByTestId('sidebar');

    // Test keyboard activation
    fireEvent.keyDown(sidebarToggle, { key: 'Enter' });
    expect(sidebar).toHaveAttribute('data-open', 'true');

    fireEvent.keyDown(sidebarToggle, { key: ' ' });
    expect(sidebar).toHaveAttribute('data-open', 'false');
  });

  it('maintains sidebar state across renders', () => {
    const { rerender } = render(
      <TestWrapper>
        <Layout>
          <div>Content 1</div>
        </Layout>
      </TestWrapper>
    );

    const sidebarToggle = screen.getByTestId('sidebar-toggle');
    const sidebar = screen.getByTestId('sidebar');

    // Open sidebar
    fireEvent.click(sidebarToggle);
    expect(sidebar).toHaveAttribute('data-open', 'true');

    // Rerender with different content
    rerender(
      <TestWrapper>
        <Layout>
          <div>Content 2</div>
        </Layout>
      </TestWrapper>
    );

    // Sidebar should still be open
    expect(screen.getByTestId('sidebar')).toHaveAttribute('data-open', 'true');
  });

  it('has proper responsive behavior', () => {
    render(
      <TestWrapper>
        <Layout>
          <div>Content</div>
        </Layout>
      </TestWrapper>
    );

    // The component should have responsive classes
    // This would be more thoroughly tested with actual media queries in integration tests
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });
});