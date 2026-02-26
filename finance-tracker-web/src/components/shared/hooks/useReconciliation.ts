'use client';

import type {
  internal_domain_reconciliation_BulkUpdateResultStatusReq,
  internal_domain_reconciliation_BulkUpdateResultStatusRes,
  internal_domain_reconciliation_PaginatedReconciliationResults,
  internal_domain_reconciliation_ReconciliationResultRow,
  internal_domain_reconciliation_UploadDetail,
  internal_domain_reconciliation_UploadListItem,
  internal_domain_reconciliation_UploadStatementRes,
} from '@/generated/api';
import { ReconciliationService } from '@/generated/api';
import { useAuth } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import { useApiQuery } from './useApiQuery';

export interface UploadReconciliationStatementInput {
  statement: File;
  statementPeriodStart: string;
  statementPeriodEnd: string;
  accountId: string;
  userId: string;
  fileName: string;
}

/**
 * Get all reconciliation uploads for the authenticated user.
 * Only fetches when Clerk is loaded and user is signed in.
 */
export function useReconciliationUploads() {
  const { isLoaded, isSignedIn } = useAuth();

  return useApiQuery<Array<internal_domain_reconciliation_UploadListItem>>(
    ['reconciliation', 'uploads'],
    () => ReconciliationService.getReconciliationUploads(),
    {
      enabled: isLoaded && isSignedIn,
      showToastOnError: true,
    }
  );
}

/**
 * Get a single reconciliation upload by ID.
 * Only fetches when Clerk is loaded, user is signed in, and uploadId is provided.
 */
export function useReconciliationUpload(uploadId: string | null | undefined) {
  const { isLoaded, isSignedIn } = useAuth();

  return useApiQuery<internal_domain_reconciliation_UploadDetail>(
    ['reconciliation', 'uploads', uploadId],
    () => {
      if (!uploadId) {
        throw new Error('Upload ID is required');
      }
      return ReconciliationService.getReconciliationUploads1(uploadId);
    },
    {
      enabled: isLoaded && isSignedIn && !!uploadId,
      showToastOnError: true,
    }
  );
}

export function useUploadReconciliationStatement() {
  const queryClient = useQueryClient();

  return useApiMutation<
    internal_domain_reconciliation_UploadStatementRes,
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
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['reconciliation', 'uploads'] });
      },
      showToastOnError: true,
      showToastOnSuccess: true,
      successMessage: 'Statement uploaded successfully',
    }
  );
}

export type UploadFullDetail = Awaited<
  ReturnType<typeof ReconciliationService.getReconciliationUploadsDetail>
>;

/**
 * Get full detail for a single upload: metadata, summary counts, parsing errors, and paginated transactions.
 * Polls every 3 seconds while processing_status is PROCESSING, then stops.
 */
export function useReconciliationUploadDetail(
  uploadId: string | null | undefined,
  page = 1,
  pageSize = 25
) {
  const { isLoaded, isSignedIn } = useAuth();

  return useApiQuery<UploadFullDetail>(
    ['reconciliation', 'uploads', uploadId, 'detail', page, pageSize],
    () => {
      if (!uploadId) {
        throw new Error('Upload ID is required');
      }
      return ReconciliationService.getReconciliationUploadsDetail(uploadId, page, pageSize);
    },
    {
      enabled: isLoaded && isSignedIn && !!uploadId,
      showToastOnError: true,
      refetchInterval: (query) =>
        query.state.data?.processing_status === 'PROCESSING' ? 3000 : false,
    }
  );
}

/**
 * Delete a reconciliation upload and all related data.
 * Invalidates reconciliation uploads list and the single-upload query on success.
 */
export function useDeleteReconciliationUpload() {
  const queryClient = useQueryClient();

  return useApiMutation<void, string>(
    (uploadId) => ReconciliationService.deleteReconciliationUploads(uploadId),
    {
      onSuccess: (_, uploadId) => {
        queryClient.invalidateQueries({ queryKey: ['reconciliation', 'uploads'] });
        queryClient.removeQueries({ queryKey: ['reconciliation', 'uploads', uploadId] });
      },
      showToastOnError: true,
      showToastOnSuccess: true,
      successMessage: 'Upload deleted',
    }
  );
}

export type ReconciliationResultRow = internal_domain_reconciliation_ReconciliationResultRow;

export type PaginatedReconciliationResults =
  internal_domain_reconciliation_PaginatedReconciliationResults;

/**
 * Get paginated reconciliation results for an upload (matched, missing, unmatched rows).
 */
export function useReconciliationResults(
  uploadId: string | null | undefined,
  page = 1,
  pageSize = 25
) {
  const { isLoaded, isSignedIn } = useAuth();

  return useApiQuery<PaginatedReconciliationResults>(
    ['reconciliation', 'uploads', uploadId, 'results', page, pageSize],
    () => {
      if (!uploadId) throw new Error('Upload ID is required');
      return ReconciliationService.getReconciliationUploadsResults(uploadId, page, pageSize);
    },
    {
      enabled: isLoaded && isSignedIn && !!uploadId,
      showToastOnError: true,
    }
  );
}

/**
 * Bulk accept or reject reconciliation results.
 * For a single item, pass result_ids with one element.
 */
export function useUpdateReconciliationResultStatus() {
  const queryClient = useQueryClient();

  return useApiMutation<
    internal_domain_reconciliation_BulkUpdateResultStatusRes,
    { body: internal_domain_reconciliation_BulkUpdateResultStatusReq; uploadId: string }
  >(({ body }) => ReconciliationService.patchReconciliationResultsStatus(body), {
    onSuccess: (_, { uploadId }) => {
      queryClient.invalidateQueries({
        queryKey: ['reconciliation', 'uploads', uploadId, 'results'],
      });
    },
    showToastOnError: true,
  });
}
