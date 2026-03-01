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

export function useAccounts() {
  const { isLoaded, isSignedIn } = useAuth();

  return useApiQuery<Array<internal_domain_account_Account>>(
    ['accounts'],
    () => AccountService.getAccount(),
    {
      enabled: isLoaded && isSignedIn,
      showToastOnError: true,
    }
  );
}

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
      enabled: isLoaded && isSignedIn && !!accountId,
      showToastOnError: true,
    }
  );
}

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useApiMutation<internal_domain_account_Account, internal_domain_account_CreateAccountReq>(
    (data) => AccountService.postAccount(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
      },
      showToastOnSuccess: true,
      successMessage: 'Account created successfully',
      showToastOnError: true,
    }
  );
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useApiMutation<internal_domain_account_Account, internal_domain_account_UpdateAccountReq>(
    (data) => AccountService.putAccount(data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
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

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useApiMutation<Record<string, string>, string>(
    (accountId) => AccountService.deleteAccount(accountId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
      },
      showToastOnSuccess: true,
      successMessage: 'Account deleted successfully',
      showToastOnError: true,
    }
  );
}
