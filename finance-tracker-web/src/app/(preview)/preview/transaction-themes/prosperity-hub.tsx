'use client';

import { formatDate, formatRupees, getTypeColor } from '@/components/shared/utils';
import { ChevronLeft, ChevronRight, Filter, Search, X, Sparkles } from 'lucide-react';
import type { TransactionThemeProps } from './types';

export default function ProsperityHubTransactionTheme({
  transactions,
  isDark,
  filters,
  onFilterChange,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
  accounts,
  categories,
  merchants,
}: TransactionThemeProps) {
  const handleClearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters =
    filters.accountId ||
    filters.categoryId ||
    filters.merchantId ||
    filters.type ||
    filters.search ||
    filters.dateFrom ||
    filters.dateTo;

  const accentColors = ['orange', 'blue', 'emerald', 'violet'];
  const getAccentForIndex = (index: number) => accentColors[index % accentColors.length];

  return (
    <div
      className={`min-h-screen w-full ${
        isDark
          ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'
          : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'
      }`}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

        .prosperity-hub-transactions {
          font-family: 'Manrope', -apple-system, sans-serif;
        }

        @keyframes rainbow-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes colorful-fade {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes sparkle {
          0%, 100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1) rotate(180deg);
          }
        }

        .prosperity-row {
          animation: colorful-fade 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          opacity: 0;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .prosperity-row:hover {
          transform: translateX(6px);
        }

        .multi-accent-0 {
          border-left: 3px solid transparent;
          transition: border-color 0.3s ease;
        }

        .multi-accent-0:hover {
          border-left-color: #f97316;
        }

        .multi-accent-1 {
          border-left: 3px solid transparent;
          transition: border-color 0.3s ease;
        }

        .multi-accent-1:hover {
          border-left-color: #3b82f6;
        }

        .multi-accent-2 {
          border-left: 3px solid transparent;
          transition: border-color 0.3s ease;
        }

        .multi-accent-2:hover {
          border-left-color: #10b981;
        }

        .multi-accent-3 {
          border-left: 3px solid transparent;
          transition: border-color 0.3s ease;
        }

        .multi-accent-3:hover {
          border-left-color: #8b5cf6;
        }

        .rainbow-border {
          position: relative;
          background: linear-gradient(135deg, #f97316, #3b82f6, #10b981, #8b5cf6, #f97316);
          background-size: 300% 300%;
          animation: rainbow-shift 8s ease infinite;
        }

        .rainbow-border::before {
          content: '';
          position: absolute;
          inset: 1px;
          border-radius: inherit;
          background: ${isDark ? '#0f172a' : '#ffffff'};
        }

        .sparkle-icon {
          animation: sparkle 3s ease-in-out infinite;
        }

        .gradient-multi {
          background: linear-gradient(135deg, #f97316, #3b82f6, #10b981, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          background-size: 300% 300%;
          animation: rainbow-shift 8s ease infinite;
        }
      `}</style>

      <div className="prosperity-hub-transactions max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2.5 rounded-xl rainbow-border`}>
              <div className="relative z-10">
                <Sparkles
                  className={`h-6 w-6 sparkle-icon ${isDark ? 'text-orange-400' : 'text-orange-600'}`}
                />
              </div>
            </div>
            <h1
              className={`text-4xl font-extrabold ${isDark ? 'gradient-multi' : 'text-slate-900'}`}
            >
              Transaction Hub
            </h1>
          </div>
          <div className="flex items-center justify-between">
            <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {transactions.length} total • Viewing page {page}/{totalPages}
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <div className="w-2 h-2 rounded-full bg-violet-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div
          className={`mb-6 p-5 rounded-xl border backdrop-blur-sm ${
            isDark
              ? 'bg-slate-900/60 border-slate-800 shadow-xl'
              : 'bg-white border-slate-200 shadow-md'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className={`h-4 w-4 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
              <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Filters & Options
              </span>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                  isDark
                    ? 'text-slate-400 hover:text-white hover:bg-orange-500/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-orange-50'
                }`}
              >
                <X className="h-3 w-3 inline mr-1" />
                Reset
              </button>
            )}
          </div>

          <div className="grid grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search
                className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`}
              />
              <input
                type="text"
                placeholder="Quick search..."
                value={filters.search || ''}
                onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
                className={`w-full pl-10 pr-3 py-2.5 text-sm font-medium rounded-lg border transition-all ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
                    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
                } focus:outline-none`}
              />
            </div>

            {/* Account Filter */}
            <select
              value={filters.accountId || ''}
              onChange={(e) =>
                onFilterChange({ ...filters, accountId: e.target.value || undefined })
              }
              className={`px-3 py-2.5 text-sm font-medium rounded-lg border transition-all ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              } focus:outline-none`}
            >
              <option value="">All Accounts</option>
              {accounts?.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.account_name || 'Unnamed'}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={filters.categoryId || ''}
              onChange={(e) =>
                onFilterChange({ ...filters, categoryId: e.target.value || undefined })
              }
              className={`px-3 py-2.5 text-sm font-medium rounded-lg border transition-all ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                  : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
              } focus:outline-none`}
            >
              <option value="">All Categories</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name || 'Unnamed'}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={filters.type || ''}
              onChange={(e) => onFilterChange({ ...filters, type: e.target.value || undefined })}
              className={`px-3 py-2.5 text-sm font-medium rounded-lg border transition-all ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'
                  : 'bg-white border-slate-300 text-slate-900 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'
              } focus:outline-none`}
            >
              <option value="">All Types</option>
              <option value="DEBIT">Debit</option>
              <option value="CREDIT">Credit</option>
              <option value="INCOME">Income</option>
              <option value="SUBSCRIPTION">Subscription</option>
              <option value="INVESTMENT">Investment</option>
              <option value="REFUND">Refund</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div
          className={`rounded-xl border overflow-hidden backdrop-blur-sm ${
            isDark
              ? 'bg-slate-900/60 border-slate-800 shadow-xl'
              : 'bg-white border-slate-200 shadow-md'
          }`}
        >
          {/* Table Header */}
          <div
            className={`grid grid-cols-12 gap-4 px-6 py-4 text-xs font-bold border-b ${
              isDark
                ? 'bg-slate-800/80 border-slate-800 text-slate-400'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <div className="col-span-2">DATE</div>
            <div className="col-span-3">DESCRIPTION</div>
            <div className="col-span-2">ACCOUNT</div>
            <div className="col-span-2">CATEGORY</div>
            <div className="col-span-1">TYPE</div>
            <div className="col-span-2 text-right">AMOUNT</div>
          </div>

          {/* Table Body */}
          <div className={`divide-y ${isDark ? 'divide-slate-800/50' : 'divide-slate-100'}`}>
            {transactions.map((txn, index) => {
              const accent = getAccentForIndex(index);
              return (
                <div
                  key={txn.id}
                  className={`prosperity-row multi-accent-${index % 4} grid grid-cols-12 gap-4 px-6 py-4 ${
                    isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                  }`}
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <div
                    className={`col-span-2 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                  >
                    {formatDate((txn as any).transaction_date || txn.created_at || '')}
                  </div>
                  <div
                    className={`col-span-3 text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}
                  >
                    {txn.description || 'No description'}
                  </div>
                  <div
                    className={`col-span-2 text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}
                  >
                    {txn.account_name || 'N/A'}
                  </div>
                  <div
                    className={`col-span-2 text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}
                  >
                    {txn.category_name || 'Uncategorized'}
                  </div>
                  <div className="col-span-1">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                        txn.type === 'INCOME'
                          ? isDark
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : txn.type === 'DEBIT'
                            ? isDark
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                            : accent === 'orange'
                              ? isDark
                                ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                                : 'bg-orange-100 text-orange-800 border border-orange-300'
                              : accent === 'blue'
                                ? isDark
                                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                                  : 'bg-blue-100 text-blue-800 border border-blue-300'
                                : accent === 'emerald'
                                  ? isDark
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : isDark
                                    ? 'bg-violet-500/10 text-violet-400 border border-violet-500/30'
                                    : 'bg-violet-100 text-violet-800 border border-violet-300'
                      }`}
                    >
                      {txn.type || 'N/A'}
                    </span>
                  </div>
                  <div
                    className={`col-span-2 text-right text-sm font-bold ${
                      txn.type === 'INCOME'
                        ? isDark
                          ? 'text-emerald-400'
                          : 'text-emerald-700'
                        : txn.type === 'DEBIT'
                          ? isDark
                            ? 'text-rose-400'
                            : 'text-rose-700'
                          : accent === 'orange'
                            ? isDark
                              ? 'text-orange-400'
                              : 'text-orange-700'
                            : accent === 'blue'
                              ? isDark
                                ? 'text-blue-400'
                                : 'text-blue-700'
                              : accent === 'emerald'
                                ? isDark
                                  ? 'text-emerald-400'
                                  : 'text-emerald-700'
                                : isDark
                                  ? 'text-violet-400'
                                  : 'text-violet-700'
                    }`}
                  >
                    {txn.type === 'INCOME' || txn.type === 'CREDIT'
                      ? '+'
                      : txn.type === 'DEBIT'
                        ? '-'
                        : ''}
                    {formatRupees(txn.amount || 0)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {transactions.length === 0 && (
            <div className="py-16 text-center">
              <Sparkles
                className={`h-12 w-12 mx-auto mb-3 ${isDark ? 'text-slate-700' : 'text-slate-300'}`}
              />
              <p className={`text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                No transactions found
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
              >
                Items per page:
              </span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white focus:border-orange-500'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-orange-500'
                } focus:outline-none`}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className={`p-2.5 rounded-lg border transition-all ${
                  page === 1
                    ? isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                      : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                    : isDark
                      ? 'bg-slate-800 border-slate-700 text-white hover:bg-gradient-to-r hover:from-orange-600 hover:to-blue-600 hover:border-transparent'
                      : 'bg-white border-slate-300 text-slate-900 hover:bg-gradient-to-r hover:from-orange-600 hover:to-blue-600 hover:text-white hover:border-transparent'
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-700'}`}>
                {page} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
                className={`p-2.5 rounded-lg border transition-all ${
                  page === totalPages
                    ? isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                      : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                    : isDark
                      ? 'bg-slate-800 border-slate-700 text-white hover:bg-gradient-to-r hover:from-emerald-600 hover:to-violet-600 hover:border-transparent'
                      : 'bg-white border-slate-300 text-slate-900 hover:bg-gradient-to-r hover:from-emerald-600 hover:to-violet-600 hover:text-white hover:border-transparent'
                }`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
