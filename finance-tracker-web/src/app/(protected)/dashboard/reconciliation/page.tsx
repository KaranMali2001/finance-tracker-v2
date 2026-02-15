'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/shared/dialog';
import { ConfirmDialog } from '@/components/shared/dialog/ConfirmDialog';
import {
  useDeleteReconciliationUpload,
  useReconciliationUploads,
} from '@/components/shared/hooks/useReconciliation';
import { EmptyState, ErrorState, LoadingState, PageShell } from '@/components/shared/layout';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { FileSpreadsheet, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { ReconciliationUploadForm } from '@/components/reconciliationComponents/ReconciliationUploadForm/ReconciliationUploadForm';

export default function ReconciliationPage() {
  const { data: uploads, isLoading, error, refetch, isFetching } = useReconciliationUploads();
  const deleteUpload = useDeleteReconciliationUpload();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  if (isLoading || isFetching || uploads === undefined) {
    return (
      <PageShell
        title="Reconciliation"
        description="Upload an Excel bank statement and test the reconciliation flow"
      >
        <LoadingState variant="skeleton" count={5} />
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell
        title="Reconciliation"
        description="Upload an Excel bank statement and test the reconciliation flow"
      >
        <ErrorState error={error} onRetry={() => refetch()} />
      </PageShell>
    );
  }

  if (uploads.length === 0) {
    return (
      <PageShell
        title="Reconciliation"
        description="Upload an Excel bank statement and test the reconciliation flow"
      >
        <EmptyState
          icon={FileSpreadsheet}
          title="No uploads yet"
          description="Upload a bank statement Excel file to get started with reconciliation."
          action={{
            label: 'Upload statement',
            onClick: () => {
              setIsUploadDialogOpen(true);
            },
          }}
        />
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Upload bank statement</DialogTitle>
              <DialogDescription>
                Upload an Excel bank statement (.xlsx) to parse and reconcile transactions.
              </DialogDescription>
            </DialogHeader>
            <ReconciliationUploadForm
              onSuccess={() => {
                setIsUploadDialogOpen(false);
              }}
              onCancel={() => {
                setIsUploadDialogOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Reconciliation"
      description="Upload an Excel bank statement and test the reconciliation flow"
    >
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setIsUploadDialogOpen(true)}>Upload statement</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {uploads.map((upload) => (
          <div
            key={upload.id}
            className="group relative rounded-lg border border-border bg-card p-6 text-left transition-colors hover:bg-accent"
          >
            <Link
              href={upload.id ? `/dashboard/reconciliation/uploads/${upload.id}` : '#'}
              className="absolute inset-0 z-0"
              aria-hidden
            />
            <div className="relative z-10">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <FileSpreadsheet className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3
                      className="font-semibold text-card-foreground truncate max-w-[200px]"
                      title={upload.file_name}
                    >
                      {upload.file_name || 'Unnamed file'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {upload.upload_status ?? '—'} / {upload.processing_status ?? '—'}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (upload.id) {
                      setDeleteTargetId(upload.id);
                    }
                  }}
                  disabled={deleteUpload.isPending}
                  aria-label="Delete upload"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2 text-sm">
                {upload.statement_period_start && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Period start</span>
                    <span className="text-card-foreground">
                      {format(new Date(upload.statement_period_start), 'dd MMM yyyy')}
                    </span>
                  </div>
                )}
                {upload.statement_period_end && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Period end</span>
                    <span className="text-card-foreground">
                      {format(new Date(upload.statement_period_end), 'dd MMM yyyy')}
                    </span>
                  </div>
                )}
                {upload.created_at && (
                  <div className="flex justify-between border-t border-border pt-2">
                    <span className="text-muted-foreground">Uploaded</span>
                    <span className="text-card-foreground">
                      {format(new Date(upload.created_at), 'dd MMM yyyy HH:mm')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={deleteTargetId != null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTargetId(null);
          }
        }}
        title="Delete upload"
        description="This will delete this statement upload and all its related transactions and reconciliation data. App transactions linked to it will be unlinked. This cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        destructive
        onConfirm={async () => {
          if (deleteTargetId) {
            await deleteUpload.mutateAsync(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
      />

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload bank statement</DialogTitle>
            <DialogDescription>
              Upload an Excel bank statement (.xlsx) to parse and reconcile transactions.
            </DialogDescription>
          </DialogHeader>
          <ReconciliationUploadForm
            onSuccess={() => {
              setIsUploadDialogOpen(false);
            }}
            onCancel={() => {
              setIsUploadDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
