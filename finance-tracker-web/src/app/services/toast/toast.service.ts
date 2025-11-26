import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FieldError, ParsedApiError } from '../../models/api-error.model';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private defaultDuration = 3000; // 3 seconds

  constructor(private toastr: ToastrService) {}

  /**
   * Show a toast notification
   * @param message - Message to display
   * @param type - Type of toast (success, error, warning, info)
   * @param title - Optional title for the toast
   * @param duration - Duration in milliseconds (default: 3000)
   */
  show(message: string, type: ToastType = 'info', title?: string, duration?: number): void {
    const config = {
      timeOut: duration ?? this.defaultDuration,
      enableHtml: true,
      closeButton: true,
      tapToDismiss: true,
      progressBar: true,
    };

    switch (type) {
      case 'success':
        this.toastr.success(message, title || 'Success', config);
        break;
      case 'error':
        this.toastr.error(message, title || 'Error', {
          ...config,
          timeOut: duration ?? 5000, // Errors show longer by default
        });
        break;
      case 'warning':
        this.toastr.warning(message, title || 'Warning', config);
        break;
      case 'info':
        this.toastr.info(message, title || 'Info', config);
        break;
    }
  }

  /**
   * Show success toast
   */
  success(message: string, title?: string, duration?: number): void {
    this.show(message, 'success', title, duration);
  }

  /**
   * Show error toast
   */
  error(message: string, title?: string, duration?: number): void {
    this.show(message, 'error', title, duration ?? 5000);
  }

  /**
   * Show warning toast
   */
  warning(message: string, title?: string, duration?: number): void {
    this.show(message, 'warning', title, duration);
  }

  /**
   * Show info toast
   */
  info(message: string, title?: string, duration?: number): void {
    this.show(message, 'info', title, duration);
  }

  /**
   * Show error toast from ParsedApiError
   * Automatically determines the appropriate message and title based on error type
   * @param error - ParsedApiError object
   * @param customMessage - Optional custom message to override automatic message
   */
  showApiError(error: ParsedApiError, customMessage?: string): void {
    let message: string;
    let title: string;

    // Use custom message if provided
    if (customMessage) {
      message = customMessage;
      title = 'Error';
      this.error(message, title);
      return;
    }

    // Determine message and title based on error type
    if (error.isNetworkError) {
      message = 'Network error. Please check your internet connection and try again.';
      title = 'Connection Error';
    } else if (error.status === 401) {
      message = 'Your session has expired. Please log in again.';
      title = 'Unauthorized';
    } else if (error.status === 403) {
      message = 'You do not have permission to perform this action.';
      title = 'Forbidden';
    } else if (error.status === 404) {
      message = 'The requested resource was not found.';
      title = 'Not Found';
    } else if (error.status === 400) {
      // Check for field-level errors
      if (error.fieldErrors.length > 0) {
        const fieldErrorsText = error.fieldErrors
          .map((fe: FieldError) => `${fe.field}: ${fe.error}`)
          .join(', ');
        message = `Validation failed: ${fieldErrorsText}`;
      } else {
        message = error.message || 'Invalid request. Please check your input and try again.';
      }
      title = 'Invalid Request';
    } else if (error.status === 422) {
      message = error.message || 'Unable to process the request. Please check your input.';
      title = 'Validation Error';
    } else if (error.status === 429) {
      message = 'Too many requests. Please wait a moment and try again.';
      title = 'Rate Limit Exceeded';
    } else if (error.isServerError) {
      message = error.message || 'Server error occurred. Please try again later.';
      title = 'Server Error';
    } else {
      // Fallback to error message from API
      message = error.message || 'An unexpected error occurred. Please try again.';
      title = 'Error';
    }

    // Show error toast
    this.error(message, title);

    // Log detailed error for debugging (in development)
    if (error.backendError) {
      console.error('API Error Details:', {
        status: error.status,
        code: error.backendError.code,
        message: error.message,
        fieldErrors: error.fieldErrors,
        url:
          error.originalError instanceof Error && 'url' in error.originalError
            ? error.originalError.url
            : undefined,
      });
    }
  }

  /**
   * Clear all toasts
   */
  clear(): void {
    this.toastr.clear();
  }
}
