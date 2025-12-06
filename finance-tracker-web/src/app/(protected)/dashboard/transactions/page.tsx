'use client';

import { ConfirmDialog } from '@/components/shared/dialog';
import { useDeleteTransactions, useTransactions } from '@/components/shared/hooks/useTransaction';
import { ErrorState, PageShell } from '@/components/shared/layout';
import { DataGrid } from '@/components/shared/table';
import type { Transaction } from '@/components/shared/types';
import { formatDate, formatRupees, getTypeColor } from '@/components/shared/utils';
import { Button } from '@/components/ui/button';
import type { ColDef } from 'ag-grid-community';
import { Plus, Receipt, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

export default function TransactionsPage() {
  const { data: transactions, isLoading, error, refetch, isFetching } = useTransactions();
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { mutate: deleteTransactions, isPending: isDeleting } = useDeleteTransactions();
  const router = useRouter();

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

  const columnDefs = useMemo<ColDef<Transaction>[]>(
    () => [
      {
        field: 'id',
        headerName: 'ID',
        width: 100,
        sortable: true,
        filter: true,
        cellRenderer: (params: { value?: string }) => {
          if (!params.value) {
            return 'N/A';
          }
          return <span className="font-mono text-xs">{params.value.substring(0, 8)}...</span>;
        },
      },
      {
        field: 'type',
        headerName: 'Type',
        width: 120,
        sortable: true,
        filter: true,
        cellRenderer: (params: { value?: string }) => {
          if (!params.value) {
            return 'N/A';
          }
          return (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getTypeColor(params.value)}`}
            >
              {params.value}
            </span>
          );
        },
      },
      {
        field: 'amount',
        headerName: 'Amount',
        width: 150,
        sortable: true,
        filter: true,
        cellRenderer: (params: { value?: number }) => {
          if (params.value === undefined || params.value === null) {
            return 'N/A';
          }
          return <span className="font-semibold">{formatRupees(params.value)}</span>;
        },
        comparator: (valueA, valueB) => {
          const a = valueA ?? 0;
          const b = valueB ?? 0;
          return a - b;
        },
      },
      {
        field: 'description',
        headerName: 'Description',
        width: 250,
        sortable: true,
        filter: true,
        cellRenderer: (params: { value?: string }) => {
          return params.value || 'N/A';
        },
      },
      {
        field: 'account_id',
        headerName: 'Account ID',
        width: 150,
        sortable: true,
        filter: true,
        cellRenderer: (params: { value?: string }) => {
          if (!params.value) {
            return 'N/A';
          }
          return <span className="font-mono text-xs">{params.value.substring(0, 8)}...</span>;
        },
      },
      {
        field: 'category_id',
        headerName: 'Category ID',
        width: 150,
        sortable: true,
        filter: true,
        cellRenderer: (params: { value?: string }) => {
          if (!params.value) {
            return 'N/A';
          }
          return <span className="font-mono text-xs">{params.value.substring(0, 8)}...</span>;
        },
      },
      {
        field: 'merchant_id',
        headerName: 'Merchant ID',
        width: 150,
        sortable: true,
        filter: true,
        cellRenderer: (params: { value?: string }) => {
          if (!params.value) {
            return 'N/A';
          }
          return <span className="font-mono text-xs">{params.value.substring(0, 8)}...</span>;
        },
      },
      {
        field: 'payment_method',
        headerName: 'Payment Method',
        width: 150,
        sortable: true,
        filter: true,
      },
      {
        field: 'reference_number',
        headerName: 'Reference',
        width: 150,
        sortable: true,
        filter: true,
      },
      {
        field: 'created_at',
        headerName: 'Date',
        width: 150,
        sortable: true,
        filter: true,
        cellRenderer: (params: { value?: string }) => {
          if (!params.value) {
            return 'N/A';
          }
          return formatDate(params.value);
        },
        comparator: (valueA, valueB) => {
          const a = valueA ? new Date(valueA).getTime() : 0;
          const b = valueB ? new Date(valueB).getTime() : 0;
          return a - b;
        },
      },
      {
        field: 'is_recurring',
        headerName: 'Recurring',
        width: 100,
        sortable: true,
        filter: true,
        cellRenderer: (params: { value?: boolean }) => {
          return params.value ? '🔄 Yes' : 'No';
        },
      },
      {
        field: 'is_cash',
        headerName: 'Cash',
        width: 100,
        sortable: true,
        filter: true,
        cellRenderer: (params: { value?: boolean }) => {
          return params.value ? 'Yes' : 'No';
        },
      },
      {
        field: 'is_excluded',
        headerName: 'Excluded',
        width: 100,
        sortable: true,
        filter: true,
        cellRenderer: (params: { value?: boolean }) => {
          return params.value ? 'Yes' : 'No';
        },
      },
      {
        headerName: 'Actions',
        width: 100,
        sortable: false,
        filter: false,
        cellRenderer: (params: { data?: Transaction }) => {
          if (!params.data) {
            return null;
          }
          return (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => {
                handleDeleteClick(params.data!);
              }}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          );
        },
      },
    ],
    [isDeleting]
  );

  const defaultColDef = useMemo<ColDef<Transaction>>(
    () => ({
      flex: 1,
      minWidth: 100,
    }),
    []
  );

  if (error) {
    return (
      <PageShell title="Transactions">
        <ErrorState error={error} onRetry={() => refetch()} />
      </PageShell>
    );
  }

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <PageShell
        title="Transactions"
        description="View and manage your financial transactions"
        actions={
          <Button asChild>
            <Link href="/dashboard/transactions/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Transaction
            </Link>
          </Button>
        }
        className="flex flex-col flex-1 min-h-0"
      >
        <div className="flex-1 min-h-0">
          <DataGrid<Transaction>
            columns={columnDefs}
            data={transactions || []}
            loading={isLoading || isFetching || transactions === undefined}
            defaultColDef={defaultColDef}
            height="100%"
            emptyState={{
              title: 'No transactions found',
              description: 'Get started by creating your first transaction to track your finances.',
              icon: Receipt,
              action: {
                label: 'Create Transaction',
                onClick: () => {
                  router.push('/dashboard/transactions/new');
                },
              },
            }}
          />
        </div>
      </PageShell>
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
    </div>
  );
}
