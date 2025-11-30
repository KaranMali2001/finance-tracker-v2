'use client';

import { useAuth } from '@clerk/nextjs';
import { StaticService } from '@/generated/api';
import type {
  internal_domain_static_Bank,
  internal_domain_static_Categories,
  internal_domain_static_Merchants,
} from '@/generated/api';
import { useApiQuery } from './useApiQuery';

/**
 * Get all banks hook
 * Fetches all available banks from the static API
 * Only fetches when Clerk is loaded and user is signed in
 */
export function useBanks() {
  const { isLoaded, isSignedIn } = useAuth();

  return useApiQuery<Array<internal_domain_static_Bank>>(
    ['static', 'banks'],
    () => StaticService.getStaticBank(),
    {
      enabled: isLoaded && isSignedIn, // Only fetch when Clerk is loaded and user is signed in
      showToastOnError: true,
    }
  );
}

/**
 * Get all categories hook
 * Fetches all available transaction categories from the static API
 * Only fetches when Clerk is loaded and user is signed in
 */
export function useCategories() {
  const { isLoaded, isSignedIn } = useAuth();

  return useApiQuery<Array<internal_domain_static_Categories>>(
    ['static', 'categories'],
    () => StaticService.getStaticCategories(),
    {
      enabled: isLoaded && isSignedIn, // Only fetch when Clerk is loaded and user is signed in
      showToastOnError: true,
    }
  );
}

/**
 * Get all merchants hook
 * Fetches all available merchants from the static API
 * Only fetches when Clerk is loaded and user is signed in
 */
export function useMerchants() {
  const { isLoaded, isSignedIn } = useAuth();

  return useApiQuery<Array<internal_domain_static_Merchants>>(
    ['static', 'merchants'],
    () => StaticService.getStaticMerchants(),
    {
      enabled: isLoaded && isSignedIn, // Only fetch when Clerk is loaded and user is signed in
      showToastOnError: true,
    }
  );
}
