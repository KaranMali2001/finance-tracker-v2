'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';

interface DateRangePickerProps {
  from: Date | null;
  to: Date | null;
  onChange: (from: Date | null, to: Date | null) => void;
  label?: string;
  disabled?: boolean;
}

function DateRangePicker({ from, to, onChange, label, disabled }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);

  const selected: DateRange | undefined =
    from || to ? { from: from ?? undefined, to: to ?? undefined } : undefined;

  function handleSelect(range: DateRange | undefined) {
    onChange(range?.from ?? null, range?.to ?? null);
    if (range?.from && range?.to) {
      setOpen(false);
    }
  }

  const triggerLabel = (() => {
    if (from && to) return `${format(from, 'MMM d, yyyy')} → ${format(to, 'MMM d, yyyy')}`;
    if (from) return `${format(from, 'MMM d, yyyy')} → ...`;
    return label ?? 'Select date range';
  })();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="justify-start gap-2 text-left font-normal border-stone-200 bg-stone-50 text-stone-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700"
        >
          <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-amber-600" />
          <span className="text-xs">{triggerLabel}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={selected}
          onSelect={handleSelect}
          numberOfMonths={2}
          defaultMonth={from ?? new Date()}
          showOutsideDays={false}
          disabled={(date) => date > new Date()}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export { DateRangePicker };
