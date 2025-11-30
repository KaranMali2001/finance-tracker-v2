import React from 'react';
import { cn } from '@/lib/utils';

interface InfoFieldProps {
  label: string;
  value: React.ReactNode;
  className?: string;
  valueClassName?: string;
  labelClassName?: string;
  spanFullWidth?: boolean;
}

export function InfoField({
  label,
  value,
  className,
  valueClassName,
  labelClassName,
  spanFullWidth = false,
}: InfoFieldProps) {
  return (
    <div className={cn(spanFullWidth && 'md:col-span-2', className)}>
      <div
        className={cn(
          'text-sm font-semibold text-foreground uppercase tracking-wide',
          labelClassName
        )}
      >
        {label}
      </div>
      <div className={cn('mt-1.5 text-card-foreground', valueClassName)}>{value}</div>
    </div>
  );
}
