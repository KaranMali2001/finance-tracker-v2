/**
 * Default debounce delay for async operations (in milliseconds)
 */
export const DEFAULT_DEBOUNCE_MS = 300;

/**
 * Minimum search length for async dropdowns
 */
export const DEFAULT_MIN_SEARCH_LENGTH = 1;

/**
 * Default pagination values
 */
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

/**
 * Common error messages
 */
export const ERROR_MESSAGES = {
  UNKNOWN: 'An unknown error occurred',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION: 'Please check the form for errors.',
} as const;

/**
 * Common success messages
 */
export const SUCCESS_MESSAGES = {
  CREATED: 'Created successfully',
  UPDATED: 'Updated successfully',
  DELETED: 'Deleted successfully',
  SAVED: 'Saved successfully',
} as const;
