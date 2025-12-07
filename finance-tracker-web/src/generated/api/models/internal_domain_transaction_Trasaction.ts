/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { internal_domain_transaction_TxnType } from './internal_domain_transaction_TxnType';
export type internal_domain_transaction_Trasaction = {
    account_id?: string;
    account_name?: string;
    account_number?: string;
    account_type?: string;
    amount?: number;
    category_id?: string;
    category_name?: string;
    created_at?: string;
    deleted_at?: string;
    deleted_by?: string;
    description?: string;
    id?: string;
    is_cash?: boolean;
    is_excluded?: boolean;
    is_recurring?: boolean;
    merchant_id?: string;
    merchant_name?: string;
    notes?: string;
    payment_method?: string;
    reference_number?: string;
    sms_id?: string;
    sms_message?: string;
    tags?: string;
    to_account_id?: string;
    to_account_name?: string;
    to_account_number?: string;
    type?: internal_domain_transaction_TxnType;
    updated_at?: string;
    user_id?: string;
};

