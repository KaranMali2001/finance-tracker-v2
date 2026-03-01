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
      enabled: isLoaded && isSignedIn,
      showToastOnError: true,
    }
  );
}

export function useInvestmentGoalById(id?: string) {
  const { isLoaded, isSignedIn } = useAuth();

  return useApiQuery<internal_domain_investment_Goal>(
    ['investment-goals', id],
    () => {
      if (!id) {
        throw new Error('Goal ID is required');
      }
      return InvestmentService.getInvestmentGoal1(id);
    },
    {
      enabled: isLoaded && isSignedIn && !!id,
      showToastOnError: true,
    }
  );
}

export function useCreateInvestmentGoal() {
  const queryClient = useQueryClient();

  return useApiMutation<internal_domain_investment_Goal, internal_domain_investment_CreateGoalReq>(
    (data) => InvestmentService.postInvestmentGoal(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['investment-goals'] });
      },
      showToastOnSuccess: true,
      successMessage: 'Investment goal created successfully',
      showToastOnError: true,
    }
  );
}

export function useDeleteInvestmentGoal() {
  const queryClient = useQueryClient();

  return useApiMutation<void, string>((id) => InvestmentService.deleteInvestmentGoal(id), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investment-goals'] });
    },
    showToastOnSuccess: true,
    successMessage: 'Investment goal deleted successfully',
    showToastOnError: true,
  });
}

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
        queryClient.invalidateQueries({ queryKey: ['investment-goals'] });
        queryClient.invalidateQueries({ queryKey: ['investment-goals', variables.id] });
      },
      showToastOnSuccess: true,
      successMessage: 'Investment goal updated successfully',
      showToastOnError: true,
    }
  );
}
