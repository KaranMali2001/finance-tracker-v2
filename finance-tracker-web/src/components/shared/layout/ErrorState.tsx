import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getHumanReadableError } from '../utils/error';

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  title?: string;
  className?: string;
}

export function ErrorState({
  error,
  onRetry,
  title = 'Something went wrong',
  className,
}: ErrorStateProps) {
  const errorMessage = getHumanReadableError(error);

  return (
    <div
      className={`flex flex-col items-center justify-center py-12 text-center ${className || ''}`}
    >
      <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="mb-4 max-w-sm text-muted-foreground text-sm">{errorMessage}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Try again
        </Button>
      )}
    </div>
  );
}
