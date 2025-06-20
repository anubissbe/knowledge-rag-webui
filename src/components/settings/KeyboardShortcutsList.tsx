import { FC } from 'react';
import { useKeyboardShortcuts, KeyboardShortcut } from '../../hooks/useKeyboardShortcuts';

const formatKey = (shortcut: KeyboardShortcut) => {
  const parts = [];
  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.alt) parts.push('Alt');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.meta) parts.push('⌘');
  parts.push(shortcut.key.toUpperCase());
  return parts.join('+');
};

export const KeyboardShortcutsList: FC = () => {
  const { shortcuts } = useKeyboardShortcuts();

  const globalShortcuts = shortcuts.filter(s => s.global);
  const contextShortcuts = shortcuts.filter(s => !s.global);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Global Shortcuts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {globalShortcuts.map((shortcut, index) => (
            <div key={index} className="flex justify-between items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <span className="text-sm">{shortcut.description}</span>
              <kbd className="px-2 py-1 text-xs font-mono bg-gray-200 dark:bg-gray-700 rounded">
                {formatKey(shortcut)}
              </kbd>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Context Shortcuts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {contextShortcuts.map((shortcut, index) => (
            <div key={index} className="flex justify-between items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <span className="text-sm">{shortcut.description}</span>
              <kbd className="px-2 py-1 text-xs font-mono bg-gray-200 dark:bg-gray-700 rounded">
                {formatKey(shortcut)}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};