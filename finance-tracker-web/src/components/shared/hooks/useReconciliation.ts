'use client';

import type { internal_domain_reconciliation_ParsedTxns } from '@/generated/api';
import { ReconciliationService } from '@/generated/api';
import { useApiMutation } from './useApiMutation';

export interface UploadReconciliationStatementInput {
  statement: File;
  statementPeriodStart: string;
  statementPeriodEnd: string;
  accountId: string;
  userId: string;
  fileName: string;
}

export function useUploadReconciliationStatement() {
  return useApiMutation<
    Array<internal_domain_reconciliation_ParsedTxns>,
    UploadReconciliationStatementInput
  >(
    (payload) =>
      ReconciliationService.postReconciliationUpload(
        payload.statement,
        payload.statementPeriodStart,
        payload.statementPeriodEnd,
        payload.accountId,
        payload.userId,
        payload.fileName
      ),
    {
      showToastOnError: true,
      showToastOnSuccess: true,
      successMessage: 'Statement uploaded successfully',
    }
  );
}
