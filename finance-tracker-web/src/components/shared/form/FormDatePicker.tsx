'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, isAfter, startOfDay } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { FieldPath, FieldValues } from 'react-hook-form';
import { BaseFormFieldProps } from '../types/form';

interface FormDatePickerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  placeholder?: string;
  allowFutureDates?: boolean;
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
  allowFutureDates = false,
}: FormDatePickerProps<TFieldValues, TName>) {
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
          <Popover>
            <PopoverTrigger asChild>
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
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value ? new Date(field.value) : undefined}
                defaultMonth={field.value ? new Date(field.value) : today}
                showOutsideDays={false}
                onSelect={(date) => {
                  if (date && !allowFutureDates) {
                    // Prevent selecting future dates if not allowed
                    const todayStart = startOfDay(today);
                    const selectedDate = startOfDay(date);
                    if (isAfter(selectedDate, todayStart)) {
                      return;
                    }
                  }
                  field.onChange(date ? format(date, 'yyyy-MM-dd') : undefined);
                }}
                disabled={(date) => {
                  if (disabled) {
                    return true;
                  }
                  if (!allowFutureDates) {
                    // Disable future dates if not allowed
                    const todayStart = startOfDay(today);
                    const checkDate = startOfDay(date);
                    return isAfter(checkDate, todayStart);
                  }
                  return false;
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export { FormDatePicker };
