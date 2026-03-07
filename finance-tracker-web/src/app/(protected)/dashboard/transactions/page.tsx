'use client';

import {
  ConfirmDialog,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/shared/dialog';
import { useAccounts } from '@/components/shared/hooks/useAccount';
import { useCategories, useMerchants } from '@/components/shared/hooks/useStatic';
import { useDeleteTransactions, useTransactions } from '@/components/shared/hooks/useTransaction';
import { ErrorState, PageShell } from '@/components/shared/layout';
import { TanStackTable, type TanStackTableColumn } from '@/components/shared/table';
import type { Transaction } from '@/components/shared/types';
import { formatDate, formatRupees, getTypeColor } from '@/components/shared/utils';
import { TransactionEditForm } from '@/components/transactionComponents/TransactionEditForm/TransactionEditForm';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronDown, Filter, Pencil, Plus, Receipt, Search, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

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
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { mutate: deleteTransactions, isPending: isDeleting } = useDeleteTransactions();
  const router = useRouter();

  const [filters, setFilters] = useState<TransactionFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const { filteredTransactions, totalPages } = useMemo(() => {
    if (!transactions) {
      return { filteredTransactions: [], totalPages: 0 };
    }

    let filtered: Transaction[] = [...transactions];

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
        const txnDate = txn.transaction_date ?? txn.created_at;
        return txnDate && txnDate >= filters.dateFrom!;
      });
    }
    if (filters.dateTo) {
      filtered = filtered.filter((txn) => {
        const txnDate = txn.transaction_date ?? txn.created_at;
        return txnDate && txnDate <= filters.dateTo!;
      });
    }

    filtered.sort((a, b) => {
      const dateA = a.transaction_date ?? a.created_at ?? '';
      const dateB = b.transaction_date ?? b.created_at ?? '';
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

  const handleDeleteClick = useCallback((transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setIsDeleteDialogOpen(true);
  }, []);

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

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    deleteTransactions(
      { ids: Array.from(selectedIds) },
      {
        onSuccess: () => {
          setIsBulkDeleteDialogOpen(false);
          setSelectedIds(new Set());
        },
      }
    );
  };

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === filteredTransactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTransactions.map((t) => t.id ?? '')));
    }
  }, [selectedIds.size, filteredTransactions]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const allSelected =
    filteredTransactions.length > 0 && selectedIds.size === filteredTransactions.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  const hasActiveFilters =
    filters.accountId ||
    filters.categoryId ||
    filters.merchantId ||
    filters.type ||
    filters.search ||
    filters.dateFrom ||
    filters.dateTo;

  const transactionColumns: TanStackTableColumn<Transaction>[] = useMemo(
    () => [
      {
        id: 'select',
        header: '',
        span: 1,
        cell: (txn) => (
          <Checkbox
            checked={selectedIds.has(txn.id ?? '')}
            onCheckedChange={() => toggleSelect(txn.id ?? '')}
            aria-label="Select row"
            onClick={(e) => e.stopPropagation()}
          />
        ),
      },
      {
        id: 'date',
        header: 'DATE',
        width: 'col-span-2',
        cell: (txn) => (
          <span className="text-sm font-mono text-stone-700">
            {formatDate(txn.transaction_date ?? txn.created_at ?? '')}
          </span>
        ),
      },
      {
        id: 'description',
        header: 'DESCRIPTION',
        width: 'col-span-3',
        cell: (txn) => (
          <span className="text-sm font-medium text-stone-900 truncate block">
            {txn.description || 'No description'}
          </span>
        ),
      },
      {
        id: 'account',
        header: 'ACCOUNT',
        width: 'col-span-2',
        cell: (txn) => <span className="text-sm text-stone-600">{txn.account_name || 'N/A'}</span>,
      },
      {
        id: 'category',
        header: 'CATEGORY',
        width: 'col-span-2',
        cell: (txn) => (
          <span className="text-sm text-stone-600">{txn.category_name || 'Uncategorized'}</span>
        ),
      },
      {
        id: 'type',
        header: 'TYPE',
        width: 'col-span-1',
        cell: (txn) => (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getTypeColor(txn.type || '')}`}
          >
            {txn.type || 'N/A'}
          </span>
        ),
      },
      {
        id: 'amount',
        header: 'AMOUNT',
        width: 'col-span-2',
        align: 'right',
        cell: (txn) => (
          <span
            className={`text-sm font-bold font-mono ${
              txn.type === 'INCOME'
                ? 'text-emerald-600'
                : txn.type === 'DEBIT'
                  ? 'text-rose-600'
                  : 'text-stone-700'
            }`}
          >
            {txn.type === 'INCOME' || txn.type === 'CREDIT' ? '+' : txn.type === 'DEBIT' ? '-' : ''}
            {formatRupees(txn.amount || 0)}
          </span>
        ),
      },
    ],
    [selectedIds, toggleSelect]
  );

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
      <div className="mb-6 rounded-xl border border-stone-200 bg-white shadow-sm">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
              <Input
                type="text"
                placeholder="Search transactions..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/20 transition-all"
              />
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-all whitespace-nowrap ${
                isFiltersOpen || (hasActiveFilters && !filters.search)
                  ? 'border-amber-600 bg-amber-50 text-amber-800'
                  : 'border-stone-300 bg-white text-stone-700 hover:border-amber-600/50'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
              {(filters.accountId || filters.categoryId || filters.type) && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white">
                  {[filters.accountId, filters.categoryId, filters.type].filter(Boolean).length}
                </span>
              )}
              <ChevronDown
                className={`h-3 w-3 transition-transform duration-200 ${isFiltersOpen ? 'rotate-180' : ''}`}
              />
            </Button>

            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-amber-700 transition-colors whitespace-nowrap"
              >
                <X className="h-3 w-3" />
                <span className="hidden sm:inline">Clear</span>
              </Button>
            )}
          </div>
        </div>

        {isFiltersOpen && (
          <div className="border-t border-stone-100 p-4 pt-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select
                value={filters.accountId || '__all__'}
                onValueChange={(v) =>
                  handleFilterChange({ ...filters, accountId: v === '__all__' ? undefined : v })
                }
              >
                <SelectTrigger className="px-3 py-2 text-sm rounded-lg border border-stone-300 bg-white text-stone-900">
                  <SelectValue placeholder="All Accounts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Accounts</SelectItem>
                  {accounts?.map((account) => (
                    <SelectItem key={account.id} value={account.id ?? ''}>
                      {account.account_name || 'Unnamed'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.categoryId || '__all__'}
                onValueChange={(v) =>
                  handleFilterChange({ ...filters, categoryId: v === '__all__' ? undefined : v })
                }
              >
                <SelectTrigger className="px-3 py-2 text-sm rounded-lg border border-stone-300 bg-white text-stone-900">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Categories</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id ?? ''}>
                      {category.name || 'Unnamed'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.type || '__all__'}
                onValueChange={(v) =>
                  handleFilterChange({ ...filters, type: v === '__all__' ? undefined : v })
                }
              >
                <SelectTrigger className="px-3 py-2 text-sm rounded-lg border border-stone-300 bg-white text-stone-900">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Types</SelectItem>
                  <SelectItem value="DEBIT">Debit</SelectItem>
                  <SelectItem value="CREDIT">Credit</SelectItem>
                  <SelectItem value="INCOME">Income</SelectItem>
                  <SelectItem value="SUBSCRIPTION">Subscription</SelectItem>
                  <SelectItem value="INVESTMENT">Investment</SelectItem>
                  <SelectItem value="REFUND">Refund</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5">
          <span className="text-sm font-medium text-amber-800">
            {selectedIds.size} transaction{selectedIds.size !== 1 ? 's' : ''} selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsBulkDeleteDialogOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete Selected
          </Button>
        </div>
      )}

      {/* Select-all header row */}
      <div className="mb-1 flex items-center gap-2 px-1">
        <Checkbox
          checked={allSelected}
          data-state={someSelected ? 'indeterminate' : allSelected ? 'checked' : 'unchecked'}
          onCheckedChange={toggleSelectAll}
          aria-label="Select all"
        />
        <span className="text-xs text-stone-500">
          {allSelected ? 'Deselect all' : 'Select all on this page'}
        </span>
      </div>

      <TanStackTable<Transaction>
        data={filteredTransactions}
        columns={transactionColumns}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        getRowId={(row) => row.id ?? ''}
        minTableWidth="700px"
        rowActions={{
          width: 'col-span-1',
          onDelete: handleDeleteClick,
          deletingRowId: isDeleting && transactionToDelete ? transactionToDelete.id : undefined,
          render: (txn) => (
            <div className="flex items-center justify-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-stone-500 hover:bg-amber-50 hover:text-amber-700"
                onClick={(e) => {
                  e.stopPropagation();
                  setTransactionToEdit(txn as Transaction);
                }}
                title="Edit transaction"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(txn as Transaction);
                }}
                title="Delete transaction"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ),
        }}
        emptyMessage={
          hasActiveFilters ? 'No transactions match your filters' : 'No transactions found'
        }
        emptyIcon={Receipt}
        emptyAction={
          !hasActiveFilters
            ? {
                label: 'Create Transaction',
                onClick: () => router.push('/dashboard/transactions/new'),
              }
            : undefined
        }
      />

      {/* Edit Dialog */}
      <Dialog
        open={!!transactionToEdit}
        onOpenChange={(open) => !open && setTransactionToEdit(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          {transactionToEdit && (
            <TransactionEditForm
              transaction={transactionToEdit}
              onSuccess={() => setTransactionToEdit(null)}
              onCancel={() => setTransactionToEdit(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Single delete confirm */}
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

      {/* Bulk delete confirm */}
      <ConfirmDialog
        open={isBulkDeleteDialogOpen}
        onOpenChange={setIsBulkDeleteDialogOpen}
        title="Delete Transactions"
        description={`Are you sure you want to delete ${selectedIds.size} transaction${selectedIds.size !== 1 ? 's' : ''}? This action cannot be undone.`}
        confirmText="Delete All"
        cancelText="Cancel"
        destructive
        onConfirm={handleBulkDelete}
        onCancel={() => setIsBulkDeleteDialogOpen(false)}
      />
    </PageShell>
  );
}
