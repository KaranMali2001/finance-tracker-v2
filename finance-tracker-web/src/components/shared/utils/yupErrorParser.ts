import { ValidationError } from 'yup';

/**
 * Parse Yup validation errors and convert to field-level error object
 * Returns object with field names as keys and error messages as values
 */
export function parseYupErrors(error: unknown): Record<string, string> {
  if (!error) {
    return {};
  }

  // Handle Yup ValidationError
  if (error instanceof ValidationError) {
    const fieldErrors: Record<string, string> = {};

    if (error.inner && error.inner.length > 0) {
      // Handle nested errors (multiple fields)
      for (const innerError of error.inner) {
        if (innerError.path && innerError.message) {
          fieldErrors[innerError.path] = innerError.message;
        }
      }
    } else if (error.path && error.message) {
      // Single field error
      fieldErrors[error.path] = error.message;
    }

    return fieldErrors;
  }

  // Handle Error objects
  if (error instanceof Error) {
    return {
      _error: error.message,
    };
  }

  return {};
}

/**
 * Get first error message from Yup validation error
 */
export function getYupFirstError(error: unknown): string | undefined {
  const fieldErrors = parseYupErrors(error);
  const firstError = Object.values(fieldErrors)[0];
  return firstError;
}
