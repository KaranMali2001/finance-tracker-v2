import type * as Yup from 'yup';

/**
 * Transform function type for form data transformation
 */
export type TransformFn<TInput, TOutput> = (input: TInput) => TOutput;

/**
 * Form submission handler
 */
export type FormSubmitHandler<TInput, TOutput> = (data: TOutput) => Promise<void> | void;

/**
 * Form error handler
 */
export type FormErrorHandler = (error: unknown) => void;

/**
 * Base form props for TanStack Form wrapper
 */
export interface BaseFormProps<TInput, TOutput = TInput> {
  /**
   * Yup validation schema
   */
  schema: Yup.ObjectSchema<TInput & Yup.AnyObject>;

  /**
   * Default form values
   */
  defaultValues?: Partial<TInput>;

  /**
   * Submit handler - receives transformed data
   */
  onSubmit: FormSubmitHandler<TInput, TOutput>;

  /**
   * Transform function to convert input to output before submit
   */
  transform?: TransformFn<TInput, TOutput>;

  /**
   * Custom error handler
   */
  onError?: FormErrorHandler;

  /**
   * Show toast notification on error (default: true)
   */
  showToastOnError?: boolean;

  /**
   * Show toast notification on success (default: false)
   */
  showToastOnSuccess?: boolean;

  /**
   * Success toast message
   */
  successMessage?: string;

  /**
   * Form children - can be ReactNode or render function
   */
  children: React.ReactNode | ((props: { form: any; isSubmitting: boolean }) => React.ReactNode);

  /**
   * Additional form props
   */
  className?: string;
}

/**
 * Form field props
 */
export interface FormFieldProps {
  label?: string;
  description?: string;
  required?: boolean;
  className?: string;
}
