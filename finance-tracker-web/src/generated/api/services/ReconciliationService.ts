/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { internal_domain_reconciliation_ParsedTxns } from '../models/internal_domain_reconciliation_ParsedTxns';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ReconciliationService {
    /**
     * Upload bank statement for reconciliation
     * Uploads a bank statement Excel file and starts reconciliation processing
     * @param statement Bank statement Excel file (.xls, .xlsx)
     * @param statementPeriodStart Statement period start
     * @param statementPeriodEnd Statement period end
     * @param accountId Account ID
     * @param userId User ID (Clerk ID)
     * @param fileName Original file name
     * @returns internal_domain_reconciliation_ParsedTxns Accepted
     * @throws ApiError
     */
    public static postReconciliationUpload(
        statement: Blob,
        statementPeriodStart: string,
        statementPeriodEnd: string,
        accountId: string,
        userId: string,
        fileName: string,
    ): CancelablePromise<Array<internal_domain_reconciliation_ParsedTxns>> {
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
}
