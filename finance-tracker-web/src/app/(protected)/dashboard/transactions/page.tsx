'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/shared/dialog';
import { useTransactions } from '@/components/shared/hooks/useTransaction';
import { EmptyState, ErrorState, LoadingState, PageShell } from '@/components/shared/layout';
import { formatRupees } from '@/components/shared/utils';
import { Button } from '@/components/ui/button';
import { Receipt, Plus } from 'lucide-react';
import { useState } from 'react';
import { TransactionCreateForm } from '../../../../components/transactionComponents/TransactionCreateForm/TransactionCreateForm';

export default function TransactionsPage() {
  const { data: transactions, isLoading, error, refetch, isFetching } = useTransactions();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

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

  const formatDate = (dateString?: string) => {
    if (!dateString) {
      return 'N/A';
    }
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'DEBIT':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'CREDIT':
      case 'INCOME':
      case 'REFUND':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'SUBSCRIPTION':
      case 'INVESTMENT':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
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
    </PageShell>
  );
}
