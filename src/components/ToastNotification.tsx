import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useNotificationStore } from '../stores/notificationStore';
import type { Notification, NotificationType } from '../stores/notificationStore';

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5" />;
    case 'error':
      return <AlertCircle className="w-5 h-5" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5" />;
    case 'info':
      return <Info className="w-5 h-5" />;
  }
};

const getNotificationStyles = (type: NotificationType) => {
  const baseStyles = 'flex items-start gap-3 p-4 rounded-lg shadow-lg pointer-events-auto';
  
  switch (type) {
    case 'success':
      return `${baseStyles} bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800`;
    case 'error':
      return `${baseStyles} bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800`;
    case 'warning':
      return `${baseStyles} bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800`;
    case 'info':
      return `${baseStyles} bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800`;
  }
};

const getIconColor = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return 'text-green-600 dark:text-green-400';
    case 'error':
      return 'text-red-600 dark:text-red-400';
    case 'warning':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'info':
      return 'text-blue-600 dark:text-blue-400';
  }
};

interface NotificationItemProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

function NotificationItem({ notification, onDismiss }: NotificationItemProps) {
  const { id, type, title, message, action } = notification;

  return (
    <div
      className={`${getNotificationStyles(type)} transform transition-all duration-300 ease-in-out`}
      role="alert"
      aria-live="polite"
    >
      <div className={getIconColor(type)} aria-hidden="true">
        {getNotificationIcon(type)}
      </div>
      
      <div className="flex-1">
        <p className="font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </p>
        {message && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {message}
          </p>
        )}
        {action && (
          <button
            onClick={action.onClick}
            className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            {action.label}
          </button>
        )}
      </div>
      
      <button
        onClick={() => onDismiss(id)}
        className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        aria-label="Dismiss notification"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}

export default function ToastNotification() {
  const { notifications, removeNotification } = useNotificationStore();

  // Ensure notifications are properly cleaned up
  useEffect(() => {
    return () => {
      // Cleanup any remaining timeouts when component unmounts
      notifications.forEach(notification => {
        if (notification.duration && notification.duration > 0) {
          removeNotification(notification.id);
        }
      });
    };
  }, []);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed top-4 right-4 z-50 pointer-events-none"
      aria-label="Notifications"
    >
      <div className="flex flex-col gap-2 max-w-sm">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onDismiss={removeNotification}
          />
        ))}
      </div>
    </div>
  );
}