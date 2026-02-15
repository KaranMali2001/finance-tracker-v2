'use client';

import {
  useDeleteReconciliationUpload,
  useReconciliationUpload,
} from '@/components/shared/hooks/useReconciliation';
import { ConfirmDialog } from '@/components/shared/dialog/ConfirmDialog';
import { ErrorState, LoadingState, PageShell } from '@/components/shared/layout';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ReconciliationUploadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const uploadId = params.uploadId as string;
  const { data: upload, isLoading, error, refetch } = useReconciliationUpload(uploadId);
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

  return (
    <PageShell
      title={upload.file_name ?? 'Upload details'}
      description="Bank statement upload details"
    >
      <div className="space-y-6">
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
