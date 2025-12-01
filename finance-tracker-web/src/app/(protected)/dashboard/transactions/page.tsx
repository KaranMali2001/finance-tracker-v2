'use client';

import {
  ConfirmDialog,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/shared/dialog';
import { useDeleteTransactions, useTransactions } from '@/components/shared/hooks/useTransaction';
import { EmptyState, ErrorState, LoadingState, PageShell } from '@/components/shared/layout';
import type { Transaction } from '@/components/shared/types';
import { formatDate, formatRupees, getTypeColor } from '@/components/shared/utils';
import { Button } from '@/components/ui/button';
import { Plus, Receipt, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { TransactionCreateForm } from '../../../../components/transactionComponents/TransactionCreateForm/TransactionCreateForm';

export default function TransactionsPage() {
  const { data: transactions, isLoading, error, refetch, isFetching } = useTransactions();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { mutate: deleteTransactions, isPending: isDeleting } = useDeleteTransactions();

  // Show loading state while fetching or when data hasn't been loaded yet
  if (isLoading || isFetching || transactions === undefined) {
    return (
      <PageShell title="Transactions">
        <LoadingState variant="skeleton" count={5} />
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell title="Transactions">
        <ErrorState error={error} onRetry={() => refetch()} />
      </PageShell>
    );
  }

  // Only show empty state when data has been fetched and is actually empty
  if (transactions.length === 0) {
    return (
      <PageShell title="Transactions">
        <EmptyState
          icon={Receipt}
          title="No transactions found"
          description="Get started by creating your first transaction to track your finances."
          action={{
            label: 'Create Transaction',
            onClick: () => {
              setIsCreateDialogOpen(true);
            },
          }}
        />
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Transaction</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new financial transaction.
              </DialogDescription>
            </DialogHeader>
            <TransactionCreateForm
              onSuccess={() => {
                setIsCreateDialogOpen(false);
              }}
              onCancel={() => {
                setIsCreateDialogOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </PageShell>
    );
  }

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

  return (
    <PageShell
      title="Transactions"
      description="View and manage your financial transactions"
      actions={
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Transaction
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="group rounded-lg border border-border bg-card p-6 transition-colors hover:bg-accent"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Receipt className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {transaction.type && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${getTypeColor(transaction.type)}`}
                      >
                        {transaction.type}
                      </span>
                    )}
                  </div>
                  {transaction.amount !== undefined && (
                    <p className="mt-1 text-lg font-bold text-card-foreground">
                      {formatRupees(transaction.amount)}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => {
                  handleDeleteClick(transaction);
                }}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {transaction.description && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Description: </span>
                  <span className="font-medium text-card-foreground">
                    {transaction.description}
                  </span>
                </div>
              )}
              {transaction.account_id && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Account ID</span>
                  <span className="font-mono text-card-foreground">
                    {transaction.account_id.substring(0, 8)}...
                  </span>
                </div>
              )}
              {transaction.category_id && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Category ID</span>
                  <span className="font-mono text-card-foreground">
                    {transaction.category_id.substring(0, 8)}...
                  </span>
                </div>
              )}
              {transaction.merchant_id && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Merchant ID</span>
                  <span className="font-mono text-card-foreground">
                    {transaction.merchant_id.substring(0, 8)}...
                  </span>
                </div>
              )}
              {transaction.created_at && (
                <div className="flex items-center justify-between border-t border-border pt-2">
                  <span className="text-sm font-medium text-muted-foreground">Date</span>
                  <span className="text-sm text-card-foreground">
                    {formatDate(transaction.created_at)}
                  </span>
                </div>
              )}
              {transaction.is_recurring && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">🔄 Recurring</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Transaction</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new financial transaction.
            </DialogDescription>
          </DialogHeader>
          <TransactionCreateForm
            onSuccess={() => {
              setIsCreateDialogOpen(false);
            }}
            onCancel={() => {
              setIsCreateDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
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
