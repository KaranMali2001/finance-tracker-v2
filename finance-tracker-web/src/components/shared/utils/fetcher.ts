import type { CancelablePromise } from '@/generated/api/core/CancelablePromise';
import { toast } from 'sonner';
import { parseApiError } from './apiErrorParser';
import { getHumanReadableError } from './error';

/**
 * Wrapper for OpenAPI client calls that handles errors and returns typed responses
 * Token is already configured globally via configureApiClient in Providers.tsx
 *
 * @param promise - The CancelablePromise from OpenAPI client
 * @param options - Options for error handling
 * @returns Promise with typed data
 */
export async function fetcher<T>(
  promise: CancelablePromise<T>,
  options?: {
    showToastOnError?: boolean;
    errorMessage?: string;
    onError?: (error: unknown) => void;
  }
): Promise<T> {
  const { showToastOnError = true, errorMessage, onError } = options || {};

  try {
    const data = await promise;
    return data;
  } catch (error) {
    // Parse the error
    const errorDetails = parseApiError(error);
    const humanMessage = errorMessage || getHumanReadableError(error);

    // Call custom error handler if provided
    if (onError) {
      onError(error);
    } else if (showToastOnError) {
      // Show toast notification
      toast.error(humanMessage);
    }

    // Re-throw the original error so caller can handle it
    throw error;
  }
}
