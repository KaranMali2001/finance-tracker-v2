'use client';

import { ClerkProvider, useAuth } from '@clerk/nextjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect } from 'react';
import { configureApiClient, resetApiClient } from '@/lib/api-client';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 5,
            retry: false,
          },
          mutations: {
            retry: false,
          },
        },
      })
  );
  return (
    <ClerkProvider>
      <ApiClientConfig />
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        {children}
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function ApiClientConfig() {
  const { getToken, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    configureApiClient(async () => {
      return await getToken();
    });

    return () => {
      resetApiClient();
    };
  }, [getToken, isLoaded]);

  return null;
}
