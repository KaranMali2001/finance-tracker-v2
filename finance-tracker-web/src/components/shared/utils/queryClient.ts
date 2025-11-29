import { QueryClient } from '@tanstack/react-query';

/**
 * Default QueryClient configuration
 * Matches the configuration in src/app/Providers.tsx
 */
export const defaultQueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 5, // 5 minutes (formerly cacheTime)
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
} as const;

/**
 * Create a QueryClient with default configuration
 */
export function createQueryClient() {
  return new QueryClient(defaultQueryClientConfig);
}
