'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/shared/dialog';
import { Dropdown } from '@/components/shared/dropdown';
import type { DropdownOption } from '@/components/shared/types/dropdown';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { ICellEditor, ICellEditorParams } from 'ag-grid-community';
import { format, isAfter, startOfDay } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

/**
 * Custom params including the optional onValueChange callback
 */
export interface CustomCellEditorParams extends ICellEditorParams {
  onValueChange?: (value: any) => void;
}

/**
 * Text Cell Editor - Simple text input
 */
export const TextCellEditor = forwardRef<ICellEditor, CustomCellEditorParams>(
  ({ value, onValueChange, stopEditing }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [inputValue, setInputValue] = useState(value != null ? String(value) : '');

    useImperativeHandle(ref, () => ({
      getValue: () => {
        return inputValue;
      },
      isCancelBeforeStart: () => {
        return false;
      },
      afterGuiAttached: () => {
        // Focus the input when the editor opens
        inputRef.current?.focus();
        inputRef.current?.select();
      },
    }));

    return (
      <Input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => {
          const newValue = e.target.value;
          setInputValue(newValue);
          onValueChange?.(newValue);
        }}
        className="h-full w-full rounded-none border-0 focus-visible:ring-0"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.stopPropagation();
            stopEditing?.();
            return;
          }
          // Stop propagation to prevent grid navigation while typing
          e.stopPropagation();
        }}
      />
    );
  }
);

TextCellEditor.displayName = 'TextCellEditor';

/**
 * Number Cell Editor - Number input with validation
 */
export interface NumberCellEditorParams extends CustomCellEditorParams {
  min?: number;
  max?: number;
  step?: number;
}

export const NumberCellEditor = forwardRef<ICellEditor, NumberCellEditorParams>(
  ({ value, onValueChange, min, max, step, stopEditing }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    // Convert number to string, handling 0 and null/undefined
    // Handle both number and string inputs
    const getInitialValue = () => {
      if (value == null || value === '') {
        return '';
      }
      // If it's already a string, use it; otherwise convert number to string
      return typeof value === 'string' ? value : String(value);
    };
    const [inputValue, setInputValue] = useState(getInitialValue());

    useImperativeHandle(ref, () => ({
      getValue: () => {
        if (inputValue === '' || inputValue === null || inputValue === undefined) {
          return null;
        }
        const numValue = parseFloat(inputValue as string);
        if (isNaN(numValue)) {
          return null;
        }
        if (min !== undefined && numValue < min) {
          return min;
        }
        if (max !== undefined && numValue > max) {
          return max;
        }
        return numValue;
      },
      isCancelBeforeStart: () => {
        return false;
      },
      afterGuiAttached: () => {
        // Focus the input when the editor opens
        inputRef.current?.focus();
        inputRef.current?.select();
      },
    }));

    return (
      <Input
        ref={inputRef}
        type="number"
        value={inputValue}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const newValue = e.target.value;
          setInputValue(newValue);
          const parsed = newValue === '' ? null : parseFloat(newValue);
          onValueChange?.(isNaN(parsed as number) ? null : parsed);
        }}
        className="h-full w-full rounded-none border-0 focus-visible:ring-0"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.stopPropagation();
            stopEditing?.();
            return;
          }
          // Stop propagation to prevent grid navigation while typing
          e.stopPropagation();
        }}
      />
    );
  }
);

NumberCellEditor.displayName = 'NumberCellEditor';

/**
 * Select Cell Editor - Dropdown select
 */
export interface SelectCellEditorParams extends CustomCellEditorParams {
  options: Array<{ label: string; value: string | number }>;
}

