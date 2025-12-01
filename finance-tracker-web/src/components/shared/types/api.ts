/**
 * Backend HTTP Error Structure
 * Matches backend/internal/errs/http.go
 */
export interface BackendFieldError {
  field: string;
  error: string;
}

export type ActionType = 'redirect';

export interface BackendAction {
  type: ActionType;
  message: string;
  value: string;
}

export interface BackendHTTPError {
  code: string;
  message: string;
  status: number;
  override: boolean;
  errors?: BackendFieldError[];
  action?: BackendAction;
}

/**
 * Generic API Response
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/**
 * Paginated API Response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Parsed API Error Details
 */
export interface ApiErrorDetails {
  code: string;
  message: string;
  status: number;
  fieldErrors?: Record<string, string>;
  action?: BackendAction;
}

/**
 * Transaction Types - Re-exported from generated API for convenience
 */
export type {
  internal_domain_transaction_Trasaction as Transaction,
  internal_domain_transaction_CreateTxnReq as CreateTransactionRequest,
  internal_domain_transaction_SoftDeleteTxnsReq as SoftDeleteTransactionsRequest,
} from '@/generated/api';
