'use client';

import type {
  internal_domain_sms_CreateSmsReq,
  internal_domain_sms_SmsLogs,
} from '@/generated/api';
import { SmsService } from '@/generated/api';
import { useAuth } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import { useApiQuery } from './useApiQuery';

/**
 * Get all SMS logs hook
 * Fetches all SMS logs for the authenticated user
 * Only fetches when Clerk is loaded and user is signed in
 */
export function useSmses() {
  const { isLoaded, isSignedIn } = useAuth();

  return useApiQuery<Array<internal_domain_sms_SmsLogs>>(['sms'], () => SmsService.getSms(), {
    enabled: isLoaded && isSignedIn, // Only fetch when Clerk is loaded and user is signed in
    showToastOnError: true,
  });
}

/**
 * Get SMS log by ID hook
 * Fetches a specific SMS log by its ID
 * Only fetches when Clerk is loaded, user is signed in, and smsId is provided
 */
export function useSms(smsId: string | null | undefined) {
  const { isLoaded, isSignedIn } = useAuth();

  return useApiQuery<internal_domain_sms_SmsLogs>(
    ['sms', smsId],
    () => {
      if (!smsId) {
        throw new Error('SMS ID is required');
      }
      return SmsService.getSms1(smsId);
    },
    {
      enabled: isLoaded && isSignedIn && !!smsId, // Wait for auth and require smsId
      showToastOnError: true,
    }
  );
}

/**
 * Create SMS log hook
 * Creates a new SMS log entry
 */
export function useCreateSms() {
  const queryClient = useQueryClient();

  return useApiMutation<internal_domain_sms_SmsLogs, internal_domain_sms_CreateSmsReq>(
    (data) => SmsService.postSms(data),
    {
      onSuccess: (data) => {
        // Invalidate and refetch SMS logs list
        queryClient.invalidateQueries({ queryKey: ['sms'] });
        // Invalidate specific SMS if we have the ID
        if (data.id) {
          queryClient.invalidateQueries({
            queryKey: ['sms', data.id],
          });
        }
      },
      showToastOnSuccess: true,
      successMessage: 'SMS log created successfully',
      showToastOnError: true,
    }
  );
}
