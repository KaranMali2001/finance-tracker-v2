import {
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from '@tanstack/react-query';
import type { CancelablePromise } from '@/generated/api/core/CancelablePromise';
import { fetcher } from '../utils/fetcher';
import { parseApiError } from '../utils/apiErrorParser';
import { toast } from '../feedback/Toast';

interface UseApiMutationOptions<TData, TVariables, TContext = unknown> extends Omit<
  UseMutationOptions<TData, unknown, TVariables, TContext>,
  'mutationFn'
> {
  showToastOnError?: boolean;
  showToastOnSuccess?: boolean;
  errorMessage?: string;
  successMessage?: string;
  onError?: (error: unknown) => void;
  onSuccess?: (data: TData, variables: TVariables, context?: TContext) => void;
}

/**
 * React Query mutation hook wrapper for OpenAPI-generated API calls
 * Automatically handles errors, success toasts, and token attachment
 *
 * @example
 * const { mutate, isLoading } = useApiMutation(
 *   (data: CreateUserReq) => UserService.createUser(data),
 *   {
 *     successMessage: 'User created successfully',
 *     onSuccess: () => queryClient.invalidateQueries(['users'])
 *   }
 * );
 */
export function useApiMutation<TData, TVariables = void>(
  mutationFn: (variables: TVariables) => CancelablePromise<TData>,
  options?: UseApiMutationOptions<TData, TVariables>
): UseMutationResult<TData, unknown, TVariables> {
  const {
    showToastOnError = true,
    showToastOnSuccess = false,
    errorMessage,
    successMessage,
    onError: customOnError,
    onSuccess: customOnSuccess,
    ...mutationOptions
  } = options || {};

  return useMutation<TData, unknown, TVariables>({
    mutationFn: async (variables: TVariables) => {
      try {
        return await fetcher(mutationFn(variables), {
          showToastOnError: false, // We'll handle it in onError
          errorMessage,
        });
      } catch (error) {
        const apiError = parseApiError(error);
        if (customOnError) {
          customOnError(error);
        } else if (showToastOnError) {
          toast.error(errorMessage || apiError.message || 'Operation failed');
        }
        throw error;
      }
    },
    onSuccess: (data, variables, context) => {
      if (showToastOnSuccess && successMessage) {
        toast.success(successMessage);
      }
      if (customOnSuccess) {
        customOnSuccess(data, variables, context);
      }
    },
    ...mutationOptions,
  });
}
