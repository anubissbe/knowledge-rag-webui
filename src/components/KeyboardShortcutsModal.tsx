import { useState } from 'react';
import { X, Command, Keyboard } from 'lucide-react';
import { useEscapeKey, getShortcutDisplay, type ShortcutConfig } from '../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: {
    global: ShortcutConfig[];
    page?: ShortcutConfig[];
    pageName?: string;
  };
}

export default function KeyboardShortcutsModal({ 
  isOpen, 
  onClose, 
  shortcuts 
}: KeyboardShortcutsModalProps) {
  const [activeTab, setActiveTab] = useState<'global' | 'page'>('global');

  // Close on Escape key
  useEscapeKey(onClose, isOpen);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const renderShortcuts = (shortcutList: ShortcutConfig[]) => {
    return shortcutList.map((shortcut, index) => (
      <div 
        key={index}
        className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0"
      >
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {shortcut.description}
        </span>
        <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-700 
                     text-gray-900 dark:text-gray-100 rounded border border-gray-300 
                     dark:border-gray-600 shadow-sm">
          {getShortcutDisplay(shortcut)}
        </kbd>
      </div>
    ));
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-modal-title"
    >
      <div className="relative w-full max-w-2xl max-h-[80vh] bg-white dark:bg-gray-800 
                    rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Keyboard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 id="shortcuts-modal-title" className="text-xl font-semibold text-gray-900 dark:text-white">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 
                     hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close shortcuts modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        {shortcuts.page && shortcuts.page.length > 0 && (
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('global')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors
                ${activeTab === 'global'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              Global Shortcuts
            </button>
            <button
              onClick={() => setActiveTab('page')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors
                ${activeTab === 'page'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              {shortcuts.pageName || 'Current Page'} Shortcuts
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-200px)]">
          {activeTab === 'global' && (
            <div>
              <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                These shortcuts work anywhere in the application.
              </div>
              {renderShortcuts(shortcuts.global)}
            </div>
          )}
          
          {activeTab === 'page' && shortcuts.page && (
            <div>
              <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                These shortcuts are specific to the {shortcuts.pageName || 'current'} page.
              </div>
              {renderShortcuts(shortcuts.page)}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Command className="w-3 h-3 mr-1" />
                = Cmd (Mac) / Ctrl (PC)
              </span>
              <span>Press ? to show this help</span>
            </div>
            <button
              onClick={onClose}
              className="px-3 py-1 text-gray-700 dark:text-gray-300 hover:bg-gray-200 
                       dark:hover:bg-gray-700 rounded transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}