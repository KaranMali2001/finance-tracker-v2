'use client';

import { formatDate, formatRupees, getTypeColor } from '@/components/shared/utils';
import { ChevronLeft, ChevronRight, Filter, Search, X } from 'lucide-react';
import type { TransactionThemeProps } from './types';

export default function MidnightProTransactionTheme({
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

  return (
    <div
      className={`min-h-screen w-full ${
        isDark
          ? 'bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950'
          : 'bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100'
      }`}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');

        .midnight-pro-transactions {
          font-family: 'Inter', -apple-system, sans-serif;
        }

        .mono-font {
          font-family: 'JetBrains Mono', monospace;
        }

        @keyframes neon-pulse {
          0%, 100% { box-shadow: 0 0 5px currentColor, 0 0 10px currentColor; }
          50% { box-shadow: 0 0 10px currentColor, 0 0 20px currentColor; }
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .transaction-row {
          animation: slide-in 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          opacity: 0;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .transaction-row:hover {
          transform: translateX(4px);
        }

        .neon-border {
          position: relative;
        }

        .neon-border::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, #818cf8, #c084fc, #818cf8);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .neon-border:hover::after {
          opacity: 1;
        }
      `}</style>

      <div className="midnight-pro-transactions max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1
            className={`text-4xl font-bold mb-2 ${
              isDark
                ? 'bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent'
                : 'text-slate-900'
            }`}
          >
            Transactions
          </h1>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} • Page {page} of{' '}
            {totalPages}
          </p>
        </div>

        {/* Filters */}
        <div
          className={`mb-6 p-4 rounded-xl border backdrop-blur-sm ${
            isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className={`h-4 w-4 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
              <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Filters
              </span>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className={`text-xs font-medium transition-colors ${
                  isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <X className="h-3 w-3 inline mr-1" />
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search
                className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`}
              />
              <input
                type="text"
                placeholder="Search description..."
                value={filters.search || ''}
                onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
                className={`w-full pl-10 pr-3 py-2 text-sm rounded-lg border transition-colors ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500'
                } focus:outline-none focus:ring-1 focus:ring-indigo-500`}
              />
            </div>

            {/* Account Filter */}
            <select
              value={filters.accountId || ''}
              onChange={(e) =>
                onFilterChange({ ...filters, accountId: e.target.value || undefined })
              }
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                  : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500'
              } focus:outline-none focus:ring-1 focus:ring-indigo-500`}
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
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                  : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500'
              } focus:outline-none focus:ring-1 focus:ring-indigo-500`}
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
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                  : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500'
              } focus:outline-none focus:ring-1 focus:ring-indigo-500`}
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
            isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          {/* Table Header */}
          <div
            className={`grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold border-b ${
              isDark
                ? 'bg-slate-800/50 border-slate-800 text-slate-400'
                : 'bg-slate-50 border-slate-200 text-slate-600'
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
          <div className="divide-y divide-slate-800/50">
            {transactions.map((txn, index) => (
              <div
                key={txn.id}
                className={`transaction-row neon-border grid grid-cols-12 gap-4 px-6 py-4 ${
                  isDark
                    ? 'hover:bg-indigo-500/5 border-slate-800/50'
                    : 'hover:bg-indigo-50/50 border-slate-100'
                }`}
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                <div
                  className={`col-span-2 text-sm mono-font ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                >
                  {formatDate((txn as any).transaction_date || txn.created_at || '')}
                </div>
                <div
                  className={`col-span-3 text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-900'}`}
                >
                  {txn.description || 'No description'}
                </div>
                <div
                  className={`col-span-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                >
                  {txn.account_name || 'N/A'}
                </div>
                <div
                  className={`col-span-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                >
                  {txn.category_name || 'Uncategorized'}
                </div>
                <div className="col-span-1">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getTypeColor(txn.type || '')}`}
                  >
                    {txn.type || 'N/A'}
                  </span>
                </div>
                <div
                  className={`col-span-2 text-right text-sm font-bold mono-font ${
                    txn.type === 'INCOME'
                      ? 'text-emerald-500'
                      : txn.type === 'DEBIT'
                        ? 'text-rose-500'
                        : isDark
                          ? 'text-slate-300'
                          : 'text-slate-700'
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
            ))}
          </div>

          {/* Empty State */}
          {transactions.length === 0 && (
            <div className="py-12 text-center">
              <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                No transactions found
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Rows per page:
              </span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500'
                } focus:outline-none focus:ring-1 focus:ring-indigo-500`}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className={`p-2 rounded-lg transition-colors ${
                  page === 1
                    ? isDark
                      ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : isDark
                      ? 'bg-slate-800 text-white hover:bg-indigo-600'
                      : 'bg-white text-slate-900 hover:bg-indigo-600 hover:text-white border border-slate-300'
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Page {page} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
                className={`p-2 rounded-lg transition-colors ${
                  page === totalPages
                    ? isDark
                      ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : isDark
                      ? 'bg-slate-800 text-white hover:bg-indigo-600'
                      : 'bg-white text-slate-900 hover:bg-indigo-600 hover:text-white border border-slate-300'
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
