'use client';

import { Form as ShadcnForm } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm, type FieldValues, type UseFormReturn } from 'react-hook-form';
import { toast } from '../feedback/Toast';
import type { BaseFormProps } from '../types/form';
import { parseApiError } from '../utils';

/**
 * Enhanced Form wrapper using react-hook-form with Zod validation
 */
export function Form<TInput extends FieldValues, TOutput = TInput>({
  schema,
  defaultValues,
  onSubmit,
  transform,
  onError,
  showToastOnError = true,
  showToastOnSuccess = false,
  successMessage,
  children,
  className,
}: BaseFormProps<TInput, TOutput>) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<TInput, unknown, TInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaultValues: (defaultValues || {}) as any,
  });

  const handleSubmit = form.handleSubmit(
    async (data: TInput) => {
      setIsSubmitting(true);
      try {
        // Transform data if transform function provided
        const transformedValue = transform ? transform(data) : (data as unknown as TOutput);

        // Submit
        await onSubmit(transformedValue);

        // Show success toast if enabled
        if (showToastOnSuccess) {
          toast.success(successMessage || 'Operation completed successfully');
        }
      } catch (error) {
        // Handle API errors
        const apiError = parseApiError(error);

        // Call custom error handler or show toast
        if (onError) {
          onError(error);
        } else if (showToastOnError) {
          toast.error(apiError.message || 'An error occurred');
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    (errors) => {
      // Handle validation errors
      if (showToastOnError) {
        const firstError = Object.values(errors)[0];
        const errorMessage =
          firstError && typeof firstError === 'object' && 'message' in firstError
            ? String(firstError.message)
            : 'Please fix the form errors';
        toast.error(errorMessage);
      }
    }
  );

  return (
    <ShadcnForm {...form}>
      <form onSubmit={handleSubmit} className={`space-y-6 ${className || ''}`}>
        {typeof children === 'function'
          ? children({ form: form as unknown as UseFormReturn<TInput>, isSubmitting })
          : children}
      </form>
    </ShadcnForm>
  );
}
