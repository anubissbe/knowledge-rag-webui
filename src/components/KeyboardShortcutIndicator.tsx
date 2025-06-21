import { getShortcutDisplay, type ShortcutConfig } from '../hooks/useKeyboardShortcuts';

interface KeyboardShortcutIndicatorProps {
  shortcut: Partial<ShortcutConfig>;
  className?: string;
  showOnHover?: boolean;
}

export default function KeyboardShortcutIndicator({ 
  shortcut, 
  className = '',
  showOnHover = false
}: KeyboardShortcutIndicatorProps) {
  const display = getShortcutDisplay(shortcut as ShortcutConfig);
  
  const baseClasses = `inline-flex items-center px-1.5 py-0.5 text-xs font-mono 
                      bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 
                      rounded border border-gray-300 dark:border-gray-600`;
  
  const hoverClasses = showOnHover ? 'opacity-0 group-hover:opacity-100 transition-opacity' : '';

  return (
    <kbd className={`${baseClasses} ${hoverClasses} ${className}`}>
      {display}
    </kbd>
  );
}

/**
 * Tooltip-style keyboard shortcut hint
 */
interface ShortcutHintProps {
  shortcut: Partial<ShortcutConfig>;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
}

export function ShortcutHint({ 
  shortcut, 
  position = 'top',
  children 
}: ShortcutHintProps) {
  const display = getShortcutDisplay(shortcut as ShortcutConfig);
  
  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  return (
    <div className="relative group inline-block">
      {children}
      <div className={`absolute ${positionClasses[position]} pointer-events-none 
                      opacity-0 group-hover:opacity-100 transition-opacity z-10`}>
        <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 
                      rounded shadow-lg whitespace-nowrap">
          {display}
        </div>
      </div>
    </div>
  );
}