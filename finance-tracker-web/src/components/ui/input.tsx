import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-amber-600 selection:text-white border-stone-300 h-9 w-full min-w-0 rounded-lg border bg-white px-3 py-1 text-base text-stone-800 shadow-xs transition-all duration-300 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-amber-600 focus-visible:ring-amber-600/20 focus-visible:ring-[3px]',
        'aria-invalid:ring-destructive/20 aria-invalid:border-destructive',
        className
      )}
      {...props}
    />
  );
}

export { Input };
