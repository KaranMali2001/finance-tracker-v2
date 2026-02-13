'use client';

import { useAccounts } from '@/components/shared/hooks/useAccount';
import { useCategories, useMerchants } from '@/components/shared/hooks/useStatic';
import { useTransactions } from '@/components/shared/hooks/useTransaction';
import type { Transaction } from '@/components/shared/types';
import { useAuth } from '@clerk/nextjs';
import { Check, Moon, Sun } from 'lucide-react';
import { useMemo, useState } from 'react';
import CapitalTrustTransactionTheme from '../transaction-themes/capital-trust';
import DataPrecisionTransactionTheme from '../transaction-themes/data-precision';
import ExecutivePortfolioTransactionTheme from '../transaction-themes/executive-portfolio';
import MidnightProTransactionTheme from '../transaction-themes/midnight-pro';
import ProsperityHubTransactionTheme from '../transaction-themes/prosperity-hub';
import type { TransactionFilters } from '../transaction-themes/types';
import WealthReserveTransactionTheme from '../transaction-themes/wealth-reserve';

type ThemeId =
  | 'midnight-pro'
  | 'data-precision'
  | 'executive-portfolio'
  | 'wealth-reserve'
  | 'capital-trust'
  | 'prosperity-hub';

interface ThemeOption {
  id: ThemeId;
  name: string;
  description: string;
  component: typeof MidnightProTransactionTheme;
}

const THEMES: ThemeOption[] = [
  {
    id: 'midnight-pro',
    name: 'Midnight Pro',
    description: 'Dark elegance with neon accents',
    component: MidnightProTransactionTheme,
  },
  {
    id: 'data-precision',
    name: 'Data Precision',
    description: 'Bloomberg Terminal inspired',
    component: DataPrecisionTransactionTheme,
  },
  {
    id: 'executive-portfolio',
    name: 'Executive Portfolio',
    description: 'Professional navy/blue theme',
    component: ExecutivePortfolioTransactionTheme,
  },
  {
    id: 'wealth-reserve',
    name: 'Wealth Reserve',
    description: 'Elegant gold & brown luxury',
    component: WealthReserveTransactionTheme,
  },
  {
    id: 'capital-trust',
    name: 'Capital Trust',
    description: 'Growth-focused emerald theme',
    component: CapitalTrustTransactionTheme,
  },
  {
    id: 'prosperity-hub',
    name: 'Prosperity Hub',
    description: 'Multi-tone professional dashboard',
    component: ProsperityHubTransactionTheme,
  },
];

