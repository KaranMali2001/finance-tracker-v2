'use client';

import { formatDate, formatRupees, getTypeColor } from '@/components/shared/utils';
import { ChevronLeft, ChevronRight, Filter, Search, X, Crown } from 'lucide-react';
import type { TransactionThemeProps } from './types';

export default function WealthReserveTransactionTheme({
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
          ? 'bg-gradient-to-br from-stone-950 via-amber-950/30 to-stone-900'
          : 'bg-gradient-to-br from-stone-50 via-amber-50/40 to-stone-100'
      }`}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');

        .wealth-reserve-transactions {
          font-family: 'DM Sans', -apple-system, sans-serif;
        }

        .luxury-serif {
          font-family: 'Playfair Display', serif;
        }

        @keyframes gold-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes elegant-fade {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gold-glow {
          0%, 100% {
            box-shadow: 0 0 10px rgba(212, 175, 55, 0.2),
                        inset 0 0 10px rgba(212, 175, 55, 0.1);
          }
          50% {
            box-shadow: 0 0 20px rgba(212, 175, 55, 0.4),
                        inset 0 0 15px rgba(212, 175, 55, 0.2);
          }
        }

        .wealth-row {
          animation: elegant-fade 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          opacity: 0;
          transition: all 0.3s ease;
        }

        .wealth-row:hover {
          background: ${
            isDark
              ? 'linear-gradient(90deg, rgba(212, 175, 55, 0.05) 0%, transparent 100%)'
              : 'linear-gradient(90deg, rgba(212, 175, 55, 0.08) 0%, transparent 100%)'
          };
        }

        .gold-accent {
          position: relative;
        }

        .gold-accent::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 0;
          background: linear-gradient(180deg, transparent, #d4af37, transparent);
          transition: height 0.3s ease;
        }

        .gold-accent:hover::before {
          height: 80%;
        }

        .shimmer-text {
          background: linear-gradient(90deg, #d4af37 0%, #ffd700 50%, #d4af37 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gold-shimmer 3s linear infinite;
        }

        .luxury-border {
          border: 1px solid ${isDark ? 'rgba(212, 175, 55, 0.3)' : 'rgba(212, 175, 55, 0.4)'};
          position: relative;
        }

        .luxury-border::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.5), rgba(255, 215, 0, 0.3), rgba(212, 175, 55, 0.5));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .luxury-border:hover::after {
          opacity: 1;
        }
      `}</style>

      <div className="wealth-reserve-transactions max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`p-2.5 rounded-xl ${
                isDark
                  ? 'bg-gradient-to-br from-amber-900/40 to-yellow-900/40 border border-amber-700/30'
                  : 'bg-gradient-to-br from-amber-100 to-yellow-100 border border-amber-300'
              }`}
            >
              <Crown className={`h-6 w-6 ${isDark ? 'text-amber-500' : 'text-amber-700'}`} />
            </div>
            <h1
              className={`text-4xl font-bold luxury-serif ${
                isDark ? 'shimmer-text' : 'text-stone-900'
              }`}
            >
              Transaction Ledger
            </h1>
          </div>
          <div className="flex items-center justify-between">
            <p className={`text-sm ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
              {transactions.length} entries • Volume {page}/{totalPages}
            </p>
            <div className={`text-xs font-medium ${isDark ? 'text-amber-600' : 'text-amber-700'}`}>
              {new Date().toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div
          className={`mb-6 p-5 rounded-xl luxury-border backdrop-blur-sm ${
            isDark ? 'bg-stone-900/60 shadow-2xl' : 'bg-white shadow-lg'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className={`h-4 w-4 ${isDark ? 'text-amber-500' : 'text-amber-700'}`} />
              <span
                className={`text-sm font-semibold ${isDark ? 'text-amber-200' : 'text-stone-900'}`}
              >
                Refine Selection
              </span>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                  isDark
                    ? 'text-stone-400 hover:text-amber-300 hover:bg-amber-900/20'
                    : 'text-stone-600 hover:text-amber-900 hover:bg-amber-50'
                }`}
              >
                <X className="h-3 w-3 inline mr-1" />
                Clear
              </button>
            )}
          </div>

          <div className="grid grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search
                className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                  isDark ? 'text-stone-600' : 'text-stone-400'
                }`}
              />
              <input
                type="text"
                placeholder="Search ledger..."
                value={filters.search || ''}
                onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
                className={`w-full pl-10 pr-3 py-2.5 text-sm rounded-lg border transition-all ${
                  isDark
                    ? 'bg-stone-800 border-stone-700 text-amber-100 placeholder:text-stone-600 focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20'
                    : 'bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20'
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
                  ? 'bg-stone-800 border-stone-700 text-amber-100 focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20'
                  : 'bg-white border-stone-300 text-stone-900 focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20'
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
                  ? 'bg-stone-800 border-stone-700 text-amber-100 focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20'
                  : 'bg-white border-stone-300 text-stone-900 focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20'
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
                  ? 'bg-stone-800 border-stone-700 text-amber-100 focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20'
                  : 'bg-white border-stone-300 text-stone-900 focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20'
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
          className={`rounded-xl luxury-border overflow-hidden backdrop-blur-sm ${
            isDark ? 'bg-stone-900/60 shadow-2xl' : 'bg-white shadow-lg'
          }`}
        >
          {/* Table Header */}
          <div
            className={`grid grid-cols-12 gap-4 px-6 py-4 text-xs font-bold border-b ${
              isDark
                ? 'bg-gradient-to-r from-amber-950/50 to-stone-900/50 border-amber-900/30 text-amber-400'
                : 'bg-gradient-to-r from-amber-50 to-stone-50 border-amber-200 text-amber-900'
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
          <div className={`divide-y ${isDark ? 'divide-stone-800/50' : 'divide-stone-200'}`}>
            {transactions.map((txn, index) => (
              <div
                key={txn.id}
                className={`wealth-row gold-accent grid grid-cols-12 gap-4 px-6 py-4 relative ${
                  isDark ? '' : ''
                }`}
                style={{ animationDelay: `${index * 0.04}s` }}
              >
                <div
                  className={`col-span-2 text-sm font-medium ${isDark ? 'text-stone-400' : 'text-stone-600'}`}
                >
                  {formatDate((txn as any).transaction_date || txn.created_at || '')}
                </div>
                <div
                  className={`col-span-3 text-sm font-semibold truncate ${isDark ? 'text-amber-100' : 'text-stone-900'}`}
                >
                  {txn.description || 'No description'}
                </div>
                <div
                  className={`col-span-2 text-sm ${isDark ? 'text-stone-500' : 'text-stone-600'}`}
                >
                  {txn.account_name || 'N/A'}
                </div>
                <div
                  className={`col-span-2 text-sm ${isDark ? 'text-stone-500' : 'text-stone-600'}`}
                >
                  {txn.category_name || 'Uncategorized'}
                </div>
                <div className="col-span-1">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      txn.type === 'INCOME'
                        ? isDark
                          ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-700/30'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : txn.type === 'DEBIT'
                          ? isDark
                            ? 'bg-rose-900/40 text-rose-400 border border-rose-700/30'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                          : isDark
                            ? 'bg-amber-900/40 text-amber-400 border border-amber-700/30'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
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
                          ? 'text-amber-400'
                          : 'text-amber-700'
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
              <p className={`text-sm italic ${isDark ? 'text-stone-600' : 'text-stone-400'}`}>
                No entries in ledger
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className={`text-sm font-medium ${isDark ? 'text-stone-400' : 'text-stone-600'}`}
              >
                Entries per page:
              </span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                  isDark
                    ? 'bg-stone-800 border-stone-700 text-amber-100 focus:border-amber-600'
                    : 'bg-white border-stone-300 text-stone-900 focus:border-amber-600'
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
                      ? 'bg-stone-900 border-stone-800 text-stone-700 cursor-not-allowed'
                      : 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed'
                    : isDark
                      ? 'bg-stone-800 border-stone-700 text-amber-300 hover:bg-amber-900/40 hover:border-amber-700'
                      : 'bg-white border-stone-300 text-stone-900 hover:bg-amber-100 hover:border-amber-400'
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span
                className={`text-sm font-medium ${isDark ? 'text-amber-300' : 'text-stone-700'}`}
              >
                Volume {page} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
                className={`p-2.5 rounded-lg border transition-all ${
                  page === totalPages
                    ? isDark
                      ? 'bg-stone-900 border-stone-800 text-stone-700 cursor-not-allowed'
                      : 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed'
                    : isDark
                      ? 'bg-stone-800 border-stone-700 text-amber-300 hover:bg-amber-900/40 hover:border-amber-700'
                      : 'bg-white border-stone-300 text-stone-900 hover:bg-amber-100 hover:border-amber-400'
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
