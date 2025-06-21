import { create } from 'zustand';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  timestamp: number;
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const DEFAULT_DURATION = 5000;

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],

  addNotification: (notification) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: Date.now(),
      duration: notification.duration ?? DEFAULT_DURATION,
    };

    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Auto-remove after duration if duration is not 0 (0 means persistent)
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, newNotification.duration);
    }

    return id;
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearAll: () => {
    set({ notifications: [] });
  },
}));

// Convenience functions for common notification types
export const toast = {
  success: (title: string, message?: string, options?: Partial<Notification>) =>
    useNotificationStore.getState().addNotification({
      type: 'success',
      title,
      message,
      ...options,
    }),

  error: (title: string, message?: string, options?: Partial<Notification>) =>
    useNotificationStore.getState().addNotification({
      type: 'error',
      title,
      message,
      duration: 0, // Errors are persistent by default
      ...options,
    }),

  warning: (title: string, message?: string, options?: Partial<Notification>) =>
    useNotificationStore.getState().addNotification({
      type: 'warning',
      title,
      message,
      ...options,
    }),

  info: (title: string, message?: string, options?: Partial<Notification>) =>
    useNotificationStore.getState().addNotification({
      type: 'info',
      title,
      message,
      ...options,
    }),
};