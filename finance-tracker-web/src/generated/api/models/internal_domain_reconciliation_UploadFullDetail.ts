/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { internal_domain_reconciliation_ParseError } from './internal_domain_reconciliation_ParseError';
import type { internal_domain_reconciliation_StatementTransaction } from './internal_domain_reconciliation_StatementTransaction';
export type internal_domain_reconciliation_UploadFullDetail = {
    account_id?: string;
    created_at?: string;
    duplicate_rows?: number;
    error_rows?: number;
    file_name?: string;
    id?: string;
    parsing_errors?: Array<internal_domain_reconciliation_ParseError>;
    processing_status?: string;
    statement_period_end?: string;
    statement_period_start?: string;
    transactions?: Array<internal_domain_reconciliation_StatementTransaction>;
    updated_at?: string;
    upload_status?: string;
    valid_rows?: number;
};

