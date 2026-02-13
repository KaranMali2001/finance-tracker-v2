'use client';

import { formatDate, formatRupees, getTypeColor } from '@/components/shared/utils';
import { ChevronLeft, ChevronRight, Filter, Search, X, Terminal } from 'lucide-react';
import type { TransactionThemeProps } from './types';

export default function DataPrecisionTransactionTheme({
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
    <div className={`min-h-screen w-full ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Roboto+Mono:wght@400;500;600;700&display=swap');

        .data-precision-transactions {
          font-family: 'JetBrains Mono', 'Roboto Mono', monospace;
        }

        @keyframes matrix-scan {
          0% { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }

        @keyframes terminal-blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        @keyframes matrix-rain {
          0% { transform: translateY(-10px); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(0); opacity: 1; }
        }

        .terminal-row {
          animation: matrix-rain 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          opacity: 0;
          transition: all 0.15s ease;
        }

        .terminal-row:hover {
          background: ${isDark ? 'rgba(0, 255, 0, 0.03)' : 'rgba(0, 100, 0, 0.03)'};
          box-shadow: inset 2px 0 0 ${isDark ? '#00ff00' : '#00aa00'};
        }

        .matrix-glow {
          text-shadow: 0 0 5px currentColor, 0 0 10px currentColor;
        }

        .terminal-border {
          border: 1px solid ${isDark ? '#00ff00' : '#00aa00'};
          box-shadow: 0 0 10px ${isDark ? 'rgba(0, 255, 0, 0.2)' : 'rgba(0, 170, 0, 0.2)'},
                      inset 0 0 10px ${isDark ? 'rgba(0, 255, 0, 0.05)' : 'rgba(0, 170, 0, 0.05)'};
        }

        .scan-line {
          position: relative;
          overflow: hidden;
        }

        .scan-line::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, ${isDark ? '#00ff00' : '#00aa00'}, transparent);
          animation: scan 3s linear infinite;
        }

        @keyframes scan {
          0% { left: -100%; }
          100% { left: 100%; }
        }
      `}</style>

      <div className="data-precision-transactions max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Terminal
                className={`h-8 w-8 ${isDark ? 'text-green-500 matrix-glow' : 'text-green-700'}`}
              />
              <h1
                className={`text-4xl font-bold ${
                  isDark ? 'text-green-500 matrix-glow' : 'text-gray-900'
                }`}
              >
                &gt; TRANSACTIONS_
              </h1>
            </div>
            <p className={`text-xs font-mono ${isDark ? 'text-green-500/60' : 'text-gray-600'}`}>
              [{transactions.length.toString().padStart(4, '0')} RECORDS] [PAGE{' '}
              {page.toString().padStart(2, '0')}/{totalPages.toString().padStart(2, '0')}] [SYSTEM
              READY]
            </p>
          </div>
          <div className={`text-xs font-mono ${isDark ? 'text-green-500/40' : 'text-gray-500'}`}>
            {new Date().toISOString()}
          </div>
        </div>

        {/* Filters */}
        <div
          className={`mb-6 p-4 terminal-border scan-line ${isDark ? 'bg-black/80' : 'bg-white'}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className={`h-4 w-4 ${isDark ? 'text-green-500' : 'text-green-700'}`} />
              <span className={`text-sm font-bold ${isDark ? 'text-green-500' : 'text-gray-900'}`}>
                &gt; FILTERS
              </span>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className={`text-xs font-mono transition-colors ${
                  isDark
                    ? 'text-green-500/60 hover:text-green-500'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <X className="h-3 w-3 inline mr-1" />
                [CLEAR_ALL]
              </button>
            )}
          </div>

          <div className="grid grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search
                className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                  isDark ? 'text-green-500/40' : 'text-gray-500'
                }`}
              />
              <input
                type="text"
                placeholder="SEARCH_QUERY..."
                value={filters.search || ''}
                onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
                className={`w-full pl-10 pr-3 py-2 text-xs font-mono border transition-all ${
                  isDark
                    ? 'bg-black border-green-900 text-green-500 placeholder:text-green-500/30 focus:border-green-500 focus:shadow-[0_0_10px_rgba(0,255,0,0.3)]'
                    : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-green-600'
                } focus:outline-none`}
              />
            </div>

            {/* Account Filter */}
            <select
              value={filters.accountId || ''}
              onChange={(e) =>
                onFilterChange({ ...filters, accountId: e.target.value || undefined })
              }
              className={`px-3 py-2 text-xs font-mono border transition-all ${
                isDark
                  ? 'bg-black border-green-900 text-green-500 focus:border-green-500 focus:shadow-[0_0_10px_rgba(0,255,0,0.3)]'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-green-600'
              } focus:outline-none`}
            >
              <option value="">[ALL_ACCOUNTS]</option>
              {accounts?.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.account_name || 'UNNAMED'}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={filters.categoryId || ''}
              onChange={(e) =>
                onFilterChange({ ...filters, categoryId: e.target.value || undefined })
              }
              className={`px-3 py-2 text-xs font-mono border transition-all ${
                isDark
                  ? 'bg-black border-green-900 text-green-500 focus:border-green-500 focus:shadow-[0_0_10px_rgba(0,255,0,0.3)]'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-green-600'
              } focus:outline-none`}
            >
              <option value="">[ALL_CATEGORIES]</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name || 'UNNAMED'}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={filters.type || ''}
              onChange={(e) => onFilterChange({ ...filters, type: e.target.value || undefined })}
              className={`px-3 py-2 text-xs font-mono border transition-all ${
                isDark
                  ? 'bg-black border-green-900 text-green-500 focus:border-green-500 focus:shadow-[0_0_10px_rgba(0,255,0,0.3)]'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-green-600'
              } focus:outline-none`}
            >
              <option value="">[ALL_TYPES]</option>
              <option value="DEBIT">[DEBIT]</option>
              <option value="CREDIT">[CREDIT]</option>
              <option value="INCOME">[INCOME]</option>
              <option value="SUBSCRIPTION">[SUBSCRIPTION]</option>
              <option value="INVESTMENT">[INVESTMENT]</option>
              <option value="REFUND">[REFUND]</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className={`terminal-border overflow-hidden ${isDark ? 'bg-black/80' : 'bg-white'}`}>
          {/* Table Header */}
          <div
            className={`grid grid-cols-12 gap-4 px-6 py-3 text-[10px] font-bold border-b ${
              isDark
                ? 'bg-green-950/30 border-green-900 text-green-500'
                : 'bg-gray-100 border-gray-300 text-gray-700'
            }`}
          >
            <div className="col-span-2">[DATE_STAMP]</div>
            <div className="col-span-3">[DESCRIPTION]</div>
            <div className="col-span-2">[ACCOUNT_ID]</div>
            <div className="col-span-2">[CATEGORY]</div>
            <div className="col-span-1">[TYPE]</div>
            <div className="col-span-2 text-right">[AMOUNT_USD]</div>
          </div>

          {/* Table Body */}
          <div className={`divide-y ${isDark ? 'divide-green-900/30' : 'divide-gray-200'}`}>
            {transactions.map((txn, index) => (
              <div
                key={txn.id}
                className={`terminal-row grid grid-cols-12 gap-4 px-6 py-3 ${
                  isDark ? 'border-green-900/30' : 'border-gray-100'
                }`}
                style={{ animationDelay: `${index * 0.02}s` }}
              >
                <div
                  className={`col-span-2 text-xs font-mono ${isDark ? 'text-green-500/80' : 'text-gray-600'}`}
                >
                  {formatDate((txn as any).transaction_date || txn.created_at || '')}
                </div>
                <div
                  className={`col-span-3 text-xs font-mono truncate ${isDark ? 'text-green-500' : 'text-gray-900'}`}
                >
                  {txn.description || 'NULL'}
                </div>
                <div
                  className={`col-span-2 text-xs font-mono ${isDark ? 'text-green-500/60' : 'text-gray-600'}`}
                >
                  {txn.account_name || 'N/A'}
                </div>
                <div
                  className={`col-span-2 text-xs font-mono ${isDark ? 'text-green-500/60' : 'text-gray-600'}`}
                >
                  {txn.category_name || 'UNCAT'}
                </div>
                <div className="col-span-1">
                  <span
                    className={`text-[10px] font-mono font-bold ${
                      txn.type === 'INCOME'
                        ? isDark
                          ? 'text-green-400'
                          : 'text-green-700'
                        : txn.type === 'DEBIT'
                          ? isDark
                            ? 'text-red-500'
                            : 'text-red-600'
                          : isDark
                            ? 'text-yellow-500'
                            : 'text-yellow-600'
                    }`}
                  >
                    [{txn.type || 'N/A'}]
                  </span>
                </div>
                <div
                  className={`col-span-2 text-right text-xs font-mono font-bold ${
                    txn.type === 'INCOME'
                      ? isDark
                        ? 'text-green-400 matrix-glow'
                        : 'text-green-700'
                      : txn.type === 'DEBIT'
                        ? isDark
                          ? 'text-red-500 matrix-glow'
                          : 'text-red-600'
                        : isDark
                          ? 'text-green-500'
                          : 'text-gray-700'
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
              <p className={`text-xs font-mono ${isDark ? 'text-green-500/40' : 'text-gray-400'}`}>
                [NO_DATA_FOUND] [EMPTY_SET]
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-mono ${isDark ? 'text-green-500/60' : 'text-gray-600'}`}
              >
                [ROWS_PER_PAGE]:
              </span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className={`px-3 py-1.5 text-xs font-mono border transition-all ${
                  isDark
                    ? 'bg-black border-green-900 text-green-500 focus:border-green-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-green-600'
                } focus:outline-none`}
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
                className={`p-2 border transition-all font-mono text-xs ${
                  page === 1
                    ? isDark
                      ? 'bg-black border-green-900/30 text-green-500/30 cursor-not-allowed'
                      : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                    : isDark
                      ? 'bg-black border-green-900 text-green-500 hover:border-green-500 hover:shadow-[0_0_10px_rgba(0,255,0,0.3)]'
                      : 'bg-white border-gray-300 text-gray-900 hover:border-green-600'
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className={`text-xs font-mono ${isDark ? 'text-green-500' : 'text-gray-700'}`}>
                [PAGE {page.toString().padStart(2, '0')}/{totalPages.toString().padStart(2, '0')}]
              </span>

              <button
                type="button"
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
                className={`p-2 border transition-all font-mono text-xs ${
                  page === totalPages
                    ? isDark
                      ? 'bg-black border-green-900/30 text-green-500/30 cursor-not-allowed'
                      : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                    : isDark
                      ? 'bg-black border-green-900 text-green-500 hover:border-green-500 hover:shadow-[0_0_10px_rgba(0,255,0,0.3)]'
                      : 'bg-white border-gray-300 text-gray-900 hover:border-green-600'
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
