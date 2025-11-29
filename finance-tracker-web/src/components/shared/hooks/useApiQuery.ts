'use client';
import type { CancelablePromise } from '@/generated/api/core/CancelablePromise';
import { useQuery, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';
import { toast } from '../feedback/Toast';
import { parseApiError } from '../utils/apiErrorParser';
import { fetcher } from '../utils/fetcher';

interface UseApiQueryOptions<TData, TError = unknown> extends Omit<
  UseQueryOptions<TData, TError>,
  'queryFn' | 'queryKey'
> {
  showToastOnError?: boolean;
  errorMessage?: string;
  onError?: (error: unknown) => void;
}

/**
 * React Query hook wrapper for OpenAPI-generated API calls
 * Automatically handles errors and token attachment (already configured globally)
 *
 * @example
 * const { data, isLoading, error } = useApiQuery(
 *   ['users', userId],
 *   () => UserService.getUser({ id: userId })
 * );
 */
export function useApiQuery<TData>(
  queryKey: unknown[],
  queryFn: () => CancelablePromise<TData>,
  options?: UseApiQueryOptions<TData>
): UseQueryResult<TData, unknown> {
  const { showToastOnError = true, errorMessage, onError, ...queryOptions } = options || {};

  return useQuery<TData, unknown>({
    queryKey,
    queryFn: async () => {
      try {
        return await fetcher(queryFn(), {
          showToastOnError: false, // We'll handle it in onError
          errorMessage,
          onError,
        });
      } catch (error) {
        const apiError = parseApiError(error);
        if (onError) {
          onError(error);
        } else if (showToastOnError) {
          toast.error(errorMessage || apiError.message || 'Failed to load data');
        }
        throw error;
      }
    },
    ...queryOptions,
  });
}
