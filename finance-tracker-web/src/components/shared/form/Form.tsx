'use client';

import { useForm } from '@tanstack/react-form';
import React from 'react';
import * as Yup from 'yup';
import { toast } from '../feedback/Toast';
import type { BaseFormProps } from '../types/form';
import { parseApiError } from '../utils';

/**
 * Form context to provide form instance to children
 */
const FormContext = React.createContext<any>(null);

export function useSharedFormContext<TData>(): any {
  const context = React.useContext(FormContext);
  if (!context) {
    throw new Error('useSharedFormContext must be used within <Form>');
  }
  return context;
}

/**
 * Enhanced Form wrapper using TanStack Form with Yup validation
 */
export function Form<TInput extends Record<string, unknown>, TOutput = TInput>({
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

  const form = useForm({
    defaultValues: (defaultValues || {}) as TInput,
    onSubmit: async ({ value }: { value: TInput }) => {
      setIsSubmitting(true);
      try {
        // Validate with Yup schema
        await schema.validate(value, { abortEarly: false });

        // Transform data if transform function provided
        const transformedValue = transform ? transform(value) : (value as unknown as TOutput);

        // Submit
        await onSubmit(transformedValue);

        // Show success toast if enabled
        if (showToastOnSuccess) {
          toast.success(successMessage || 'Operation completed successfully');
        }
      } catch (error) {
        // Handle Yup validation errors
        if (error instanceof Yup.ValidationError) {
          if (showToastOnError) {
            toast.error(error.message || 'Validation failed');
          }
          return; // Don't call onError for validation errors
        }

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
  });

  return (
    <FormContext.Provider value={form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const formSubmit = (form as any).handleSubmit;
          if (typeof formSubmit === 'function') {
            formSubmit();
          }
        }}
        className={`space-y-6 ${className || ''}`}
      >
        {typeof children === 'function' ? children({ form, isSubmitting }) : children}
      </form>
    </FormContext.Provider>
  );
}
