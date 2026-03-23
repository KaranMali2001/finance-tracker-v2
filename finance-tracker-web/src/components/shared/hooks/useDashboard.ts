'use client';

import { OpenAPI } from '@/generated/api/core/OpenAPI';
import { useQuery } from '@tanstack/react-query';

export interface NetWorthPoint {
  month: string;
  running_net_worth: number;
}

export interface CategorySpend {
  category_name: string;
  total_amount: number;
}

export interface BudgetHealthData {
  total_spent: number;
  transaction_count: number;
  months_in_range: number;
  monthly_budget: number;
  scaled_budget: number;
}

export interface GoalProgressItem {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  status: string;
  invested_in_period: number;
}

export interface AccountBalance {
  id: string;
  account_name: string;
  account_type: string;
  current_balance: number;
  period_income: number;
  period_expense: number;
}

export interface PortfolioItem {
  investment_type: string;
  total_value: number;
}

export interface DashboardRes {
  net_worth_trend: NetWorthPoint[];
  spend_by_category: CategorySpend[];
  budget_health: BudgetHealthData;
  goal_progress: GoalProgressItem[];
  account_balances: AccountBalance[];
  portfolio_mix: PortfolioItem[];
}

export function useDashboard(from: string, to: string, ready = true) {
  return useQuery<DashboardRes>({
    queryKey: ['dashboard', from, to],
    enabled: ready && !!from && !!to,
    queryFn: async () => {
      const token =
        typeof OpenAPI.TOKEN === 'function'
          ? await (OpenAPI.TOKEN as () => Promise<string>)()
          : OpenAPI.TOKEN;

      const url = `${OpenAPI.BASE}/dashboard/stream?date_from=${from}&date_to=${to}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error(`Dashboard fetch failed: ${res.status}`);
      }

      return res.json() as Promise<DashboardRes>;
    },
  });
}
