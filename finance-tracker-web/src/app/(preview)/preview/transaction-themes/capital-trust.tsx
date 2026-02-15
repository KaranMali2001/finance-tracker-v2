'use client';

import { formatDate, formatRupees, getTypeColor } from '@/components/shared/utils';
import { ChevronLeft, ChevronRight, Filter, Search, X, TrendingUp } from 'lucide-react';
import type { TransactionThemeProps } from './types';

export default function CapitalTrustTransactionTheme({
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
          ? 'bg-gradient-to-br from-slate-950 via-emerald-950/20 to-slate-900'
          : 'bg-gradient-to-br from-emerald-50/30 via-teal-50/20 to-white'
      }`}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .capital-trust-transactions {
          font-family: 'Inter', -apple-system, sans-serif;
        }

        @keyframes growth-slide {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes emerald-pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
          }
        }

        @keyframes wave {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(5px); }
        }

        .growth-row {
          animation: growth-slide 0.45s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          opacity: 0;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .growth-row:hover {
          transform: scale(1.005);
          background: ${
            isDark
              ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.05) 0%, rgba(20, 184, 166, 0.05) 100%)'
              : 'linear-gradient(90deg, rgba(16, 185, 129, 0.08) 0%, rgba(20, 184, 166, 0.08) 100%)'
          };
        }

        .emerald-glow {
          text-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
        }

        .teal-accent {
          position: relative;
        }

        .teal-accent::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(180deg, #10b981, #14b8a6, #10b981);
          opacity: 0;
          transform: scaleY(0);
          transition: transform 0.3s ease, opacity 0.3s ease;
        }

        .teal-accent:hover::before {
          opacity: 1;
          transform: scaleY(1);
        }

        .fresh-border {
          border: 1px solid ${isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.3)'};
          box-shadow: 0 4px 20px ${isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.15)'};
        }

        .gradient-text {
          background: linear-gradient(135deg, #10b981, #14b8a6, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      <div className="capital-trust-transactions max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`p-2.5 rounded-xl ${
                isDark
                  ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30'
                  : 'bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-300'
              }`}
            >
              <TrendingUp
                className={`h-6 w-6 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}
              />
            </div>
            <h1
              className={`text-4xl font-bold ${
                isDark ? 'gradient-text emerald-glow' : 'text-slate-900'
              }`}
            >
              Transaction Overview
            </h1>
          </div>
          <div className="flex items-center justify-between">
            <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Displaying {transactions.length} transactions • Page {page} of {totalPages}
            </p>
            <div
              className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full ${
                isDark
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Data
            </div>
          </div>
        </div>

        {/* Filters */}
        <div
          className={`mb-6 p-5 rounded-xl fresh-border backdrop-blur-sm ${
            isDark ? 'bg-slate-900/60' : 'bg-white'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className={`h-4 w-4 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`} />
              <span
                className={`text-sm font-semibold ${isDark ? 'text-emerald-300' : 'text-slate-900'}`}
              >
                Filter Options
              </span>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                  isDark
                    ? 'text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10'
                    : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50'
                }`}
              >
                <X className="h-3 w-3 inline mr-1" />
                Clear all
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
                placeholder="Search transactions..."
                value={filters.search || ''}
                onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
                className={`w-full pl-10 pr-3 py-2.5 text-sm rounded-lg border transition-all ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-emerald-100 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                } focus:outline-none`}
              />
            </div>

            {/* Account Filter */}
            <select
              value={filters.accountId || ''}
              onChange={(e) =>
                onFilterChange({ ...filters, accountId: e.target.value || undefined })
              }
              className={`px-3 py-2.5 text-sm rounded-lg border transition-all ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-emerald-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                  : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
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
              className={`px-3 py-2.5 text-sm rounded-lg border transition-all ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-emerald-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
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
              className={`px-3 py-2.5 text-sm rounded-lg border transition-all ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-emerald-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                  : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
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
          className={`rounded-xl fresh-border overflow-hidden backdrop-blur-sm ${
            isDark ? 'bg-slate-900/60' : 'bg-white'
          }`}
        >
          {/* Table Header */}
          <div
            className={`grid grid-cols-12 gap-4 px-6 py-4 text-xs font-bold border-b ${
              isDark
                ? 'bg-gradient-to-r from-emerald-950/50 to-teal-950/50 border-emerald-900/30 text-emerald-400'
                : 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 text-emerald-900'
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
            {transactions.map((txn, index) => (
              <div
                key={txn.id}
                className={`growth-row teal-accent grid grid-cols-12 gap-4 px-6 py-4 relative ${
                  isDark ? '' : ''
                }`}
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                <div
                  className={`col-span-2 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                >
                  {formatDate((txn as any).transaction_date || txn.created_at || '')}
                </div>
                <div
                  className={`col-span-3 text-sm font-semibold truncate ${isDark ? 'text-emerald-100' : 'text-slate-900'}`}
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
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                      txn.type === 'INCOME'
                        ? isDark
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : txn.type === 'DEBIT'
                          ? isDark
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                          : isDark
                            ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                            : 'bg-teal-100 text-teal-800 border border-teal-300'
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
                        : isDark
                          ? 'text-teal-400'
                          : 'text-teal-700'
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
            <div className="py-16 text-center">
              <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                No transactions available
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
              >
                Rows per page:
              </span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-emerald-100 focus:border-emerald-500'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500'
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
                      ? 'bg-slate-800 border-slate-700 text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-500'
                      : 'bg-white border-slate-300 text-slate-900 hover:bg-emerald-50 hover:border-emerald-500'
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span
                className={`text-sm font-medium ${isDark ? 'text-emerald-300' : 'text-slate-700'}`}
              >
                Page {page} of {totalPages}
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
                      ? 'bg-slate-800 border-slate-700 text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-500'
                      : 'bg-white border-slate-300 text-slate-900 hover:bg-emerald-50 hover:border-emerald-500'
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
