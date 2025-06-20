import React, { type ReactNode } from 'react';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsProviderProps {
  children: ReactNode;
}

export function KeyboardShortcutsProvider({ children }: KeyboardShortcutsProviderProps) {
  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  return <>{children}</>;
}