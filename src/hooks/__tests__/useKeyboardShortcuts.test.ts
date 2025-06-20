import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMemoryStore, useSearchStore, useUIStore, useAuthStore } from '../../stores';

// Mock dependencies
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
}));

jest.mock('../../stores', () => ({
  useMemoryStore: jest.fn(),
  useSearchStore: jest.fn(),
  useUIStore: jest.fn(),
  useAuthStore: jest.fn(),
}));

describe('useKeyboardShortcuts', () => {
  const mockNavigate = jest.fn();
  const mockSetQuery = jest.fn();
  const mockToggleSidebar = jest.fn();
  const mockAddNotification = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useLocation as jest.Mock).mockReturnValue({ pathname: '/memories' });
    (useMemoryStore as jest.Mock).mockReturnValue({ createMemory: jest.fn() });
    (useSearchStore as jest.Mock).mockReturnValue({ setQuery: mockSetQuery });
    (useUIStore as jest.Mock).mockReturnValue({ 
      toggleSidebar: mockToggleSidebar,
      addNotification: mockAddNotification,
    });
    (useAuthStore as jest.Mock).mockReturnValue({ isAuthenticated: true });
  });

  it('should initialize without errors', () => {
    const { result } = renderHook(() => useKeyboardShortcuts());
    expect(result.current.shortcuts).toBeDefined();
    expect(result.current.shortcuts.length).toBeGreaterThan(0);
  });

  it('should navigate to home on "h" key', () => {
    renderHook(() => useKeyboardShortcuts());
    
    const event = new KeyboardEvent('keydown', { key: 'h' });
    document.dispatchEvent(event);
    
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should navigate to memories on "m" key', () => {
    renderHook(() => useKeyboardShortcuts());
    
    const event = new KeyboardEvent('keydown', { key: 'm' });
    document.dispatchEvent(event);
    
    expect(mockNavigate).toHaveBeenCalledWith('/memories');
  });

  it('should navigate to new memory on "n" key', () => {
    renderHook(() => useKeyboardShortcuts());
    
    const event = new KeyboardEvent('keydown', { key: 'n' });
    document.dispatchEvent(event);
    
    expect(mockNavigate).toHaveBeenCalledWith('/memories/new');
  });

  it('should toggle sidebar on Ctrl+B', () => {
    renderHook(() => useKeyboardShortcuts());
    
    const event = new KeyboardEvent('keydown', { key: 'b', ctrlKey: true });
    document.dispatchEvent(event);
    
    expect(mockToggleSidebar).toHaveBeenCalled();
  });

  it('should show keyboard shortcuts on Shift+?', () => {
    renderHook(() => useKeyboardShortcuts());
    
    const event = new KeyboardEvent('keydown', { key: '?', shiftKey: true });
    document.dispatchEvent(event);
    
    expect(mockAddNotification).toHaveBeenCalledWith({
      title: 'Keyboard Shortcuts',
      message: 'Press Shift+? to view all shortcuts',
      type: 'info'
    });
    expect(mockNavigate).toHaveBeenCalledWith('/settings#shortcuts');
  });

  it('should not trigger shortcuts when input is focused', () => {
    renderHook(() => useKeyboardShortcuts());
    
    // Create and focus an input
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
    
    const event = new KeyboardEvent('keydown', { key: 'h' });
    document.dispatchEvent(event);
    
    expect(mockNavigate).not.toHaveBeenCalled();
    
    // Cleanup
    document.body.removeChild(input);
  });

  it('should allow Ctrl+S when input is focused', () => {
    renderHook(() => useKeyboardShortcuts());
    
    // Create and focus an input
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
    
    // Create save button
    const saveButton = document.createElement('button');
    saveButton.setAttribute('data-testid', 'save-button');
    saveButton.click = jest.fn();
    document.body.appendChild(saveButton);
    
    const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true });
    document.dispatchEvent(event);
    
    expect(saveButton.click).toHaveBeenCalled();
    
    // Cleanup
    document.body.removeChild(input);
    document.body.removeChild(saveButton);
  });

  it('should not trigger shortcuts when not authenticated', () => {
    (useAuthStore as jest.Mock).mockReturnValue({ isAuthenticated: false });
    
    renderHook(() => useKeyboardShortcuts());
    
    const event = new KeyboardEvent('keydown', { key: 'h' });
    document.dispatchEvent(event);
    
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should clear search on Escape when search is focused', () => {
    renderHook(() => useKeyboardShortcuts());
    
    // Create search input
    const searchInput = document.createElement('input');
    searchInput.setAttribute('data-testid', 'search-input');
    searchInput.blur = jest.fn();
    document.body.appendChild(searchInput);
    searchInput.focus();
    
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(event);
    
    expect(mockSetQuery).toHaveBeenCalledWith('');
    expect(searchInput.blur).toHaveBeenCalled();
    
    // Cleanup
    document.body.removeChild(searchInput);
  });

  it('should focus search on "/" key', () => {
    renderHook(() => useKeyboardShortcuts());
    
    // Create search input
    const searchInput = document.createElement('input');
    searchInput.setAttribute('data-testid', 'search-input');
    searchInput.focus = jest.fn();
    document.body.appendChild(searchInput);
    
    const event = new KeyboardEvent('keydown', { key: '/' });
    document.dispatchEvent(event);
    
    expect(searchInput.focus).toHaveBeenCalled();
    
    // Cleanup
    document.body.removeChild(searchInput);
  });
});