import { useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMemoryStore, useSearchStore, useUIStore, useAuthStore } from '../stores';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  description: string;
  action: () => void;
  global?: boolean;
  whenInputFocused?: boolean;
}

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setQuery } = useSearchStore();
  const { createMemory } = useMemoryStore();
  const { toggleSidebar, addNotification } = useUIStore();
  const { isAuthenticated } = useAuthStore();
  
  const inputFocusedRef = useRef(false);

  // Track input focus
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      inputFocusedRef.current = 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.contentEditable === 'true';
    };

    const handleFocusOut = () => {
      inputFocusedRef.current = false;
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  // Define shortcuts
  const shortcuts: KeyboardShortcut[] = [
    // Navigation shortcuts
    {
      key: 'h',
      description: 'Go to home',
      action: () => navigate('/'),
      global: true
    },
    {
      key: 'm',
      description: 'Go to memories',
      action: () => navigate('/memories'),
      global: true
    },
    {
      key: 'g',
      description: 'Go to knowledge graph',
      action: () => navigate('/graph'),
      global: true
    },
    {
      key: 'c',
      description: 'Go to collections',
      action: () => navigate('/collections'),
      global: true
    },
    {
      key: 'a',
      description: 'Go to analytics',
      action: () => navigate('/analytics'),
      global: true
    },
    {
      key: 's',
      description: 'Go to settings',
      action: () => navigate('/settings'),
      global: true
    },
    
    // Action shortcuts
    {
      key: '/',
      description: 'Focus search',
      action: () => {
        const searchInput = document.querySelector('[data-testid="search-input"]') as HTMLInputElement;
        searchInput?.focus();
      },
      global: true,
      whenInputFocused: false
    },
    {
      key: 'n',
      description: 'Create new memory',
      action: () => navigate('/memories/new'),
      global: true
    },
    {
      key: 'n',
      ctrl: true,
      description: 'Create new memory (alternative)',
      action: () => navigate('/memories/new'),
      global: true
    },
    {
      key: 'Escape',
      description: 'Close modal/Clear search',
      action: () => {
        // Clear search if focused
        const searchInput = document.querySelector('[data-testid="search-input"]') as HTMLInputElement;
        if (document.activeElement === searchInput) {
          setQuery('');
          searchInput.blur();
        }
        // Close any open modals
        const closeButton = document.querySelector('[data-testid="modal-close"]') as HTMLButtonElement;
        closeButton?.click();
      },
      global: true
    },
    
    // UI shortcuts
    {
      key: 'b',
      ctrl: true,
      description: 'Toggle sidebar',
      action: () => toggleSidebar(),
      global: true
    },
    {
      key: '?',
      shift: true,
      description: 'Show keyboard shortcuts',
      action: () => {
        addNotification({
          title: 'Keyboard Shortcuts',
          message: 'Press Shift+? to view all shortcuts',
          type: 'info'
        });
        navigate('/settings#shortcuts');
      },
      global: true
    },
    
    // List navigation (when on memories page)
    {
      key: 'j',
      description: 'Next item',
      action: () => {
        const currentItem = document.querySelector('[data-focused="true"]');
        const items = document.querySelectorAll('[data-testid="memory-card"]');
        const currentIndex = Array.from(items).indexOf(currentItem as Element);
        const nextIndex = Math.min(currentIndex + 1, items.length - 1);
        (items[nextIndex] as HTMLElement)?.focus();
      },
      global: false
    },
    {
      key: 'k',
      description: 'Previous item',
      action: () => {
        const currentItem = document.querySelector('[data-focused="true"]');
        const items = document.querySelectorAll('[data-testid="memory-card"]');
        const currentIndex = Array.from(items).indexOf(currentItem as Element);
        const prevIndex = Math.max(currentIndex - 1, 0);
        (items[prevIndex] as HTMLElement)?.focus();
      },
      global: false
    },
    {
      key: 'Enter',
      description: 'Open focused item',
      action: () => {
        const focusedItem = document.activeElement;
        if (focusedItem?.getAttribute('data-testid') === 'memory-card') {
          focusedItem.querySelector('a')?.click();
        }
      },
      global: false
    },
    
    // Editor shortcuts (when editing)
    {
      key: 's',
      ctrl: true,
      description: 'Save',
      action: () => {
        const saveButton = document.querySelector('[data-testid="save-button"]') as HTMLButtonElement;
        saveButton?.click();
      },
      global: false,
      whenInputFocused: true
    },
    {
      key: 's',
      meta: true,
      description: 'Save (Mac)',
      action: () => {
        const saveButton = document.querySelector('[data-testid="save-button"]') as HTMLButtonElement;
        saveButton?.click();
      },
      global: false,
      whenInputFocused: true
    }
  ];

  // Handle keyboard events
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs (unless explicitly allowed)
    if (inputFocusedRef.current && !e.ctrlKey && !e.metaKey && !e.altKey) {
      return;
    }

    for (const shortcut of shortcuts) {
      // Check if shortcut should work in current context
      if (!shortcut.global && !location.pathname.includes('memories')) {
        continue;
      }

      if (shortcut.whenInputFocused === false && inputFocusedRef.current) {
        continue;
      }

      // Check key combination
      const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : !e.ctrlKey && !e.metaKey;
      const altMatch = shortcut.alt ? e.altKey : !e.altKey;
      const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
      const metaMatch = shortcut.meta ? e.metaKey : !e.metaKey;

      if (keyMatch && ctrlMatch && altMatch && shiftMatch && metaMatch) {
        e.preventDefault();
        shortcut.action();
        break;
      }
    }
  }, [shortcuts, location.pathname]);

  // Register event listener
  useEffect(() => {
    if (!isAuthenticated) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, isAuthenticated]);

  return { shortcuts };
}