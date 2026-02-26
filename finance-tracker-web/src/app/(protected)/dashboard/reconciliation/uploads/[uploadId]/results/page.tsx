'use client';

import { ReconciliationReviewTable } from '@/components/reconciliationComponents/ReconciliationReviewTable';
import {
  useReconciliationResults,
  useReconciliationUpload,
} from '@/components/shared/hooks/useReconciliation';
import { ErrorState, LoadingState, PageShell } from '@/components/shared/layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

export default function ReconciliationResultsPage() {
  const params = useParams();
  const uploadId = params.uploadId as string;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { data: upload } = useReconciliationUpload(uploadId);
  const { data, isLoading, error, refetch } = useReconciliationResults(uploadId, page, pageSize);

  if (isLoading) {
    return (
      <PageShell title="Reconciliation Results" description="Review matched transactions">
        <LoadingState variant="skeleton" count={6} />
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell title="Reconciliation Results" description="Review matched transactions">
        <ErrorState error={error} onRetry={() => refetch()} />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Reconciliation Results"
      description={upload?.file_name ?? 'Review and accept or reject each matched row'}
    >
      <div className="space-y-4">
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground w-fit" asChild>
          <Link href={`/dashboard/reconciliation/uploads/${uploadId}`}>
            <ArrowLeft className="h-4 w-4" />
            Back to upload detail
          </Link>
        </Button>

        <ReconciliationReviewTable
          results={data?.results ?? []}
          uploadId={uploadId}
          page={page}
          pageSize={pageSize}
          totalPages={data?.total_pages ?? 1}
          total={data?.total ?? 0}
          onPageChange={setPage}
          onPageSizeChange={(s: number) => {
            setPageSize(s);
            setPage(1);
          }}
        />
      </div>
    </PageShell>
  );
}
