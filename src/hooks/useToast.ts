import { useCallback } from 'react';
import { toast as toastFunctions } from '../stores/notificationStore';
import type { Notification } from '../stores/notificationStore';

export function useToast() {
  const success = useCallback(
    (title: string, message?: string, options?: Partial<Notification>) => {
      return toastFunctions.success(title, message, options);
    },
    []
  );

  const error = useCallback(
    (title: string, message?: string, options?: Partial<Notification>) => {
      return toastFunctions.error(title, message, options);
    },
    []
  );

  const warning = useCallback(
    (title: string, message?: string, options?: Partial<Notification>) => {
      return toastFunctions.warning(title, message, options);
    },
    []
  );

  const info = useCallback(
    (title: string, message?: string, options?: Partial<Notification>) => {
      return toastFunctions.info(title, message, options);
    },
    []
  );

  const promise = useCallback(
    async <T,>(
      promise: Promise<T>,
      {
        loading,
        success,
        error,
      }: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: unknown) => string);
      }
    ) => {
      const loadingId = toastFunctions.info(loading, undefined, {
        duration: 0,
      });

      try {
        const result = await promise;
        toastFunctions.success(
          typeof success === 'function' ? success(result) : success
        );
        return result;
      } catch (err) {
        toastFunctions.error(
          typeof error === 'function' ? error(err) : error
        );
        throw err;
      } finally {
        // Remove loading notification
        const { removeNotification } = await import('../stores/notificationStore').then(
          m => m.useNotificationStore.getState()
        );
        removeNotification(loadingId);
      }
    },
    []
  );

  return {
    success,
    error,
    warning,
    info,
    promise,
  };
}