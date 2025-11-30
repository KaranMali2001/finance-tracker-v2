import type { Control, FieldPath, FieldValues, UseFormReturn } from 'react-hook-form';
import type { z } from 'zod';

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
 * Base form props for react-hook-form wrapper
 */
export interface BaseFormProps<TInput extends FieldValues, TOutput = TInput> {
  /**
   * Zod validation schema
   */
  schema: z.ZodSchema<TInput>;

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
  children:
    | React.ReactNode
    | ((props: { form: UseFormReturn<TInput>; isSubmitting: boolean }) => React.ReactNode);

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

/**
 * Base props that all form field components will share
 */
export interface BaseFormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Common option type for selects, radio groups, etc.
 */
export interface FormOption {
  value: string;
  label: string;
  disabled?: boolean;
}
