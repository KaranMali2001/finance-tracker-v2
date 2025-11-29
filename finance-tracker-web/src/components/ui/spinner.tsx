import { Loader2 } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

interface SpinnerProps extends React.ComponentProps<typeof Loader2> {
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'size-4',
  md: 'size-6',
  lg: 'size-8',
};

function Spinner({ className, size = 'md', ...props }: SpinnerProps) {
  return (
    <Loader2
      data-slot="spinner"
      className={cn('animate-spin text-muted-foreground', sizeClasses[size], className)}
      aria-label="Loading"
      {...props}
    />
  );
}

export { Spinner };
