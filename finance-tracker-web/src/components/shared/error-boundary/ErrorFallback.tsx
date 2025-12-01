'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  showStack?: boolean;
}

/**
 * Error fallback component for Error Boundaries
 * Displays a user-friendly error message with option to retry
 */
export function ErrorFallback({
  error,
  resetErrorBoundary,
  showStack = process.env.NODE_ENV === 'development',
}: ErrorFallbackProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 text-center">
      <AlertCircle className="mb-4 h-16 w-16 text-destructive" />
      <h1 className="mb-2 text-2xl font-bold">Something went wrong</h1>
      <p className="mb-6 max-w-md text-muted-foreground">
        We encountered an unexpected error. Please try refreshing the page or contact support if the
        problem persists.
      </p>
      {showStack && error.stack && (
        <details className="mb-6 w-full max-w-2xl text-left">
          <summary className="mb-2 cursor-pointer text-sm font-medium text-muted-foreground">
            Error Details (Development Only)
          </summary>
          <pre className="overflow-auto rounded-md bg-destructive/10 p-4 text-xs text-destructive">
            {error.stack}
          </pre>
        </details>
      )}
      <div className="flex gap-2">
        <Button onClick={resetErrorBoundary} variant="default">
          Try again
        </Button>
        <Button
          onClick={() => {
            window.location.href = '/';
          }}
          variant="outline"
        >
          Go to Home
        </Button>
      </div>
    </div>
  );
}
