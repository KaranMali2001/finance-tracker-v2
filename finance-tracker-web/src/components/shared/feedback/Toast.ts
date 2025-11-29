import { toast as sonnerToast } from 'sonner';

/**
 * Toast notification wrapper
 * Re-exports Sonner toast with consistent API
 */
export const toast = {
  /**
   * Show success toast
   */
  success: (message: string, options?: Parameters<typeof sonnerToast.success>[1]) => {
    return sonnerToast.success(message, options);
  },

  /**
   * Show error toast
   */
  error: (message: string, options?: Parameters<typeof sonnerToast.error>[1]) => {
    return sonnerToast.error(message, options);
  },

  /**
   * Show info toast
   */
  info: (message: string, options?: Parameters<typeof sonnerToast.info>[1]) => {
    return sonnerToast.info(message, options);
  },

  /**
   * Show warning toast
   */
  warning: (message: string, options?: Parameters<typeof sonnerToast.warning>[1]) => {
    return sonnerToast.warning(message, options);
  },

  /**
   * Show loading toast
   */
  loading: (message: string, options?: Parameters<typeof sonnerToast.loading>[1]) => {
    return sonnerToast.loading(message, options);
  },

  /**
   * Show promise toast
   */
  promise: <T>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    }
  ) => {
    return sonnerToast.promise(promise, options);
  },

  /**
   * Dismiss toast
   */
  dismiss: (toastId?: string | number) => {
    return sonnerToast.dismiss(toastId);
  },

  /**
   * Show custom toast
   */
  message: (message: string, options?: Parameters<typeof sonnerToast.message>[1]) => {
    return sonnerToast.message(message, options);
  },
};
