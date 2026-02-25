'use client';

import {
  useDeleteReconciliationUpload,
  useReconciliationUploadDetail,
} from '@/components/shared/hooks/useReconciliation';
import { ConfirmDialog } from '@/components/shared/dialog/ConfirmDialog';
import { ErrorState, LoadingState, PageShell } from '@/components/shared/layout';
import { TanStackTable, type TanStackTableColumn } from '@/components/shared/table';
import { Button } from '@/components/ui/button';
import type {
  internal_domain_reconciliation_ParseError,
  internal_domain_reconciliation_StatementTransaction,
} from '@/generated/api';
import { format } from 'date-fns';
import { AlertCircle, ArrowLeft, CheckCircle2, Copy, Trash2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

type ReconTransaction = internal_domain_reconciliation_StatementTransaction;

export default function ReconciliationUploadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const uploadId = params.uploadId as string;
  const { data: upload, isLoading, error, refetch } = useReconciliationUploadDetail(uploadId);
  const deleteUpload = useDeleteReconciliationUpload();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <PageShell title="Upload details" description="Bank statement upload">
        <LoadingState variant="skeleton" count={5} />
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell title="Upload details" description="Bank statement upload">
        <ErrorState error={error} onRetry={() => refetch()} />
      </PageShell>
    );
  }

  if (!upload) {
    return (
      <PageShell title="Upload details" description="Bank statement upload">
        <ErrorState error={new Error('Upload not found')} />
      </PageShell>
    );
  }

  const reconTransactionColumns: TanStackTableColumn<ReconTransaction>[] = useMemo(
    () => [
      {
        id: 'row',
        header: 'Row',
        width: 'col-span-1',
        cell: (txn) => <span className="font-mono text-muted-foreground">{txn.row_number}</span>,
      },
      {
        id: 'date',
        header: 'Date',
        width: 'col-span-2',
        cell: (txn) => (
          <span className="whitespace-nowrap">
            {txn.transaction_date ? format(new Date(txn.transaction_date), 'dd MMM yyyy') : '—'}
          </span>
        ),
      },
      {
        id: 'description',
        header: 'Description',
        width: 'col-span-3',
        cell: (txn) => (
          <span className="max-w-[200px] truncate block" title={txn.description ?? ''}>
            {txn.description ?? '—'}
          </span>
        ),
      },
      {
        id: 'amount',
        header: 'Amount',
        width: 'col-span-2',
        cell: (txn) => (
          <span className="font-mono whitespace-nowrap">
            {(txn.amount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        ),
      },
      {
        id: 'type',
        header: 'Type',
        width: 'col-span-2',
        cell: (txn) => (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              txn.type === 'CREDIT' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {txn.type}
          </span>
        ),
      },
      {
        id: 'reference',
        header: 'Reference',
        width: 'col-span-1',
        cell: (txn) => (
          <span className="font-mono text-xs text-muted-foreground">
            {txn.reference_number ?? '—'}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        width: 'col-span-1',
        cell: (txn) =>
          txn.is_duplicate ? (
            <span className="inline-flex items-center rounded-full border border-yellow-400 px-2 py-0.5 text-xs font-medium text-yellow-700">
              Duplicate
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full border border-green-400 px-2 py-0.5 text-xs font-medium text-green-700">
              Inserted
            </span>
          ),
      },
    ],
    []
  );

  return (
    <PageShell
      title={upload.file_name ?? 'Upload details'}
      description="Bank statement upload details"
    >
      <div className="space-y-6">
        {/* Header actions */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" asChild>
            <Link href="/dashboard/reconciliation">
              <ArrowLeft className="h-4 w-4" />
              Back to reconciliation
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={deleteUpload.isPending}
          >
            <Trash2 className="h-4 w-4" />
            Delete upload
          </Button>
        </div>

        {/* Summary counts */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-green-500 shrink-0" />
            <div>
              <p className="text-2xl font-bold text-card-foreground">{upload.valid_rows ?? 0}</p>
              <p className="text-sm text-muted-foreground">Inserted</p>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
            <Copy className="h-8 w-8 text-yellow-500 shrink-0" />
            <div>
              <p className="text-2xl font-bold text-card-foreground">
                {upload.duplicate_rows ?? 0}
              </p>
              <p className="text-sm text-muted-foreground">Duplicates</p>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
            <XCircle className="h-8 w-8 text-red-500 shrink-0" />
            <div>
              <p className="text-2xl font-bold text-card-foreground">{upload.error_rows ?? 0}</p>
              <p className="text-sm text-muted-foreground">Errors</p>
            </div>
          </div>
        </div>

        {/* Upload metadata */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-card-foreground">Upload information</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <span className="text-sm font-medium text-muted-foreground">File name</span>
              <p className="mt-1 text-card-foreground">{upload.file_name ?? '—'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Upload status</span>
              <p className="mt-1 text-card-foreground">{upload.upload_status ?? '—'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Processing status</span>
              <p className="mt-1 text-card-foreground">{upload.processing_status ?? '—'}</p>
            </div>
            {upload.account_id && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Account ID</span>
                <p className="mt-1 font-mono text-sm text-card-foreground">{upload.account_id}</p>
              </div>
            )}
            {upload.id && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Upload ID</span>
                <p className="mt-1 font-mono text-sm text-card-foreground">{upload.id}</p>
              </div>
            )}
            {upload.statement_period_start && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Statement period start
                </span>
                <p className="mt-1 text-card-foreground">
                  {format(new Date(upload.statement_period_start), 'dd MMM yyyy')}
                </p>
              </div>
            )}
            {upload.statement_period_end && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Statement period end
                </span>
                <p className="mt-1 text-card-foreground">
                  {format(new Date(upload.statement_period_end), 'dd MMM yyyy')}
                </p>
              </div>
            )}
            {upload.created_at && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Created</span>
                <p className="mt-1 text-card-foreground">
                  {format(new Date(upload.created_at), 'dd MMM yyyy HH:mm')}
                </p>
              </div>
            )}
            {upload.updated_at && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Updated</span>
                <p className="mt-1 text-card-foreground">
                  {format(new Date(upload.updated_at), 'dd MMM yyyy HH:mm')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Parsing errors */}
        {upload.parsing_errors && upload.parsing_errors.length > 0 && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <h2 className="text-lg font-semibold text-card-foreground">
                Parse errors ({upload.parsing_errors.length})
              </h2>
            </div>
            <div className="space-y-2">
              {upload.parsing_errors.map(
                (e: internal_domain_reconciliation_ParseError, i: number) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-md border border-border bg-card p-3 text-sm"
                  >
                    <span className="shrink-0 font-mono text-muted-foreground">Row {e.row}</span>
                    <span className="text-destructive">{e.error}</span>
                    {e.data && Object.keys(e.data).length > 0 && (
                      <span className="ml-auto font-mono text-xs text-muted-foreground">
                        {JSON.stringify(e.data)}
                      </span>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Transactions table */}
        {upload.transactions && upload.transactions.length > 0 && (
          <div className="rounded-lg border border-border bg-card">
            <div className="p-6 pb-3">
              <h2 className="text-lg font-semibold text-card-foreground">
                Transactions ({upload.transactions.length})
              </h2>
            </div>
            <TanStackTable<ReconTransaction>
              data={upload.transactions}
              columns={reconTransactionColumns}
              getRowId={(row) => row.id ?? String(row.row_number)}
              minTableWidth="800px"
              bare
            />
          </div>
        )}
      </div>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete upload"
        description="This will delete this statement upload and all its related transactions and reconciliation data. App transactions linked to it will be unlinked. This cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        destructive
        onConfirm={async () => {
          if (uploadId) {
            await deleteUpload.mutateAsync(uploadId);
            router.push('/dashboard/reconciliation');
          }
        }}
      />
    </PageShell>
  );
}
