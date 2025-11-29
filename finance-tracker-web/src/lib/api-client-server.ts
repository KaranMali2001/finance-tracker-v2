import { auth } from '@clerk/nextjs/server';
import { configureServerApiClient } from './api-client';

/**
 * Initialize API client for server-side usage (PER-REQUEST)
 * Call this in each Server Component or Server Action to ensure
 * each request has its own isolated token provider
 *
 * IMPORTANT: This is NOT a singleton - each request/component should call this
 * to avoid token conflicts between concurrent requests
 */
export async function initServerApiClient() {
  const { getToken } = await auth();

  // Always configure - per-request isolation (no singleton)
  configureServerApiClient(async () => {
    return await getToken();
  });
}
