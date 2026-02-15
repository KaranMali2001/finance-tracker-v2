'use client';

import { ConfirmDialog } from '@/components/shared/dialog';
import { useAccounts } from '@/components/shared/hooks/useAccount';
import { useCategories, useMerchants } from '@/components/shared/hooks/useStatic';
import { useDeleteTransactions, useTransactions } from '@/components/shared/hooks/useTransaction';
import { ErrorState, PageShell } from '@/components/shared/layout';
import type { Transaction } from '@/components/shared/types';
import { formatDate, formatRupees, getTypeColor } from '@/components/shared/utils';
import { Button } from '@/components/ui/button';
import { Filter, Plus, Receipt, Search, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

interface TransactionFilters {
  accountId?: string;
  categoryId?: string;
  merchantId?: string;
  type?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export default function TransactionsPage() {
  const { data: transactions, isLoading, error, refetch } = useTransactions();
  const { data: categories } = useCategories();
  const { data: merchants } = useMerchants();
  const { data: accounts } = useAccounts();
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { mutate: deleteTransactions, isPending: isDeleting } = useDeleteTransactions();
  const router = useRouter();

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

  const handleFilterChange = (newFilters: TransactionFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(1);
  };

  const handleDeleteClick = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (transactionToDelete?.id) {
      deleteTransactions(
        { ids: [transactionToDelete.id] },
        {
          onSuccess: () => {
            setIsDeleteDialogOpen(false);
            setTransactionToDelete(null);
          },
        }
      );
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setTransactionToDelete(null);
  };

  const hasActiveFilters =
    filters.accountId ||
    filters.categoryId ||
    filters.merchantId ||
    filters.type ||
    filters.search ||
    filters.dateFrom ||
    filters.dateTo;

  if (error) {
    return (
      <PageShell title="Transactions">
        <ErrorState error={error} onRetry={() => refetch()} />
      </PageShell>
    );
  }

  if (isLoading) {
    return (
      <PageShell title="Transactions" description="View and manage your financial transactions">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent mx-auto mb-4" />
            <p className="text-sm font-medium text-stone-600">Loading transactions...</p>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Transaction Ledger"
      description="Your complete financial transaction history"
      actions={
        <Button asChild>
          <Link href="/dashboard/transactions/new">
            <Plus className="mr-2 h-4 w-4" />
            New Transaction
          </Link>
        </Button>
      }
    >
      {/* Filters Section */}
      <div className="mb-6 p-4 rounded-xl border border-stone-200 bg-white shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-semibold text-stone-800">Filters</span>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs font-medium text-stone-600 hover:text-amber-700 transition-colors"
            >
              <X className="h-3 w-3 inline mr-1" />
              Clear all
            </button>
          )}
        </div>

        <div className="grid grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
            <input
              type="text"
              placeholder="Search..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/20 transition-all"
            />
          </div>

          {/* Account Filter */}
          <select
            value={filters.accountId || ''}
            onChange={(e) =>
              handleFilterChange({ ...filters, accountId: e.target.value || undefined })
            }
            className="px-3 py-2 text-sm rounded-lg border border-stone-300 bg-white text-stone-900 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/20 transition-all"
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
              handleFilterChange({ ...filters, categoryId: e.target.value || undefined })
            }
            className="px-3 py-2 text-sm rounded-lg border border-stone-300 bg-white text-stone-900 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/20 transition-all"
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
            onChange={(e) => handleFilterChange({ ...filters, type: e.target.value || undefined })}
            className="px-3 py-2 text-sm rounded-lg border border-stone-300 bg-white text-stone-900 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/20 transition-all"
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
      <div className="rounded-xl border border-stone-200 overflow-hidden bg-white shadow-sm">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold border-b bg-stone-50 border-stone-200 text-stone-600">
          <div className="col-span-2">DATE</div>
          <div className="col-span-3">DESCRIPTION</div>
          <div className="col-span-2">ACCOUNT</div>
          <div className="col-span-2">CATEGORY</div>
          <div className="col-span-1">TYPE</div>
          <div className="col-span-2 text-right">AMOUNT</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-stone-100">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((txn, index) => (
              <div
                key={txn.id}
                className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-amber-50/50 border-stone-100 transition-all duration-200 hover:translate-x-1 elegant-fade group"
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                <div className="col-span-2 text-sm font-mono text-stone-700">
                  {formatDate((txn as any).transaction_date || txn.created_at || '')}
                </div>
                <div className="col-span-3 text-sm font-medium text-stone-900 truncate">
                  {txn.description || 'No description'}
                </div>
                <div className="col-span-2 text-sm text-stone-600">{txn.account_name || 'N/A'}</div>
                <div className="col-span-2 text-sm text-stone-600">
                  {txn.category_name || 'Uncategorized'}
                </div>
                <div className="col-span-1">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getTypeColor(txn.type || '')}`}
                  >
                    {txn.type || 'N/A'}
                  </span>
                </div>
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <span
                    className={`text-sm font-bold font-mono ${
                      txn.type === 'INCOME'
                        ? 'text-emerald-600'
                        : txn.type === 'DEBIT'
                          ? 'text-rose-600'
                          : 'text-stone-700'
                    }`}
                  >
                    {txn.type === 'INCOME' || txn.type === 'CREDIT'
                      ? '+'
                      : txn.type === 'DEBIT'
                        ? '-'
                        : ''}
                    {formatRupees(txn.amount || 0)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(txn)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-red-50 text-stone-400 hover:text-red-600 transition-all"
                    title="Delete transaction"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center">
              <Receipt className="h-12 w-12 text-stone-300 mx-auto mb-4" />
              <p className="text-sm text-stone-500 mb-4">
                {hasActiveFilters ? 'No transactions match your filters' : 'No transactions found'}
              </p>
              {!hasActiveFilters && (
                <Button
                  onClick={() => router.push('/dashboard/transactions/new')}
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Transaction
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-stone-600">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="px-3 py-1.5 text-sm rounded-lg border border-stone-300 bg-white text-stone-900 focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600 transition-colors"
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
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className={`p-2 rounded-lg transition-all ${
                page === 1
                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  : 'bg-white text-stone-900 hover:bg-amber-600 hover:text-white border border-stone-300'
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <span className="text-sm text-stone-700">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className={`p-2 rounded-lg transition-all ${
                page === totalPages
                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  : 'bg-white text-stone-900 hover:bg-amber-600 hover:text-white border border-stone-300'
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Transaction"
        description={
          transactionToDelete
            ? `Are you sure you want to delete this transaction of ${formatRupees(transactionToDelete.amount || 0)}? This action cannot be undone.`
            : 'Are you sure you want to delete this transaction? This action cannot be undone.'
        }
        confirmText="Delete"
        cancelText="Cancel"
        destructive
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </PageShell>
  );
}
