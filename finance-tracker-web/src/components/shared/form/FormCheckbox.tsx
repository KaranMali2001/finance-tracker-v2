'use client';

import React from 'react';
import { useSharedFormContext } from './Form';
import { FormItem, FormLabel, FormDescription, FormMessage, useFormItem } from './FormField';
import { Checkbox } from '@/components/ui/checkbox';
import type { FormFieldProps } from '../types/form';

interface FormCheckboxProps<TData extends Record<string, unknown>>
  extends
    Omit<React.ComponentProps<typeof Checkbox>, 'name' | 'checked' | 'onCheckedChange'>,
    FormFieldProps {
  name: keyof TData & string;
}

export function FormCheckbox<TData extends Record<string, unknown>>({
  name,
  label,
  description,
  className,
  ...checkboxProps
}: FormCheckboxProps<TData>) {
  const form = useSharedFormContext<TData>();
  const { id } = useFormItem();
  const field = form.useField({
    name,
    defaultValue: false as any,
  });

  return (
    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
      <Checkbox
        {...checkboxProps}
        id={`${id}-form-item`}
        name={field.name}
        checked={field.state.value as boolean}
        onCheckedChange={(checked) => field.handleChange(checked as any)}
        onBlur={field.handleBlur}
        aria-invalid={field.state.meta.errors.length > 0}
        className={className}
      />
      <div className="space-y-1 leading-none">
        {label && (
          <FormLabel htmlFor={`${id}-form-item`} className="cursor-pointer">
            {label}
          </FormLabel>
        )}
        {description && <FormDescription>{description}</FormDescription>}
        <FormMessage error={field.state.meta.errors[0]} />
      </div>
    </FormItem>
  );
}
