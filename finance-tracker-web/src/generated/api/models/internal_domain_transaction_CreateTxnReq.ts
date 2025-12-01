/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { internal_domain_transaction_TxnType } from './internal_domain_transaction_TxnType';
export type internal_domain_transaction_CreateTxnReq = {
  account_id: string;
  amount?: number;
  category_id?: string;
  description?: string;
  is_recurring?: boolean;
  merchant_id?: string;
  notes?: string;
  payment_method?: string;
  reference_number?: string;
  sms_id?: string;
  tags?: string;
  transaction_date?: string;
  type?: internal_domain_transaction_TxnType;
  user_id?: string;
};
