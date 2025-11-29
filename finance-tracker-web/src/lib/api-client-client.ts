'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import { configureApiClient } from './api-client';

/**
 * Hook to configure API client for client-side usage (singleton pattern)
 * Safe to call multiple times - will only configure once
 * Note: This is already configured globally in Providers.tsx,
 * but you can use this hook if you need per-component control
 */
export function useApiClient() {
  const { getToken, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    // configureApiClient is idempotent - safe to call multiple times
    configureApiClient(async () => {
      return await getToken();
    });
  }, [getToken, isLoaded]);
}
