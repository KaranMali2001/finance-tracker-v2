/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { internal_domain_reconciliation_ParseError } from './internal_domain_reconciliation_ParseError';
export type internal_domain_reconciliation_UploadSummary = {
    duplicate_rows?: number;
    error_rows?: number;
    errors?: Array<internal_domain_reconciliation_ParseError>;
    total_rows?: number;
    valid_rows?: number;
};

