import * as React from 'react';

import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'border-stone-300 placeholder:text-muted-foreground focus-visible:border-amber-600 focus-visible:ring-amber-600/20 aria-invalid:ring-destructive/20 aria-invalid:border-destructive bg-white flex field-sizing-content min-h-16 w-full rounded-lg border px-3 py-2 text-base text-stone-800 shadow-xs transition-all duration-300 outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
