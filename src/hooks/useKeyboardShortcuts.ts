import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  cmd?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
  global?: boolean;
}

interface KeyboardShortcutsOptions {
  enabled?: boolean;
  preventDefault?: boolean;
}

/**
 * Hook for managing keyboard shortcuts with support for modifiers
 */
export function useKeyboardShortcuts(
  shortcuts: ShortcutConfig[],
  options: KeyboardShortcutsOptions = {}
) {
  const { enabled = true, preventDefault = true } = options;
  const activeElement = useRef<Element | null>(null);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Don't trigger shortcuts when typing in inputs (unless global)
    const target = event.target as HTMLElement;
    const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
    
    shortcuts.forEach(shortcut => {
      if (!shortcut.global && isInput) return;

      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatch = !shortcut.ctrl || (event.ctrlKey || event.metaKey);
      const cmdMatch = !shortcut.cmd || event.metaKey;
      const shiftMatch = !shortcut.shift || event.shiftKey;
      const altMatch = !shortcut.alt || event.altKey;

      if (keyMatch && ctrlMatch && cmdMatch && shiftMatch && altMatch) {
        if (preventDefault) {
          event.preventDefault();
          event.stopPropagation();
        }
        shortcut.action();
      }
    });
  }, [shortcuts, enabled, preventDefault]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);

  // Store active element for focus restoration
  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      activeElement.current = e.target as Element;
    };

    document.addEventListener('focusin', handleFocus);
    return () => document.removeEventListener('focusin', handleFocus);
  }, []);

  return {
    activeElement: activeElement.current
  };
}

/**
 * Global keyboard shortcuts that work across the entire app
 */
export function useGlobalKeyboardShortcuts() {
  const navigate = useNavigate();

  const globalShortcuts: ShortcutConfig[] = [
    // Navigation shortcuts
    {
      key: 'g',
      shift: true,
      description: 'Go to Dashboard',
      action: () => navigate('/'),
      global: true
    },
    {
      key: 'm',
      shift: true,
      description: 'Go to Memories',
      action: () => navigate('/memories'),
      global: true
    },
    {
      key: 's',
      shift: true,
      description: 'Go to Search',
      action: () => navigate('/search'),
      global: true
    },
    {
      key: ',',
      cmd: true,
      description: 'Open Settings',
      action: () => navigate('/settings'),
      global: true
    },
    // Search shortcut
    {
      key: 'k',
      cmd: true,
      description: 'Focus Search',
      action: () => {
        navigate('/search');
        // Focus search input after navigation
        setTimeout(() => {
          const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
          searchInput?.focus();
        }, 100);
      },
      global: true
    },
    // Create new memory
    {
      key: 'n',
      cmd: true,
      description: 'New Memory',
      action: () => {
        // This would open the new memory modal/page
        console.log('New memory shortcut triggered');
        // TODO: Implement when memory creation modal is available
      },
      global: true
    },
    // Help
    {
      key: '?',
      description: 'Show Keyboard Shortcuts',
      action: () => {
        // This will be handled by the keyboard shortcuts modal
        const event = new CustomEvent('show-keyboard-shortcuts');
        window.dispatchEvent(event);
      },
      global: true
    }
  ];

  useKeyboardShortcuts(globalShortcuts);

  return globalShortcuts;
}

/**
 * Page-specific keyboard shortcuts
 */
export function usePageKeyboardShortcuts(pageName: string) {
  const shortcuts: Record<string, ShortcutConfig[]> = {
    memories: [
      {
        key: 'j',
        description: 'Next memory',
        action: () => {
          // Focus next memory in list
          const currentFocus = document.activeElement;
          const memories = document.querySelectorAll('[data-memory-item]');
          const currentIndex = Array.from(memories).indexOf(currentFocus as HTMLElement);
          const nextIndex = Math.min(currentIndex + 1, memories.length - 1);
          (memories[nextIndex] as HTMLElement)?.focus();
        }
      },
      {
        key: 'k',
        description: 'Previous memory',
        action: () => {
          // Focus previous memory in list
          const currentFocus = document.activeElement;
          const memories = document.querySelectorAll('[data-memory-item]');
          const currentIndex = Array.from(memories).indexOf(currentFocus as HTMLElement);
          const prevIndex = Math.max(currentIndex - 1, 0);
          (memories[prevIndex] as HTMLElement)?.focus();
        }
      },
      {
        key: 'Enter',
        description: 'Open memory',
        action: () => {
          const focusedMemory = document.activeElement as HTMLElement;
          if (focusedMemory?.hasAttribute('data-memory-item')) {
            focusedMemory.click();
          }
        }
      },
      {
        key: 'x',
        description: 'Toggle selection',
        action: () => {
          const focusedMemory = document.activeElement as HTMLElement;
          const checkbox = focusedMemory?.querySelector('input[type="checkbox"]') as HTMLInputElement;
          if (checkbox) {
            checkbox.click();
          }
        }
      },
      {
        key: 'a',
        cmd: true,
        description: 'Select all',
        action: () => {
          const selectAllBtn = document.querySelector('[data-select-all]') as HTMLElement;
          selectAllBtn?.click();
        }
      }
    ],
    search: [
      {
        key: '/',
        description: 'Focus search input',
        action: () => {
          const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
          searchInput?.focus();
        }
      },
      {
        key: 'Escape',
        description: 'Clear search',
        action: () => {
          const clearBtn = document.querySelector('[aria-label="Clear search"]') as HTMLElement;
          clearBtn?.click();
        }
      },
      {
        key: 'f',
        description: 'Toggle filters',
        action: () => {
          const filterBtn = document.querySelector('button:has-text("Filters")') as HTMLElement;
          filterBtn?.click();
        }
      }
    ],
    dashboard: [
      {
        key: 't',
        description: 'Change time range',
        action: () => {
          const timeSelect = document.querySelector('select[aria-label*="time range"]') as HTMLSelectElement;
          timeSelect?.focus();
        }
      },
      {
        key: 'r',
        description: 'Refresh data',
        action: () => {
          window.location.reload();
        }
      }
    ]
  };

  const pageShortcuts = shortcuts[pageName] || [];
  useKeyboardShortcuts(pageShortcuts);

  return pageShortcuts;
}

/**
 * Hook for handling Escape key globally
 */
export function useEscapeKey(onEscape: () => void, enabled = true) {
  useKeyboardShortcuts([
    {
      key: 'Escape',
      description: 'Close/Cancel',
      action: onEscape,
      global: true
    }
  ], { enabled });
}

/**
 * Get shortcut display string for current platform
 */
export function getShortcutDisplay(shortcut: ShortcutConfig): string {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const parts: string[] = [];

  if (shortcut.ctrl && !isMac) parts.push('Ctrl');
  if (shortcut.cmd || (shortcut.ctrl && isMac)) parts.push('⌘');
  if (shortcut.alt) parts.push(isMac ? '⌥' : 'Alt');
  if (shortcut.shift) parts.push(isMac ? '⇧' : 'Shift');
  
  parts.push(shortcut.key.toUpperCase());

  return parts.join(isMac ? '' : '+');
}