export const SelectCellEditor = forwardRef<ICellEditor, SelectCellEditorParams>(
  ({ value, onValueChange, options, stopEditing }, ref) => {
    // Find matching option value or use empty string
    const getInitialValue = () => {
      if (value == null || value === '') {
        return '';
      }
      const valueStr = String(value);
      const matchingOption = options.find((opt) => String(opt.value) === valueStr);
      return matchingOption ? String(matchingOption.value) : '';
    };

    const [selectedValue, setSelectedValue] = useState<string>(getInitialValue());

    useImperativeHandle(ref, () => ({
      getValue: () => {
        return selectedValue || null;
      },
      isCancelBeforeStart: () => {
        return false;
      },
    }));

    const handleValueChange = (newValue: string) => {
      setSelectedValue(newValue);
      onValueChange?.(newValue);
      // Stop editing when a value is selected (use requestAnimationFrame to ensure state is updated)
      if (stopEditing) {
        requestAnimationFrame(() => {
          stopEditing();
        });
      }
    };

    return (
      <Select value={selectedValue || undefined} onValueChange={handleValueChange}>
        <SelectTrigger className="h-full w-full rounded-none border-0 focus-visible:ring-0">
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={String(option.value)} value={String(option.value)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
);

SelectCellEditor.displayName = 'SelectCellEditor';

/**
 * Date Cell Editor - Shadcn Calendar
 */
export interface DateCellEditorParams extends CustomCellEditorParams {
  min?: string;
  max?: string;
}

export const DateCellEditor = forwardRef<ICellEditor, DateCellEditorParams>(
  ({ value, onValueChange, stopEditing }, ref) => {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => {
      if (!value) {
        return undefined;
      }
      try {
        const date = new Date(value);
        return isNaN(date.getTime()) ? undefined : date;
      } catch {
        return undefined;
      }
    });
    const [isOpen, setIsOpen] = useState(false);
    const today = new Date();
    const buttonRef = useRef<HTMLButtonElement>(null);

    useImperativeHandle(ref, () => ({
      getValue: () => {
        if (!selectedDate) {
          return null;
        }
        // Return ISO string format
        return selectedDate.toISOString();
      },
      isCancelBeforeStart: () => {
        return false;
      },
      afterGuiAttached: () => {
        // Open dialog immediately when editor is attached
        // Use multiple attempts to ensure dialog opens
        const openDialog = () => {
          setIsOpen(true);
          // Try clicking the button to trigger dialog
          setTimeout(() => {
            buttonRef.current?.click();
          }, 50);
        };
        openDialog();
        // Also try after a short delay
        setTimeout(openDialog, 100);
      },
    }));

    // Open dialog when component mounts
    useEffect(() => {
      const timer = setTimeout(() => {
        setIsOpen(true);
        // Also try clicking the button
        setTimeout(() => {
          buttonRef.current?.click();
        }, 50);
      }, 0);
      return () => clearTimeout(timer);
    }, []);

    const handleDateSelect = (date: Date | undefined) => {
      if (date) {
        // Prevent selecting future dates
        const todayStart = startOfDay(today);
        const selectedDateStart = startOfDay(date);
        if (isAfter(selectedDateStart, todayStart)) {
          return;
        }
      }
      setSelectedDate(date);
      onValueChange?.(date ? date.toISOString() : null);
      // Close dialog and stop editing when a date is selected
      if (date) {
        setIsOpen(false);
        if (stopEditing) {
          requestAnimationFrame(() => {
            stopEditing();
          });
        }
      }
    };

    const handleOpenChange = (open: boolean) => {
      setIsOpen(open);
      // If dialog is closed without selecting a date, stop editing
      if (!open && !selectedDate) {
        if (stopEditing) {
          requestAnimationFrame(() => {
            stopEditing();
          });
        }
      }
    };

    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button
            ref={buttonRef}
            type="button"
            variant="outline"
            className={cn(
              'h-full w-full rounded-none border-0 pl-3 text-left font-normal',
              !selectedDate && 'text-muted-foreground'
            )}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(true);
            }}
          >
            {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Date</DialogTitle>
          </DialogHeader>
          <Calendar
            mode="single"
            selected={selectedDate}
            defaultMonth={selectedDate || today}
            onSelect={handleDateSelect}
            disabled={(date) => {
              // Disable future dates
              const todayStart = startOfDay(today);
              const checkDate = startOfDay(date);
              return isAfter(checkDate, todayStart);
            }}
            initialFocus
          />
        </DialogContent>
      </Dialog>
    );
  }
);

