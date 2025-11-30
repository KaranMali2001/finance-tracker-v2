'use client';
import type {
  internal_domain_auth_GetAuthUserResponse,
  internal_domain_user_UpdateUserReq,
  internal_domain_user_User,
} from '@/generated/api';
import { AuthService, UserService } from '@/generated/api';
import { useAuth } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import { useApiQuery } from './useApiQuery';

/**
 * Get authenticated user hook
 * Fetches the current authenticated user's information
 * Only fetches when Clerk is loaded and user is signed in
 */
export function useAuthUser() {
  const { isLoaded, isSignedIn } = useAuth();

  return useApiQuery<internal_domain_auth_GetAuthUserResponse>(
    ['auth', 'user'],
    () => AuthService.getAuthUser(),
    {
      enabled: isLoaded && isSignedIn, // Only fetch when Clerk is loaded and user is signed in
      showToastOnError: true,
    }
  );
}

/**
 * Update user hook
 * Updates the authenticated user's information
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useApiMutation<internal_domain_user_User, internal_domain_user_UpdateUserReq>(
    (data) => UserService.putUser(data),
    {
      onSuccess: () => {},
      showToastOnSuccess: true,
      successMessage: 'Profile updated successfully',
      showToastOnError: true,
    }
  );
}
