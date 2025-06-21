import { useState, useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';
import type { Memory } from '../types';

interface Notification {
  id: string;
  type: 'memory:created' | 'memory:updated' | 'memory:deleted';
  message: string;
  timestamp: Date;
}

export default function RealtimeNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const showNotifications = true; // Always show when there are notifications
  const { on } = useWebSocket();

  useEffect(() => {
    const unsubscribeCreated = on('memory:created', (memory: Memory) => {
      const notification: Notification = {
        id: `created-${memory.id}-${Date.now()}`,
        type: 'memory:created',
        message: `New memory: "${memory.title}"`,
        timestamp: new Date(),
      };
      setNotifications((prev) => [notification, ...prev].slice(0, 5)); // Keep only last 5
    });

    const unsubscribeUpdated = on('memory:updated', (memory: Memory) => {
      const notification: Notification = {
        id: `updated-${memory.id}-${Date.now()}`,
        type: 'memory:updated',
        message: `Memory updated: "${memory.title}"`,
        timestamp: new Date(),
      };
      setNotifications((prev) => [notification, ...prev].slice(0, 5));
    });

    const unsubscribeDeleted = on('memory:deleted', ({ id }) => {
      const notification: Notification = {
        id: `deleted-${id}-${Date.now()}`,
        type: 'memory:deleted',
        message: 'Memory deleted',
        timestamp: new Date(),
      };
      setNotifications((prev) => [notification, ...prev].slice(0, 5));
    });

    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribeDeleted();
    };
  }, [on]);

  // Auto-hide notifications after 5 seconds
  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        setNotifications((prev) => prev.slice(0, -1));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (!showNotifications || notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-40 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 border border-gray-200 dark:border-gray-700 animate-slide-in-right"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {notification.type === 'memory:deleted' ? (
                <X className="w-5 h-5 text-red-600 dark:text-red-400" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {notification.message}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Just now
              </p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}