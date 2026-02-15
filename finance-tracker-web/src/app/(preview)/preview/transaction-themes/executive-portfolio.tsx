'use client';

import { formatDate, formatRupees, getTypeColor } from '@/components/shared/utils';
import { ChevronLeft, ChevronRight, Filter, Search, X, Briefcase } from 'lucide-react';
import type { TransactionThemeProps } from './types';

export default function ExecutivePortfolioTransactionTheme({
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
          ? 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900'
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-white'
      }`}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600;700&display=swap');

        .executive-portfolio-transactions {
          font-family: 'Work Sans', -apple-system, sans-serif;
        }

        @keyframes professional-slide {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes corporate-pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
          }
          50% {
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0);
          }
        }

        .executive-row {
          animation: professional-slide 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          opacity: 0;
          transition: all 0.2s ease;
        }

        .executive-row:hover {
          transform: translateX(2px);
        }

        .navy-border {
          border-left: 3px solid transparent;
          transition: border-color 0.3s ease;
        }

        .navy-border:hover {
          border-left-color: #3b82f6;
        }

        .corporate-accent::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(180deg, #1e3a8a, #3b82f6, #1e3a8a);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .corporate-accent:hover::before {
          opacity: 1;
        }
      `}</style>

      <div className="executive-portfolio-transactions max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-600/20' : 'bg-blue-100'}`}>
              <Briefcase className={`h-6 w-6 ${isDark ? 'text-blue-400' : 'text-blue-700'}`} />
            </div>
            <h1 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Transaction Portfolio
            </h1>
          </div>
          <div className="flex items-center justify-between">
            <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {transactions.length} transactions • Page {page} of {totalPages}
            </p>
            <div className={`text-xs font-medium ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
              Last updated: {new Date().toLocaleDateString()}
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
              <Filter className={`h-4 w-4 ${isDark ? 'text-blue-400' : 'text-blue-700'}`} />
              <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Filter Transactions
              </span>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                  isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <X className="h-3 w-3 inline mr-1" />
                Clear filters
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
                    ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
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
                  ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              } focus:outline-none`}
            >
              <option value="">All Accounts</option>
              {accounts?.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.account_name || 'Unnamed Account'}
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
                  ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              } focus:outline-none`}
            >
              <option value="">All Categories</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name || 'Unnamed Category'}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={filters.type || ''}
              onChange={(e) => onFilterChange({ ...filters, type: e.target.value || undefined })}
              className={`px-3 py-2.5 text-sm rounded-lg border transition-all ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
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
                ? 'bg-blue-950/50 border-slate-800 text-blue-300'
                : 'bg-blue-50 border-slate-200 text-blue-900'
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
          <div className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
            {transactions.map((txn, index) => (
              <div
                key={txn.id}
                className={`executive-row navy-border grid grid-cols-12 gap-4 px-6 py-4 relative ${
                  isDark ? 'hover:bg-blue-950/30' : 'hover:bg-blue-50/50'
                }`}
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                <div
                  className={`col-span-2 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                >
                  {formatDate((txn as any).transaction_date || txn.created_at || '')}
                </div>
                <div
                  className={`col-span-3 text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}
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
                    className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${
                      txn.type === 'INCOME'
                        ? isDark
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : txn.type === 'DEBIT'
                          ? isDark
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                          : isDark
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
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
            <div className="py-16 text-center">
              <p className={`text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                No transactions to display
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
                    ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
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
                      ? 'bg-slate-800 border-slate-700 text-white hover:bg-blue-600 hover:border-blue-600'
                      : 'bg-white border-slate-300 text-slate-900 hover:bg-blue-600 hover:text-white hover:border-blue-600'
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span
                className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
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
                      ? 'bg-slate-800 border-slate-700 text-white hover:bg-blue-600 hover:border-blue-600'
                      : 'bg-white border-slate-300 text-slate-900 hover:bg-blue-600 hover:text-white hover:border-blue-600'
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
