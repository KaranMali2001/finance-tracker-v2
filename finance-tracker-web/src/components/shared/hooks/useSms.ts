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

export function useSmses() {
  const { isLoaded, isSignedIn } = useAuth();

  return useApiQuery<Array<internal_domain_sms_SmsLogs>>(['sms'], () => SmsService.getSms(), {
    enabled: isLoaded && isSignedIn,
    showToastOnError: true,
  });
}

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
      enabled: isLoaded && isSignedIn && !!smsId,
      showToastOnError: true,
    }
  );
}

export function useDeleteSms() {
  const queryClient = useQueryClient();

  return useApiMutation<void, { id: string }>(({ id }) => SmsService.deleteSms(id), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms'] });
    },
    showToastOnSuccess: true,
    successMessage: 'SMS log deleted successfully',
    showToastOnError: true,
  });
}

export function useCreateSms() {
  const queryClient = useQueryClient();

  return useApiMutation<internal_domain_sms_SmsLogs, internal_domain_sms_CreateSmsReq>(
    (data) => SmsService.postSms(data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['sms'] });
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
