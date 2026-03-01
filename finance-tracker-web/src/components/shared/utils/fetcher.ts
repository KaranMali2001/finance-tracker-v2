import type { CancelablePromise } from '@/generated/api/core/CancelablePromise';

/**
 * Wrapper for OpenAPI client calls that returns typed responses.
 * Token is already configured globally via configureApiClient in Providers.tsx.
 * Error handling (toasts, callbacks) is the responsibility of the calling hook.
 */
export async function fetcher<T>(promise: CancelablePromise<T>): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    throw error;
  }
}
