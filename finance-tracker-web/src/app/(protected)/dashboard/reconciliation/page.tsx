'use client';

import { ReconciliationUploadForm } from '@/components/reconciliationComponents/ReconciliationUploadForm/ReconciliationUploadForm';
import { PageShell } from '@/components/shared/layout';

export default function ReconciliationPage() {
  return (
    <PageShell
      title="Reconciliation"
      description="Upload an Excel bank statement and test the reconciliation flow"
    >
      <ReconciliationUploadForm />
    </PageShell>
  );
}
