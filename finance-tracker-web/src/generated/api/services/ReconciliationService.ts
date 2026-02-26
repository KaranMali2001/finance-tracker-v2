/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { internal_domain_reconciliation_BulkUpdateResultStatusReq } from '../models/internal_domain_reconciliation_BulkUpdateResultStatusReq';
import type { internal_domain_reconciliation_BulkUpdateResultStatusRes } from '../models/internal_domain_reconciliation_BulkUpdateResultStatusRes';
import type { internal_domain_reconciliation_PaginatedReconciliationResults } from '../models/internal_domain_reconciliation_PaginatedReconciliationResults';
import type { internal_domain_reconciliation_UploadDetail } from '../models/internal_domain_reconciliation_UploadDetail';
import type { internal_domain_reconciliation_UploadFullDetailPaginated } from '../models/internal_domain_reconciliation_UploadFullDetailPaginated';
import type { internal_domain_reconciliation_UploadListItem } from '../models/internal_domain_reconciliation_UploadListItem';
import type { internal_domain_reconciliation_UploadStatementRes } from '../models/internal_domain_reconciliation_UploadStatementRes';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ReconciliationService {
    /**
     * Bulk accept or reject reconciliation results
     * Updates the user_action for one or more reconciliation results. Send a single-element array for a single update.
     * @param body Result IDs and user action
     * @returns internal_domain_reconciliation_BulkUpdateResultStatusRes OK
     * @throws ApiError
     */
    public static patchReconciliationResultsStatus(
        body: internal_domain_reconciliation_BulkUpdateResultStatusReq,
    ): CancelablePromise<internal_domain_reconciliation_BulkUpdateResultStatusRes> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/reconciliation/results/status',
            body: body,
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Upload bank statement for reconciliation
     * Uploads a bank statement Excel file and starts reconciliation processing
     * @param statement Bank statement Excel file (.xls, .xlsx)
     * @param statementPeriodStart Statement period start
     * @param statementPeriodEnd Statement period end
     * @param accountId Account ID
     * @param userId User ID (Clerk ID)
     * @param fileName Original file name
     * @returns internal_domain_reconciliation_UploadStatementRes Accepted
     * @throws ApiError
     */
    public static postReconciliationUpload(
        statement: Blob,
        statementPeriodStart: string,
        statementPeriodEnd: string,
        accountId: string,
        userId: string,
        fileName: string,
    ): CancelablePromise<internal_domain_reconciliation_UploadStatementRes> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/reconciliation/upload',
            formData: {
                'statement': statement,
                'statement_period_start': statementPeriodStart,
                'statement_period_end': statementPeriodEnd,
                'account_id': accountId,
                'user_id': userId,
                'file_name': fileName,
            },
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * List bank statement uploads
     * Returns all bank statement uploads for the authenticated user
     * @returns internal_domain_reconciliation_UploadListItem OK
     * @throws ApiError
     */
    public static getReconciliationUploads(): CancelablePromise<Array<internal_domain_reconciliation_UploadListItem>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reconciliation/uploads',
            errors: {
                401: `Unauthorized`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Get bank statement upload by ID
     * Returns details for a single bank statement upload
     * @param uploadId Upload ID
     * @returns internal_domain_reconciliation_UploadDetail OK
     * @throws ApiError
     */
    public static getReconciliationUploads1(
        uploadId: string,
    ): CancelablePromise<internal_domain_reconciliation_UploadDetail> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reconciliation/uploads/{upload_id}',
            path: {
                'upload_id': uploadId,
            },
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Delete bank statement upload
     * Deletes a bank statement upload and all related statement transactions and reconciliation data. Unlinks any app transactions that were linked to this upload.
     * @param uploadId Upload ID
     * @returns void
     * @throws ApiError
     */
    public static deleteReconciliationUploads(
        uploadId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/reconciliation/uploads/{upload_id}',
            path: {
                'upload_id': uploadId,
            },
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Get full upload detail
     * Returns complete detail for a bank statement upload including summary counts, parsing errors, and paginated statement transactions
     * @param uploadId Upload ID
     * @param page Page number (default 1)
     * @param pageSize Page size (default 25)
     * @returns internal_domain_reconciliation_UploadFullDetailPaginated OK
     * @throws ApiError
     */
    public static getReconciliationUploadsDetail(
        uploadId: string,
        page?: number,
        pageSize?: number,
    ): CancelablePromise<internal_domain_reconciliation_UploadFullDetailPaginated> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reconciliation/uploads/{upload_id}/detail',
            path: {
                'upload_id': uploadId,
            },
            query: {
                'page': page,
                'page_size': pageSize,
            },
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Get reconciliation results for an upload
     * Returns paginated reconciliation results for a bank statement upload, including statement transaction details and match signals
     * @param uploadId Upload ID
     * @param page Page number (default 1)
     * @param pageSize Page size (default 25)
     * @returns internal_domain_reconciliation_PaginatedReconciliationResults OK
     * @throws ApiError
     */
    public static getReconciliationUploadsResults(
        uploadId: string,
        page?: number,
        pageSize?: number,
    ): CancelablePromise<internal_domain_reconciliation_PaginatedReconciliationResults> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reconciliation/uploads/{upload_id}/results',
            path: {
                'upload_id': uploadId,
            },
            query: {
                'page': page,
                'page_size': pageSize,
            },
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                500: `Internal Server Error`,
            },
        });
    }
}
