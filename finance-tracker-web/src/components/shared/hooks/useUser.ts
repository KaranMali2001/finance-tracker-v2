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

export function useAuthUser() {
  const { isLoaded, isSignedIn } = useAuth();

  return useApiQuery<internal_domain_auth_GetAuthUserResponse>(
    ['auth', 'user'],
    () => AuthService.getAuthUser(),
    {
      enabled: isLoaded && isSignedIn,
      showToastOnError: true,
    }
  );
}

export function useUpdateUser() {
  return useApiMutation<internal_domain_user_User, internal_domain_user_UpdateUserReq>(
    (data) => UserService.putUser(data),
    {
      showToastOnSuccess: true,
      successMessage: 'Profile updated successfully',
      showToastOnError: true,
    }
  );
}

export function useGenerateApiKey() {
  const queryClient = useQueryClient();

  return useApiMutation<internal_domain_user_User, void>(
    () => UserService.getUserGenerateApiKey(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
      },
      showToastOnSuccess: true,
      successMessage: 'API key generated successfully',
      showToastOnError: true,
    }
  );
}
