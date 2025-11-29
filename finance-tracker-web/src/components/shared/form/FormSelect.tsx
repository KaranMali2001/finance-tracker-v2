'use client';

import React from 'react';
import { useSharedFormContext } from './Form';
import { FormItem, FormLabel, FormDescription, FormMessage, useFormItem } from './FormField';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, Check } from 'lucide-react';
import type { FormFieldProps } from '../types/form';
import * as Yup from 'yup';
import { createYupFieldValidator } from './yupValidator';

interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface FormSelectProps<TData extends Record<string, unknown>>
  extends Omit<React.ComponentProps<'select'>, 'name' | 'value' | 'onChange'>, FormFieldProps {
  name: keyof TData & string;
  options: SelectOption[];
  schema?: Yup.Schema<unknown>;
  placeholder?: string;
}

export function FormSelect<TData extends Record<string, unknown>>({
  name,
  label,
  description,
  required,
  className,
  options,
  schema,
  placeholder = 'Select an option',
  ...selectProps
}: FormSelectProps<TData>) {
  const form = useSharedFormContext<TData>();
  const { id } = useFormItem();
  const field = form.useField({
    name,
    validators: {
      onChange: schema
        ? createYupFieldValidator(schema)
        : ({ value }: { value: unknown }) => {
            if (required && !value) {
              return 'This field is required';
            }
            return undefined;
          },
    },
  });

  const selectedOption = options.find((opt) => opt.value === (field.state.value as string));

  return (
    <FormItem>
      {label && (
        <FormLabel htmlFor={`${id}-form-item`} required={required}>
          {label}
        </FormLabel>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={`w-full justify-between ${!selectedOption ? 'text-muted-foreground' : ''} ${field.state.meta.errors.length > 0 ? 'border-destructive' : ''} ${className || ''}`}
            aria-invalid={field.state.meta.errors.length > 0}
            aria-describedby={
              description
                ? `${id}-form-item-description`
                : field.state.meta.errors.length > 0
                  ? `${id}-form-item-message`
                  : undefined
            }
          >
            {selectedOption ? selectedOption.label : placeholder}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full" align="start">
          {options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              disabled={option.disabled}
              onSelect={() => {
                field.handleChange(option.value as any);
              }}
              className="cursor-pointer"
            >
              <Check
                className={`mr-2 h-4 w-4 ${field.state.value === option.value ? 'opacity-100' : 'opacity-0'}`}
              />
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage error={field.state.meta.errors[0]} />
    </FormItem>
  );
}
