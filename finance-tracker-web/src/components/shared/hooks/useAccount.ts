'use client';

import type {
  internal_domain_account_Account,
  internal_domain_account_CreateAccountReq,
  internal_domain_account_UpdateAccountReq,
} from '@/generated/api';
import { AccountService } from '@/generated/api';
import { useAuth } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import { useApiQuery } from './useApiQuery';

/**
 * Get all accounts hook
 * Fetches all accounts for the authenticated user
 * Only fetches when Clerk is loaded and user is signed in
 */
export function useAccounts() {
  const { isLoaded, isSignedIn } = useAuth();

  return useApiQuery<Array<internal_domain_account_Account>>(
    ['accounts'],
    () => AccountService.getAccount(),
    {
      enabled: isLoaded && isSignedIn, // Only fetch when Clerk is loaded and user is signed in
      showToastOnError: true,
    }
  );
}

/**
 * Get account by ID hook
 * Fetches a specific account by its ID
 * Only fetches when Clerk is loaded, user is signed in, and accountId is provided
 */
export function useAccount(accountId: string | null | undefined) {
  const { isLoaded, isSignedIn } = useAuth();

  return useApiQuery<internal_domain_account_Account>(
    ['accounts', accountId],
    () => {
      if (!accountId) {
        throw new Error('Account ID is required');
      }
      return AccountService.getAccount1(accountId);
    },
    {
      enabled: isLoaded && isSignedIn && !!accountId, // Wait for auth and require accountId
      showToastOnError: true,
    }
  );
}

/**
 * Create account hook
 * Creates a new financial account for the authenticated user
 */
export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useApiMutation<internal_domain_account_Account, internal_domain_account_CreateAccountReq>(
    (data) => AccountService.postAccount(data),
    {
      onSuccess: () => {
        // Invalidate and refetch accounts list
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
      },
      showToastOnSuccess: true,
      successMessage: 'Account created successfully',
      showToastOnError: true,
    }
  );
}

/**
 * Update account hook
 * Updates an existing account's information
 */
export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useApiMutation<internal_domain_account_Account, internal_domain_account_UpdateAccountReq>(
    (data) => AccountService.putAccount(data),
    {
      onSuccess: (data) => {
        // Invalidate and refetch accounts list
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
        // Invalidate specific account if we have the ID
        if (data.id) {
          queryClient.invalidateQueries({
            queryKey: ['accounts', data.id],
          });
        }
      },
      showToastOnSuccess: true,
      successMessage: 'Account updated successfully',
      showToastOnError: true,
    }
  );
}

/**
 * Delete account hook
 * Deletes an existing account for the authenticated user
 */
export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useApiMutation<any, string>((accountId) => AccountService.deleteAccount(accountId), {
    onSuccess: () => {
      // Invalidate and refetch accounts list
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
    showToastOnSuccess: true,
    successMessage: 'Account deleted successfully',
    showToastOnError: true,
  });
}
