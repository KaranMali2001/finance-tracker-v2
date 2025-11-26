import { ApiError } from '../../api';

export interface BackendErrorResponse {
  code: string;
  message: string;
  status: number;
  override: boolean;
  errors?: FieldError[];
  action?: {
    type: string;
    message: string;
    value: string;
  };
}

export interface FieldError {
  field: string;
  error: string;
}

export interface ParsedApiError {
  originalError: ApiError | Error;
  backendError: BackendErrorResponse | null;
  status: number;
  statusText: string;
  message: string;
  fieldErrors: FieldError[];
  action: BackendErrorResponse['action'] | null;
  isNetworkError: boolean;
  isServerError: boolean;
  isClientError: boolean;
}

/**
 * Parses ApiError to extract structured backend error information
 */
export function parseApiError(error: unknown): ParsedApiError {
  const isApiError = error instanceof ApiError;
  const apiError = isApiError ? error : null;

  let backendError: BackendErrorResponse | null = null;

  if (apiError?.body) {
    try {
      // Try to parse the body as structured error
      if (typeof apiError.body === 'string') {
        backendError = JSON.parse(apiError.body);
      } else if (typeof apiError.body === 'object') {
        backendError = apiError.body as BackendErrorResponse;
      }
    } catch {
      // Body is not structured error, use fallback
    }
  }

  const status = apiError?.status ?? 0;
  const statusText = apiError?.statusText ?? 'Unknown Error';

  // Extract message from backend error or fallback to ApiError message
  const message = backendError?.message ?? apiError?.message ?? 'An unexpected error occurred';

  return {
    originalError: apiError ?? (new Error(String(error)) as ApiError),
    backendError,
    status,
    statusText,
    message,
    fieldErrors: backendError?.errors ?? [],
    action: backendError?.action ?? null,
    isNetworkError: status === 0 || status >= 500,
    isServerError: status >= 500,
    isClientError: status >= 400 && status < 500,
  };
}
