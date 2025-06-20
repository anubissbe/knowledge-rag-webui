import React, { useState, useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';
import { KeyboardShortcutsList } from '../../hooks/useKeyboardShortcuts';

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  // Listen for Shift+? to open help
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === '?') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={() => setIsOpen(false)}
      />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Keyboard className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Keyboard Shortcuts</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              data-testid="modal-close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <KeyboardShortcutsList />
          </div>

          {/* Footer */}
          <div className="p-6 border-t dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
            <p>Press <kbd className="px-2 py-1 text-xs font-mono bg-gray-200 dark:bg-gray-700 rounded">ESC</kbd> to close</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Floating help button
export function KeyboardShortcutsButton() {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <button
        onClick={() => {
          const event = new KeyboardEvent('keydown', { shiftKey: true, key: '?' });
          document.dispatchEvent(event);
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="p-3 bg-primary text-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
        aria-label="Keyboard shortcuts"
      >
        <Keyboard className="w-5 h-5" />
      </button>
      
      {showTooltip && (
        <div className="absolute bottom-full right-0 mb-2 px-2 py-1 text-xs bg-gray-900 text-white rounded whitespace-nowrap">
          Keyboard Shortcuts (Shift+?)
        </div>
      )}
    </div>
  );
}