DateCellEditor.displayName = 'DateCellEditor';

/**
 * Dropdown Cell Editor - Uses the shared Dropdown component
 */
export interface DropdownCellEditorParams<TValue = string | number> extends CustomCellEditorParams {
  options: DropdownOption<TValue>[];
}

export const DropdownCellEditor = forwardRef<ICellEditor, DropdownCellEditorParams>(
  ({ value, onValueChange, options, stopEditing }, ref) => {
    // Find matching option value or use undefined
    const getInitialValue = () => {
      if (value == null || value === '') {
        return undefined;
      }
      const matchingOption = options.find((opt) => {
        // Handle both string and number comparisons
        if (typeof opt.value === 'string' && typeof value === 'string') {
          return opt.value === value;
        }
        if (typeof opt.value === 'number' && typeof value === 'number') {
          return opt.value === value;
        }
        // Fallback to string comparison
        return String(opt.value) === String(value);
      });
      return matchingOption ? matchingOption.value : undefined;
    };

    const [selectedValue, setSelectedValue] = useState<string | number | undefined>(
      getInitialValue()
    );

    useImperativeHandle(ref, () => ({
      getValue: () => {
        return selectedValue ?? null;
      },
      isCancelBeforeStart: () => {
        return false;
      },
      afterGuiAttached: () => {
        // Focus handling is managed by the Dropdown component
      },
    }));

    const handleValueChange = (newValue: string | number) => {
      setSelectedValue(newValue);
      onValueChange?.(newValue);
      // Stop editing when a value is selected
      if (stopEditing) {
        requestAnimationFrame(() => {
          stopEditing();
        });
      }
    };

    return (
      <div className="h-full w-full">
        <Dropdown
          options={options}
          value={selectedValue}
          onChange={handleValueChange}
          placeholder="Select..."
          className="h-full rounded-none border-0"
        />
      </div>
    );
  }
);

DropdownCellEditor.displayName = 'DropdownCellEditor';

/**
 * Boolean Cell Editor - Yes/No dropdown for boolean values
 */
export const BooleanCellEditor = forwardRef<ICellEditor, CustomCellEditorParams>(
  ({ value, onValueChange, stopEditing }, ref) => {
    const booleanOptions: DropdownOption<boolean>[] = [
      { value: true, label: 'Yes' },
      { value: false, label: 'No' },
    ];

    // Convert value to boolean
    const getInitialValue = () => {
      if (value == null) {
        return undefined;
      }
      // Handle string "true"/"false" or actual boolean
      if (typeof value === 'boolean') {
        return value;
      }
      if (typeof value === 'string') {
        return value.toLowerCase() === 'true' || value === '1';
      }
      return Boolean(value);
    };

    const [selectedValue, setSelectedValue] = useState<boolean | undefined>(getInitialValue());

    useImperativeHandle(ref, () => ({
      getValue: () => {
        return selectedValue ?? null;
      },
      isCancelBeforeStart: () => {
        return false;
      },
      afterGuiAttached: () => {
        // Focus handling is managed by the Dropdown component
      },
    }));

    const handleValueChange = (newValue: boolean) => {
      setSelectedValue(newValue);
      onValueChange?.(newValue);
      // Stop editing when a value is selected
      if (stopEditing) {
        requestAnimationFrame(() => {
          stopEditing();
        });
      }
    };

    return (
      <div className="h-full w-full">
        <Dropdown
          options={booleanOptions}
          value={selectedValue}
          onChange={handleValueChange}
          placeholder="Select..."
          className="h-full rounded-none border-0"
        />
      </div>
    );
  }
);

BooleanCellEditor.displayName = 'BooleanCellEditor';
