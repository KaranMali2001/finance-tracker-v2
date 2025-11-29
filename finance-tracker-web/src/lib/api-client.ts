import type { ApiRequestOptions } from '@/generated/api/core/ApiRequestOptions';
import { OpenAPI } from '@/generated/api/core/OpenAPI';

type TokenProvider = () => Promise<string | null | undefined>;

// Singleton state to track if client is configured (CLIENT-SIDE ONLY)
let isClientConfigured = false;
let currentClientTokenProvider: TokenProvider | null = null;

/**
 * Configure the API client with a token provider (CLIENT-SIDE - Singleton pattern)
 * Safe to call multiple times - will only configure once
 * Use this for client-side components only
 */
export function configureApiClient(getToken: TokenProvider) {
  // Only configure if not already configured or if token provider changed
  if (!isClientConfigured || currentClientTokenProvider !== getToken) {
    currentClientTokenProvider = getToken;
    OpenAPI.TOKEN = async (options: ApiRequestOptions): Promise<string> => {
      const token = await getToken();
      // Return empty string if no token - the request handler will filter it out
      return token || '';
    };
    isClientConfigured = true;
  }
}

/**
 * Configure the API client for server-side usage (SERVER-SIDE - Per-request)
 * This should be called for each request/component to ensure isolation
 * Do NOT use singleton pattern for server-side to avoid request conflicts
 */
export function configureServerApiClient(getToken: TokenProvider) {
  // Always configure - no singleton check for server-side
  OpenAPI.TOKEN = async (options: ApiRequestOptions): Promise<string> => {
    const token = await getToken();
    // Return empty string if no token - the request handler will filter it out
    return token || '';
  };
}

/**
 * Reset the API client configuration (CLIENT-SIDE ONLY)
 */
export function resetApiClient() {
  OpenAPI.TOKEN = undefined;
  isClientConfigured = false;
  currentClientTokenProvider = null;
}

/**
 * Check if the API client is already configured (CLIENT-SIDE ONLY)
 */
export function isApiClientConfigured(): boolean {
  return isClientConfigured;
}
