'use client';

import type { internal_domain_reconciliation_ParsedTxns } from '@/generated/api';
import { OpenAPI } from '@/generated/api/core/OpenAPI';
import { request as __request } from '@/generated/api/core/request';
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
      __request<Array<internal_domain_reconciliation_ParsedTxns>>(OpenAPI, {
        method: 'POST',
        url: '/reconciliation/upload',
        // NOTE: Echo's default binder binds multipart fields by `form:"..."` tags,
        // and this request struct currently has only `json:"..."` tags.
        // So we send keys matching Go struct field names to satisfy binding/validation.
        formData: {
          statement: payload.statement,
          StatementPeriodStart: payload.statementPeriodStart,
          StatementPeriodEnd: payload.statementPeriodEnd,
          AccountId: payload.accountId,
          UserId: payload.userId,
          FileName: payload.fileName,
        },
        errors: {
          400: 'Bad Request',
          401: 'Unauthorized',
          500: 'Internal Server Error',
        },
      }),
    {
      showToastOnError: true,
      showToastOnSuccess: true,
      successMessage: 'Statement uploaded successfully',
    }
  );
}
