'use client';

import { Calendar } from '@/components/ui/calendar';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { FieldPath, FieldValues } from 'react-hook-form';
import { BaseFormFieldProps } from '../types/form';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/shared/dialog';
import { isAfter, startOfDay } from 'date-fns';

interface FormDatePickerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  placeholder?: string;
}

function FormDatePicker<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  required,
  placeholder,
  disabled,
  className,
}: FormDatePickerProps<TFieldValues, TName>) {
  const [isOpen, setIsOpen] = useState(false);
  const today = new Date();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('flex flex-col', className)}>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="ml-1 text-red-500">*</span>}
            </FormLabel>
          )}
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <FormControl>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    'w-full pl-3 text-left font-normal',
                    !field.value && 'text-muted-foreground'
                  )}
                  disabled={disabled}
                >
                  {field.value ? (
                    format(new Date(field.value), 'PPP')
                  ) : (
                    <span>{placeholder || 'Pick a date'}</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Select Date</DialogTitle>
              </DialogHeader>
              <Calendar
                mode="single"
                selected={field.value ? new Date(field.value) : undefined}
                defaultMonth={today}
                onSelect={(date) => {
                  if (date) {
                    // Prevent selecting future dates
                    const todayStart = startOfDay(today);
                    const selectedDate = startOfDay(date);
                    if (isAfter(selectedDate, todayStart)) {
                      return;
                    }
                  }
                  field.onChange(date ? date.toISOString() : undefined);
                  setIsOpen(false);
                }}
                disabled={(date) => {
                  // Disable future dates
                  const todayStart = startOfDay(today);
                  const checkDate = startOfDay(date);
                  // Disable if it's a future date or if the component is disabled
                  return disabled || isAfter(checkDate, todayStart);
                }}
                initialFocus
              />
            </DialogContent>
          </Dialog>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export { FormDatePicker };
