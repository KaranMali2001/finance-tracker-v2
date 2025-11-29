'use client';

import React from 'react';
import { useSharedFormContext } from './Form';
import { Label } from '@/components/ui/label';

interface FormItemContextValue {
  id: string;
}

const FormItemContext = React.createContext<FormItemContextValue | null>(null);

function FormItem({ className, ...props }: React.ComponentProps<'div'>) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div data-slot="form-item" className={`grid gap-2 ${className || ''}`} {...props} />
    </FormItemContext.Provider>
  );
}

function useFormItem() {
  const context = React.useContext(FormItemContext);
  if (!context) {
    throw new Error('useFormItem must be used within <FormItem>');
  }
  return context;
}

interface FormLabelProps extends React.ComponentProps<typeof Label> {
  required?: boolean;
}

function FormLabel({ className, required, children, ...props }: FormLabelProps) {
  return (
    <Label data-slot="form-label" className={className} {...props}>
      {children}
      {required && <span className="text-destructive ml-1">*</span>}
    </Label>
  );
}

function FormDescription({ className, ...props }: React.ComponentProps<'p'>) {
  const { id } = useFormItem();

  return (
    <p
      data-slot="form-description"
      id={`${id}-form-item-description`}
      className={`text-muted-foreground text-sm ${className || ''}`}
      {...props}
    />
  );
}

interface FormMessageProps extends React.ComponentProps<'p'> {
  error?: string;
}

function FormMessage({ className, error, ...props }: FormMessageProps) {
  const { id } = useFormItem();
  const body = error || props.children;

  if (!body) {
    return null;
  }

  return (
    <p
      data-slot="form-message"
      id={`${id}-form-item-message`}
      className={`text-destructive text-sm ${className || ''}`}
      {...props}
    >
      {body}
    </p>
  );
}

export { FormItem, FormLabel, FormDescription, FormMessage, useFormItem };
