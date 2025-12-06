'use client';

import { configureApiClient, resetApiClient } from '@/lib/api-client';
import { ClerkProvider, useAuth } from '@clerk/nextjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { useEffect, useState } from 'react';
export function Providers({ children }: { children: React.ReactNode }) {
  // Register all Community features
  ModuleRegistry.registerModules([AllCommunityModule]);
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
  const { getToken, isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    // Wait for Clerk to fully load before configuring API client
    if (!isLoaded) {
      return;
    }

    // Only configure API client when Clerk is loaded
    // Token provider will return null if not signed in, which is fine
    configureApiClient(async () => {
      if (!isSignedIn) {
        return null;
      }
      const token = await getToken();
      return token || null;
    });

    return () => {
      resetApiClient();
    };
  }, [getToken, isLoaded, isSignedIn]);

  return null;
}
