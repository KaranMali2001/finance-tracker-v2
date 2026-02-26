/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { internal_domain_reconciliation_MatchSignals } from './internal_domain_reconciliation_MatchSignals';
export type internal_domain_reconciliation_ReconciliationResultRow = {
    app_transaction_id?: string;
    confidence_score?: number;
    created_at?: string;
    id?: string;
    match_signals?: internal_domain_reconciliation_MatchSignals;
    match_status?: string;
    result_type?: string;
    statement_transaction_id?: string;
    stmt_amount?: number;
    /**
     * Statement transaction side
     */
    stmt_date?: string;
    stmt_description?: string;
    stmt_reference_number?: string;
    stmt_row_number?: number;
    stmt_type?: string;
    upload_id?: string;
    user_action?: string;
};

