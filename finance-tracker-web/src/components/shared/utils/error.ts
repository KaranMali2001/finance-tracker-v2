import { ApiError } from '@/generated/api/core/ApiError';
import type { BackendHTTPError } from '../types';

/**
 * Extract human-readable error message from any error type
 */
export function getHumanReadableError(error: unknown): string {
  if (!error) {
    return 'An unknown error occurred';
  }

  // Handle ApiError from OpenAPI client
  if (error instanceof ApiError) {
    // Try to parse backend error structure from body
    try {
      const body = error.body as BackendHTTPError;
      if (body && typeof body === 'object' && 'message' in body) {
        return body.message || error.message;
      }
    } catch {
      // Fall through to default message
    }
    return error.message || `Error ${error.status}: ${error.statusText}`;
  }

  // Handle Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Handle objects with message property
  if (
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message;
  }

  return 'An unknown error occurred';
}
