import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';

interface LoadingStateProps {
  variant?: 'skeleton' | 'spinner';
  count?: number;
  className?: string;
}

export function LoadingState({ variant = 'spinner', count = 3, className }: LoadingStateProps) {
  if (variant === 'spinner') {
    return (
      <div className={`flex items-center justify-center py-12 ${className || ''}`}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className || ''}`}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}
