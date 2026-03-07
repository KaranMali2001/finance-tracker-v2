'use client';

import { OpenAPI } from '@/generated/api/core/OpenAPI';
import { useEffect, useRef, useState } from 'react';

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

export type DashboardCardName =
  | 'net_worth_trend'
  | 'spend_by_category'
  | 'budget_health'
  | 'goal_progress'
  | 'account_balances'
  | 'portfolio_mix';

export interface DashboardStreamState {
  net_worth_trend: NetWorthPoint[] | null;
  spend_by_category: CategorySpend[] | null;
  budget_health: BudgetHealthData | null;
  goal_progress: GoalProgressItem[] | null;
  account_balances: AccountBalance[] | null;
  portfolio_mix: PortfolioItem[] | null;
  loading: Set<DashboardCardName>;
  errors: Partial<Record<DashboardCardName, string>>;
  isDone: boolean;
}

const ALL_CARDS: DashboardCardName[] = [
  'net_worth_trend',
  'spend_by_category',
  'budget_health',
  'goal_progress',
  'account_balances',
  'portfolio_mix',
];

function initialState(): DashboardStreamState {
  return {
    net_worth_trend: null,
    spend_by_category: null,
    budget_health: null,
    goal_progress: null,
    account_balances: null,
    portfolio_mix: null,
    loading: new Set(ALL_CARDS),
    errors: {},
    isDone: false,
  };
}

export function useDashboardStream(from: string, to: string, ready = true) {
  const [state, setState] = useState<DashboardStreamState>(initialState);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!from || !to || !ready) return;

    // Cancel previous stream
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState(initialState());

    async function stream() {
      const token =
        typeof OpenAPI.TOKEN === 'function'
          ? await (OpenAPI.TOKEN as () => Promise<string>)()
          : OpenAPI.TOKEN;

      const url = `${OpenAPI.BASE}/dashboard/stream?date_from=${from}&date_to=${to}`;

      let res: Response;
      try {
        res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
      } catch {
        return;
      }

      if (!res.ok || !res.body) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        let chunk: ReadableStreamReadResult<Uint8Array>;
        try {
          chunk = await reader.read();
        } catch {
          break;
        }
        if (chunk.done) break;

        buffer += decoder.decode(chunk.value, { stream: true });

        // SSE messages are separated by double newline
        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';

        for (const part of parts) {
          const lines = part.trim().split('\n');
          let eventName = '';
          let dataStr = '';
          for (const line of lines) {
            if (line.startsWith('event: ')) eventName = line.slice(7).trim();
            if (line.startsWith('data: ')) dataStr = line.slice(6).trim();
          }
          if (!eventName || !dataStr) continue;

          if (eventName === 'done') {
            setState((prev) => ({ ...prev, isDone: true, loading: new Set() }));
            return;
          }

          try {
            const { data, error } = JSON.parse(dataStr) as { data: any; error?: string };
            const card = eventName as DashboardCardName;
            setState((prev) => {
              const loading = new Set(prev.loading);
              loading.delete(card);
              const errors = { ...prev.errors };
              if (error) errors[card] = error;
              return { ...prev, [card]: data ?? null, loading, errors };
            });
          } catch {
            // malformed JSON — skip
          }
        }
      }

      setState((prev) => ({ ...prev, isDone: true, loading: new Set() }));
    }

    stream();

    return () => controller.abort();
  }, [from, to, ready]);

  return state;
}