export default function TransactionPreviewPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const { data: transactions, isLoading: transactionsLoading } = useTransactions();
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();
  const { data: merchants } = useMerchants();

  const [selectedTheme, setSelectedTheme] = useState<ThemeId>('midnight-pro');
  const [isDark, setIsDark] = useState(true);
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Filter and paginate transactions
  const { filteredTransactions, totalPages } = useMemo(() => {
    if (!transactions) {
      return { filteredTransactions: [], totalPages: 0 };
    }

    let filtered: Transaction[] = [...transactions];

    // Apply filters
    if (filters.accountId) {
      filtered = filtered.filter((txn) => txn.account_id === filters.accountId);
    }
    if (filters.categoryId) {
      filtered = filtered.filter((txn) => txn.category_id === filters.categoryId);
    }
    if (filters.merchantId) {
      filtered = filtered.filter((txn) => txn.merchant_id === filters.merchantId);
    }
    if (filters.type) {
      filtered = filtered.filter((txn) => txn.type === filters.type);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (txn) =>
          txn.description?.toLowerCase().includes(searchLower) ||
          txn.account_name?.toLowerCase().includes(searchLower) ||
          txn.category_name?.toLowerCase().includes(searchLower) ||
          txn.merchant_name?.toLowerCase().includes(searchLower)
      );
    }
    if (filters.dateFrom) {
      filtered = filtered.filter((txn) => {
        const txnDate = (txn as any).transaction_date || txn.created_at;
        return txnDate && txnDate >= filters.dateFrom!;
      });
    }
    if (filters.dateTo) {
      filtered = filtered.filter((txn) => {
        const txnDate = (txn as any).transaction_date || txn.created_at;
        return txnDate && txnDate <= filters.dateTo!;
      });
    }

    // Sort by date descending (most recent first)
    filtered.sort((a, b) => {
      const dateA = (a as any).transaction_date || a.created_at || '';
      const dateB = (b as any).transaction_date || b.created_at || '';
      return dateB.localeCompare(dateA);
    });

    const total = Math.ceil(filtered.length / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginated = filtered.slice(start, end);

    return {
      filteredTransactions: paginated,
      totalPages: total || 1,
    };
  }, [transactions, filters, page, pageSize]);

  // Reset to page 1 when filters change
  const handleFilterChange = (newFilters: TransactionFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  // Loading state
  if (!isLoaded || transactionsLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mx-auto mb-4" />
          <p className="text-white text-sm font-medium">Loading transactions...</p>
        </div>
      </div>
    );
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-950">
        <div className="text-center max-w-md px-6">
          <h1 className="text-3xl font-bold text-white mb-3">Authentication Required</h1>
          <p className="text-slate-400 mb-6">
            Please sign in to view the transaction preview with your data.
          </p>
          <a
            href="/sign-in"
            className="inline-block px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  // No transactions
  if (!transactions || transactions.length === 0) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-950">
        <div className="text-center max-w-md px-6">
          <h1 className="text-3xl font-bold text-white mb-3">No Transactions Found</h1>
          <p className="text-slate-400 mb-6">
            Create your first transaction to see the theme previews in action.
          </p>
          <a
            href="/dashboard/transactions/new"
            className="inline-block px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Create Transaction
          </a>
        </div>
      </div>
    );
  }

  // Get selected theme component
  const SelectedThemeComponent =
    THEMES.find((t) => t.id === selectedTheme)?.component || MidnightProTransactionTheme;

  return (
    <div className="relative min-h-screen">
      {/* Floating Theme Selector - Top Right */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
        {/* Dark Mode Toggle */}
        <button
          type="button"
          onClick={() => setIsDark(!isDark)}
          className={`group relative p-3 rounded-full backdrop-blur-xl border transition-all duration-300 hover:scale-110 ${
            isDark
              ? 'bg-white/10 border-white/20 hover:bg-white/20'
              : 'bg-slate-900/10 border-slate-900/20 hover:bg-slate-900/20'
          }`}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? (
            <Sun className="h-5 w-5 text-yellow-400" strokeWidth={2} />
          ) : (
            <Moon className="h-5 w-5 text-slate-700" strokeWidth={2} />
          )}
        </button>

        {/* Theme Selector Dropdown */}
        <div
          className={`backdrop-blur-xl rounded-2xl border shadow-2xl transition-all duration-300 ${
            isDark ? 'bg-slate-900/80 border-white/10' : 'bg-white/80 border-slate-200'
          }`}
        >
          <div className="p-3">
            <p
              className={`text-[10px] font-bold tracking-widest uppercase mb-3 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Select Theme
            </p>
            <div className="space-y-1.5">
              {THEMES.map((theme) => {
                const isSelected = selectedTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`w-full flex items-center justify-between gap-4 px-3 py-2.5 rounded-xl text-left transition-all duration-200 ${
                      isSelected
                        ? isDark
                          ? 'bg-indigo-500/20 border border-indigo-400/30'
                          : 'bg-indigo-50 border border-indigo-200'
                        : isDark
                          ? 'hover:bg-white/5 border border-transparent'
                          : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          isSelected
                            ? isDark
                              ? 'text-indigo-300'
                              : 'text-indigo-700'
                            : isDark
                              ? 'text-white'
                              : 'text-slate-900'
                        }`}
                      >
                        {theme.name}
                      </p>
                      <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                        {theme.description}
                      </p>
                    </div>
                    {isSelected && (
                      <Check
                        className={`h-4 w-4 shrink-0 ${
                          isDark ? 'text-indigo-400' : 'text-indigo-600'
                        }`}
                        strokeWidth={2.5}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Theme Preview */}
      <SelectedThemeComponent
        transactions={filteredTransactions}
        isDark={isDark}
        filters={filters}
        onFilterChange={handleFilterChange}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        accounts={accounts}
        categories={categories}
        merchants={merchants}
      />
    </div>
  );
}
