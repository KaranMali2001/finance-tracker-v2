import { ApiError } from '@/generated/api/core/ApiError';
import type { BackendHTTPError, ApiErrorDetails } from '../types';

/**
 * Parse OpenAPI client ApiError and extract backend error structure
 */
export function parseApiError(error: unknown): ApiErrorDetails {
  const defaultError: ApiErrorDetails = {
    code: 'UNKNOWN_ERROR',
    message: 'An unknown error occurred',
    status: 500,
  };

  if (!error) {
    return defaultError;
  }

  // Handle ApiError from OpenAPI client
  if (error instanceof ApiError) {
    let backendError: BackendHTTPError | null = null;

    // Try to parse the error body
    try {
      if (error.body) {
        // Body might already be parsed as object
        if (typeof error.body === 'object') {
          backendError = error.body as BackendHTTPError;
        }
        // Or it might be a JSON string
        else if (typeof error.body === 'string') {
          backendError = JSON.parse(error.body) as BackendHTTPError;
        }
      }
    } catch {
      // If parsing fails, continue with default error structure
    }

    // If we have backend error structure, use it
    if (
      backendError &&
      typeof backendError === 'object' &&
      'message' in backendError &&
      'status' in backendError
    ) {
      const fieldErrors: Record<string, string> = {};

      // Convert array of field errors to object
      if (backendError.errors && Array.isArray(backendError.errors)) {
        for (const fieldError of backendError.errors) {
          if (fieldError.field && fieldError.error) {
            fieldErrors[fieldError.field] = fieldError.error;
          }
        }
      }

      return {
        code: backendError.code || `HTTP_${backendError.status}`,
        message: backendError.message || error.message,
        status: backendError.status || error.status,
        fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
        action: backendError.action,
      };
    }

    // Fallback to ApiError properties
    return {
      code: `HTTP_${error.status}`,
      message: error.message || `Error ${error.status}: ${error.statusText}`,
      status: error.status,
    };
  }

  // Handle Error objects
  if (error instanceof Error) {
    return {
      code: 'ERROR',
      message: error.message,
      status: 500,
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      code: 'ERROR',
      message: error,
      status: 500,
    };
  }

  return defaultError;
}
