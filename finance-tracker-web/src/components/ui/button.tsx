import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white shadow-md hover:shadow-lg hover:shadow-amber-500/30 focus-visible:ring-amber-600/50 focus-visible:border-amber-600',
        destructive:
          'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-md hover:shadow-lg hover:shadow-red-500/30 focus-visible:ring-red-600/50 focus-visible:border-red-600',
        outline:
          'border-2 border-stone-300 bg-white hover:bg-amber-50 hover:border-amber-600 text-stone-700 hover:text-amber-900 shadow-xs focus-visible:ring-amber-600/50 focus-visible:border-amber-600',
        secondary:
          'bg-stone-200 text-stone-800 hover:bg-stone-300 shadow-sm hover:shadow-md focus-visible:ring-amber-600/50 focus-visible:border-amber-600',
        ghost:
          'hover:bg-amber-50 text-stone-700 hover:text-amber-900 focus-visible:ring-amber-600/50',
        link: 'text-amber-700 underline-offset-4 hover:underline hover:text-amber-900 focus-visible:ring-amber-600/50',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-lg px-6 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
