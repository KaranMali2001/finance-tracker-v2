'use client';

import { ConfirmDialog } from '@/components/shared/dialog';
import { useAccounts } from '@/components/shared/hooks/useAccount';
import { useCategories, useMerchants } from '@/components/shared/hooks/useStatic';
import {
  useDeleteTransactions,
  useTransactions,
  useUpdateTransaction,
} from '@/components/shared/hooks/useTransaction';
import { ErrorState, PageShell } from '@/components/shared/layout';
import {
  BooleanCellEditor,
  DataGrid,
  DateCellEditor,
  DropdownCellEditor,
  NumberCellEditor,
  RowActions,
  SelectCellEditor,
} from '@/components/shared/table';
import type { Transaction } from '@/components/shared/types';
import { formatDate, formatRupees, getTypeColor } from '@/components/shared/utils';
import { Button } from '@/components/ui/button';
import type {
  internal_domain_transaction_TxnType,
  internal_domain_transaction_UpdateTxnReq,
} from '@/generated/api';
import { internal_domain_transaction_TxnType as TxnType } from '@/generated/api';
import type { CellValueChangedEvent, ColDef } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { startOfDay } from 'date-fns';
import { Edit, ExternalLink, Plus, Receipt, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export default function TransactionsPage() {
  const { data: transactions, isLoading, error, refetch, isFetching } = useTransactions();
  const { data: categories } = useCategories();
  const { data: merchants } = useMerchants();
  const { data: accounts } = useAccounts();
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const { mutate: deleteTransactions, isPending: isDeleting } = useDeleteTransactions();
  const { mutate: updateTransaction } = useUpdateTransaction();
  const router = useRouter();
  const gridApiRef = useRef<AgGridReact<Transaction>>(null);

  // State for tracking row modifications
  const [originalRows, setOriginalRows] = useState<Map<string, Transaction>>(new Map());
  const [modifiedRowIds, setModifiedRowIds] = useState<Set<string>>(new Set());
  const [savingRowIds, setSavingRowIds] = useState<Set<string>>(new Set());

  // Prepare category options
  const categoryOptions = useMemo(() => {
    if (!categories) {
      return [];
    }
    return categories
      .filter((category) => category.id && category.name)
      .map((category) => ({
        value: category.id!,
        label: category.name!,
      }));
  }, [categories]);

  // Prepare merchant options
  const merchantOptions = useMemo(() => {
    if (!merchants) {
      return [];
    }
    return merchants
      .filter((merchant) => merchant.id && merchant.name)
      .map((merchant) => ({
        value: merchant.id!,
        label: merchant.name!,
      }));
  }, [merchants]);

  // Prepare type options from enum
  const typeOptions = useMemo(() => {
    return Object.values(TxnType).map((type) => ({
      value: type,
      label: type,
    }));
  }, []);

  // Prepare account options
  const accountOptions = useMemo(() => {
    if (!accounts) {
      return [];
    }
    return accounts
      .filter((account) => account.id)
      .map((account) => ({
        value: account.id!,
        label: account.account_number
          ? `${account.account_name || 'Account'} (${account.account_number})`
          : account.account_name || 'Account',
      }));
  }, [accounts]);

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

  // Store original row data when edit mode is enabled
  useEffect(() => {
    if (isEditMode && transactions) {
      const originalMap = new Map<string, Transaction>();
      transactions.forEach((txn) => {
        if (txn.id) {
          // Deep clone to avoid reference issues
          originalMap.set(txn.id, { ...txn });
        }
      });
      setOriginalRows(originalMap);
      setModifiedRowIds(new Set());
    } else {
      // Clear state when edit mode is disabled
      setOriginalRows(new Map());
      setModifiedRowIds(new Set());
      setSavingRowIds(new Set());
    }
  }, [isEditMode, transactions]);

  const handleCellValueChanged = useCallback(
    (event: CellValueChangedEvent<Transaction>) => {
      if (!event.data?.id || !isEditMode) {
        return;
      }

      // Track that this row has been modified
      setModifiedRowIds((prev) => {
        const newSet = new Set(prev);
        newSet.add(event.data!.id!);
        return newSet;
      });

      // Note: We don't save automatically - user must click save button
    },
    [isEditMode]
  );

  // Helper function to build update payload from row data
  const buildUpdatePayload = useCallback(
    (rowData: Transaction): internal_domain_transaction_UpdateTxnReq => {
      const payload: internal_domain_transaction_UpdateTxnReq = {
        id: rowData.id!,
      };

      // Map all editable fields to payload
      if (rowData.amount !== undefined) {
        payload.amount = rowData.amount;
      }
      if (rowData.category_id !== undefined) {
        payload.category_id = rowData.category_id;
      }
      if (rowData.merchant_id !== undefined) {
        payload.merchant_id = rowData.merchant_id;
      }
      if (rowData.description !== undefined) {
        payload.description = rowData.description;
      }
      if ((rowData as any).transaction_date !== undefined) {
        payload.transaction_date = (rowData as any).transaction_date;
      }

      // Note: These fields may not be supported by backend UpdateTxnReq yet
      const extendedPayload = payload as any;
      if (rowData.type !== undefined) {
        extendedPayload.type = rowData.type;
      }
      if (rowData.account_id !== undefined) {
        extendedPayload.account_id = rowData.account_id;
      }
      if (rowData.is_recurring !== undefined) {
        extendedPayload.is_recurring = rowData.is_recurring;
      }
      if (rowData.is_cash !== undefined) {
        extendedPayload.is_cash = rowData.is_cash;
      }

      return payload;
    },
    []
  );

  // Handle saving a single row
  const handleRowSave = useCallback(
    (rowId: string) => {
      if (!gridApiRef.current) {
        return;
      }

      // Get current row data from grid
      let rowData: Transaction | undefined;
      gridApiRef.current?.api?.forEachNode((node) => {
        if (node.data?.id === rowId) {
          rowData = node.data;
        }
      });

      if (!rowData || !rowData.id) {
        return;
      }

      // Mark as saving
      setSavingRowIds((prev) => {
        const newSet = new Set(prev);
        newSet.add(rowId);
        return newSet;
      });

      // Build update payload
      const payload = buildUpdatePayload(rowData);

      // Update transaction
      updateTransaction(payload, {
        onSuccess: (updatedTransaction) => {
          // Remove from modified and saving sets
          setModifiedRowIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(rowId);
            return newSet;
          });
          setSavingRowIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(rowId);
            return newSet;
          });

          // Update original rows with new data
          if (updatedTransaction.id) {
            setOriginalRows((prev) => {
              const newMap = new Map(prev);
              newMap.set(updatedTransaction.id!, { ...updatedTransaction });
              return newMap;
            });
          }
        },
        onError: () => {
          // Remove from saving set but keep in modified set
          setSavingRowIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(rowId);
            return newSet;
          });
        },
      });
    },
    [updateTransaction, buildUpdatePayload]
  );

  // Handle canceling changes for a single row
  const handleRowCancel = useCallback(
    (rowId: string) => {
      // Get original row data
      const originalRow = originalRows.get(rowId);
      if (!originalRow || !gridApiRef.current?.api) {
        return;
      }

      // Restore original data in the grid
      gridApiRef.current.api.forEachNode((node) => {
        if (node.data?.id === rowId) {
          // Update the node data with original values
          Object.assign(node.data, originalRow);
          // Refresh the row to reflect changes
          gridApiRef.current?.api?.refreshCells({
            rowNodes: [node],
            force: true,
          });
        }
      });

      // Remove from modified set
      setModifiedRowIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(rowId);
        return newSet;
      });
    },
    [originalRows]
  );

  const columnDefs = useMemo<ColDef<Transaction>[]>(
    () => [
      {
        field: 'id',
        headerName: 'ID',
        width: 100,
        sortable: true,
        filter: true,
        hide: true, // Hide from display but keep for reference
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
        editable: isEditMode,
        cellEditor: DropdownCellEditor,
        cellEditorParams: {
          options: typeOptions,
        },
        valueGetter: (params) => {
          return params.data?.type || undefined;
        },
        valueSetter: (params) => {
          if (params.data) {
            params.data.type = (params.newValue as internal_domain_transaction_TxnType) || undefined;
            return true;
          }
          return false;
        },
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
        editable: isEditMode,
        cellEditor: NumberCellEditor,
        cellEditorParams: {
          min: 0,
          step: 0.01,
        },
        valueParser: (params) => {
          const value = parseFloat(params.newValue);
          return isNaN(value) ? null : value;
        },
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
        editable: false,
        cellRenderer: (params: { value?: string }) => {
          return params.value || 'N/A';
        },
      },
      {
        field: 'account_id',
        headerName: 'Account',
        width: 180,
        sortable: true,
        filter: true,
        editable: isEditMode,
        cellEditor: DropdownCellEditor,
        cellEditorParams: {
          options: accountOptions,
        },
        valueGetter: (params) => {
          return params.data?.account_id || undefined;
        },
        valueSetter: (params) => {
          if (params.data) {
            params.data.account_id = (params.newValue as string) || undefined;
            // Update account_name and account_number when account_id changes
            const selectedAccount = accounts?.find((acc) => acc.id === params.newValue);
            if (selectedAccount) {
              params.data.account_name = selectedAccount.account_name ?? undefined;
              params.data.account_number = selectedAccount.account_number ?? undefined;
            }
            return true;
          }
          return false;
        },
        cellRenderer: (params: { data?: Transaction; value?: string }) => {
          if (!params.value || !params.data) {
            return 'N/A';
          }
          const accountName = params.data.account_name || 'Account';
          const accountNumber = params.data.account_number;
          const displayText = accountNumber ? `${accountName} (${accountNumber})` : accountName;

          if (isEditMode) {
            return <span>{displayText}</span>;
          }

          return (
            <Link
              href={`/dashboard/accounts/${params.value}`}
              className="group inline-flex items-center gap-1.5 text-primary hover:underline"
              onClick={(e) => {
                e.stopPropagation(); // Prevent row selection
              }}
            >
              <span>{displayText}</span>
              <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          );
        },
      },
      {
        field: 'category_id',
        headerName: 'Category',
        width: 150,
        sortable: true,
        filter: true,
        editable: isEditMode,
        cellEditor: SelectCellEditor,
        cellEditorParams: {
          options: categoryOptions,
        },
        valueGetter: (params) => {
          // Return category_id for editing
          return params.data?.category_id || null;
        },
        valueSetter: (params) => {
          // Update category_id when value changes
          if (params.data) {
            params.data.category_id = params.newValue || null;
            // Update category_name immediately when category_id changes
            const selectedCategory = categories?.find((cat) => cat.id === params.newValue);
            if (selectedCategory && selectedCategory.name) {
              params.data.category_name = selectedCategory.name;
            } else {
              params.data.category_name = undefined;
            }
            return true;
          }
          return false;
        },
        cellRenderer: (params: { data?: Transaction }) => {
          // Display category_name for viewing
          return params.data?.category_name || 'N/A';
        },
      },
      {
        field: 'merchant_id',
        headerName: 'Merchant',
        width: 150,
        sortable: true,
        filter: true,
        editable: isEditMode,
        cellEditor: SelectCellEditor,
        cellEditorParams: {
          options: merchantOptions,
        },
        valueGetter: (params) => {
          // Return merchant_id for editing
          return params.data?.merchant_id || null;
        },
        valueSetter: (params) => {
          // Update merchant_id when value changes
          if (params.data) {
            params.data.merchant_id = params.newValue || null;
            // Update merchant_name immediately when merchant_id changes
            const selectedMerchant = merchants?.find((merchant) => merchant.id === params.newValue);
            if (selectedMerchant && selectedMerchant.name) {
              params.data.merchant_name = selectedMerchant.name;
            } else {
              params.data.merchant_name = undefined;
            }
            return true;
          }
          return false;
        },
        cellRenderer: (params: { data?: Transaction }) => {
          // Display merchant_name for viewing
          return params.data?.merchant_name || 'N/A';
        },
      },
      {
        field: 'payment_method',
        headerName: 'Payment Method',
        width: 150,
        sortable: true,
        filter: true,
        editable: false,
      },
      {
        field: 'reference_number',
        headerName: 'Reference',
        width: 150,
        sortable: true,
        filter: true,
        editable: false,
      },
      {
        headerName: 'Date',
        width: 150,
        sortable: true,
        filter: true,
        editable: isEditMode,
        cellEditor: DateCellEditor,
        cellEditorParams: {
          max: startOfDay(new Date()).toISOString().split('T')[0], // Prevent future dates
        },
        valueGetter: (params) => {
          // Access transaction_date from data since it's not in the type definition
          // Fallback to created_at if transaction_date is not available
          return (params.data as any)?.transaction_date || params.data?.created_at;
        },
        valueSetter: (params) => {
          // Update transaction_date when value changes
          if (params.data) {
            (params.data as any).transaction_date = params.newValue || null;
            return true;
          }
          return false;
        },
        cellRenderer: (params: { value?: string; data?: Transaction }) => {
          const dateValue =
            params.value || (params.data as any)?.transaction_date || params.data?.created_at;
          if (!dateValue) {
            return 'N/A';
          }
          return formatDate(dateValue);
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
        editable: isEditMode,
        cellEditor: BooleanCellEditor,
        valueGetter: (params) => {
          return params.data?.is_recurring ?? false;
        },
        valueSetter: (params) => {
          if (params.data) {
            params.data.is_recurring = params.newValue as boolean;
            return true;
          }
          return false;
        },
        cellRenderer: (params: { value?: boolean }) => {
          return params.value ? 'Yes' : 'No';
        },
      },
      {
        field: 'is_cash',
        headerName: 'Cash',
        width: 100,
        sortable: true,
        filter: true,
        editable: isEditMode,
        cellEditor: BooleanCellEditor,
        valueGetter: (params) => {
          return params.data?.is_cash ?? false;
        },
        valueSetter: (params) => {
          if (params.data) {
            params.data.is_cash = params.newValue as boolean;
            return true;
          }
          return false;
        },
        cellRenderer: (params: { value?: boolean }) => {
          return params.value ? 'Yes' : 'No';
        },
      },
      {
        headerName: 'Actions',
        width: 120,
        sortable: false,
        filter: false,
        editable: false, // Explicitly prevent editing
        cellRenderer: (params: { data?: Transaction }) => {
          if (!params.data?.id) {
            return null;
          }

          const rowId = params.data.id;
          const isModified = modifiedRowIds.has(rowId);
          const isSaving = savingRowIds.has(rowId);

          return (
            <RowActions
              isEditMode={isEditMode}
              isModified={isModified}
              onSave={() => {
                handleRowSave(rowId);
              }}
              onCancel={() => {
                handleRowCancel(rowId);
              }}
              onDelete={() => {
                handleDeleteClick(params.data!);
              }}
              isSaving={isSaving}
              showDelete={!isEditMode || !isModified}
              isDeleting={isDeleting}
            />
          );
        },
      },
    ],
    [
      isDeleting,
      isEditMode,
      categoryOptions,
      merchantOptions,
      typeOptions,
      accountOptions,
      accounts,
      categories,
      merchants,
      modifiedRowIds,
      savingRowIds,
      handleRowSave,
      handleRowCancel,
      handleDeleteClick,
    ]
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
          <div className="flex gap-2">
            {isEditMode ? (
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditMode(false);
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel Edit
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditMode(true);
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Mode
              </Button>
            )}
            <Button asChild>
              <Link href="/dashboard/transactions/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Transaction
              </Link>
            </Button>
          </div>
        }
        className="flex flex-col flex-1 min-h-0"
      >
        <div className="flex-1 min-h-0">
          <DataGrid<Transaction>
            ref={gridApiRef}
            columns={columnDefs}
            data={transactions || []}
            loading={isLoading || isFetching || transactions === undefined}
            defaultColDef={defaultColDef}
            height="100%"
            editable={isEditMode}
            onCellValueChanged={handleCellValueChanged}
            stopEditingWhenCellsLoseFocus={true}
            enterNavigatesVerticallyAfterEdit={true}
            singleClickEdit={true}
            getRowStyle={(params) => {
              // Highlight rows with unsaved changes
              if (params.data?.id && modifiedRowIds.has(params.data.id)) {
                return {
                  backgroundColor: '#fefce8', // yellow-50
                  borderLeft: '4px solid #facc15', // yellow-400
                };
              }
              return undefined;
            }}
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
