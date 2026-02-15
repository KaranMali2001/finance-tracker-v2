/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { internal_domain_reconciliation_ParsedTxns } from './internal_domain_reconciliation_ParsedTxns';
import type { internal_domain_reconciliation_UploadSummary } from './internal_domain_reconciliation_UploadSummary';
export type internal_domain_reconciliation_UploadStatementRes = {
    job_id?: string;
    status?: string;
    summary?: internal_domain_reconciliation_UploadSummary;
    txns?: Array<internal_domain_reconciliation_ParsedTxns>;
    upload_id?: string;
};

