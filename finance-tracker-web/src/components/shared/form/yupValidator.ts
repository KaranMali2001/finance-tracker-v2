import * as Yup from 'yup';
import type { ValidationError } from '@tanstack/react-form';

/**
 * Create a TanStack Form validator from a Yup schema
 */
export function createYupValidator<TData extends Yup.AnyObject>(schema: Yup.ObjectSchema<TData>) {
  return async (value: TData): Promise<ValidationError> => {
    try {
      await schema.validate(value, { abortEarly: false });
      return undefined;
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const fieldErrors: Record<string, string> = {};

        // Collect all field errors
        if (error.inner && error.inner.length > 0) {
          for (const innerError of error.inner) {
            if (innerError.path && innerError.message) {
              fieldErrors[innerError.path] = innerError.message;
            }
          }
        } else if (error.path && error.message) {
          fieldErrors[error.path] = error.message;
        }

        // Return first error for the field or general error
        const firstPath = error.path || '_form';
        const firstMessage = fieldErrors[firstPath] || error.message || 'Validation failed';

        return {
          type: 'validation',
          message: firstMessage,
          meta: {
            fieldErrors,
          },
        };
      }

      // Fallback error
      return {
        type: 'validation',
        message: 'Validation failed',
      };
    }
  };
}

/**
 * Create a field validator from a Yup schema field
 */
export function createYupFieldValidator<TValue>(
  schema: Yup.Schema<TValue>
): (value: TValue) => Promise<string | undefined> {
  return async (value: TValue): Promise<string | undefined> => {
    try {
      await schema.validate(value);
      return undefined;
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        return error.message;
      }
      return 'Validation failed';
    }
  };
}
