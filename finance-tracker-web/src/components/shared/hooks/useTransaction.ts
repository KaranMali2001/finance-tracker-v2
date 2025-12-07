'use client';

import type {
  internal_domain_transaction_CreateTxnReq,
  internal_domain_transaction_ParsedTxnRes,
  internal_domain_transaction_SoftDeleteTxnsReq,
  internal_domain_transaction_Trasaction,
  internal_domain_transaction_UpdateTxnReq,
} from '@/generated/api';
import { TransactionService } from '@/generated/api';
import { useAuth } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import { useApiQuery } from './useApiQuery';

interface TransactionFilters {
  accountId?: string;
  categoryId?: string;
  merchantId?: string;
}

/**
 * Get transactions with optional filters hook
 * Fetches transactions for the authenticated user with optional filters
 * Only fetches when Clerk is loaded and user is signed in
 */
export function useTransactions(filters?: TransactionFilters) {
  const { isLoaded, isSignedIn } = useAuth();

  return useApiQuery<Array<internal_domain_transaction_Trasaction>>(
    ['transactions', filters?.accountId, filters?.categoryId, filters?.merchantId],
    () =>
      TransactionService.getTransaction(
        filters?.accountId,
        filters?.categoryId,
        filters?.merchantId
      ),
    {
      enabled: isLoaded && isSignedIn, // Only fetch when Clerk is loaded and user is signed in
      showToastOnError: true,
    }
  );
}

/**
 * Create transaction hook
 * Creates a new financial transaction for the authenticated user
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useApiMutation<
    internal_domain_transaction_Trasaction,
    internal_domain_transaction_CreateTxnReq
  >((data) => TransactionService.postTransaction(data), {
    onSuccess: () => {
      // Invalidate and refetch transactions list
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      // Invalidate user data (lifetime_income, lifetime_expense, etc.)
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
      // Invalidate accounts (account balances may have changed)
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
    showToastOnSuccess: true,
    successMessage: 'Transaction created successfully',
    showToastOnError: true,
  });
}

/**
 * Delete transactions hook
 * Soft deletes transactions for the authenticated user
 */
export function useDeleteTransactions() {
  const queryClient = useQueryClient();

  return useApiMutation<void, internal_domain_transaction_SoftDeleteTxnsReq>(
    (data) => TransactionService.deleteTransaction(data),
    {
      onSuccess: () => {
        // Invalidate and refetch transactions list
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        // Invalidate user data (lifetime_income, lifetime_expense, etc.)
        queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
        // Invalidate accounts (account balances may have changed)
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
      },
      showToastOnSuccess: true,
      successMessage: 'Transactions deleted successfully',
      showToastOnError: true,
    }
  );
}

/**
 * Update transaction hook
 * Updates an existing transaction for the authenticated user
 */
export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useApiMutation<
    internal_domain_transaction_Trasaction,
    internal_domain_transaction_UpdateTxnReq
  >(
    (data) => {
      return TransactionService.putTransaction(data.id, data);
    },
    {
      onSuccess: () => {
        // Invalidate and refetch transactions list to get fresh data
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        // Invalidate user data (lifetime_income, lifetime_expense, etc.)
        queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
        // Invalidate accounts (account balances may have changed)
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
      },
      showToastOnSuccess: true,
      successMessage: 'Transaction updated successfully',
      showToastOnError: true,
    }
  );
}

/**
 * Parse transaction image hook
 * Parses transaction details from an uploaded image for the authenticated user
 */
export function useParseTransactionImage() {
  return useApiMutation<internal_domain_transaction_ParsedTxnRes, File>(
    (file) => {
      return TransactionService.postTransactionImageParse(file);
    },
    {
      showToastOnError: true,
      showToastOnSuccess: false,
    }
  );
}
