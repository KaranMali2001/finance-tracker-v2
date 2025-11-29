'use client';

import React from 'react';
import { useSharedFormContext } from './Form';
import { FormItem, FormLabel, FormDescription, FormMessage, useFormItem } from './FormField';
import { Input } from '@/components/ui/input';
import type { FormFieldProps } from '../types/form';
import * as Yup from 'yup';
import { createYupFieldValidator } from './yupValidator';

interface FormInputProps<TData extends Record<string, unknown>>
  extends Omit<React.ComponentProps<typeof Input>, 'name' | 'value' | 'onChange'>, FormFieldProps {
  name: keyof TData & string;
  schema?: Yup.Schema<unknown>;
}

export function FormInput<TData extends Record<string, unknown>>({
  name,
  label,
  description,
  required,
  className,
  schema,
  ...inputProps
}: FormInputProps<TData>) {
  const form = useSharedFormContext<TData>();
  const { id } = useFormItem();
  const field = form.useField({
    name,
    validators: {
      onChange: schema
        ? createYupFieldValidator(schema)
        : ({ value }: { value: unknown }) => {
            if (required && (!value || (typeof value === 'string' && !value.trim()))) {
              return 'This field is required';
            }
            return undefined;
          },
    },
  });

  return (
    <FormItem>
      {label && (
        <FormLabel htmlFor={`${id}-form-item`} required={required}>
          {label}
        </FormLabel>
      )}
      <Input
        {...inputProps}
        id={`${id}-form-item`}
        name={field.name}
        value={(field.state.value as string) || ''}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        aria-invalid={field.state.meta.errors.length > 0}
        aria-describedby={
          description
            ? `${id}-form-item-description`
            : field.state.meta.errors.length > 0
              ? `${id}-form-item-message`
              : undefined
        }
        className={className}
        required={required}
      />
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage error={field.state.meta.errors[0]} />
    </FormItem>
  );
}
