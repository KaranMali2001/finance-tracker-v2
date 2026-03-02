'use client';

import { useAuth } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';
import type {
  internal_domain_investment_CreateGoalInvestmentReq,
  internal_domain_investment_CreateGoalReq,
  internal_domain_investment_EnqueueAutoLinkReq,
  internal_domain_investment_Goal,
  internal_domain_investment_GoalInvestment,
  internal_domain_investment_GoalTransaction,
  internal_domain_investment_LinkTransactionReq,
  internal_domain_investment_UpdateGoalInvestmentReq,
  internal_domain_investment_UpdateGoals,
} from '@/generated/api';
import { InvestmentService } from '@/generated/api';
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
        queryClient.invalidateQueries({
          queryKey: ['investment-goals', variables.id],
        });
      },
      showToastOnSuccess: true,
      successMessage: 'Investment goal updated successfully',
      showToastOnError: true,
    }
  );
}

// ── Investment Rules ──────────────────────────────────────────────────────────

interface InvestmentRuleFilters {
  goalId?: string;
  contributionType?: string;
  investmentType?: string;
}

export function useInvestmentRules(filters?: InvestmentRuleFilters) {
  const { isLoaded, isSignedIn } = useAuth();

  return useApiQuery<Array<internal_domain_investment_GoalInvestment>>(
    ['investment-rules', filters?.goalId, filters?.contributionType, filters?.investmentType],
    () =>
      InvestmentService.getInvestmentRule(
        filters?.goalId,
        filters?.contributionType,
        filters?.investmentType
      ),
    {
      enabled: isLoaded && isSignedIn,
      showToastOnError: true,
    }
  );
}

export function useInvestmentRuleById(id?: string) {
  const { isLoaded, isSignedIn } = useAuth();

  return useApiQuery<internal_domain_investment_GoalInvestment>(
    ['investment-rules', id],
    () => {
      if (!id) throw new Error('Rule ID is required');
      return InvestmentService.getInvestmentRule1(id);
    },
    {
      enabled: isLoaded && isSignedIn && !!id,
      showToastOnError: true,
    }
  );
}

export function useCreateInvestmentRule() {
  const queryClient = useQueryClient();

  return useApiMutation<
    internal_domain_investment_GoalInvestment,
    internal_domain_investment_CreateGoalInvestmentReq
  >((data) => InvestmentService.postInvestmentRule(data), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investment-rules'] });
    },
    showToastOnSuccess: true,
    successMessage: 'Investment rule created successfully',
    showToastOnError: true,
  });
}

export function useUpdateInvestmentRule() {
  const queryClient = useQueryClient();

  return useApiMutation<
    internal_domain_investment_GoalInvestment,
    { id: string; data: internal_domain_investment_UpdateGoalInvestmentReq }
  >(({ id, data }) => InvestmentService.putInvestmentRule(id, data), {
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['investment-rules'] });
      queryClient.invalidateQueries({
        queryKey: ['investment-rules', variables.id],
      });
    },
    showToastOnSuccess: true,
    successMessage: 'Investment rule updated successfully',
    showToastOnError: true,
  });
}

export function useDeleteInvestmentRule() {
  const queryClient = useQueryClient();

  return useApiMutation<void, string>((id) => InvestmentService.deleteInvestmentRule(id), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investment-rules'] });
    },
    showToastOnSuccess: true,
    successMessage: 'Investment rule deleted successfully',
    showToastOnError: true,
  });
}

// ── Transactions ──────────────────────────────────────────────────────────────

export function useRuleTransactions(ruleId?: string) {
  const { isLoaded, isSignedIn } = useAuth();

  return useApiQuery<Array<internal_domain_investment_GoalTransaction>>(
    ['investment-rule-transactions', ruleId],
    () => {
      if (!ruleId) throw new Error('Rule ID is required');
      return InvestmentService.getInvestmentRuleTransactions(ruleId);
    },
    {
      enabled: isLoaded && isSignedIn && !!ruleId,
      showToastOnError: true,
    }
  );
}

export function useGoalTransactions(goalId?: string) {
  const { isLoaded, isSignedIn } = useAuth();

  return useApiQuery<Array<internal_domain_investment_GoalTransaction>>(
    ['investment-goal-transactions', goalId],
    () => {
      if (!goalId) throw new Error('Goal ID is required');
      return InvestmentService.getInvestmentGoalTransactions(goalId);
    },
    {
      enabled: isLoaded && isSignedIn && !!goalId,
      showToastOnError: true,
    }
  );
}

export function useLinkTransaction() {
  const queryClient = useQueryClient();

  return useApiMutation<
    internal_domain_investment_GoalTransaction,
    internal_domain_investment_LinkTransactionReq
  >((data) => InvestmentService.postInvestmentLink(data), {
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['investment-rule-transactions'],
      });
      if (data?.investment_id) {
        queryClient.invalidateQueries({
          queryKey: ['investment-rule-transactions', data.investment_id],
        });
      }
    },
    showToastOnSuccess: true,
    successMessage: 'Transaction linked successfully',
    showToastOnError: true,
  });
}

export function useUnlinkTransaction() {
  const queryClient = useQueryClient();

  return useApiMutation<void, { linkId: string; ruleId?: string }>(
    ({ linkId }) => InvestmentService.deleteInvestmentLink(linkId),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({
          queryKey: ['investment-rule-transactions'],
        });
        if (variables.ruleId) {
          queryClient.invalidateQueries({
            queryKey: ['investment-rule-transactions', variables.ruleId],
          });
        }
      },
      showToastOnSuccess: true,
      successMessage: 'Transaction unlinked successfully',
      showToastOnError: true,
    }
  );
}

// ── Auto-link ─────────────────────────────────────────────────────────────────

export function useEnqueueAutoLink() {
  return useApiMutation<void, internal_domain_investment_EnqueueAutoLinkReq>(
    (data) => InvestmentService.postInvestmentAutolink(data),
    {
      showToastOnSuccess: true,
      successMessage: 'Auto-link job enqueued. Transactions will be matched shortly.',
      showToastOnError: true,
    }
  );
}
