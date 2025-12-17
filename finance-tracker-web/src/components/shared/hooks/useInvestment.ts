'use client';

import type {
  internal_domain_investment_CreateGoalReq,
  internal_domain_investment_Goal,
  internal_domain_investment_UpdateGoals,
} from '@/generated/api';
import { InvestmentService } from '@/generated/api';
import { useAuth } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import { useApiQuery } from './useApiQuery';

interface InvestmentGoalFilters {
  status?: string;
  targetDateBefore?: string;
  targetDateAfter?: string;
  targetAmountLessThan?: number;
  targetAmountGreaterThan?: number;
  priority?: number;
  createdAtBefore?: string;
  createdAtAfter?: string;
}

/**
 * Get investment goals with optional filters hook
 * Fetches investment goals for the authenticated user with optional filters
 * Only fetches when Clerk is loaded and user is signed in
 */
export function useInvestmentGoals(filters?: InvestmentGoalFilters) {
  const { isLoaded, isSignedIn } = useAuth();

  return useApiQuery<Array<internal_domain_investment_Goal>>(
    [
      'investment-goals',
      filters?.status,
      filters?.targetDateBefore,
      filters?.targetDateAfter,
      filters?.targetAmountLessThan,
      filters?.targetAmountGreaterThan,
      filters?.priority,
      filters?.createdAtBefore,
      filters?.createdAtAfter,
    ],
    () =>
      InvestmentService.getInvestmentGoal(
        filters?.status,
        filters?.targetDateBefore,
        filters?.targetDateAfter,
        filters?.targetAmountLessThan,
        filters?.targetAmountGreaterThan,
        filters?.priority,
        filters?.createdAtBefore,
        filters?.createdAtAfter
      ),
    {
      enabled: isLoaded && isSignedIn, // Only fetch when Clerk is loaded and user is signed in
      showToastOnError: true,
    }
  );
}

/**
 * Get investment goal by ID hook
 * Fetches a specific investment goal by ID for the authenticated user
 * Only fetches when Clerk is loaded, user is signed in, and ID is provided
 */
export function useInvestmentGoalById(id?: string) {
  const { isLoaded, isSignedIn } = useAuth();

  return useApiQuery<internal_domain_investment_Goal>(
    ['investment-goal', id],
    () => {
      if (!id) {
        throw new Error('Goal ID is required');
      }
      return InvestmentService.getInvestmentGoal1(id);
    },
    {
      enabled: isLoaded && isSignedIn && !!id, // Only fetch when Clerk is loaded, user is signed in, and ID is provided
      showToastOnError: true,
    }
  );
}

/**
 * Create investment goal hook
 * Creates a new investment goal for the authenticated user
 */
export function useCreateInvestmentGoal() {
  const queryClient = useQueryClient();

  return useApiMutation<internal_domain_investment_Goal, internal_domain_investment_CreateGoalReq>(
    (data) => InvestmentService.postInvestmentGoal(data),
    {
      onSuccess: () => {
        // Invalidate and refetch investment goals list
        queryClient.invalidateQueries({ queryKey: ['investment-goals'] });
      },
      showToastOnSuccess: true,
      successMessage: 'Investment goal created successfully',
      showToastOnError: true,
    }
  );
}

/**
 * Update investment goal hook
 * Updates an existing investment goal for the authenticated user
 */
export function useUpdateInvestmentGoal() {
  const queryClient = useQueryClient();

  return useApiMutation<
    internal_domain_investment_Goal,
    { id: string; data: internal_domain_investment_UpdateGoals }
  >(
    ({ id, data }) => {
      return InvestmentService.putInvestmentGoal(id, data);
    },
    {
      onSuccess: (_, variables) => {
        // Invalidate and refetch investment goals list
        queryClient.invalidateQueries({ queryKey: ['investment-goals'] });
        // Invalidate specific goal
        queryClient.invalidateQueries({ queryKey: ['investment-goal', variables.id] });
      },
      showToastOnSuccess: true,
      successMessage: 'Investment goal updated successfully',
      showToastOnError: true,
    }
  );
}
